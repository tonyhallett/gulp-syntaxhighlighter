import * as path from 'path'
jest.unmock('path')
var __tests__helpersDirname=__dirname;

const expectedContainingDirectory=path.join(__tests__helpersDirname,'../gulp-syntaxhighlighter')
export {
    expectedContainingDirectory
}
