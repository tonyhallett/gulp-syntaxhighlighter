///<reference path="./toggleDefns.d.ts"/>
///<reference path="./toggle.global.d.ts"/>



//attribute or config
function getToggleState(syntaxHighlighter: HTMLElement, toggleConfig: ToggleConfig) {
    const dataToggle = syntaxHighlighter.getAttribute("data-toggleState");
    var toggleState: DataToggleState = "Never";
    if (dataToggle === "Show") {
        toggleState = "Show";
    } else if (dataToggle === "Hide") {
        toggleState = "Hide";
    } else if (dataToggle === "Never") {//don't need this
        toggleState = "Never";
    } else {
        if (toggleConfig.toggleState === "Show") {
            toggleState = "Show";
        } else if (toggleConfig.toggleState === "Hide") {
            toggleState = "Hide";
        }
    }
    return toggleState;
}

function createToggle(highlighterElement: HTMLElement, hide: boolean, messages: HideShowMessages, messageWhen: When, placement: ToggleConfigMessages["placement"], classNames: ClassNames) {
    var isHidden = hide;
    var hasToggled=false;
    function createClickHandler(additionalOperations?:Function){
        return function(){
            isHidden=!isHidden;

            if(additionalOperations){
                additionalOperations();
            }
            performCommonOperations();
            hasToggled=true;
        }
    }
    function initializeToggle(toggle:Toggle,clickHandler:()=>void){
        addClickHandler(toggle, clickHandler);
        addClassSVGSafe(toggle, classNames.toggle);
    }
    function initializeSingleToggle(toggle:Toggle){
        initializeToggle(toggle,createClickHandler());
    }
    function initializeBothToggles(toggleShow:Toggle,toggleHide:Toggle){
        var bothToggleClicked=createClickHandler(addVisibleToggleToContainer);
        initializeToggle(toggleShow,bothToggleClicked);
        addClassSVGSafe(toggleShow,classNames.showToggle);
        initializeToggle(toggleHide,bothToggleClicked);
        addClassSVGSafe(toggleHide,classNames.hideToggle);
    }
    
    
    var isSingleToggle=false;
    var singleToggle!:Toggle;
    var singleDelay:number|undefined;

    var showToggle:Toggle;
    var hideToggle:Toggle;
    
    const singleOrBothToggles=createToggleElement();
    function determineSingleToggle(singleOrBoth:createToggleElementReturn):singleOrBoth is toggleElementSingle{
        if(singleOrBoth instanceof HTMLElement||singleOrBoth instanceof SVGElement){
            singleToggle=singleOrBoth;
            return true;
        }
        var asSingle=singleOrBoth as singleWithDelay;
        if(asSingle.delay!==undefined){
            singleDelay=asSingle.delay;
            singleToggle=asSingle.toggleElement;
            return true;
        }
        return false
    }
    if(determineSingleToggle(singleOrBothToggles)){
        isSingleToggle=true;
        initializeSingleToggle(singleToggle);
    }else{
        showToggle=singleOrBothToggles.showToggle;
        hideToggle=singleOrBothToggles.hideToggle;
        initializeBothToggles(showToggle,hideToggle);
    }
    var toggleContainer: HTMLDivElement;
    var previousMessageElement:HTMLDivElement|HTMLSpanElement|undefined;
    var previousVisibleToggle:Toggle;

    function createToggleContainer(){
        toggleContainer = document.createElement("div");
        addClass(toggleContainer,classNames.toggleContainer);
        addClass(toggleContainer,classNames.toggleContainerInitial);
        setToggleContainerIsShowingClass();
    }
    function setToggleContainerIsShowingClass(){
        var classToRemove = classNames.toggleContainerHidden;
        var classToAdd = classNames.toggleContainerShown;
        if(isHidden){
            classToRemove = classNames.toggleContainerShown;
            classToAdd = classNames.toggleContainerHidden;
        }
        addClass(toggleContainer,classToAdd);
        removeClass(toggleContainer,classToRemove);
    }
    function addVisibleToggleToContainer(){
        var visibleToggle=singleToggle;
        if(!isSingleToggle){
            visibleToggle=isHidden ? showToggle : hideToggle
        }
        if(previousVisibleToggle){
            toggleContainer.replaceChild(visibleToggle,previousVisibleToggle);
        }else{
            toggleContainer.appendChild(visibleToggle);
        }
        previousVisibleToggle=visibleToggle;
    }
    function getMessage(){
        if (messageWhen === "Always" || messageWhen === "Hidden" && isHidden) {
            return  isHidden ? messages.showMessage : messages.hiddenMessage;
        }
    }
    function createMessageElement(message:string){
        var messageElement = document.createElement(placement === "Below" ? "div" : "span");
        messageElement.className = classNames.toggleText;
        messageElement.innerHTML = message;
        return messageElement;
    }
    function addMessageToToggleContainer(){
        const message=getMessage();
        if(message){
            var messageElement=createMessageElement(message);
            if(previousMessageElement){
                toggleContainer.replaceChild(messageElement,previousMessageElement);
            }else{
                toggleContainer.appendChild(messageElement);
            }
            previousMessageElement=messageElement;            
        }else{
            if(previousMessageElement){
                toggleContainer.removeChild(previousMessageElement);
            }
            previousMessageElement=undefined;
        }
    }
    function addToggleContainerBeforeHighlighter(){
        (highlighterElement.parentNode as Node).insertBefore(toggleContainer, highlighterElement);
    }
    function toggleHighlighter(){
        const collapsedClass="collapsed";
        if (isHidden) {
            addClass(highlighterElement, collapsedClass);
        } else {
            removeClass(highlighterElement, collapsedClass);
        }
    }
    var singleDelayTimeout:number|undefined;
    function performCommonOperations(){
        
        if(!hasToggled){
            removeClass(toggleContainer,classNames.toggleContainerInitial);
            addClass(toggleContainer,classNames.toggleContainerToggled);
        }
        

        setToggleContainerIsShowingClass();
        
        if(singleDelay){
            if(singleDelayTimeout){
                clearTimeout(singleDelayTimeout);
                singleDelayTimeout=undefined;
            }else{
                singleDelayTimeout=setTimeout(()=>{
                    addMessageToToggleContainer();
                    toggleHighlighter();
                    singleDelayTimeout=undefined;
                },singleDelay)
            }
            
        }else{
            addMessageToToggleContainer();
            toggleHighlighter();
        }
        
    }

    createToggleContainer();
    addVisibleToggleToContainer();
    addMessageToToggleContainer();
    addToggleContainerBeforeHighlighter();
    toggleHighlighter();
    
}

function getHideShowMessagesWhen(syntaxHighlighter: HTMLElement, toggleConfigMessages: ToggleConfigMessages): HideShowMessagesWhen {
    function getHideShowMessages(message: ToggleConfigMessages): HideShowMessages {
        function getCaption() {
            var captionStr="";
            var caption = (syntaxHighlighter.children[0] as HTMLTableElement).caption;
            if (caption) {
                const text = caption.textContent;
                captionStr= text !== null ? text : "";
            }
            return captionStr;
        }

        var showMessage = "";
        var hideMessage = "";
        
        if (message.useTitle) {
            const caption = getCaption()
            showMessage = caption;
            hideMessage = caption;
        } else {
            showMessage = message.showMessage !== "" ? message.showMessage : message.message;
            hideMessage = message.hideMessage !== "" ? message.hideMessage : message.message;
        }
        showMessage = (message.prefixShow !== "" ? message.prefixShow : message.prefix) + showMessage;
        hideMessage = (message.prefixHide !== "" ? message.prefixHide : message.prefix) + hideMessage;

        return {
            hiddenMessage: hideMessage,
            showMessage: showMessage
        }
    }

    //attribute or config
    function mergeToggleConfigMessagesWithDataToggle() {
        const messageConfig = { ...toggleConfigMessages } as any;
        var messageNames = Object.getOwnPropertyNames(messageConfig);
        for (var i = 0; i < messageNames.length; i++) {
            var messageName = messageNames[i];
            var dataValue = syntaxHighlighter.getAttribute("data-toggle" + messageName);
            if (dataValue !== null) {
                messageConfig[messageName] = dataValue;
            }
        }
        return messageConfig as ToggleConfigMessages;
    }

    var messages = mergeToggleConfigMessagesWithDataToggle()
    var hideShowMessages = getHideShowMessages(messages);
    return { when: messages.when, showMessage: hideShowMessages.showMessage, hiddenMessage: hideShowMessages.hiddenMessage };
}

function getSyntaxHighlighterElements() {
    return <HTMLCollectionOf<HTMLElement>>window.document.getElementsByClassName("syntaxhighlighter");
}

//#region helpers
function removeClass(target: HTMLElement, className: string) {
     var replaced=target.className.replace(className, '');
     var splitReplaced=replaced.split(/\s+/);
     var newClassName="";
     for(var i=0;i<splitReplaced.length;i++){
         newClassName+=splitReplaced[i];
         if(i<splitReplaced.length-1){
             newClassName+=" ";
         }
     }
     target.className = newClassName;
};
function addClass(target: HTMLElement, className: string) {
    if(target.className==""){
        target.className=className;
    }else{
        target.className = target.className + ' ' + className;
    }
    
};
function addClassSVGSafe(target: SVGElement|HTMLElement, className: string) {
    var cls = target.getAttribute("class");
    if (cls) {
        cls += " " + className;
    } else {
        cls = className;
    }
    target.setAttribute("class", cls);
}
function addClickHandler(el: Element, handler: any) {
    if (el.addEventListener) {
        el.addEventListener('click', handler, false);
    } else if ((el as any).attachEvent) {
        (el as any).attachEvent('onclick', handler);
    }
}
//#endregion

function setUpToggle(config: ToggleConfig,
    determineToggleState?: (syntaxHighlighter: HTMLElement, toggleConfig: ToggleConfig) => DataToggleState,
    determineMessages?: (syntaxHighlighter: HTMLElement, toggleConfigMessages: ToggleConfigMessages) => HideShowMessagesWhen,
    addToggleFunctionality?: (highlighterElement: HTMLElement, hide: boolean, messages: HideShowMessages, when: When, placement: ToggleConfigMessages["placement"], classNames: ClassNames) => void,
    syntaxHighlighterElementFinder?:() => HTMLCollectionOf<HTMLElement>
){

    determineToggleState = determineToggleState ? determineToggleState : getToggleState;
    determineMessages = determineMessages ? determineMessages : getHideShowMessagesWhen;
    addToggleFunctionality = addToggleFunctionality ? addToggleFunctionality : createToggle;
    syntaxHighlighterElementFinder = syntaxHighlighterElementFinder ? syntaxHighlighterElementFinder : getSyntaxHighlighterElements;

    const syntaxHighlighters = syntaxHighlighterElementFinder();
    for (var i = 0; i < syntaxHighlighters.length; i++) {

        var syntaxHighlighter = syntaxHighlighters[i];
        const toggleState = determineToggleState(syntaxHighlighter,config);
        if (toggleState !== "Never") {
            const messages = determineMessages(syntaxHighlighter, config.messages);
            const show = toggleState === "Show";
            addToggleFunctionality(syntaxHighlighter, !show,
                {hiddenMessage:messages.hiddenMessage,showMessage:messages.showMessage},
                messages.when, config.messages.placement, config.classNames);
        }
    }
}





