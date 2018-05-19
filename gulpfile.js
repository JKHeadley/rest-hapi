'use strict'

let gulp = require('gulp')

gulp.paths = {
  src: './'
}

require('require-dir')('./gulp')

gulp.task('default', [], function() {})
