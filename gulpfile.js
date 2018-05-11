var gulp=require('gulp');
var exec = require('child_process').exec;

function tsc(cb){
    exec('tsc', function (err, stdout, stderr) {
        cb(err);
    });
}
function tscToggle(cb){
    exec('tsc -p toggle', function (err, stdout, stderr) {
        cb(err);
    });
}
exports.tsc=tsc;
exports.tscToggle=tscToggle;
exports.default=gulp.parallel(tsc,tscToggle);
