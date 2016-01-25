module.exports = function (grunt) {

    grunt.initConfig({
        concat: {
            heatmap_worker: { // Concatenate idd.heatmapworker.js и idd.transforms.js for tests
                options: {
                     separator: ';'
                },
                src: [ 
                    "src/js/idd.transforms.js",
                    "src/js/idd.heatmapworker.js",
                ],
                dest: 'idd.heatmapworker.js',
                nonull: true
            },
            heatmap_worker_embedded: {
                  options: {
                    separator: ''
                  },
                  src: [
                    "src/js/heatmap_worker_header.txt",
                    "generated/heatmapworker.b64",
                    "src/js/heatmap_worker_footer.txt"
                  ],
                  dest: 'generated/idd.heatmapworker_embedded.js'                  
            },
            dist: {
                options: {
                  separator: ';'
                },
                src: [ 
                    "src/js/wrapper_header.txt",
                    "src/js/mouseWheelPlugin.js",
                    "src/js/idd.settings.js",
                    "src/js/idd.utils.js",
                    "src/js/idd.boundplots.js",
                    "src/js/idd.base.js",
                    "src/js/idd.readers.js",
                    "src/js/idd.axis.js",
                    "src/js/idd.palette.js",
                    "src/js/idd.gestures.js",
                    "src/js/idd.transforms.js",
                    "src/js/idd.animation.js",
                    "src/js/idd.bingMapsAnimation.js",
                    "src/js/idd.navigation.js",
                    "src/js/idd.multithreading.js",
                    "generated/idd.heatmapworker_embedded.js",
                    "src/js/idd.figure.js",
                    "src/js/idd.chart.js",
                    "src/js/idd.markers.js",
                    "src/js/idd.area.js",
                    "src/js/idd.heatmap.js",
                    "src/js/idd.bingmapsplot.js",
                    "src/js/wrapper_footer.txt"
                ],
                dest: 'dist/idd.js',
                nonull: true
            },
            
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
                    { src: 'src/css/idd.css', dest: 'dist/idd.css' }                    
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
       }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-base64');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-bower-task');

    grunt.registerTask('default', ['bower', 'concat:heatmap_worker', 'base64', 'concat:heatmap_worker_embedded', 'concat:dist', 'uglify', 'copy', 'jasmine']);
    grunt.registerTask('test', ['bower', 'jasmine']);
};