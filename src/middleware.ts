import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * Rewrite the request to extract the spaceId from the URL
 * and pass it as a header.
 */
export function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const [space, ...pathRest] = url.pathname.slice(1).split('/');

    const headers = new Headers(request.headers);
    headers.set('x-gitbook-space', space);
    headers.set('x-gitbook-basepath', `/${space}`);

    url.pathname = `/${pathRest.join('/')}`;

    return NextResponse.rewrite(url, {
        headers,
    });
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
