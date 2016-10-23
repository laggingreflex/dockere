import fs from 'fs';
import {
  moduleDir,
  readFile,
  dockerfile
} from './fs';

describe( 'moduleDir', () => {
  it( 'should end with "dockere"', () => {
    expect( moduleDir ).toMatch( /dockere$/ );
  } );
} );

describe( 'dockerfile.moduleDir', () => {
  it( 'should have "FROM"', () => {
    expect( dockerfile.moduleDir ).toMatch( /FROM/ );
  } );
} );

describe('readFile', () => {
  const org = fs.readFileSync;
  const mock = jest.fn( file => {
    throw new Error( `File doesn't exist` );
  } );
  it('should return false for non-existent paths', () => {
    fs.readFileSync = mock;
    expect(readFile('a', 'non-existent', 'path')).toBe(false);
    fs.readFileSync = org;
  });
  it('should return be truthy for existent paths', () => {
    fs.readFileSync = org;
    expect(readFile(__filename)).toBeTruthy();
  });
});
