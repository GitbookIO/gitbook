var events = require('events');
var http = require('http');
var send = require('send');
var util = require('util');
var url = require('url');

var Promise = require('../utils/promise');

function Server() {
    this.running = null;
    this.dir = null;
    this.port = 0;
    this.sockets = [];
}
util.inherits(Server, events.EventEmitter);

/**
    Return true if the server is running

    @return {Boolean}
*/
Server.prototype.isRunning = function() {
    return !!this.running;
};

/**
    Stop the server

    @return {Promise}
*/
Server.prototype.stop = function() {
    var that = this;
    if (!this.isRunning()) return Promise();

    var d = Promise.defer();
    this.running.close(function(err) {
        that.running = null;
        that.emit('state', false);

        if (err) d.reject(err);
        else d.resolve();
    });

    for (var i = 0; i < this.sockets.length; i++) {
        this.sockets[i].destroy();
    }

    return d.promise;
};

/**
    Start the server

    @return {Promise}
*/
Server.prototype.start = function(dir, port) {
    var that = this, pre = Promise();
    port = port || 8004;

    if (that.isRunning()) pre = this.stop();
    return pre
    .then(function() {
        var d = Promise.defer();

        that.running = http.createServer(function(req, res){
            // Render error
            function error(err) {
                res.statusCode = err.status || 500;
                res.end(err.message);
            }

            // Redirect to directory's index.html
            function redirect() {
                var resultURL = urlTransform(req.url, function(parsed) {
                    parsed.pathname += '/';
                    return parsed;
                });

                res.statusCode = 301;
                res.setHeader('Location', resultURL);
                res.end('Redirecting to ' + resultURL);
            }

            res.setHeader('X-Current-Location', req.url);

            // Send file
            send(req, url.parse(req.url).pathname, {
                root: dir
            })
            .on('error', error)
            .on('directory', redirect)
            .pipe(res);
        });

        that.running.on('connection', function (socket) {
            that.sockets.push(socket);
            socket.setTimeout(4000);
            socket.on('close', function () {
                that.sockets.splice(that.sockets.indexOf(socket), 1);
            });
        });

        that.running.listen(port, function(err) {
            if (err) return d.reject(err);

            that.port = port;
            that.dir = dir;
            that.emit('state', true);
            d.resolve();
        });

        return d.promise;
    });
};

/**
    urlTransform is a helper function that allows a function to transform
    a url string in it's parsed form and returns the new url as a string

    @param {String} uri
    @param {Function} fn
    @return {String}
*/
function urlTransform(uri, fn) {
    return url.format(fn(url.parse(uri)));
}

module.exports = Server;
