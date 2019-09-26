import * as gulp from 'gulp'
import {jestTests} from './jesttests'
import {compile,gshTsCompile,toggleCompile} from './compile'
import {assetsToDist} from './assets'
import {buildDemo} from './demo'
import {watchAll} from './watch'
import {testPackageJson} from './packageJson'


export {
    jestTests,
    assetsToDist,
    compile,gshTsCompile,toggleCompile,
    buildDemo,
    watchAll,
    testPackageJson
}


export const compileWithAssets=gulp.parallel(assetsToDist,compile);

export const build=gulp.series(compileWithAssets,buildDemo);

