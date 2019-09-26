import {dest,parallel,series}  from 'gulp'
import * as ts from 'gulp-typescript'
import { getDestinationSubFolder } from './common';
import { createClean } from './clean';
import { ToggleLocator } from '../gulp-syntaxhighlighter/src/toggleLocator'
import { getCustomTransformers } from 'typescript-remove-exports'
function createCleanAndCompile(taskName:string,tsconfigPath:string,subFolder:string,settings?:ts.Settings){
    const clean=createClean(subFolder);
    //https://www.npmjs.com/package/gulp-typescript#incremental-compilation
    const project=ts.createProject(tsconfigPath,settings);
    const compile= ()=>{
        return project.src().pipe(project()).pipe(dest(getDestinationSubFolder(subFolder)));
    }
    const cleanAndCompile= series(clean,compile);
    cleanAndCompile.displayName=taskName;
    return cleanAndCompile
}
export const gulpSyntaxHighlighterFolderName="gulp-syntaxHighlighter";
export const gshTsCompile=createCleanAndCompile("gshTsCompile","./gulp-syntaxhighlighter/tsconfig.json",gulpSyntaxHighlighterFolderName);
export const toggleCompile=createCleanAndCompile("toggleCompile","./toggle/src/toggleExport/tsconfig.json",ToggleLocator.folderName,{
    getCustomTransformers:getCustomTransformers
});
export const compile=parallel(gshTsCompile,toggleCompile)
