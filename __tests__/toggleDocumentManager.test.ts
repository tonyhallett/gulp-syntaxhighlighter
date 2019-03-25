import {ToggleDocumentManager} from '../gulp-syntaxhighlighter/toggleDocumentManager'
import { IToggleConfig, IClassNames } from '../gulp-syntaxhighlighter/publicInterfaces';
import {expectedContainingDirectory} from '../__tests__helpers/dirnameHelper';

jest.mock('path',()=>{
    return {
        join:jest.fn((dir:string,togglejs:string)=>{
            expect(dir).toBe(expectedContainingDirectory);
            return togglejs;
        })
    }
})
jest.mock('fs',()=>{
    return {
        readFileSync:jest.fn((path:string)=>{
            if(path==="toggle/toggle.js"){
                return "togglejs"
            }
        })
    }
})

const spiedStringify=jest.fn().mockReturnValue("ToggleConfigStr");
JSON["stringify"]=spiedStringify;

describe('ToggleDocumentManager addToggle',()=>{
    type ToggleTestOption<T={}> = IToggleConfig&{description:string}&T
    const mockJsDomDocument={
        addToggleScript:jest.fn(),
        addCss:jest.fn()
    };
    const mockMinifier={
        minifyCss:jest.fn().mockReturnValue("minified css"),
        minifyScript:jest.fn().mockReturnValue("minified js")
    };
    beforeEach(()=>{
        jest.clearAllMocks();
    })
    describe('css',()=>{
        type ToggleCssTestOption = ToggleTestOption<{expectedMinifiedCss:string}>
        function getDefaultCssTestOption():ToggleCssTestOption{
            const forDefaultCss=new ToggleDocumentManager(null as any,null as any);
            const classNames:IClassNames={
                toggle:"ToggleClass",
                toggleText:"ToggleTextClass"
            };
            const expectedDefaultCss=(forDefaultCss as any).getDefaultToggleCss(classNames);
            return {
                classNames:classNames,
                expectedMinifiedCss:expectedDefaultCss,
                description:"Default css"
            }
        }
        
        const cssToggleTestOptions:Array<ToggleCssTestOption>=[
            {
                customCss:"Some custom css",
                expectedMinifiedCss:"Some custom css",
                description:"Css from options"
            },getDefaultCssTestOption()
            
        ];
        cssToggleTestOptions.forEach(option=>{
            it(`should add minified ${option.description} to the jsDocument`,()=>{
                
                const toggleDocumentManager=new ToggleDocumentManager(mockJsDomDocument as any,mockMinifier as any);
                const  {expectedMinifiedCss,description,...toggleConfig}=option;
                toggleDocumentManager.addToggle(toggleConfig);
                expect(mockJsDomDocument.addCss).toHaveBeenCalledWith("minified css");
                expect(mockMinifier.minifyCss).toHaveBeenCalledWith(option.expectedMinifiedCss);
            })
        })
    })
    describe('js',()=>{
        type ToggleJsTestOption=ToggleTestOption<{expectedCreateToggleFn:string,expectedToggleConfig:ToggleConfig}>
        function getJsOptionForDefaultCreateToggleFn():ToggleJsTestOption{
            const forDefaultJs=new ToggleDocumentManager(null as any,null as any) as any;
            const defaultToggleFn=forDefaultJs.defaultCreateToggleFn();
            return {
                expectedCreateToggleFn:defaultToggleFn,
                description:"Default toggle function",
                expectedToggleConfig:{
                    classNames:{
                        toggleContainer: "toggleContainer",
                        toggleText: "toggleText",
                        toggle: "toggle",
                        hideToggle: "hideToggle",
                        showToggle: "showToggle",
                        isShowing: "isShowing"
                    },
                    messages:{
                        hideMessage: "",
                        showMessage: "",
                        message: "",
                        prefix: "",
                        prefixHide: "",
                        prefixShow: "",
                        useTitle: false,
                        when: "Never",
                        placement: "Right"
                    }
                }

            }
        }
        const jsToggleTestOptions:Array<ToggleJsTestOption>=[
            {
                createToggleFn:"MyCreateToggleFn",
                expectedCreateToggleFn:"MyCreateToggleFn",
                description:"With createToggleFn and no ToggleConfig",
                expectedToggleConfig:{
                    classNames:{
                        toggleContainer: "toggleContainer",
                        toggleText: "toggleText",
                        toggle: "toggle",
                        hideToggle: "hideToggle",
                        showToggle: "showToggle",
                        isShowing: "isShowing"
                    },
                    messages:{
                        hideMessage: "",
                        showMessage: "",
                        message: "",
                        prefix: "",
                        prefixHide: "",
                        prefixShow: "",
                        useTitle: false,
                        when: "Never",
                        placement: "Right"
                    }
                }

            },
            getJsOptionForDefaultCreateToggleFn(),
            {
                createToggleFn:"MyCreateToggleFn",
                expectedCreateToggleFn:"MyCreateToggleFn",
                description:"Does not override provided config",
                toggleState:"Hide",
                classNames:{
                    toggleContainer:"MyToggleContainer"
                },
                messages:{
                    hideMessage:"MyHideMessage"
                },
                expectedToggleConfig:{
                    toggleState:"Hide",
                    classNames:{
                        toggleContainer: "MyToggleContainer",
                        toggleText: "toggleText",
                        toggle: "toggle",
                        hideToggle: "hideToggle",
                        showToggle: "showToggle",
                        isShowing: "isShowing"
                    },
                    messages:{
                        hideMessage: "MyHideMessage",
                        showMessage: "",
                        message: "",
                        prefix: "",
                        prefixHide: "",
                        prefixShow: "",
                        useTitle: false,
                        when: "Never",
                        placement: "Right"
                    }
                }

            },
        ]
        jsToggleTestOptions.forEach(option=>{
            it('should add minified js to the jsDomDocument',()=>{
                const toggleDocumentManager=new ToggleDocumentManager(mockJsDomDocument as any,mockMinifier as any);
                const  {expectedCreateToggleFn,expectedToggleConfig,description, ...toggleConfig}=option;
                toggleDocumentManager.addToggle(toggleConfig);
                expect(mockJsDomDocument.addToggleScript).toHaveBeenCalledWith("minified js");
                const expectedScriptToMinifier=(toggleDocumentManager as any).wrapInIEF(option.expectedCreateToggleFn,"togglejs","setUpToggle(ToggleConfigStr);");
                expect(mockMinifier.minifyScript).toHaveBeenCalledWith(expectedScriptToMinifier);
                expect(spiedStringify).toHaveBeenCalledWith(option.expectedToggleConfig);
            })
        })
    })
    
    
    
})