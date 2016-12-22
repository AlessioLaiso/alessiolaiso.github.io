var gulp    = require('gulp');
var minify  = require('gulp-minify');
var $       = require('gulp-load-plugins')();
var gulp    = require('gulp');
var connect = require('gulp-connect');

var sassPaths = [
  'bower_components/normalize.scss/sass',
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
];

/**
 * Precompile scss/sass files into dist/css/app.css.
 */
gulp.task('sass', function() {
  return gulp.src('scss/app.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compressed'
    })
    .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('dist/css/'));
});

/**
 * Minify js files and copy them to dist/js folder.
 */
gulp.task('js', function() {
  return gulp.src([
      'bower_components/jquery/dist/jquery.js',
      'bower_components/what-input/dist/what-input.js',
      'bower_components/foundation-sites/dist/js/foundation.js',
      'js/app.js'
    ])
    .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
    .pipe(gulp.dest('dist/js/'));
});

/**
 * Copy the html files to the dist folder.
 */
gulp.task('html', function() {
  return gulp.src('*.html')
    .pipe(gulp.dest('dist/'));
});

/**
 * Copy images to dist/images folder.
 */
gulp.task('img', function() {
  return gulp.src('images/**/*')
    .pipe(gulp.dest('dist/images'));
});

/**
 * Builds all assets.
 */
gulp.task('build', ['sass', 'js', 'html', 'img']);

/**
 * Starts a web server within dist folder.
 */
gulp.task('connect', ['build'], function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});

/**
 * Live reload web pages.
 */
gulp.task('reload', ['html'], function () {
  return gulp.src('*.html')
    .pipe(connect.reload());
});

/**
 * Watch files and recompile assets when any file is updated.
 */
gulp.task('watch', ['build'], function() {
  gulp.watch(['*.html'], ['reload']);
  gulp.watch(['scss/**/*.scss'], ['sass']);
  gulp.watch(['js/**/*.js'], ['js']);
  gulp.watch(['images/**/*'], ['img']);
});

gulp.task('default', ['build', 'connect', 'watch']);
