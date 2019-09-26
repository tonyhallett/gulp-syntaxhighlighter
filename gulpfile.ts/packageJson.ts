import * as fs from "fs-extra"
import * as path from "path";
export function testPackageJson(done:any){
    const packageJsonPath=path.join(path.resolve(__dirname,".."),"package.json");
    const packageJson=fs.readJSONSync(packageJsonPath);
    console.log(packageJson.main);
    done();
}