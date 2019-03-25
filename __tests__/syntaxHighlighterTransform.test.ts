import {SyntaxHighlighterTransform} from '../gulp-syntaxhighlighter/syntaxHighlighterTransform'
import { SyntaxHighlighterGlobalParamsNoToolbar } from '../gulp-syntaxhighlighter/interfaces';
import { pluginTest,File} from 'gulpPluginTestHelpers'
import { GulpSyntaxHighlighterOptions } from '../gulp-syntaxhighlighter/publicInterfaces';

interface TExpectedTest<TExpected>{
    description:string,
    expected:TExpected
}
type ExpectedBoolTest=TExpectedTest<boolean>

describe('transformBufferFile',()=>{
    function pluginTestEnsureNoError(done:jest.DoneCallback,
        syntaxHighlighterTransform:SyntaxHighlighterTransform,
        file:File,
        expectation: (files: File[])=>void)
    {
            pluginTest(done,syntaxHighlighterTransform,file,(files,err)=>{
                expect(err).toBeUndefined();
                expectation(files);
            })
    }
    function getTransform(options:GulpSyntaxHighlighterOptions={})
    {
        return new SyntaxHighlighterTransform(
            options,
            mockAssetLoader as any,
            mockMinifier as any,
            mockJsDomDocumentFactory as any,
            mockSyntaxHighlighterDocumentManagerFactory as any,
            mockToggleDocumentManagerFactory as any
            );
    }
    const mockBufferContents="The html";
    function getMockBufferFile(){
        return  {
            isBuffer:function(){
                return true;
            },
            isStream:function(){
                return false;
            },
            contents:{
                toString:function(){
                    return mockBufferContents;
                }
            },
        }
    }
    var mockToggleDocumentManager={
        addToggle:jest.fn()
    }
    var mockToggleDocumentManagerFactory={
        create:jest.fn().mockReturnValue(mockToggleDocumentManager)
    }
    const theNewContents="The new contents";
    var mockJsDomDocument={
        getNewContents:jest.fn().mockReturnValue(theNewContents),
    }
    
    var mockJsDomDocumentFactory={
        create:jest.fn().mockReturnValue(mockJsDomDocument)
    }
    var mockMinifier={
        initialize:jest.fn()
    };
    var mockSyntaxHighlighterDocumentManager={
        addSyntaxHighlighterScripts:jest.fn(),
        addCustomTheme:jest.fn(),
        addNamedTheme:jest.fn(),
        applySyntaxHighlighter:jest.fn(),
        addAdditionalCss:jest.fn()
    }
    var mockSyntaxHighlighterDocumentManagerFactory={
        create:jest.fn().mockReturnValue(mockSyntaxHighlighterDocumentManager)
    }
    var mockAssetLoader={};
    beforeEach(()=>{
        jest.clearAllMocks();
        
    });
    describe('minifier',()=>{
        var minifierTestOptions:Array<{minifiedOutput?:boolean}&ExpectedBoolTest>=[
            {minifiedOutput:false,description:"Explicit",expected:false},
            {description:"Default ( true )",expected:true}
        ]
        minifierTestOptions.forEach((testOption)=>{
            describe(testOption.description,()=>{
                it('should initialize the minifier',(done)=>{
                    let syntaxHighlighterOptions:SyntaxHighlighterOptions={};
                    if(testOption.minifiedOutput!==undefined){
                        syntaxHighlighterOptions={minifiedOutput:testOption.minifiedOutput};
                    }
                    pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),getMockBufferFile() as any,(_)=>{
                        expect(mockMinifier.initialize).toHaveBeenCalledWith(testOption.expected);
                    })
                });
            })
        });
    })
    describe('setup toggle',()=>{
        describe('no toggle config',()=>{
            it('should do no setup',(done)=>{
                pluginTestEnsureNoError(done,getTransform(),getMockBufferFile() as any,(_)=>{
                    expect(mockToggleDocumentManagerFactory.create).not.toHaveBeenCalled();
                })
            });
        })
        describe('toggle config',()=>{
            it('should create toggle document manager from the factory with dependencies',(done)=>{
                const toggleConfig={};
                pluginTestEnsureNoError(done,getTransform({toggleConfig:toggleConfig}),getMockBufferFile() as any,(_)=>{
                    expect(mockToggleDocumentManagerFactory.create).toHaveBeenCalledWith(mockJsDomDocument,mockMinifier);
                })
            });
            it('should add toggle',(done)=>{
                const toggleConfig={someConfig:"SomeConfig"} as any;
                pluginTestEnsureNoError(done,getTransform({toggleConfig:toggleConfig}),getMockBufferFile() as any,(_)=>{
                    expect(mockToggleDocumentManager.addToggle).toHaveBeenCalledWith(toggleConfig);
                })
            });
        })
        
        
    });
    describe('setup syntax highlighter',()=>{
        it('should create syntaxHighlighterDocumentManager from the factory with dependencies',done=>{
            pluginTestEnsureNoError(done,getTransform(),getMockBufferFile() as any,(_)=>{
                expect(mockSyntaxHighlighterDocumentManagerFactory.create).toHaveBeenCalledWith(mockJsDomDocument,mockMinifier,mockAssetLoader);
            })
        });
        describe('should add syntaxhighlighter scripts',()=>{
            const syntaxHighlighterDocumentManagerTestOptions:Array<{useMinifiedSyntaxHighlighter?:boolean}&ExpectedBoolTest>=[
                {
                    description:"Default",
                    expected:true
                },
                {
                    description:"Explicit",
                    expected:false,
                    useMinifiedSyntaxHighlighter:false
                }
            ];
            syntaxHighlighterDocumentManagerTestOptions.forEach(testOption=>{
                it('should add syntaxhighlighter scripts',done=>{
                    let syntaxHighlighterOptions:SyntaxHighlighterOptions={};
                    if(testOption.useMinifiedSyntaxHighlighter!==undefined){
                        syntaxHighlighterOptions={useMinifiedSyntaxHighlighter:testOption.useMinifiedSyntaxHighlighter};
                    }
                    pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),getMockBufferFile() as any,(_)=>{
                        expect(mockSyntaxHighlighterDocumentManager.addSyntaxHighlighterScripts).toHaveBeenCalledWith(testOption.expected);
                    })
                })
            })
        })
        describe('css themes',()=>{
            describe('custom theme or named theme',()=>{
                it('should add custom theme if in options and not add named theme',(done)=>{
                    var syntaxHighlighterOptions:SyntaxHighlighterOptions={
                        customTheme:"Custom theme css",
                        theme:"Name"
                    }
                    pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),getMockBufferFile() as any,(_)=>{
                        expect(mockSyntaxHighlighterDocumentManager.addCustomTheme).toHaveBeenCalledWith(syntaxHighlighterOptions.customTheme);
                        expect(mockSyntaxHighlighterDocumentManager.addNamedTheme).not.toHaveBeenCalled();
                    })
                });
                describe('should add named theme if no custom theme',()=>{
                    const themeNameTestOptions:Array<TExpectedTest<string>>=[
                        {description:"Default",expected:"Default"},
                        {description:"Options",expected:"FromOptions"}
                    ];
                    themeNameTestOptions.forEach(testOption=>{
                        it(testOption.description,(done)=>{
                            var syntaxHighlighterOptions:SyntaxHighlighterOptions={};
                            if(testOption.description==="Options"){
                                syntaxHighlighterOptions.theme=testOption.expected
                            }

                            pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),getMockBufferFile() as any,(_)=>{
                                expect(mockSyntaxHighlighterDocumentManager.addCustomTheme).not.toHaveBeenCalled();
                                expect(mockSyntaxHighlighterDocumentManager.addNamedTheme).toHaveBeenCalledWith(testOption.expected);
                            })
                        })
                    })
                });
                
            })
            describe('additional css',()=>{
                [true,false].forEach(should=>{
                    it(should?"should if in options":"should not if not in options",done=>{
                        const syntaxHighlighterOptions:SyntaxHighlighterOptions={};
                        if(should){
                            syntaxHighlighterOptions.additionalCss="some additional css";
                        }
                        pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),getMockBufferFile() as any,(_)=>{
                            const addAdditionalCssExpect=expect(mockSyntaxHighlighterDocumentManager.addAdditionalCss);
                            if(should){
                                addAdditionalCssExpect.toHaveBeenCalledWith(syntaxHighlighterOptions.additionalCss);
                            }else{
                                addAdditionalCssExpect.not.toHaveBeenCalled();
                            }
                            
                        })
                    })
                });
            })
        })
        describe('should apply syntax highlighter with config ( which defaults ) and SyntaxHighlighterGlobalParamsNoToolbar ',()=>{
            interface ApplySyntaxHighlighterTestOption{
                config?:SyntaxHighlighterOptions["config"],
                expectedConfig:SyntaxHighlighterOptions["config"],
                globalParams?:SyntaxHighlighterOptions["globalParams"],
                expectedGlobalParams:SyntaxHighlighterGlobalParamsNoToolbar,
                description:string
            }
            const applySyntaxHighlighterTestOptions:Array<ApplySyntaxHighlighterTestOption>=[
                {description:"Defaults",expectedConfig:{},expectedGlobalParams:{toolbar:false}},
                {
                    description:"From options",
                    config:{bloggerMode:true},
                    expectedConfig:{bloggerMode:true},
                    globalParams:{gutter:true},
                    expectedGlobalParams:{gutter:true,toolbar:false}
                }
            ]
            
            applySyntaxHighlighterTestOptions.forEach(testOption=>{
                it(testOption.description,done=>{
                    
                    pluginTestEnsureNoError(done,
                        getTransform({
                            globalParams:testOption.globalParams,
                            config:testOption.config
                        }),
                        getMockBufferFile() as any,
                        (_)=>{
                            const args=mockSyntaxHighlighterDocumentManager.applySyntaxHighlighter.mock.calls[0] as any[];
                            const globalParamsArg=args[0];
                            const configArg=args[1];
                            expect(globalParamsArg).toEqual(testOption.expectedGlobalParams);
                            expect(configArg).toEqual(testOption.expectedConfig);
                        })
                })
            });
            
        });
        
    })
    describe('isPartial',()=>{
        it('should be called with the html and the file',(done)=>{
            var syntaxHighlighterOptions:SyntaxHighlighterOptions={
                isPartialFn:jest.fn()
            }
            var file=getMockBufferFile() as any;
            pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),file,(_)=>{
                expect(syntaxHighlighterOptions.isPartialFn).toHaveBeenCalledWith(mockBufferContents,file);
            })
        })
        describe('default isPartial',()=>{

        })
    })
    describe('jsDomDocument',()=>{
        it('should be created from the factory with the Buffer contents',(done)=>{
            pluginTestEnsureNoError(done,getTransform(),getMockBufferFile() as any,(_)=>{
                expect(mockJsDomDocumentFactory.create).toHaveBeenCalledWith(mockBufferContents);
            })
        })
        describe('should provide the contents for the transformed file',()=>{
            describe('should determine contents based upon isPartial',()=>{
                const getNewContentsTestOptions:Array<ExpectedBoolTest>=[
                    {description:"Is partial",expected:true},
                    {description:"Is not partial",expected:false},
                ]
                getNewContentsTestOptions.forEach(testOption=>{
                    it(testOption.description,(done)=>{ 
                        const syntaxHighlighterOptions:SyntaxHighlighterOptions={
                            isPartialFn:function(){
                                return testOption.expected
                            }
                        }
                    
                        pluginTestEnsureNoError(done,getTransform(syntaxHighlighterOptions),getMockBufferFile() as any,(_)=>{
                            expect(mockJsDomDocument.getNewContents).toHaveBeenCalledWith(testOption.expected);
                        })
                    })
                });
                
            })
            it('should',done=>{
                pluginTestEnsureNoError(done,getTransform(),getMockBufferFile() as any,(files)=>{
                    expect(files.length).toBe(1);
                    expect((files[0].contents as Buffer).toString("utf8")).toBe(theNewContents);
                })
            })
        })
    })
    

})