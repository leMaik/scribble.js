require 'coffee-script/register'

gulp = require 'gulp'
source = require 'vinyl-source-stream'
browserify = require 'browserify'
del = require 'del'

gulp.task 'clean', (cb) ->
    del ['lib/**'], cb

gulp.task 'scripts', ->
    bundler = browserify 'client.coffee',
        transform: ['coffeeify']
        extensions: ['.coffee']
        debug: no
        standalone: 'sketchjs'
    bundler.bundle()
    .pipe source 'client.js'
    .pipe gulp.dest './'
    
gulp.task 'default', ['clean', 'scripts']