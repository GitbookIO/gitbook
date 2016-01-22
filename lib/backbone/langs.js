
function Langs() {
    if (!(this instanceof Langs)) return new Langs();

    this.languages = [];
}

Langs.prototype.type = 'langs';

// Return the count of languages
Langs.prototype.count = function() {
    return this.languages.length;
};

module.exports = Langs;
