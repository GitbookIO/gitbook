import shiki from 'shiki';

/**
 * Load a language by its name.
 */
export async function getLanguageByName(alias: string): Promise<shiki.ILanguageRegistration[]> {
    const lowerAlias = alias.toLowerCase();
    const language = languages.find((language) => language.aliases.includes(lowerAlias));

    if (!language) {
        throw new Error(`Language ${alias} not found`);
    }

    const loaded = await language.load();

    return [
        {
            id: loaded.name,
            scopeName: loaded.scopeName,
            grammar: loaded,
        } as shiki.ILanguageRegistration,
    ];
}

const languages: Array<{
    aliases: string[];
    load: () => Promise<any>;
}> = [
    {
        aliases: ['javascript', 'js'],
        load: () => import('shiki/languages/javascript.tmLanguage.json'),
    },
    {
        aliases: ['python', 'py'],
        load: () => import('shiki/languages/python.tmLanguage.json'),
    },
    {
        aliases: ['c'],
        load: () => import('shiki/languages/c.tmLanguage.json'),
    },
    {
        aliases: ['php'],
        load: () => import('shiki/languages/php.tmLanguage.json'),
    },
    {
        aliases: ['typescript'],
        load: () => import('shiki/languages/typescript.tmLanguage.json'),
    },
];
