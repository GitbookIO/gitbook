module.exports = function (grunt) {
    var path = require("path");

    // Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-less');

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
        }
    });

    // Build
    grunt.registerTask('build', [
        'less'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};