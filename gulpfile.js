var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var sass         = require('gulp-sass');
var uglify       = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var cssnano      = require('gulp-cssnano');
var include      = require('gulp-include');
var filter       = require('gulp-filter');
var sourcemaps   = require('gulp-sourcemaps');
var runSequence  = require('run-sequence');
var notify       = require('gulp-notify');
var browserSync  = require('browser-sync').create();
var gutil        = require("gulp-util");
var concat       = require("gulp-concat");
var imagemin     = require('gulp-imagemin');
var svgstore     = require('gulp-svgstore');
var svgmin       = require('gulp-svgmin');
var rename       = require('gulp-rename');
var argv         = require('minimist')(process.argv.slice(2));
var jshint       = require('gulp-jshint');
var cp           = require('child_process');

// Jekyll
var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};
var buildDest = '_build';

// Build and watch the Jekyll Site
gulp.task('jekyll', function() {
  var jekyll = cp.spawn('bundle', ['exec', 'jekyll', 'build',
    '--watch',
    '--incremental',
    '--drafts'
  ]);

  var jekyllLogger = function(buffer) {
    buffer.toString()
      .split(/\n/)
      .forEach(function(message) { gutil.log('Jekyll: ' + message);});
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

// Build only
gulp.task('jekyll-build', function() {
  var jekyllBuild = cp.spawn('jekyll', ['build']);
});

// CLI options
var enabled = {
  // Disable source maps when `--production`
  maps: !argv.production,
  // Fail due to JSHint warnings only when `--production`
  failJSHint: argv.production,
  // Strip debug statments from javascript when `--production`
  stripJSDebug: argv.production
};

// Smash CSS!
gulp.task('styles', function() {
  return gulp.src([
      'assets/scss/main.scss'
    ])
    .pipe(gulpif(enabled.maps, sourcemaps.init()))
    .pipe(sass())
    .on('error', notify.onError(function(error) {
       return 'Styles error!' + error;
    }))
    .pipe(autoprefixer({
      browsers: [
        'last 2 versions',
        'android 4',
        'opera 12'
      ]
    }))
    .pipe(cssnano({
      safe: true
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulpif(enabled.maps, sourcemaps.write('maps')))
    .pipe(gulpif(enabled.maps, gulp.dest('dist/css')))
    .pipe(browserSync.stream({match: '**/*.css'}))
    .pipe(notify({message: 'Styles smashed.', onLast: true}));
});

// Smash javascript!
gulp.task('scripts', ['jshint'], function() {
  return gulp.src([
      'assets/js/main.js'
    ])
    .pipe(include())
    .pipe(concat('main.js'))
    .pipe(gulpif(enabled.maps, sourcemaps.init()))
    .pipe(uglify({
      compress: {
        'drop_debugger': enabled.stripJSDebug
      }
    }))
    .on('error', notify.onError(function(error) {
       return 'Styles error!' + error;
    }))
    .pipe(gulp.dest('dist/js'))
    .pipe(gulpif(enabled.maps, sourcemaps.write('maps')))
    .pipe(gulpif(enabled.maps, gulp.dest('dist/js')))
    .pipe(browserSync.reload({stream:true}))
    .pipe(notify({message: 'Scripts smashed.', onLast: true}));
});

// ### Images
// `gulp images` - Run lossless compression on all the images.
gulp.task('images', function() {
  return gulp.src([
      'assets/images/**/*'
    ])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

// SVGs to defs
gulp.task('svgs', function() {
  return gulp.src('assets/svgs/*.svg')
    .pipe(svgmin({
        plugins: [{
            removeViewBox: false
        }, {
            removeEmptyAttrs: false
        },{
            mergePaths: false
        },{
            cleanupIDs: false
        }]
    }))
    .pipe(gulp.dest('assets/svgs/'))
    .pipe(gulp.dest('dist/svgs'))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename({suffix: '-defs'}))
    .pipe(gulp.dest('dist/svgs/'));
});

// `gulp jshint` - Lints configuration JSON and project JS.
gulp.task('jshint', function() {
  return gulp.src([
      'assets/bower.json', 'gulpfile.js', 'assets/js/main.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulpif(enabled.failJSHint, jshint.reporter('fail')));
});

// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, ['dist']));

// `gulp build` - Run all the build tasks but don't clean up beforehand.
gulp.task('build', function(callback) {
  runSequence(
    'clean',
    ['styles','scripts','images','svgs'],
    callback
  );
});

// Folders to watch for changes
gulp.task('serve', ['build'], function() {
  // Init BrowserSync
  browserSync.init({
    files: [buildDest + '/**'],
    server: {
        baseDir: buildDest
    },
    notify: true,
    open: false
  });
  gulp.watch('assets/scss/**/*.scss', ['styles']);
  gulp.watch('assets/js/**/*.js', ['scripts']);
  gulp.watch('assets/images/**/*', ['images']);
  gulp.watch('assets/svgs/**/*.svg', ['svgs']);
});

gulp.task('watch', ['build', 'jekyll', 'serve']);

// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', function() {
  gulp.start('build', 'jekyll-build');
});
