export interface TextMatch {
    text: string;
    match?: string;
}

/**
 * Split `text` into consecutive parts, flagging the ones that match `query`.
 */
export function matchString(text: string, query: string): TextMatch[] {
    const words = splitQuery(query);
    const initialParts = [{ text }];
    const parts = words.reduce((parts, word) => matchWordInParts(parts, word), initialParts);

    return coalesceAdjacentMatches(parts);
}

function matchWordInParts(parts: TextMatch[], word: string): TextMatch[] {
    return parts.reduce((result, part) => {
        if (part.match) {
            result.push(part);
            return result;
        }

        const { text } = part;
        const index = text.toLowerCase().indexOf(word);
        if (index >= 0) {
            const before = text.slice(0, index);
            const inner = text.slice(index, index + word.length);
            const after = text.slice(index + word.length);

            if (before.length > 0) result.push({ text: before });
            if (inner.length > 0) result.push({ text: inner, match: word });
            if (after.length > 0) result.push({ text: after });

            return result;
        }

        result.push({ text });
        return result;
    }, [] as TextMatch[]);
}

/**
 * Multi-word queries match each word independently, so a phrase like "maria db"
 * against "MariaDB" produces two touching match parts. Rendered as separate
 * spans their negative margins and rounded corners overlap into a doubled pill,
 * so contiguous matches are merged into one highlight span.
 */
function coalesceAdjacentMatches(parts: TextMatch[]): TextMatch[] {
    return parts.reduce((result, part) => {
        const previous = result[result.length - 1];
        if (part.match && previous?.match) {
            previous.text += part.text;
            previous.match += part.match;
            return result;
        }

        result.push({ ...part });
        return result;
    }, [] as TextMatch[]);
}

function splitQuery(text: string): string[] {
    return text.toLowerCase().split(' ');
}
