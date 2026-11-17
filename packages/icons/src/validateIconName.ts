import iconNames from './data/icon-names.json' with { type: 'json' };
import type { IconName } from './types';

let iconNamesSet: Set<string> | null = null;

/**
 * Validate that the icon name is valid.
 */
export function validateIconName(icon: IconName | string): icon is IconName {
    if (!iconNamesSet) {
        iconNamesSet = new Set(iconNames);
    }

    return iconNamesSet.has(icon);
}
