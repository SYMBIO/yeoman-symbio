'use strict';
var util = require('util');
var	yeoman = require('yeoman-generator');
var path = require('path');
var	yosay = require('yosay');
var	chalk = require('chalk');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var SymbioGenerator = yeoman.generators.Base.extend({
	init: function () {
		var self = this;
		this.pkg = require('../package.json');

		this.on('end', function () {
			console.log(this.projectType === 'Silex' || this.projectType === 'Symfony 2' || this.projectType === 'OrangeGate 3');
			if(this.projectType === 'Silex' || this.projectType === 'Symfony 2' || this.projectType === 'OrangeGate 3') {
				var composer;
//					done = this.async();
				console.log(this.globalComposer);
				if (this.globalComposer) {
					console.log(this.projectType === 'OrangeGate 3');
					if (this.projectType === 'OrangeGate 3') {
						composer = exec('composer -nv create-project --repository-url="http://satis.symbio.intra/" --keep-vcs  sandbox/og3 ./og3');
					} else {
						composer = exec('composer install');
					}
				} else {
					if (this.projectType === 'OrangeGate 3') {
						composer = exec('php composer.phar -nv create-project --repository-url="http://satis.symbio.intra/" --keep-vcs  sandbox/og3 ./og3')
					} else {
						composer = exec('php composer.phar install');
					}
				}

				composer.stdout.on('data', function (data) {
					console.log(chalk.yellow(data.toString()));
				});

				composer.on('exit', function() {
					if (!self.options['skip-install']) {
						self.installDependencies({
							callback: function () {
								self.spawnCommand('grunt', ['copy']);
							}.bind(self)
						});
					}
				});
			} else {
				if (!this.options['skip-install']) {
					this.installDependencies({
						callback: function () {
							this.spawnCommand('grunt', ['copy']);
						}.bind(this)
					});
				}
			}

			this.log(chalk.yellow('For creating local host use:', chalk.underline('yo symbio:host <domain_name>')));
		});
	},

	askFor: function () {
		var done = this.async(),
			self = this;

		// Have Yeoman greet the user.
		this.log(yosay('Welcome to the marvelous SYMBIO generator!'));

		console.log(chalk.yellow.bold('Be aware!'));
		console.log(chalk.yellow('Based on selected framework can first deployment take several minutes (because dependencies are downloaded from git).'));

		var prompts = [
			{
				type    : "input",
				name    : "webName",
				message : "Your project name",
				default : this.appname // Default to current folder name
			},
			{
				type: 'confirm',
				name: 'useAlmond',
				message: 'Would you like to use Almond (Smaller RequireJS modules loader: https://github.com/jrburke/almond)?',
				default: false
			},
			{
				type: 'list',
				name: 'projectType',
				message: 'What type of project will you do?',
				choices: [
					'Static',
					'OrangeGate 3',
					'Symfony 2',
					'Silex'
				]
			}
		];

		this.prompt(prompts, function (props) {
			this.webName = props.webName;
			this.projectType = props.projectType;
			this.requirejsMainPath = (!props.useAlmond) ? '../main' : '../vendor/almond';

			done();
		}.bind(this));
	},

	app: function () {
		this.mkdir('web');


		this.mkdir('web/js');
		this.mkdir('web/js/vendor');

		this.mkdir('web/sass');
		this.mkdir('web/sass/vendor');

		this.copy('_package.json', 'package.json');
		this.copy('_bower.json', 'bower.json');
		this.copy('_GruntFile.js', 'GruntFile.js');
		this.copy('editorconfig', '.editorconfig');
//		this.copy('gitignore', '.gitignore');

		if (this.projectType === 'Silex' || this.projectType === 'Symfony 2') {
			var appPath = this.destinationRoot(),
				done = this.async(),
				username, repo;

			switch (this.projectType) {
				case 'Silex':
					username = 'silexphp';
					repo = 'Silex';
					break;
				case 'Symfony 2':
					username = 'symfony';
					repo = 'symfony';
			}

			this.remote(username, repo, function(err, remote) {
				if (err) {
					return console.log(err);
				}

				remote.bulkDirectory('.', path.join(appPath, '.'));
				done();
			});
		}

	},

	checkComposer:function() {
		var done = this.async();
		// Check if composer is installed globally
		this.globalComposer = false;
		exec('composer', ['-V'], function (error, stdout, stderr) {
			if (error != null) {
				var prompts = [{
					type: 'confirm',
					name: 'continue',
					message: 'WARNING: No global composer installation found. We will install locally if you decide to continue. Continue?',
					default: false
				}];
				this.prompt(prompts, function (answers) {
					if (answers.continue) {
						// Use the secondary installation method as we cannot assume curl is installed
						exec('php -r "readfile(\'https://getcomposer.org/installer\');" | php');
						console.log('Installing composer locally.');
						console.log('See http://getcomposer.org for more details on composer.');
						console.log('');
						done();
					}
				}.bind(this));
			} else {
				this.globalComposer = true;
				done();
			}
		}.bind(this));
	}
});


module.exports = SymbioGenerator;