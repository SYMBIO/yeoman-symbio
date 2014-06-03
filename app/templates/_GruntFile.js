// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>

module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			sass: {
				files: ['web/sass/*.sass'],
				tasks: ['sass:dev'],
				options: {
					files: ['web/main.css']
				}
			}
		},
		sass: {
			dev: {
				options: {
					style: 'expanded',
					sourcemap: true,
					quiet: true
				},
				files  : {
					'web/css/main.css': ['web/sass/main.sass']
				}
			}
		},
		requirejs: {
			build: {
				options: {
					baseUrl: 'web/js/lib',
					mainConfigFile: 'web/js/main.js',
					name: '<%= requirejsMainPath  %>',
					out: 'web/js/main.min.js',
					preserveLicenseComments: false,
					generateSourceMaps: true,
					optimize: 'uglify2'
				}
			}
		},
		csso: {
			build: {
				options: {
					report: 'min'
				},
				files: {
					'web/css/main.min.css': 'web/css/main.css'
				}
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, cwd: 'bower_components/almond/', src: ['almond.js'], dest: 'web/js/vendor/'},
					{expand: true, cwd: 'bower_components/jquery/', src: ['jquery.min.js'], dest: 'web/js/vendor/'},
					{expand: true, cwd: 'bower_components/lodash/dist/', src: ['lodash.compat.min.js'], dest: 'web/js/vendor/'},
					{expand: true, cwd: 'bower_components/modernizr/', src: ['modernizr.js'], dest: 'web/js/vendor/'},
					{expand: true, cwd: 'bower_components/requirejs/', src: ['requirejs.js'], dest: 'web/js/vendor/'},
					{expand: true, cwd: 'bower_components/normalize-scss/', src: ['_normalize.scss'], dest: 'web/sass/vendor/'},
					{expand: true, cwd: 'bower_components/bourbon/dist/', src: ['**'], dest: 'web/sass/vendor/bourbon'},
					{expand: true, cwd: 'bower_components/neat/app/assets/stylesheets/', src: ['**'], dest: 'web/sass/vendor/neat/'}
				]
			}
		},

		browserSync: {
			dist: {
				bsFiles: {
					src : ["web/css/**.css", "web/js/**.js", "apps/frontend/templates/**.php", "apps/frontend/modules/default/templates/**.php"]
				},
				options: {
					proxy: "http://local.csob-prevention.cz/",
					watchTask: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-csso');
	grunt.loadNpmTasks('grunt-csso');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['browserSync', 'watch']);
	grunt.registerTask('build', ['requirejs:build', 'sass', 'csso:build']);
};