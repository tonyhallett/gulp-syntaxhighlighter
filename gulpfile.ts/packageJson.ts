import * as fs from "fs-extra"
import * as path from "path";
export function testPackageJson(done:any){
    const packageJsonPath=path.join(path.resolve(__dirname,".."),"package.json");
    const packageJson=fs.readJSONSync(packageJsonPath);
    packageJson.main="dist/madeup";
    fs.writeJSONSync(packageJsonPath,packageJson,{
        spaces:2
    })
    done();
}