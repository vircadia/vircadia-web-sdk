function endsWith(path, exts) {
    var result = false;
    exts.forEach(function (ext) {
        if (path.endsWith(ext)) {
            result = true;
        }
    });
    return result;
}

exports.handlers = {

    // This event is triggered before parsing has started.
    // Scan the JavaScript files for JSDoc comments and reformat to enable.
    beforeParse: function (e) {
        var pathTools = require('path');
        var rootFolder = pathTools.dirname(e.filename);
        console.log("Scanning the Vircadia source for JSDoc comments...");

        // Directories to scan for JSDoc comments.
        var dirList = [
            '.'
        ];

        // Files with these extensions will be searched for JSDoc comments.
        var exts = ['.js', '.mjs'];

        var fs = require('fs');
        dirList.forEach(function (dir) {
            var joinedDir = pathTools.join(rootFolder, dir);
            var files = fs.readdirSync(joinedDir);
            files.forEach(function (file) {
                var path = pathTools.join(joinedDir, file);
                if (fs.lstatSync(path).isFile() && endsWith(path, exts)) {
                    // load entire file into a string
                    var data = fs.readFileSync(path, "utf8");

                    // this regex searches for blocks starting with /*@sdkdoc and ending with */
                    var reg = /(\/\*@sdkdoc(.|[\r\n])*?\*\/)/gm;
                    var matches = data.match(reg);
                    if (matches) {
                        // add to source, but strip off c-comment asterisks
                        e.source += matches.map(function (s) {
                            return s.replace('/*@sdkdoc', '/**');
                        }).join('\n');
                    }
                }
            });
        });
    },

    processingComplete: function (e) {
        const pathTools = require('path');
        var outputFolder = pathTools.join(__dirname, '../../docs/sdk');
        var doclets = e.doclets.map(doclet => Object.assign({}, doclet));
        const fs = require('fs');
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder);
        }
        doclets.map(doclet => {delete doclet.meta; delete doclet.comment});
        fs.writeFile(pathTools.join(outputFolder, "VircadiaWebSDK.JSDoc.json"), JSON.stringify(doclets, null, 4), function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("The Vircadia Web SDK JSDoc JSON was saved!");
        });
    }
};
