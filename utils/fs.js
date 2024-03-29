import os from 'os';
import Path from 'path';
import fs from 'fs-extra';
import { File } from './misc.js'

const __filename = new URL('', import.meta.url).pathname.substring(1);

export const homedir = os.homedir();
export const homeConfigDir = Path.join(homedir, '.dockere');
export const moduleDir = Path.join(Path.dirname(__filename), '../dockerfiles');
export const cwdFull = process.cwd();
// export const cwdBase = Path.basename(cwdFull);
export const cwdDockerfile = Path.join(cwdFull, 'Dockerfile');

export const defaultWorkdir = '/app';

export const workdirText = '<workdir>';
export const workdirRegex = new RegExp(workdirText, 'ig');
export const defaultWorkdirRegex = new RegExp(defaultWorkdir, 'ig');

export function readFile(...paths) {
  try {
    const path = Path.join(...paths);
    const data = replaceWorkdirText(fs.readFileSync(path, 'utf8'));
    return new File(path, data);
  } catch (error) {
    return false;
  }
};

export function readFromHome(file) {
  return readFile(homeConfigDir, file);
};

export function readFromModuleDir(file) {
  return readFile(moduleDir, file + '.dockerfile');
};

export function readFromCwd(file = 'Dockerfile') {
  return readFile(cwdFull, file);
};

export const dockerfiles = {
  moduleDir: {
    alpine: readFromModuleDir('alpine'),
    nodejs: readFromModuleDir('nodejs'),
    ubuntu: readFromModuleDir('ubuntu'),
  },
  home: readFromHome('Dockerfile'),
  cwd: readFromCwd('Dockerfile')
};

if (!dockerfiles.moduleDir) {
  throw new Error('moduleDir Dockerfile not found.');
}

export function replaceWorkdirText(str) {
  return str.replaceAll(workdirRegex, defaultWorkdir);
};
export function replaceWorkdirTextReverse(str) {
  return str.replaceAll(defaultWorkdir, '<workdir>');
};
export function replaceDefaultWorkdirText(str) {
  return str.replace(defaultWorkdirRegex, workdirText);
};

export function writeFile([...paths], data) {
  const path = Path.join(...paths);
  fs.outputFileSync(path, String(data));
  return new File(path, data);
};

export function writeToHome(file, data) {
  dockerfiles.home = data;
  return writeFile([homeConfigDir, file], replaceWorkdirTextReverse(data));
};

export function writeToCwd(data) {
  writeFile([cwdFull, 'Dockerfile'], replaceWorkdirText(data));
  dockerfiles.cwd = data;
};
