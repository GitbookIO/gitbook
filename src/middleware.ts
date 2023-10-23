import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * Middleware to add the base path to the request headers.
 */
export function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.set('x-gitbook-basepath', headers.get('x-gitbook-basepath') ?? getDefaultBasePath(url));

    return NextResponse.next({
        request: {
            headers,
        },
    });
}

function getDefaultBasePath(url: URL) {
    const [space] = url.pathname.slice(1).split('/');
    return `/${space}`;
}

export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
