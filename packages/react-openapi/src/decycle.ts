// Forked from: https://github.com/YChebotaev/json-decycle/blob/master/src/index.ts
// Replaced `$ref` with `$reference` to avoid conflicts with OpenAPI

const isObject = (value: any): value is object =>
    typeof value === 'object' &&
    value != null &&
    !(value instanceof Boolean) &&
    !(value instanceof Date) &&
    !(value instanceof Number) &&
    !(value instanceof RegExp) &&
    !(value instanceof String);

const toPointer = (parts: string[]) =>
    `#${parts.map((part) => String(part).replace(/~/g, '~0').replace(/\//g, '~1')).join('/')}`;

export const decycle = () => {
    const paths = new WeakMap();

    return function replacer(this: any, key: string | symbol, value: any) {
        if (key !== '$reference' && isObject(value)) {
            const seen = paths.has(value);

            if (seen) {
                return { $reference: toPointer(paths.get(value)) };
            }

            paths.set(value, [...(paths.get(this) ?? []), key]);
        }

        return value;
    };
};

export function retrocycle() {
    const parents = new WeakMap();
    const keys = new WeakMap();
    const refs = new Set();

    function dereference(this: { [k: string]: any }, ref: { $reference: string }) {
        const parts = ref.$reference.slice(1).split('/');
        let key: any;
        let value = this;

        for (let i = 0; i < parts.length; i++) {
            key = parts[i]?.replace(/~1/g, '/').replace(/~0/g, '~');
            value = value[key];
        }

        const parent = parents.get(ref);
        parent[keys.get(ref)] = value;
    }

    return function reviver(this: object, key: string | symbol, value: any) {
        if (key === '$reference') {
            refs.add(this);
        } else if (isObject(value)) {
            const isRoot = key === '' && Object.keys(this).length === 1;
            if (isRoot) {
                refs.forEach(dereference as any, this);
            } else {
                parents.set(value, this);
                keys.set(value, key);
            }
        }

        return value;
    };
}
