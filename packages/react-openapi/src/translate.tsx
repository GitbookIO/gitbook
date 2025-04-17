import React from 'react';

import type { Translation, TranslationKey } from './translations';

/**
 * Translate a string.
 */
export function t(
    translation: Translation,
    id: TranslationKey,
    ...args: React.ReactNode[]
): React.ReactNode {
    const string = translation[id];
    if (!string) {
        throw new Error(`Translation not found for "${id}"`);
    }

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
            if (partToPush === undefined || partToReplace === undefined) {
                throw new Error(`Invalid translation "${id}"`);
            }
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
    translation: Translation,
    id: TranslationKey,
    ...args: React.ReactNode[]
): string {
    const result = t(translation, id, ...args);
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

    if (typeof el === 'object' && 'props' in el) {
        return el.props.children.map(reactToString).join('');
    }

    throw new Error(`Unsupported type ${typeof el}`);
}
