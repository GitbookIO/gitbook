import type { ThemeRegistration } from 'shiki/core';

export const customThemes: Record<string, ThemeRegistration> = {
    'default-light': createTheme({
        name: 'default-light',
        type: 'light',
        bg: 'inherit',
        fg: 'inherit',
        colors: {
            basic: {
                comment: 'rgb(var(--neutral-9))',
                string: 'rgb(var(--success-10))',
                constant: 'rgb(var(--warning-10))',
                escape: 'rgb(var(--success-10))',
            },
            keyword: {
                default: 'rgb(var(--danger-10))',
                operator: 'rgb(var(--tint-11))',
                regexpOperator: 'rgb(var(--primary-10))',
                regexpQuantifier: 'rgb(var(--warning-10))',
            },
            variable: {
                default: 'rgb(var(--tint-12))',
                language: 'rgb(var(--danger-10))',
                parameter: 'rgb(var(--warning-10))',
            },
            function: {
                default: 'rgb(var(--primary-10))',
                support: 'rgb(var(--primary-10))',
            },
            type: {
                custom: 'rgb(var(--primary-10))',
                primitive: 'rgb(var(--warning-10))',
                other: 'rgb(var(--tint-12))',
                classMeta: 'rgb(var(--tint-12))',
            },
            entity: {
                tag: 'rgb(var(--warning-10))',
                attributeId: 'rgb(var(--primary-10))',
                label: 'rgb(var(--danger-10))',
            },
            markup: {
                default: 'rgb(var(--primary-10))',
                code: 'rgb(var(--success-10))',
                link: 'rgb(var(--primary-10))',
                linkUrl: 'rgb(var(--warning-10))',
                separator: 'rgb(var(--tint-7))',
            },
            diff: {
                inserted: 'rgb(var(--success-10))',
                deleted: 'rgb(var(--danger-10))',
                changed: 'rgb(var(--tint-12))',
            },
            other: {
                punctuation: 'rgb(var(--tint-11))',
                preprocessor: 'rgb(var(--danger-10))',
                default: 'rgb(var(--tint-11))',
                invalid: 'rgb(var(--danger-10))',
            },
        },
    }),
    'default-dark': createTheme({
        name: 'default-dark',
        type: 'dark',
        bg: 'inherit',
        fg: 'inherit',
        colors: {
            basic: {
                comment: 'rgb(var(--neutral-9))',
                string: 'rgb(var(--success-11))',
                constant: 'rgb(var(--warning-11))',
                escape: 'rgb(var(--success-11))',
            },
            keyword: {
                default: 'rgb(var(--danger-11))',
                operator: 'rgb(var(--tint-11))',
                regexpOperator: 'rgb(var(--primary-11))',
                regexpQuantifier: 'rgb(var(--warning-11))',
            },
            variable: {
                default: 'rgb(var(--tint-12))',
                language: 'rgb(var(--danger-11))',
                parameter: 'rgb(var(--warning-11))',
            },
            function: {
                default: 'rgb(var(--primary-11))',
                support: 'rgb(var(--primary-11))',
            },
            type: {
                custom: 'rgb(var(--primary-11))',
                primitive: 'rgb(var(--warning-11))',
                other: 'rgb(var(--tint-12))',
                classMeta: 'rgb(var(--tint-12))',
            },
            entity: {
                tag: 'rgb(var(--warning-11))',
                attributeId: 'rgb(var(--primary-11))',
                label: 'rgb(var(--danger-11))',
            },
            markup: {
                default: 'rgb(var(--primary-11))',
                code: 'rgb(var(--success-11))',
                link: 'rgb(var(--primary-11))',
                linkUrl: 'rgb(var(--warning-11))',
                separator: 'rgb(var(--tint-7))',
            },
            diff: {
                inserted: 'rgb(var(--success-11))',
                deleted: 'rgb(var(--danger-11))',
                changed: 'rgb(var(--tint-12))',
            },
            other: {
                punctuation: 'rgb(var(--tint-12))',
                preprocessor: 'rgb(var(--danger-11))',
                default: 'rgb(var(--tint-12))',
                invalid: 'rgb(var(--danger-11))',
            },
        },
    }),
    'monochrome-light': createTheme({
        name: 'monochrome-light',
        type: 'light',
        bg: 'inherit',
        fg: 'inherit',
        colors: {
            basic: {
                comment: 'rgb(var(--tint-9))',
                string: 'rgb(var(--primary-12))',
                constant: 'rgb(var(--primary-11))',
                escape: 'rgb(var(--tint-12))',
            },
            keyword: {
                default: 'rgb(var(--primary-10))',
                operator: 'rgb(var(--primary-11))',
                regexpOperator: 'rgb(var(--primary-10))',
                regexpQuantifier: 'rgb(var(--primary-11))',
            },
            variable: {
                default: 'rgb(var(--tint-12))',
                language: 'rgb(var(--primary-10))',
                parameter: 'rgb(var(--tint-11))',
            },
            function: {
                default: 'rgb(var(--primary-9))',
                support: 'rgb(var(--primary-9))',
            },
            type: {
                custom: 'rgb(var(--primary-10))',
                primitive: 'rgb(var(--primary-11))',
                other: 'rgb(var(--primary-10))',
                classMeta: 'rgb(var(--tint-12))',
            },
            entity: {
                tag: 'rgb(var(--primary-11))',
                attributeId: 'rgb(var(--primary-9))',
                label: 'rgb(var(--primary-10))',
            },
            markup: {
                default: 'rgb(var(--primary-10))',
                code: 'rgb(var(--tint-12))',
                link: 'rgb(var(--primary-10))',
                linkUrl: 'rgb(var(--primary-11))',
                separator: 'rgb(var(--tint-7))',
            },
            diff: {
                inserted: 'rgb(var(--success-11))',
                deleted: 'rgb(var(--danger-11))',
                changed: 'rgb(var(--tint-12))',
            },
            other: {
                punctuation: 'rgb(var(--tint-10))',
                preprocessor: 'rgb(var(--primary-10))',
                default: 'rgb(var(--primary-11))',
                invalid: 'rgb(var(--danger-11))',
            },
        },
    }),
    'monochrome-dark': createTheme({
        name: 'monochrome-dark',
        type: 'dark',
        bg: 'inherit',
        fg: 'inherit',
        colors: {
            basic: {
                comment: 'rgb(var(--tint-9))',
                string: 'rgb(var(--primary-12))',
                constant: 'rgb(var(--primary-11))',
                escape: 'rgb(var(--tint-12))',
            },
            keyword: {
                default: 'rgb(var(--primary-11))',
                operator: 'rgb(var(--primary-11))',
                regexpOperator: 'rgb(var(--primary-10))',
                regexpQuantifier: 'rgb(var(--primary-11))',
            },
            variable: {
                default: 'rgb(var(--tint-12))',
                language: 'rgb(var(--primary-10))',
                parameter: 'rgb(var(--tint-9))',
            },
            function: {
                default: 'rgb(var(--primary-9))',
                support: 'rgb(var(--primary-9))',
            },
            type: {
                custom: 'rgb(var(--primary-10))',
                primitive: 'rgb(var(--primary-11))',
                other: 'rgb(var(--primary-10))',
                classMeta: 'rgb(var(--tint-12))',
            },
            entity: {
                tag: 'rgb(var(--primary-11))',
                attributeId: 'rgb(var(--primary-9))',
                label: 'rgb(var(--primary-10))',
            },
            markup: {
                default: 'rgb(var(--primary-10))',
                code: 'rgb(var(--tint-12))',
                link: 'rgb(var(--primary-10))',
                linkUrl: 'rgb(var(--primary-11))',
                separator: 'rgb(var(--tint-7))',
            },
            diff: {
                inserted: 'rgb(var(--success-11))',
                deleted: 'rgb(var(--danger-11))',
                changed: 'rgb(var(--tint-12))',
            },
            other: {
                punctuation: 'rgb(var(--tint-10))',
                preprocessor: 'rgb(var(--primary-10))',
                default: 'rgb(var(--primary-11))',
                invalid: 'rgb(var(--danger-11))',
            },
        },
    }),
};

/**
 * Color category mappings for syntax highlighting.
 * Organized into logical groups for better readability.
 */
export type ColorCategories = {
    /** Basic syntax elements */
    basic: {
        /** Comments (//, /*, #, etc.) */
        comment: string;
        /** String literals ("...", '...', `...`) */
        string: string;
        /** Constants: numeric, language constants (true, false, null), character constants */
        constant: string;
        /** Escape sequences in strings (\n, \t, etc.) */
        escape: string;
    };
    /** Keywords and operators */
    keyword: {
        /** Control flow (if, else, for, while, return), storage (const, let, var, function, class) */
        default: string;
        /** Operators (+, -, *, /, =, ==, etc.) */
        operator: string;
        /** Regexp operators (|, ^, $) */
        regexpOperator: string;
        /** Regexp quantifiers (*, +, ?, {n}) */
        regexpQuantifier: string;
    };
    /** Variables and parameters */
    variable: {
        /** Regular variables */
        default: string;
        /** Language variables (this, self, super) */
        language: string;
        /** Function/method parameters */
        parameter: string;
    };
    /** Functions */
    function: {
        /** User-defined function/method invocations */
        default: string;
        /** Built-in/library support functions */
        support: string;
    };
    /** Types and classes */
    type: {
        /** Custom type names (DocumentBlockCode, HighlightLine, etc.) */
        custom: string;
        /** Primitive types (number, boolean, string, etc.) */
        primitive: string;
        /** Other types (support.type, support.class, namespaces) */
        other: string;
        /** Class meta contexts (meta.class) */
        classMeta: string;
    };
    /** Entities (tags, attributes, labels) */
    entity: {
        /** HTML/XML tags and attributes */
        tag: string;
        /** Attribute IDs (entity.other.attribute-name.id) */
        attributeId: string;
        /** Labels (entity.name.label) */
        label: string;
    };
    /** Markup elements */
    markup: {
        /** Markup elements (bold, italic, headings, lists, quotes, etc.) */
        default: string;
        /** Inline code in markup */
        code: string;
        /** Links in markup */
        link: string;
        /** Link URLs in markup */
        linkUrl: string;
        /** Separators (meta.separator) */
        separator: string;
    };
    /** Diff highlighting */
    diff: {
        /** Inserted lines */
        inserted: string;
        /** Deleted lines */
        deleted: string;
        /** Changed lines */
        changed: string;
    };
    /** Other syntax elements */
    other: {
        /** Punctuation (., ,, ;, :, {}, [], (), etc.) */
        punctuation: string;
        /** Preprocessor directives (#include, #define, etc.) */
        preprocessor: string;
        /** Other/miscellaneous elements */
        default: string;
        /** Invalid syntax/errors */
        invalid: string;
    };
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
                    foreground: colors.basic.comment,
                },
            },
            // Constants: language constants (true, false, null, etc.)
            {
                scope: ['constant.language'],
                settings: {
                    foreground: colors.basic.constant,
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
                    foreground: colors.basic.constant,
                },
            },
            // Constants: regexp
            {
                scope: ['constant.regexp'],
                settings: {
                    foreground: colors.basic.constant,
                },
            },
            // Constants: character
            {
                scope: ['constant.character', 'constant.other.option'],
                settings: {
                    foreground: colors.basic.constant,
                },
            },
            // Constants: escape sequences
            {
                scope: ['constant.character.escape'],
                settings: {
                    foreground: colors.basic.escape,
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
                    foreground: colors.basic.constant,
                },
            },
            // Constants: variable constants
            {
                scope: ['variable.other.constant'],
                settings: {
                    foreground: colors.basic.constant,
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
                    foreground: colors.basic.string,
                },
            },
            // String expressions (template literals, interpolated)
            // Only color the punctuation, not the expression content
            {
                scope: [
                    'punctuation.definition.template-expression.begin',
                    'punctuation.definition.template-expression.end',
                    'punctuation.section.embedded',
                ],
                settings: {
                    foreground: colors.variable.parameter,
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
                    foreground: colors.keyword.default,
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
                    foreground: colors.keyword.default,
                },
            },
            // Keywords: general
            {
                scope: ['keyword'],
                settings: {
                    foreground: colors.keyword.default,
                },
            },
            // Keywords: operators (default)
            {
                scope: ['keyword.operator'],
                settings: {
                    foreground: colors.keyword.operator,
                },
            },
            // Keywords: regexp operators
            {
                scope: ['keyword.operator.or.regexp', 'keyword.control.anchor.regexp'],
                settings: {
                    foreground: colors.keyword.regexpOperator,
                },
            },
            // Keywords: regexp quantifiers
            {
                scope: ['keyword.operator.quantifier.regexp'],
                settings: {
                    foreground: colors.keyword.regexpQuantifier,
                },
            },
            // Variable language (this, self, super, etc.)
            {
                scope: ['variable.language'],
                settings: {
                    foreground: colors.variable.language,
                },
            },
            // Parameters
            {
                scope: ['variable.parameter'],
                settings: {
                    foreground: colors.variable.parameter,
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
                    foreground: colors.variable.default,
                },
            },
            // Functions: invocations (calls) - user-defined functions
            {
                scope: [
                    'meta.function-call',
                    'meta.method-call',
                    'entity.name.function',
                    'entity.name.method',
                    'support.constant.handlebars',
                    'source.powershell variable.other.member',
                    'entity.name.operator.custom-literal',
                    'keyword.other.special-method',
                ],
                settings: {
                    foreground: colors.function.default,
                },
            },
            // Support functions: built-in/library functions
            {
                scope: ['support.function', 'support.function.git-rebase'],
                settings: {
                    foreground: colors.function.support,
                },
            },
            // Types: custom type names (DocumentBlockCode, HighlightLine, etc.) - must come first
            {
                scope: ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class'],
                settings: {
                    foreground: colors.type.custom,
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
                    foreground: colors.type.primitive,
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
                    'support.constant.json',
                    'punctuation.separator.namespace.ruby',
                ],
                settings: {
                    foreground: colors.type.other,
                },
            },
            // Class meta contexts
            {
                scope: ['meta.class'],
                settings: {
                    foreground: colors.type.classMeta,
                },
            },
            // DOM constants and namespace references (ReactDOM, window.document, etc.)
            {
                scope: [
                    'support.constant.dom',
                    'variable.other.object',
                    'variable.other.object.property',
                    'entity.name.class.jsx',
                    'support.class.builtin',
                ],
                settings: {
                    foreground: colors.variable.parameter,
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
                    foreground: colors.entity.tag,
                },
            },
            // Attribute IDs (typically styled like functions)
            {
                scope: ['entity.other.attribute-name.id', 'punctuation.definition.entity'],
                settings: {
                    foreground: colors.entity.attributeId,
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
                    foreground: colors.other.punctuation,
                },
            },
            // Links: link text
            {
                scope: [
                    'markup.underline.link',
                    'string.other.link',
                    'punctuation.definition.string.end.markdown',
                    'punctuation.definition.string.begin.markdown',
                ],
                settings: {
                    foreground: colors.markup.link,
                },
            },
            // Links: link URLs
            {
                scope: ['meta.link'],
                settings: {
                    foreground: colors.markup.linkUrl,
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
                    foreground: colors.other.preprocessor,
                },
            },
            // Diff: inserted
            {
                scope: ['markup.inserted', 'markup.inserted.diff'],
                settings: {
                    foreground: colors.diff.inserted,
                },
            },
            // Diff: deleted
            {
                scope: ['markup.deleted', 'markup.deleted.diff'],
                settings: {
                    foreground: colors.diff.deleted,
                },
            },
            // Diff: changed
            {
                scope: ['markup.changed', 'markup.changed.diff', 'meta.diff.header'],
                settings: {
                    foreground: colors.diff.changed,
                },
            },
            // Markup: bold (with bold font style)
            {
                scope: ['markup.bold', 'punctuation.definition.bold'],
                settings: {
                    foreground: colors.markup.default,
                    fontStyle: 'bold',
                },
            },
            // Markup: italic (with italic font style)
            {
                scope: ['markup.italic', 'punctuation.definition.italic'],
                settings: {
                    foreground: colors.markup.default,
                    fontStyle: 'italic',
                },
            },
            // Markup: inline code
            {
                scope: ['markup.raw.inline'],
                settings: {
                    foreground: colors.markup.code,
                },
            },
            // Markup: headings, lists, quotes, underline, strikethrough
            {
                scope: [
                    'markup.heading',
                    'markup.heading punctuation.definition.heading',
                    'entity.name.section',
                    'header',
                    'markup.list',
                    'markup.quote',
                    'markup.underline',
                    'markup.strikethrough',
                ],
                settings: {
                    foreground: colors.markup.default,
                },
            },
            // Separator
            {
                scope: ['meta.separator'],
                settings: {
                    background: colors.markup.separator,
                    foreground: fg,
                },
            },
            // Labels
            {
                scope: ['entity.name.label'],
                settings: {
                    foreground: colors.entity.label,
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
                ],
                settings: {
                    foreground: colors.other.default,
                },
            },
            // Invalid
            {
                scope: ['invalid'],
                settings: {
                    foreground: colors.other.invalid,
                },
            },
        ],
    };
}
