/*
 * grunt-cafe-mocha
 * https://github.com/jdavis/grunt-cafe-mocha
 *
 * Copyright (c) 2013 Josh Davis
 * Licensed under the MIT license.
 */

'use strict';

var Mocha = require('mocha'),
    path = require('path'),
    fs = require('fs'),
    hook = require('loghooks-node'),
    Base = Mocha.reporters.base,

    cwd = process.cwd(),
    exists = fs.existsSync || path.existsSync,
    handler = {};

module.exports = function(grunt) {
    // Add local node_modules to path
    module.paths.push(cwd, path.join(cwd, 'node_modules'));

    grunt.registerMultiTask('cafemocha', 'Run server-side Mocha tests', function() {
        var options = this.options({
            asyncOnly: false,
            bail: false,
            /// colors: undefined, shouldn't be defined
            globals: [],
            grep: false,
            growl: false,
            ignoreLeaks: false,
            invert: false,
            require: [],
            ui: 'bdd',
            slow: 75,
            reporter: 'list',
            timeout: 2000,
        });

        var mocha = new Mocha;
        var async = this.async();

        // Setup some settings
        mocha.ui(options.ui);
        mocha.reporter(options.reporter);
        mocha.suite.bail(options.bail);

        // Optional settings
        if (options.timeout) mocha.suite.timeout(options.timeout);
        if (options.grep) mocha.grep(new RegExp(options.grep));
        if (options.growl) mocha.growl();
        if (options.invert) mocha.invert();
        if (options.ignoreLeaks) mocha.ignoreLeaks();
        if (options.asyncOnly) mocha.asyncOnly();

        if (options.colors === true) Base.useColors = true;
        else if (options.colors === false) Base.useColors = false;

        mocha.globals(options.globals);

        for(var option in options) {
            if (options.hasOwnProperty(option)) {
                if (option in handler) {
                    handler[option].call(this, options[option]);
                }
            }
        }

        this.files.forEach(function (f) {
            f.src.filter(function (file) {
                mocha.addFile(file);
            });
        });

        if (options.reporter === 'html-cov' || options.reporter === 'json-cov') {
            hook.stdout(function (data) {
                grunt.file.write(this.files[0].dest, data);
            }.bind(this), false);
        }

        if (options.env) {
            process.env[options.env] = 1;
        }

        mocha.run(function (failures) {

            if (options.reporter === 'html-cov' || options.reporter === 'json-cov') {
                hook.unstdout();
            }

            if (options.env) {
                delete process.env[options.env];
            }

            if (failures) {
                grunt.fail.warn('Mocha tests failed.');
            }

            return async();
        });
    });
};

handler.require = function (f) {
    var files = [].concat(f);
    files.forEach(function (file) {
        // Check for relative/absolute path
        if (exists(file) || exists(file + '.js')) {
            // Append our cwd to import it
            require(path.join(cwd, file));
        } else {
            // Might just be a node_module
            require(file);
        }
    });
};
