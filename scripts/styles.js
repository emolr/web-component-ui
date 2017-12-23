const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const path = require('path');
const fs = require('fs-extra');
const log = require('./utils').log;

const postcssOptions = [autoprefixer({browsers: ['last 2 versions']})]

exports.compileStyle = function(options) {
    const opts = Object.assign({
        code: '',
        sourceMap: false,
        cwd: process.cwd()
    }, options)

    try {
        const css = sass.renderSync({
            data: opts.code,
            outputStyle: 'expanded',
            includePaths: [ path.resolve(`${opts.cwd}`) ],
            sourceMap: opts.sourceMap,
            sourceMapEmbed: opts.sourceMap
        }).css.toString('utf8');

        return postcss(postcssOptions).process(css).css;
    } catch(err) {
        log(`Error: ${err}`, 4, 'Documentation');
        return;
    }
};

exports.injectStyle = function(options) {
    let opts = Object.assign({
        cwd: process.cwd(),
        code: '',
        sourceMap: false,
        regex: /@style\('([^]*?)'\)/g
    }, options)
    return opts.code.replace(opts.regex, (match, stylePath) => {
        let scss = '';

        try {
            scss = fs.readFileSync(path.resolve(`${opts.cwd}/${stylePath}`), {encoding: 'utf8'})
        } catch(err) {
            log(`Error: ${err}`, 4, 'Styles');
        }

        if (scss !== '') {
            return this.compileStyle({
                code: scss,
                sourceMap: opts.sourceMap,
                cwd: opts.cwd
            })
        } else {
            return;
        }
    });
};