import { load } from '@scalar/openapi-parser';
import type { ParseOpenAPIInput } from './parse';
import { fetchURLs } from './scalar-plugins/fetchURLs';
import type { Filesystem } from './types';

/**
 * Create a filesystem from an OpenAPI document.
 * Fetches all the URLs specified in references and builds a filesystem.
 */
export async function createFileSystem(
    input: Pick<ParseOpenAPIInput, 'value' | 'rootURL' | 'options'>
): Promise<Filesystem> {
    const { value, rootURL, options } = input;

    const { filesystem } = await load(value, {
        plugins: [fetchURLs({ rootURL }), ...(options?.plugins || [])],
    });

    return filesystem;
}
