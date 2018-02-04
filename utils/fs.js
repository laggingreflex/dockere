const os = require('os');
const path = require('path');
const fs = require('fs-extra');

const homedir = exports.homedir = os.homedir();
const homeConfigDir = exports.homeConfigDir = path.join(homedir, '.dockere');
const moduleDir = exports.moduleDir = path.join(path.dirname(__filename), '../dockerfiles');
const cwdFull = exports.cwdFull = process.cwd();
const cwdBase = exports.cwdBase = path.basename(cwdFull);

const rootDirText = exports.rootDirText = '<root-dir>';
const rootDirRegex = exports.rootDirRegex = new RegExp(rootDirText, 'ig');
const cwdBaseRegex = exports.cwdBaseRegex = new RegExp('/?' + cwdBase, 'ig');

const readFile = exports.readFile = (...paths) => {
  try {
    return fs.readFileSync(path.join(...paths), 'utf8');
  } catch (error) {
    return false;
  }
};

const readFromHome = exports.readFromHome = (file) => {
  return readFile(homeConfigDir, file);
};

const readFromModuleDir = exports.readFromModuleDir = (file) => {
  return readFile(moduleDir, file + '.dockerfile');
};

const readFromCwd = exports.readFromCwd = (file) => {
  return readFile(cwdFull, file);
};

const dockerfiles = exports.dockerfiles = {
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

const replaceRootDirText = exports.replaceRootDirText = (str) => {
  return str.replace(rootDirRegex, '/' + cwdBase);
};
const replaceCwdBaseText = exports.replaceCwdBaseText = (str) => {
  return str.replace(cwdBaseRegex, rootDirText);
};

const writeFile = exports.writeFile = ([...paths], data) => {
  fs.outputFileSync(path.join(...paths), data);
};

const writeToHome = exports.writeToHome = (file, data) => {
  writeFile([homeConfigDir, file], data);
  dockerfiles.home = data;
};

const writeToCwd = exports.writeToCwd = (data) => {
  writeFile([cwdFull, 'Dockerfile'], replaceRootDirText(data));
  dockerfiles.cwd = data;
};
