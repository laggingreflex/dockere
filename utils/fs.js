import os from 'os';
import Path from 'path';
import fs from 'fs-extra';

const __filename = new URL('', import.meta.url).pathname.substring(1);

export const homedir = os.homedir();
export const homeConfigDir = Path.join(homedir, '.dockere');
export const moduleDir = Path.join(Path.dirname(__filename), '../dockerfiles');
export const cwdFull = process.cwd();
export const cwdBase = Path.basename(cwdFull);

export const rootDirText = '<root-dir>';
export const rootDirRegex = new RegExp(rootDirText, 'ig');
export const cwdBaseRegex = new RegExp('/?' + cwdBase, 'ig');

export function readFile(...paths) {
  try {
    const path = Path.join(...paths);
    return fs.readFileSync(path, 'utf8');
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

export function readFromCwd(file) {
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
  fs.outputFileSync(Path.join(...paths), data);
};

export function writeToHome(file, data) {
  writeFile([homeConfigDir, file], data);
  dockerfiles.home = data;
};

export function writeToCwd(data) {
  writeFile([cwdFull, 'Dockerfile'], replaceRootDirText(data));
  dockerfiles.cwd = data;
};
