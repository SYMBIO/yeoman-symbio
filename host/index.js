'use strict';
var util = require('util'),
	yeoman = require('yeoman-generator'),
	chalk = require('chalk'),
	spawn = require('child_process').spawn,
	sudo = require('sudo');


var HostGenerator = yeoman.generators.NamedBase.extend({
	init: function () {
		var self = this;

		self.currentDir = process.cwd();

		self.on('end', function () {

		});

		self.initHost();
	},

	initHost: function () {
		var self = this,
			done = this.async(),
			grep = spawn('grep', [self.name, '/etc/hosts']);

		self.isInHost = false;

		grep.on('close', function (code) {
			if (code !== 1) {
				self.isInHost = true;
			}

			done();
		});

		self.initVHost();
	},

	appendHost:function() {
		var self = this,
			done = this.async(),
			host;

		self.log(chalk.yellow('Writing entry in /etc/hosts for domain ', chalk.bold(this.name)));
		host = sudo(['bash', './tmp/appendHosts.sh', self.name], {
			cachePassword: true,
			prompt: 'Password, yo? '
		});

		host.on('close', function (code) {
			if(code === 1) {
				self.log(chalk.red('There has been some problem in writing to /etc/hosts...'));
			} else {
				self.log(chalk.green('Hosts entry created successfully.'));
			}
		});

	},

	initVHost: function() {
		var self = this,
			done = this.async(),
			grep = spawn('grep', ['Include /private/etc/apache2/virtualhosts', '/etc/apache2/httpd.conf']);

		self.isVirtualhosts = false;

		grep.on('close', function (code) {
			if (code === 1) {
				self.isVirtualhosts = true
			}

			done();
		});
	},

	createVHost: function() {
		var self = this,
			vhost;

		self.log(chalk.yellow('Creating conf file in /private/etc/apache2/virtualhosts for localhost ', chalk.bold(this.name)));
		vhost = sudo(['bash', './tmp/createFileInVhosts.sh'], {
			cachePassword: true,
			prompt: 'Password, yo? '
		});

		vhost.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		vhost.on('close', function (code) {
			if(code === 1) {
				self.log(chalk.red('There has been some problem in creating file in /private/etc/apache2/virtualhosts...'));
			} else {
				self.log(chalk.green('Virtualhost file created successfully.'));
			}
		});

	},

	appendHttpd: function() {
		var self = this,
			httpdconf;

		httpdconf = sudo(['bash', './tmp/appendHttpd.sh'], {
			cachePassword: true,
			prompt: 'Password, yo? '
		});

		httpdconf.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		httpdconf.on('close', function (code) {
			console.log(code);
			if(code === 1) {
				self.log(chalk.red('There has been some problem in writing to /etc/apache2/httpd.conf...'));
			} else {
				self.log(chalk.green('httpd.conf modified successfully.'));
			}
		});

	},

	files: function () {
		var done = this.async();

		this.mkdir('tmp');

		this.copy('appendHosts.sh', 'tmp/appendHosts.sh');
		this.copy('createFileInVhosts.sh', 'tmp/createFileInVhosts.sh');
		this.copy('appendHttpd.sh', 'tmp/appendHttpd.sh');
		this.copy('silex.conf', 'tmp/virtualhost.conf');

		done();
	},

	app: function () {
		var self = this;
	},

	end: function () {
//		this.log(chalk.green('We\'re done here...'));

		var self = this;

		console.log(self.isInHost);
		if (!self.isInHost) {
			self.appendHost();
		} else {
			self.log(chalk.red('Host is already in /etc/hosts'));
		}

		console.log(self.isVirtualhosts);
		if (!self.isVirtualhosts) {
			self.createVHost();
		} else {
			self.log(chalk.red('Your httpd.conf file don\'t allow creating of custom conf files in /private/etc/apache2/virtualhosts, therefore it will be modified.'));
			self.appendHttpd();
		}

//		this.init()
	}
});

module.exports = HostGenerator;