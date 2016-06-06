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
                    "src/idd/idd.formatter.js",
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
                    "src/idd/idd.markers.primitives.js",
                    "src/idd/idd.markers.uncertain.js",
                    "src/idd/idd.area.js",
                    "src/idd/idd.heatmap.js",
                    "src/idd/idd.onscreennavigation.js",
                    "src/idd/idd.bingmapsplot.js",
                    "src/idd/wrapper_footer.txt"
                ],
                dest: 'dist/idd.js',
                nonull: true
            },
            dist_ko: {
                options: {
                    separator: ';'
                },
                src: [ 
                    "src/idd/wrapper_header_knockout.txt",
                    "src/idd/mouseWheelPlugin.js",
                    "src/idd/idd.settings.js",
                    "src/idd/idd.utils.js",
                    "src/idd/idd.boundplots.js",
                    "src/idd/idd.formatter.js",
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
                    "src/idd/idd.markers.primitives.js",
                    "src/idd/idd.markers.uncertain.js",
                    "src/idd/idd.area.js",
                    "src/idd/idd.heatmap.js",
                    "src/idd/idd.onscreennavigation.js",
                    "src/idd/idd.bingmapsplot.js",
                    "src/idd/idd.ko.js",
                    "src/idd/wrapper_footer_knockout.txt"
                ],
                dest: 'dist/idd_knockout.js',
                nonull: true
            },
            dist2: {
                src: [
                        "src/viewer/MathUtils.js",
                        "src/viewer/chartViewer2.js"
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
                src: ["src/viewer/chartViewer.d.ts"],
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
                    'dist/idd.min.js': ['<%= concat.dist.dest %>'],
					'dist/idd_knockout.min.js': ['<%= concat.dist_ko.dest %>']
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

            src: ['test/*.js'] 
        },
        copy: {
            main: {
                files: [
                    { src: 'src/css/idd.css', dest: 'dist/idd.css' },
                    { src: "src/css/chartViewer.css", dest: "dist/chartViewer.css" },
                    { src: "src/viewer/chartViewer.d.ts", dest: "dist/chartViewer.d.ts"},
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
            dist: {
                options: {
                    target: 'es5',
                    sourceMap: false
                },
                src: ["src/viewer/*.ts", "!src/viewer/chartViewer.d.ts"],
                out: 'src/viewer/chartViewer2.js'
            },
            testGlobal: {
                options: {
                    target: 'es5',
                    sourceMap: false,
                    module: ""
                },
                files: [{src: "test/manual/mainGlobal.ts", outDir: 'test/manual'} ]
            },
            test: {
                options: {
                    target: 'es5',
                    sourceMap: false,
                    module: 'amd'
                },
                files: [{ src: "test/manual/main.ts", outDir: 'test/manual' }]
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

    grunt.registerTask('update-tsd', ['tsd']);
    grunt.registerTask('default', ['bower', 'concat:heatmap_worker', 'base64', 'concat:heatmap_worker_embedded', 'concat:dist', 'concat:dist_ko', 'uglify', 'ts:dist', 'concat:dist2', 'copy','concat:umd', 'concat:umdTs', 'wiredep', 'ts:testGlobal', 'ts:test', 'jasmine']);
    grunt.registerTask('test', ['bower', 'jasmine']);
};