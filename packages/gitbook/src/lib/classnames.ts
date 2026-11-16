import type { ClassNameValue } from 'tailwind-merge';

export type { ClassNameValue as ClassValue };

/**
 * Join class names, skipping falsy values.
 * Unlike `tcls`, it doesn't resolve Tailwind conflicts: component stylesheets are imported
 * before Tailwind's generated utilities (see `globals.css`), so a caller's utility still wins
 * at equal specificity.
 */
export function cx(...values: ClassNameValue[]): string {
    let result = '';
    for (const value of values) {
        if (!value) continue;
        const part = typeof value === 'string' ? value : cx(...value);
        if (part) result = result ? `${result} ${part}` : part;
    }
    return result;
}
