#! /usr/bin/env node

const program = require('commander');
const path = require('path');
const winston = require('winston');

const pkg = require('../package.json');
const compile = require('./compile');

const resolve = (input => path.resolve(process.cwd(), input));

program.version(pkg.version);
winston.cli();

program
    .command('build [input] [output]')
    .description('build a browser plugin')
    .action(function(input, output, options) {
        compile(resolve(input), resolve(output))
        .then(
            () => winston.info('Plugin compiled successfully'),
            (err) => winston.error('Error: ', err)
        );
    });


program
    .command('test [plugin]')
    .description('test specs for a plugin')
    .action(function(plugin, options) {

    });


program.parse(process.argv);
