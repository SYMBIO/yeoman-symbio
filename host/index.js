'use strict';
var util = require('util'),
	yeoman = require('yeoman-generator'),
	chalk = require('chalk'),
	sudo = require('sudo');

var HostGenerator = yeoman.generators.NamedBase.extend({
	init: function () {
		var self = this;

		self.currentDir = process.cwd();

		self.on('end', function () {
			var host = sudo(['node', './tmp/virtualhost-generator.js', this.name, self.currentDir]);

			host.stdout.on('data', function (data) {
				var response = data.toString();
				console.log(chalk.green(data.toString()));

				if (response.indexOf('Virtual host set successfully') !== -1) {
					console.log(chalk.yellow('Restarting apache...'));
					sudo(['apachectl', 'graceful']);
				}
			});
		});
	},

	files: function () {
		var done = this.async();

		this.directory('tmp', 'tmp');
		done();
	}
});

module.exports = HostGenerator;