import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: ['/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};

export function middleware(request: NextRequest) {
    // No rewrite
    return NextResponse.next();
}
