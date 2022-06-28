/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-shadow */
const fs = require("fs");
const path = require("path");
const util = require("util");
const TurndownService = require("turndown");

fs.mkdir("docs/markdown", (error) => {
    if (error) {
        console.log("Folder exists already.");
    } else {
        fs.mkdirSync("docs/markdown", { recursive: true });
    }
});
function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, "utf-8", function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}
// for dev it would be docs/dev/
readFiles("docs/sdk/", function (filename, content) {
    const fileExt = filename.split(".").pop();
    const fileWithoutExt = filename.split(".").shift();
    if (fileExt === "html") {
        fs.readFile(path.join(__dirname, "docs", "dev", filename), "utf8", function (err, data) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            const content = util.format(data);
            const turndownService = new TurndownService();
            const markdown = turndownService.turndown(content);
            fs.writeFile(`./docs/markdown/${fileWithoutExt}.md`, markdown, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("File written successfully\n");
                }
            });
        });
    }
}, function (err) {
    // return null;
});
