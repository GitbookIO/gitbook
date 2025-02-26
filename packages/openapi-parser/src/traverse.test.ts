import { describe, expect, it } from 'bun:test';
import { dereference } from '@scalar/openapi-parser';
import { createFileSystem } from './filesystem';
import { traverse } from './traverse';

const recursiveSpec = await Bun.file(
    new URL('./fixtures/recursive-spec.json', import.meta.url)
).text();

describe('#traverse', () => {
    it('traverses a recursive structure asynchronously', async () => {
        expect.assertions(2);
        const result = await dereference(recursiveSpec);

        // Confirm that it is a recursive structure
        try {
            JSON.stringify(result);
        } catch (error) {
            expect((error as Error).message).toBe(
                'JSON.stringify cannot serialize cyclic structures.'
            );
        }

        const specification = await traverse(result.specification!, async (node) => {
            if ('description' in node && node.description) {
                node.description = 'Hello, world!';
                return node;
            }
            return node;
        });

        expect(specification.info?.description).toBe('Hello, world!');
    });

    it('traverses a complete filesystem', async () => {
        const filesystem = await createFileSystem({
            value: JSON.parse(recursiveSpec),
            rootURL: 'https://example.com',
        });

        const transformedFilesystem = await traverse(filesystem, async (node) => {
            if ('description' in node && node.description) {
                node.description = 'Hello, world!';
                return node;
            }
            return node;
        });

        expect(transformedFilesystem[0]?.specification.info?.description).toBe('Hello, world!');
    });
});
