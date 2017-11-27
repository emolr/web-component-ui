module.exports = function list(items, options) {
    var out = "<ul>";
    for(var i=0, l=items.length; i<l; i++) {
        out = out + "<li>" + options.fn(items[i]) + "</li>";
    }
    
    return `<ul>${items.map(item => {
        return `<li>${options.fn(item)}</li>`
    }).toString().replace(',', '')}</ul>`
}