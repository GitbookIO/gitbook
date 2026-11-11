import { NextResponse } from 'next/server';

export const DISALLOW_ALL_ROBOTS_TXT_LINES = [
    'User-agent: *',
    'Content-Signal: ai-train=no, search=no, ai-input=no',
    'Disallow: /',
];

export function createRobotsTxtResponse(lines: string[]) {
    return new NextResponse(`${lines.join('\n')}\n`, {
        headers: { 'Content-Type': 'text/plain' },
    });
}

// Matches under any base path, like the signed-in route: a sign-in redirect doesn't tell us the site's base path.
export function isRobotsTxtRequest(siteRequestURL: URL) {
    return siteRequestURL.pathname.endsWith('/robots.txt');
}
