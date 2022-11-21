const
  gulp = require("gulp"),
  htmlmin = require('gulp-htmlmin'),
  sass = require('gulp-sass')(require('sass')),
  cssnano = require('gulp-cssnano'),
  bulkSass = require("gulp-sass-bulk-import"),
  sourcemaps = require("gulp-sourcemaps"),
  autoprefixer = require("gulp-autoprefixer"),
  webp = require('gulp-webp'),
  browserSync = require("browser-sync").create(),
  svgmin = require("gulp-svgmin"),
  svgSprite = require("gulp-svg-sprite"),
  clean = require("gulp-clean"),
  del = require("del"),
  concat = require("gulp-concat"),
  uglify = require('gulp-uglify-es').default,
  gulpif = require('gulp-if'),
  argv = require('yargs').argv,
  newer = require('gulp-newer'),
  imgSrc = 'dev/images/*.*',
  imgWebpSrc = 'dev/images/*.{jpg,png}',
  imgDest = 'build/images',
  rsync = require('gulp-rsync'),
  imagemin = require("gulp-imagemin"),
  imgWebpDest = 'build/images/webp';


gulp.task("sass", () =>
  gulp
    .src("dev/sass/**/*.scss")
    .pipe(gulpif((!argv.prod), sourcemaps.init()))
    .pipe(bulkSass())
    .pipe(
      sass({
        outputStyle: "compressed",
        includePaths: ["./sass"]
      }).on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 7 versions"],
        cascade: false
      })
    )
    .pipe(gulpif(argv.prod, cssnano(), sourcemaps.write("../maps")))
    .pipe(gulp.dest("build/css"))
    .on("end", browserSync.reload)
);






gulp.task("imagemin", () =>
  gulp
    .src(imgSrc)
    .pipe(newer(imgDest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ progressive: true }),
        // imagemin.optipng({ optimizationLevel: 5 }),
        // imagemin.svgo({
        //     plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        // })
      ])
    )
    .pipe(gulp.dest(imgDest))
    .on("end", browserSync.reload)
);


gulp.task("html", () =>
  gulp
    .src("dev/*.html", { since: gulp.lastRun('html') })
    .pipe(gulpif(argv.prod, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest("build"))
    .on("end", browserSync.reload)
);


gulp.task("webP", () =>
  gulp
    .src(imgWebpSrc)
    .pipe(newer(imgWebpDest))
    .pipe(webp({ quality: 60 }))
    .pipe(gulp.dest(imgWebpDest))
    .on("end", browserSync.reload)
);


gulp.task("scripts", () =>
  gulp
    .src(["dev/js/lib/*.js", "dev/js/blocks/*.js",])
    .pipe(sourcemaps.init())
    .pipe(gulpif((!argv.prod), sourcemaps.init()))
    .pipe(newer('build/js/all.min.js'))
    .pipe(concat("all.min.js"))
    .pipe(gulpif(argv.prod, uglify(), sourcemaps.write("../maps")))
    .pipe(gulp.dest("build/js"))
    .on("end", browserSync.reload)
);



gulp.task("svg", () =>
  gulp
    .src("dev/images/svgSprite/*.svg")
    .pipe(
      svgmin({
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: "sprite.svg"
          }
        }
      })
    )
    .pipe(gulp.dest("build/images/"))
);




gulp.task("serve", function () {
  browserSync.init({
    server: {
      baseDir: "build"
    }
  });
});


gulp.task("watch", function () {
  gulp.watch("dev/sass/**/*.scss", gulp.series("sass"));
  gulp.watch("dev/images/svgSprite/*.svg", gulp.series("svg"));
  gulp.watch("dev/images/*.*", gulp.series("imagemin", "webP"));
  gulp.watch("dev/*.html", gulp.series("html"));
  gulp.watch("dev/js/**/*.*", gulp.series("scripts"));
});



gulp.task("copy", () =>
  gulp
    .src(["dev/fonts/*.*", "dev/js/json/*.json", "dev/blocks/*.*"], {
      base: "dev"
    })
    .pipe(gulp.dest("build"))
);


gulp.task("clean", () =>
  //del("build")
  del(['build'], { force: true })
);

gulp.task("build", gulp.series(
  "clean",
  gulp.parallel("copy", "html", "sass", "scripts", "imagemin", "svg", "webP")
));

gulp.task("default",
  gulp.series(
    //'clean',
    gulp.parallel("watch", "serve")
  )
);
