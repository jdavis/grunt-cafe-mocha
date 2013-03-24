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

    cwd = process.cwd(),
    resolve = path.resolve,
    exists = fs.existsSync || path.existsSync,
    utils = Mocha.utils,
    reporters = Mocha.reporters,
    interfaces = Mocha.interfaces,
    mocha = new Mocha(),
    handler = {};

module.exports = function(grunt) {

    grunt.registerMultiTask('cafemocha', 'Run server-side Mocha tests', function() {
        var options = this.options({
            require: [],
            output: '',
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

        for(var option in options) {
            if (options.hasOwnProperty(option)) {
                if (option in handler) {
                    handler[option].call(this, options[option]);
                }
            }
        }

        this.files.forEach(function (f) {
            f.src.filter(function (file) {
                mocha.files.push(file);
            })
        });

        console.log('Launching Mocha');
        mocha.run(process.exit);
    });
};

handler.require = function (f) {
    // Add local node_modules to path
    module.paths.push(cwd, path.join(cwd, 'node_modules'));

    var files = [].concat(f);
    files.forEach(function (file) {
        // Check for relative/absolute path
        if (exists(file) || exists(file + '.js')) {
            // Append our cwd to it if it exists
            require(path.join(cwd, file));
        } else {
            // Might just be a node_module
            require(file);
        }
    });
};
