import { assetsDomain } from './assets';

/**
 * Return the Content Security Policy for the current environment.
 */
export function getContentSecurityPolicy(): string {
    const csp = `
        default-src 'self' ${assetsDomain} *;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' ${assetsDomain} *;
        style-src 'self' ${assetsDomain} 'unsafe-inline' *;
        img-src * 'self' blob: data: files.gitbook.com ${assetsDomain};
        connect-src *;
        font-src *;
        frame-src *;
        object-src 'none';
        base-uri 'self' ${assetsDomain};
        form-action 'self' ${assetsDomain} *;
        frame-ancestors https: ${process.env.NODE_ENV !== 'production' ? 'http:' : ''};
    `;

    return csp
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}
