import type { ThemeRegistration } from 'shiki/core';

export const customThemes: Record<string, ThemeRegistration> = {
    'default-light': createTheme({
        name: 'default-light',
        type: 'light',
        bg: 'rgb(var(--tint-2))',
        fg: 'rgb(var(--tint-12))',
        colors: {
            comment: 'rgb(var(--neutral-9))',
            constant: 'rgb(var(--warning-10))',
            constantEscape: 'rgb(var(--success-10))',
            string: 'rgb(var(--success-10))',
            keyword: 'rgb(var(--danger-10))',
            keywordOperator: 'rgb(var(--tint-11))',
            keywordRegexpOperator: 'rgb(var(--primary-10))',
            keywordRegexpQuantifier: 'rgb(var(--warning-10))',
            variableLanguage: 'rgb(var(--danger-10))',
            parameter: 'rgb(var(--warning-10))',
            variable: 'rgb(var(--tint-12))',
            function: 'rgb(var(--primary-10))',
            typeCustom: 'rgb(var(--primary-10))',
            typePrimitive: 'rgb(var(--warning-10))',
            typeOther: 'rgb(var(--tint-12))',
            entityTag: 'rgb(var(--primary-10))',
            punctuation: 'rgb(var(--tint-11))',
            link: 'rgb(var(--primary-10))',
            preprocessor: 'rgb(var(--danger-10))',
            diffInserted: 'rgb(var(--success-10))',
            diffDeleted: 'rgb(var(--danger-10))',
            diffChanged: 'rgb(var(--tint-12))',
            markup: 'rgb(var(--primary-10))',
            other: 'rgb(var(--tint-11))',
            invalid: 'rgb(var(--danger-10))',
        },
    }),
    'default-dark': createTheme({
        name: 'default-dark',
        type: 'dark',
        bg: 'rgb(var(--tint-2))',
        fg: 'rgb(var(--tint-12))',
        colors: {
            //         --shiki-token-comment: rgb(var(--neutral-9));

            // --shiki-token-constant: rgb(var(--warning-11));
            // --shiki-token-string: rgb(var(--warning-11));
            // --shiki-token-string-expression: rgb(var(--success-11));
            // --shiki-token-keyword: rgb(var(--danger-11));
            // --shiki-token-parameter: rgb(var(--warning-11));
            // --shiki-token-function: rgb(var(--primary-11));
            comment: 'rgb(var(--neutral-11))',
            constant: 'rgb(var(--warning-11))',
            constantEscape: 'rgb(var(--success-10))',
            string: 'rgb(var(--warning-11))',
            keyword: 'rgb(var(--danger-11))',
            keywordOperator: 'rgb(var(--tint-11))',
            keywordRegexpOperator: 'rgb(var(--primary-10))',
            keywordRegexpQuantifier: 'rgb(var(--warning-10))',
            variableLanguage: 'rgb(var(--danger-10))',
            parameter: 'rgb(var(--warning-11))',
            variable: 'rgb(var(--tint-12))',
            function: 'rgb(var(--primary-11))',
            typeCustom: 'rgb(var(--primary-11))',
            typePrimitive: 'rgb(var(--warning-11))',
            typeOther: 'rgb(var(--tint-12))',
            entityTag: 'rgb(var(--primary-11))',
            punctuation: 'rgb(var(--tint-11))',
            link: 'rgb(var(--primary-11))',
            preprocessor: 'rgb(var(--danger-11))',
            diffInserted: 'rgb(var(--success-11))',
            diffDeleted: 'rgb(var(--danger-11))',
            diffChanged: 'rgb(var(--tint-12))',
            markup: 'rgb(var(--primary-11))',
            other: 'rgb(var(--tint-11))',
            invalid: 'rgb(var(--danger-11))',
        },
    }),
    // 'default-dark': {
    //     name: 'default-dark',
    //     type: 'dark',
    //     settings: [],
    //     bg: 'rgb(var(--tint-2))',
    //     fg: 'rgb(var(--tint-12))',
    // },
    // 'monochrome-light': {
    //     name: 'monochrome-light',
    //     type: 'light',
    // },
    // 'monochrome-dark': {
    //     name: 'monochrome-dark',
    //     type: 'dark',
    // },
};

/**
 * Color category mappings for syntax highlighting.
 * Maps semantic categories to full color values (can be CSS vars, hex, etc.).
 */
export type ColorCategories = {
    /** Comments (//, /*, #, etc.) */
    comment: string;
    /** Constants: numeric, language constants (true, false, null), character constants */
    constant: string;
    /** Escape sequences in strings (\n, \t, etc.) - should match string color */
    constantEscape: string;
    /** String literals ("...", '...', `...`) */
    string: string;
    /** Keywords: control flow (if, else, for, while, return), storage (const, let, var, function, class) */
    keyword: string;
    /** Operators (+, -, *, /, =, ==, etc.) */
    keywordOperator: string;
    /** Regexp operators (|, ^, $) */
    keywordRegexpOperator: string;
    /** Regexp quantifiers (*, +, ?, {n}) */
    keywordRegexpQuantifier: string;
    /** Language variables (this, self, super) */
    variableLanguage: string;
    /** Function/method parameters */
    parameter: string;
    /** Regular variables */
    variable: string;
    /** Function/method invocations (calls) */
    function: string;
    /** Custom type names (DocumentBlockCode, HighlightLine, etc.) */
    typeCustom: string;
    /** Primitive types (number, boolean, string, etc.) */
    typePrimitive: string;
    /** Other types (support.type, support.class, namespaces) */
    typeOther: string;
    /** HTML/XML tags and attributes */
    entityTag: string;
    /** Punctuation (., ,, ;, :, {}, [], (), etc.) */
    punctuation: string;
    /** Links in markup */
    link: string;
    /** Preprocessor directives (#include, #define, etc.) */
    preprocessor: string;
    /** Diff: inserted lines */
    diffInserted: string;
    /** Diff: deleted lines */
    diffDeleted: string;
    /** Diff: changed lines */
    diffChanged: string;
    /** Markup elements (bold, italic, headings, etc.) */
    markup: string;
    /** Other/miscellaneous elements */
    other: string;
    /** Invalid syntax/errors */
    invalid: string;
};

/**
 * Creates a Shiki theme registration from semantic color categories.
 *
 * Maps our semantic color categories (comment, keyword, function, etc.) to Shiki's TextMate scopes.
 * TextMate scopes are hierarchical selectors (e.g., "keyword.control", "variable.parameter") that
 * Shiki uses to identify different syntax elements. This abstraction allows us to define themes
 * using semantic categories rather than low-level scope patterns.
 */
function createTheme(options: {
    name: string;
    type: 'light' | 'dark';
    bg: string;
    fg: string;
    colors: ColorCategories;
}): ThemeRegistration {
    const { name, type, bg, fg, colors } = options;
    return {
        name,
        type,
        bg,
        fg,
        settings: [
            // Comments
            {
                scope: ['comment'],
                settings: {
                    foreground: colors.comment,
                },
            },
            // Constants: language constants (true, false, null, etc.)
            {
                scope: ['constant.language'],
                settings: {
                    foreground: colors.constant,
                },
            },
            // Constants: numeric
            {
                scope: [
                    'constant.numeric',
                    'variable.other.enummember',
                    'keyword.operator.plus.exponent',
                    'keyword.operator.minus.exponent',
                    'keyword.other.unit',
                    'constant.sha.git-rebase',
                ],
                settings: {
                    foreground: colors.constant,
                },
            },
            // Constants: regexp
            {
                scope: ['constant.regexp'],
                settings: {
                    foreground: colors.constant,
                },
            },
            // Constants: character
            {
                scope: ['constant.character', 'constant.other.option'],
                settings: {
                    foreground: colors.constant,
                },
            },
            // Constants: escape sequences (should match string color)
            {
                scope: ['constant.character.escape'],
                settings: {
                    foreground: colors.constantEscape,
                },
            },
            // Constants: other
            {
                scope: [
                    'constant.other',
                    'constant.other.color',
                    'constant.other.symbol',
                    'constant.other.placeholder',
                    'constant.other.character-class.regexp',
                    'constant.character.set.regexp',
                    'constant.character.character-class.regexp',
                    'constant.other.character-class.set.regexp',
                ],
                settings: {
                    foreground: colors.constant,
                },
            },
            // Constants: variable constants
            {
                scope: ['variable.other.constant'],
                settings: {
                    foreground: colors.constant,
                },
            },
            // Strings
            {
                scope: [
                    'string',
                    'meta.embedded.assembly',
                    'string.tag',
                    'string.value',
                    'string.regexp',
                    'meta.preprocessor.string',
                    'support.constant.property-value',
                    'support.constant.font-name',
                    'support.constant.media-type',
                    'support.constant.media',
                    'constant.other.color.rgb-value',
                    'constant.other.rgb-value',
                    'support.constant.color',
                    'punctuation.definition.group.regexp',
                    'punctuation.definition.group.assertion.regexp',
                    'punctuation.definition.character-class.regexp',
                    'punctuation.character.set.begin.regexp',
                    'punctuation.character.set.end.regexp',
                    'keyword.operator.negation.regexp',
                    'support.other.parenthesis.regexp',
                ],
                settings: {
                    foreground: colors.string,
                },
            },
            // String expressions (template literals, interpolated)
            {
                scope: [
                    'punctuation.definition.template-expression.begin',
                    'punctuation.definition.template-expression.end',
                    'punctuation.section.embedded',
                    'meta.template.expression',
                ],
                settings: {
                    foreground: colors.string,
                },
            },
            // Keywords: control flow
            {
                scope: [
                    'keyword.control',
                    'source.cpp keyword.operator.new',
                    'keyword.operator.delete',
                    'keyword.other.using',
                    'keyword.other.directive.using',
                    'keyword.other.operator',
                    'entity.name.operator',
                    'keyword.operator.new',
                    'keyword.operator.expression',
                    'keyword.operator.cast',
                    'keyword.operator.sizeof',
                    'keyword.operator.alignof',
                    'keyword.operator.typeid',
                    'keyword.operator.alignas',
                    'keyword.operator.instanceof',
                    'keyword.operator.logical.python',
                    'keyword.operator.wordlike',
                ],
                settings: {
                    foreground: colors.keyword,
                },
            },
            // Keywords: storage (const, let, var, function, class, etc.)
            {
                scope: [
                    'storage',
                    'storage.type',
                    'storage.modifier',
                    'keyword.operator.noexcept',
                    'storage.type.numeric.go',
                    'storage.type.byte.go',
                    'storage.type.boolean.go',
                    'storage.type.string.go',
                    'storage.type.uintptr.go',
                    'storage.type.error.go',
                    'storage.type.rune.go',
                    'storage.type.cs',
                    'storage.type.generic.cs',
                    'storage.type.modifier.cs',
                    'storage.type.variable.cs',
                    'storage.type.annotation.java',
                    'storage.type.generic.java',
                    'storage.type.java',
                    'storage.type.object.array.java',
                    'storage.type.primitive.array.java',
                    'storage.type.primitive.java',
                    'storage.type.token.java',
                    'storage.type.groovy',
                    'storage.type.annotation.groovy',
                    'storage.type.parameters.groovy',
                    'storage.type.generic.groovy',
                    'storage.type.object.array.groovy',
                    'storage.type.primitive.array.groovy',
                    'storage.type.primitive.groovy',
                ],
                settings: {
                    foreground: colors.keyword,
                },
            },
            // Keywords: general
            {
                scope: ['keyword'],
                settings: {
                    foreground: colors.keyword,
                },
            },
            // Keywords: operators (default)
            {
                scope: ['keyword.operator'],
                settings: {
                    foreground: colors.keywordOperator,
                },
            },
            // Keywords: regexp operators
            {
                scope: ['keyword.operator.or.regexp', 'keyword.control.anchor.regexp'],
                settings: {
                    foreground: colors.keywordRegexpOperator,
                },
            },
            // Keywords: regexp quantifiers
            {
                scope: ['keyword.operator.quantifier.regexp'],
                settings: {
                    foreground: colors.keywordRegexpQuantifier,
                },
            },
            // Variable language (this, self, super, etc.)
            {
                scope: ['variable.language'],
                settings: {
                    foreground: colors.variableLanguage,
                },
            },
            // Parameters
            {
                scope: ['variable.parameter'],
                settings: {
                    foreground: colors.parameter,
                },
            },
            // Variables (regular variables, not parameters)
            {
                scope: [
                    'variable',
                    'meta.definition.variable.name',
                    'support.variable',
                    'entity.name.variable',
                    'meta.object-literal.key',
                ],
                settings: {
                    foreground: colors.variable,
                },
            },
            // Functions: invocations (calls)
            {
                scope: [
                    'meta.function-call',
                    'meta.method-call',
                    'entity.name.function',
                    'entity.name.method',
                    'support.function',
                    'support.constant.handlebars',
                    'source.powershell variable.other.member',
                    'entity.name.operator.custom-literal',
                    'support.function.git-rebase',
                ],
                settings: {
                    foreground: colors.function,
                },
            },
            // Types: custom type names (DocumentBlockCode, HighlightLine, etc.) - must come first
            {
                scope: ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class'],
                settings: {
                    foreground: colors.typeCustom,
                },
            },
            // Types: primitive (number, boolean, string, etc.) - must come before support.type
            {
                scope: [
                    'support.type.primitive',
                    'storage.type.primitive',
                    'support.type.builtin',
                    'entity.name.type.primitive',
                    'support.type',
                ],
                settings: {
                    foreground: colors.typePrimitive,
                },
            },
            // Types: other (support.class, etc.)
            {
                scope: [
                    'support.class',
                    'entity.name.namespace',
                    'entity.other.attribute',
                    'entity.name.scope-resolution',
                    'meta.type.cast.expr',
                    'meta.type.new.expr',
                    'support.constant.math',
                    'support.constant.dom',
                    'support.constant.json',
                    'punctuation.separator.namespace.ruby',
                ],
                settings: {
                    foreground: colors.typeOther,
                },
            },
            // Entity names: tags, attributes
            {
                scope: [
                    'entity.name.tag',
                    'entity.other.attribute-name',
                    'support.type.vendored.property-name',
                    'support.type.property-name',
                    'source.css variable',
                    'source.coffee.embedded',
                    'meta.structure.dictionary.key.python',
                ],
                settings: {
                    foreground: colors.entityTag,
                },
            },
            // Punctuation
            {
                scope: [
                    'punctuation',
                    'punctuation.definition.tag',
                    'punctuation.definition.quote.begin.markdown',
                    'punctuation.definition.list.begin.markdown',
                    'punctuation.section.embedded.begin.php',
                    'punctuation.section.embedded.end.php',
                ],
                settings: {
                    foreground: colors.punctuation,
                },
            },
            // Links
            {
                scope: ['markup.underline.link', 'string.other.link'],
                settings: {
                    foreground: colors.link,
                },
            },
            // Preprocessor
            {
                scope: [
                    'meta.preprocessor',
                    'entity.name.function.preprocessor',
                    'meta.preprocessor.numeric',
                ],
                settings: {
                    foreground: colors.preprocessor,
                },
            },
            // Diff: inserted
            {
                scope: ['markup.inserted', 'markup.inserted.diff'],
                settings: {
                    foreground: colors.diffInserted,
                },
            },
            // Diff: deleted
            {
                scope: ['markup.deleted', 'markup.deleted.diff'],
                settings: {
                    foreground: colors.diffDeleted,
                },
            },
            // Diff: changed
            {
                scope: ['markup.changed', 'markup.changed.diff', 'meta.diff.header'],
                settings: {
                    foreground: colors.diffChanged,
                },
            },
            // Other markup
            {
                scope: [
                    'markup.underline',
                    'markup.bold',
                    'markup.heading',
                    'markup.italic',
                    'markup.strikethrough',
                    'markup.inline.raw',
                    'header',
                ],
                settings: {
                    foreground: colors.markup,
                },
            },
            // Other
            {
                scope: [
                    'meta.embedded',
                    'source.groovy.embedded',
                    'string meta.image.inline.markdown',
                    'variable.legacy.builtin.python',
                    'storage.modifier.import.java',
                    'variable.language.wildcard.java',
                    'storage.modifier.package.java',
                    'entity.name.label',
                ],
                settings: {
                    foreground: colors.other,
                },
            },
            // Invalid
            {
                scope: ['invalid'],
                settings: {
                    foreground: colors.invalid,
                },
            },
        ],
    };
}
