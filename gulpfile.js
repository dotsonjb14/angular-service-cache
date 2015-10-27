var gulp = require('gulp'),
    connect = require('gulp-connect'),
    open = require('gulp-open');

gulp.task('connect', function () {
    connect.server({
        root: '.',
        livereload: true
    })
});

gulp.task('reload', function () {
    gulp.src('./mocha.html')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./specs.js', './serviceCache.js'], ['reload']);
});

gulp.task('open-tests', function () {
    gulp.src('.')
        .pipe(open({uri:"http://localhost:8080/mocha.html"}));
});

gulp.task('serve-tests', ['connect', 'watch', 'open-tests']);