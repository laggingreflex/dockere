import path from 'path';
import { exec, splitCommandStr } from './child-process';
import { cwdFull, cwdBase, homedir } from './fs';

export function build() {
  return exec( ...splitCommandStr( `docker build -t ${cwdBase} .` ) );
}
export function run( command ) {
  return exec( 'docker', [
    'run', '-it', '--rm',
    '--volume', `${cwdFull}${path.sep}:/${cwdBase}`,
    '--volume', `${homedir}${path.sep}:/root`,
    cwdBase, ...command
    // 'bash', '-c', `cd /${cwdBase} && ${command || 'bash -li'}`
  ] );
}
