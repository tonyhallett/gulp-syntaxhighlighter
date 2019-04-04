type Toggle=HTMLElement|SVGElement;
type singleWithDelay={
    toggleElement:Toggle,
    delay:number
}
type toggleElementSingle=Toggle|singleWithDelay;
type toggleElementBoth={
    showToggle:Toggle,
    hideToggle:Toggle,
}
type createToggleElementReturn=toggleElementSingle|toggleElementBoth

declare function createToggleElement():createToggleElementReturn