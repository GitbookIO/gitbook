
function Generator(output, type) {
    this.output = output;
    this.book = output.book;
    this.type = type;
}

// Prepare the generation
Generator.prototype.prepare = function() {

};

// Copy an asset file (non-parsable), ex: images, etc
Generator.prototype.writeAsset = function(filename) {

};

// Write a page (parsable file), ex: markdown, etc
Generator.prototype.writePage = function(page) {

};

// Finish the generation
Generator.prototype.finish = function() {

};


module.exports = Generator;
