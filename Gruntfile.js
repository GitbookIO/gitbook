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
                    "theme/assets/style.css": "theme/stylesheets/main.less",
                    "theme/assets/print.css": "theme/stylesheets/print.less"
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: "app",
                    baseUrl: "theme/javascript/",
                    out: "theme/assets/app.js",
                    preserveLicenseComments: false,
                    optimize: "uglify", //"uglify",
                    include: ["requireLib"],
                    paths: {
                        "jQuery": 'vendors/jquery',
                        "lodash": 'vendors/lodash',
                        "requireLib": 'vendors/require',
                        "Mousetrap": 'vendors/mousetrap',
                        "mixpanel": 'vendors/mixpanel',
                        "lunr": path.join(__dirname, "node_modules/lunr/lunr")
                    },
                    shim: {
                        'jQuery': {
                            exports: '$'
                        },
                        'lodash': {
                            exports: '_'
                        },
                        'Mousetrap': {
                            exports: 'Mousetrap'
                        },
                        'mixpanel': {
                            exports: 'mixpanel'
                        },
                        'lunr': {
                            exports: 'lunr'
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