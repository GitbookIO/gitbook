import type { PublishedSiteContent } from '@gitbook/api';

export type SiteRouteType = 'dynamic' | 'static' | 'ppr';

export type PPRRequest = {
    content: PublishedSiteContent & { revision: string };
    defaults: {
        siteSection: string | undefined;
        siteSpace: string;
        space: string;
    };
    revalidationId: string;
};

export const PPRRequestHeaders = {
    Site: 'x-gbo-site',
    SiteSection: 'x-gbo-site-section',
    SiteSpace: 'x-gbo-site-space',
    Space: 'x-gbo-space',
    SiteBasePath: 'x-gbo-site-base-path',
    BasePath: 'x-gbo-base-path',
    Pathname: 'x-gbo-pathname',
    Organization: 'x-gbo-organization',
    ShareKey: 'x-gbo-share-key',
    Complete: 'x-gbo-complete',
    ContextID: 'x-gbo-context-id',
    CanonicalURL: 'x-gbo-canonical-url',
    Preview: 'x-gbo-preview',
    Revision: 'x-gbo-revision',
    ChangeRequest: 'x-gbo-change-request',
    APIToken: 'x-gbo-api-token',
    RevalidationID: 'x-gbo-revalidation-id',
    DefaultSiteSection: 'x-gbo-default-site-section',
    DefaultSiteSpace: 'x-gbo-default-site-space',
    DefaultSpace: 'x-gbo-default-space',
    Signature: 'x-gbo-signature',
} as const;

/**
 * Header names covered by the signature, in an order both signer and verifier must agree on.
 */
const SignedPPRRequestHeaders = Object.values(PPRRequestHeaders)
    .filter((name) => name !== PPRRequestHeaders.Signature)
    .sort();

/**
 * GBO has already resolved PPR requests, so a complete header set can skip URL resolution.
 *
 * That skips visitor-auth validation and lets the headers pick the cache key, so the set is only
 * trusted once its GBO signature checks out. Without a secret to check against, PPR stays off.
 */
export async function getPPRRequest(
    headers: Headers,
    secret: string | null
): Promise<PPRRequest | undefined> {
    const pprRequest = parsePPRRequest(headers);
    if (!pprRequest || !secret || !(await verifyPPRRequestHeaders(headers, secret))) {
        return undefined;
    }

    return pprRequest;
}

/**
 * Sign a PPR header set the way GBO does. Only used by the dev proxy and tests.
 */
export async function signPPRRequestHeaders(headers: Headers, secret: string): Promise<void> {
    const signature = await crypto.subtle.sign(
        'HMAC',
        await importSigningKey(secret),
        encodeUTF8(getSignedPayload(headers))
    );
    headers.set(PPRRequestHeaders.Signature, toHex(signature));
}

async function verifyPPRRequestHeaders(headers: Headers, secret: string): Promise<boolean> {
    const signature = headers.get(PPRRequestHeaders.Signature);
    const decoded = signature ? fromHex(signature) : null;
    if (!decoded) {
        return false;
    }

    // `crypto.subtle.verify` compares in constant time.
    return crypto.subtle.verify(
        'HMAC',
        await importSigningKey(secret),
        decoded,
        encodeUTF8(getSignedPayload(headers))
    );
}

/**
 * Canonical string that gets signed. An absent header must not hash like an empty one, as dropping
 * one changes how the set is read.
 */
function getSignedPayload(headers: Headers): string {
    return SignedPPRRequestHeaders.map((name) => {
        const value = headers.get(name);
        return value === null ? name : `${name}=${encodeURIComponent(value)}`;
    }).join('\n');
}

function importSigningKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        encodeUTF8(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

function encodeUTF8(value: string): Uint8Array<ArrayBuffer> {
    return new Uint8Array(new TextEncoder().encode(value));
}

function toHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join(
        ''
    );
}

function fromHex(value: string): Uint8Array<ArrayBuffer> | null {
    if (value.length === 0 || value.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(value)) {
        return null;
    }

    const bytes = new Uint8Array(value.length / 2);
    for (let index = 0; index < bytes.length; index++) {
        bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
    }

    return bytes;
}

function parsePPRRequest(headers: Headers): PPRRequest | undefined {
    const site = getRequiredHeader(headers, PPRRequestHeaders.Site);
    const siteSpace = getRequiredHeader(headers, PPRRequestHeaders.SiteSpace);
    const space = getRequiredHeader(headers, PPRRequestHeaders.Space);
    const siteBasePath = getRequiredHeader(headers, PPRRequestHeaders.SiteBasePath);
    const basePath = getRequiredHeader(headers, PPRRequestHeaders.BasePath);
    const pathname = getRequiredHeader(headers, PPRRequestHeaders.Pathname);
    const organization = getRequiredHeader(headers, PPRRequestHeaders.Organization);
    const complete = getBooleanHeader(headers, PPRRequestHeaders.Complete);
    const canonicalUrl = getRequiredHeader(headers, PPRRequestHeaders.CanonicalURL);
    const apiToken = getRequiredHeader(headers, PPRRequestHeaders.APIToken);
    const preview = getBooleanHeader(headers, PPRRequestHeaders.Preview);
    const revision = getRequiredHeader(headers, PPRRequestHeaders.Revision);
    const revalidationId = headers.get(PPRRequestHeaders.RevalidationID);
    const defaultSiteSection = getOptionalHeader(headers, PPRRequestHeaders.DefaultSiteSection);
    const defaultSiteSpace = getRequiredHeader(headers, PPRRequestHeaders.DefaultSiteSpace);
    const defaultSpace = getRequiredHeader(headers, PPRRequestHeaders.DefaultSpace);

    if (
        !site ||
        !siteSpace ||
        !space ||
        !siteBasePath ||
        !basePath ||
        !pathname ||
        !organization ||
        complete === undefined ||
        !canonicalUrl ||
        !apiToken ||
        (headers.get(PPRRequestHeaders.Preview) && preview === undefined) ||
        !revision ||
        !revalidationId ||
        !headers.has(PPRRequestHeaders.DefaultSiteSection) ||
        !defaultSiteSpace ||
        !defaultSpace
    ) {
        return undefined;
    }

    return {
        content: {
            site,
            siteSection: getOptionalHeader(headers, PPRRequestHeaders.SiteSection),
            siteSpace,
            space,
            siteBasePath,
            basePath,
            pathname,
            organization,
            shareKey: getOptionalHeader(headers, PPRRequestHeaders.ShareKey),
            complete,
            contextId: getOptionalHeader(headers, PPRRequestHeaders.ContextID),
            canonicalUrl,
            preview,
            revision,
            changeRequest: getOptionalHeader(headers, PPRRequestHeaders.ChangeRequest),
            apiToken,
        },
        defaults: {
            siteSection: defaultSiteSection,
            siteSpace: defaultSiteSpace,
            space: defaultSpace,
        },
        revalidationId,
    };
}

function getRequiredHeader(headers: Headers, name: string): string | undefined {
    return getOptionalHeader(headers, name);
}

function getOptionalHeader(headers: Headers, name: string): string | undefined {
    return headers.get(name) || undefined;
}

function getBooleanHeader(headers: Headers, name: string): boolean | undefined {
    const value = getOptionalHeader(headers, name);
    if (!value) {
        return undefined;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return undefined;
}

/**
 * Keep the PPR rollout limited to ordinary static document pages.
 */
export function getPPRRouteType(
    routeType: SiteRouteType,
    isPPRPage: boolean | undefined,
    pprRequest: PPRRequest | undefined
): SiteRouteType {
    return routeType === 'static' && isPPRPage && pprRequest ? 'ppr' : routeType;
}
