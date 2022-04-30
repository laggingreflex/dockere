import prompt from 'enquire-simple';
import { fs, docker } from './utils/index.js';

export default async function main({ ...config } = {}) {

  if (fs.dockerfiles.cwd) {
    if (config.dockerfile) {
      const dockerfileFromCwd = fs.readFromCwd();
      const dockerfileFromHome = fs.readFromHome(config.dockerfile);
      const dockerfileFromModuleDir = fs.dockerfiles.moduleDir[config.dockerfile];

      const shouldCopy = async (dest) => {

        console.warn(`WARNING: This will overwrite \n ${fs.cwdDockerfile} \n ↑ with ↑ \n ${dest}`);
        const answer = await prompt.confirm(`Overwrite local Dockerfile with "${config.dockerfile}" dockerfile template?`, false);
        if (answer) return answer;
        console.error([
          `Either don't pass the flag: --dockerfile=${config.dockerfile}`,
          `Or remove the local Dockerfile: ${fs.cwdDockerfile}`,
        ].join('\n'));
      }
      if (dockerfileFromHome) {
        if (dockerfileFromCwd?.data === dockerfileFromHome?.data) {
          // proceed
        } else if (!await shouldCopy(dockerfileFromHome?.path)) {
          return;
        } else {
          fs.writeToCwd(dockerfileFromHome);
        }
      } else if (dockerfileFromModuleDir) {
        if (dockerfileFromCwd?.data === dockerfileFromModuleDir?.data) {
          // proceed
        } else if (!await shouldCopy(dockerfileFromModuleDir?.path)) {
          return;
        } else {
          fs.writeToHome(config.dockerfile, dockerfileFromModuleDir);
          fs.writeToCwd(dockerfileFromModuleDir);
        }
      } else if (await prompt.confirm(`Create a new "${config.dockerfile}" dockerfile template from existing Dockerfile`, true)) {
        const file = fs.writeToHome(config.dockerfile, fs.dockerfiles.cwd);
        console.log(`Copied '${fs.dockerfiles.cwd.path}' -> '${file.path}'`);
      } else {
        process.exitCode = 2;
        throw new Error(`The specified dockerfile context: "${config.dockerfile}" doesn't exist`);
      }
    } else {
      console.log('Using local Dockerfile:', fs.dockerfiles.cwd.path);
    }
  } else {
    if (!config.dockerfile) {
      config.dockerfile = 'ubuntu';
    }
    const dockerfileFromHome = fs.readFromHome(config.dockerfile);
    const dockerfileFromModuleDir = fs.dockerfiles.moduleDir[config.dockerfile];
    if (dockerfileFromHome) {
      console.log('Using homedir Dockerfile:', dockerfileFromHome.path);
      fs.writeToCwd(dockerfileFromHome);
    } else if (dockerfileFromModuleDir) {
      console.log('Using default Dockerfile:', dockerfileFromModuleDir.path);
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
