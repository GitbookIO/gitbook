var Q = require('q');
var _ = require('lodash');

var http = require('http');
var send = require('send');

var url = require('url');
var cp = require('child_process');


// Get the remote of a given repo
function gitURL(path) {
    var d = Q.defer();

    cp.exec("git config --get remote.origin.url", {
        cwd: path,
        env: process.env,
    }, function(err, stdout, stderr) {
        if(err) {
            return d.reject(err);
        }

        return d.resolve(stdout);
    });

    return d.promise
    .then(function(output) {
        return output.replace(/(\r\n|\n|\r)/gm, "");
    });
}

// Poorman's parsing
// Parse a git URL to a github ID : username/reponame
function githubID(_url) {
    // Remove .git if it's in _url
    var sliceEnd = _url.slice(-4) === '.git' ? -4 : _url.length;

    // Detect HTTPS repos
    var parsed = url.parse(_url);
    if(parsed.protocol === 'https:' && parsed.host === 'github.com') {
        return parsed.path.slice(1, sliceEnd);
    }

    // Detect SSH repos
    if(_url.indexOf('git@') === 0) {
        return _url.split(':', 2)[1].slice(0, sliceEnd);
    }

    // None found
    return null;
}

function titleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function serveDir(dir, port) {
    var d = Q.defer();

    var server = http.createServer(function(req, res){
        // Render error
        function error(err) {
            res.statusCode = err.status || 500;
            res.end(err.message);
        }

        // Redirect to directory's index.html
        function redirect() {
            res.statusCode = 301;
            res.setHeader('Location', req.url + '/');
            res.end('Redirecting to ' + req.url + '/');
        }

        // Send file
        send(req, url.parse(req.url).pathname)
        .root(dir)
        .on('error', error)
        .on('directory', redirect)
        .pipe(res);
    }).listen(port);

    d.resolve(server);

    return d.promise;
}

function logError(err) {
    console.log(err.stack || err.message || err);
    return Q.reject(err);
};


// Exports
module.exports = {
    gitURL: gitURL,
    githubID: githubID,
    titleCase: titleCase,
    serveDir: serveDir,
    logError: logError
};
