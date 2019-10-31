var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('copy-html', done => {
  gulp.src("src/index.html")
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('copy-styles', done => {
  gulp.src("src/styles/*")
    .pipe(gulp.dest('dist/styles'));
  done();
});

gulp.task('copy-assets', done => {
  gulp.src("src/assets/images/*")
    .pipe(gulp.dest('dist/assets/images'));
  done();
});

gulp.task('copy-ts', () => {
  return tsProject.src()
      .pipe(tsProject())
      .js.pipe(gulp.dest('dist/scripts'));
});

gulp.task('default', gulp.parallel(['copy-html', 'copy-styles', 'copy-assets', 'copy-ts']));
