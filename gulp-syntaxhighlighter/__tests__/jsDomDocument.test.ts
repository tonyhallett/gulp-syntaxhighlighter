import {JsDomDocument} from '../src/jsDomDocument'
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
const mockEval = jest.fn();
const mockDocument={
    documentElement:{
        outerHTML:"DocumentElement_OuterHTML"
    },
    


    createElement:mockCreateElement,
    
    body:{
        appendChild:mockBodyAppendChild,
        outerHTML:"Body_OuterHTML",
    },
    head:{
        appendChild:mockHeadAppendChild,
        innerHTML:"Head_InnerHTML"
    }
}
jest.mock('jsdom',()=>{
    return {
        JSDOM:jest.fn().mockImplementation(() => {
            return {
                window:{
                    document:mockDocument,
                    eval:mockEval
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
        it('should construct JSDOM with the html and run scripts outside-only',()=>{
            new JsDomDocument("html");
            const instance=(JSDOM as any).mock.instances[0];
            expect(instance).not.toBeFalsy();
            const ctorArgs=(JSDOM as any).mock.calls[0];
            expect(ctorArgs[0]).toEqual("html");
            expect(ctorArgs[1].runScripts).toEqual("outside-only");
        })
    })
    describe('executeSyntaxHighlighter',()=>{
        it('should eval joined args of calls to addSyntaxHighlighterScript and executeSyntaxHighlighter',()=>{
            const jsDomDocument=new JsDomDocument("");
            const script1="script1";
            const script2="script2";
            const executeScript="execute";
            jsDomDocument.addSyntaxHighlighterScript(script1);
            jsDomDocument.addSyntaxHighlighterScript(script2);
            jsDomDocument.executeSyntaxHighlighter(executeScript);
            
            expect(mockEval).toHaveBeenCalledWith("script1script2execute");
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
    describe('getNewContents',()=>{
        describe('partial',()=>{
            it('should return head inner html and body outer html',()=>{
                const jsDomDocument=new JsDomDocument("");
                expect(jsDomDocument.getNewContents(true)).toBe("Head_InnerHTMLBody_OuterHTML");
            })
        });
        describe('full',()=>{
            [{
                doctype:{
                    name:'nodename',
                    publicId:"publicId",
                },
                description:'publicId',
                expected:"<!DOCTYPE nodename PUBLIC \"publicId\">DocumentElement_OuterHTML"
            },
            {
                doctype:{
                    name:'nodename',
                    systemId:"systemId"
                },
                description:'systemId',
                expected:"<!DOCTYPE nodename SYSTEM \"systemId\">DocumentElement_OuterHTML"
            }].forEach(test=>{
                it(`should return the doctype and the document element outer html - ${test.description}`,()=>{
                    (mockDocument as any).doctype=test.doctype;
                    const jsDomDocument=new JsDomDocument("");
                    expect(jsDomDocument.getNewContents(false)).toBe(test.expected);
                    })
                
            })
            
        })
    })
})