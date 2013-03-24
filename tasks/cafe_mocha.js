/*
 * grunt-cafe-mocha
 * https://github.com/jdavis/grunt-cafe-mocha
 *
 * Copyright (c) 2013 Josh Davis
 * Licensed under the MIT license.
 */

'use strict';

var Mocha = require('Mocha'),
    path = require('path'),
    fs = require('fs'),

    resolve = path.resolve,
    exists = fs.existsSync || path.existsSync,
    utils = Mocha.utils,
    reporters = Mocha.reporters,
    interfaces = Mocha.interfaces,
    mocha = new Mocha,
    handler = {};

module.exports = function(grunt) {

    grunt.registerMultiTask('cafemocha', 'Run server-side Mocha tests', function() {
        var options = this.options({
            require: [],
            reporter: [],
            grep: '',
            invert: '',
            timeout: 2000,
            slow: 75,
            colors: false,
            growl: false,
            debug: false,
            bail: false,
            asyncOnly: false,
            recursive: false,
            global: [],
            ignoreLeaks: false,
            interfaces: 'tdd',
            reporters: [],
        });

        this.files.forEach(function(f) {});

        for(var option in options) {
            if (options.hasOwnProperty(option)) {
                if (option in handler) {
                    handler[option].call(this, options[option]);
                }
            }
        }
    });
};

handler.require = function (f) {
    console.log('Requiring!');
    // Add local node_modules to path
    module.paths.push(process.cwd, path.join(process.cwd, 'node_modules'));

    var files = [].concat(f);
    files.forEach(function (file) {
        // Check for relative/absolute path

        if (exists(file) || exists(file + '.js')) {
            // Append our cwd to it if it exists
            require(path.join(process.cwd, file));
        } else {
            // Might just be a node_module
            require(file);
        }
    });
};
