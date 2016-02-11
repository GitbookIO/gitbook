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
    type: 'parse'
});
var GenerationError = WrappedError({
    message: 'Generation Error: {origMessage}',
    type: 'generate'
});

// Error when output generator does not exists
var GeneratorNotFoundError = TypedError({
    type: 'generator.not-found',
    message: 'Generator "{generator}" does not exists',
    generator: null
});

// A file does not exists
var FileNotFoundError = TypedError({
    type: 'file.not-found',
    message: 'No "{filename}" file (or is ignored)',
    filename: null
});

// A file is outside the scope
var FileOutOfScopeError = TypedError({
    type: 'file.out-of-scope',
    message: '"{filename}" not in "{root}"',
    filename: null,
    root: null,
    code: 'EACCESS'
});

// Error for nunjucks templates
var TemplateError = WrappedError({
    message: 'Error compiling template "{filename}": {origMessage}',
    type: 'template',
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
