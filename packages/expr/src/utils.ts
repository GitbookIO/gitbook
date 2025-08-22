/**
 * Format the result value of an expression for display as a string.
 */
export function formatExpressionResult(value: any, defaultValue = ''): string {
    if (value === undefined || value === null) {
        return defaultValue;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }

    return defaultValue;
}

/**
 * Filter function to exclude `null` values
 */
export function filterOutNullable<T>(value: T): value is NonNullable<T> {
    return !!value;
}

/**
 * Type to make optional properties on a object mandatory.
 *
 * interface SomeObject {
 *   uid: string;
 *   price: number | null;
 *   location?: string;
 * }
 *
 * type ValuableObject = MandateProps<SomeObject, 'price' | 'location'>;
 */
export type MandateProps<T extends {}, K extends keyof T> = T & {
    [MK in K]-?: NonNullable<T[MK]>;
};
