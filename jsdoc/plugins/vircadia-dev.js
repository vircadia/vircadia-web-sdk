exports.handlers = {

    // This event is triggered for each file.
    beforeParse: function (e) {
        e.source = e.source.replace(/\/\*@(dev|sdk)doc/g, "/**");
    },

    processingComplete: function (e) {
        const pathTools = require('path');
        var outputFolder = pathTools.join(__dirname, '../../docs/dev');
        var doclets = e.doclets.map(doclet => Object.assign({}, doclet));
        const fs = require('fs');
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder);
        }
        doclets.map(doclet => {delete doclet.meta; delete doclet.comment});
        fs.writeFile(pathTools.join(outputFolder, "VircadiaWebDev.JSDoc.json"), JSON.stringify(doclets, null, 4), function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("The Vircadia Web SDK JSDoc JSON was saved!");
        });
    }
};
