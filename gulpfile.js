'use strict'

const gulp        = require('gulp'),                       // Сам gulp
      uglify      = require('gulp-uglify'),                // Плагин для минификации js файлов
      pug         = require('gulp-pug'),                   // Плагин для компиляции pug в html
      cssmin      = require('gulp-clean-css'),             // Плагин для минификации css
      sass        = require('gulp-sass'),                  // Плагин для компиляции sass в css
      concat      = require('gulp-concat'),                // Плагин для объединения файлов
      plumber     = require('gulp-plumber'),               // Плагин для продолжения работы gulp, если вызвана ошибка
      rimraf      = require('rimraf'),                     // Модуль удаления директорий
      cache       = require('gulp-cache'),                 // Модуль для работы с кешом
      mmq         = require('gulp-merge-media-queries'),   // Плагин для обхединения media-queries
      prefix      = require('gulp-autoprefixer'),          // Плагин для автоматической расстановки вендорных префиксов
      rename      = require('gulp-rename'),                // Плагин для переименовывания файлов
      imagemin    = require('gulp-imagemin'),              // Плагин для скижитя графики
      browserSync = require('browser-sync').create(),      // Плагин для запуска локального сервера
      notify      = require('gulp-notify'),                // Плагин для оповещения об ошибках
      prettify    = require('gulp-html-prettify');


var paths = {
  devDir: 'app/',          // Путь где производится разработка
  outputDir: 'dist/'       // Путь для конечной сборки
}

gulp.task('pug', function() {
  return gulp
    .src(paths.devDir + 'pages/*.pug')
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Pug',
          message: err.message
        };
      })
    }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(prettify({
      brace_style: 'expand',
      indent_size: 1,
      indent_char: '\t',
      indent_inner_html: true,
      preserve_newlines: true
    }))
    .pipe(gulp.dest(paths.outputDir))
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
    .src([paths.devDir + 'scripts/*.js'])
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest(paths.outputDir + 'scripts/'))
    .pipe(browserSync.stream());
});

//Оптимизируем изображения и кидаем их в кэш
gulp.task('img', function() {
  return gulp.src(paths.devDir + 'img/**/*')
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

//Очистка папки конечной сборки
gulp.task('clean', function(cb) {
  rimraf(paths.outputDir, cb);
});

//Чистим кэш
gulp.task('clear', function() {
    return cache.clearAll();
});