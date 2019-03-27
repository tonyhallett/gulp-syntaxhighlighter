import {dest,parallel}  from 'gulp'
import * as ts from 'gulp-typescript'
import {destination} from './dest'
function createCompile(taskName:string,tsconfigPath:string){
    const project=ts.createProject(tsconfigPath);
    const task= ()=>{
        return project.src().pipe(project()).pipe(dest(destination));
    }
    task.displayName=taskName;
    return task;
}
export const gshTsCompile=createCompile("gshTsCompile","../gulp-syntaxhighlighter/tsconfig.json");
export const toggleCompile=createCompile("toggleCompile","../toggle/tsconfig.json");
export const compile=parallel(gshTsCompile,toggleCompile)
