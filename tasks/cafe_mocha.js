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
    Base = Mocha.reporters.Base,

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
            coverage: false,
            globals: [],
            grep: false,
            growl: false,
            ignoreLeaks: false,
            invert: false,
            reporter: 'list',
            require: [],
            slow: 75,
            timeout: 2000,
            ui: 'bdd',
        });

        // Mocha runner
        var mocha = new Mocha();

        // Async function to ensure Grunt finishes
        var async = this.async();

        // Original write function
        var _stdout = process.stdout.write;

        // Coverage output file
        var output;

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
        if (options.slow) mocha.slow();

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

        if (options.reporter === 'json-cov' || options.reporter === 'html-cov') {
            if (!options.coverage) return grunt.fail.warn('Coverage option not set.');

            // Check for coverage output file, else use default
            if (options.coverage.output) {
                output = fs.createWriteStream(options.coverage.output, {flags: 'w'});
            } else {
                output = fs.createWriteStream('coverage.html', {flags: 'w'});
            }

            // Check for coverage env option, else just set true
            if (options.coverage.env) {
                process.env[options.coverage.env] = 1;
            } else {
                process.env['COV'] = 1;
            }

            process.stdout.write = function (chunk, encoding, cb) {
                output.write(chunk, encoding, cb);
            };
        }

        mocha.run(function (failures) {
            // Close output
            if (output) output.end();

            // Restore default process.stdout.write
            process.stdout.write = _stdout;

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
