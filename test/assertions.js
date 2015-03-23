var fs = require('fs');
var path = require('path');
var should = require('should');

should.Assertion.add('file', function(file, description) {
    this.params = { operator: 'have file ' + file, message: description };

    this.obj.should.have.property('options').which.is.an.Object;
    this.obj.options.should.have.property('output').which.is.a.String;
    this.assert(fs.existsSync(path.resolve(this.obj.options.output, file)));
});

should.Assertion.add('jsonfile', function(file, description) {
    this.params = { operator: 'have valid jsonfile ' + file, message: description };

    this.obj.should.have.property('options').which.is.an.Object;
    this.obj.options.should.have.property('output').which.is.a.String;
    this.assert(JSON.parse(fs.readFileSync(path.resolve(this.obj.options.output, file), { encoding: "utf-8" })));
});
