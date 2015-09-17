module.exports = function (grunt) {

    grunt.initConfig({
        concat: {
            heatmap_worker: {
                  options: {
                    separator: ''
                  },
                  src: [
                    "src/js/heatmap_worker_header.txt",
                    "src/heatmapworker.b64",
                    "src/js/heatmap_worker_footer.txt"
                  ],
                  dest: 'src/js/idd.heatmapworker_loader.js'                  
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
                    "src/js/idd.heatmapworker_loader.js",
                    "src/js/idd.figure.js",
                    "src/js/idd.chart.js",
                    "src/js/idd.markers.js",
                    "src/js/idd.heatmap.js",
                    "src/js/idd.bingmapsplot.js",
                    "src/js/wrapper_footer.txt"
                ],
                dest: 'dist/idd.js',
                nonull: true
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
              'src/heatmapworker.b64': ['src/js/idd.transforms.js', 'src/js/idd.heatmapworker.js']
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

    grunt.registerTask('default', ['bower', 'base64','concat', 'uglify', 'copy', 'jasmine']);
    grunt.registerTask('test', ['bower', 'jasmine']);
};