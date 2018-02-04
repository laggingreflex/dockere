const yargs = require('yargs');
const { dockerfiles } = require('./utils/fs');
const { printUsage } = require('./utils/help');

const config = module.exports = yargs.options({
  command: {
    alias: ['c'],
    type: 'array'
  },
  dockerfile: {
    alias: ['d'],
    type: 'string'
  },
  noMountCwd: {
    alias: ['n'],
    type: 'boolean',
    default: false
  },
  mountHome: {
    alias: ['m'],
    type: 'boolean',
    default: false
  },
  volume: {
    alias: ['v'],
    type: 'string'
  },
  help: {
    alias: ['h', '?'],
    type: 'boolean'
  }
}).argv;


if (config.help) {
  printUsage(true);
}

if (!dockerfiles.cwd && !config.dockerfile && config._.length === 1) {
  config.dockerfile = config._[0];
}
if (!config.command && (config._.length > 1 || dockerfiles.cwd)) {
  config.command = config._;
}
