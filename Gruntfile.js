module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    paths: {
      src: {
          js: 'src/**/*.js'
      },
      dest: {
        js: {
          concat: 'dist/js/<%= pkg.name %>/<%= pkg.name %>.js',
          uglify: 'dist/js/<%= pkg.name %>/<%= pkg.name %>.min.js'
        }
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: '<%= paths.src.js %>',
        dest: '<%= paths.dest.js.concat %>',
      },
    },
    uglify: {
      build: {
        src: '<%= paths.src.js %>',
        dest: '<%= paths.dest.js.uglify %>',
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat', 'uglify']);
};