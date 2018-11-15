const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader');
// https://github.com/rubenspgcavalcante/webpack-chrome-extension-reloader
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// https://github.com/webpack-contrib/extract-text-webpack-plugin
const CopyWebpackPlugin = require("copy-webpack-plugin");
// https://github.com/webpack-contrib/copy-webpack-plugin
const path = require('path');

var config = {
	entry: {
		"content-script":  ['./plugin/js/main.js'],
		"background": ['./plugin/background.js']
	},

	output: {
		publicPath: ".",
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist/'),
		libraryTarget: "umd"
	},

	plugins: [
		process.env.NODE_ENV === "development"? new ChromeExtensionReloader() : null,
		//    new ChromeExtensionReloader({
		//      entries: { 
		//        "content-script": ['content-script'],
		//        background: 'background'
		//      }
		//    })

		// new ExtractTextPlugin({ filename: "css/[name].css" }),

		new CopyWebpackPlugin([
			{ from: "./plugin/manifest.json", flatten: true }, // manifest
			{ from: "./plugin/css", to: 'css', toType: 'dir'}, // css
			{ from: "./plugin/lib", to: 'lib', toType: 'dir'}, // lib
			{ from: "./plugin/html",  to: 'html', toType: 'dir'}, // html
			{ from: "./plugin/icons",  to: 'icons', toType: 'dir'}, // icons
			{ from: "./node_modules/jsonlint/web/jsonlint.js", to: 'lib/'} // jsonlint
		])

	].filter(plugin => !!plugin),

	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			}, 
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: "css-loader",
				})
			}
		]
	}
}

module.exports = config;
