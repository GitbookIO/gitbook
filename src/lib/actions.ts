export type StreamResponseChunk<T> = {
    iteratorResult: IteratorResult<T>;
    next?: Promise<StreamResponseChunk<T>>;
};

/**
 * Stream the response of an async generator function.
 * This function should be used to wrap an async generator server action.
 *
 * See https://github.com/vercel/next.js/discussions/51282
 */
export function streamResponse<T, P extends any[]>(
    createGenerator: (...args: P) => AsyncGenerator<T>,
) {
    return (...args: Parameters<typeof createGenerator>) => {
        const generator = createGenerator(...args);
        return streamChunk<T>(generator);
    };
}

/**
 * Iterate over the response of an async generator function.
 */
export function iterateStreamResponse<T>(streamResponse: Promise<StreamResponseChunk<T>>) {
    return {
        [Symbol.asyncIterator]: function () {
            return {
                current: streamResponse,
                async next() {
                    const { iteratorResult, next } = await this.current;

                    if (next) this.current = next;
                    else iteratorResult.done = true;

                    return iteratorResult;
                },
            };
        },
    };
}

async function streamChunk<T>(generator: AsyncGenerator<T>) {
    const next = generator.next();
    return new Promise<StreamResponseChunk<T>>((resolve, reject) => {
        next.then((res) => {
            if (res.done) resolve({ iteratorResult: res });
            else resolve({ iteratorResult: res, next: streamChunk(generator) });
        });
        next.catch((error) => reject(error));
    });
}
