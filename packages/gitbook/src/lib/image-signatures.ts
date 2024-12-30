import 'server-only';

import fnv1a from '@sindresorhus/fnv1a';
import type { MaybePromise } from 'p-map';

import { host } from './links';

/**
 * GitBook has supported different version of image signing in the past. To maintain backwards
 * compatibility, we retain the ability to verify older signatures.
 */
export type SignatureVersion = '0' | '1' | '2';

/**
 * A mapping of signature versions to signature functions.
 */
const IMAGE_SIGNATURE_FUNCTIONS: Record<SignatureVersion, (input: string) => MaybePromise<string>> =
    {
        '0': generateSignatureV0,
        '1': generateSignatureV1,
        '2': generateSignatureV2,
    };

export function isSignatureVersion(input: string): input is SignatureVersion {
    return Object.keys(IMAGE_SIGNATURE_FUNCTIONS).includes(input);
}

/**
 * Verify a signature of an image URL
 */
export async function verifyImageSignature(
    input: string,
    { signature, version }: { signature: string; version: SignatureVersion },
): Promise<boolean> {
    const generator = IMAGE_SIGNATURE_FUNCTIONS[version];
    const generated = await generator(input);
    return generated === signature;
}

/**
 * Generate an image signature. Also returns the version of the image signing algorithm that was used.
 *
 * This function is sync. If you need to implement an async version of image signing, you'll need to change
 * ths signature of this fn and where it's used.
 */
export function generateImageSignature(input: string): {
    signature: string;
    version: SignatureVersion;
} {
    const result = generateSignatureV2(input);
    return { signature: result, version: '2' };
}

// Reused buffer for FNV-1a hashing in the v2 algorithm
const fnv1aUtf8Buffer = new Uint8Array(512);

/**
 * Generate a signature for an image.
 * The signature is relative to the current site being rendered to avoid serving images from other sites on the same domain.
 */
function generateSignatureV2(input: string): string {
    const hostName = host();
    const all = [
        input,
        hostName, // The hostname is used to avoid serving images from other sites on the same domain
        process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    ]
        .filter(Boolean)
        .join(':');
    return fnv1a(all, { utf8Buffer: fnv1aUtf8Buffer }).toString(16);
}

// Reused buffer for FNV-1a hashing in the v1 algorithm
const fnv1aUtf8BufferV1 = new Uint8Array(512);

/**
 * New and faster algorithm to generate a signature for an image.
 * When setting it in a URL, we use version '1' for the 'sv' querystring parameneter
 * to know that it was the algorithm that was used.
 */
function generateSignatureV1(input: string): string {
    const all = [input, process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY].filter(Boolean).join(':');
    return fnv1a(all, { utf8Buffer: fnv1aUtf8BufferV1 }).toString(16);
}

/**
 * Initial algorithm used to generate a signature for an image. It didn't use any versioning in the URL.
 * We still need it to validate older signatures that were generated without versioning
 * but still exist in previously generated and cached content.
 */
async function generateSignatureV0(input: string): Promise<string> {
    const all = [input, process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY].filter(Boolean).join(':');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(all));

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
