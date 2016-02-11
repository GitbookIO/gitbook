var _ = require('lodash');
var TypedError = require('error/typed');
var WrappedError = require('error/wrapped');

// Enforce as an Error object, and cleanup message
function enforce(err) {
    if (_.isString(err)) err = new Error(err);
    err.message = err.message.replace(/^Error: /, '');

    return err;
}

// Random error wrappers during parsing/generation
var ParsingError = WrappedError({
    message: 'Parsing Error: {origMessage}',
    type: 'server.parsing-failed'
});
var GenerationError = WrappedError({
    message: 'Generation Error: {origMessage}',
    type: 'server.parsing-failed'
});

// Error when output generator does not exists
var GeneratorNotFoundError = TypedError({
    type: 'server.404',
    message: 'Generator "{generator}" does not exists',
    generator: null
});

// A file does not exists
var FileNotFoundError = TypedError({
    type: 'server.404',
    message: 'No "{filename}" file (or is ignored)',
    filename: null
});

// A file is outside the scope
var FileOutOfScopeError = TypedError({
    type: 'server.404',
    message: '"{filename}" not in "{root}"',
    filename: null,
    root: null,
    code: 'EACCESS'
});

// Error for nunjucks templates
var TemplateError = WrappedError({
    message: 'Error compiling template "{filename}": {origMessage}',
    type: 'client.template-failed',
    filename: null
});

module.exports = {
    enforce: enforce,

    ParsingError: ParsingError,
    GenerationError: GenerationError,

    FileNotFoundError: FileNotFoundError,
    FileOutOfScopeError: FileOutOfScopeError,

    GeneratorNotFoundError: GeneratorNotFoundError,
    TemplateError: TemplateError
};
