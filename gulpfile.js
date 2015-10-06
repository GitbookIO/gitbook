var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var browserify = require('browserify');
var mergeStream = require('merge-stream');
var source = require('vinyl-source-stream');

gulp.task('css', function() {
    return mergeStream(
        gulp.src('theme/stylesheets/*.less')
            .pipe(less())
            .pipe(minifyCSS())
            //.pipe(rename('style.css'))
            .pipe(gulp.dest('theme/assets/'))
    );
});

gulp.task('js', function() {
    return browserify('./theme/javascript/index.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./theme/assets/'));
});

gulp.task('assets', function() {
    return gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('theme/assets/fonts/fontawesome/'));
});

gulp.task('default', ['css', 'js', 'assets'], function() {

});

