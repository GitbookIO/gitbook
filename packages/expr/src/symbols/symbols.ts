import {
    type ArraySymbolDef,
    type BooleanSymbolDef,
    type ExtractSymbolDef,
    type FunctionSymbolDef,
    type GenericSymbolDef,
    type NullSymbolDef,
    type NumberSymbolDef,
    type ObjectSymbolDef,
    type StringSymbolDef,
    SymbolType,
    type SymbolsWithPropertiesAndMethods,
    type UndefinedSymbolDef,
    type UnionSymbolDef,
} from './types';

export function SymbolBoolean(args: Omit<BooleanSymbolDef, 'type'> = {}): BooleanSymbolDef {
    return {
        type: SymbolType.Boolean,
        ...args,
    };
}

export function SymbolNumber(args: Omit<NumberSymbolDef, 'type'> = {}): NumberSymbolDef {
    return {
        type: SymbolType.Number,
        ...args,
    };
}

export function SymbolString(
    args: Omit<StringSymbolDef, 'type' | 'methods' | 'properties'> = {}
): StringSymbolDef {
    return createSymbolWithPropertiesAndMethods<StringSymbolDef>(SymbolType.String, args);
}

export function SymbolObject(args: Omit<ObjectSymbolDef, 'type'>): ObjectSymbolDef {
    return {
        type: SymbolType.Object,
        ...args,
    };
}

export function SymbolArray(
    args: Omit<ArraySymbolDef, 'type' | 'methods' | 'properties'>
): ArraySymbolDef {
    return createSymbolWithPropertiesAndMethods(SymbolType.Array, args);
}

export function SymbolFunction(args: Omit<FunctionSymbolDef, 'type'>): FunctionSymbolDef {
    return {
        type: SymbolType.Function,
        ...args,
    };
}

export function OptionalFunctionArg(
    optionalArg: ExtractSymbolDef<SymbolType>
): ExtractSymbolDef<SymbolType> & { optional: true } {
    return {
        ...optionalArg,
        optional: true,
    };
}

export function SymbolUnion(args: Omit<UnionSymbolDef, 'type'>): UnionSymbolDef {
    return {
        type: SymbolType.Union,
        ...args,
    };
}

export function SymbolUndefined(args: Omit<UndefinedSymbolDef, 'type'> = {}): UndefinedSymbolDef {
    return {
        type: SymbolType.Undefined,
        ...args,
    };
}

export function SymbolNull(args: Omit<NullSymbolDef, 'type'> = {}): NullSymbolDef {
    return {
        type: SymbolType.Null,
        ...args,
    };
}

function createSymbolWithPropertiesAndMethods<
    T extends SymbolsWithPropertiesAndMethods & { type: SymbolType },
>(type: T['type'], args: Omit<T, 'type' | 'methods' | 'properties'>): T {
    const symbol = { type, ...args } as T;

    Object.defineProperty(symbol, 'properties', {
        get() {
            if (symbol.type === SymbolType.Array) {
                return isArraySymbol(symbol)
                    ? StandardLibrary[SymbolType.Array]?.(symbol).properties
                    : {};
            }
            return StandardLibrary[symbol.type]?.properties || {};
        },
    });

    Object.defineProperty(symbol, 'methods', {
        get() {
            if (symbol.type === SymbolType.Array) {
                return isArraySymbol(symbol)
                    ? StandardLibrary[SymbolType.Array]?.(symbol).methods
                    : [];
            }
            return StandardLibrary[symbol.type]?.methods || [];
        },
    });

    return symbol;
}

// TODO-ADAPTIVE-CONTENT: extend the definition of the supported standard library methods and properties.

const StandardLibrary: Partial<
    {
        [key in Exclude<SymbolType, SymbolType.Array>]: {
            properties: Record<string, GenericSymbolDef>;
            methods: FunctionSymbolDef[];
        };
    } & {
        [SymbolType.Array]: (symbol: ArraySymbolDef) => {
            properties: Record<string, GenericSymbolDef>;
            methods: FunctionSymbolDef[];
        };
    }
> = {
    [SymbolType.String]: {
        properties: {
            length: SymbolNumber({
                name: 'length',
                description:
                    'The length data property of a String value contains the length of the string in UTF-16 code units.',
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length',
            }),
        },
        methods: [
            SymbolFunction({
                name: 'at',
                description: `Takes an integer value and returns the item at that index, allowing for positive and negative integers.
            Negative integers count back from the last item in the string.`,
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/at',
                args: [
                    SymbolNumber({
                        name: 'index',
                        description: 'The index (position) of the string character to be returned',
                    }),
                ],
                returns: SymbolUnion({
                    description: `A String consisting of the single UTF-16 code unit located at the specified position.
                Returns undefined if the given index can not be found.`,
                    members: [SymbolString(), SymbolUndefined()],
                }),
            }),
            SymbolFunction({
                name: 'endsWith',
                description: `Returns true if the sequence of elements of searchString converted to a String is the same as the corresponding 
            elements of this object (converted to a String) starting at endPosition – length(this). Otherwise returns false.`,
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith',
                args: [
                    SymbolString({
                        name: 'searchString',
                        description: `The characters to be searched for at the end of str. Cannot be a regex.
                    All values that are not regexes are coerced to strings, so omitting it or passing undefined causes endsWith() to search for 
                    the string "undefined", which is rarely what you want.`,
                    }),
                    OptionalFunctionArg(
                        SymbolNumber({
                            name: 'endPosition',
                            description: `The end position at which searchString is expected to be found 
                    (the index of searchString's last character plus 1). Defaults to str.length.`,
                        })
                    ),
                ],
                returns: SymbolBoolean({
                    description: `true if the given characters are found at the end of the string, including when searchString is an empty string; 
                otherwise, false.`,
                }),
            }),
            SymbolFunction({
                name: 'includes',
                description: `Returns true if searchString appears as a substring of the result of converting this object to a String, at one or more positions 
            that are greater than or equal to position; otherwise, returns false.`,
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes',
                args: [
                    SymbolString({
                        name: 'searchString',
                        description: `A string to be searched for within str. Cannot be a regex. All values that are not regexes are coerced to strings, so omitting it 
                or passing undefined causes includes() to search for the string "undefined", which is rarely what you want.`,
                    }),
                    OptionalFunctionArg(
                        SymbolNumber({
                            name: 'position',
                            description:
                                'The position within the string at which to begin searching for searchString. (Defaults to 0.)',
                        })
                    ),
                ],
                returns: SymbolBoolean({
                    description: `true if the search string is found anywhere within the given string, including when searchString is an empty string; 
                otherwise, false.`,
                }),
            }),
        ],
    },
    [SymbolType.Array]: (arraySymbolDef: ArraySymbolDef) => ({
        properties: {
            length: SymbolNumber({
                name: 'length',
                description: `The length data property of an Array instance represents the number of elements in that array.
                The value is an unsigned, 32-bit integer that is always numerically greater than the highest index in the array.`,
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length',
            }),
        },
        methods: [
            SymbolFunction({
                name: 'at',
                description: `Takes an integer value and returns the item at that index, allowing for positive and negative integers. 
                Negative integers count back from the last item in the array.`,
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at',
                args: [
                    SymbolNumber({
                        name: 'index',
                        description: `Zero-based index of the array element to be returned, converted to an integer. 
                        Negative index counts back from the end of the array — if index < 0, index + array.length is accessed.`,
                    }),
                ],
                returns: SymbolUnion({
                    description: `The element in the array matching the given index. Always returns undefined if index < -array.length or index >= array.length 
                    without attempting to access the corresponding property.`,
                    members: [arraySymbolDef.items, SymbolUndefined()],
                }),
            }),
            SymbolFunction({
                name: 'includes',
                description:
                    'Determines whether an array includes a certain value among its entries, returning true or false as appropriate.',
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes',
                args: [
                    {
                        ...arraySymbolDef.items,
                        name: 'searchElement',
                        description: 'The value to be searched for within the array.',
                    },
                    OptionalFunctionArg(
                        SymbolNumber({
                            name: 'fromIndex',
                            description:
                                'The position within the string at which to begin searching for searchString. (Defaults to 0.)',
                        })
                    ),
                ],
                returns: SymbolBoolean({
                    description:
                        'true if the value searchElement is found within the array (or the part of the array indicated by the index fromIndex, if specified).',
                }),
            }),
            SymbolFunction({
                name: 'some',
                description:
                    'Tests whether at least one element in the array passes the test implemented by the provided function.',
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some',
                args: [
                    SymbolFunction({
                        name: 'callback',
                        description: 'A function that tests each element of the array.',
                        args: [
                            {
                                ...arraySymbolDef.items,
                                name: 'element',
                                description: 'The current element being processed in the array.',
                            },
                        ],
                        returns: SymbolBoolean({
                            description:
                                'true if the callback function returns a truthy value for at least one element in the array.',
                        }),
                    }),
                ],
                returns: SymbolBoolean({
                    description:
                        'true if the callback function returns a truthy value for at least one element in the array.',
                }),
            }),
            SymbolFunction({
                name: 'every',
                description:
                    'Tests whether all elements in the array pass the test implemented by the provided function.',
                link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every',
                args: [
                    SymbolFunction({
                        name: 'callback',
                        description: 'A function that tests each element of the array.',
                        args: [
                            {
                                ...arraySymbolDef.items,
                                name: 'element',
                                description: 'The current element being processed in the array.',
                            },
                        ],
                        returns: SymbolBoolean({
                            description:
                                'true if the callback function returns a truthy value for all elements in the array.',
                        }),
                    }),
                ],
                returns: SymbolBoolean({
                    description:
                        'true if the callback function returns a truthy value for all elements in the array.',
                }),
            }),
        ],
    }),
};

function isArraySymbol(symbol: GenericSymbolDef): symbol is ArraySymbolDef {
    return symbol.type === SymbolType.Array;
}
