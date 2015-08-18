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
    bundler = browserify './src/sketch.coffee',
        transform: ['coffeeify']
        extensions: ['.coffee']
        debug: no
        standalone: 'sketchjs'
    bundler.bundle()
    .pipe source 'sketch.js'
    .pipe gulp.dest './lib'

gulp.task 'transpile', ->
    gulp.src './src/sketch.coffee'
    .pipe coffee()
    .pipe rename 'sketch.node.js'
    .pipe gulp.dest './lib'

gulp.task 'build', ['bundle', 'transpile']
gulp.task 'default', ['build']
