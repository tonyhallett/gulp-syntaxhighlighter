import * as fs from 'fs'
import * as path from 'path'

export function getFilteredFilesFromDirectoryDeep(startPath: string, filter: (path: string,fileName:string) => boolean, paths: string[] = []) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir: " + startPath);
        return paths;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var file=files[i];
        var filename = path.join(startPath, file);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            getFilteredFilesFromDirectoryDeep(filename, filter, paths);
        }
        else if (filter(filename,file)) {
            paths.push(filename);
        };
    };
    return paths;
};