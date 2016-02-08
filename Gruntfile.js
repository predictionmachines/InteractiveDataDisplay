module.exports = function (grunt) {

    grunt.initConfig({
        concat: {
            heatmap_worker: { // Concatenate idd.heatmapworker.js и idd.transforms.js for tests
                options: {
                    separator: ';'
                },
                src: [ 
                    "src/idd/idd.transforms.js",
                    "src/idd/idd.heatmapworker.js",
                ],
                dest: 'idd.heatmapworker.js',
                nonull: true
            },
            heatmap_worker_embedded: {
                options: {
                    separator: ''
                },
                src: [
                  "src/idd/heatmap_worker_header.txt",
                  "generated/heatmapworker.b64",
                  "src/idd/heatmap_worker_footer.txt"
                ],
                dest: 'generated/idd.heatmapworker_embedded.js'                  
            },
            dist: {
                options: {
                    separator: ';'
                },
                src: [ 
                    "src/idd/wrapper_header.txt",
                    "src/idd/mouseWheelPlugin.js",
                    "src/idd/idd.settings.js",
                    "src/idd/idd.utils.js",
                    "src/idd/idd.boundplots.js",
                    "src/idd/idd.base.js",
                    "src/idd/idd.readers.js",
                    "src/idd/idd.axis.js",
                    "src/idd/idd.palette.js",
                    "src/idd/idd.gestures.js",
                    "src/idd/idd.transforms.js",
                    "src/idd/idd.animation.js",
                    "src/idd/idd.bingMapsAnimation.js",
                    "src/idd/idd.navigation.js",
                    "src/idd/idd.multithreading.js",
                    "generated/idd.heatmapworker_embedded.js",
                    "src/idd/idd.figure.js",
                    "src/idd/idd.chart.js",
                    "src/idd/idd.markers.js",
                    "src/idd/idd.area.js",
                    "src/idd/idd.heatmap.js",
                    "src/idd/idd.bingmapsplot.js",
                    "src/idd/wrapper_footer.txt"
                ],
                dest: 'dist/idd.js',
                nonull: true
            },
            dist2: {
                src: [
                    //    "src/viewer/Chart.header.js",
                        "src/viewer/MathUtils.js",
                        "src/viewer/chartViewer2.js",
                   //     "src/viewer/Chart.footer.js"
                ],
                dest: "dist/chartViewer.js",
                nonull: true
            },
            umd: {
                src: [
                    "src/viewer/Chart.header.js",
                    "src/viewer/MathUtils.js",
                    "src/viewer/chartViewer2.js",
                    "src/viewer/Chart.footer.js"
                ],
                dest: "dist/chartViewer.umd.js",
            },
            umdTs: {
                dest: "dist/chartViewer.umd.d.ts",
                src: ["src/viewer/chartViewer2.d.ts"],
                options: {
                    footer: "export = { ChartViewer, Plot };"
                }
            }
        },
        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/idd.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jasmine: {
            options: {
                keepRunner: true,
                vendor: [
                    "ext/jquery/dist/jquery.js",
                    "ext/rxjs/dist/rx.lite.js",
                    "<%= concat.dist.dest %>"
                ]
            },

            src: ['test/**/*.js']
        },
        copy: {
            main: {
                files: [
                    { src: 'src/css/idd.css', dest: 'dist/idd.css' },
                    { src: "src/css/chartViewer.css", dest: "dist/chartViewer.css" },
                    { src: "src/viewer/chartViewer2.d.ts", dest: "dist/chartViewer.d.ts"},
                    { expand: true, src: "src/icons/*", dest: "dist/icons/", flatten: true }
                ]
            },
        },
        bower: {
            options: {
                copy: false
            },
            install: { }
        },
        base64: {
            heatmap_worker: {         
                files: {
                    'generated/heatmapworker.b64': ['<%= concat.heatmap_worker.dest %>']
                }
            }
        },
        ts: {
            options: {
                target: 'es5',
                sourceMap: false,
                declaration: true
            },
            dev: {
                src: ["src/viewer/*.ts"],
                out: 'src/viewer/chartViewer2.js',
            },
        },
        lineremover: {
            customExclude: {
                files: {
                    'src/viewer/chartViewer2.d.ts': 'src/viewer/chartViewer2.d.ts'
                },
                options: {
                    exclusionPattern: /^\/\/\/ <reference path=.*\/>*/
                }
            }
        },
        wiredep: {
            task: {
                src: [
                  'samples/viewer/*.html'
                ],
                options: {
                    // https://github.com/taptapship/wiredep#configuration
                }
            }
        },
        tsd: {
            refresh: {
                options: {
                    // execute a command
                    command: 'reinstall',

                    //optional: always get from HEAD
                    latest: true,
                    
                    // specify config file
                    config: 'tsd.json',

                    // experimental: options to pass to tsd.API
                    opts: {
                        // props from tsd.Options
                    }
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-base64');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-tsd');
    grunt.loadNpmTasks('grunt-bower-task');;
    grunt.loadNpmTasks('grunt-line-remover');

    grunt.registerTask('default', ['bower', 'concat:heatmap_worker', 'base64', 'concat:heatmap_worker_embedded', 'concat:dist', 'uglify', 'tsd', 'ts', 'lineremover', 'concat:dist2', 'copy','concat:umd', 'concat:umdTs', 'wiredep', 'jasmine']);
    grunt.registerTask('test', ['bower', 'jasmine']);
};