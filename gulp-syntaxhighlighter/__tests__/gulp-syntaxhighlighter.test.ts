import { SyntaxHighlighterTransform } from '../src/syntaxHighlighterTransform';
import { syntaxHighlighter } from '../src/gulp-syntaxhighlighter';
import { GulpSyntaxHighlighterOptions } from '../src/publicInterfaces';

describe('gulp-syntaxhighlighter',()=>{
    it('should create a SyntaxHighlighterTransform',()=>{
        expect(syntaxHighlighter()).toBeInstanceOf(SyntaxHighlighterTransform);
    })
    it('should pass an empty options if not provided',()=>{
        expect((syntaxHighlighter() as any).options).toEqual({});
    })
    it('should pass through options if provided',()=>{
        const options:GulpSyntaxHighlighterOptions={theme:"Theme"};
        expect((syntaxHighlighter(options) as any).options).toBe(options);
    })
})