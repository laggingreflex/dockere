import Path from 'path';
import * as cp from './child-process.js';
import * as fs from './fs.js';

export function build({} = {}) {
  const args = ['build'];
  args.push('--rm');
  args.push('-t', fs.cwdBase);
  args.push('.');
  console.log('Executing:', 'docker', ...args);
  return cp.exec('docker', args);
};

export function run({ command, noMountCwd = false, mountHome = false, volume } = {}) {
  const args = ['run', '-it', '--rm'];
  if (!noMountCwd) {
    args.push('--volume', `${fs.cwdFull}${Path.sep}:/${fs.cwdBase}`);
  }
  if (mountHome) {
    args.push('--volume', `${fs.homedir}${Path.sep}:/root`);
  }
  if (volume) {
    if (!Array.isArray(volume)) {
      volume = [volume];
    }
    volume.forEach(volume => {
      const paths = volume.split(/:/g);
      if (paths.length <= 1) {
        volume = fixVolumePath(volume, fs.cwdBase);
        args.push('--volume', `${volume}`);
      } else {
        volume = paths.pop();
        volume = fixVolumePath(volume, fs.cwdBase);
        let mount = paths.join('');
        mount = fixMountPath(mount, fs.homedir, fs.cwdFull);
        args.push('--volume', `${mount}${Path.sep}:/${volume}`);
      }
    });
  }
  args.push(fs.cwdBase);
  if (command && command.length) {
    args.push(...command);
  }
  console.log('Executing:', 'docker', ...args);
  return cp.exec('docker', args);
};

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
