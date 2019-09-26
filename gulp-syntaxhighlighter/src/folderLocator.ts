import * as path from 'path';
export abstract class FolderLocator{
    constructor(private folderName:string){}
    getFolderPath():string{
        return path.join(path.resolve(__dirname, '..'),this.folderName);
    }
}