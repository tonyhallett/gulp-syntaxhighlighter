import {JsDomDocumentFactory} from '../gulp-syntaxhighlighter/jsDomDocumentFactory'
import {JsDomDocument} from '../gulp-syntaxhighlighter/jsDomDocument'
import {ToggleDocumentManager} from '../gulp-syntaxhighlighter/toggleDocumentManager'
import {ToggleDocumentManagerFactory} from '../gulp-syntaxhighlighter/toggleDocumentManagerFactory'
import {SyntaxHighlighterDocumentManagerFactory} from '../gulp-syntaxhighlighter/syntaxHighlighterDocumentManagerFactory'
import {SyntaxHighlighterDocumentManager} from '../gulp-syntaxhighlighter/syntaxHighlighterDocumentManager'

jest.mock('../gulp-syntaxhighlighter/jsDomDocument',()=>{
    return {
        JsDomDocument:jest.fn().mockReturnValue({})
    }
})
jest.mock('../gulp-syntaxhighlighter/toggleDocumentManager',()=>{
    return {
        ToggleDocumentManager:jest.fn().mockReturnValue({})
    }
})
jest.mock('../gulp-syntaxhighlighter/syntaxHighlighterDocumentManager',()=>{
    return {
        SyntaxHighlighterDocumentManager:jest.fn().mockReturnValue({})
    }
})
describe('jsDomDocumentFactory',()=>{
    it('should create a jsDomDocument with the html',()=>{
        const factory=new JsDomDocumentFactory();
        var doc=factory.create("Some html");
        expect(doc).toBeTruthy();
        expect((JsDomDocument as any as jest.Mock).mock.calls[0][0]).toBe("Some html");
    })
});

describe('toggleDocumentManagerFactory',()=>{
    it('should create a toggleDocumentManager with the args',()=>{
        const factory=new ToggleDocumentManagerFactory();
        var mockDoc={} as any;
        var mockMinifier={} as any;
        var toggle=factory.create(mockDoc,mockMinifier);
        expect(toggle).toBeTruthy();
        expect(ToggleDocumentManager as any as jest.Mock).toBeCalledWith(mockDoc,mockMinifier);
    })
})

describe('syntaxHighlighterDocumentManagerFactory',()=>{
    it('should create a syntaxHighlighterDocumentManagerFactory with the args',()=>{
        const factory=new SyntaxHighlighterDocumentManagerFactory();
        var mockDoc={} as any;
        var mockMinifier={} as any;
        var mockAssetLoader={} as any;
        var toggle=factory.create(mockDoc,mockMinifier,mockAssetLoader);
        expect(toggle).toBeTruthy();
        expect(SyntaxHighlighterDocumentManager as any as jest.Mock).toBeCalledWith(mockDoc,mockMinifier,mockAssetLoader);
    })
})