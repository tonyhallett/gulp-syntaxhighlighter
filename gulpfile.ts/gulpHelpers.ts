import {obj} from 'through2'
export const consoleLogger=obj((f,_,cb)=>{
    console.log(f.path);
    cb(null,f);
})