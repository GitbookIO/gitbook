import { describe, expect, it } from 'bun:test';
import type { ContentKitRenderOutput, ContentKitWebFrame } from '@gitbook/api';

import { integrationBlockContainsWebframe } from './adaptive';

const webframe: ContentKitWebFrame = {
    type: 'webframe',
    source: { url: 'https://integrations.gitbook.com/frame' },
};

function elementOutput(element: unknown): ContentKitRenderOutput {
    return {
        type: 'element',
        element,
        state: {},
        props: {},
    } as ContentKitRenderOutput;
}

describe('integrationBlockContainsWebframe', () => {
    it('returns false for a completed output', () => {
        expect(integrationBlockContainsWebframe({ type: 'complete' })).toBe(false);
    });

    it('returns false when there is no webframe in the tree', () => {
        const output = elementOutput({
            type: 'block',
            children: [{ type: 'text', text: 'hello' }],
        } as never);
        expect(integrationBlockContainsWebframe(output)).toBe(false);
    });

    it('returns true when a webframe is nested in the tree', () => {
        const output = elementOutput({
            type: 'block',
            children: [{ type: 'vstack', children: [webframe] }],
        } as never);
        expect(integrationBlockContainsWebframe(output)).toBe(true);
    });
});
