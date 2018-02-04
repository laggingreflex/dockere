#!/usr/bin/env node

const prompt = require('enquire-simple');
const config = require('./config');
const { fs, docker } = require('./utils');

main().catch((error) => process.exit(1, console.error(error)));

async function main() {
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
        process.exit(2, console.error(`The specified dockerfile context: "${config.dockerfile}" doesn't exist`));
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
      process.exit(2, console.error(`The specified dockerfile context: "${config.dockerfile}" doesn't exist`));
    }
  }

  await docker.build(config);
  await docker.run(config);
}
