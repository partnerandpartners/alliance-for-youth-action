const gulp = require('gulp')
const sass = require('gulp-sass')
const server = require('gulp-server-livereload')
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')

const config = require('config')
var generator = require('./generate')

gulp.task('reloadGenerator', function () {
  delete require.cache[require.resolve('./generate.js')]
  generator = require('./generate')
})

gulp.task('generate', function () {
  generator()
})

gulp.task('sass', function () {
  return gulp.src('./sass/style.scss')
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(autoprefixer('last 10 version'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./_site/css'))
})

gulp.task('webserver', function () {
  gulp.src(path.resolve(__dirname, config.siteFolder))
    .pipe(server({
      host: '127.0.0.1',
      livereload: {
        enable: true,
        filter: function (filename, cb) {
          cb(!/\.(sa|le)ss$|.DS_Store|node_modules/.test(filename))
        }
      },
      directoryListing: false,
      open: false,
      fallback: '404.html'
    }))
})

gulp.task('copyFavicons', function () {
  return gulp.src([
    './favicons/**/**'
  ])
    .pipe(gulp.dest('./_site/'))
})

gulp.task('copyJS', function () {
  return gulp.src([
    path.resolve(__dirname, 'js', 'script.js')
  ])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('./_site/js'))
})

gulp.task('copyFonts', () => {
  return gulp.src([
    './fonts/**/**'
  ])
    .pipe(gulp.dest('./_site/fonts'))
})

// gulp.task('copyImg', function () {
//   return gulp.src('img/**/*')
//     .pipe(gulp.dest('./_site/img'))
// })

gulp.task('watch', function () {
  gulp.watch('templates/**/*.pug', ['generate'])
  gulp.watch('sass/**/*.scss', ['sass'])
  gulp.watch('js/**/*.js', ['copyJS'])
  gulp.watch('generate.js', ['reloadGenerator', 'build'])
})

gulp.task('build', ['sass', 'generate', 'copyJS', 'copyFonts', 'copyFavicons'])// 'copyJS', 'generate', 'copyImg'])

gulp.task('develop', ['build', 'watch', 'webserver'])
gulp.task('dev', ['develop'])

gulp.task('default', ['build'])
