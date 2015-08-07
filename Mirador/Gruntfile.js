module.exports = function(grunt) {

  // ----------
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-todo');
  grunt.loadNpmTasks('grunt-exec');
  // grunt.loadNpmTasks('jasmine-jquery');

  // ----------
  var miradorWebappDir = '/var/lib/tomcat7/webapps/Mirador'
  var distribution = 'build/mirador/mirador.js',
  minified = 'build/mirador/mirador.min.js',
  releaseRoot = '../site-build/built-mirador/',

  // libraries/plugins
  vendors = [
    'js/lib/jquery.min.js',
    'js/lib/jquery-ui-1.9.2.min.js',
    'js/lib/jquery.scrollTo.min.js',
    'js/lib/jquery.qtip.min.js',
    'js/lib/state-machine.min.js',
    'js/lib/tinymce.min.js',
    'js/lib/handlebars.js',
    'js/lib/openseadragon.min.js',
    'js/lib/d3.v3.min.js',
    'js/lib/pubsub.min.js',
    'js/lib/URI.min.js',
    'js/lib/mousetrap.min.js',
    'js/lib/isfahan.js',
    'js/lib/i18next.min.js'
  ],

  // libraries/plugins for running tests
  specJs = [
    'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
    'bower_components/sinon-server/index.js'
  ],

  // source files
  sources = [
    'js/src/*.js',
    'js/src/viewer/*.js',
    'js/src/manifests/*.js',
    'js/src/annotations/*.js',
    'js/src/workspaces/*.js',
    'js/src/widgets/*.js',
    'js/src/utils/*.js',
    'js/src/FuncClass/*.js'
  ],

  specs = ['spec/**/*js'];
  exclude = [];

  if (!grunt.option('full')) {
    exclude.push('spec/mirador.test.js');
  }

  // ----------
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec: {
      deploy: './deploy.sh'
    },

    todo: {
      options: {
        file: "TODOs.md",
        githubBoxes: true,
        colophon: true,
        usePackage: true,

        marks: [
        {
          pattern: /DONE/,
          color: "gray",
          name: "DONE" },
        {
          name: "FIX",
          pattern: /FIXME/,
          color: "red"
        },
        {
          name: "TODO",
          pattern: /TODO/,
          color: "yellow"
        },
        {
          name: "NOTE",
          pattern: /NOTE/,
          color: "blue"
        }]
      },
      src: sources
    },

    express: {
    	options: {
		port: 8000
	}

    },

    clean: {
      build: ['build'],
      release: {
        src: [releaseRoot],
        options: {
          force: true
        }
      }
    },

    concat: {
      js: {
        options: {
          banner: '//! <%= pkg.name %> <%= pkg.version %>\n' + '//! Built on <%= grunt.template.today("yyyy-mm-dd") %>\n',
          process: true
        },
        src:  [ "<banner>" ].concat(vendors, sources),
        dest: distribution
      },
      css: {
        src: [
        'css/normalize.css',
        'css/font-awesome.css',
        'css/jquery-ui.custom.min.css',
        'css/layout-default-latest.css',
        'css/jquery.qtip.min.css',
        'css/mirador.css',
        '!css/mirador-combined.css'
        ],
        dest: 'build/mirador/css/mirador-combined.css'
      }
    },

    cssmin: {
      minify: {
        src: 'css/mirador-combined.css',
        dest: 'build/mirador/css/mirador-combined.min.css'
      }
    },

    uglify: {
      options: {
        preserveComments: 'some',
        mangle: false
      },
      mirador: {
        src: [ distribution ],
        dest: minified
      }
    },

    copy: {
      deploy: {
        files: [{
          src: 'build/**',
          dest: miradorWebappDir + '/'
        },{
          src: 'index.html',
          dest: miradorWebappDir + '/'
        },{
          src: 'mirador-config.json',
          dest: miradorWebappDir + '/'
        }]
      },
      main: {
        files: [{
          expand: true,
          src: 'css/images/**',
          dest: 'build/mirador/'
        }, {
          expand: true,
          cwd: 'css/',
          src: 'themes/**',
          dest: 'build/mirador'
        }, {
          expand: true,
          cwd: 'css/',
          src: 'skins/**',
          dest: 'build/mirador'
        }, {
          expand: true,
          cwd: 'css/',
          src: 'plugins/**',
          dest: 'build/mirador'
        }, {
          expand: true,
          src: 'images/**',
          dest: 'build/mirador'
        }, {
          expand: true,
          src: 'fonts/*',
          dest: 'build/mirador'
        }, {
          src: 'js/lib/parse.min.js',
          dest: 'build/mirador/parse.min.js'
        }, {	    
          src: 'js/lib/ZeroClipboard.swf',
          dest: 'build/mirador/ZeroClipboard.swf'
        }, {
	  expand: true,	    
          src: 'locales/**',
          dest: 'build/mirador'
        }]
      }
    },

    compress: {
      zip: {
        options: {
          archive: 'build/mirador.zip'
        },
        files: [
          { expand: true, cwd: 'build/', src: ['mirador/**'] }
        ]
      },
      tar: {
        options: {
          archive: 'build/mirador.tar'
        },
        files: [
          { expand: true, cwd: 'build/', src: [ 'mirador/**' ] }
        ]
      }
    },

    connect: {
      server: {
        options: {
    	  debug: true,
  	  port: 8000,
          keepalive: true,
          base: '.'
        }
      }
    },

    watch: {
      all: {
        options: { 
          livereload: true 
        },
        files: [
          'Gruntfile.js',
          'js/src/*.js',
          'js/src/*/*.js',
          'images/*',
          'css/*.css',
          'index.html'
        ],
        tasks: 'deploy'
      }
    },

    jshint: {
      options: {
        browser: true,
        eqeqeq: false,
        loopfunc: false,
        indent: false,
        jshintrc: '.jshintrc',
        globals: {
          Mirador: true
        },
      },
      beforeconcat: sources

    },

    'git-describe': {
      build: {
        options: {
          prop: 'gitInfo'
        }
      }
    },

    githooks: {
      all: {
        'pre-commit': 'jshint cover'
        // 'post-checkout': 
      }
    },

    coveralls: {
      options: {
        src: 'reports/coverage/PhantomJS 1.9.8 (Mac OS X)/lcov.info',
        force: 'true'
      },
      ci: {
        src: 'reports/coverage/PhantomJS 1.9.8 (Mac OS X)/lcov.info'
      }
    },

    karma : {
      options: {
        basePath: '',
        frameworks: ['jasmine'],
        files: [].concat(vendors, sources, specs, ['bower_components/sinon-server/index.js', 'bower_components/jasmine-jquery/lib/jasmine-jquery.js'], {pattern: 'spec/data/manifest.json', included: false} ),
        exclude: exclude,
        proxies: {
          '/spec': 'http://localhost:9876/base/spec'
        },
        coverageReporter: {
          reporters: [
            {type: 'lcov'},
            {type: 'html'},
            {type: 'text-summary'}
          ],
          dir: 'reports/coverage'
        },
        port: 9876, // Note: web server port
        colors: true, // Note: enable / disable colors in the output (reporters and logs)
        logLevel: 'INFO',
        autoWatch: false,
        captureTimeout: 60000, // Note: If browser does not capture in given timeout [ms], kill it
        singleRun: false,
        sauceLabs: {
        },
        customLaunchers: {
          'sl_win7_chrome': {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 7',
            version: '39'
          },
          'sl_win7_firefox': {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Windows 7',
            version: '35.0'
          },
          'sl_win7_ie09': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '9'
          },
          'sl_win7_ie10': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '10'
          },
          'sl_win7_ie11': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 7',
            version: '11'
          }
        }
      },
      test: {
        reporters: ['spec'],
        browsers: ['PhantomJS'],
        singleRun: true
      },
      cover: {
        preprocessors: {
          'js/src/**/*.js': ['coverage']
        },
        reporters: ['progress', 'coverage'],
        browsers: ['PhantomJS'],
        singleRun: true
      },
      server: {
        reporters: ['progress'],
        browsers: ['Firefox'],
        background: true
      },
      chrome: {
        reporters: ['progress'],
        browsers: ['Chrome'],
        singleRun: true
      },
      firefox: {
        reporters: ['progress'],
        browsers: ['Firefox'],
        singleRun: true
      },
      browsers: {
        reporters: ['spec', 'saucelabs'],
        browsers: [
          'sl_win7_chrome', 
          'sl_win7_firefox',
          // 'sl_win7_ie9',
          // 'sl_win7_ie10',
          'sl_win7_ie11'
        ],
        singleRun: true
      }
    }
  });

  // ----------
  // Copy:release task.
  // Copies the contents of the build folder into the release folder.
  grunt.registerTask('copy:release', function() {
    grunt.file.recurse('build', function(abspath, rootdir, subdir, filename) {
      var dest = releaseRoot +
        (subdir ? subdir + '/' : '/') +
        filename;

      grunt.file.copy(abspath, dest);
    });
  });

  // ----------
  // Build task.
  // Cleans out the build folder and builds the code and images into it, checking lint.
  grunt.registerTask('build', [ 'clean:build', 'git-describe', 'jshint', 'concat', 'cssmin', 'copy:main' ]);

  grunt.registerTask('deploy', ['default', 'exec:deploy'])
  // ----------
  // Dev Build task.
  // Build, but skip the time-consuming and obscurantist minification and uglification.
  grunt.registerTask('dev_build', [ 'clean:build', 'git-describe', 'jshint', 'concat', 'copy:main','todo' ]);

  // ----------
  // Package task.
  // Builds and creates the .zip and .tar files.
  grunt.registerTask('package', ['build', 'compress']);

  // ----------
  // Publish task.
  // Cleans the built files out of the release folder and copies newly built ones over.
  grunt.registerTask('publish', ['package', 'clean:release', 'copy:release']);

  // ----------
  // Default task.
  // Does a normal build.
  grunt.registerTask('default', ['dev_build']);

  // ----------
  // Connect task.
  // Runs server at specified port
  grunt.registerTask('server', ['connect']);
 
  // Express server task
  grunt.registerTask('server-express',['express:dev']);

  // ----------
  // Test task.
  // Runs Jasmine tests
  grunt.registerTask('test', 'karma:test');

  // ----------
  // TODOs extractor
  grunt.registerTask('todo-extract','todo');

  // ----------
  // Coverage task.
  // Runs instanbul coverage
  grunt.registerTask('cover', 'karma:cover');
  
  // ----------
  // Runs this on travis.
  grunt.registerTask('ci', [
                     'jshint',
                     'test',
                     'cover',
                     'coveralls',
                     'karma:browsers'
  ]);
};
