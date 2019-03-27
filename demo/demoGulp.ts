interface MyGen<T>{
    Doit(arg:T):T
}
class MyGenString implements MyGen<string>{
    Doit(arg: string): string {
        return arg;
    }

}

export function typescriptTask(done){
    var c=new MyGenString();
    c.Doit("Do it");
    done();
}
