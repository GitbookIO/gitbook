import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import {
    type PreviewCommentsPendingAuth,
    createRandomString,
    getPreviewCommentsAuthorizeURL,
    getPreviewCommentsCookieNames,
    getPreviewCommentsCookieOptions,
    registerPreviewCommentsClient,
} from '@/lib/preview-comments/auth';
import { PREVIEW_COMMENTS_CALLBACK_PATH } from '@/lib/preview-comments/shared';

/**
 * Start signing in a GitBook user to comment on the site, by redirecting to the OAuth consent screen.
 * Opened in a popup by the commenting UI.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getDynamicSiteContext(await params);
    const redirectUri = context.linker.toAbsoluteURL(
        context.linker.toPathInSite(PREVIEW_COMMENTS_CALLBACK_PATH)
    );

    const clientId = await registerPreviewCommentsClient({
        redirectUri,
        clientName: `Comments on ${context.site.title}`,
    });

    const pendingAuth: PreviewCommentsPendingAuth = {
        clientId,
        redirectUri,
        state: createRandomString(16),
        codeVerifier: createRandomString(),
    };

    const response = NextResponse.redirect(await getPreviewCommentsAuthorizeURL(pendingAuth));
    response.cookies.set(
        getPreviewCommentsCookieNames(context.site.id).pendingAuth,
        JSON.stringify(pendingAuth),
        getPreviewCommentsCookieOptions(10 * 60)
    );
    return response;
}
