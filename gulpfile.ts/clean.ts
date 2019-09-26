import * as fs from 'fs-extra';
import { getDestinationSubFolder } from './common';
export function createClean(subFolder:string){
    return ()=>{
        const folder=getDestinationSubFolder(subFolder);
        return fs.remove(folder);
    }
}
