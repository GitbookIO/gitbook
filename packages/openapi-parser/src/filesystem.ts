import { bundle } from '@scalar/json-magic/bundle';
import { parseJson, parseYaml } from '@scalar/json-magic/bundle/plugins/browser';
import type { ParseOpenAPIInput } from './parse';
import { fetchURL } from './scalar-plugins/fetchURL';
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

    const result = await bundle(value, {
        treeShake: false,
        plugins: [
            fetchURL(),
            parseYaml(),
            parseJson(),
            fetchURLs({ rootURL }),
            ...(options?.plugins || []),
        ],
    });

    return [
        {
            dir: '.',
            isEntrypoint: true,
            references: [],
            filename: 'openapi.json',
            specification: result,
        },
    ];
}
