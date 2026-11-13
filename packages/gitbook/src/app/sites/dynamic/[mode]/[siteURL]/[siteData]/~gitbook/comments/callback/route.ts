import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { type RouteLayoutParams, getSiteURLDataFromParams } from '@/app/utils';
import {
    type PreviewCommentsPendingAuth,
    exchangePreviewCommentsCode,
    getPreviewCommentsCookieNames,
    getPreviewCommentsCookieOptions,
    parseCookieJSON,
} from '@/lib/preview-comments/auth';
import { PREVIEW_COMMENTS_AUTH_CHANNEL } from '@/lib/preview-comments/shared';

/**
 * OAuth redirect URI: exchange the code for a session cookie, then notify the opener and close the popup.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const siteURLData = getSiteURLDataFromParams(await params);
    const cookieNames = getPreviewCommentsCookieNames(siteURLData.site);
    const pendingAuth = parseCookieJSON<PreviewCommentsPendingAuth>(
        request.cookies.get(cookieNames.pendingAuth)?.value
    );

    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');

    if (error || !code || !pendingAuth || state !== pendingAuth.state) {
        return renderCallbackPage({
            ok: false,
            message: error === 'access_denied' ? 'Sign-in was cancelled.' : 'Sign-in failed.',
        });
    }

    try {
        const session = await exchangePreviewCommentsCode(pendingAuth, code);
        const response = renderCallbackPage({
            ok: true,
            message: 'Signed in. You can close this window.',
        });
        response.cookies.set(
            cookieNames.session,
            JSON.stringify(session),
            getPreviewCommentsCookieOptions(30 * 24 * 60 * 60)
        );
        response.cookies.delete(cookieNames.pendingAuth);
        return response;
    } catch {
        return renderCallbackPage({ ok: false, message: 'Sign-in failed.' });
    }
}

function renderCallbackPage(result: { ok: boolean; message: string }) {
    const payload = JSON.stringify({ ok: result.ok });
    const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>GitBook</title></head>
<body style="font-family: system-ui, sans-serif; display: grid; place-items: center; height: 100vh; margin: 0;">
<p>${result.message}</p>
<script>
(function () {
    var payload = ${payload};
    try { new BroadcastChannel(${JSON.stringify(PREVIEW_COMMENTS_AUTH_CHANNEL)}).postMessage(payload); } catch (e) {}
    if (payload.ok) { window.close(); }
})();
</script>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
}
