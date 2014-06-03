'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');


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
		var done = this.async();

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
			}
		];

		this.prompt(prompts, function (props) {
			this.webName = props.webName;
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
	}

//	end: function() {
//		var path = "/file",
//			file = this.readFileAsString(path);
//
//		this.write(path, file);
//	}
});

module.exports = SymbioGenerator;
