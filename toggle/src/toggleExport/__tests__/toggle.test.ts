///<reference path="../../toggleDefns.d.ts"/>
import {createToggle,getHideShowMessagesWhen,getSyntaxHighlighterElements,getToggleState,setUpToggle} from '../toggleExport'

interface ITestSyntaxHighlighterElement{
    children:[{caption?:{textContent:string|null}}],
    getAttribute(dataToggleMessage:string):string|null
}
type DataToggleMessageAttribute=[string,string]
type DataToggleMessageAttributes=Array<DataToggleMessageAttribute>
class TestSyntaxHighlighterElement implements ITestSyntaxHighlighterElement{
    constructor(private readonly dataToggleMessageAttributes?:DataToggleMessageAttributes,caption?:string){
        if(caption){
            if(caption===TestSyntaxHighlighterElement.nullTextContent){
                this.children=[{caption:{textContent:null}}];
            }else{
                this.children=[{caption:{textContent:caption}}];
            }
        }else{
            this.children=[{}];
        }
    }
    getAttribute(dataToggleMessage: string): string|null {
        if(this.dataToggleMessageAttributes){
            for(var i=0;i<this.dataToggleMessageAttributes.length;i++){
                var dataToggleMessageAttribute=this.dataToggleMessageAttributes[i];
                if(dataToggleMessage==="data-toggle"+dataToggleMessageAttribute[0]){
                    return dataToggleMessageAttribute[1];
                }
            }
        }
        return null;
    }
    children: [{ caption?: {textContent:string|null }}];        
    
    static create(dataToggleMessageAttributes?:DataToggleMessageAttributes,caption?:string){
        return new TestSyntaxHighlighterElement(dataToggleMessageAttributes,caption) as any;
    }
    static nullTextContent="NULLTEXTCONTENT";

}



let getSyntaxHighlighterElementsMock=function(className:string){
    return [className];
}


let documentCreateElementMock:Function;
const mockCreateToggleElement=jest.fn();

const originalDoc=window.document;

enum SingleToggleType{ delay,div,svg}

Object.defineProperty(window, 'document', {
    value:{
        getElementsByClassName:function(className:string){
            return getSyntaxHighlighterElementsMock(className);
        },
        addEventListener:()=>{},
        createElement:(el:string)=>{
            return documentCreateElementMock(el);
        }
    }
});
Object.defineProperty(window, 'createToggleElement', {
    value:mockCreateToggleElement
    }
);

describe('toggle',()=>{
    describe('getToggleState',()=>{
        interface DataToggleStateTestOption{
            dataToggleState:DataToggleState,
            configToggleState:ToggleConfig["toggleState"],
            expected:DataToggleState
        }
        it.each<DataToggleStateTestOption>([
            {dataToggleState:"Show",expected:"Show",configToggleState:"Hide"},
            {dataToggleState:"Hide",expected:"Hide",configToggleState:"Show"},
            {dataToggleState:"Never",expected:"Never",configToggleState:"Hide"}
        ])('should come from data-toggleState if present',({dataToggleState,expected,configToggleState})=>{
            const config:Partial<ToggleConfig>={
                toggleState:configToggleState,
            };
            expect(getToggleState(TestSyntaxHighlighterElement.create([["State",dataToggleState]]),config as any)).toBe(expected);        
        })
        interface ConfigToggleStateTestOption{
            configToggleState:ToggleConfig["toggleState"],
            expected:DataToggleState
        }
        it.each<ConfigToggleStateTestOption>([
            {configToggleState:"Hide",expected:"Hide"},
            {configToggleState:"Show",expected:"Show"},
        ])
        ('should come from config if no data-toggleState',({configToggleState,expected})=>{
            const config:Partial<ToggleConfig>={
                toggleState:configToggleState
            };
            expect(getToggleState(TestSyntaxHighlighterElement.create(),config as any)).toBe(expected);  
        })
        it('should default to Never if not in config or data-toggleState',()=>{
            expect(getToggleState(TestSyntaxHighlighterElement.create(),{} as any)).toBe("Never");  
        })
    })
    describe('getSyntaxHighlighterElements',()=>{
        it('should return getElementsByClassName with class name syntaxhighlighter',()=>{
            const shElements=getSyntaxHighlighterElements();
            expect(shElements.length).toBe(1);
            expect(shElements[0]).toBe("syntaxhighlighter");
        })
    })
    describe('getHideShowMessages',()=>{
        function createDefaultToggleConfigMessages():ToggleConfigMessages{
            return {
                hideMessage:"",
                message:"",
                placement:"Below",
                prefix:"",
                prefixHide:"",
                prefixShow:"",
                showMessage:"",
                useTitle:false,
                when:"Always"
            }
        }
        describe('when',()=>{
            type AllWhens=[WhenAlways,WhenHidden,WhenNever]
            const whens:AllWhens=["Always","Hidden","Never"];
            it.each(whens)
            ('should come from the config if not overridden by data-toggleWhen - %p',(when)=>{
                const messages=createDefaultToggleConfigMessages();
                messages.when=when;
                expect(getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),messages).when).toEqual(when);
            })
            
            function getCombinations(){
                const whenOtherWhensCombinations=whens.map(when=>{
                    var otherWhens = whens.filter(w2=>w2!==when)
                    return {when,otherWhens};
                });
                const combinations:Array<[When,When]>=[];
                whenOtherWhensCombinations.forEach(whenOtherWhens=>{
                    whenOtherWhens.otherWhens.forEach(otherWhen=>{
                        combinations.push([whenOtherWhens.when,otherWhen]);
                    })
                })
                return combinations;
            }
            
            it.each(getCombinations())
            ('should come from the data-toggleWhen when present - %p %p',(configWhen,dataToggleWhen)=>{
                const messages=createDefaultToggleConfigMessages();
                messages.when=configWhen;
                expect(getHideShowMessagesWhen(TestSyntaxHighlighterElement.create([["when",dataToggleWhen]]),messages).when).toEqual(dataToggleWhen);
            })
    
        })
        describe('hide show messages',()=>{
            describe('when comes from config',()=>{
                describe('unprefixed',()=>{
                    const options=(function (){
                        interface UseTitleTestOption{
                            showOrHiddenMessage:keyof HideShowMessages,
                            caption:string|undefined,
                            expectedMessage:string,
                            testName:string
    
                        }
                        function createShowOrHiddenOptions(caption:string|undefined,expectedMessage:string,testName:string):[UseTitleTestOption,UseTitleTestOption]{
                            return [
                                {caption:caption,expectedMessage:expectedMessage,showOrHiddenMessage:"hiddenMessage",testName:testName},
                                {caption:caption,expectedMessage:expectedMessage,showOrHiddenMessage:"showMessage",testName:testName}
                            ]
                        }
                        return createShowOrHiddenOptions("A caption","A caption","Caption with text content").concat(
                            createShowOrHiddenOptions(undefined,"","No caption"),
                            createShowOrHiddenOptions(TestSyntaxHighlighterElement.nullTextContent,"","Caption with null text content"),
                        )
                    })();
                    //todo look at the jest source as the formatting is not good enough when you are 
                    //having to use an object ( for typing in the callback ) 
                    //instead of array and do not want all properties in the test name
                    //workaround is to use describe ( as have done here )
                    //so that can use the object properties in template literal
                    describe.each(options)
                    ('use title should use the highlighter caption',({showOrHiddenMessage,caption,expectedMessage,testName})=>{
                        it(`${showOrHiddenMessage} - ${testName}`,()=>{
                            const configMessage=createDefaultToggleConfigMessages();
                            configMessage.useTitle=true;
                            const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(undefined,caption),configMessage);
                            expect(hideShowMessages[showOrHiddenMessage]).toBe(expectedMessage);
                        })
                        
                    });
                    
                    describe('do not use title',()=>{
                        describe('show message',()=>{
                            it('should come from showMessage if not empty',()=>{
                                const configMessage=createDefaultToggleConfigMessages();
                                configMessage.showMessage="Show message";
                                configMessage.message="This will not be used";
                                const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                                expect(hideShowMessages.showMessage).toBe("Show message");
                            })
                            it('should come from message if showMessage empty',()=>{
                                const configMessage=createDefaultToggleConfigMessages();
                                configMessage.message="From message";
                                const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                                expect(hideShowMessages.showMessage).toBe("From message");
                            })
                        });
                        describe('hide message',()=>{
                            it('should come from showMessage if not empty',()=>{
                                const configMessage=createDefaultToggleConfigMessages();
                                configMessage.hideMessage="Hide message";
                                configMessage.message="This will not be used";
                                const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                                expect(hideShowMessages.hiddenMessage).toBe("Hide message");
                            })
                            it('should come from message if showMessage empty',()=>{
                                const configMessage=createDefaultToggleConfigMessages();
                                configMessage.message="From message";
                                const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                                expect(hideShowMessages.hiddenMessage).toBe("From message");
                            })
                        })
                    })
                })
                describe('prefixed',()=>{
                    describe('show message',()=>{
                        it('should prefix from prefixShow if not empty',()=>{
                            const configMessage=createDefaultToggleConfigMessages();
                            configMessage.showMessage="Show message";
                            configMessage.prefixShow="Prefix "
                            configMessage.prefix="This will not be used";
                            const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                            expect(hideShowMessages.showMessage).toBe("Prefix Show message")
                        })
                        it('should prefix from prefix if prefixShow empty',()=>{
                            const configMessage=createDefaultToggleConfigMessages();
                            configMessage.showMessage="Show message";
                            configMessage.prefix="Prefix from prefix ";
                            const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                            expect(hideShowMessages.showMessage).toBe("Prefix from prefix Show message")
                        })
                    })
                    describe('hidden message',()=>{
                        it('should prefix from prefixHide if not empty',()=>{
                            const configMessage=createDefaultToggleConfigMessages();
                            configMessage.hideMessage="Hide message";
                            configMessage.prefixHide="Prefix "
                            configMessage.prefix="This will not be used";
                            const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                            expect(hideShowMessages.hiddenMessage).toBe("Prefix Hide message")
                        })
                        it('should prefix from prefix if prefixShow empty',()=>{
                            const configMessage=createDefaultToggleConfigMessages();
                            configMessage.hideMessage="Hide message";
                            configMessage.prefix="Prefix from prefix ";
                            const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create(),configMessage);
                            expect(hideShowMessages.hiddenMessage).toBe("Prefix from prefix Hide message")
                        })
                    })
                })
            })
            it('is overridden by data-toggle',()=>{
                const configMessage=createDefaultToggleConfigMessages();
                configMessage.showMessage="Show message";
                configMessage.message="This will not be used";
                const dataToggleShowMessage="data-toggle show message";
                const hideShowMessages=getHideShowMessagesWhen(TestSyntaxHighlighterElement.create([["showMessage",dataToggleShowMessage]]),configMessage);
                expect(hideShowMessages.showMessage).toBe(dataToggleShowMessage);
            })
        })
        
        
    })
    describe('setUpToggle',()=>{
        it('should add addToggleFunctionality to all syntax highlighter elements that toggle',()=>{
            const config={
                messages:{
                    placement:"To the left"
                },
                classNames:"Classnames"
            };
           interface MockSyntaxHighlighterElement{
                toggleState:DataToggleState,
                messages?:HideShowMessagesWhen
           }
           const mockSyntaxHighlighterElementNever:MockSyntaxHighlighterElement={
               toggleState:"Never"
           }
           const mockSyntaxHighlighterElementShow:MockSyntaxHighlighterElement={
                toggleState:"Show",
                messages:{
                    hiddenMessage:"ShowHidden",
                    showMessage:"ShowShow",
                    when:"Hidden"
                }
            }
            const mockSyntaxHighlighterElementHide:MockSyntaxHighlighterElement={
                toggleState:"Hide",
                messages:{
                    hiddenMessage:"HideHidden",
                    showMessage:"HideShow",
                    when:"Always"
                }
            }
           
           const mockSyntaxHighlighterElementFinder=function(){
                return [mockSyntaxHighlighterElementNever,mockSyntaxHighlighterElementShow,mockSyntaxHighlighterElementHide];
           }
           const mockDetermineToggleState=function(syntaxHighlighter:MockSyntaxHighlighterElement){
               return syntaxHighlighter.toggleState;
           }
           const mockDetermineMessages=function(syntaxHighlighter:MockSyntaxHighlighterElement){
                return syntaxHighlighter.messages
           }
           const mockAddToggleFunctionality=jest.fn();
           
           setUpToggle(config as any,mockDetermineToggleState as any,mockDetermineMessages as any,mockAddToggleFunctionality,mockSyntaxHighlighterElementFinder as any);
           expect(mockAddToggleFunctionality.mock.calls.length).toEqual(2);
    
            const firstCall=mockAddToggleFunctionality.mock.calls[0];
            const secondCall=mockAddToggleFunctionality.mock.calls[1]
            function expectAddToggleFunctionalityCall(call:any,mockSyntaxHighlighterElement:MockSyntaxHighlighterElement,hide:boolean){
                expect(call[0]).toBe(mockSyntaxHighlighterElement);
                expect(call[1]).toBe(hide);
                const {when,...hideShowMesssages}=mockSyntaxHighlighterElement.messages!;
                expect(call[2]).toEqual(hideShowMesssages);
                expect(call[3]).toEqual(when);
                expect(call[4]).toEqual("To the left");
                expect(call[5]).toEqual("Classnames");
            }
            expectAddToggleFunctionalityCall(firstCall,mockSyntaxHighlighterElementShow,false);
            expectAddToggleFunctionalityCall(secondCall,mockSyntaxHighlighterElementHide,true);
        })
        it('uses default function dependencies',()=>{
            getSyntaxHighlighterElementsMock=()=>[];
            setUpToggle({
                classNames:{
                    hideToggle:"",
                    showToggle:"",
                    toggle:"",
                    toggleContainer:"",
                    toggleContainerHidden:"",
                    toggleContainerShown:"",
                    toggleText:"",
                    toggleContainerToggled:"",
                    toggleContainerInitial:""
                },
                toggleState:"Hide",
                messages:{
                    hideMessage:"",
                    message:"",
                    placement:"Below",
                    prefix:"",
                    prefixHide:"",
                    prefixShow:"",
                    showMessage:"",
                    useTitle:false,
                    when:"Never"
                }
            })
        })
    })
    describe('createToggle',()=>{
        let createEventListenerToggle=true;
        let createBothToggles=true;
        let singleToggleType:SingleToggleType
        const mockToggleContainer={
            appendChild:jest.fn(),
            replaceChild:jest.fn(),
            removeChild:jest.fn(),
            className:""
        }
        const mockTextElement={
            isDiv:false,
            className:"",
            innerHTML:"",
        }
        const mockTextElement2={
            isDiv:false,
            className:"",
            innerHTML:"",
        }
        beforeEach(()=>{
            jest.clearAllMocks();
            let callCount=0;
            documentCreateElementMock=jest.fn((elType:string)=>{
                let element:any;
                switch(callCount){
                    case 0:
                        element = mockToggleContainer
                        break;
                    case 1:
                        mockTextElement.isDiv=elType=="div";
                        element = mockTextElement;
                        break;
                    case 2:
                        mockTextElement2.isDiv=elType=="div";
                        element = mockTextElement2;
                        break;
                }
                callCount++;
                return element;
            })
            mockToggleContainer.className="";
            highlighterElement.className="";
            createBothToggles=true;
            singleToggleType=SingleToggleType.delay;
            createEventListenerToggle=true;
        })
        
        const mockAddContainerBeforeHighlighter=jest.fn();
        const highlighterElement={
            parentNode:{
                insertBefore:mockAddContainerBeforeHighlighter
            },
            className:""
        }
        function createClassNames(...classNameValues:Array<[keyof ClassNames,string]>):Partial<ClassNames>{
            const classNames:Partial<ClassNames>={

            }
            classNameValues.forEach(cnv=>{
                classNames[cnv[0]]=cnv[1];
            })
            return classNames;
        }
        //#region mock toggles
        let toggleShowClickHandler:Function;
        const toggleShow={
            isToggleShow:true,
            addEventListener:jest.fn((_:string,clickHandler:Function)=>{
                toggleShowClickHandler=clickHandler;
            }),
            getAttribute:jest.fn(),
            setAttribute:jest.fn()
        }
        let toggleHideClickHandler:Function;
        const toggleHide={
            isToggleShow:false,
            addEventListener:jest.fn((_:string,clickHandler:Function)=>{
                toggleHideClickHandler=clickHandler;
            }),
            getAttribute:jest.fn(),
            setAttribute:jest.fn()
        }
        const toggleShowAttachEvent={
            attachEvent:jest.fn(),
            getAttribute:jest.fn(),
            setAttribute:jest.fn()
        }
        const toggleHideAttachEvent={
            attachEvent:jest.fn(),
            getAttribute:jest.fn(),
            setAttribute:jest.fn()
        }
        const toggleSingle=toggleShow;
        function  toggleSingleClick(){
            toggleShowClickHandler();
        }
        const toggleSingleDelay=123;

        const realDivToggle=originalDoc.createElement("div");
        realDivToggle.setAttribute=jest.fn();
        const realSVGToggle=originalDoc.createElement("svg");
        realSVGToggle.setAttribute=jest.fn()

        mockCreateToggleElement.mockImplementation(()=>{
            if(createBothToggles){
                if(createEventListenerToggle){
                    return {
                        hideToggle:toggleHide,
                        showToggle:toggleShow
                    }
                }else{
                    return {
                        hideToggle:toggleHideAttachEvent,
                        showToggle:toggleShowAttachEvent
                    }
                }
            }else{
                switch(singleToggleType){
                    case SingleToggleType.delay:
                        return {
                            delay:toggleSingleDelay,
                            toggleElement:toggleSingle
                        }
                    case SingleToggleType.div:
                        return realDivToggle;
                    case SingleToggleType.svg:
                        return realSVGToggle;
                }
                
            }
            
        })
        //#endregion
        describe('initial setup',()=>{
            
            describe('toggle elements',()=>{
                it('should create single or show toggle and hide toggle by calling createToggleElement',()=>{
                    createToggle(highlighterElement as any,false,{} as any,"Never","Below",{} as any);
                    expect(mockCreateToggleElement).toHaveBeenCalled();
                })
                describe('adding click handler',()=>{
                    function expectClickHandler(mockToggle:any){
                        expect(mockToggle.addEventListener).toHaveBeenCalledWith("click",expect.any(Function),false);
                    }
                    describe('to show toggle and hide toggle',()=>{
                        
                        it('should addEventListener for click to both if present',()=>{
                            createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                            expectClickHandler(toggleHide);
                            expectClickHandler(toggleShow);
                        })
                        it('should attachEvent for click to both if present',()=>{
                            createEventListenerToggle=false;
                            createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                            expect(toggleShowAttachEvent.attachEvent).toHaveBeenCalledWith("onclick",expect.any(Function));
                            expect(toggleHideAttachEvent.attachEvent).toHaveBeenCalledWith("onclick",expect.any(Function));
                        })
                    })
                    describe('single',()=>{
                        it('should add click event listener',()=>{
                            createBothToggles=false;
                            createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                            expectClickHandler(toggleSingle);
                        })
                    })
                    
                    
                })
                describe('toggle class names',()=>{
                    describe('toggle class name',()=>{
                        it.each([["original","original toggleClassName"],["","toggleClassName"]])
                        ('should add the toggle class name to existing for both',(original,expected)=>{
                            toggleShow.getAttribute.mockReturnValue(original);
                            toggleHide.getAttribute.mockReturnValue(original);
                            createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["toggle","toggleClassName"]) as any);
                            function expectToggleClassName(mockToggle:any){
                                
                                expect(mockToggle.setAttribute).toHaveBeenCalledWith('class',expected);
                            }
                            expectToggleClassName(toggleShow);
                            expectToggleClassName(toggleHide);
            
                        })
                        it.each([["original","original toggleClassName"],["","toggleClassName"]])
                        ('should add the toggle class name to single',(original,expected)=>{
                            createBothToggles=false;
                            toggleSingle.getAttribute.mockReturnValue(original);
                            createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["toggle","toggleClassName"]) as any);
                            expect(toggleSingle.setAttribute).toHaveBeenCalledWith('class',expected);
                        })                    
                    })
                    describe('showToggle and hideToggle class names',()=>{
                        describe('when both',()=>{
                            it('should add the showToggle class name to the toggle that shows',()=>{
                                createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["showToggle","showToggleClassName"]) as any);
                                expect(toggleShow.setAttribute).toHaveBeenCalledWith("class","showToggleClassName")
                            })
                            it('should add the hideToggle class name to the toggle that hides',()=>{
                                createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["hideToggle","hideToggleClassName"]) as any);
                                expect(toggleHide.setAttribute).toHaveBeenCalledWith("class","hideToggleClassName")
                            })
                        })
                        describe('when single',()=>{
                            it('should not add these class names',()=>{
                                createBothToggles=false;
                                toggleSingle.getAttribute.mockReturnValue("");
                                createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["toggle","toggleClassName"]) as any);
                                expect(toggleSingle.setAttribute).toHaveBeenCalledTimes(1);
                            })
                        })
                        
                    })
                })
                
                it.each([SingleToggleType.div,SingleToggleType.svg])
                ('should check if single with instanceof ',(divOrSVG)=>{
                    createBothToggles=false;
                    singleToggleType=divOrSVG;
                    createToggle(highlighterElement as any,false,{} as any,"Never","Below",createClassNames(["toggle","toggleClassName"]) as any);
                    const toggle=singleToggleType==SingleToggleType.div?realDivToggle:realSVGToggle;
                    expect(toggle.setAttribute).toHaveBeenCalledTimes(1);
                    expect(toggle.setAttribute).toHaveBeenCalledWith("class","toggleClassName");
                });

            })
            it('should collapsed the highlighter if hidden',()=>{
                highlighterElement.className='original';
                createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                expect(highlighterElement.className).toBe('original collapsed');
            })
            describe('toggle container',()=>{
                interface ToggleContainerClassNameTestCase{
                    hide:boolean,
                    expectedClassName:string
                }
                const toggleContainerClassName="toggleContainerClassName";
                const toggleContainerShownClassName="toggleContainerShowClassName";
                const toggleContainerHiddenClassName="toggleContainerHiddenClassName";
                const toggleContainerInitialClassName="toggleContainerInitialClassName";
                
                
                it.each<ToggleContainerClassNameTestCase>([
                    {
                        hide:true,
                        expectedClassName:`${toggleContainerClassName} ${toggleContainerInitialClassName} ${toggleContainerHiddenClassName}`
                    },
                    {
                        hide:false,
                        expectedClassName:`${toggleContainerClassName} ${toggleContainerInitialClassName} ${toggleContainerShownClassName}`
                    }
                ])
                ('should have toggle container class names',({expectedClassName,hide})=>{
                    
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",
                        createClassNames(
                            ["toggleContainer",toggleContainerClassName],
                            ["toggleContainerShown",toggleContainerShownClassName],
                            ["toggleContainerHidden",toggleContainerHiddenClassName],
                            ["toggleContainerInitial",toggleContainerInitialClassName]
                        ) as any);
                    expect(mockToggleContainer.className).toBe(expectedClassName);
                })

                describe('toggle child',()=>{
                    describe('when both',()=>{
                        it.each([[true,true],[false,false]])
                        ('should have the visible toggle as appended child',(hide,isToggleShow)=>{
                            createToggle(highlighterElement as any,hide,{} as any,"Never","Below",{} as any);
                            expect(mockToggleContainer.appendChild.mock.calls[0][0].isToggleShow).toEqual(isToggleShow);
                        });
                    })
                    describe('when single',()=>{
                        it('should have the single toggle as appended child',()=>{
                            createBothToggles=false;
                            createToggle(highlighterElement as any,false,{} as any,"Never","Below",{} as any);
                            expect(mockToggleContainer.appendChild.mock.calls[0][0]).toBe(toggleSingle);
                        })
                    })
                })
               
                it('should be added before the highlighter',()=>{
                    createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                    expect(mockAddContainerBeforeHighlighter).toHaveBeenCalledWith(mockToggleContainer,highlighterElement);
                })
                interface ToggleMessageTestCase{
                    testName:string,
                    messageWhen:When,
                    hide:boolean,
                    messages:HideShowMessages,
                    messagePlacement:MessagePlacement,
                    expectation:{
                        expectTextElement:boolean,
                        textElementTypeDiv?:boolean,
                        expectedMessage?:string
                    }
                }
                describe.each<ToggleMessageTestCase>([
                    {
                        testName:"should be no toggle message if message when Never",
                        hide:false,
                        messageWhen:"Never",
                        messagePlacement:"Below",
                        messages:{hiddenMessage:"",showMessage:""},
                        expectation:{
                            expectTextElement:false
                        }
                    },
                    {
                        testName:"should be div show message when always, below, hide",
                        hide:true,
                        messageWhen:"Always",
                        messagePlacement:"Below",
                        messages:{hiddenMessage:"",showMessage:"Show me"},
                        expectation:{
                            expectTextElement:true,
                            expectedMessage:"Show me",
                            textElementTypeDiv:true
                        }
                    },
                    {
                        testName:"should be span show message when always, right, hide",
                        hide:true,
                        messageWhen:"Always",
                        messagePlacement:"Right",
                        messages:{hiddenMessage:"",showMessage:"Show me"},
                        expectation:{
                            expectTextElement:true,
                            expectedMessage:"Show me",
                            textElementTypeDiv:false
                        }
                    },
                    {
                        testName:"should be span ( right ) show message when hidden and hidden",
                        hide:true,
                        messageWhen:"Hidden",
                        messagePlacement:"Right",
                        messages:{hiddenMessage:"",showMessage:"Show me"},
                        expectation:{
                            expectTextElement:true,
                            expectedMessage:"Show me",
                            textElementTypeDiv:false
                        }
                    },
                    {
                        testName:"should be no toggle message if when hidden and not hidden",
                        hide:false,
                        messageWhen:"Hidden",
                        messagePlacement:"Below",
                        messages:{hiddenMessage:"",showMessage:""},
                        expectation:{
                            expectTextElement:false
                        }
                    },
                    {
                        testName:"should be span ( right ) hide message when not hidden and always",
                        hide:false,
                        messageWhen:"Always",
                        messagePlacement:"Right",
                        messages:{hiddenMessage:"Hide me",showMessage:""},
                        expectation:{
                            expectTextElement:true,
                            expectedMessage:"Hide me",
                            textElementTypeDiv:false
                        }
                    },
                ])('toggle message',
                ({
                    testName,
                    messageWhen,
                    hide,
                    messages,
                    messagePlacement,
                    expectation,

                })=>{
                    it(`${testName}`,()=>{
                        createToggle(highlighterElement as any,hide,messages,messageWhen,messagePlacement,createClassNames(["toggleText","toggleTextClassName"]) as any);
                        if(expectation.expectTextElement){
                            expect(mockToggleContainer.appendChild).toHaveBeenCalledTimes(2);
                            const textElement=mockToggleContainer.appendChild.mock.calls[1][0];
                            expect(textElement.className).toEqual("toggleTextClassName");
                            expect(textElement.innerHTML).toEqual(expectation.expectedMessage);
                            expect(textElement.isDiv).toEqual(expectation.textElementTypeDiv);
                        }else{
                            expect(mockToggleContainer.appendChild).toHaveBeenCalledTimes(1);
                        }
                    })
                })
            })
        })
        describe('click behaviour',()=>{
            describe('both',()=>{
                it.each([[true,false],[false,true]])('should switch toggles',(hide,isToggleShow)=>{
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",{} as any);
                    const firstToggle=mockToggleContainer.appendChild.mock.calls[0][0];
                    const clickHandler=hide?toggleShowClickHandler:toggleHideClickHandler;
                    clickHandler();
                    const replaceChildArgs=mockToggleContainer.replaceChild.mock.calls[0];
                    expect(replaceChildArgs[1]).toBe(firstToggle);
                    expect(replaceChildArgs[0].isToggleShow).toEqual(isToggleShow);
                })
            })
            describe('single with delay',()=>{
                const classNames=createClassNames(
                    ["toggleContainer","tc"],
                    ["toggleContainerHidden","tch"],
                    ["toggleContainerShown","tcs"],
                    ["toggleContainerToggled","tct"]

                )
                const hideShowMessages={hiddenMessage:"Hidden",showMessage:"Show"};
                it('should delay the message and the toggle highlighter',()=>{
                    createBothToggles=false;
                    jest.useFakeTimers();
                    
                    createToggle(highlighterElement as any,true,hideShowMessages,"Always","Below",classNames as any);
                    
                    toggleSingleClick();
                    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function),toggleSingleDelay);
                    expect(highlighterElement.className.indexOf("collapsed")).not.toBe(-1);
                    expect(mockToggleContainer.className).toBe("tc tct tcs");
                    expect(mockToggleContainer.replaceChild).not.toHaveBeenCalled();

                    jest.runAllTimers();
                    expect(highlighterElement.className.indexOf("collapsed")).not.toBe(1);
                    //now text is changed
                    expect(mockToggleContainer.replaceChild).toHaveBeenCalled();
                })
                describe('click before previous delayed message and toggle highlighter has run',()=>{
                    it('should toggle the toggle container class as usual',()=>{
                        createBothToggles=false;
                        jest.useFakeTimers();
                        
                        createToggle(highlighterElement as any,true,hideShowMessages,"Always","Below",classNames as any);
                        
                        toggleSingleClick();
                        expect(mockToggleContainer.className).toBe("tc tct tcs");
                        toggleSingleClick();
                        expect(mockToggleContainer.className).toBe("tc tct tch");
                    })
                    it('should prevent text change and highlighter collapse change by clearTimeout',()=>{
                        createBothToggles=false;
                        jest.useFakeTimers();
                        const setTimeoutReturn=9;
                        (setTimeout as any).mockReturnValue(setTimeoutReturn);
                        
                        createToggle(highlighterElement as any,true,hideShowMessages,"Always","Below",classNames as any);
                        
                        toggleSingleClick();
                        toggleSingleClick();
                        expect(clearTimeout).toHaveBeenCalledWith(setTimeoutReturn);
                        /*should really check that works normally after this 
                            clearTimeout(singleDelayTimeout);
                            singleDelayTimeout=undefined; *******
                        */
                    })
                })
            })
            describe('common',()=>{
                interface ToggleContainerIsShowingClassTestCase{
                    hide:boolean,
                    expectedClassName:string
                }
                it.each<ToggleContainerIsShowingClassTestCase>([
                    {
                        hide:true,
                        expectedClassName:"toggleContainerClassName toggleContainerToggledClassName toggleContainerShownClassName"
                    },
                    {
                        hide:false,
                        expectedClassName:"toggleContainerClassName toggleContainerToggledClassName toggleContainerHiddenClassName"
                    },

                ])
                ('should switch toggleContainer is showing class and add toggleContainerToggled',({hide,expectedClassName})=>{
                    const classNames=createClassNames(
                        ["toggleContainer","toggleContainerClassName"],
                        ["toggleContainerHidden","toggleContainerHiddenClassName"],
                        ["toggleContainerShown","toggleContainerShownClassName"],
                        ["toggleContainerToggled","toggleContainerToggledClassName"]
                        );
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",classNames as any);
                    
                    const clickHandler=hide?toggleShowClickHandler:toggleHideClickHandler;
                    clickHandler();
                    expect(mockToggleContainer.className).toEqual(expectedClassName);
                })
                
                it.each([[true,false],[false,true]])
                ('should switch the collapse class of the toggle highlighter',(hide,hasCollapseClass)=>{
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",{} as any);
                    
                    const clickHandler=hide?toggleShowClickHandler:toggleHideClickHandler;
                    clickHandler();
                    const collapseIndex=highlighterElement.className.indexOf('collapsed');
                    if(hasCollapseClass){
                        expect(collapseIndex).not.toEqual(-1);
                    }else{
                        expect(collapseIndex).toEqual(-1);
                    }
                    
                })
                describe('messages appendChild, replaceChild, removeChild from toggle container',()=>{
                    describe('no new message and previous',()=>{
                        it('should remove the message',()=>{
                            createToggle(highlighterElement as any,true,{showMessage:"_"} as any,"Hidden","Below",{} as any);
                            toggleShowClickHandler();
                            expect(mockToggleContainer.removeChild).toHaveBeenCalledWith(mockTextElement);
                        })
                        
                    })
                    interface NewMessageAndPreviousTestCase{
                        hide:boolean,
                        expectedMessage:string
                    }
                    describe('new message and previous',()=>{
                        it.each<NewMessageAndPreviousTestCase>([
                            {hide:true,expectedMessage:"Hide message"},
                            {hide:false,expectedMessage:"Show message"}
                        ])
                        ('should replace with new message',({hide,expectedMessage})=>{
                            createToggle(highlighterElement as any,hide,{showMessage:"Show message",hiddenMessage:"Hide message"},"Always","Below",{} as any);
                            const clickHandler=hide?toggleShowClickHandler:toggleHideClickHandler;
                            clickHandler();
                            //1 as have also replaced the toggle
                            const replaceChildArgs=mockToggleContainer.replaceChild.mock.calls[1];
                            expect(replaceChildArgs[1]).toBe(mockTextElement);
                            expect(replaceChildArgs[0].innerHTML).toEqual(expectedMessage);
                        })
                        
                    })
                    describe('new message and no previous',()=>{
                        it('should append',()=>{
                            createToggle(highlighterElement as any,false,{showMessage:"_"} as any,"Hidden","Below",{} as any);
                            toggleShowClickHandler();
                            //is mockTextElement as did not create first time
                            expect(mockToggleContainer.appendChild).toHaveBeenNthCalledWith(2,mockTextElement);
                        })
                    })
                })
            })
        })
    })
})
