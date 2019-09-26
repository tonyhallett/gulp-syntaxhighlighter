import * as path from "path";
import * as fs from "fs";
import {SyntaxHighlighterAssetLocator} from "../src/syntaxHighlighterAssetLocator"
import {ToggleLocator} from "../src/toggleLocator"



describe("locators",()=>{
    let dirName:string
    beforeAll(async()=>{
        const folderLocatorPath="../src/folderLocator";

        let forDirNamePath:string
        let dirnameFileName="___forDirname.ts";
        
        const locatorDirectory=(path.dirname(path.resolve(__dirname,folderLocatorPath)));
        forDirNamePath=path.join(locatorDirectory,dirnameFileName);

        const locatorDirNameVarName="locatorDirName"
        fs.writeFileSync(forDirNamePath,`
            export const ${locatorDirNameVarName}=__dirname;
        `);
        const dirNameMod= await import(forDirNamePath);
        dirName=dirNameMod[locatorDirNameVarName];
        fs.unlinkSync(forDirNamePath);
    })
    function expectSiblingFolder(locator:{getFolderPath:()=>string},locatorFolderName:{folderName:string}){
        expect(locator.getFolderPath()).toEqual(path.join(path.resolve(dirName, '..'),locatorFolderName.folderName));
    }
    describe("SyntaxHighlighterAssetLocator.getFolderPath()",()=>{
        it("should be sibling of folder containing the base class FolderLocator with name folderName",async ()=>{
            expectSiblingFolder(new SyntaxHighlighterAssetLocator(),SyntaxHighlighterAssetLocator);
        })
    })
    describe("SyntaxHighlighterAssetLocator.getFolderPath()",()=>{
        it("should be sibling of folder containing the base class FolderLocator with name folderName",async ()=>{
            expectSiblingFolder(new ToggleLocator(),ToggleLocator);
        })
    })
    
})