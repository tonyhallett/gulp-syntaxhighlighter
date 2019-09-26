import { src, dest, series }  from 'gulp'
import { getDestinationSubFolder } from './common';
import { createClean } from './clean';
import {SyntaxHighlighterAssetLocator} from '../gulp-syntaxhighlighter/src/syntaxHighlighterAssetLocator'

const clean=createClean(SyntaxHighlighterAssetLocator.folderName);
const copy = ()=>{
    return src('./syntaxHighlighter/*').pipe(dest(getDestinationSubFolder(SyntaxHighlighterAssetLocator.folderName)));
}

export const assetsToDist=series(clean,copy);