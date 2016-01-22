
function Glossary() {
    if (!(this instanceof Glossary)) return new Glossary();
}

Glossary.prototype.type = 'glossary';

module.exports = Glossary;
