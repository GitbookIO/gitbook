import { type AnyApiDefinitionFormat, load } from '@scalar/openapi-parser';
import { fetchUrls } from './scalar-plugins/fetchURLs';
import type { Filesystem } from './types';

/**
 * Create a filesystem from an OpenAPI document.
 * Fetches all the URLs specified in references and builds a filesystem.
 */
export async function createFileSystem(input: {
    value: AnyApiDefinitionFormat;
    baseUrl: string;
}): Promise<Filesystem> {
    const { filesystem } = await load(input.value, {
        plugins: [fetchUrls({ baseUrl: input.baseUrl })],
    });
    return filesystem;
}
