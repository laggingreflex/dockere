import yargs from 'yargs';
import { dockerfiles } from './utils/fs';
import { printUsage } from './utils/help';

const { argv: config } = yargs.options( {
  command: {
    alias: [ 'c' ],
    type: 'array'
  },
  dockerfile: {
    alias: [ 'd' ],
    type: 'string'
  },
  mountHome: {
    alias: [ 'm' ],
    type: 'boolean'
  },
  help: {
    alias: [ 'h', '?' ],
    type: 'boolean'
  }
} );


if (config.help) {
  printUsage(true);
}

if ( !dockerfiles.cwd && !config.dockerfile && config._.length === 1 ) {
  config.dockerfile = config._[ 0 ];
}
if ( !config.command && ( config._.length > 1 || dockerfiles.cwd ) ) {
  config.command = config._;
}

export default config;
