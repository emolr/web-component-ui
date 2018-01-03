const through = require('through2')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const fs = require('fs-extra')
const handlebars = require('handlebars')

exports.replaceExample = function() {
    return through.obj(function(file, encoding, callback) {
        const content = JSON.parse(file.contents.toString());

        const replacer = (match, p1, p2, p3, p4, p5, p6) => {
            return `
            ${p1}${entities.decode(p6)}${p3}
            <pre>
                <code class="lang-html">${p6}</code>
            </pre>
            `
        };

        content.body = content.body.replace(/<!--\n```([^]*?)(<next-code-block[^]*?<\/next-code-block>)([^]*?)(```\n-->)([^]*?<pre><code class="lang-html">)([^]*?)<\/code><\/pre>/g, replacer)
        file.contents = new Buffer(JSON.stringify(content));
        
        callback(null, file); 
    });
}

exports.compileHandlebarsTemplate = function(template) {
    return through.obj(function(file, encoding, cb) {
        const content = fs.readFileSync(template, err => {
            log(`Error: ${err}`, 4, 'Handlebars');
        });
        
        const hbTemplate = handlebars.compile(content.toString());

        file.contents = new Buffer(hbTemplate(JSON.parse(file.contents.toString())))

        file.path = file.path.replace('.json', '.html')
        
        cb(null, file)
    })

}