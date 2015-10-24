var gulp = require('gulp'),
    connect = require('gulp-connect');

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

gulp.task('serve-tests', ['connect', 'watch']);