import { describe, expect, it } from 'bun:test';

const { parseRawSVG } = await import('./inline');

describe('parseRawSVG', () => {
    it('extracts the viewBox and inner SVG markup', () => {
        expect(
            parseRawSVG(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M1 2h3" />
                </svg>
            `)
        ).toEqual({
            viewBox: '0 0 20 20',
            markup: '<path d="M1 2h3" />',
        });
    });

    it('strips comments and script tags from the inline markup', () => {
        const source = parseRawSVG(`
                <svg viewBox='0 0 24 24'>
                    <!-- Font Awesome metadata -->
                    <path d="M4 5h6" />
                    <script>alert("bad")</script>
                    <path d="M7 8h9" />
                </svg>
            `);

        expect(source?.viewBox).toBe('0 0 24 24');
        expect(source?.markup).toContain('<path d="M4 5h6" />');
        expect(source?.markup).toContain('<path d="M7 8h9" />');
        expect(source?.markup).not.toContain('<!--');
        expect(source?.markup).not.toContain('<script');
    });

    it('returns null when the document is not an SVG with a viewBox', () => {
        expect(parseRawSVG('<div>not an icon</div>')).toBeNull();
        expect(parseRawSVG('<svg><path d="M1 2h3" /></svg>')).toBeNull();
    });
});
