///<reference path="toggleDefns.d.ts"/>
declare function createToggleElement(show: boolean): SVGElement;

enum ToggleState { Never, Show, Hide };

interface HideShowMessages {
    showMessage: string,
    hiddenMessage: string
}

type HideShowMessagesWhen = HideShowMessages & {
    when:When
}

//attribute or config
function getToggleState(syntaxHighlighter: HTMLElement, toggleConfig: ToggleConfig) {
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

function createToggle(highlighterElement: HTMLElement, hide: boolean, messages: HideShowMessages, when: When, placement: ToggleConfigMessages["placement"], classNames: ClassNames) {
    let isHidden = false
    function svgClick() {
        (highlighterElement.parentNode as Node).removeChild(currentEl)
        addToggle(!isHidden);
    }
    function createToggleAndHandleClick(show: boolean) {
        const toggle = createToggleElement(show);
        addClickHandler(toggle, svgClick);
        addClassToSVG(toggle, classNames.toggle);
        addClassToSVG(toggle, show ? classNames.showToggle : classNames.hideToggle);
        return toggle
    }

    const showElement = createToggleAndHandleClick(true);
    const hideElement = createToggleAndHandleClick(false);
    let currentEl: HTMLDivElement;

    function addToggle(hidden: boolean) {
        if (currentEl && !isHidden) {
            removeClass(currentEl, classNames.toggleContainerShown);
        }

        isHidden = hidden;

        currentEl = document.createElement("div");
        currentEl.className = classNames.toggleContainer;
        currentEl.appendChild(hidden ? showElement : hideElement);
        if (when === "Always" || when === "Hidden" && hidden) {
            const message = hidden ? messages.showMessage : messages.hiddenMessage;
            if (message) {
                var textEl = document.createElement(placement === "Below" ? "div" : "span");
                textEl.className = classNames.toggleText;
                textEl.innerHTML = message;

                currentEl.appendChild(textEl);
            }
        }
        (highlighterElement.parentNode as Node).insertBefore(currentEl, highlighterElement);

        if (hidden) {
            addClass(highlighterElement, "collapsed");
        } else {
            addClass(currentEl, classNames.toggleContainerShown);
            removeClass(highlighterElement, "collapsed");
        }
    }

    addToggle(hide);
}

function getHideShowMessages(syntaxHighlighter: HTMLElement, toggleConfigMessages: ToggleConfigMessages): HideShowMessagesWhen {
    function getHideShowMessages(message: ToggleConfigMessages): HideShowMessages {
        function getCaption() {
            var caption = (syntaxHighlighter.children[0] as HTMLTableElement).caption;
            if (caption) {
                const text = caption.textContent;
                return text !== null ? text : "";
            }
            return "";
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
    function getMessages() {
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

    var messages = getMessages()
    var hideShowMessages = getHideShowMessages(messages);
    return { when: messages.when, showMessage: hideShowMessages.showMessage, hiddenMessage: hideShowMessages.hiddenMessage };
}

function getSyntaxHighlighterElements(syntaxhighlighterClassName: string) {
    return <HTMLCollectionOf<HTMLElement>>window.document.getElementsByClassName(syntaxhighlighterClassName);
}

//#region helpers
function removeClass(target: HTMLElement, className: string) {
    target.className = target.className.replace(className, '');
};
function addClass(target: HTMLElement, className: string) {
    target.className = target.className + " " + className;
};
function addClassToSVG(target: SVGElement, className: string) {
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
    determineToggleState?: (syntaxHighlighter: HTMLElement, toggleConfig: ToggleConfig) => ToggleState,
    determineMessages?: (syntaxHighlighter: HTMLElement, toggleConfigMessages: ToggleConfigMessages) => HideShowMessagesWhen,
    addToggleFunctionality?: (highlighterElement: HTMLElement, hide: boolean, messages: HideShowMessages, when: When, placement: ToggleConfigMessages["placement"], classNames: ClassNames) => void,
    syntaxHighlighterElementFinder?:(syntaxHighlighterClassName:string) => HTMLCollectionOf<HTMLElement>
){

    determineToggleState = determineToggleState ? determineToggleState : getToggleState;
    determineMessages = determineMessages ? determineMessages : getHideShowMessages;
    addToggleFunctionality = addToggleFunctionality ? addToggleFunctionality : createToggle;
    syntaxHighlighterElementFinder = syntaxHighlighterElementFinder ? syntaxHighlighterElementFinder : getSyntaxHighlighterElements;

    const syntaxHighlighters = syntaxHighlighterElementFinder("syntaxhighlighter");
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





