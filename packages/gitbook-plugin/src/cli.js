#! /usr/bin/env node

const program = require('commander');
const path = require('path');
const winston = require('winston');
const inquirer = require('inquirer');

const pkg = require('../package.json');
const compile = require('./compile');
const create = require('./create');

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
    .command('create [output]')
    .description('create a new plugin')
    .action(function(output, options) {
        inquirer.prompt([
            {
                name: 'title',
                message: 'Title (as displayed on GitBook.com):'
            },
            {
                name: 'name',
                message: 'Name (unique identifier for the plugin):'
            },
            {
                name: 'desc',
                message: 'Description:'
            },
            {
                name: 'github',
                message: 'GitHub repository URL:'
            },
            {
                name: 'categories',
                message: 'Categories (as displayed on GitBook.com):',
                type: 'checkbox',
                choices: [
                    'analytics',
                    'search',
                    'content',
                    'structure',
                    'social',
                    'visual'
                ]
            }
        ])
        .then(answers => {
            output = resolve(output || answers.name);
            return create(output, answers);
        })
        .then(
            () => winston.info(`Plugin created successfully in "${output}"`),
            (err) => winston.error('Error: ', err)
        );
    });

program
    .command('test [plugin]')
    .description('test specs for a plugin')
    .action(function(plugin, options) {

    });


program.parse(process.argv);

// Display help if no arguments
if (!program.args.length) program.help();
