#!/usr/bin/env node

import prompt from 'enquire-simple';
import * as config_ from './config.js';
import { fs, docker } from './utils/index.js';

main().catch(error => {
  console.error(error);
  process.exitCode = process.exitCode ?? 1;
});

export async function main({ ...config } = { ...config_ }) {
  if (fs.dockerfiles.cwd) {
    if (config.dockerfile) {
      const dockerfileFromHome = fs.readFromHome(config.dockerfile);
      const dockerfileFromModuleDir = fs.dockerfiles.moduleDir[config.dockerfile];
      if (dockerfileFromHome) {
        if (!await prompt.confirm(`Overwrite existing Dockerfile with "${config.dockerfile}" dockerfile template from Home?`)) {
          return;
        }
        fs.writeToCwd(dockerfileFromHome);
      } else if (dockerfileFromModuleDir) {
        if (!await prompt.confirm(`Overwrite existing Dockerfile with default "${config.dockerfile}" dockerfile template:`)) {
          return;
        }
        fs.writeToHome(config.dockerfile, dockerfileFromModuleDir);
        fs.writeToCwd(dockerfileFromModuleDir);
      } else if (await prompt.confirm(`Create a new "${config.dockerfile}" dockerfile template from existing Dockerfile:`, true)) {
        fs.writeToHome(config.dockerfile, fs.dockerfiles.cwd);
      } else {
        process.exitCode = 2;
        throw new Error(`The specified dockerfile context: "${config.dockerfile}" doesn't exist`);
      }
    }
  } else {
    if (!config.dockerfile) {
      config.dockerfile = 'ubuntu';
    }
    const dockerfileFromHome = fs.readFromHome(config.dockerfile);
    const dockerfileFromModuleDir = fs.dockerfiles.moduleDir[config.dockerfile];
    if (dockerfileFromHome) {
      fs.writeToCwd(dockerfileFromHome);
    } else if (dockerfileFromModuleDir) {
      fs.writeToHome(config.dockerfile, dockerfileFromModuleDir);
      fs.writeToCwd(dockerfileFromModuleDir);
    } else {
      process.exitCode = 2;
      throw new Error(`The specified dockerfile context: "${config.dockerfile}" doesn't exist`);
    }
  }

  await docker.build(config);
  await docker.run(config);
}
