var gulp        = require('gulp');
var minify      = require('gulp-minify');
var $           = require('gulp-load-plugins')();
var concat      = require('gulp-concat');
var connect     = require('gulp-connect');
var clean       = require('gulp-clean');
var replace     = require('gulp-ext-replace');
var runSequence = require('run-sequence');
var bowerFiles  = require('main-bower-files');

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
  return gulp.src(bowerFiles({ filter: /^.*.js$/ }).concat('js/app.js'))
    .pipe(minify({ noSource: true }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'));
});

/**
 * Copy the downloaded files.
 */
gulp.task('download', function() {
  return gulp.src('downloads/**/*')
    .pipe(gulp.dest('dist/downloads'));
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
gulp.task('build', ['download', 'sass', 'js', 'html', 'img']);

/**
 * Clean dist folder.
 */
gulp.task('clean', function () {
  return gulp.src('dist/*', { read: false })
    .pipe(clean({ force: true }));
});

/**
 * Clean and build the website.
 */
gulp.task('deploy', function(done) {
  return runSequence('clean', 'build', done);
});

/**
 * Starts a web server within dist folder.
 */
gulp.task('connect', ['build'], function() {
  connect.server({
    root: 'dist',
    livereload: true,
    middleware: function(connect, opt) {
      return [
        function(req, res, next) {
          if (!req.url.match(/^\/(|.*\..*)$/)) {
            req.url = req.url + ".html";
          }
          next();
        }
      ]
    }
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
  gulp.watch(['download/**/*'], ['download', 'reload']);
  gulp.watch(['*.html'], ['reload']);
  gulp.watch(['scss/**/*.scss'], ['sass', 'reload']);
  gulp.watch(['js/**/*.js'], ['js','reload']);
  gulp.watch(['images/**/*'], ['img','reload']);
});

gulp.task('default', ['build', 'connect', 'watch']);
