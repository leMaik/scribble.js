require 'coffee-script/register'

gulp = require 'gulp'
source = require 'vinyl-source-stream'
browserify = require 'browserify'
del = require 'del'

gulp.task 'clean', (cb) ->
    del ['lib/**'], cb

gulp.task 'scripts', ->
    bundler = browserify './src/sketch.coffee',
        transform: ['coffeeify']
        extensions: ['.coffee']
        debug: no
    bundler.bundle()
    .pipe source 'sketch.js'
    .pipe gulp.dest './lib'
    
gulp.task 'default', ['clean', 'scripts']