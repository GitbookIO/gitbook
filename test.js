var path = require("path");
var generate = require("./lib/generate");

generate.folder(
    path.resolve(__dirname, "../jsbook"),
    path.resolve("../output"),
    {
        title: "Javascript",
        github: "GitbookIO/javascript"
    }
).then(function(output) {
    console.log(output)
}, function(err) {
    console.log(err.stack, err);
})