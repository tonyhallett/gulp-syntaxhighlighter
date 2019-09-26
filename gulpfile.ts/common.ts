import * as path from 'path';
export function getDestinationSubFolder(subFolder:string){
    return path.join(process.cwd(),"dist",subFolder);
}