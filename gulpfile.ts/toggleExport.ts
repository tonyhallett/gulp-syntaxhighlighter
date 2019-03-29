import { readFileSync } from "fs"
import * as path from "path"
import * as ts from "typescript"

//copy across the tsconfig as well as change the --module
export function generateExported(done){
    const togglePath=path.join(process.cwd(),"toggle/src/toggle.ts");

    const toggleTs=readFileSync(togglePath).toString();
    const toggleSource=ts.createSourceFile(togglePath,toggleTs,ts.ScriptTarget.ES3,true);
    let fdNames=[];
    let others=[];
    toggleSource.forEachChild((node)=>{
        switch(node.kind){
            case ts.SyntaxKind.FunctionDeclaration:
                const fd=node as ts.FunctionDeclaration;
                fdNames.push(fd.name.escapedText);
                break;
            default:
                others.push(node.kind);
                break;
        }
    });
    var st="";
    done();
}