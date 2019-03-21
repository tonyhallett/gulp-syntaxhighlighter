type When = "Always" | "Hidden" | "Never";
interface ToggleConfig {
    toggleState?: "Show" | "Hide",
    message: ToggleConfigMessage,
    classNames: ClassNames
}
interface ToggleConfigMessage {
    when: When,
    prefix: string,
    prefixShow: string,
    prefixHide: string,
    useTitle: boolean,
    hideMessage: string,
    showMessage: string,
    message: string,
    placement: "Right" | "Below"
}
interface ClassNames {
    toggleContainer: string,
    toggleText: string,
    toggle: string,
    showToggle: string,
    hideToggle: string,
    isShowing: string
}