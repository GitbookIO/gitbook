var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var browserify = require('browserify');
var mergeStream = require('merge-stream');
var source = require('vinyl-source-stream');

gulp.task('css', function() {
    var merged = mergeStream();

    _.each({
        'ebook.less': 'ebook/ebook.css',
        'pdf.less': 'ebook/pdf.css',
        'mobi.less': 'ebook/mobi.css',
        'epub.less': 'ebook/epub.css',
        'website.less': 'website/style.css'
    }, function(out, input) {
        gutil.log('compiling', input, 'into', out);
        merged.add(gulp.src('theme/stylesheets/'+input)
            .pipe(less())
            .pipe(minifyCSS())
            .pipe(rename(out))
            .pipe(gulp.dest('theme/assets/')));
    });

    return merged;
});

gulp.task('js', function() {
    return browserify('./theme/javascript/index.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./theme/assets/website'));
});

gulp.task('assets', function() {
    return gulp.src('./node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('theme/assets/website/fonts/fontawesome/'));
});

gulp.task('default', ['css', 'js', 'assets'], function() {

});

