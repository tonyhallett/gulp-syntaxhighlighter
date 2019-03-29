import * as gulp from 'gulp'
import {jestTests} from './jesttests'
import {compile,gshTsCompile,toggleCompile} from './compile'
import {assetsToDist} from './assets'
import {buildDemo} from './demo'
import {destination} from './dest'
import {generateExported} from './toggleExport'
import * as fs from 'fs-extra';
import * as path from 'path';

export {
    jestTests,
    assetsToDist,
    compile,gshTsCompile,toggleCompile,
    buildDemo,
    generateExported
}

function cleanDist(){
    return fs.emptyDir(path.join(process.cwd(),destination));
}
export const compileWithAssets=gulp.parallel(assetsToDist,compile);

export const build=gulp.series(jestTests,cleanDist,compileWithAssets,buildDemo);
