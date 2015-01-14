#!/usr/bin/env node

var fs = require('fs');

var gitbook = require('../../');

if(process.argv < 3) {
    console.error('Please specify a filename');
    process.exit(1);
}

var content = fs.readFileSync(process.argv[2], 'utf8');

var lexed = gitbook.parse.summary(content);

console.log(JSON.stringify(lexed, null, 2));
