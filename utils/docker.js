import Path from 'path';
import drivelist from 'drivelist';
import Docker from 'dockerode';
import { setTimeout } from 'timers/promises';
import * as cp from './child-process.js';
import * as fs from './fs.js';

const docker = new Docker();

export async function build(opts = {}) {

  if (await getImage(fs.cwdBase) && !opts.force) {
    console.log('Skipping rebuilding existing image:', fs.cwdBase)
    console.log('Pass --force-rebuild to rebuild');
    return;
  }

  const args = ['build'];
  // args.push('--rm');
  args.push('-t', fs.cwdBase);
  // args.push('--label', fs.cwdBase);
  args.push('.');
  console.log('Executing:', 'docker', ...args);
  return cp.exec('docker', args);
};

export async function run(opts = {}) {

  if (await getContainer(fs.cwdBase) && !opts.force) {
    console.log('Skipping recreating existing container:', fs.cwdBase)
    console.log('Pass --force-rebuild to use new container');
    return await exec(...arguments);
  }

  const args = ['run', '-it', '--rm'];
  if (!opts.noMountCwd) {
    args.push('--volume', `${fs.cwdFull}${Path.sep}:/${fs.cwdBase}`);
  }
  if (opts.mountHome) {
    args.push('--volume', `${fs.homedir}${Path.sep}:/root`);
  }
  if (opts.mountDrives) {
    const drives = await drivelist.list();
    for (const { mountpoints } of drives) {
      for (const { path } of mountpoints) {
        args.push('--volume', `${path}${Path.sep}:/mnt/host/${path.toLowerCase().replace(/\:\\$/, '')}`);
      }
    }
  }
  if (opts.volume) {
    if (!Array.isArray(opts.volume)) {
      opts.volume = [opts.volume];
    }
    opts.volume.forEach(volume => {
      const paths = volume.split(/:/g);
      if (paths.length <= 1) {
        volume = fixVolumePath(volume, fs.cwdBase);
        args.push('--volume', `${volume}`);
      } else {
        volume = paths.pop();
        volume = fixVolumePath(volume, fs.cwdBase);
        let mount = paths.join(':');
        mount = fixMountPath(mount, fs.homedir, fs.cwdFull);
        args.push('--volume', `${mount}${Path.sep}:/${volume}`);
      }
    });
  }
  args.push(...(opts.passThrough ?? []));
  args.push(fs.cwdBase);
  if (opts.command && opts.command.length) {
    args.push(...opts.command);
  }
  console.log('Executing:', 'docker', ...args);
  return await cp.exec('docker', args);
};

export async function exec(opts = {}) {
  const container = await getContainer(fs.cwdBase);
  const exec = await container.exec({
    Cmd: ['bash'],
    Tty: true,
    OpenStdin: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    StdinOnce: true,
  });
  const stream = await exec.start({ stdin: true });
  container.modem.demuxStream(stream, process.stdout, process.stderr);
  process.stdin.setRawMode(true);
  process.stdin.pipe(stream);
  /* Work around to stream.on('end') not firing on windows. https://github.com/apocas/dockerode/issues/534 */
  while ((await exec.inspect()).Running) await setTimeout(1000);
  stream.destroy();
  process.stdin.pause();
  process.stdin.setRawMode(false);
}


export async function getImage(tagToFind) {
  const images = await docker.listImages();
  for (const image of images) {
    for (const tag of image.RepoTags) {
      if (tag.startsWith(tagToFind)) return image;
    }
  }
}

export async function getContainer(tagToFind) {
  const containers = await docker.listContainers();
  for (const container of containers) {
    if (container.Image === tagToFind) {
      return docker.getContainer(container.Id);
    }
  }
}


export function fixVolumePath(p, base) {
  const o = p;
  p = p.replace(/[\\]+/g, '/');
  if (p.charAt(0) !== '/') {
    p = `${base}/${p}`;
    console.warn(`WARNING: You've specified a non-absolute container-dir volume path: ${o}`);
    console.warn('Docker requires container-dir to be an absolute path - https://docs.docker.com/engine/tutorials/dockervolumes/#mount-a-host-directory-as-a-data-volume');
    console.warn(`Using: ${p}`);
  }
  return p;
};

export function fixMountPath(p, homedir, base) {
  const o = p;
  if (p.charAt(0) === '~') {
    p = Path.join(homedir, p.substr(1));
  } else if (!Path.isAbsolute(p)) {
    p = Path.join(base, p);
    if (p.match(/[\/\\]/)) {
      console.warn(`WARNING: You've specified a non-absolute host-dir mount path: ${o}`);
      console.warn('Docker requires host-dir to be an absolute path - https://docs.docker.com/engine/tutorials/dockervolumes/#mount-a-host-directory-as-a-data-volume');
      console.warn(`Using: ${p}`);
    } else {
      console.warn(`WARNING: You've specified a host-dir mount that could either be a naned volume: ${o}`);
      console.warn('Please use --named-volume option to use a volume by name');
      console.warn(`Using: ${p}`);
    }
  }
  return p;
};
