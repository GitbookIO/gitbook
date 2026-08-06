const syntaxAliases: Record<string, string> = {
    // "Parser" language does not exist in Shiki, but it's used in GitBook.
    parser: 'blade',

    // From GitBook App we receive "objectivec" instead of "objective-c".
    objectivec: 'objective-c',
};

/**
 * Normalize GitBook code-block syntax before loading a Shiki language module.
 */
export function getShikiLanguage(syntax: string | undefined): string | null {
    if (!syntax) {
        return null;
    }

    const normalizedSyntax = syntax.toLowerCase();
    if (!normalizedSyntax || normalizedSyntax.includes('/')) {
        return null;
    }

    return syntaxAliases[normalizedSyntax] ?? normalizedSyntax;
}
