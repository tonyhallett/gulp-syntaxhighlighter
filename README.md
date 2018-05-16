# gulp-syntaxhighlighter

Is a gulp plugin for running syntaxhighlighter v3.0.90 at build time rather than in the browser at run time.

Syntaxhighlighter was downloaded from [here](https://github.com/syntaxhighlighter/syntaxhighlighter/releases) but had to be rebuilt see [here](https://github.com/tonyhallett/syntaxhighlighter-3.0.90)).

The documentation for syntax highlighter can be found [here](http://alexgorbatchev.com/SyntaxHighlighter/manual/installation.html) and also [here](http://alexgorbatchev.com/SyntaxHighlighter/manual/configuration/) for config and global parameters.

By generating at runtime there is a guarantee that your code blocks will display as desired when javascript is not available such as when disabled in the browser or when contents are being read by an rss reader.

Essentially the plugin functions the same as when run in the browser.  The only difference is that since we are not relying upon the presence of javascript, syntax highlighter will not be present in the stream output and any dynamic functionality it provided will no longer function.  There are two pieces of such functionality in syntax highlighter, the ability to load the syntax highlighted elements as hidden and then to show them.  The other is a text area for copying the code.

I have provided more advanced toggle functionality which if opted in for will result in some additional css and javascript added to File.contents.  As noted this is not necessary for the html to be syntax highlighted.  See how to specify later.

## The plugin and options

The options shown below are a combination of the config, parameters and theming of syntax highlighter and options that are specific to the toggle functionality.  It is necessary to provide the toggleConfig property object for toggle functionality.

```typescript
//global - can specify in html for each element to be transformed ( apart from placement )
export interface ToggleConfigMessage{
    //---------- can be set in html
    //default Never
    when?:"Always"|"Hidden"|"Never",
    //default ""
    prefix?:string,
    //default ""
    prefixShow?:string,
    //default ""
    prefixHide?:string,
    //default false
    useTitle?:boolean,
    //default ""
    hideMessage?:string,
    //default ""
    showMessage?:string,
    //default ""
    message?:string,

    //---------- cannot be set in html
    //default Right
    placement?:"Right"|"Below"
}
//each default is the same as the property name
export interface ClassNames{
    toggleContainer?:string,
    toggleText?:string,
    toggle?:string,
    showToggle?:string,
    hideToggle?:string,
    isShowing?:string
}
export interface ToggleConfig{
    //global toggleState to apply to all
    toggleState?:"Show"|"Hide",
    //global to apply to all
    message?:ToggleConfigMessage,
    //default creates two svg elements, one for hide one for show
    //SIGNATURE IS - function createToggleElement(show)
    createToggleFn?:string,
    classNames?:ClassNames,
    //for replacing the css that would normally be applied for the toggle
    customCss?:string
}
export interface SyntaxHighlighterOptions{
    // default - see later
    isPartialFn?:(html:string,file:File)=>boolean

    //default true - for the js being used
    useMinifiedSyntaxHighlighter?:boolean
    //default true - for theme css,additionalCss, toggle js/css
    minifiedOutput?:boolean

    //default Default
    theme?:string,
    //actual css instead of theme by name above
    customTheme?:string,
    //in addition to theme|customTheme
    additionalCss?:string,

    //syntax highlighter parameters
    globalParams?:{
        "class-name"?:string,
        "first-line"?:number
        'pad-line-numbers' ?: boolean,
        'highlight' ?: number[],
        'title' ?: string,
        'smart-tabs' : boolean,
        'tab-size' : number,
        'gutter' : boolean,
        'auto-links' : boolean,
        'unindent' : boolean,
        'html-script' : false
    }
    //syntax highlighter config ( to merge with the defaults )
    config?: {
        space ?: string,
        useScriptTags? : boolean,
        bloggerMode? : boolean,
        stripBrs? : boolean,
        tagName? : string,
    }
    //if not present then no toggle js/css
    toggleConfig?:ToggleConfig
}
export function syntaxHighlighter(options?:SyntaxHighlighterOptions):Transform
```

### Options explanation

useMinifiedSyntaxHighlighter - this you would leave as the default unless you wanted to debug the plugin

isPartialFn - This affects the generated output.  For some circumstances File.contents could be loose html ( such as for blogger ) and it is necessary to retain that in the output.  If you are not happy with my attempt at it, replace with your own function.

```typescript
private isPartial=function(html:string,file:File){
        const firstTag=html.substring(html.indexOf("<"),html.indexOf(">")).toLowerCase();
        return !(firstTag.startsWith("<!doctype")||firstTag.startsWith("<html")||firstTag.startsWith("<head")||firstTag.startsWith("<body"));
    }
```

minifiedOutput - This defaults to true and if true any css or js added in the output will be minified.

theme - this is the name of a theme.  Possible values are Default, Django, Eclipse, Emacs, FadeToGrey, MDUltra, Midnight and RDark.

customTheme - this is css for your own custom theme instead of using the theme name above

additionalCss - this is css in addition to either the built in themes or your own custom theme.

## Toggle functionality

Toggling is achieved by a small script added to the body that includes the ToggleConfig.createToggleFn string value.
**The signature is as follows** and the default creates two svgs :

```typescript
function createToggleElement(show:boolean):Node
```

There are two ways to indicate that an element requires toggling either globally through the ToggleConfig.toggleState option or by specifying through a data-toggleState attribute on the element.  Note that the latter method supercedes the first.  If there is no toggle state determined for an element through this process then there will be no toggling and the syntax highlighter transformed element will display and there will be no icon generated to hide/show it.

If a toggle state has been specified then toggle elements are created using the createToggleFn with click handlers to hide/show the syntax highlighted element.  Initial state as determined by the toggle state.

Regardless of the createToggleFn used the structure is always the same and the class names are applied using toggleConfig.classNames.  Both have the toggle class and either of the showToggle or hideToggle classes.

```html
<div class="toggleContainer">
    <ToggleElementShow|Hide/>
    <!-- Possibly a text element -->
    <div|span class="toggleText">Message text depending upon settings</div|span>
</div>
```

The toggle container will also get the isShowing class when the element is being shown.

The text element will be present depending upon the 'when' setting.  If 'Always' it will always be present, if 'Hidden' only when hidden.  It will be a span if the placement is "Right", if "Below" it will be a div.

The specification of placement is through the ToggleConfigMessage.placement option. The when setting is like the toggleState in that it can be set globally or on each element through a data- attribute.  All of the ToggleConfigMessage properties other than placement can be set in this manner.  The format is data-toggle*propertyname*. Data-toggle attributes supercede the global values.

The code below determines the message that will be shown.  There is a show message and a hide message which can then have a prefix applied.
The unprefixed message can come from the syntax highlighter title 'class attribute' with useTitle or showMessage|hideMessage as appropriate defaulting to the message config value when no showMessage|hideMessage.  The prefixing works in the same manner.

```typescript

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

        showMessage=(message.prefixShow!==""?message.prefixShow:message.prefix) + showMessage;
        hideMessage=(message.prefixHide!==""?message.prefixHide:message.prefix) + hideMessage;

        return {
            hiddenMessage:hideMessage,
            showMessage:showMessage
        }
    }
```

There is a small amount of css applied ( using the ToggleConfig.classNames ).

```typescript
private getDefaultToggleCss(classNames:ClassNames):string{
        const svgSize="1em";
        return `.${classNames.toggle}{ stroke:#000;top:0.125em;position:relative;height:${svgSize};width:${svgSize} }
        .${classNames.toggleText}{ font-size:${svgSize}}
        `
    }
```

If this is not desired ( perhaps you want to change the stroke colour or perhaps you provided your own createToggleFn ) then you can supply your own with the ToggleConfig.customCss.

## Testing

This has not yet been tested in the traditional sense but you can download the project from github and run gulp demo.  Demo/dest will have two html files that have been transformed by the plugin each with different plugin options chosen to cover all functionality.
