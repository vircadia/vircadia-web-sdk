function endsWith(path, exts) {
    var result = false;
    exts.forEach(function(ext) {
        if (path.endsWith(ext)) {
            result = true;
        }
    });
    return result;
}

exports.handlers = {

    // This event is triggered before parsing has even started.
    // We use this event to scan the C++ files for jsdoc comments
    // and reformat them into a form digestable by jsdoc.
    beforeParse: function(e) {
        var pathTools = require('path');
        var rootFolder = pathTools.dirname(e.filename);
        console.log("Scanning the Vircadia source for JSDoc comments...");

        // directories to scan for jsdoc comments
        var dirList = [
            '.'
        ];

        // only files with this extension will be searched for jsdoc comments.
        var exts = ['.h', '.cpp'];

        var fs = require('fs');
        dirList.forEach(function (dir) {
            var joinedDir = pathTools.join(rootFolder, dir);
            var files = fs.readdirSync(joinedDir);
            files.forEach(function (file) {
                var path = pathTools.join(joinedDir, file);
                if (fs.lstatSync(path).isFile() && endsWith(path, exts)) {
                    // load entire file into a string
                    var data = fs.readFileSync(path, "utf8");

                    // this regex searches for blocks starting with /**jsdoc and end with */
                    var reg = /(\/\*\*jsdoc(.|[\r\n])*?\*\/)/gm;
                    var matches = data.match(reg);
                    if (matches) {
                        // add to source, but strip off c-comment asterisks
                        e.source += matches.map(function (s) {
                            return s.replace('/**jsdoc', '/**');
                        }).join('\n');
                    }
                }
            });
        });
    },

    // This event is triggered when a new doclet has been created
    // but before it is passed to the template for output
    newDoclet: function (e) {

        // we only care about hifi custom tags on namespace and class doclets
        if (e.doclet.kind === "namespace" || e.doclet.kind === "class") {
            var rows = [];
            if (e.doclet.hifiInterface) {
                rows.push("Interface Scripts");
            }
            if (e.doclet.hifiClientEntity) {
                rows.push("Client Entity Scripts");
            }
            if (e.doclet.hifiAvatar) {
                rows.push("Avatar Scripts");
            }
            if (e.doclet.hifiServerEntity) {
                rows.push("Server Entity Scripts");
            }
            if (e.doclet.hifiAssignmentClient) {
                rows.push("Assignment Client Scripts");
            }

            // Append an Available In: sentence at the beginning of the namespace description.
            if (rows.length > 0) {
                var availableIn = "<p class='availableIn'><b>Supported Script Types:</b> " + rows.join(" &bull; ") + "</p>";
             
                e.doclet.description = availableIn + (e.doclet.description ? e.doclet.description : "");
            }            
        }

        if (e.doclet.kind === "function" && e.doclet.returns && e.doclet.returns[0].type
                && e.doclet.returns[0].type.names[0] === "Signal") {
            e.doclet.kind = "signal";
        }
    }
};

// Define custom hifi tags here
exports.defineTags = function (dictionary) {

    // @hifi-interface
    dictionary.defineTag("hifi-interface", {
        onTagged: function (doclet, tag) {
            doclet.hifiInterface = true;
        }
    });

    // @hifi-assignment-client
    dictionary.defineTag("hifi-assignment-client", {
        onTagged: function (doclet, tag) {
            doclet.hifiAssignmentClient = true;
        }
    });

    // @hifi-avatar-script
    dictionary.defineTag("hifi-avatar", {
        onTagged: function (doclet, tag) {
            doclet.hifiAvatar = true;
        }
    });

    // @hifi-client-entity
    dictionary.defineTag("hifi-client-entity", {
        onTagged: function (doclet, tag) {
            doclet.hifiClientEntity = true;
        }
    });

    // @hifi-server-entity
    dictionary.defineTag("hifi-server-entity", {
        onTagged: function (doclet, tag) {
            doclet.hifiServerEntity = true;
        }
    });

};
