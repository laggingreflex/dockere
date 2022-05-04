import Path from 'path';
import drivelist from 'drivelist';
import * as cp from './child-process.js';
import * as fs from './fs.js';

export async function build(opts = {}) {
  if (await exists(opts.tag) && !opts.build) {
    if (!opts.silent) console.log(`Image '${opts.tag}' already exists. Pass --build to re-build`);
    return;
  }
  return cp.exec('docker', [
    'build',
    '-t', opts.tag,
    '.'
  ].filter(Boolean));
};

export async function run(opts = {}) {
  const args = ['run', '-it', '--rm'];
  if (!opts.noMountCwd) {
    args.push('--volume', `${fs.cwdFull}${Path.sep}:${opts.workdir}`);
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
  args.push(opts.tag);
  if (opts.command && opts.command.length) {
    args.push(...opts.command);
  } else {
    args.push('bash');
  }
  return await cp.exec('docker', args);
};

export async function exists(name) {
  try {
    await cp.exec('docker', ['inspect', name], { silent: true });
    return true;
  } catch (error) {
    return false;
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
