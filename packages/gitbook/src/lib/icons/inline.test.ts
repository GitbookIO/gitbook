import { describe, expect, it } from 'bun:test';
import type {
    JSONDocument,
    RevisionPage,
    RevisionTag,
    SiteSection,
    SiteSectionGroup,
} from '@gitbook/api';
import { IconStyle } from '@gitbook/icons/types';

import { getContentInlineIconSourceRequests, parseRawSVG } from './inline';

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

    it('extracts the viewBox when other attributes surround it', () => {
        expect(
            parseRawSVG(
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 2h3" /></svg>'
            )
        ).toEqual({
            viewBox: '0 0 16 16',
            markup: '<path d="M1 2h3" />',
        });
    });

    it('returns null when non-whitespace content follows the closing SVG tag', () => {
        expect(
            parseRawSVG('<svg viewBox="0 0 16 16"><path d="M1 2h3" /></svg><span>extra</span>')
        ).toBeNull();
    });

    it('strips multiple comments and script tags from the markup', () => {
        const source = parseRawSVG(`
            <svg viewBox="0 0 16 16">
                <!-- first -->
                <path d="M1 2h3" />
                <script>first()</script>
                <!-- second -->
                <script type="text/javascript">second()</script>
            </svg>
        `);

        expect(source?.markup).toContain('<path d="M1 2h3" />');
        expect(source?.markup).not.toContain('<!--');
        expect(source?.markup).not.toContain('<script');
        expect(source?.markup).not.toContain('second()');
    });
});

describe('getContentInlineIconSourceRequests', () => {
    it('collects icon requests from pages, tags, sections, and document nodes', () => {
        const pages = [
            {
                icon: 'github',
                pages: [{ icon: 'lock' }],
            },
            { icon: 'star' },
        ] as unknown as RevisionPage[];
        const tags = [{ icon: 'gear' }] as unknown as RevisionTag[];
        const sections = [
            {
                object: 'site-section-group',
                icon: 'magnifying-glass',
                children: [{ object: 'site-section', icon: 'xmark' }],
            },
        ] as unknown as (SiteSection | SiteSectionGroup)[];
        const document = {
            object: 'document',
            nodes: [
                {
                    type: 'paragraph',
                    children: [{ type: 'icon', data: { icon: 'copy' } }],
                },
                {
                    type: 'button',
                    data: { icon: 'download' },
                },
            ],
        } as unknown as JSONDocument;

        expect(
            getContentInlineIconSourceRequests({
                iconStyle: IconStyle.Solid,
                pages,
                tags,
                sections,
                document,
            })
        ).toEqual([
            { icon: 'github', iconStyle: IconStyle.Solid },
            { icon: 'lock', iconStyle: IconStyle.Solid },
            { icon: 'star', iconStyle: IconStyle.Solid },
            { icon: 'gear', iconStyle: IconStyle.Solid },
            { icon: 'magnifying-glass', iconStyle: IconStyle.Solid },
            { icon: 'xmark', iconStyle: IconStyle.Solid },
            { icon: 'copy', iconStyle: IconStyle.Solid },
            { icon: 'download', iconStyle: IconStyle.Solid },
        ]);
    });

    it('ignores invalid, missing, and non-string icon values', () => {
        const pages = [
            { icon: 'not-a-real-icon' },
            { icon: 123 },
            { icon: 'github' },
        ] as unknown as RevisionPage[];
        const tags = [{ icon: null }, { icon: 'lock' }] as unknown as RevisionTag[];
        const sections = [
            { object: 'site-section', icon: undefined },
            { object: 'site-section', icon: 'also-not-real' },
        ] as unknown as (SiteSection | SiteSectionGroup)[];
        const document = {
            object: 'document',
            nodes: [
                { type: 'icon', data: { icon: 'made-up' } },
                { type: 'button', data: { icon: false } },
                { type: 'icon', data: { icon: 'copy' } },
            ],
        } as unknown as JSONDocument;

        expect(
            getContentInlineIconSourceRequests({
                iconStyle: IconStyle.Regular,
                pages,
                tags,
                sections,
                document,
            })
        ).toEqual([
            { icon: 'github', iconStyle: IconStyle.Regular },
            { icon: 'lock', iconStyle: IconStyle.Regular },
            { icon: 'copy', iconStyle: IconStyle.Regular },
        ]);
    });
});
