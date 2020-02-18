var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var sitemap = require("gulp-sitemap");
var save = require("gulp-save");
var fs = require("fs");
var path = require("path");

const sourceFile = (files, subfolder = "") =>
  path.join("src", subfolder, files);

let deploy = false;

const SASS_PATHS = [
  "node_modules/normalize.scss/sass",
  "node_modules/foundation-sites/scss",
  "node_modules/motion-ui/src"
];

const pipeIfDev = pipe => (deploy ? $.util.noop() : pipe);
const sassTask = root => {
  return () =>
    gulp
      .src([sourceFile("scss/app.scss", root)])
      .pipe(
        $.sass({
          includePaths: SASS_PATHS,
          outputStyle: "compressed"
        })
      )
      .pipe(
        $.autoprefixer({
          browsers: ["last 2 versions", "ie >= 9"]
        })
      )
      .pipe(gulp.dest(`dist/${root}/css/`));
};
/**
 * Precompile scss/sass files into dist/css/app.css.
 */
gulp.task("sass", gulp.parallel(sassTask(""), sassTask("portfolio")));

const jsFiles = root => [
  "node_modules/jquery/dist/jquery.js",
  "node_modules/scroll-depth/jquery.scrolldepth.js",
  sourceFile("js/**/*.js", root)
];
const jsTask = root => {
  return () =>
    gulp
      .src(jsFiles(root))
      .pipe($.concat("app.js", { newLine: "" }))
      .pipe(deploy ? $.uglify() : $.util.noop())
      .pipe(gulp.dest(`dist/${root}/js/`));
};

/**
 * Minify js files and copy them to dist/js folder.
 */
gulp.task("js", gulp.parallel(jsTask(""), jsTask("portfolio")));

const downloadTask = root => () =>
  gulp
    .src(sourceFile("downloads/**/*", root))
    .pipe(gulp.dest(`dist/${root}/downloads`));

/**
 * Copy the downloaded files.
 */
gulp.task(
  "download",
  gulp.parallel(downloadTask(""), downloadTask("portfolio"))
);

/**
 * Copy the html files to the dist folder.
 */
gulp.task("html", function() {
  var htmlminOpts;
  if (deploy) {
    htmlminOpts = {
      minifyJS: true,
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeRedundantAttributes: true,
      sortAttributes: true,
      sortClassName: true
    };
  } else {
    htmlminOpts = {
      removeComments: true,
      collapseWhitespace: true,
      preserveLineBreaks: true
    };
  }
  var htmlPrettifyOpts = {
    brace_style: "expand",
    indent_char: " ",
    indent_size: 2
  };
  return gulp
    .src([sourceFile("**/*.html"), "!**/_layout.html"])
    .pipe(save("before-sitemap"))
    .pipe(
      sitemap({
        siteUrl: "https://alessiolaiso.com"
      })
    )
    .pipe(gulp.dest("./dist"))
    .pipe(save.restore("before-sitemap"))
    .pipe(
      $.nunjucksRender({
        path: sourceFile("")
      })
    )
    .pipe(pipeIfDev($.frontMatter({ remove: true })))
    .pipe($.htmlmin(htmlminOpts))
    .pipe(pipeIfDev($.htmlPrettify(htmlPrettifyOpts)))
    .pipe(gulp.dest("dist/"));
});

/**
 * Copy CNAME to dist.
 */
gulp.task("cname", function() {
  return gulp.src(sourceFile("CNAME")).pipe(gulp.dest("dist/"));
});

const imgTask = (root = "") => () =>
  gulp
    .src(sourceFile("images/**/*", root))
    .pipe(gulp.dest(`dist/${root}/images`));

/**
 * Copy images to dist/images folder.
 */
gulp.task("img", gulp.parallel(imgTask(), imgTask("portfolio")));

/**
 * Builds all assets.
 */
gulp.task(
  "build",
  gulp.series("download", "sass", "js", "cname", "html", "img")
);

/**
 * Clean dist folder.
 */
gulp.task("clean", function() {
  return gulp.src("dist/*", { read: false }).pipe($.clean({ force: true }));
});

gulp.task("version", function() {
  var versionConfig = {
    value: "%MD5%",
    append: {
      key: "__v",
      to: ["css", "js", "image"]
    }
  };

  return gulp
    .src("dist/**/*.html")
    .pipe($.versionNumber(versionConfig))
    .pipe(gulp.dest("dist"));
});

/**
 * Clean and build the website.
 */
gulp.task(
  "prepare-deploy",
  gulp.series(
    function(done) {
      deploy = true;
      done();
    },
    "clean",
    "build",
    "version"
  )
);

/**
 * Deploys the website.
 */
gulp.task(
  "deploy",
  gulp.series("prepare-deploy", function() {
    return gulp.src("./dist/**/*").pipe(
      $.ghPages({
        branch: "master",
        message: "Deployed on " + new Date().toString()
      })
    );
  })
);

/**
 * Starts a web server within dist folder.
 */
gulp.task(
  "connect",
  gulp.series("build", function(done) {
    $.connect.server(
      {
        root: "dist",
        livereload: true,
        middleware: function(connect, opt) {
          return [
            function(req, res, next) {
              const match = req.url.match(/^\/(.*)\/?$/);
              req.url = "/404.html";
              if (match) {
                const path = match[1];
                const matchingFile = [
                  path === "" ? "index.html" : `${path}/index.html`,
                  `${path}.html`,
                  `${path}`
                ].find(path => {
                  return fs.existsSync(`dist/${path}`);
                });

                if (matchingFile !== undefined) {
                  req.url = `/${matchingFile}`;
                }
              }
              next();
            }
          ];
        }
      },
      function() {
        this.server.on("close", done);
      }
    );
  })
);

/**
 * Live reload web pages.
 */
gulp.task(
  "reload",
  gulp.series("html", function() {
    return gulp.src("dist/**/*.html").pipe($.connect.reload());
  })
);

/**
 * Watch files and recompile assets when any file is updated.
 */
gulp.task("watch", function(done) {
  gulp.watch([sourceFile("download/**/*")], gulp.series("download", "reload"));
  gulp.watch([sourceFile("**/*.html")], gulp.series("reload"));
  gulp.watch([sourceFile("scss/**/*.scss")], gulp.series("sass", "reload"));
  gulp.watch([sourceFile("js/**/*.js")], gulp.series("js", "reload"));
  gulp.watch([sourceFile("images/**/*")], gulp.series("img", "reload"));
  done();
});

gulp.task("default", gulp.parallel("connect", "watch"));
