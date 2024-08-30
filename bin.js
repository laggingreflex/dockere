#!/usr/bin/env node

import OS from 'os';
import Path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { dockerfiles } from './utils/fs.js';
import packageJson from './package.json' with { type: 'json' };
import main from './index.js';

export const cwd = process.cwd();
export const homedir = OS.homedir();
export const cwdBasename = Path.basename(cwd);

export const dockerfileChoices = [...Object.keys(dockerfiles.moduleDir), 'home', 'cwd'];

export const options = {
  dockerfile: {
    alias: ['d'],
    type: 'string',
    description: `Dockerfile to use.\nEg: ${dockerfileChoices.join()}`,
    // choices: dockerfileChoices,
    // default: 'ubuntu',
    coerce(value) {
      // console.log(`coerce:`, { value })
      if (!dockerfileChoices.includes(value)) {
        for (const choice of dockerfileChoices) {
          if (choice.startsWith(value)) {
            // console.warn(`Warn: Coercing --dockerfile=${value} ➡ ${choice}`);
            return choice;
          }
        }
      }
      return value;
    },
    // skipValidation: true,
  },
  command: {
    alias: ['c'],
    type: 'array',
    // default: ['bash'],
    description: 'Command to execute'
  },
  volume: {
    alias: ['v'],
    type: 'string',
    description: 'Volume/mount points\n<host>:<container>'
  },
  mountHome: {
    alias: ['h'],
    type: 'boolean',
    description: `Mount home directory\nShort for --volume ${homedir}:/root`
  },
  mountDrives: {
    alias: ['D'],
    type: 'boolean',
    description: `<Experimental> Mount root drives in container's mount points /mnt/host/…\nShort for --volume C:\\:/mnt/host/c`
  },
  noMountCwd: {
    alias: ['n'],
    type: 'boolean',
    description: `Don't mount current directory. Mounts by default\n${cwd}`
  },
  passThrough: {
    alias: ['-'],
    type: 'boolean',
    description: `Pass through other options/args to docker run`
  },
  build: {
    alias: ['b'],
    type: 'boolean',
    description: `Force re-build image (docker build)`
  },
  tag: {
    alias: ['t'],
    type: 'string',
    default: cwdBasename,
    description: `Tag to use for the image`,
    coerce(value) {
      return value.toLowerCase();
    },
  },
  workdir: {
    alias: [],
    type: 'string',
    default: '/app',
    description: `Workdir to use`,
    coerce(workdir) {
      if (!workdir.startsWith('/')) workdir = '/' + workdir;
      return workdir;
    }
  },

};

export default yargs(hideBin(process.argv))
  .scriptName(packageJson.name)
  .options(options)
  .command({
    command: '$0',
    description: packageJson.description,
    handler(argv, ...rest) {
      const passThrough = [...(argv?.passThrough ?? []), ...argv._];
      argv.passThrough = passThrough;
      return main(argv);
    },
  })
  .demandCommand()
  .wrap(0)
  .version(packageJson.version)
  .example([
    ['$0', 'Run current-dir in a default (ubuntu) container'],
    ['$0 node', 'Run current-dir in a "node" container'],
    ['$0 -h', `Mount the host's home-dir as container's ~/`],
    ['$0 -D', `Mounts the hosts's root (C:\|D:\|…) drives in container's mount points /mnt/host/{c|d|…}`],
    ['$0 -v node_modules', `Create a new volume '<workdir>/node_modules' in the container`],
    ['$0 -c echo hi', `Execute a command and exit`],
    ['$0 -- -p 8080:8080', `Expose the 8080 port by passing -p flag to docker run`],
  ]).parserConfiguration({
    'strip-aliased': true,
    'strip-dashed': true,
    'unknown-options-as-args': true,
    'halt-at-non-option': true,
  })
  // .exitProcess(false)
  // .fail((msg, error, yargs) => {
  //   console.log('fail')
  // })
  .showHelpOnFail(false)
  .argv;
