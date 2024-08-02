import { SpaceIntegrationScript } from '@gitbook/api';
import { merge } from 'content-security-policy-merger';
import { headers } from 'next/headers';

import { assetsDomain } from './assets';
import { filterOutNullable } from './typescript';
/**
 * Get the current nonce for the current request.
 */
export function getContentSecurityPolicyNonce(): string {
    const headersList = headers();
    const nonce = headersList.get('x-nonce');
    if (!nonce) {
        throw new Error('No nonce found in headers');
    }

    return nonce;
}

/**
 * Create a nonce for a Content Security Policy.
 */
export function createContentSecurityPolicyNonce(): string {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    return nonce;
}

/**
 * Generate a Content Security Policy header for a space.
 */
export function getContentSecurityPolicy(scripts: SpaceIntegrationScript[], nonce: string): string {
    const iconsAssetsSrc = process.env.GITBOOK_ICONS_URL
        ? new URL(process.env.GITBOOK_ICONS_URL).origin
        : '';

    // We need to allow loading any image or download any file
    // to support image and OpenAPI blocks where the content reference could be external.
    //
    // Since I can't get the nonce to work for inline styles, we need to allow unsafe-inline
    const defaultCSP = `
        default-src 'self' ${assetsDomain};
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' ${assetsDomain} https://integrations.gitbook.com https://cdn.iframe.ly;
        style-src 'self' ${assetsDomain} fonts.googleapis.com 'unsafe-inline';
        img-src * 'self' blob: data: files.gitbook.com ${assetsDomain} ${iconsAssetsSrc};
        connect-src * 'self' integrations.gitbook.com app.gitbook.com api.gitbook.com srv.buysellads.com ${assetsDomain} ${iconsAssetsSrc};
        font-src 'self' fonts.gstatic.com ${assetsDomain};
        frame-src *;
        object-src 'none';
        base-uri 'self' ${assetsDomain};
        form-action 'self' ${assetsDomain};
        frame-ancestors  https:;
    `;

    const result = scripts
        .map(({ contentSecurityPolicy }) => contentSecurityPolicy)
        .filter(filterOutNullable)
        .reduce((csp, policy) => merge(csp, policy), defaultCSP);

    return result
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}
