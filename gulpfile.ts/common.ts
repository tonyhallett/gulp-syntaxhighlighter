import * as path from 'path';
export const packageRoot="dist";
export function getDestinationSubFolder(subFolder:string){
    return path.join(process.cwd(),packageRoot,subFolder);
}