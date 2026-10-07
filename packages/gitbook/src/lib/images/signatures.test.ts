import { describe, expect, it, mock } from 'bun:test';

// The signing key is read at module load, so it must be mocked before importing the module.
const realEnv = await import('@/lib/env');
mock.module('@/lib/env', () => ({
    ...realEnv,
    GITBOOK_IMAGE_RESIZE_SIGNING_KEY: 'test-signing-key',
}));

const {
    CURRENT_SIGNATURE_VERSION,
    generateImageSignature,
    isSignatureVersion,
    verifyImageSignature,
} = await import('./signatures');

const input = {
    url: 'https://example.com/image.png',
    imagesContextId: 'example.com',
};

describe('generateImageSignature', () => {
    it('should generate a v3 signature', async () => {
        const { signature, version } = await generateImageSignature(input);
        expect(version).toBe('3');
        expect(version).toBe(CURRENT_SIGNATURE_VERSION);
        expect(signature).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should be deterministic', async () => {
        const first = await generateImageSignature(input);
        const second = await generateImageSignature(input);
        expect(first.signature).toBe(second.signature);
    });

    it('should generate a different signature for a different url', async () => {
        const { signature } = await generateImageSignature(input);
        const other = await generateImageSignature({
            ...input,
            url: 'https://example.com/other.png',
        });
        expect(other.signature).not.toBe(signature);
    });

    it('should generate a different signature for a different images context', async () => {
        const { signature } = await generateImageSignature(input);
        const other = await generateImageSignature({ ...input, imagesContextId: 'other.com' });
        expect(other.signature).not.toBe(signature);
    });
});

describe('verifyImageSignature', () => {
    it('should verify a freshly generated signature', async () => {
        const { signature, version } = await generateImageSignature(input);
        expect(await verifyImageSignature(input, { signature, version })).toBe(true);
    });

    it('should reject a tampered signature', async () => {
        const { signature, version } = await generateImageSignature(input);
        const tampered = `${signature.slice(0, -1)}${signature.endsWith('a') ? 'b' : 'a'}`;
        expect(await verifyImageSignature(input, { signature: tampered, version })).toBe(false);
    });

    it('should reject a signature generated for another url', async () => {
        const { signature, version } = await generateImageSignature(input);
        const verified = await verifyImageSignature(
            { ...input, url: 'https://example.com/other.png' },
            { signature, version }
        );
        expect(verified).toBe(false);
    });

    it('should reject a signature generated for another images context', async () => {
        const { signature, version } = await generateImageSignature(input);
        const verified = await verifyImageSignature(
            { ...input, imagesContextId: 'other.com' },
            { signature, version }
        );
        expect(verified).toBe(false);
    });

    // Older signatures still exist in previously generated and cached content.
    it('should still verify a v2 signature', async () => {
        expect(await verifyImageSignature(input, { signature: 'd52f183b', version: '2' })).toBe(
            true
        );
    });
});

describe('isSignatureVersion', () => {
    it('should accept all known versions', () => {
        expect(['0', '1', '2', '3'].every(isSignatureVersion)).toBe(true);
    });

    it('should reject unknown versions', () => {
        expect(isSignatureVersion('4')).toBe(false);
        expect(isSignatureVersion('')).toBe(false);
    });
});
