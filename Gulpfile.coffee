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
    bundler.bundle()
    .pipe source 'scribble.js'
    .pipe gulp.dest './lib'

gulp.task 'transpile', ->
    gulp.src './src/scribble.coffee'
    .pipe coffee()
    .pipe rename 'scribble.node.js'
    .pipe gulp.dest './lib'

gulp.task 'build', ['bundle', 'transpile']
gulp.task 'default', ['build']
