import { NextResponse } from 'next/server';

/**
 * robots.txt rules blocking every crawler from the whole site.
 */
export const DISALLOW_ALL_ROBOTS_TXT_LINES = [
    'User-agent: *',
    'Content-Signal: ai-train=no, search=no, ai-input=no',
    'Disallow: /',
];

/**
 * Create a plain-text robots.txt response from a list of lines.
 */
export function createRobotsTxtResponse(lines: string[]) {
    return new NextResponse(`${lines.join('\n')}\n`, {
        headers: { 'Content-Type': 'text/plain' },
    });
}

/**
 * Check if the site request targets a robots.txt file.
 */
export function isRobotsTxtRequest(siteRequestURL: URL) {
    return siteRequestURL.pathname.endsWith('/robots.txt');
}
