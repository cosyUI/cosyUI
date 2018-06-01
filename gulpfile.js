var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var less = require('gulp-less');
var header = require('gulp-header');
var tap = require('gulp-tap');
var nano = require('gulp-cssnano');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var svgSprite = require('gulp-svg-sprite');

var clean = require('gulp-clean');//清理文件或文件夹
var replace = require('gulp-replace-task');//对文件中的字符串进行替换
var uglify = require('gulp-uglify');//js压缩混淆
var merge = require('merge-stream');//合并多个流

var pkg = require('./package.json');
var yargs = require('yargs')
  .options({
    'w': {
      alias: 'watch',
      type: 'boolean'
    },
    's': {
      alias: 'server',
      type: 'boolean'
    },
    'p': {
      alias: 'port',
      type: 'number'
    }
  }).argv;

var option = {base: 'src'};
var dist = __dirname + '/dist';

var CONTEXT_PATH = '/dist'
var replace_patterns = [
  {
    match: 'CONTEXT_PATH',
    replacement: yargs.r ? CONTEXT_PATH : '..'
  }
];

//清理构建目录
gulp.task('clean', function () {
  return gulp.src(dist, {read: false})
    .pipe(clean({force: true}));
});

//构建框架样式
gulp.task('build:style', function () {
  gulp.src('src/styles/index.less', option)
    .pipe(sourcemaps.init())
    .pipe(less().on('error', function (e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}))
    .pipe(nano({
      zindex: false,
      autoprefixer: false
    }))
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(dist));
});

gulp.task('build:svg', function () {
  return gulp.src('src/styles/icons/*.svg', option)
    .pipe(svgSprite({
      mode: {
        symbol: true // Activate the «symbol» mode
      }
    }))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}));
});

//拷贝字体库：src/iconfonts到dist/iconfont
gulp.task('build:iconfonts', function () {
  gulp.src('src/styles/iconfonts/iconfont/**', option)
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}));
});

//拷贝图片：src/example/images到dist/example/images
gulp.task('build:images', function () {
  return gulp.src('src/example/images/**/*.?(png|jpg|gif)', option)
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}));
});

//构建example/js
gulp.task('build:js', function () {
  return merge(
    gulp.src(['src/example/js/**/*.js', '!src/example/js/lib/**/*.js'], option)
      .pipe(replace({
        patterns: replace_patterns
      }))
      .pipe(uglify())
      .pipe(rename(function (path) {
        path.basename += '.min';
      }))
      .pipe(gulp.dest(dist))
      .pipe(browserSync.reload({stream: true})),

    gulp.src(['src/example/js/lib/**/*.?(js|css|png|jpg|gif)', 'src/example/js/data/**/*.?(js|css|json)'], option)
      .pipe(replace({
        patterns: replace_patterns
      }))
      .pipe(gulp.dest(dist))
      .pipe(browserSync.reload({stream: true}))
  );
});

//构建example的样式
gulp.task('build:page:style', function () {
  gulp.src('src/example/styles/**/*.less', option)
    .pipe(less().on('error', function (e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
    .pipe(nano({
      zindex: false,
      autoprefixer: false
    }))
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}));
});

//构建example/html
gulp.task('build:html', function () {
  return gulp.src('src/example/**/*.html', option)
    .pipe(tap(function (file) {
      var dir = path.dirname(file.path);
      var contents = file.contents.toString();
      contents = contents.replace(/<link\s+rel="import"\s+href="(.*)">/gi, function (match, $1) {
        var filename = path.join(dir, $1);
        var id = path.basename(filename, '.html');
        var content = fs.readFileSync(filename, 'utf-8');
        return '<script type="text/html" id="tpl_' + id + '">\n' + content + '\n</script>';
      });
      file.contents = new Buffer(contents);
    }))
    .pipe(replace({
      patterns: replace_patterns
    }))
    .pipe(gulp.dest(dist))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('build:page', ['build:svg', 'build:iconfonts', 'build:images', 'build:js', 'build:page:style', 'build:html']);

gulp.task('clean_release', ['clean'], function () {
  return gulp.start('build:style', 'build:page');
});

gulp.task('release', ['build:style', 'build:page']);

gulp.task('watch', ['release'], function () {
  gulp.watch('src/styles/**/*', ['build:style']);
  gulp.watch('src/styles/icons/**/*', ['build:svg']);
  gulp.watch('src/styles/iconfonts/iconfont/**/*', ['build:iconfonts']);
  gulp.watch('src/example/styles/**/*.less', ['build:page:style']);
  gulp.watch('src/example/images/**/*.?(png|jpg|gif)', ['build:images']);
  gulp.watch('src/example/js/**/*.?(js|json)', ['build:js']);
  gulp.watch('src/example/**/*.html', ['build:html']);
});

gulp.task('server', function () {
  yargs.p = yargs.p || 8090;
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    ui: {
      port: yargs.p + 1,
      weinre: {
        port: yargs.p + 2
      }
    },
    port: yargs.p,
    startPath: '/example'
  });
});

// 参数说明
//  -w: 实时监听
//  -s: 启动服务器
//  -p: 服务器启动端口，默认8090
gulp.task('default', ['release'], function () {
  if (yargs.s) {
    gulp.start('server');
  }

  if (yargs.w) {
    gulp.start('watch');
  }
});
