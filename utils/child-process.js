import { spawn } from 'child-process-promise';

export function splitCommandStr(commandStr) {
  const [command, ...args] = commandStr.trim().split(/[\s]+/g);
  return [command, args];
};

export function exec(command, args, { cwd, env, shell = true } = {}) {
  return spawn(command, args.filter(Boolean), {
    stdio: 'inherit',
    cwd,
    env: Object.assign({}, process.env, env),
    shell,
  }).catch(e => {
    if (e.stderr || e.stdout) {
      throw new Error(e.stderr || e.stdout)
    } else {
      return;
    }
  });
};
