var Immutable = require('immutable');
var is = require('is');

/*
    A TemplateShortcut is defined in plugin's template blocks
    to replace content with a templating block using delimiters.
*/
var TemplateShortcut = Immutable.Record({
    // List of parser names accepting this shortcut
    parsers:     Immutable.Map(),

    start:       String(),
    end:         String(),

    startTag:    String(),
    endTag:      String()
}, 'TemplateShortcut');

TemplateShortcut.prototype.getStart = function() {
    return this.get('start');
};

TemplateShortcut.prototype.getEnd = function() {
    return this.get('end');
};

TemplateShortcut.prototype.getStartTag = function() {
    return this.get('startTag');
};

TemplateShortcut.prototype.getEndTag = function() {
    return this.get('endTag');
};

TemplateShortcut.prototype.getParsers = function() {
    return this.get('parsers');
};

/**
    Test if this shortcut accept a parser

    @param {Parser|String} parser
    @return {Boolean}
*/
TemplateShortcut.prototype.acceptParser = function(parser) {
    if (!is.string(parser)) {
        parser = parser.getName();
    }

    var parserNames = this.get('parsers');
    return parserNames.includes(parser);
};

/**
    Create a shortcut for a block

    @param {TemplateBlock} block
    @param {Map} details
    @return {TemplateShortcut}
*/
TemplateShortcut.createForBlock = function(block, details) {
    details = Immutable.fromJS(details);

    return new TemplateShortcut({
        parsers:        details.get('parsers'),
        start:          details.get('start'),
        end:            details.get('end'),
        startTag:       block.getName(),
        endTag:         block.getEndTag()
    });
};

module.exports = TemplateShortcut;
