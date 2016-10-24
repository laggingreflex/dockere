import path from 'path';
import { exec } from './child-process';
import { cwdFull, cwdBase, homedir } from './fs';

export function build( {} = {} ) {
  const args = [ 'build' ];
  args.push( '--rm' );
  args.push( '-t', cwdBase );
  args.push( '.' );
  return exec( 'docker', args );
}
export function run( { command, mountCwd = true, mountHome = false } = {} ) {
  const args = [ 'run', '-it', '--rm' ];
  if ( mountCwd ) {
    args.push( '--volume', `${cwdFull}${path.sep}:/${cwdBase}` );
  }
  if ( mountHome ) {
    args.push( '--volume', `${homedir}${path.sep}:/root` )
  }
  args.push( cwdBase );
  if ( command && command.length ) {
    args.push( ...command )
  }
  return exec( 'docker', args );
}
