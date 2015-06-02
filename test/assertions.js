var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var should = require('should');
var cheerio = require('cheerio');

should.Assertion.add('file', function(file, description) {
    this.params = { actual: this.obj.toString(), operator: 'have file ' + file, message: description };

    this.obj.should.have.property('options').which.is.an.Object;
    this.obj.options.should.have.property('output').which.is.a.String;
    this.assert(fs.existsSync(path.resolve(this.obj.options.output, file)));
});

should.Assertion.add('jsonfile', function(file, description) {
    this.params = { actual: this.obj.toString(), operator: 'have valid jsonfile ' + file, message: description };

    this.obj.should.have.property('options').which.is.an.Object;
    this.obj.options.should.have.property('output').which.is.a.String;
    this.assert(JSON.parse(fs.readFileSync(path.resolve(this.obj.options.output, file), { encoding: "utf-8" })));
});

should.Assertion.add('html', function(rules, description) {
    this.params = { actual: "HTML string", operator: 'valid html', message: description };
    var $ = cheerio.load(this.obj);

    _.each(rules, function(validations, query) {
        validations = _.defaults(validations || {}, {
            count: 1,
            attributes: {},
            trim: false,
            text: undefined
        });

        var $el = $(query);

        // Test number of elements
        $el.length.should.be.equal(validations.count);

        // Test text
        if (validations.text !== undefined) {
            var text = $el.text();
            if (validations.trim) text = text.trim();
            text.should.be.equal(validations.text);
        }

        // Test attributes
        _.each(validations.attributes, function(value, name) {
            var attr = $el.attr(name);
            should(attr).be.ok;
            attr.should.be.equal(value);
        });
    });
});
