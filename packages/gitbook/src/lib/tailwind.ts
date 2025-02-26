import { twMerge, ClassNameValue } from 'tailwind-merge';

export type { ClassNameValue as ClassValue };

/**
 * Create a tailwind className for a component.
 */
export function tcls(...values: ClassNameValue[]): string {
    return twMerge(...values);
}
