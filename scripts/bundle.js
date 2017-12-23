const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript');
const rollupResolve = require("rollup-plugin-node-resolve");
const typescript = require('typescript');
const commonjs = require('rollup-plugin-commonjs');
const log = require('./utils').log;
const styles = require('./styles');

exports.compileBundle = function(options) {
    const opts = Object.assign({
        file: null,
        format: 'iife',
        type: 'bundle',
        name: ''
    }, options)

    return new Promise(resolve => {
        rollup.rollup({
            input: opts.file.path,
            plugins: [
                rollupTypescript({
                    typescript: typescript,
                    target: "es6",
                    lib: ["es5", "es6", "dom", "es7", "esnext"],
                    experimentalDecorators: true,
                    moduleResolution: 'node'
                }),
                rollupResolve({
                    jsnext: true,
                    extensions: [ '.ts', '.js', '.json' ]
                }),
                commonjs()
            ]
        }).then(res => {
            res.generate({
                format: opts.format,
                name: opts.name,
                sourcemap: true
            }).then(code => {
                opts.file.contents = new Buffer(styles.injectStyle({code: code.code}));
                opts.file.path = opts.file.path.replace(/\.ts/, `.${opts.type}.js`)

                resolve(opts.file)
            });
        }).catch(err => {
            log(`Error: ${err}`, 4, 'Bundle');
            resolve(null)
        })
    })
}