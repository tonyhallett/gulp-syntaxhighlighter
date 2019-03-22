import {SyntaxHighlighterAssetLoader} from '../gulp-syntaxhighlighter/syntaxHighlighterAssetLoader'

jest.mock('path',()=>{
    return {
        resolve:jest.fn((dir:string,segment:string)=>{
            if(segment==="./syntaxHighlighter/shCore"){
                return "themePrefix"
            }
            if(segment==="./syntaxHighlighter/shCore.min.js"){
                return "shcoreminjs";
            }
            if(segment==="./syntaxHighlighter/shCore.js"){
                return "shcorejs";
            }
            if(segment==="syntaxHighlighter"){
                return "syntaxHighlighterDir";
            }
        })
    }
})
jest.mock('../gulp-syntaxhighlighter/fileHelper',()=>{
    return {
        getFilteredFilesFromDirectoryDeep:jest.fn((dir:string,filter:(f:string)=>boolean)=>{
            if(dir==="syntaxHighlighterDir"){
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
                return brushes.filter(filter);
            }
        })
    }
})
jest.mock('fs',()=>{
    return {
        readFileSync:jest.fn((path:string)=>{
            if(path==="themePrefixTheTheme.min.css"){
                return "minifiedTheme";
            }
            if(path==="themePrefixTheTheme.css"){
                return "theme";
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
                var assetLoader=new SyntaxHighlighterAssetLoader();
                var loadedTheme=assetLoader.getTheme(minified,"TheTheme");
                expect(loadedTheme).toEqual(minified?"minifiedTheme":"theme");
            })
        })
    })
    describe('getScripts',()=>{
        [true,false].forEach(minified=>{
            it(`should return the ${minified?'minified':'unminified'} shcore js`,()=>{
                var assetLoader=new SyntaxHighlighterAssetLoader();
                var scripts=assetLoader.getScripts(minified);
                var shcoreScript=scripts[0];
                expect(shcoreScript).toEqual(minified?"shcoremin":"shcore");
            })
            it(`should return all ${minified?'minified':'unminified'} brush files`,()=>{
                var assetLoader=new SyntaxHighlighterAssetLoader();
                var scripts=assetLoader.getScripts(minified);
                scripts.splice(0,1);
                expect(scripts).toEqual(minified?["shBrush1min","shBrush2min"]:["shBrush1","shBrush2"]);
            })
        })
    })
});

