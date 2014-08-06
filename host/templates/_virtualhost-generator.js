/**
 * Created by arnostpleskot on 07.06.2014.
 */
var hostile = require('hostile'),
	fs = require('fs'),
	domain = process.argv[2],
	pwd = process.argv[3],
	folder = '/private/etc/apache2/virtualhosts',
	path = folder + '/' + domain + '.conf',
	httpd = '/etc/apache2/httpd.conf';

var VirtualHost = {
	init: function() {
		if (typeof domain === 'undefined') {
			return console.log('Domain not set! Set domain as parameter: node ./virtualhost-generator.js domain.com /path/to/web/folder');
		}
		if (typeof pwd === 'undefined') {
			return console.log('Folder with web not set! Set domain as parameter: node ./virtualhost-generator.js domain.com /path/to/web/folder');
		}
		this.testHttpd();
		this.createHost();
		this.createVirtualHost();
	},

	createHost: function() {
		hostile.set('127.0.0.1', domain, function (err) {
			if (err) {
				console.error(err)
			} else {
				console.log('Host set successfully!')
			}
		});
	},

	createVirtualHost: function() {
		var content = [
				'<VirtualHost *:80>',
				'  DocumentRoot "' + pwd + '/web"',
				'  ServerName ' + domain,
				'  DirectoryIndex index.php, index.html',
				'  <Directory "' + pwd + '">',
				'    Options All',
				'    AllowOverride All',
				'    Order allow,deny',
				'    Allow from all',
				'  </Directory>',
				'</VirtualHost>'].join('\n');

		if (fs.existsSync(folder)) {
			this.writeVirtualHost(path, content);
		} else {
			fs.mkdir(folder);
			this.writeVirtualHost(path, content);
		}

	},

	writeVirtualHost: function(path, content) {
		fs.writeFile(path, content, function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log('Virtual host set successfully!')
			}
		});
	},

	testHttpd: function() {
		var self = this;

		fs.readFile(httpd, 'utf-8', function (err,data) {
			if (err) {
				return console.log(err);
			}

			if (data.indexOf('Include ' + folder) === -1) {
				self.appendHttpd();
			}
		});
	},

	appendHttpd:function() {
		console.log('Tooling ' + httpd + ' for use with our virtualhost.');

		fs.appendFile(httpd, 'Include ' + folder, function() {
			if (err) {
				return console.log(err);
			}
		})
	}
};

VirtualHost.init();