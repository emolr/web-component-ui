const through = require('through2')
const sass = require('node-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const postcssOptions = [ autoprefixer({ browsers: ['last 2 versions'] }) ]
const path = require('path')
const fs = require('fs-extra')
const applySourceMap = require('vinyl-sourcemaps-apply');

exports.gulpSassInject = function(options) {
    const opts = Object.assign({
        sourceMap: true,
        outputStyle: 'expanded',
        postcssOptions: postcssOptions
    }, options)

    return through.obj(function(file, encoding, callback) {
        file.contents = new Buffer(file.contents.toString().replace(/@style\('([^]*?)'\)/g, (match, filepath) => {
            try {
                const fullFilepath = path.resolve(`${process.cwd()}/${filepath}`)
                const style = fs.readFileSync(fullFilepath, {encoding: 'utf8'})

                const compiledStyle = sass.renderSync({
                    data: style,
                    outputStyle: opts.outputStyle,
                    file: filepath,
                    includePaths: [ path.resolve(process.cwd()) ],
                    sourceMap: opts.sourceMap,
                    sourceMapEmbed: opts.sourceMap,
                    sourceMapContents: opts.sourceMap,
                    outFile: filepath
                })

                const code = {
                    css: postcss(postcssOptions).process(compiledStyle.css.toString()).css
                }

                return code.css

            } catch(err) {
                console.log(err)
                return
            }
        }))

        callback(null, file);
      });
}