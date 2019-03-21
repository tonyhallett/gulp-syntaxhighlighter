import { Minifier} from '../gulp-syntaxhighlighter/minifier'

const spiedLog=jest.spyOn(global.console,"log");
jest.mock('uglifycss',()=>{
    return {
        processString:jest.fn().mockReturnValue('Uglified css')
    }
});

//todo - specify the return value in each test
jest.mock('uglify-js',()=>{
    return {
        minify:jest.fn().mockReturnValueOnce({code:'Uglified js'})
        .mockReturnValueOnce({error:new Error('uglify error')})
        .mockReturnValueOnce({warnings:["warning1","warning2"]})
    }

})
describe('Minifier',()=>{
    function createMinifier(minifies:boolean){
        const minifier=new Minifier();
        minifier.initialize(minifies);
        return minifier;
    }
    describe('when minifies',()=>{
        const minifiesMinifier=createMinifier(true);
        it('should minifyCss with uglifycss',()=>{
            expect(minifiesMinifier.minifyCss("toMinify")).toBe("Uglified css");
        })
        it('should minify with uglify-js',()=>{
            expect(minifiesMinifier.minifyScript("toMinify")).toBe("Uglified js")
        })
        describe("js errors and warnings",()=>{
            it('should throw errors',()=>{
                expect(()=>minifiesMinifier.minifyScript('')).toThrow('uglify error');
            })
            it('should log warnings to the console',()=>{
                minifiesMinifier.minifyScript('');
                expect(spiedLog).toHaveBeenCalledTimes(2);
                expect(spiedLog).toHaveBeenNthCalledWith(1,"warning1");
                expect(spiedLog).toHaveBeenNthCalledWith(2,"warning2");
            })
        })
    })
    describe('when does not minify',()=>{
        const minifierNoMinify=createMinifier(false);
        it('should return the css',()=>{
            expect(minifierNoMinify.minifyCss("css to return")).toBe("css to return");
        })
        it('should return the js',()=>{
            expect(minifierNoMinify.minifyScript("js to return")).toBe("js to return")
        })
    })
    
})

/* interface TestOptions{
    minifies:boolean,
    expectedMinifyScript:string,
    expectedMinifyCss:string
}
const script=`
function someFunction(someArg){
    var someVar="someValue";
}
`
const css=`
body {
    background-color: powderblue;
  }
  h1 {
    color: blue;
  }
  p {
    color: red;
  }
`
describe('Minifier',()=>{
    describe('minification no errors',()=>{
        function minifyScript(){
            var minified=minify(script);
            expect(minified.error).toBeUndefined();
            expect(minified.warnings).toBeUndefined();
            return minified.code;
        }
        
        const testOptions:Array<TestOptions>=[
            {
                minifies:false,
                expectedMinifyScript:script,
                expectedMinifyCss:css
            },
            {
                minifies:true,
                expectedMinifyScript:minifyScript(),
                expectedMinifyCss:processString(css)
            }
        ]
        testOptions.forEach(testOption=>{
            it('should or should not minify',()=>{
                var minifier=new Minifier();
                minifier.initialize(testOption.minifies);
                expect(minifier.minifyScript(script)).toBe(testOption.expectedMinifyScript);
                expect(minifier.minifyCss(css)).toBe(testOption.expectedMinifyCss);
            })
        });
    })
    xdescribe('minify javascript errors',()=>{
        //todo this need to module mock
    })
    
}) */