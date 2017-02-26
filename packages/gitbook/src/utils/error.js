const is = require('is');

const TypedError = require('error/typed');
const WrappedError = require('error/wrapped');


// Enforce as an Error object, and cleanup message
function enforce(err) {
    if (is.string(err)) err = new Error(err);
    err.message = err.message.replace(/^Error: /, '');

    return err;
}

// Random error wrappers during parsing/generation
const ParsingError = WrappedError({
    message: 'Parsing Error: {origMessage}',
    type: 'parse'
});
const OutputError = WrappedError({
    message: 'Output Error: {origMessage}',
    type: 'generate'
});

// A file does not exists
const FileNotFoundError = TypedError({
    type: 'file.not-found',
    message: 'No "{filename}" file (or is ignored)',
    filename: null
});

// A file cannot be parsed
const FileNotParsableError = TypedError({
    type: 'file.not-parsable',
    message: '"{filename}" file cannot be parsed',
    filename: null
});

// A file is outside the scope
const FileOutOfScopeError = TypedError({
    type: 'file.out-of-scope',
    message: '"{filename}" not in "{root}"',
    filename: null,
    root: null,
    code: 'EACCESS'
});

// A file is outside the scope
const RequireInstallError = TypedError({
    type: 'install.required',
    message: '"{cmd}" is not installed.\n{install}',
    cmd: null,
    code: 'ENOENT',
    install: ''
});

// Error for nunjucks templates
const PluginError = WrappedError({
    message: 'Error with plugin "{plugin}": {origMessage}',
    type: 'plugin',
    plugin: null
});

// Error with the book's configuration
const ConfigurationError = WrappedError({
    message: 'Error with book\'s configuration: {origMessage}',
    type: 'configuration'
});

// Error during ebook generation
const EbookError = WrappedError({
    message: 'Error during ebook generation: {origMessage}\n{stdout}',
    type: 'ebook',
    stdout: ''
});

module.exports = {
    enforce,

    ParsingError,
    OutputError,
    RequireInstallError,

    FileNotParsableError,
    FileNotFoundError,
    FileOutOfScopeError,

    PluginError,
    ConfigurationError,
    EbookError
};
