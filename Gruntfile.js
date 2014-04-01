module.exports = function (grunt) {
    var path = require("path");

    // Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Init GRUNT configuraton
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "assets/static/style.css": "assets/stylesheets/main.less"
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: "app",
                    baseUrl: "assets/javascript/",
                    out: "assets/static/app.js",
                    preserveLicenseComments: false,
                    optimize: "uglify",
                    include: ["requireLib"],
                    paths: {
                        "requireLib": 'vendors/require',
                    },
                    shim: {
                        'jQuery': {
                            exports: '$'
                        }
                    }
                }
            }
        }
    });

    // Build
    grunt.registerTask('build', [
        'less',
        'requirejs'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};