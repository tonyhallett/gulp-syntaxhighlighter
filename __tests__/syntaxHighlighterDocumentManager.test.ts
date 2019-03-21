import {SyntaxHighlighterDocumentManager} from '../gulp-syntaxhighlighter/syntaxHighlighterDocumentManager'

describe('SyntaxHighlighterDocumentManager',()=>{
    describe('css',()=>{
        const mockJsDocument={
            addCss:jest.fn()
        };
        const mockMinifier={
            minifyCss:jest.fn((css:string)=>{
                return css.split("_")[0];
            }),
        } as any;
        const mockAssetLoader={
            getTheme:jest.fn().mockReturnValue("from asset loader")
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
    });
    
})