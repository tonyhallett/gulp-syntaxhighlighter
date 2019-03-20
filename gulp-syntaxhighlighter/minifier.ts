import { processString } from 'uglifycss'
import { minify } from 'uglify-js'
import { IMinifier } from './interfaces'

export class Minifier implements IMinifier {
    public minifies!: boolean;

    initialize(minify: boolean) {
        this.minifies = minify;
    }

    minifyScript(script: string): string {
        if (this.minifies) {
            const minifiedOutput = minify(script);
            if (minifiedOutput.error) {
                throw minifiedOutput.error;
            }
            if (minifiedOutput.warnings) {
                minifiedOutput.warnings.forEach(w => console.log(w));
            }
            script = minifiedOutput.code;
        }
        return script;
    }

    minifyCss(toMinify: string): string {
        return this.minifies ? processString(toMinify) : toMinify;
    }
}

