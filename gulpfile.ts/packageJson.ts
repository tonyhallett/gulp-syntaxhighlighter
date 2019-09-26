import * as fs from "fs-extra"
import * as path from "path";
import {gulpSyntaxHighlighterFolderName} from './compile'
import {packageRoot} from './common'

async function changePackageJson(changer:(packageJson:any)=>void){
    const packageJsonPath=path.join(path.resolve(__dirname,".."),"package.json");
    const packageJson=await fs.readJSON(packageJsonPath);
    changer(packageJson);
    return fs.writeJSON(packageJsonPath,packageJson,{
        spaces:2
    })
}
export function setMain(){
    return changePackageJson((packageJson)=>{
        packageJson.main=path.join(packageRoot,gulpSyntaxHighlighterFolderName,"gulp-syntaxhighlighter.js");
        packageJson.types=path.join(packageRoot,gulpSyntaxHighlighterFolderName,"gulp-syntaxhighlighter.d.ts")
    })}