import { Space } from '@gitbook/api';
import React from 'react';

import * as translations from '@/translations';

export interface IntlContext {
    space: Space;
}

/**
 * Translate a string.
 */
export function t(
    context: IntlContext,
    id: keyof typeof translations.en,
    ...args: React.ReactNode[]
): React.ReactNode {
    const locale = 'en'; // TODO

    // fallback to english if no translation
    const string = translations[locale]?.[id] || translations.en[id];

    // Now we are going to replace the arguments
    // but we want to return a string as long as it's possible
    // (eg. if there isn't any argument that is a ReactNode)
    const parts: React.ReactNode[] = [];
    let currentStringToReplace: string = string;

    args.forEach((arg, i) => {
        if (typeof arg === 'string') {
            currentStringToReplace = currentStringToReplace.replace(`\${${i + 1}}`, arg);
        } else {
            const [partToPush, partToReplace] = currentStringToReplace.split(`\${${i + 1}}`);
            parts.push(<React.Fragment key={`string-${i}`}>{partToPush}</React.Fragment>);
            parts.push(<React.Fragment key={`arg-${i}`}>{arg}</React.Fragment>);
            currentStringToReplace = partToReplace;
        }
    });

    if (!parts.length) {
        return currentStringToReplace;
    }

    return (
        <>
            {parts}
            {currentStringToReplace}
        </>
    );
}

/**
 * Version of `t` that returns a string.
 */
export function tString(
    context: IntlContext,
    id: keyof typeof translations.en,
    ...args: React.ReactNode[]
): string {
    const result = t(context, id, ...args);
    return reactToString(result);
}

function reactToString(el: React.ReactNode): string {
    if (typeof el === 'string' || typeof el === 'number' || typeof el === 'boolean') {
        return `${el}`;
    }

    if (el === null || el === undefined) {
        return '';
    }

    if (Array.isArray(el)) {
        return el.map(reactToString).join('');
    }

    if ('props' in el) {
        return el.props.children.map(reactToString).join('');
    }

    throw new Error(`Unsupported type ${typeof el}`);
}
