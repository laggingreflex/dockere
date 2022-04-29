import packageJson from '../package.json' assert { type: 'json' }

export function printUsage(exit) {
  console.log(`
    ${packageJson.description}

    Usage: dockere [OPTION]
      -d, --dockerfile    dockerfile template to build from. Default: ubuntu
      -c, --command       command to execute when run. Default: bash -li
      -m, --mount-home    whether to mount your home-dir as /root. Defaut: no

    Examples:
      dockere
      dockere -d nodejs -m
      dockere -d ubuntu -c echo ok
  `);
  if (exit) {
    process.exit(0);
  }
};
