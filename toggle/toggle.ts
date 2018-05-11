declare function createSvg(show:boolean):SVGElement;
type When="Always"|"Hidden"|"Never";
interface ToggleConfigMessage{
    when:When,
    prefix:string,
    prefixShow:string,
    prefixHide:string,
    useTitle:boolean,
    hideMessage:string,
    showMessage:string,
    message:string,
    placement:"Right"|"Below"
}
interface ClassNames{
    toggleContainer:string,
    toggleText:string,
    toggle:string,
    showToggle:string,
    hideToggle:string,
    isShowing:string
}
interface ToggleConfig{
    toggleState?:"Show"|"Hide",
    message:ToggleConfigMessage,
    classNames:ClassNames
}

function removeClass(target:HTMLElement, className:string)
{
    target.className = target.className.replace(className, '');
};
function addClass(target:HTMLElement, className:string)
{
    target.className = target.className + " " + className;
};
function addClassToSVG(target:SVGElement, className:string){
    var cls=target.getAttribute("class");
    if(cls){
        cls+=" " + className;
    }else{
        cls=className;
    }
    target.setAttribute("class",cls);
}



function getCaption(highlighterElement:Element){
    var caption=(highlighterElement.children[0] as HTMLTableElement).caption;
    if(caption){
        const text= caption.textContent;
        return text!==null?text:"";
    }
    return "";
}
function addClickHandler(el:Element,handler:any){
    if (el.addEventListener) {
        el.addEventListener('click', handler, false); 
    } else if ((el as any).attachEvent)  {
        (el as any).attachEvent('onclick', handler);
    }
}

function createToggle(highlighterElement:HTMLElement,hide:boolean,messages:Messages,when:When,config:ToggleConfig){
    let isHidden=false
    function svgClick(){
        (highlighterElement.parentNode as Node).removeChild(currentEl)
        addToggle(!isHidden);
    }
    function createSvgAndHandleClick(show:boolean){
        const svg=createSvg(show);
        addClickHandler(svg,svgClick);
        addClassToSVG(svg,config.classNames.toggle);
        addClassToSVG(svg,show?config.classNames.showToggle:config.classNames.hideToggle);
        return svg
    }
       
    const showSvg=createSvgAndHandleClick(true);
    const hideSvg=createSvgAndHandleClick(false);
    let currentEl:any;

    function addToggle(hidden:boolean){
        if(currentEl&&!isHidden){
            removeClass(currentEl,config.classNames.isShowing);
        }
        const messageConfig=config.message;
        isHidden=hidden;
        var svgElement=hidden?showSvg:hideSvg;
        currentEl=document.createElement("div");
        currentEl.className=config.classNames.toggleContainer;
        currentEl.appendChild(svgElement);
        if(when==="Always"||when==="Hidden"&&hidden){
            const message=hidden?messages.showMessage:messages.hiddenMessage;
            if(message){
                var textEl=document.createElement(messageConfig.placement==="Below"?"div":"span");
                textEl.className=config.classNames.toggleText;
                textEl.innerHTML=message;
                
                currentEl.appendChild(textEl);
            }
        }
        (highlighterElement.parentNode as Node).insertBefore(currentEl,highlighterElement);
        
        if(hidden){
            addClass(highlighterElement,"collapsed");
        }else{
            addClass(currentEl,config.classNames.isShowing);
            removeClass(highlighterElement,"collapsed");
        }
    }

    addToggle(hide);
}
enum ToggleState{Never,Show,Hide};
interface Messages{
    showMessage:string,
    hiddenMessage:string
}

function setUpToggle(config:ToggleConfig){
    function getToggleState(syntaxHighlighter:HTMLElement){
        const dataToggle=syntaxHighlighter.getAttribute("data-toggleState");
        let toggleState:ToggleState=ToggleState.Never;
        if(dataToggle==="Show"){
            toggleState=ToggleState.Show;
        }else if(dataToggle==="Hide"){
            toggleState=ToggleState.Hide;
        }else{
            if(config.toggleState==="Show"){
                toggleState=ToggleState.Show;
            }else if(config.toggleState==="Hide"){
                toggleState=ToggleState.Hide;
            }
        }
        return toggleState;
    }
    function mergeMessages(syntaxHighlighter:HTMLElement){
        const messageConfig={...config.message} as any;
        var configNames=Object.getOwnPropertyNames(messageConfig);
        for(var i=0;i<configNames.length;i++){
            var propertyName=configNames[i];
            var dataValue=syntaxHighlighter.getAttribute("data-toggle"+propertyName);
            if(dataValue!==null){
                messageConfig[propertyName]=dataValue;
            }
        }
        return messageConfig as ToggleConfigMessage;
    }
    function getMessages(message:ToggleConfigMessage,syntaxhighlighter:HTMLElement):Messages{
        let showMessage="";
        let hideMessage="";
        
        if(message.useTitle){
            const caption=getCaption(syntaxHighlighter)
            
            showMessage=caption;
            hideMessage=caption;
        }else{
            showMessage=message.showMessage!==""?message.showMessage:message.message;
            hideMessage=message.hideMessage!==""?message.hideMessage:message.message;
        }
        
        if(message.prefix!==""){
            showMessage=message.prefix + " " + showMessage;
            hideMessage=message.prefix + " " + hideMessage;
        }else{
            showMessage=message.prefixShow + " " + showMessage;
            hideMessage=message.prefixHide + " " + hideMessage;
        }
        return {
            hiddenMessage:hideMessage,
            showMessage:showMessage
        }
    }

    const syntaxHighlighters=<HTMLCollectionOf<HTMLElement>>window.document.getElementsByClassName("syntaxhighlighter");
    for(let i=0;i<syntaxHighlighters.length;i++){

        var syntaxHighlighter=syntaxHighlighters[i];
        const toggleState=getToggleState(syntaxHighlighter);
        if(toggleState!==ToggleState.Never){
            const mergedMessages=mergeMessages(syntaxHighlighter);
            const show=toggleState===ToggleState.Show;
            createToggle(syntaxHighlighter,!show,getMessages(mergedMessages,syntaxHighlighter),mergedMessages.when,config);
        }
    }
}

