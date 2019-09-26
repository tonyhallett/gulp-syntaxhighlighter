import { ISyntaxHighlighterAssetLocator } from "./interfaces";
import { FolderLocator } from "./folderLocator";

export class SyntaxHighlighterAssetLocator extends FolderLocator implements ISyntaxHighlighterAssetLocator{
    constructor(){
        super(SyntaxHighlighterAssetLocator.folderName)
    }
    static folderName="syntaxHighlighter";
}