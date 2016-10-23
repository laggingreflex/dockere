import path from 'path';
import { exec, splitCommandStr } from './child-process';
import { cwdFull, cwdBase } from './fs';

export function build() {
  return exec( ...splitCommandStr( `docker build -t ${cwdBase} .` ) );
}
export function run( command ) {
  return exec( 'docker', [
    'run', '-it', '--rm',
    '--volume', `${cwdFull}${path.sep}:/${cwdBase}`,
    cwdBase, ...command
    // 'bash', '-c', `cd /${cwdBase} && ${command || 'bash -li'}`
  ] );
}
