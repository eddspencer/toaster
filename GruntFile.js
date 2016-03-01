module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 8080,
          base: './'
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['js/test/**/*.js']
      }
    },
    clean: ["js"],
    typescript: {
      base: {
        src: ['src/**/*.ts'],
        dest: 'js/',
        options: {
          module: 'commonjs',
          removeCommemts: true,
          sourceMap: true,
          target: 'es5'
        }
      }
    },
    watch: {
      files: '**/*.ts',
      tasks: ['clean', 'typescript']
    },
    open: {
      dev: {
        path: 'http://localhost:8080/index.html'
      }
    }
  });

  grunt.registerTask('default', ['clean', 'typescript', 'mochaTest']);
}