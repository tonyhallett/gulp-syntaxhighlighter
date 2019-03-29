type HtmlOrSvg=HTMLElement|SVGElement;
type singleWithDelay={
    toggleElement:HtmlOrSvg,
    delay:number
}
type toggleElementSingle=HtmlOrSvg|singleWithDelay;
type toggleElementBoth={
    showToggle:HtmlOrSvg,
    hideToggle:HtmlOrSvg,
}
type createToggleElementReturn=toggleElementSingle|toggleElementBoth

declare function createToggleElement():createToggleElementReturn