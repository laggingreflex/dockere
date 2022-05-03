import { spawn } from 'child_process';

export function splitCommandStr(commandStr) {
  const [command, ...args] = commandStr.trim().split(/[\s]+/g);
  return [command, args];
};

export function exec(command, args, {
  cwd,
  env,
  shell = true,
  silent,
  stdio = silent ? ['pipe', 'ignore', 'ignore'] : 'inherit',
} = {}) {
  if (!silent) console.log('$', command, ...args);
  const cp = spawn(command, args.filter(Boolean), {
    stdio,
    cwd,
    env: Object.assign({}, process.env, env),
    shell,
  })
  return new Promise((resolve, reject) => {
    try {
      cp.once('error', e => {
        reject(error);
      });
      cp.once('exit', code => {
        if (code !== 0) reject(new Error(`${command} exited with code ${code}`));
        else resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};
