/**
 * Filter function to exclude `null` values
 */
export function filterOutNullable<T>(value: T): value is NonNullable<T> {
    return !!value;
}

/**
 * Alternative to `assertNever` that returns `null` instead of throwing an error.
 */
export function nullIfNever(_value: never): null {
    return null;
}
