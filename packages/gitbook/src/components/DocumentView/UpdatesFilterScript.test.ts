import { describe, expect, it } from 'bun:test';

import { serializeUpdatesFilterScriptArgs } from './UpdatesFilterScript';

describe('serializeUpdatesFilterScriptArgs', () => {
    it('cannot terminate the surrounding script element', () => {
        const serialized = serializeUpdatesFilterScriptArgs([
            ['</script><script>globalThis.injected = true</script>'],
        ]);

        expect(serialized).not.toContain('</script>');
        expect(serialized).toContain('\\u003c/script>');
    });
});
