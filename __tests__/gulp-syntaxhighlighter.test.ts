import { SyntaxHighlighterTransform } from '../gulp-syntaxhighlighter/syntaxHighlighterTransform';
import { syntaxHighlighter } from '../gulp-syntaxhighlighter/gulp-syntaxhighlighter';
import { GulpSyntaxHighlighterOptions } from '../gulp-syntaxhighlighter/publicInterfaces';

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