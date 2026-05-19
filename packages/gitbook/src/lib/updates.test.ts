import { describe, expect, it } from 'bun:test';
import type { JSONDocument, Revision } from '@gitbook/api';
import { getDocumentUpdateTags } from './updates';

describe('getDocumentUpdateTags', () => {
    it('returns unique update tags in document order', () => {
        const document = createUpdatesDocument([
            ['improvements', 'fixes'],
            ['new-releases'],
            ['fixes'],
            ['unknown'],
        ]);
        const revision = {
            tags: [
                createTag('new-releases', 'New releases'),
                createTag('fixes', 'Fixes'),
                createTag('improvements', 'Improvements'),
            ],
        } as unknown as Revision;

        expect(getDocumentUpdateTags(document, revision).map((tag) => tag.slug)).toEqual([
            'improvements',
            'fixes',
            'new-releases',
        ]);
    });
});

function createUpdatesDocument(updateTags: string[][]): JSONDocument {
    return {
        object: 'document',
        data: { schemaVersion: 2 },
        nodes: [
            {
                object: 'block',
                type: 'updates',
                data: { format: 'full' },
                isVoid: false,
                nodes: updateTags.map((tags, index) => ({
                    object: 'block',
                    type: 'update',
                    data: {
                        date: `2026-05-${String(index + 1).padStart(2, '0')}`,
                        tags: tags.map((tag) => ({ kind: 'tag', tag })),
                    },
                    isVoid: false,
                    nodes: [],
                })),
            },
        ],
    };
}

function createTag(slug: string, label: string) {
    return {
        slug,
        label,
        color: 'default',
        icon: undefined,
    };
}
