module.exports = function (grunt) {

	//the following files are to be included in every bundle
	coreSrcFiles = [
		"src/idd/idd.settings.js",
        "src/idd/idd.utils.js",
        "src/idd/idd.boundplots.js",
        "src/idd/idd.formatter.js",
        "src/idd/idd.base.js",
        "src/idd/idd.readers.js",
        "src/idd/idd.axis.js",
        "src/idd/idd.palette.js",
        "src/idd/idd.paletteEditor.js",
        "src/idd/idd.gestures.js",
        "src/idd/idd.transforms.js",
        "src/idd/idd.animation.js",
        "src/idd/idd.bingMapsAnimation.js",
        "src/idd/idd.navigation.js",
        "src/idd/idd.multithreading.js",
        "generated/idd.heatmapworker_embedded.js",
        "src/idd/idd.figure.js",
        "src/idd/idd.chart.js",
        "src/idd/idd.labels.js",
        "src/idd/idd.markers.js",
        "src/idd/idd.markers.primitives.js",
        "src/idd/idd.markers.uncertain.js",
        "src/idd/idd.area.js",
        "src/idd/idd.heatmap.js",
        "src/idd/idd.onscreennavigation.js",
        "src/idd/idd.bingmapsplot.js",
        "src/viewer/chartViewer2.js"];

	//the following files are to be included only in Knockout bundle
	knockoutBindingsFiles = [
		"src/idd/idd.ko.js",
        "src/idd/idd.ko.markers.js",
        "src/idd/idd.ko.polyline.js",
        "src/idd/idd.ko.domplot.js",
        "src/idd/idd.ko.area.js",
        "src/idd/idd.ko.heatmap.js",
		"src/idd/idd.ko.labels.js"
	]

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
            styles: {
                options: {
                    separator: ''
                },
                src: [
                  "src/css/idd.css",
                  "src/css/chartViewer.css"
                ],
                dest: 'dist/idd.css'     
            },
            dist: {
                options: {
                    separator: ';'
                },
                src: coreSrcFiles,
                dest: 'dist/idd.js',
                nonull: true
            },
            dist_ko: {
                options: {
                    separator: ';'
                },
                src: ["src/idd/wrapper_header_knockout.txt"]
					.concat(coreSrcFiles)
					.concat(knockoutBindingsFiles)
					.concat(["src/idd/wrapper_footer_knockout.txt"]),
                dest: 'dist/idd_knockout.js',
                nonull: true
            },
            umd: {
                src: ["src/idd/wrapper_header.txt"]
					.concat(coreSrcFiles)
					.concat(["src/idd/wrapper_footer.txt"]),
                dest: "dist/idd.umd.js",
            },
            umdTs: {
                dest: "dist/idd.umd.d.ts",
                src: ["src/viewer/chartViewer.d.ts"],
                options: {
                    footer: "export = { InteractiveDataDisplay, Plot };"
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
                    "node_modules/jquery/dist/jquery.js",
                    "node_modules/rx/dist/rx.lite.js",
                    "node_modules/svg.js/dist/svg.js",
                    "node_modules/jquery-mousewheel/jquery.mousewheel.js",
                    "<%= concat.dist.dest %>"
                ]
            },

            src: ['test/*.js'] 
        },
        copy: {
            main: {
                files: [
                    { src: "src/viewer/chartViewer.d.ts", dest: "dist/idd.d.ts" },
                    { src: "dist/idd.css", dest: "dist/idd.umd.css" },
                    { expand: true, src: "src/icons/*", dest: "dist/icons/", flatten: true },
                    { src: 'idd.heatmapworker.js', dest: 'dist/idd.heatmapworker.js' }
                ]
            },
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
    grunt.loadNpmTasks('grunt-tsd');

    grunt.registerTask('update-tsd', ['tsd']);
    grunt.registerTask('default', ['concat:heatmap_worker', 'base64', 'concat:heatmap_worker_embedded', 'concat:styles', 'concat:dist_ko', 'ts:dist', 'concat:dist', 'uglify', 'copy', 'concat:umd', 'concat:umdTs', 'ts:testGlobal', 'ts:test', 'jasmine']);
    grunt.registerTask('test', ['jasmine']);
};