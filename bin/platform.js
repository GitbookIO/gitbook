var Q = require("q");
var utils = require("./utils");

var publish = function(folder) {
    if (!folder) {
        console.log("Need a repository folder");
        return process.exit(-1);
    }

    utils.gitCmd("push", ["gitbook", "master"])
    .then(function(out) {
        console.log(out.stdout);
    }, function(err) {
        if (err.code == 128) {
            console.log("No book on gitbook.io is configured with this git repository.");
            console.log("Run 'gitbook git:remote username/book' to intialize this repository.");
        } else {
            console.log(err.message);
        }
        process.exit(-1);
    });
};

var remote = function(folder, bookId) {
    if (!folder || !bookId) {
        console.log("Need a repository folder and a book id");
        return process.exit(-1);
    }

    var url = "https://push.gitbook.io/"+bookId+".git";
    var addRemote = function() {
        return utils.gitCmd("remote", ["add", "gitbook", url]);
    }

    addRemote()
    .fail(function(err) {
        if (err.code == 128) {
            return utils.gitCmd("remote", ["rm", "gitbook"]).then(addRemote);
        }
        return Q.reject(err);
    })
    .then(function(out) {
        console.log("Book remote '"+url+"' added to the folder");
    }, function(err) {
        console.log(err.message);
        process.exit(-1);
    });
};

module.exports = {
    publish: publish,
    remote: remote
};
