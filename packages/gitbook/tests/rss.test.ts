import { expect, it } from 'bun:test';
import Parser from 'rss-parser';
import { getContentTestURL } from './utils';

it('should expose a RSS feed for a page with updates', async () => {
    const parser = new Parser();
    const feedURL = getContentTestURL(
        'https://gitbook.gitbook.io/test-gitbook-open/blocks/updates/rss.xml'
    );
    const feed = await parser.parseURL(feedURL);

    expect(feed.title).toBe('Updates | E2E Tests GitBook Open');
    expect(feed.items.length).toBe(4);
});

it('should not expose a RSS feed for a page without updates', async () => {
    const feedURL = getContentTestURL(
        'https://gitbook.gitbook.io/test-gitbook-open/text-page/rss.xml'
    );
    const response = await fetch(feedURL);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('No updates found in page');
});

it('should not expose a RSS feed for a page without updates (root page)', async () => {
    const feedURL = getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/rss.xml');
    const response = await fetch(feedURL);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('No updates found in page');
});
