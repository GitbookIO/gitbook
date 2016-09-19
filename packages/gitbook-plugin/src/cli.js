const program = require('commander');
const pkg = require('../package.json');

program.version(pkg.version)

program
    .command('build [plugin]')
    .description('build a plugin')
    .action(function(plugin, options) {

    });


program
    .command('test [plugin]')
    .description('test specs for a plugin')
    .action(function(plugin, options) {

    });


program.parse(process.argv);
