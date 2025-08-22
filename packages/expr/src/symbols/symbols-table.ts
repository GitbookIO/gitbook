import type { JSONSchema7 } from 'json-schema';

import { filterOutNullable } from '../utils';
import {
    SymbolArray,
    SymbolBoolean,
    SymbolNull,
    SymbolNumber,
    SymbolObject,
    SymbolString,
    SymbolUndefined,
} from './symbols';
import {
    type ExtractSymbolDef,
    type GenericSymbolDef,
    type ObjectSymbolDef,
    SymbolType,
    type SymbolWithMethods,
    type SymbolWithProperties,
    resolveSymbolDef,
} from './types';

export interface SymbolInfo<T extends SymbolType = SymbolType> {
    /**
     * Definition of the symbol.
     */
    definition: ExtractSymbolDef<T>;

    /**
     * Reference of the symbol in the table of symbols.
     */
    ref: string;

    /**
     * Stores the reference to the parent symbol.
     */
    parentRef?: string;

    /**
     * Stores the reference to the children symbols.
     */
    childrenRefs?: string[];
}

export class SymbolError extends Error {
    constructor(message: string) {
        super(message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SymbolError);
        }
        this.name = 'SymbolError';
    }
}

export class SymbolsTable {
    /**
     * Internal table that keeps track of all symbols reference.
     */
    #table: Record<string, SymbolInfo>;

    /**
     * Internal table that keep track of the raw symbols definitions.
     */
    #rawSymbols: Record<string, GenericSymbolDef>;

    constructor(initialContext: Record<string, GenericSymbolDef> = {}) {
        this.#table = {};
        this.#rawSymbols = {};
        this.addSymbols(initialContext);
    }

    /**
     * Create a new symbols table by merging the current one with the provided one.
     */
    merge(other: SymbolsTable): SymbolsTable {
        return new SymbolsTable({
            ...this.#rawSymbols,
            ...other.#rawSymbols,
        });
    }

    toString() {
        return JSON.stringify(this.#table, null, 2);
    }

    /**
     * Infer the symbol of a value and generate the appropriate symbol definition.
     */
    static inferSymbolFromValue(value: unknown, name?: string): ExtractSymbolDef<SymbolType> {
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return SymbolArray({ items: SymbolUndefined() });
            }

            const firstItemSymbol = SymbolsTable.inferSymbolFromValue(value.at(0));
            // Check that the array is not a mixin of different items types.
            if (value.length > 1) {
                const secondItemSymbol = SymbolsTable.inferSymbolFromValue(value.at(1));
                if (firstItemSymbol.type !== secondItemSymbol.type) {
                    throw new SymbolError('Array with mixin items types are not supported');
                }
            }
            return SymbolArray({ name, items: firstItemSymbol });
        }

        if (typeof value === 'undefined') {
            return SymbolUndefined({ name });
        }

        if (value === null) {
            return SymbolNull({ name });
        }

        const valueType = typeof value;
        switch (valueType) {
            case 'string':
                return SymbolString({ name });
            case 'number':
                return SymbolNumber({ name });
            case 'boolean':
                return SymbolBoolean({ name });
            case 'object': {
                const properties = Object.entries(value).reduce<Record<string, GenericSymbolDef>>(
                    (prev, [name, val]) => {
                        prev[name] = SymbolsTable.inferSymbolFromValue(val, name);
                        return prev;
                    },
                    {}
                );
                return SymbolObject({ name, properties, methods: [] });
            }
            default:
                throw new SymbolError(`Unsupported symbol type ${valueType}`);
        }
    }

    /**
     * Infer a table of symbol based on a JSON schema object describing it.
     */
    static inferSymbolFromJSONSchema(
        schema: JSONSchema7,
        name?: string
    ): ExtractSymbolDef<SymbolType> {
        switch (schema.type) {
            case 'string':
                return SymbolString({
                    name,
                    ...(schema.description ? { description: schema.description } : {}),
                    ...(schema.enum
                        ? {
                              enum: schema.enum
                                  .filter(filterOutNullable)
                                  .map((enumValue) => enumValue.toString()),
                          }
                        : {}),
                });
            case 'number':
            case 'integer':
                return SymbolNumber({
                    name,
                    ...(schema.description ? { description: schema.description } : {}),
                });
            case 'boolean':
                return SymbolBoolean({
                    name,
                    ...(schema.description ? { description: schema.description } : {}),
                });
            case 'null':
                return SymbolNull({
                    name,
                    ...(schema.description ? { description: schema.description } : {}),
                });
            case 'object':
                return SymbolsTable.#buildObjectSymbolFromJSONSchemaObject(schema, name);
            case 'array':
                return SymbolsTable.#buildArraySymbolFromJSONSchemaArray(schema, name);
            default:
                throw new Error(`Unsupported schema type: ${schema.type}`);
        }
    }

    static #buildObjectSymbolFromJSONSchemaObject(
        schema: JSONSchema7,
        name?: string
    ): ObjectSymbolDef {
        const properties: Record<string, GenericSymbolDef> = {};

        if (schema.properties) {
            Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
                properties[propertyName] = SymbolsTable.inferSymbolFromJSONSchema(
                    propertySchema as JSONSchema7,
                    propertyName
                );
            });
        }

        return SymbolObject({
            name,
            properties,
            ...(schema.description ? { description: schema.description } : {}),
            methods: [],
        });
    }

    static #buildArraySymbolFromJSONSchemaArray(
        schema: JSONSchema7,
        name?: string
    ): ExtractSymbolDef<SymbolType.Array> {
        if (schema.items) {
            const itemSymbol = SymbolsTable.inferSymbolFromJSONSchema(
                schema.items as JSONSchema7,
                `${name || ''}_item`
            );
            return SymbolArray({
                name,
                ...(schema.description ? { description: schema.description } : {}),
                items: itemSymbol,
            });
        }

        return SymbolArray({
            name,
            ...(schema.description ? { description: schema.description } : {}),
            items: SymbolUndefined(),
        });
    }

    private generateSymbolRefPath(path: string[]): string {
        return path.join('.');
    }

    /**
     * Add a single symbol to the table at the provided path.
     */
    private addSymbol(path: string[], definition: GenericSymbolDef, raw = false): void {
        const fullPath = this.generateSymbolRefPath(path);
        const parentPath = path.slice(0, -1).join('.');

        if (this.#table[fullPath]) {
            throw new SymbolError(`Symbol "${fullPath}" already exists.`);
        }

        if (raw) {
            this.#rawSymbols[fullPath] = definition;
        }

        // Add the new symbol linking it to its parent
        this.#table[fullPath] = {
            definition: resolveSymbolDef(definition),
            ref: fullPath,
            parentRef: parentPath || undefined,
            childrenRefs: [],
        };

        if (parentPath && this.#table[parentPath]) {
            if (this.#table[parentPath].childrenRefs) {
                this.#table[parentPath].childrenRefs.push(fullPath);
            }
        }

        // Add any nested symbols if the value is a symbol with properties...
        if (isSymbolWithProperties(definition)) {
            Object.entries(definition.properties).forEach(([propKey, propSymbol]) => {
                if (isObjectSymbol(propSymbol)) {
                    this.addSymbols({ [propKey]: propSymbol }, path, false);
                } else {
                    this.addSymbol([...path, propKey], propSymbol, false);
                }
            });
        }

        // ...or a symbol with methods
        if (isSymbolWithMethods(definition)) {
            definition.methods.forEach((methodSymbol) => {
                this.addSymbol([...path, methodSymbol.name], methodSymbol, false);
            });
        }
    }

    /**
     * Add the provided object of symbols definitions to the symbol table.
     */
    public addSymbols(
        symbols: Record<string, GenericSymbolDef>,
        prefix: string[] = [],
        raw = true
    ): void {
        for (const [key, symbolDef] of Object.entries(symbols)) {
            const path = [...prefix, key];

            // Add the current symbol to the table.
            this.addSymbol(path, symbolDef, raw);
        }
    }

    /**
     * Get a symbol's information using its path in the table.
     */
    public getSymbolInfo<T extends SymbolType>(path: string | string[]): SymbolInfo<T> | undefined {
        const key = Array.isArray(path) ? path.join('.') : path;
        const info = this.#table[key];
        return info ? typedSymbolInfo(info) : undefined;
    }

    /**
     * Get all symbol keys matching the pattern defined by the provided path.
     */
    public getMatchingSymbolsKeys(path: string[]): string[] {
        const wildcardRegex = new RegExp(
            `^${path
                .map((segment) => {
                    if (segment.includes('*')) {
                        return `${segment.split('*')[0]}([^.]+)?`;
                    }
                    return segment;
                })
                .join('\\.')}$`
        );

        return Object.keys(this.#table)
            .filter((key) => wildcardRegex.test(key))
            .filter(filterOutNullable);
    }
}

function isObjectSymbol(symbol: GenericSymbolDef): symbol is ObjectSymbolDef {
    return symbol.type === SymbolType.Object;
}

function isSymbolWithProperties(symbol: GenericSymbolDef): symbol is SymbolWithProperties {
    return (
        symbol.type === SymbolType.Object ||
        symbol.type === SymbolType.Array ||
        symbol.type === SymbolType.String
    );
}

function isSymbolWithMethods(symbol: GenericSymbolDef): symbol is SymbolWithMethods {
    return (
        symbol.type === SymbolType.Object ||
        symbol.type === SymbolType.Array ||
        symbol.type === SymbolType.String
    );
}

function typedSymbolInfo<T extends SymbolType>(info: SymbolInfo): SymbolInfo<T> {
    const definition = resolveSymbolDef(info.definition);
    return { ...info, definition } as SymbolInfo<T>;
}
