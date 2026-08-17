import { describe, expect, it } from 'bun:test';

import {
    getAddedDeclarations,
    getChangedLines,
    getCompatibilityDiagnostics,
} from './cssBrowserCompatibility';

const baseCSS = `.card {
    color: red;
}
`;

describe('getChangedLines', () => {
    it('tracks added and removed line numbers independently', () => {
        const changedLines = getChangedLines('one\ntwo\n', 'one\nthree\n');

        expect(changedLines.added).toEqual(new Set([2]));
        expect(changedLines.removed).toEqual(new Set([2]));
    });
});

describe('getAddedDeclarations', () => {
    it('returns newly added declarations', () => {
        const declarations = getAddedDeclarations(
            baseCSS,
            `.card {
    color: red;
    container-type: inline-size;
}
`
        );

        expect(declarations).toEqual([{ column: 5, line: 3, property: 'container-type' }]);
    });

    it('does not treat a value change as a newly added property', () => {
        const declarations = getAddedDeclarations(
            baseCSS,
            `.card {
    color: blue;
}
`
        );

        expect(declarations).toEqual([]);
    });

    it('uses the declaration start for multiline declarations', () => {
        const declarations = getAddedDeclarations(
            baseCSS,
            `.card {
    color: red;
    background-image: linear-gradient(
        red,
        blue
    );
}
`
        );

        expect(declarations).toEqual([{ column: 5, line: 3, property: 'background-image' }]);
    });
});

describe('getCompatibilityDiagnostics', () => {
    it('ignores compatible and custom properties', async () => {
        const diagnostics = await getCompatibilityDiagnostics({
            base: baseCSS,
            browsers: ['safari 12'],
            file: 'packages/gitbook/src/example.css',
            head: `.card {
    color: red;
    --card-color: red;
    display: flex;
}
`,
        });

        expect(diagnostics).toEqual([]);
    });

    it('reports a newly added unsupported property once', async () => {
        const diagnostics = await getCompatibilityDiagnostics({
            base: baseCSS,
            browsers: ['safari 12'],
            file: 'packages/gitbook/src/example.css',
            head: `.card {
    color: red;
    appearance: none;
}
`,
        });

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]).toMatchObject({
            file: 'packages/gitbook/src/example.css',
            line: 3,
            property: 'appearance',
            unsupportedBrowsers: 'Safari 12',
        });
    });

    it('attributes same-line declarations to the property that uses the feature', async () => {
        const diagnostics = await getCompatibilityDiagnostics({
            base: '.card { color: red; }\n',
            browsers: ['safari 12'],
            file: 'packages/gitbook/src/example.css',
            head: '.card { color: red; appearance: none; }\n',
        });

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.property).toBe('appearance');
    });
});
