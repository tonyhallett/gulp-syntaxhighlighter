///<reference path="../toggle/toggleDefns.d.ts"/>
import { GulpTransformBaseOptions,File } from 'gulptransformbase'
export type IClassNames=Partial<ClassNames>
export type IToggleConfigMessages=Partial<ToggleConfigMessages>
export interface IToggleConfig {
    createToggleFn?: string,
    customCss?: string,
    toggleState?: "Show" | "Hide",
    message?: IToggleConfigMessages,
    classNames?: IClassNames
}

export interface SyntaxHighlighterOptions {
    isPartialFn?: (html: string, file: File) => boolean
    useMinifiedSyntaxHighlighter?: boolean
    minifiedOutput?: boolean
    theme?: string,
    customTheme?: string,
    additionalCss?: string,
    globalParams?:
    {
        /** Additional CSS class names to be added to highlighter elements. */
        /** default '' */
        "class-name"?: string,
        /** First line number. */
        /** Default 1 */
        "first-line"?: number
        /**
		 * Pads line numbers. Possible values are:
		 *
		 *   false - don't pad line numbers. ( default )
		 *   true  - automaticaly pad numbers with minimum required number of leading zeroes.
		 *   [int] - length up to which pad line numbers.
		 */
        'pad-line-numbers'?: boolean,

        /** Lines to highlight. */
        //** default null */
        'highlight'?: number[],

        /** Title to be displayed above the code block. */
        //** Default null */
        'title'?: string,

        /** Enables or disables smart tabs. */
        /** default true */
        'smart-tabs'?: boolean,

        /** Gets or sets tab size. */
        /** Default 4 */
        'tab-size'?: number,

        /** Enables or disables gutter. */
        /** default true */
        'gutter'?: boolean,

        /** Enables or disables toolbar. */
        /** Default true */
        //'toolbar' : boolean,

        /** Enables quick code copy and paste from double click. */
        /** default true */
        //'quick-code' : boolean,

        /** Forces code view to be collapsed. */
        //** default false */
        //'collapse' : boolean,

        /** Enables or disables automatic links. */
        /** default true */
        'auto-links'?: boolean,

        /** Gets or sets light mode. Equavalent to turning off gutter and toolbar. */
        /** default false */
        //'light' : boolean,

        /** default true */
        'unindent'?: boolean,

        //** default false */
        'html-script'?: false
    }
    config?: {
        //** default &nbsp; */
        space?: string,

        /** Enables use of <SCRIPT type="syntaxhighlighter" /> tags. */
        /** default true */
        useScriptTags?: boolean,

        /** Blogger mode flag. */
        /** default false */
        bloggerMode?: boolean,

        //default false
        stripBrs?: boolean,

        /** Name of the tag that SyntaxHighlighter will automatically look for. */
        /** default pre */
        tagName?: string,

        //strings? : {
        /** default 'expand source' */
        //expandSource : string,
        /** default ? */
        //help : string,
        /** dwfault 'SyntaxHighlighter\n\n */
        //alert: string,
        //default 'Can\'t find brush for: '
        //noBrush : string,
        //brushNotHtmlScript : 'Brush wasn\'t configured for html-script option: ',

        // this is populated by the build script
        //aboutDialog : string
        //}
    }
    //if not present then no toggle js/css
    toggleConfig?: IToggleConfig
}

export interface SyntaxHighlighterTransformOptions extends GulpTransformBaseOptions, SyntaxHighlighterOptions { }
