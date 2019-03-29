///<reference path="../toggleDefns.d.ts"/>
///<reference path="../toggle.global.d.ts"/>

export enum ToggleState { Never, Show, Hide };

//attribute or config
export function getToggleState(syntaxHighlighter: HTMLElement, toggleConfig: ToggleConfig) {
    const dataToggle = syntaxHighlighter.getAttribute("data-toggleState");
    let toggleState: ToggleState = ToggleState.Never;
    if (dataToggle === "Show") {
        toggleState = ToggleState.Show;
    } else if (dataToggle === "Hide") {
        toggleState = ToggleState.Hide;
    } else if (dataToggle === "Never") {
        toggleState = ToggleState.Never;
    } else {
        if (toggleConfig.toggleState === "Show") {
            toggleState = ToggleState.Show;
        } else if (toggleConfig.toggleState === "Hide") {
            toggleState = ToggleState.Hide;
        }
    }
    return toggleState;
}

export function createToggle(highlighterElement: HTMLElement, hide: boolean, messages: HideShowMessages, messageWhen: When, placement: ToggleConfigMessages["placement"], classNames: ClassNames) {
    function initializeToggle(toggle:HtmlOrSvg,clickHandler:()=>void){
        addClickHandler(toggle, clickHandler);
        addClassSVGSafe(toggle, classNames.toggle);
    }
    function initializeSingleToggle(toggle:HtmlOrSvg){
        initializeToggle(toggle,singleToggleClicked);
    }
    function initializeBothToggles(toggleShow:HtmlOrSvg,toggleHide:HtmlOrSvg){
        initializeToggle(toggleShow,bothToggleClicked);
        addClassSVGSafe(toggleShow,classNames.showToggle);
        initializeToggle(toggleHide,bothToggleClicked);
        addClassSVGSafe(toggleHide,classNames.hideToggle);
    }
    
    let isHidden = hide;
    let isSingleToggle=false;
    let singleToggle!:HtmlOrSvg;
    let delay:number|undefined;

    let showToggle:HtmlOrSvg;
    let hideToggle:HtmlOrSvg;
    
    const singleOrBothToggles=createToggleElement();
    function determineSingleToggle(singleOrBoth:createToggleElementReturn):singleOrBoth is toggleElementSingle{
        if(singleOrBoth instanceof HTMLElement||singleOrBoth instanceof SVGElement){
            return true;
        }
        let asSingle=singleOrBoth as singleWithDelay;
        if(asSingle.delay!==undefined){
            delay=delay;
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
    let toggleContainer: HTMLDivElement;

    
    function createToggleContainer(){
        toggleContainer = document.createElement("div");
        addClass(toggleContainer,classNames.toggleContainer);
        setToggleContainerIsShowingClass(!hide);
    }
    function setToggleContainerIsShowingClass(showing:boolean){
        let classToRemove = classNames.toggleContainerShown;
        let classToAdd = classNames.toggleContainerHidden;
        if(showing){
            classToRemove = classNames.toggleContainerHidden;
            classToAdd = classNames.toggleContainerShown;
        }
        addClass(toggleContainer,classToAdd);
        removeClass(toggleContainer,classToRemove);
    }
    function addVisibleToggleToContainer(){
        let visibleToggle=singleToggle;
        if(!isSingleToggle){
            visibleToggle=isHidden ? showToggle : hideToggle
        }
        toggleContainer.appendChild(visibleToggle);
        
    }
    
    //this is why was recreating
    function addMessageToToggleContainer(){
        if (messageWhen === "Always" || messageWhen === "Hidden" && isHidden) {
            const message = isHidden ? messages.showMessage : messages.hiddenMessage;
            if (message) {
                var textEl = document.createElement(placement === "Below" ? "div" : "span");
                textEl.className = classNames.toggleText;
                textEl.innerHTML = message;

                toggleContainer.appendChild(textEl);
            }
        }
    }
    function addToggleContainerBeforeHighlighter(){
        (highlighterElement.parentNode as Node).insertBefore(toggleContainer, highlighterElement);
    }
    function toggleHighlighter(){
        if (isHidden) {
            addClass(highlighterElement, "collapsed");
        } else {
            removeClass(highlighterElement, "collapsed");
        }
    }
    //might hof
    function singleToggleClicked(){
        isHidden=!isHidden;
    }
    function bothToggleClicked(){

    }
    
    createToggleContainer();
    addVisibleToggleToContainer();
    addMessageToToggleContainer();
    addToggleContainerBeforeHighlighter();
    toggleHighlighter();
    
}

export function getHideShowMessagesWhen(syntaxHighlighter: HTMLElement, toggleConfigMessages: ToggleConfigMessages): HideShowMessagesWhen {
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

        let showMessage = "";
        let hideMessage = "";
        
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

export function getSyntaxHighlighterElements() {
    return <HTMLCollectionOf<HTMLElement>>window.document.getElementsByClassName("syntaxhighlighter");
}

//#region helpers
function removeClass(target: HTMLElement, className: string) {
    target.className = target.className.replace(className, '');
};
function addClass(target: HTMLElement, className: string) {
    target.className = target.className + " " + className;
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

export function setUpToggle(config: ToggleConfig,
    determineToggleState?: (syntaxHighlighter: HTMLElement, toggleConfig: ToggleConfig) => ToggleState,
    determineMessages?: (syntaxHighlighter: HTMLElement, toggleConfigMessages: ToggleConfigMessages) => HideShowMessagesWhen,
    addToggleFunctionality?: (highlighterElement: HTMLElement, hide: boolean, messages: HideShowMessages, when: When, placement: ToggleConfigMessages["placement"], classNames: ClassNames) => void,
    syntaxHighlighterElementFinder?:() => HTMLCollectionOf<HTMLElement>
){

    determineToggleState = determineToggleState ? determineToggleState : getToggleState;
    determineMessages = determineMessages ? determineMessages : getHideShowMessagesWhen;
    addToggleFunctionality = addToggleFunctionality ? addToggleFunctionality : createToggle;
    syntaxHighlighterElementFinder = syntaxHighlighterElementFinder ? syntaxHighlighterElementFinder : getSyntaxHighlighterElements;

    const syntaxHighlighters = syntaxHighlighterElementFinder();
    for (let i = 0; i < syntaxHighlighters.length; i++) {

        var syntaxHighlighter = syntaxHighlighters[i];
        const toggleState = determineToggleState(syntaxHighlighter,config);
        if (toggleState !== ToggleState.Never) {
            const messages = determineMessages(syntaxHighlighter, config.messages);
            const show = toggleState === ToggleState.Show;
            addToggleFunctionality(syntaxHighlighter, !show,
                {hiddenMessage:messages.hiddenMessage,showMessage:messages.showMessage},
                messages.when, config.messages.placement, config.classNames);
        }
    }
}





