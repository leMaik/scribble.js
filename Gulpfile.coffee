require 'coffee-script/register'

gulp = require 'gulp'
source = require 'vinyl-source-stream'
browserify = require 'browserify'
del = require 'del'
rename = require 'gulp-rename'
coffee = require 'gulp-coffee'

gulp.task 'clean', (cb) ->
    del ['lib/**'], cb

gulp.task 'bundle', ->
    bundler = browserify './src/scribble.coffee',
        transform: ['coffeeify']
        extensions: ['.coffee']
        debug: no
        standalone: 'scribblejs'
    bundler.transform 'uglifyify'
    bundler.bundle()
    .pipe source 'scribble.browserified.js'
    .pipe gulp.dest './lib'

gulp.task 'transpile', ->
    gulp.src './src/**/*.coffee'
    .pipe coffee()
    .pipe gulp.dest './lib'

gulp.task 'build', ['bundle', 'transpile']
gulp.task 'default', ['build']
