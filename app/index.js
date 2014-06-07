'use strict';
var util = require('util'),
	path = require('path'),
	yeoman = require('yeoman-generator'),
	yosay = require('yosay'),
	chalk = require('chalk');


var SymbioGenerator = yeoman.generators.Base.extend({
	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			if (!this.options['skip-install']) {
				this.installDependencies({
					callback: function () {
						this.spawnCommand('grunt', ['copy']);
					}.bind(this)
				});
			}
		});
	},

	askFor: function () {
		var done = this.async(),
			self = this;

		// Have Yeoman greet the user.
		this.log(yosay('Welcome to the marvelous SYMBIO generator!'));

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
				choices: ['Static','Symfony 1.4', 'Symfony 2', 'Silex =)']
			},
			{
				type: 'confirm',
				name: 'appendHost',
				message : "Do you want create local host?",
				default : true
			},
			{
				when: function (answers) {
					return answers.appendHost;
				},


				type: 'input',
				name: 'hostName',
				message: 'Domain name?',
				default: function (answers) {
					return 'local.' + self._.slugify(answers.webName) + '.cz';
				}
			}
		];

		this.prompt(prompts, function (props) {
			this.webName = props.webName;
			this.createHost = props.appendHost;
			this.hostName = props.hostName;
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
		this.copy('gitignore', '.gitignore');
	},

	end: function() {
		if(this.createHost) {
			this.invoke("symbio:host", {options: {nested: true, appName: this.appName}, args: [this.hostName]})
		} else {
			this.log(chalk.green.bold('You can allways create local host by command', chalk.underline('yo symbio:host "<domain_name>"')));
		}



		this.init()
	}
});

module.exports = SymbioGenerator;
