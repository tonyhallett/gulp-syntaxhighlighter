import * as path from 'path'
jest.unmock('path')
var __tests_helpersDirname=__dirname;

const expectedContainingDirectory=path.join(__tests_helpersDirname,'../gulp-syntaxhighlighter')
export {
    expectedContainingDirectory
}
