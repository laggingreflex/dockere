import path from 'path';
import { exec, splitCommandStr } from './child-process';
import { cwdFull, cwdBase, homedir } from './fs';

export function build() {
  return exec( ...splitCommandStr( `docker build -t ${cwdBase} .` ) );
}
export function run( command, { mountCwd = true, mountHome = false } = {} ) {
  let args = [ 'run', '-it', '--rm' ];
  if ( mountCwd ) {
    args = [ ...args, '--volume', `${cwdFull}${path.sep}:/${cwdBase}` ];
  }
  if ( mountHome ) {
    args = [ ...args, '--volume', `${homedir}${path.sep}:/root` ];
  }
  args = [ ...args, cwdBase ];
  if ( command && command.length ) {
    args = [ ...args, ...command ];
  }

  return exec( 'docker', args );
}
