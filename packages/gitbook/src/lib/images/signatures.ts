import 'server-only';
import fnv1a from '@sindresorhus/fnv1a';
import type { MaybePromise } from 'p-map';
import { assert } from 'ts-essentials';

import { GITBOOK_IMAGE_RESIZE_SIGNING_KEY } from '../env';
import { getLogger } from '@/lib/logger';

/**
 * GitBook has supported different version of image signing in the past. To maintain backwards
 * compatibility, we retain the ability to verify older signatures.
 */
export type SignatureVersion = '0' | '1' | '2' | '3';

/**
 * The current version of the signature.
 */
export const CURRENT_SIGNATURE_VERSION: SignatureVersion = '3';

type SignFnInput = {
    url: string;
    imagesContextId: string;
};

type SignFn = (input: SignFnInput) => MaybePromise<string>;

/**
 * Verify a signature of an image URL
 */
export async function verifyImageSignature(
    input: SignFnInput,
    { signature, version }: { signature: string; version: SignatureVersion }
): Promise<boolean> {
    const generator = IMAGE_SIGNATURE_FUNCTIONS[version];
    const generated = await generator(input);

    const matches = safeCompare(generated, signature);

    const logger = getLogger().subLogger('imageResizing');
    if (!matches) {
        // We only log if the signature does not match, to avoid logging useless information
        logger.log(
            `comparing image signature for "${input.url}" on identifier "${input.imagesContextId}": "${generated}" (expected) === "${signature}" (actual)`
        );
    }
    return matches;
}

/**
 * Generate an image signature. Also returns the version of the image signing algorithm that was used.
 */
export async function generateImageSignature(input: SignFnInput): Promise<{
    signature: string;
    version: SignatureVersion;
}> {
    const result = await generateSignatureV3(input);
    return { signature: result, version: CURRENT_SIGNATURE_VERSION };
}

/**
 * The signature is truncated to 128 bits: enough to make forgery infeasible, while keeping
 * image URLs short as a page can contain many of them.
 */
const SIGNATURE_V3_BYTES = 16;

/**
 * Same inputs as the v2 algorithm, but hashed with SHA-256 instead of FNV-1a.
 * FNV-1a is not a cryptographic hash, so a v2 signature is not a sound authentication token.
 *
 * We use the Web Crypto API rather than `node:crypto` because signatures are verified from the
 * middleware, which is bundled for the Cloudflare edge runtime where `node:crypto` is external.
 */
const generateSignatureV3: SignFn = async (input) => {
    assert(GITBOOK_IMAGE_RESIZE_SIGNING_KEY, 'GITBOOK_IMAGE_RESIZE_SIGNING_KEY is not set');
    const all = [
        input.url,
        input.imagesContextId, // The hostname is used to avoid serving images from other sites on the same domain
        // Kept last so a known prefix can never be length-extended into a valid signature.
        GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    ]
        .filter(Boolean)
        .join(':');

    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(all));
    return toHex(new Uint8Array(hash, 0, SIGNATURE_V3_BYTES));
};

// Reused buffer for FNV-1a hashing in the v2 algorithm
const fnv1aUtf8Buffer = new Uint8Array(512);

/**
 * Generate a signature for an image.
 * The signature is relative to the current site being rendered to avoid serving images from other sites on the same domain.
 */
const generateSignatureV2: SignFn = async (input) => {
    assert(GITBOOK_IMAGE_RESIZE_SIGNING_KEY, 'GITBOOK_IMAGE_RESIZE_SIGNING_KEY is not set');
    const all = [
        input.url,
        input.imagesContextId, // The hostname is used to avoid serving images from other sites on the same domain
        GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    ]
        .filter(Boolean)
        .join(':');

    const signature = fnv1a(all, { utf8Buffer: fnv1aUtf8Buffer }).toString(16);
    return signature;
};

// Reused buffer for FNV-1a hashing in the v1 algorithm
const fnv1aUtf8BufferV1 = new Uint8Array(512);

/**
 * New and faster algorithm to generate a signature for an image.
 * When setting it in a URL, we use version '1' for the 'sv' querystring parameneter
 * to know that it was the algorithm that was used.
 */
const generateSignatureV1: SignFn = async (input) => {
    assert(GITBOOK_IMAGE_RESIZE_SIGNING_KEY, 'GITBOOK_IMAGE_RESIZE_SIGNING_KEY is not set');
    const all = [input.url, GITBOOK_IMAGE_RESIZE_SIGNING_KEY].filter(Boolean).join(':');
    return fnv1a(all, { utf8Buffer: fnv1aUtf8BufferV1 }).toString(16);
};

/**
 * Initial algorithm used to generate a signature for an image. It didn't use any versioning in the URL.
 * We still need it to validate older signatures that were generated without versioning
 * but still exist in previously generated and cached content.
 */
const generateSignatureV0: SignFn = async (input) => {
    assert(GITBOOK_IMAGE_RESIZE_SIGNING_KEY, 'GITBOOK_IMAGE_RESIZE_SIGNING_KEY is not set');
    const all = [input.url, GITBOOK_IMAGE_RESIZE_SIGNING_KEY].filter(Boolean).join(':');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(all));
    return toHex(new Uint8Array(hash));
};

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * A mapping of signature versions to signature functions.
 */
const IMAGE_SIGNATURE_FUNCTIONS: Record<SignatureVersion, SignFn> = {
    '0': generateSignatureV0,
    '1': generateSignatureV1,
    '2': generateSignatureV2,
    '3': generateSignatureV3,
};

export function isSignatureVersion(input: string): input is SignatureVersion {
    return Object.keys(IMAGE_SIGNATURE_FUNCTIONS).includes(input);
}

/**
 * Compare two signatures in constant time, to avoid leaking a valid signature byte by byte.
 * We can't use `node:crypto`'s `timingSafeEqual` as this also runs on the edge runtime.
 */
function safeCompare(expected: string, actual: string): boolean {
    if (expected.length !== actual.length) {
        return false;
    }

    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
    }
    return diff === 0;
}
