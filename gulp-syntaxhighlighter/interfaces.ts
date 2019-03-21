import { IToggleConfig, SyntaxHighlighterOptions } from "./publicInterfaces";

export interface ISyntaxHighlighterAssetLoader {
    getScripts(minified: boolean): string[];
    getTheme(minified: boolean, theme: string): string;
}

export interface IJsDomDocumentFactory {
    create(html: string): IJsDomDocument
}

export interface IJsDomDocument {
    addSyntaxHighlighterScript(contents: string): void;
    addToggleScript(contents: string): void;
    addCss(css: string): void;
    getNewContents(isPartial: boolean): string;
}

export interface IMinifier {
    minifies: boolean;
    initialize(minifies: boolean): void;
    minifyScript(script: string): string;
    minifyCss(toMinify: string): string;
}

export interface ISyntaxHighlighterDocumentManagerFactory {
    create(jsDomDocument: IJsDomDocument, minifier: IMinifier, assetLoader: ISyntaxHighlighterAssetLoader): ISyntaxHighlighterDocumentManager;
}
export type SyntaxHighlighterGlobalParamsNoToolbar=SyntaxHighlighterOptions["globalParams"]&{toolbar:false};
export interface ISyntaxHighlighterDocumentManager {
    addSyntaxHighlighterScripts(useMinifiedSyntaxHighlighter: boolean): void;
    addCustomTheme(customTheme: string): void;
    addAdditionalCss(additionalCss: string): void;
    addNamedTheme(themeName: string): void;
    applySyntaxHighlighter(globalParams: SyntaxHighlighterGlobalParamsNoToolbar, config: SyntaxHighlighterOptions["config"] ): void;
}

export interface IToggleDocumentManagerFactory {
    create(jsDomDocument: IJsDomDocument, minifier: IMinifier, toggleConfig: IToggleConfig): IToggleDocumentManager;
}

export interface IToggleDocumentManager {
    addToggle(): void;
}