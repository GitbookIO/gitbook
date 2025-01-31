declare module 'memoizee/weak' {
    declare function memoizee<F extends (...args: any[]) => any>(f: F): F;

    export = memoizee;
}

declare module 'memoizee' {
    declare function memoizee<F extends (...args: any[]) => any>(f: F): F;

    export = memoizee;
}
