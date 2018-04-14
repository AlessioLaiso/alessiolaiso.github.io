var gulp        = require("gulp");
var $           = require("gulp-load-plugins")();
var runSequence = require("run-sequence");
var sitemap = require('gulp-sitemap');
var save    = require('gulp-save');

const sourceFile = (path) => `source/${path}`;
const jsFile = (name) => sourceFile(`js/${name}.js`);
const cssFile = (name) => sourceFile(`scss/${name}.scss`);
const htmlFile = (name) => sourceFile(`${name}.html`);

const watchSeq = function() {
  var args = Array.prototype.slice.call(arguments);
  return () => {
    return runSequence.apply(null, args);
  };
};

let deploy = false;

const SASS_PATHS = [
  "node_modules/normalize.scss/sass",
  "node_modules/foundation-sites/scss",
  "node_modules/motion-ui/src"
];
const jsFiles = [
  "node_modules/jquery/dist/jquery.js",
  "node_modules/scroll-depth/jquery.scrolldepth.js",
  jsFile("*")
];

const pipeIfDev = (pipe) => deploy ? $.util.noop() : pipe;
const pipeIfNotDev = (pipe) => deploy ? pipe : $.util.noop();

/**
 * Precompile scss/sass files into dist/css/app.css.
 */
gulp.task("sass", () => {
  return gulp.src([cssFile("app")])
    .pipe($.sass({
      includePaths: SASS_PATHS,
      outputStyle: "compressed"
    }))
    .pipe($.autoprefixer({
      browsers: ["last 2 versions", "ie >= 9"]
    }))
    .pipe(gulp.dest("dist/css/"));
});

/**
 * Minify js files and copy them to dist/js folder.
 */
gulp.task("js", function() {
  var task = gulp.src(jsFiles);
  if(deploy){
    task = task.pipe($.minify({ noSource: true, preserveComments: "some" }));
  }
  return task.pipe($.concat("app.js", { newLine: "" }))
    .pipe(gulp.dest("dist/js"));
});

/**
 * Copy the downloaded files.
 */
gulp.task("download", function() {
  return gulp.src(sourceFile("downloads/**/*"))
    .pipe(gulp.dest("dist/downloads"));
});

/**
 * Copy the html files to the dist folder.
 */
gulp.task("html", function() {
  var htmlminOpts;
  if(deploy) {
    htmlminOpts = {
      minifyJS: true,
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      sortAttributes: true,
      sortClassName: true
    };
  }else{
    htmlminOpts = {
      removeComments: true,
      collapseWhitespace: true,
      preserveLineBreaks: true
    };
  }
  var htmlPrettifyOpts = {
    brace_style: "expand",
    indent_char: ' ',
    indent_size: 2
  };
  return gulp.src([htmlFile("*"), htmlFile("!_layout")])
    .pipe(save('before-sitemap'))
    .pipe(sitemap({
      siteUrl: 'http://alessiolaiso.com'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(save.restore('before-sitemap'))
    .pipe($.nunjucksRender({
      path: sourceFile("")
    }))
    .pipe(pipeIfDev($.frontMatter({ remove: true })))
    .pipe($.htmlmin(htmlminOpts))
    .pipe(pipeIfNotDev($.htmlPrettify(htmlPrettifyOpts)))
    .pipe(gulp.dest("dist/"));
});

/**
 * Copy CNAME to dist.
 */
gulp.task("cname", function(){
  return gulp.src(sourceFile("CNAME")).pipe(gulp.dest("dist/"));
});

/**
 * Copy images to dist/images folder.
 */
gulp.task("img", function() {
  return gulp.src(sourceFile("images/**/*"))
    .pipe(gulp.dest("dist/images"));
});

/**
 * Builds all assets.
 */
gulp.task("build", ["download", "sass", "js", "cname", "html", "img"]);

/**
 * Clean dist folder.
 */
gulp.task("clean", function(){
  return gulp.src("dist/*", { read: false })
    .pipe($.clean({ force: true }));
});

gulp.task("version", function(){
  var versionConfig = {
    "value": "%MD5%",
    "append": {
      "key": "__v",
      "to": ["css", "js", "image"]
    }
  };

  return gulp.src("dist/**/*.html")
      .pipe($.versionNumber(versionConfig))
      .pipe(gulp.dest("dist"));
});

/**
 * Clean and build the website.
 */
gulp.task("prepare-deploy", function(done) {
  deploy = true;
  runSequence("clean", "build", "version", done);
});

/**
 * Deploys the website.
 */
gulp.task("deploy", ["prepare-deploy"], function(){
  return gulp.src("./dist/**/*")
    .pipe($.ghPages({ branch: "master", message: "Deployed on " + new Date().toString() }));
});

/**
 * Starts a web server within dist folder.
 */
gulp.task("connect", ["build"], function() {
  $.connect.server({
    root: "dist",
    livereload: true,
    middleware: function(connect, opt) {
      return [
        function(req, res, next) {
          if (!req.url.match(/^\/(|.*\..*)$/)) {
            req.url = req.url + ".html";
          }
          var path = "dist" + req.url;
          if(!require("fs").existsSync(path)){
            req.url = "/404.html";
          }
          next();
        }
      ];
    }
  });
});

/**
 * Live reload web pages.
 */
gulp.task("reload", ["html"], function () {
  return gulp.src("*.html")
    .pipe($.connect.reload());
});

/**
 * Watch files and recompile assets when any file is updated.
 */
gulp.task("watch", ["build"], function() {
  gulp.watch([sourceFile("download/**/*")], watchSeq("download", "reload"));
  gulp.watch([sourceFile("*.html")], ["reload"]);
  gulp.watch([sourceFile("scss/**/*.scss")], watchSeq("sass", "reload"));
  gulp.watch([sourceFile("js/**/*.js")], watchSeq("js","reload"));
  gulp.watch([sourceFile("images/**/*")], watchSeq("img","reload"));
});

gulp.task("default", ["build", "connect", "watch"]);
