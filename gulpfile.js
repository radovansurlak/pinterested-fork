const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default;

gulp.task('uglifyNodeJS', () => {
  gulp.src(['./index.js', './server/*.js'], { base: './' })
    .pipe(uglify())
    .pipe(gulp.dest('./test'));
});
