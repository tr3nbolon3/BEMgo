'use strict'

const gulp        = require('gulp'),                       // Сам gulp
      uglify      = require('gulp-uglify'),                // Плагин для минификации js файлов
      pug         = require('gulp-pug'),                   // Плагин для компиляции pug в html
      cssmin      = require('gulp-clean-css'),             // Плагин для минификации css
      sass        = require('gulp-sass'),                  // Плагин для компиляции sass в css
      concat      = require('gulp-concat'),                // Плагин для объединения файлов
      plumber     = require('gulp-plumber'),               // Плагин для продолжения работы gulp, если вызвана ошибка
      clean       = require('gulp-clean'),                 // Плагин для удаления файлов/директорий
      cache       = require('gulp-cache'),                 // Модуль для работы с кешом
      mmq         = require('gulp-merge-media-queries'),   // Плагин для обхединения media-queries
      prefix      = require('gulp-autoprefixer'),          // Плагин для автоматической расстановки вендорных префиксов
      rename      = require('gulp-rename'),                // Плагин для переименовывания файлов
      imagemin    = require('gulp-imagemin'),              // Плагин для скижитя графики
      browserSync = require('browser-sync').create(),      // Плагин для запуска локального сервера
      notify      = require('gulp-notify'),                // Плагин для оповещения об ошибках
      prettify    = require('gulp-html-prettify'),         // Плагин, приводящий html в порядок
      svgSprite   = require('gulp-svg-sprite'),            // Плагин для сборки svg-спрайта
      svgmin      = require('gulp-svgmin'),                // Плагин для минимизации svg
      cheerio     = require('gulp-cheerio'),               // Плагин для манипуляции HTML и XML
      replace     = require('gulp-replace');               // Плагин для изменения строк


var paths = {
  devDir: 'app/',          // Путь где производится разработка
  outputDir: 'dist/'       // Путь для конечной сборки
}


// Компиляция PUG в HTML
gulp.task('pug', function() {
  return gulp
    .src(paths.devDir + 'pages/*.pug')              // Берем файлы из рабочей директории
    .pipe(plumber({                                 // Выводим ошибку в случаее её присутствия
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Pug',
          message: err.message
        };
      })
    }))
    .pipe(pug())
    .pipe(prettify({                                // Делаем HTML читабельным
      brace_style: 'expand',
      indent_size: 1,
      indent_char: '\t',
      indent_inner_html: true,
      preserve_newlines: true
    }))
    .pipe(gulp.dest(paths.outputDir))               // Кидаем файлы в папку билда
    .pipe(browserSync.stream());
});

// Компиляция sass в css
gulp.task('sass', function() {
  return gulp
    .src(paths.devDir + 'sass/main.sass')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Sass',
          message: err.message
        };
      })
    }))
    .pipe(sass())
    .pipe(prefix({
      browsers: ['last 10 versions']
    }))
    .pipe(mmq())
    .pipe(cssmin())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(paths.outputDir + 'css/'))
    .pipe(browserSync.stream());
})

// Минификация кастомных скриптов JS
gulp.task('js', function() {
  return gulp
    .src(paths.devDir + 'scripts/*.js')
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(paths.outputDir + 'scripts/'))
    .pipe(browserSync.stream());
});

// Сборка svg-спрайта
gulp.task('svg:sprite', function() {
  return gulp
    .src([paths.devDir + 'svg/*.svg', '!' + paths.devDir + 'svg/sprite.svg'])
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
        $('style').remove();
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('svg').attr('style', 'display: none');
      }
    }))
    .pipe(gulp.dest(paths.devDir + 'svg/'));
});

// Оптимизируем изображения
gulp.task('img', function() {
  return gulp
    .src(paths.devDir + 'img/**/*')
    .pipe(cache(imagemin(
      [imagemin.gifsicle(),
      imagemin.jpegtran(), imagemin.optipng()]
      )
    ))
    .pipe(gulp.dest(paths.outputDir + 'img'));
});

// Запуск локального сервера из директории 'dist'
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: paths.outputDir
    },
    open: false,
    notify: false
  })
});

// Слежение за изменениями в файлах и перезагрузка страницы
gulp.task('default', ['img', 'sass', 'pug', 'js', 'browser-sync'], function() {
  gulp.watch(paths.devDir + '**/*.pug', ['pug']);
  gulp.watch(paths.devDir + '**/*.sass', function(event, cb) {
    setTimeout(function(){gulp.start('sass');}, 100)
  });
  gulp.watch([paths.devDir + 'js/*.js', '!'+ paths.devDir +'js/*.min.js'], ['js']);
  gulp.watch(paths.outputDir + '*.html', browserSync.reload);
});

// Чистим кэш
gulp.task('clear', function() {
  return cache.clearAll();
});

// Удаление папки билда
gulp.task('clean', function() {
  return gulp
    .src('dist', {read: false})
    .pipe(clean());
});