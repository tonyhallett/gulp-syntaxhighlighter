import { readFileSync } from "fs"
import * as path from "path"
import * as ts from "typescript"
import { isBinaryExpression } from "@babel/types";



//var compilerOptions:ts.CompilerOptions={
//    module:ts.ModuleKind.None,
//    target:ts.ScriptTarget.ES3,
//    strict:true,
//    removeComments:true
//}
//function getTogglePath(){
//    return path.join(process.cwd(),"toggle/src/toggleExport/toggleExport.ts");
//}
//function getToggleText(){
//    return readFileSync(getTogglePath()).toString();
//}
//function getToggleExportsSourceFile(){
//    return ts.createSourceFile(getTogglePath(),getToggleText(),ts.ScriptTarget.ES3,true);
//}
//function printWithoutComments(sourceFileWithoutExports:ts.SourceFile){
//    const printer=ts.createPrinter({
//        removeComments:true
//    });
//    return printer.printFile(sourceFileWithoutExports)
//}
//function removeExport(fd:ts.FunctionDeclaration):ts.FunctionDeclaration{
//    return ts.updateFunctionDeclaration(fd,fd.decorators,[],fd.asteriskToken,
//        fd.name,fd.typeParameters,fd.parameters,fd.type,fd.body);
//}

////#region printing without transform
//function getUpdatedSourceFileWithoutFunctionExports1(){
//    const toggleSourceFile=getToggleExportsSourceFile();
//    return toggleSourceFile.forEachChild<ts.SourceFile>(undefined,(nodes)=>{
//        const functionsWithExport=nodes.filter(n=>ts.isFunctionDeclaration(n)).map(n=>{
//            return removeExport(n as ts.FunctionDeclaration);
//        });
//        return ts.updateSourceFileNode(toggleSourceFile,functionsWithExport)
//    })
//}
//function getUpdatedSourceFileWithoutFunctionExports2(){
//    const toggleSourceFile=getToggleExportsSourceFile();
//    var functionsWithoutExport=toggleSourceFile.statements.reduce((fns,s)=>{
//        if(ts.isFunctionDeclaration(s)){
//            fns.push(removeExport(s));
//        }
//        return fns;
//    },[]);
    
//    /*
//        note that replacing the referencedFiles had no effect
//        still had triple slash even though they were not emitted as such
//        they must have been considered comments.
//        removing all comments with printer options resolves
//    */
//    return ts.updateSourceFileNode(toggleSourceFile,functionsWithoutExport);
//}

//function printWithoutTransform(){
//    const print1=printWithoutComments(getUpdatedSourceFileWithoutFunctionExports1());
//    const print2=printWithoutComments(getUpdatedSourceFileWithoutFunctionExports2());
//    const st="";
//}
////#endregion
////#region transforming
//function getTransformerFactory(){
//    type SourceFileTransformerFactory= (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;

//    const myTransformerFactory:SourceFileTransformerFactory=(context: ts.TransformationContext)=>{
//        return (node:ts.SourceFile)=>{
            
//            const visitor=(node:ts.Node)=>{
//                if(ts.isFunctionDeclaration(node)){
//                    return ts.visitEachChild(node,visitor,context);
//                }
//                if(ts.isModifier(node)){
//                    return undefined;
//                }
//                return node;
//            };

//            return ts.visitEachChild(node,visitor,context);
//        }
//    }
//    return myTransformerFactory;
//}
//const tsAny=ts as any;
//export function getTransformersWithoutModule(compilerOptions: ts.CompilerOptions, customTransformers?: ts.CustomTransformers) {
    
//    const jsx = compilerOptions.jsx;
//    const languageVersion = (ts as any).getEmitScriptTarget(compilerOptions);
//    //const moduleKind = (ts as any).getEmitModuleKind(compilerOptions);
//    const transformers: ts.TransformerFactory<ts.SourceFile | ts.Bundle>[] = [];

//    tsAny.addRange(transformers, customTransformers && customTransformers.before);

//    transformers.push(tsAny.transformTypeScript);

//    if (jsx === ts.JsxEmit.React) {
//        transformers.push(tsAny.transformJsx);
//    }

//    if (languageVersion < ts.ScriptTarget.ESNext) {
//        transformers.push(tsAny.transformESNext);
//    }

//    if (languageVersion < ts.ScriptTarget.ES2017) {
//        transformers.push(tsAny.transformES2017);
//    }

//    if (languageVersion < ts.ScriptTarget.ES2016) {
//        transformers.push(tsAny.transformES2016);
//    }

//    if (languageVersion < ts.ScriptTarget.ES2015) {
//        transformers.push(tsAny.transformES2015);
//        transformers.push(tsAny.transformGenerators);
//    }

//    //transformers.push(getModuleTransformer(moduleKind));

//    // The ES5 transformer is last so that it can substitute expressions like `exports.default`
//    // for ES3.
//    if (languageVersion < ts.ScriptTarget.ES5) {
//        transformers.push(tsAny.transformES5);
//    }

//    tsAny.addRange(transformers, customTransformers && customTransformers.after);

//    return transformers;
//}
//function transpileWithoutModule(){
//    const transformersOriginal=tsAny.getTransformers;
//    tsAny.getTransformers=getTransformersWithoutModule;
//    const output= ts.transpileModule(getToggleText(),{
//        compilerOptions:compilerOptions,
//        transformers:{
//            before:[
//                getTransformerFactory()
//            ]
//        }
//    }).outputText;
//    tsAny.getTransformers=transformersOriginal;
//    return output;
//}
//function transpileTranformerRemovingExternalModuleIndicator(){
//    type SourceFileTransformerFactory= (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;

//    const myTransformerFactory:SourceFileTransformerFactory=(context: ts.TransformationContext)=>{
//        return (node:ts.SourceFile)=>{
//            (node as any).externalModuleIndicator=undefined;
//            const visitor=(node:ts.Node)=>{
//                if(ts.isFunctionDeclaration(node)){
//                    return ts.visitEachChild(node,visitor,context);
//                }
//                if(ts.isModifier(node)){
//                    return undefined;
//                }
//                return node;
//            };

//            return ts.visitEachChild(node,visitor,context);
//        }
//    }
//    const output = ts.transpileModule(getToggleText(),{
//        compilerOptions:compilerOptions,
//        transformers:{
//            before:[
//                myTransformerFactory
//            ]
//        }
//    }).outputText;
//    const st="";
//}
//function transpileRemoving__esModule(){
//    type SourceFileTransformerFactory= (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
    
//    const remove__esModuleFactory:SourceFileTransformerFactory=(context: ts.TransformationContext)=>{
        
//        const previousOnSubstituteNode=context.onSubstituteNode;
//        context.enableSubstitution(ts.SyntaxKind.ExpressionStatement);
//        context.onSubstituteNode=((hint,node)=>{
//            node=previousOnSubstituteNode(hint,node);
            
//            if(ts.isExpressionStatement(node)&&ts.isBinaryExpression(node.expression)&&ts.isPropertyAccessExpression(node.expression.left)){
//                let pe:ts.PropertyAccessExpression=node.expression.left;
//                if(pe.name.text==="__esModule"){
//                    return ts.createEmptyStatement();
//                }
//            }
//            return node;
//        });
//        return node=>node;
            
//    }
//    const output= ts.transpileModule(getToggleText(),{
//        compilerOptions:compilerOptions,
//        transformers:{
//            before:[
//                getTransformerFactory(),
//            ],
//            after:[remove__esModuleFactory]
//        }
//    }).outputText;
//    const st="";
//}
//function useTranspileTransform(){
//    /*
//    this way get exports.__esModule = true; https://github.com/Microsoft/TypeScript/issues/14351
//    of course can string replace - js transformer...

//    which comes from the createUnderscoreUnderscoreESModule inside the transform module

//    transpileModule -> createProgram(..).emit -> emitter.emitFiles
//    emitter - getTransformers will include a module transformer
//    function getModuleTransformer(moduleKind: ModuleKind): TransformerFactory<SourceFile | Bundle> {
//        switch (moduleKind) {
//            case ModuleKind.ESNext:
//            case ModuleKind.ES2015:
//                return transformES2015Module;
//            case ModuleKind.System:
//                return transformSystemModule;
//            default:
//                return transformModule; ****************************
//        }
//    }
    
//    */
//    return ts.transpileModule(getToggleText(),{
//        compilerOptions:compilerOptions,
//        transformers:{
//            before:[
//                getTransformerFactory()
//            ]
//        }
//    }).outputText;
    
//}
//function useTransform(){
//    const transformed=ts.transform(getToggleExportsSourceFile(),[getTransformerFactory()],compilerOptions).transformed[0];
//    const js=printWithoutComments(transformed);
//    const st="";
//}
export function tempTaskForDebug(done){
    var st="";
    console.log("in debug")
    done();
}

//function usePrinterSubstitution(){
//    const printer=ts.createPrinter({removeComments:true},{
//        substituteNode(hint:ts.EmitHint,node:ts.Node){
//            if(ts.isFunctionDeclaration(node)){
//                return removeExport(node);
                
//            }
//            return node;
//        }
//    })
    
//    const transformed=printer.printFile(getToggleExportsSourceFile());
//    const st="";
    
//}
//function demoEmitSubstituteCallbacksOrder(){
//    const source=`
//        const someVar=5;
//    `
//    type SourceFileTransformerFactory= (context: ts.TransformationContext) => ts.Transformer<ts.SourceFile>;
//    function createDemoFactory(factoryName:string):SourceFileTransformerFactory{
//        return (context)=>{
//            context.enableEmitNotification(ts.SyntaxKind.ConstKeyword);
//            context.enableSubstitution(ts.SyntaxKind.ConstKeyword);
//            const previousOnEmitNode=context.onEmitNode;
//            const previousOnSubstituteNode=context.onSubstituteNode;
//            context.onEmitNode=(hint,node,callback)=>{
//                console.log(`${factoryName} onEmitNode`);
//                previousOnEmitNode(hint,node,callback);
//            }
//            context.onSubstituteNode=(hint,node)=>{
//                console.log(`${factoryName} onSubstituteNode`);
//                node=previousOnSubstituteNode(hint,node);
//                return node;
//            }
//            return (sourceFile)=>sourceFile;
//        }
//    }
//    const factory1:SourceFileTransformerFactory=createDemoFactory("factory1");
//    const factory2:SourceFileTransformerFactory=createDemoFactory("factory2");
//    const transpileOutput=ts.transpileModule(source,{
//        transformers:{
//            before:[factory1,factory2]
//        }
//    })
//    const st="";
//}
//function printBundleDoesCallbackForSourceFiles(){
//    /**
//    * Prints a bundle of source files as-is, without any emit transformations.
//    */

//    const bundle=ts.createBundle([ts.createSourceFile("","const c=5",ts.ScriptTarget.ES3)]);
//    const printer=ts.createPrinter({},{
//        onEmitNode:(hint,node)=>{
//            switch(node.kind){
//                case ts.SyntaxKind.Bundle:
//                    console.log("bundle");
//                    break;
//                case ts.SyntaxKind.SourceFile:
//                    console.log("source file ");
//                default:
//                    console.log(node.kind);
//            }
            
//        }
//    });
//    printer.printBundle(bundle);
//}
//function vistorDoesNotWorkWithBundle(){
    /* const bundle=ts.createBundle(
        [ts.createSourceFile("","const c=5",ts.ScriptTarget.ES3)]
    );
    const updated=ts.visitEachChild(bundle,(n)=>{
        return n;
    },null); */
    //var st="";
//}
//#endregion
export function generateExported(done){
    //printWithoutTransform();
    //useTransform();
    //usePrinterSubstitution();
    //vistorDoesNotWorkWithBundle();
    //transpileTranformerRemovingExternalModuleIndicator();
    //const transpileTransformWithoutModules=transpileWithoutModule();
    
    
    done();
}
