
function parse(exp) {
    // TODO
    return exp.split(/,/).map(function(item) {
        var match = item.match(/^(([^:]*):)?([^|]+)(\|[\s\S]*)?$/);
        return {
            arg: match[2] ? match[2].trim() : null,
            name: match[3].trim(),
            filters: !match[4] 
                ? [] 
                : match[4].replace(/\|/, '').split(/\|/).map(function(str) {
                    return str.trim().split(/\s+/);
                }) 
        };
    });
}

module.exports = parse;

