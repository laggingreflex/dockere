import os from 'os';
import Path from 'path';
import fs from 'fs-extra';
import { File } from './misc.js'

const __filename = new URL('', import.meta.url).pathname.substring(1);

export const homedir = os.homedir();
export const homeConfigDir = Path.join(homedir, '.dockere');
export const moduleDir = Path.join(Path.dirname(__filename), '../dockerfiles');
export const cwdFull = process.cwd();
export const cwdBase = Path.basename(cwdFull);
export const cwdDockerfile = Path.join(cwdFull, 'Dockerfile');

export const rootDirText = '<root-dir>';
export const rootDirRegex = new RegExp(rootDirText, 'ig');
export const cwdBaseRegex = new RegExp('/?' + cwdBase, 'ig');

export function readFile(...paths) {
  try {
    const path = Path.join(...paths);
    const data = replaceRootDirText(fs.readFileSync(path, 'utf8'));
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

export function replaceRootDirText(str) {
  return str.replace(rootDirRegex, '/' + cwdBase);
};
export function replaceCwdBaseText(str) {
  return str.replace(cwdBaseRegex, rootDirText);
};

export function writeFile([...paths], data) {
  const path = Path.join(...paths);
  fs.outputFileSync(path, String(data));
  return new File(path, data);
};

export function writeToHome(file, data) {
  dockerfiles.home = data;
  return writeFile([homeConfigDir, file], data);
};

export function writeToCwd(data) {
  writeFile([cwdFull, 'Dockerfile'], replaceRootDirText(data));
  dockerfiles.cwd = data;
};
