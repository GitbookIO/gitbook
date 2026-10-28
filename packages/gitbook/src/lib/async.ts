/**
 * Try catch a promise and return the result or the error.
 */
export async function tryCatch<T>(
    promise: Promise<T>
): Promise<{ data: T; error?: undefined } | { data?: undefined; error: Error }> {
    try {
        return { data: await promise };
    } catch (error) {
        return { error: error as Error };
    }
}
