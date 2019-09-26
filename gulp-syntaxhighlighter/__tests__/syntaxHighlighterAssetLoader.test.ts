import {SyntaxHighlighterAssetLoader} from '../src/syntaxHighlighterAssetLoader'
import { ISyntaxHighlighterAssetLocator } from '../src/interfaces';
const assetFolderPath="AssetFolderPath"
const locator:ISyntaxHighlighterAssetLocator={
    getFolderPath:()=>{
        return assetFolderPath;
    }
}
jest.mock('path',()=>{
    return {
        resolve:jest.fn((dir:string,segment:string)=>{
            expect(dir).toEqual(assetFolderPath);

            if(segment==="shCore"){
                return "themePrefix"
            }
            if(segment==="shCore.min.js"){
                return "shcoreminjs";
            }
            if(segment==="shCore.js"){
                return "shcorejs";
            }
            if(segment==="syntaxHighlighter"){
                return "syntaxHighlighterDir";
            }
            if(segment==="shCoreTheTheme.min.css"){
                return "minifiedTheThemePath"
            }
            if(segment==="shCoreTheTheme.css"){
                return "theThemePath"
            }
        })
    }
})
jest.mock('../src/fileHelper',()=>{
    return {
        getFilteredFilesFromDirectoryDeep:jest.fn((dir:string,filter:(f:string,fn:string)=>boolean)=>{
            if(dir===assetFolderPath){
                const brushes = [
                    "notABrush.min.js",
                    "notABrush.js",
                    "shBrush.txt",
                    "shBrush1.js",
                    "shBrush1.min.js",
                    "shBrush2.min.js",
                    "shBrush2.js",
                    "stillNotABrush.js"
                ]
                return brushes.filter((b)=>filter("",b));
            }
        })
    }
})
jest.mock('fs',()=>{
    return {
        readFileSync:jest.fn((path:string)=>{
            if(path==="minifiedTheThemePath"){
                return "minifiedTheTheme";
            }
            if(path==="theThemePath"){
                return "theTheme";
            }
            if(path==="shcoreminjs"){
                return "shcoremin";
            }
            if(path==="shcorejs"){
                return "shcore";
            }
            if(path==="shBrush1.js"){
                return "shBrush1";
            }
            if(path==="shBrush1.min.js"){
                return "shBrush1min";
            }
            if(path==="shBrush2.js"){
                return "shBrush2";
            }
            if(path==="shBrush2.min.js"){
                return "shBrush2min";
            }
            
        })
    }
})

describe('SyntaxHighlighterAssetLoader',()=>{
    describe('getTheme',()=>{
        [true,false].forEach(minified=>{
            it(`should return the ${minified?'minified':'unminified'} theme from the resolved path`,()=>{
                
                var assetLoader=new SyntaxHighlighterAssetLoader(locator);
                var loadedTheme=assetLoader.getTheme(minified,"TheTheme");
                expect(loadedTheme).toEqual(minified?"minifiedTheTheme":"theTheme");
            })
        })
    })
    describe('getScripts',()=>{
        [true,false].forEach(minified=>{
            it(`should return the ${minified?'minified':'unminified'} shcore js`,()=>{
                var assetLoader=new SyntaxHighlighterAssetLoader(locator);
                var scripts=assetLoader.getScripts(minified);
                var shcoreScript=scripts[0];
                expect(shcoreScript).toEqual(minified?"shcoremin":"shcore");
            })
            it(`should return all ${minified?'minified':'unminified'} brush files`,()=>{
                var assetLoader=new SyntaxHighlighterAssetLoader(locator);
                var scripts=assetLoader.getScripts(minified);
                scripts.splice(0,1);
                expect(scripts).toEqual(minified?["shBrush1min","shBrush2min"]:["shBrush1","shBrush2"]);
            })
        })
    })
});

