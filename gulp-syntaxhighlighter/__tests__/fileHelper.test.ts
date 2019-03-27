import {getFilteredFilesFromDirectoryDeep} from '../src/fileHelper'

class MockLstat{
    constructor(private readonly path:string){}
    public isDirectory(){
        return !this.path.startsWith("file");
    }
}
jest.mock('fs',()=>{
    return {
        existsSync:jest.fn(path=>{
            return path==="badPath"?false:true
        }),
        readdirSync:jest.fn((dir:string)=>{
            if(dir==="singlelevel"){
                return ["file1","file2"];
            }else if(dir==="deep"){
                return ["file1","nested"]
            }else if(dir==="nesteddeep"){
                return ["file1nested","file2nested"]
            }else if(dir==="empty"){
                return [];
            }
        }),
        lstatSync:jest.fn((filename:string)=>new MockLstat(filename))
    }
})
const spiedLog=jest.spyOn(global.console,"log");

jest.mock('path',()=>{
    return {
        join:jest.fn((dir:string,file:string)=>{
            return file+dir;
        })
    }
})

describe("getFilteredFilesFromDirectoryDeep",()=>{
    it('should provide the paths container if not provided',()=>{
        const paths=getFilteredFilesFromDirectoryDeep("empty",null as any);
        expect(paths).toBeInstanceOf(Array);
    })
    it('should log to the console if the start path does not exist',()=>{
        const paths=getFilteredFilesFromDirectoryDeep("badPath",null as any);
        expect(spiedLog).toHaveBeenCalledWith("no dir: badPath");
    })
    it('should call the callback with the file path and the file name',()=>{
        const callback=jest.fn();
        getFilteredFilesFromDirectoryDeep("singlelevel",callback);
        expect(callback).toHaveBeenNthCalledWith(1,"file1singlelevel","file1");
        expect(callback).toHaveBeenNthCalledWith(2,"file2singlelevel","file2");
    })
    describe('no nested folders',()=>{
        it('should add to paths filtered files',()=>{
            const paths=getFilteredFilesFromDirectoryDeep("singlelevel",(p=>{
                return p==="file2singlelevel";
            }));
            expect(paths).toEqual(["file2singlelevel"]);
        })
    })
    describe('nested folders',()=>{
        it('should add to paths filtered files',()=>{
            const paths=getFilteredFilesFromDirectoryDeep("deep",(p=>{
                return p!=="file1nestednesteddeep";
            }));
            expect(paths).toEqual(["file1deep","file2nestednesteddeep"]);
        })
    })
})