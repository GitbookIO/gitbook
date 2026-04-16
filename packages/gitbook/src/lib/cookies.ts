import type { ResponseCookies } from '@/lib/visitors';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

/**
 * Write cookies to a response using `cookies()` to preserve dynamic behavior.
 */
export async function writeResponseCookies<R extends NextResponse>(
    response: R,
    cookiesToSet: ResponseCookies
): Promise<R> {
    const cookiesStore = await cookies();
    cookiesToSet.forEach((cookie) => {
        // For some reason we have to use the cookies function instead of response.cookies.set.
        // Without it, it breaks the ai assistant server actions (it thinks it is a static route).
        cookiesStore.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
}
