import {SyntaxHighlighterDocumentManager} from '../gulp-syntaxhighlighter/syntaxHighlighterDocumentManager'

describe('SyntaxHighlighterDocumentManager',()=>{
    describe('css',()=>{
        const mockJsDocument={
            addCss:jest.fn(),
            addSyntaxHighlighterScript:jest.fn()
        };
        const mockMinifier={
            minifyCss:jest.fn((css:string)=>{
                return css.split("_")[0];
            }),
        } as any;
        const mockAssetLoader={
            getTheme:jest.fn().mockReturnValue("from asset loader"),
            getScripts:jest.fn().mockReturnValue(["script1","script2"])
        };
        beforeEach(()=>{
            jest.clearAllMocks();
        })
        describe('minifiable themes',()=>{
            
            interface MinifiableCssTestOptions{
                methodName:"addCustomTheme"|"addAdditionalCss",
                css:string,
                expectedAddCss:string
            }
            const minifiableCssOptions:Array<MinifiableCssTestOptions>=[
                {methodName:"addCustomTheme",css:"custom_theme",expectedAddCss:"custom"},
                {methodName:"addAdditionalCss",css:"additional_css",expectedAddCss:"additional"}
            ]
            minifiableCssOptions.forEach(testOption=>{
                it(`${testOption.methodName} should minify and add to the jsDomDocument`,()=>{
                    var syntaxHighlighterDocumentManager=new SyntaxHighlighterDocumentManager(
                        mockJsDocument as any,mockMinifier,mockAssetLoader as any);
                    syntaxHighlighterDocumentManager[testOption.methodName](testOption.css);
                    expect(mockJsDocument.addCss).toHaveBeenCalledWith(testOption.expectedAddCss)
                })
            })
           
        });
        describe('addNamedTheme',()=>{
            [true,false].forEach(minifies=>{
                it('should add to the jsDomDocument css returned by the asset loader',()=>{
                    mockMinifier.minifies=minifies;

                    var syntaxHighlighterDocumentManager=new SyntaxHighlighterDocumentManager(
                        mockJsDocument as any,mockMinifier,mockAssetLoader as any);
                    syntaxHighlighterDocumentManager.addNamedTheme("NamedTheme");

                    expect(mockAssetLoader.getTheme).toHaveBeenCalledWith(minifies,"NamedTheme");
                    expect(mockJsDocument.addCss).toHaveBeenCalledWith("from asset loader")
                })
            })
            
        })
        describe('addSyntaxHighlighterScripts',()=>{
            [true,false].forEach(useMinifiedSyntaxHighlighter=>{
                it('should add syntax highlighter scripts from the asset loader',()=>{
                    var syntaxHighlighterDocumentManager=new SyntaxHighlighterDocumentManager(
                        mockJsDocument as any,mockMinifier,mockAssetLoader as any);
                    syntaxHighlighterDocumentManager.addNamedTheme("NamedTheme");

                    syntaxHighlighterDocumentManager.addSyntaxHighlighterScripts(useMinifiedSyntaxHighlighter);

                    expect(mockAssetLoader.getScripts).toHaveBeenCalledWith(useMinifiedSyntaxHighlighter);
                    expect(mockJsDocument.addSyntaxHighlighterScript).toHaveBeenCalledTimes(2)
                    expect(mockJsDocument.addSyntaxHighlighterScript).toHaveBeenNthCalledWith(1,"script1");
                    expect(mockJsDocument.addSyntaxHighlighterScript).toHaveBeenNthCalledWith(2,"script2");
                })
            })
            
        });
        describe('applySyntaxHighlighter',()=>{
            
            //todo - this is convuluted
            it('should addSyntaxHighlighterScript to the jsDocument,with turned off toolbars and with default config if not provided',()=>{
                (JSON as any).stringify=function(obj:any){
                    //if config null this would throw
                    if(obj["toolbar"]!==undefined){
                        expect(obj["toolbar"]).toBe(false);
                        //if this path is not taken then the script strings will not match
                        return "stringifiedGlobalParams";
                    }else{
                        return "stringifiedConfig";
                    }
                }

            var syntaxHighlighterDocumentManager=new SyntaxHighlighterDocumentManager(
                mockJsDocument as any,mockMinifier,mockAssetLoader as any);
            const expectedScript=(syntaxHighlighterDocumentManager as any).getHighlightScript("stringifiedGlobalParams","stringifiedConfig");
            syntaxHighlighterDocumentManager.applySyntaxHighlighter({},null as any);
            expect(mockJsDocument.addSyntaxHighlighterScript).toHaveBeenCalledWith(expectedScript);
});


        })
    });
    
})