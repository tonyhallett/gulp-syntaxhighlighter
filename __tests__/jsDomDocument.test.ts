import {JsDomDocument} from '../gulp-syntaxhighlighter/jsDomDocument'
import {JSDOM} from 'jsdom'

interface MockElement{
    _type:"script"|"style"
}
interface MockScriptElement extends MockElement{
    _type:"script";
    textContent:string;
    className?:string;
}
interface MockStyleElement {
    innerHTML:string
    _type:"style"
}

const mockCreateElement=jest.fn((elementType:string):MockElement=>{
    switch(elementType){
        case "script":
            return  {_type:"script"};
        case "style":
            return  {_type:"style"};
        default:
            throw new Error("Unexpected element type");
    }
});
const mockBodyAppendChild=jest.fn()
const mockHeadAppendChild=jest.fn()

jest.mock('jsdom',()=>{
    return {
        JSDOM:jest.fn().mockImplementation(() => {
            return {
                window:{
                    document:{
                        docType:{

                        },
                        documentElement:{
                            outerHTML:"Blah RemoveThis Blah RemoveThat"
                        },
                        getElementsByClassName:function(className:string){
                            if(className==="__syntaxHighlighterScript"){
                                return [
                                    {outerHTML:"RemoveThis"},
                                    {outerHTML:"RemoveThat"}
                                ]
                            }
                        },


                        createElement:mockCreateElement,
                        
                        body:{
                            appendChild:mockBodyAppendChild,
                            outerHTML:"Yeah RemoveThis Yeah RemoveThat",
                        },
                        head:{
                            appendChild:mockHeadAppendChild,
                            innerHTML:"headInnerHtml"
                        }
                    }
                }
            };
        })
    }

})

describe('JsDomDocument',()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    })
    describe('constructor',()=>{
        it('should construct JSDOM with the html and run scripts dangerously',()=>{
            new JsDomDocument("html");
            const instance=(JSDOM as any).mock.instances[0];
            expect(instance).not.toBeFalsy();
            const ctorArgs=(JSDOM as any).mock.calls[0];
            expect(ctorArgs[0]).toEqual("html");
            expect(ctorArgs[1].runScripts).toEqual("dangerously");
        })
    })
    describe('addSyntaxHighlighterScript',()=>{
        it('should append script element to body with a class identifier for later removal',()=>{
            const jsDomDocument=new JsDomDocument("");
            jsDomDocument.addSyntaxHighlighterScript("syntaxHighlighterContents");
            const highlighterScriptElement:MockScriptElement=mockBodyAppendChild.mock.calls[0][0];
            expect(highlighterScriptElement._type).toEqual("script")
            expect(highlighterScriptElement.textContent).toEqual('syntaxHighlighterContents');
            expect(highlighterScriptElement.className!).toEqual('__syntaxHighlighterScript');
        })
    })
    describe('addToggleScript',()=>{
        it('should append script element to body without the removal class identifier',()=>{
            const jsDomDocument=new JsDomDocument("");
            jsDomDocument.addToggleScript("toggleScript");
            const toggleScriptElement:MockScriptElement=mockBodyAppendChild.mock.calls[0][0];
            expect(toggleScriptElement._type).toEqual("script");
            expect(toggleScriptElement.textContent).toEqual('toggleScript');
            expect(toggleScriptElement.className).toBeUndefined();
        })
    })
    describe('addCss',()=>{
        it('should append style element to head',()=>{
            const jsDomDocument=new JsDomDocument("");
            jsDomDocument.addCss("some css");
            const styleElement:MockStyleElement=mockHeadAppendChild.mock.calls[0][0];
            expect(styleElement._type).toEqual("style");
            expect(styleElement.innerHTML).toEqual("some css");
        })
    })
    //this will be difficult
    describe('getNewContents',()=>{
        describe('partial',()=>{
            it('should return head inner html and body without syntaxhighlighter scripts',()=>{
                const jsDomDocument=new JsDomDocument("");
                expect(jsDomDocument.getNewContents(true)).toBe("headInnerHtmlYeah  Yeah ");
            })
        });
        describe("full",()=>{

        })
    })
})