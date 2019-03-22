import * as fs from 'fs'
import * as path from 'path'

export function getFilteredFilesFromDirectoryDeep(startPath: string, filter: (path: string) => boolean, paths: string[] = []) {
    if (!fs.existsSync(startPath)) {
        console.log("no dir: " + startPath);
        return paths;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            getFilteredFilesFromDirectoryDeep(filename, filter, paths);
        }
        else if (filter(filename)) {
            paths.push(filename);
        };
    };
    return paths;
};