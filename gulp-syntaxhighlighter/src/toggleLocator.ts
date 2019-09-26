import { IToggleLocator } from "./interfaces";
import { FolderLocator } from "./folderLocator";

export class ToggleLocator extends FolderLocator implements IToggleLocator{
    constructor(){
        super(ToggleLocator.folderName);
    }
    
    static folderName="toggle";
}