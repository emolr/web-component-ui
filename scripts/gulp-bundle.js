const through = require('through2')
const path = require('path')
const applySourceMap = require('vinyl-sourcemaps-apply');
const fs = require('fs-extra')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript');
const typescript = require('typescript')
const rollupResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const chalk = require("chalk")

exports.gulpBundle = function(options) {
    const opts = Object.assign({
        format: 'iife',
        type: 'bundle',
        sourceMap: true
    }, options)

    return through.obj(function(file, encoding, callback) {
        // console.log(file.contents.toString())
        const outputPath = file.path.replace(/\.ts/, `.${opts.type}.js`)
        const name = path.parse(file.path).name.replace(/-([a-z])/g, (g) => { 
            return g[1].toUpperCase(); 
        }).replace(/\.ts/, '');

        rollup.rollup({
            input: file.path,
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
                name: name,
                sourcemap: opts.sourceMap
            }).then(code => {
                code.map.file = outputPath;
                file.originalPath = file.path;
                file.path = outputPath;
                file.contents = new Buffer(code.code)
                applySourceMap(file, code.map)
                callback(null, file);
            });
        }).catch(err => {
            console.log(chalk`{red ${err}}`)
            callback(null, file);
        })
      });
}