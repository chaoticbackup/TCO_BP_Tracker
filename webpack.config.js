const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader');
const path = require('path');

var config = {
	entry: {
	    main: './plugin/js/main.js',
	    background: './plugin/background.js'
	},

	plugins: [
	    new ChromeExtensionReloader({
	      entries: { 
	        contentScript: ['main'],
	        background: 'background'
	      }
	    })
	],

	output: {
	   filename: '[name].js',
	   path: path.join(__dirname, 'dist/')
	}
}

module.exports = config;
