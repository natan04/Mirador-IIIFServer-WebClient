module.exports = function (grunt) {

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
        grunt.loadNpmTasks('grunt-githooks');
        grunt.loadNpmTasks('grunt-todo');

        // ----------
        var distribution = 'build/mirador/mirador.js';
        var minified = 'build/mirador/mirador.min.js';
        var releaseRoot = '../site-build/built-mirador/';

        // libraries/plugins
        var vendors = [
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

                // source files
                sources = [
                        'js/src/*.js',
                        'js/src/viewer/*.js',
                        'js/src/manifests/*.js',
                        'js/src/annotations/*.js',
                        'js/src/workspaces/*.js',
                        'js/src/widgets/*.js',
                        'js/src/utils/*.js',
                        'js/src/FuncClass/*.js',
                        'js/src/InvokerLib/*.js'
                ],

                specs = ['spec/**/*js'],
                exclude = [];

        if (!grunt.option('full')) {
                exclude.push('spec/mirador.test.js');
        }

        // ----------
        // Project configuration.
        grunt.initConfig({
                pkg: grunt.file.readJSON('package.json'),

                ////////////////////////////////// TODO Task
                todo: {
                        options: {
                                file: "TODOs.md",
                                githubBoxes: true,
                                colophon: true,
                                usePackage: true,

                                marks: [{
                                        pattern: /DONE/,
                                        color: "gray",
                                        name: "DONE"
                                }, {
                                        name: "FIX",
                                        pattern: /FIXME/,
                                        color: "red"
                                }, {
                                        name: "TODO",
                                        pattern: /TODO/,
                                        color: "yellow"
                                }, {
                                        name: "NOTE",
                                        pattern: /NOTE/,
                                        color: "blue"
                                }],
                                src: sources
                        }
                },

                //////////////////////////////////// CLEAN task
                clean: {
                        build: ['build'],
                        release: {
                                src: [releaseRoot],
                                options: {
                                        force: true
                                }
                        }
                },

                //////////////////////////////////// CONCAT task
                concat: {

                        // concat JS config
                        js: {
                                options: {
                                        banner: '//! <%= pkg.name %> <%= pkg.version %>\n' + '//! Built on <%= grunt.template.today("yyyy-mm-dd") %>\n',
                                        process: true
                                },
                                src: ["<banner>"].concat(vendors, sources),
                                dest: distribution
                        },

                        // concat CSS config
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

                //////////////////////////////////// CSS MINIFY task
                cssmin: {
                        minify: {
                                src: 'css/mirador-combined.css',
                                dest: 'build/mirador/css/mirador-combined.min.css'
                        }
                },

                //////////////////////////////////// UGLIFY task
                uglify: {
                        options: {
                                preserveComments: 'some',
                                mangle: false
                        },
                        mirador: {
                                src: [distribution],
                                dest: minified
                        }
                },

                //////////////////////////////////// GIT-DESCRIBE task
                'git-describe': {
                        build: {
                                options: {
                                        prop: 'gitInfo'
                                }
                        }
                },

                //////////////////////////////////// COPY task
                copy: {
                        // COPY main config
                        main: {
                                files: [
                                        // Copy css images
                                        {
                                                expand: true,
                                                src: 'css/images/**',
                                                dest: 'build/mirador/'
                                        },
                                        // Copy themes CSS
                                        {
                                                expand: true,
                                                cwd: 'css/',
                                                src: 'themes/**',
                                                dest: 'build/mirador'
                                        },
                                        // Copy skins CSS
                                        {
                                                expand: true,
                                                cwd: 'css/',
                                                src: 'skins/**',
                                                dest: 'build/mirador'
                                        },
                                        // Copy plugins CSS
                                        {
                                                expand: true,
                                                cwd: 'css/',
                                                src: 'plugins/**',
                                                dest: 'build/mirador'
                                        },
                                        // Copy UI images
                                        {
                                                expand: true,
                                                src: 'images/**',
                                                dest: 'build/mirador'
                                        },
                                        // Copy fonts
                                        {
                                                expand: true,
                                                src: 'fonts/*',
                                                dest: 'build/mirador'
                                        },
                                        // Copy parse library (minified)
                                        {
                                                src: 'js/lib/parse.min.js',
                                                dest: 'build/mirador/parse.min.js'
                                        },
                                        // Copy ZeroClipboard extension (flash)
                                        {
                                                src: 'js/lib/ZeroClipboard.swf',
                                                dest: 'build/mirador/ZeroClipboard.swf'
                                        },
                                        // Copy locales
                                        {
                                                expand: true,
                                                src: 'locales/**',
                                                dest: 'build/mirador'
                                        }
                                ]
                        }
                },

                //////////////////////////////////// COMPRESS task
                compress: {
                        zip: {
                                options: {
                                        archive: 'build/mirador.zip'
                                },
                                files: [{
                                        expand: true,
                                        cwd: 'build/',
                                        src: ['mirador/**']
                                }]
                        },
                        tar: {
                                options: {
                                        archive: 'build/mirador.tar'
                                },
                                files: [{
                                        expand: true,
                                        cwd: 'build/',
                                        src: ['mirador/**']
                                }]
                        }
                },

                //////////////////////////////////// CONNECT task
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

                //////////////////////////////////// WATCH task
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
                                tasks: 'dev_build'
                        }
                },

                //////////////////////////////////// JSHINT task
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


                //////////////////////////////////// GIT-HOOKS task
                githooks: {
                        all: {
                                'pre-commit': 'jshint cover'
                                        // 'post-checkout': 
                        }
                }


        });


        // ----------
        // Copy:release task.
        // Copies the contents of the build folder into the release folder.
        grunt.registerTask('copy:release', function () {
                grunt.file.recurse('build', function (abspath, rootdir, subdir, filename) {
                        var dest = releaseRoot +
                                (subdir ? subdir + '/' : '/') +
                                filename;

                        grunt.file.copy(abspath, dest);
                });
        });

        // ----------
        // Build task.
        // Cleans out the build folder and builds the code and images into it, checking lint.
        grunt.registerTask('build', ['clean:build', 'git-describe', 'jshint', 'concat', 'cssmin', 'copy:main']);

        // ----------
        // Dev Build task.
        // Build, but skip the time-consuming and obscurantist minification and uglification.
        grunt.registerTask('dev_build', ['clean:build', 'git-describe', 'jshint', 'concat', 'copy:main', 'todo']);

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
        grunt.registerTask('default', ['build']);

        // ----------
        // Connect task.
        // Runs server at specified port
        grunt.registerTask('server', ['connect']);

        // ----------
        // TODOs extractor
        grunt.registerTask('todo-extract', 'todo');

};
