///<reference path="../../toggleDefns.d.ts"/>
import {ToggleState,createToggle,getHideShowMessagesWhen,getSyntaxHighlighterElements,getToggleState,setUpToggle} from '../toggleExport'
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
const mockToggleContainer={
    appendChild:jest.fn(),
    className:""
}
const mockTextElement={
    isDiv:false,
    className:"",
    innerHTML:"",
}
//documentCreateElementMock=jest.fn().mockReturnValue(toggleContainer);
/* let documentCreateElementMock=jest.fn().mockReturnValue({
    appendChild:jest.fn(),

}) */
let documentCreateElementMock:Function;
const mockCreateToggleElement=jest.fn();
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
            expected:ToggleState
        }
        it.each<DataToggleStateTestOption>([
            {dataToggleState:"Show",expected:ToggleState.Show,configToggleState:"Hide"},
            {dataToggleState:"Hide",expected:ToggleState.Hide,configToggleState:"Show"},
            {dataToggleState:"Never",expected:ToggleState.Never,configToggleState:"Hide"}
        ])('should come from data-toggleState if present',({dataToggleState,expected,configToggleState})=>{
            const config:Partial<ToggleConfig>={
                toggleState:configToggleState,
            };
            expect(getToggleState(TestSyntaxHighlighterElement.create([["State",dataToggleState]]),config as any)).toBe(expected);        
        })
        interface ConfigToggleStateTestOption{
            configToggleState:ToggleConfig["toggleState"],
            expected:ToggleState
        }
        it.each<ConfigToggleStateTestOption>([
            {configToggleState:"Hide",expected:ToggleState.Hide},
            {configToggleState:"Show",expected:ToggleState.Show},
        ])
        ('should come from config if no data-toggleState',({configToggleState,expected})=>{
            const config:Partial<ToggleConfig>={
                toggleState:configToggleState
            };
            expect(getToggleState(TestSyntaxHighlighterElement.create(),config as any)).toBe(expected);  
        })
        it('should default to Never if not in config or data-toggleState',()=>{
            expect(getToggleState(TestSyntaxHighlighterElement.create(),{} as any)).toBe(ToggleState.Never);  
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
                toggleState:ToggleState,
                messages?:HideShowMessagesWhen
           }
           const mockSyntaxHighlighterElementNever:MockSyntaxHighlighterElement={
               toggleState:ToggleState.Never
           }
           const mockSyntaxHighlighterElementShow:MockSyntaxHighlighterElement={
                toggleState:ToggleState.Show,
                messages:{
                    hiddenMessage:"ShowHidden",
                    showMessage:"ShowShow",
                    when:"Hidden"
                }
            }
            const mockSyntaxHighlighterElementHide:MockSyntaxHighlighterElement={
                toggleState:ToggleState.Hide,
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
                    toggleText:""
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
        beforeEach(()=>{
            jest.clearAllMocks();
            let firstCall=true;
            documentCreateElementMock=jest.fn((elType:string)=>{
                if(firstCall){
                    firstCall=false;
                    return mockToggleContainer;
                }else{
                    mockTextElement.isDiv=elType=="div";
                    return mockTextElement;
                }
                
            })
        })
        describe('initial setup',()=>{
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
            const toggleShow={
                isToggleShow:true,
                addEventListener:jest.fn(),
                getAttribute:jest.fn(),
                setAttribute:jest.fn()
            }
            const toggleHide={
                isToggleShow:false,
                addEventListener:jest.fn(),
                getAttribute:jest.fn(),
                setAttribute:jest.fn()
            }
            describe('toggle elements',()=>{
                
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
                let createEventListenerToggle=true;
                let createBothToggles=true;
                afterEach(()=>{
                    createEventListenerToggle=true;
                })
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
                        throw new Error("Not implemented");
                    }
                    
                })
                it.each([true,false])('should create them by calling createToggleElement',(hide)=>{
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",{} as any);
                    expect(mockCreateToggleElement).toHaveBeenCalled();
                })
                describe('adding click handler',()=>{
                    it('should addEventListener if present',()=>{
                        createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                        function expectClickHandler(mockToggle:any){
                            expect(mockToggle.addEventListener).toHaveBeenCalledWith("click",expect.any(Function),false);
                        }
                        expectClickHandler(toggleHide);
                        expectClickHandler(toggleShow);
                    })
                    it('should attachEvent if present',()=>{
                        createEventListenerToggle=false;
                        createToggle(highlighterElement as any,true,{} as any,"Never","Below",{} as any);
                        expect(toggleShowAttachEvent.attachEvent).toHaveBeenCalledWith("onclick",expect.any(Function));
                        expect(toggleHideAttachEvent.attachEvent).toHaveBeenCalledWith("onclick",expect.any(Function));
                    })
                    
                })
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
                //check in the html that is the one that when pressed shows
                it('should add the showToggle class name to the toggle that shows',()=>{
                    createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["showToggle","showToggleClassName"]) as any);
                    expect(toggleShow.setAttribute).toHaveBeenCalledWith("class","showToggleClassName")
                })
                it('should add the hideToggle class name to the toggle that hides',()=>{
                    createToggle(highlighterElement as any,true,{} as any,"Never","Below",createClassNames(["hideToggle","hideToggleClassName"]) as any);
                    expect(toggleHide.setAttribute).toHaveBeenCalledWith("class","hideToggleClassName")
                })
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

                
                beforeEach(()=>{
                    mockToggleContainer.className="";
                });
                it.each<ToggleContainerClassNameTestCase>([
                    {
                        hide:true,
                        expectedClassName:` ${toggleContainerClassName} ${toggleContainerHiddenClassName}`
                    },
                    {
                        hide:false,
                        expectedClassName:` ${toggleContainerClassName} ${toggleContainerShownClassName}`
                    }
                ])
                ('should have toggle container class names',({expectedClassName,hide})=>{
                    
                    //going to have to reset this or do before
                    //documentCreateElementMock=jest.fn().mockReturnValue(toggleContainer);
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",
                        createClassNames(
                            ["toggleContainer",toggleContainerClassName],
                            ["toggleContainerShown",toggleContainerShownClassName],
                            ["toggleContainerHidden",toggleContainerHiddenClassName]
                        ) as any);
                    expect(mockToggleContainer.className).toBe(expectedClassName);
                })

                
                it.each([[true,true],[false,false]])
                ('should have the visible toggle as appended child',(hide,isToggleShow)=>{
                    createToggle(highlighterElement as any,hide,{} as any,"Never","Below",{} as any);
                    expect(mockToggleContainer.appendChild.mock.calls[0][0].isToggleShow).toEqual(isToggleShow);
                });

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
        xdescribe('click behaviour',()=>{
    
        })
    })
})
