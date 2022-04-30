#!/usr/bin/env node

import OS from 'os';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { dockerfiles } from './utils/fs.js';
import packageJson from './package.json' assert { type: 'json' };
import main from './index.js';

export const cwd = process.cwd();
export const homedir = OS.homedir();

export const dockerfileChoices = [...Object.keys(dockerfiles.moduleDir), 'home', 'cwd'];

export const options = {
  dockerfile: {
    alias: ['d'],
    type: 'string',
    description: `Dockerfile to use. Eg: ${dockerfileChoices.join()}`,
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
  volume: { alias: ['v'], type: 'string' },
  mountHome: { alias: ['h'], type: 'boolean', description: `Mount home directory (${homedir})` },
  noMountCwd: { alias: ['n'], type: 'boolean', description: `Don't mount current directory (${cwd}). Mounts by default` },
  mountDrives: { alias: ['D'], type: 'boolean', description: `Mount root drives in container's mount points /mnt/host/…` },
  noMountCwd: { alias: ['n'], type: 'boolean', description: `Don't mount current directory. Mounts by default\n${cwd}` },
};

export default yargs(hideBin(process.argv))
  .options(options)
  .scriptName(packageJson.name)
  .command({
    command: '$0 [dockerfile] [volume]',
    description: packageJson.description,
    handler: main,
  })
  .demandCommand()
  .wrap(0)
  .version(packageJson.version)
  .argv;
