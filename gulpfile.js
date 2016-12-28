var gulp        = require("gulp");
var minify      = require("gulp-minify");
var $           = require("gulp-load-plugins")();
var concat      = require("gulp-concat");
var connect     = require("gulp-connect");
var clean       = require("gulp-clean");
var runSequence = require("run-sequence");
var bowerFiles  = require("main-bower-files");
var ghPages     = require("gulp-gh-pages");

var deploy = false;
var sassPaths = [
  "bower_components/normalize.scss/sass",
  "bower_components/foundation-sites/scss",
  "bower_components/motion-ui/src"
];

var seq = function(args, cb) {
  var args = Array.prototype.slice.call(args);
  return function(done){
    return cb(args, done);
  };
};
var taskSeq = function(){
  return seq(arguments, function(args, done){
    return runSequence.apply(null, args.concat([done]));
  });
};
var watchSeq = function() {
  return seq(arguments, function(args){
    return runSequence.apply(null, args);
  });
};

/**
 * Precompile scss/sass files into dist/css/app.css.
 */
gulp.task("sass", function() {
  return gulp.src(["scss/app.scss"])
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: "compressed"
    })
    .on("error", $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ["last 2 versions", "ie >= 9"]
    }))
    .pipe(gulp.dest("dist/css/"));
});

/**
 * Minify js files and copy them to dist/js folder.
 */
gulp.task("js", function() {
  var task = gulp.src(bowerFiles({ filter: /^.*.js$/ }).concat("js/*.js"));
  if(deploy){
    task = task.pipe(minify({ noSource: true }))
  }
  return task.pipe(concat("app.js"))
    .pipe(gulp.dest("dist/js"));
});

/**
 * Copy the downloaded files.
 */
gulp.task("download", function() {
  return gulp.src("downloads/**/*")
    .pipe(gulp.dest("dist/downloads"));
});

/**
 * Copy the html files to the dist folder.
 */
gulp.task("html", function() {
  return gulp.src(["*.html", "CNAME"])
    .pipe(gulp.dest("dist/"));
});

/**
 * Copy images to dist/images folder.
 */
gulp.task("img", function() {
  return gulp.src("images/**/*")
    .pipe(gulp.dest("dist/images"));
});

/**
 * Builds all assets.
 */
gulp.task("build", ["download", "sass", "js", "html", "img"]);

/**
 * Clean dist folder.
 */
gulp.task("clean", function () {
  return gulp.src("dist/*", { read: false })
    .pipe(clean({ force: true }));
});

/**
 * Clean and build the website.
 */
gulp.task("prepare-deploy", function(done){
  deploy = true;
  runSequence("clean", "build", done);
});

/**
 * Deploys the website.
 */
gulp.task("deploy", ["prepare-deploy"], function(){
  return gulp.src("./dist/**/*")
    .pipe(ghPages({ branch: "master", message: "Deployed on " + new Date().toString() }));
});

/**
 * Starts a web server within dist folder.
 */
gulp.task("connect", ["build"], function() {
  connect.server({
    root: "dist",
    livereload: true,
    middleware: function(connect, opt) {
      return [
        function(req, res, next) {
          if (!req.url.match(/^\/(|.*\..*)$/)) {
            req.url = req.url + ".html";
          }
          var path = "dist" + req.url
          if(!require("fs").existsSync(path)){
            req.url = "/404.html";
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
gulp.task("reload", ["html"], function () {
  return gulp.src("*.html")
    .pipe(connect.reload());
});

/**
 * Watch files and recompile assets when any file is updated.
 */
gulp.task("watch", ["build"], function() {
  gulp.watch(["download/**/*"], watchSeq("download", "reload"));
  gulp.watch(["*.html"], ["reload"]);
  gulp.watch(["scss/**/*.scss"], watchSeq("sass", "reload"));
  gulp.watch(["js/**/*.js"], watchSeq("js","reload"));
  gulp.watch(["images/**/*"], watchSeq("img","reload"));
});

gulp.task("default", ["build", "connect", "watch"]);
