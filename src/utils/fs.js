import os from 'os';
import path from 'path';
import fs from 'fs-extra';

export const homeConfigDir = path.join( os.homedir(), '.dockere' );
export const moduleDir = path.join( path.dirname( __filename ), '../../dockerfiles' );
export const cwdFull = process.cwd();
export const cwdBase = path.basename( cwdFull );

export const rootDirText = '<root-dir>';
export const rootDirRegex = new RegExp( rootDirText, 'ig' );
export const cwdBaseRegex = new RegExp( '/?' + cwdBase, 'ig' );

export function readFile( ...paths ) {
  try {
    return fs.readFileSync( path.join( ...paths ), 'utf8' );
  } catch ( error ) {
    return false;
  }
}

export function readFromHome( file ) {
  return readFile( homeConfigDir, file );
}

export function readFromModuleDir( file ) {
  return readFile( moduleDir, file + '.dockerfile' );
}

export function readFromCwd( file ) {
  return readFile( cwdFull, file );
}

export const dockerfiles = {
  moduleDir: {
    alpine: readFromModuleDir( 'alpine' ),
    nodejs: readFromModuleDir( 'nodejs' ),
    ubuntu: readFromModuleDir( 'ubuntu' ),
  },
  home: readFromHome( 'Dockerfile' ),
  cwd: readFromCwd( 'Dockerfile' )
};

if ( !dockerfiles.moduleDir ) {
  throw new Error( 'moduleDir Dockerfile not found.' );
}

export function replaceRootDirText( str ) {
  return str.replace( rootDirRegex, '/' + cwdBase );
}
export function replaceCwdBaseText( str ) {
  return str.replace( cwdBaseRegex, rootDirText );
}

export function writeFile( [ ...paths ], data ) {
  fs.outputFileSync( path.join( ...paths ), data );
}

export function writeToHome( file, data ) {
  writeFile( [ homeConfigDir, file ], data );
  dockerfiles.home = data;
}

export function writeToCwd( data ) {
  writeFile( [ cwdFull, 'Dockerfile' ], replaceRootDirText( data ) );
  dockerfiles.cwd = data;
}
