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

type WithoutUndefined<T> = {
    [K in keyof T]: T[K] extends undefined ? never : T[K];
};

/**
 * Removes `undefined` properties from an object.
 * This is useful for RSC serialization, as it avoids sending `"$undefined"` values.
 *
 */
// biome-ignore lint/suspicious/noExplicitAny: can't avoid for the generic
export function removeUndefined<T extends Record<string, any>>(obj: T): WithoutUndefined<T> {
    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            result[key as keyof T] = value;
        }
    }

    return result as WithoutUndefined<T>;
}
