'use strict';
var util = require('util');
var	yeoman = require('yeoman-generator');
var	chalk = require('chalk');
var	sudo = require('sudo');
var exec = require('child_process').exec;

var HostGenerator = yeoman.generators.Base.extend({
	init: function () {
		var self = this;

		self.currentDir = process.cwd();

		self.on('end', function () {
			self.npmInstall('hostile', function() {
				self.emit('dependenciesInstalled')
			});
		});

		self.on('dependenciesInstalled', function () {
			var host = sudo(['node', './.virtualhost-generator.js', self.hostName, self.currentDir]);

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

	askFor: function () {
		var done = this.async(),
			self = this;

		// Have Yeoman greet the user.

		console.log(self.config.get('hostName'));

		if (typeof self.config.get('hostName') !== 'undefined') {
			self.hostName = self.config.get('hostName');

			done();
		} else {
			var prompts = [
				{
					type   : 'input',
					name   : 'hostName',
					message: 'Domain name?'
				}
			];

			self.prompt(prompts, function (props) {
				self.hostName = props.hostName;
				self.config.set('hostName', self.hostName);

				done();
			}.bind(self));
		}
	},

	files: function () {
		var done = this.async();

		this.copy('_virtualhost-generator.js', '.virtualhost-generator.js');

		done();
	}
});

module.exports = HostGenerator;