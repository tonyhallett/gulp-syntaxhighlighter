import * as path from 'path'
jest.unmock('path')
var __tests__helpersDirname=__dirname;

const srcDirectory=path.join(__tests__helpersDirname,'../src')
export {
    srcDirectory
}
