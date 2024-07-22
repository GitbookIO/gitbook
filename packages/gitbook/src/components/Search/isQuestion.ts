const questionWords = new Set([
    'who',
    'what',
    'where',
    'when',
    'why',
    'how',
    'explain',
    'is',
    'are',
    'was',
    'were',
    'do',
    'does',
    'did',
    'which',
    'whom',
    'whose',
    'can',
    'have',
    'give',
    'tell',
    'show',
    'find',
]);

/**
 * Return true if an input query looks like a question.
 */
export function isQuestion(query: string): boolean {
    if (query.length > 25 || query.includes('?') || query.includes(' ')) {
        return true;
    }

    const words = query.toLowerCase().trim().split(/\s+/);

    if (words.length === 0) {
        return false;
    }

    for (const word of words) {
        if (questionWords.has(word)) {
            return true;
        }
    }

    return false;
}
