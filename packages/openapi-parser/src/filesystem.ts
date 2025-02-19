import { type AnyApiDefinitionFormat, load } from '@scalar/openapi-parser';
import { fetchURLs } from './scalar-plugins/fetchURLs';
import type { Filesystem } from './types';

/**
 * Create a filesystem from an OpenAPI document.
 * Fetches all the URLs specified in references and builds a filesystem.
 */
export async function createFileSystem(input: {
    /**
     * The OpenAPI document to create the filesystem from.
     */
    value: AnyApiDefinitionFormat;
    /**
     * The root URL of the specified OpenAPI document.
     * Used to resolve relative URLs.
     */
    rootURL: string | null;
}): Promise<Filesystem> {
    const { filesystem } = await load(input.value, {
        plugins: [fetchURLs({ rootURL: input.rootURL })],
    });

    return filesystem;
}
