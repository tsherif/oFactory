module.exports = function(grunt) {
  "use strict";
  
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    licence: grunt.file.read("LICENSE"),
    uglify: {
      options: {
        banner: "/*\n<%= pkg.name %> v<%= pkg.version %> \n\n<%= licence %>*/\n",
        preserveComments: "some"
      },
      build: {
        src: "src/<%= pkg.name %>.js",
        dest: "build/<%= pkg.name %>.min.js"
      }
    },
    qunit: {
      files: ["test/*.html"]
    },
    jshint: {
      // Defaults.
      options: {
        eqeqeq: true,
        undef: true,
        strict: true,
        indent: 2,
        immed: true,
        latedef: true,
        newcap: true,
        nonew: true,
        trailing: true
      },
      grunt: {
        src: "Gruntfile.js",
        options: {
          node: true
        }
      },
      src: {
        src: "src/*.js",
      },
      tests: {
        src: "test/*.js",
        options: {
          globals: {
            oFactory: true,
            ok: true,
            equal: true,
            deepEqual: true,
            test: true,
            strictEqual: true,
            notStrictEqual: true
          }
        }
      }
    },
    watch: {
      files: ["<%= jshint.files %>", "test/*.js"],
      tasks: ["jshint", "qunit"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-qunit");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("test", ["jshint", "qunit"]);

  grunt.registerTask("default", ["jshint", "qunit", "uglify"]);
};