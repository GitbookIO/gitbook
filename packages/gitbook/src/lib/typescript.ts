/**
 * Filter function to exclude `null` values
 */
export function filterOutNullable<T>(value: T): value is NonNullable<T> {
    return !!value;
}
