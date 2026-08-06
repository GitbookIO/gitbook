import type { OpenAPIV3 } from '@gitbook/openapi-parser';

// Generated once during resolution so the block never regenerates while hydrating: that would cost
// CPU in the browser and let non-deterministic values (dates) cause a hydration mismatch.
const GENERATED_EXAMPLES = 'x-gitbook-generated-examples';

export type GeneratedExampleOptions = {
    xml?: boolean;
    mode?: 'read' | 'write';
    omitEmptyAndOptionalProperties?: boolean;
};

type Store = Record<string, { value: unknown }>;

function variantKey(options?: GeneratedExampleOptions): string {
    return [
        options?.mode ?? 'any',
        options?.xml ? 'xml' : '',
        options?.omitEmptyAndOptionalProperties ? 'omit' : '',
    ]
        .filter(Boolean)
        .join(':');
}

/** Wrapped so a legitimately `undefined` example is not mistaken for a cache miss. */
export function readGeneratedExample(
    schema: OpenAPIV3.SchemaObject,
    options?: GeneratedExampleOptions
): { value: unknown } | undefined {
    const store = (schema as Record<string, unknown>)[GENERATED_EXAMPLES] as Store | undefined;
    return store?.[variantKey(options)];
}

export function writeGeneratedExample(
    schema: OpenAPIV3.SchemaObject,
    options: GeneratedExampleOptions | undefined,
    value: unknown
): void {
    const target = schema as Record<string, unknown>;
    const store = (target[GENERATED_EXAMPLES] as Store | undefined) ?? {};
    store[variantKey(options)] = { value };
    target[GENERATED_EXAMPLES] = store;
}
