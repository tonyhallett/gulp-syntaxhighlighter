

type WhenAlways ="Always";
type WhenHidden = "Hidden";
type WhenNever = "Never";
type When = WhenAlways | WhenHidden | WhenNever;

//todo probably should be explicit with Never
type ToggleState="Show" | "Hide"
type DataToggleState=ToggleState|"Never"
interface ToggleConfig {
    toggleState?: ToggleState,
    messages: ToggleConfigMessages,
    classNames: ClassNames
}
type MessagePlacement="Right" | "Below";
interface ToggleConfigMessages {
    when: When,
    prefix: string,
    prefixShow: string,
    prefixHide: string,
    useTitle: boolean,
    hideMessage: string,
    showMessage: string,
    message: string,
    placement: MessagePlacement;
}
interface ClassNames {
    toggleContainer: string,
    toggleContainerShown: string,
    toggleContainerHidden: string,
    toggleContainerInitial:string,
    toggleContainerToggled:string,
    toggleText: string,
    toggle: string,
    showToggle: string,
    hideToggle: string,
    
}


interface HideShowMessages {
    showMessage: string,
    hiddenMessage: string
}

type HideShowMessagesWhen = HideShowMessages & {
    when:When
}
