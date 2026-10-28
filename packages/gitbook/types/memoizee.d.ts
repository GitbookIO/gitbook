declare module 'memoizee' {
    function memoizee<F extends (...args: any[]) => any>(
        f: F,
        options?: { normalizer?: (args: any[]) => string }
    ): F;

    export = memoizee;
}

declare module 'memoizee/weak' {
    function memoizee<F extends (...args: any[]) => any>(f: F): F;

    export = memoizee;
}
