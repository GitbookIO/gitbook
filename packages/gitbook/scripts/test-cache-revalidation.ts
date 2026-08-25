/**
 * Usage:
 *   bun packages/gitbook/scripts/test-cache-revalidation.ts benchmark
 *   bun packages/gitbook/scripts/test-cache-revalidation.ts revalidate
 */

import { createHmac } from 'node:crypto';

// Edit this section for the local site under test. `bun dev` exposes published
// sites at /url/<published-site-host>/<path>.
const PAGE_URLS = [
    'http://localhost:3000/url/example.gitbook.io/docs',
    'http://localhost:3000/url/example.gitbook.io/docs/getting-started',
];

// The revalidation route must use the same /url/<published-site-host>/ prefix.
// Leave REVALIDATE_SECRET empty when the deployment does not set GITBOOK_SECRET.
const REVALIDATE_URL = 'http://localhost:3000/url/example.gitbook.io/~gitbook/revalidate';
const REVALIDATE_SECRET = '';
const REVALIDATE_BODY = '{"tags":["space:YOUR_SPACE_ID"]}';

// Next sets x-nextjs-cache to HIT or MISS. Change this when testing through a
// proxy that exposes the result under a different header.
const CACHE_STATUS_HEADER = 'x-nextjs-cache';
const BENCHMARK_RUNS = 3;
const WARMUP_REQUESTS = 2;
const WAIT_AFTER_REVALIDATION_MS = 1_000;

type RequestResult = {
    cacheStatus: string | null;
    status: number;
    totalMs: number;
    ttfbMs: number;
    url: string;
};

function printTableHeader() {
    console.log(
        `${'request'.padEnd(13)} ${'HTTP'.padEnd(4)} ${CACHE_STATUS_HEADER.padEnd(16)} ${'TTFB / total'.padEnd(22)} URL`
    );
}

function printResult(label: string, result: RequestResult) {
    const cacheStatus = result.cacheStatus ?? '<missing>';
    const timings = `${result.ttfbMs.toFixed(1)} / ${result.totalMs.toFixed(1)} ms`;
    console.log(
        `${label.padEnd(13)} ${String(result.status).padEnd(4)} ${cacheStatus.padEnd(16)} ${timings.padEnd(22)} ${result.url}`
    );
}

async function requestPage(url: string): Promise<RequestResult> {
    const start = performance.now();
    const response = await fetch(url);
    const ttfbMs = performance.now() - start;

    // Consume the response body so totalMs measures the entire transfer.
    await response.arrayBuffer();

    return {
        cacheStatus: response.headers.get(CACHE_STATUS_HEADER),
        status: response.status,
        totalMs: performance.now() - start,
        ttfbMs,
        url: response.url,
    };
}

function isSuccessful(result: RequestResult) {
    return result.status >= 200 && result.status < 400;
}

async function benchmark(): Promise<number> {
    let failures = 0;
    printTableHeader();

    for (let run = 1; run <= BENCHMARK_RUNS; run += 1) {
        for (const url of PAGE_URLS) {
            try {
                const result = await requestPage(url);
                printResult(`benchmark-${run}`, result);
                if (!isSuccessful(result)) {
                    failures += 1;
                }
            } catch (error) {
                console.error(`benchmark-${run} ERR ${url}: ${String(error)}`);
                failures += 1;
            }
        }
    }

    return failures;
}

function validateRevalidationConfig() {
    if (
        REVALIDATE_URL.includes('example.gitbook.io') ||
        REVALIDATE_BODY.includes('YOUR_') ||
        PAGE_URLS.some((url) => url.includes('example.gitbook.io'))
    ) {
        throw new Error(
            'Set PAGE_URLS, REVALIDATE_URL, and REVALIDATE_BODY before revalidate mode.'
        );
    }
}

function createSignature() {
    if (!REVALIDATE_SECRET) {
        return undefined;
    }

    return createHmac('sha256', REVALIDATE_SECRET).update(REVALIDATE_BODY).digest('hex');
}

async function revalidate(): Promise<number> {
    validateRevalidationConfig();
    let failures = 0;

    console.log(`Warming each page (${WARMUP_REQUESTS} request(s) each)...`);
    printTableHeader();
    for (let run = 1; run <= WARMUP_REQUESTS; run += 1) {
        for (const url of PAGE_URLS) {
            try {
                const result = await requestPage(url);
                printResult(`warmup-${run}`, result);
                if (!isSuccessful(result)) {
                    failures += 1;
                }
            } catch (error) {
                console.error(`warmup-${run} ERR ${url}: ${String(error)}`);
                failures += 1;
            }
        }
    }

    const headers = new Headers({ 'content-type': 'application/json' });
    const signature = createSignature();
    if (signature) {
        headers.set('x-gitbook-signature', signature);
    }

    console.log(`Revalidating ${REVALIDATE_BODY}...`);
    const revalidationResponse = await fetch(REVALIDATE_URL, {
        body: REVALIDATE_BODY,
        headers,
        method: 'POST',
    });
    const revalidationResponseBody = await revalidationResponse.text();
    if (!revalidationResponse.ok) {
        throw new Error(
            `Revalidation failed with ${revalidationResponse.status}: ${revalidationResponseBody}`
        );
    }
    console.log(revalidationResponseBody);

    await Bun.sleep(WAIT_AFTER_REVALIDATION_MS);

    console.log('Checking that the next response is a MISS...');
    printTableHeader();
    for (const url of PAGE_URLS) {
        try {
            const result = await requestPage(url);
            printResult('revalidated', result);
            if (!isSuccessful(result) || result.cacheStatus?.toUpperCase() !== 'MISS') {
                failures += 1;
            }
        } catch (error) {
            console.error(`revalidated ERR ${url}: ${String(error)}`);
            failures += 1;
        }
    }

    return failures;
}

async function main() {
    const mode = process.argv[2] ?? 'benchmark';
    let failures: number;

    try {
        switch (mode) {
            case 'benchmark':
                failures = await benchmark();
                break;
            case 'revalidate':
                failures = await revalidate();
                break;
            default:
                throw new Error(`Usage: bun ${process.argv[1]} {benchmark|revalidate}`);
        }
    } catch (error) {
        console.error(String(error));
        return 1;
    }

    if (failures > 0) {
        console.error(`${failures} request(s) failed.`);
        return 1;
    }

    return 0;
}

void main().then((exitCode) => {
    process.exitCode = exitCode;
});
