import {JsDomDocumentFactory} from '../src/jsDomDocumentFactory'
import {JsDomDocument} from '../src/jsDomDocument'
import {ToggleDocumentManager} from '../src/toggleDocumentManager'
import {ToggleDocumentManagerFactory} from '../src/toggleDocumentManagerFactory'
import {SyntaxHighlighterDocumentManagerFactory} from '../src/syntaxHighlighterDocumentManagerFactory'
import {SyntaxHighlighterDocumentManager} from '../src/syntaxHighlighterDocumentManager'

jest.mock('../src/jsDomDocument',()=>{
    return {
        JsDomDocument:jest.fn().mockReturnValue({})
    }
})
jest.mock('../src/toggleDocumentManager',()=>{
    return {
        ToggleDocumentManager:jest.fn().mockReturnValue({})
    }
})
jest.mock('../src/syntaxHighlighterDocumentManager',()=>{
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