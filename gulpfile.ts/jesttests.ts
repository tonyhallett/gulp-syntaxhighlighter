import {exec} from 'child_process'

export function jestTests(done){
    exec('npm run test', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
}