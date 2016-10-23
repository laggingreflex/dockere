import config from './config';
import {
  dockerfiles,
  readFromHome,
  writeToHome,
  writeToCwd,
} from './utils/fs';
import { build, run } from './utils/docker';
import { confirm } from './utils/prompt';

async function main() {
  if ( dockerfiles.cwd ) {
    if ( config.dockerfile ) {
      const dockerfileFromHome = readFromHome( config.dockerfile );
      const dockerfileFromModuleDir = dockerfiles.moduleDir[ config.dockerfile ];
      if ( dockerfileFromHome ) {
        if ( !await confirm( `Overwrite existing Dockerfile with "${config.dockerfile}" dockerfile template from Home?` ) ) {
          return;
        }
        writeToCwd( dockerfileFromHome );
      } else if ( dockerfileFromModuleDir ) {
        if ( !await confirm( `Overwrite existing Dockerfile with default "${config.dockerfile}" dockerfile template:` ) ) {
          return;
        }
        writeToHome( config.dockerfile, dockerfileFromModuleDir );
        writeToCwd( dockerfileFromModuleDir );
      } else if ( !await confirm( `Create a new "${config.dockerfile}" dockerfile template from existing Dockerfile:` ) ) {
        writeToHome( config.dockerfile, dockerfiles.cwd );
      } else {
        throw new Error( `The specified dockerfile context: "${config.dockerfile}" doesn't exist` );
      }
    }
  } else {
    if ( !config.dockerfile ) {
      config.dockerfile = 'ubuntu';
    }
    const dockerfileFromHome = readFromHome( config.dockerfile );
    const dockerfileFromModuleDir = dockerfiles.moduleDir[ config.dockerfile ];
    if ( dockerfileFromHome ) {
      writeToCwd( dockerfileFromHome );
    } else if ( dockerfileFromModuleDir ) {
      writeToHome( config.dockerfile, dockerfileFromModuleDir );
      writeToCwd( dockerfileFromModuleDir );
    } else {
      throw new Error( `The specified dockerfile context: "${config.dockerfile}" doesn't exist` );
    }
  }

  await build();
  await run( config.command, config );
}

main().catch( ( err ) => {
  console.error( '\nDockere Error:', err.message );
} );
