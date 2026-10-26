import { GITBOOK_ASSETS_URL } from '@/lib/env';

/**
 * Return the Content Security Policy for the current environment.
 */
export function getContentSecurityPolicy(): string {
    // `ionic:` lets Ionic iOS apps embed sites: WKWebView can't serve app pages over https.
    const csp = `
        default-src 'self' *;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' *;
        style-src 'self' 'unsafe-inline' blob: *;
        img-src * 'self' blob: data:;
        connect-src *;
        font-src *;
        frame-src *;
        object-src 'none';
        base-uri 'self' ${GITBOOK_ASSETS_URL};
        form-action 'self' ${GITBOOK_ASSETS_URL} *;
        frame-ancestors https: ionic: ${process.env.NODE_ENV !== 'production' ? 'http:' : ''};
    `;

    return csp
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}
