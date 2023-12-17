declare module 'memoizee/weak' {
    declare function memoizee<F extends (...args: any[]) => any>(f: F): F;

    export = memoizee;
}
