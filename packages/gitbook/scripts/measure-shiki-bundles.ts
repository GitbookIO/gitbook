import { $, Glob, file, gzipSync } from 'bun';
import { stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * Measure how much of the build output is made of Shiki grammars and themes.
 * Usage: bun scripts/measure-shiki-bundles.ts next|cloudflare
 */

const appPath = join(import.meta.dir, '..');
const mode = process.argv[2];

// Every Shiki grammar carries a scopeName, so it is a cheap marker for grammar chunks.
const GRAMMAR_MARKER = 'scopeName';

async function measureFiles(root: string, pattern: string) {
    let bytes = 0;
    let count = 0;
    let grammarBytes = 0;
    let grammarCount = 0;
    for await (const path of new Glob(pattern).scan({ cwd: root, onlyFiles: true })) {
        const content = await file(join(root, path)).text();
        const size = Buffer.byteLength(content);
        bytes += size;
        count += 1;
        if (content.includes(GRAMMAR_MARKER)) {
            grammarBytes += size;
            grammarCount += 1;
        }
    }
    return { bytes, count, grammarBytes, grammarCount };
}

// Next keeps shiki external on the server, so its files reach the function through the trace.
async function measurePageTrace() {
    const nftPath = join(
        appPath,
        '.next/server/app/sites/dynamic/[mode]/[siteURL]/[siteData]/(content)/[pagePath]/page.js.nft.json'
    );
    const { files } = (await file(nftPath).json()) as { files: string[] };
    let bytes = 0;
    let shikiBytes = 0;
    for (const relative of files) {
        const size = (await stat(join(dirname(nftPath), relative))).size;
        bytes += size;
        if (/@shikijs\/(langs|themes)|shiki\/dist\/(langs|themes)/.test(relative)) {
            shikiBytes += size;
        }
    }
    return { bytes, shikiBytes, count: files.length };
}

async function measureNext() {
    const client = await measureFiles(join(appPath, '.next/static/chunks'), '**/*.js');
    const server = await measureFiles(join(appPath, '.next/server'), '**/*.js');
    const serverAll = await measureFiles(join(appPath, '.next/server'), '**/*');
    const trace = await measurePageTrace();
    return {
        pageTraceBytes: trace.bytes,
        pageTraceFiles: trace.count,
        pageTraceShikiAssetBytes: trace.shikiBytes,
        clientChunksBytes: client.bytes,
        clientChunksCount: client.count,
        clientGrammarChunksBytes: client.grammarBytes,
        clientGrammarChunksCount: client.grammarCount,
        serverBytes: serverAll.bytes,
        serverGrammarBytes: server.grammarBytes,
        serverGrammarFiles: server.grammarCount,
    };
}

async function measureCloudflare() {
    const handlerPath = join(
        appPath,
        '.open-next/server-functions/default/packages/gitbook/handler.mjs'
    );
    const metafile = (await file(`${handlerPath}.meta.json`).json()) as {
        outputs: Record<string, { inputs: Record<string, { bytesInOutput: number }> }>;
    };
    const output = Object.values(metafile.outputs)[0];
    if (!output) {
        throw new Error('No output in handler metafile');
    }
    const shikiBytes = Object.entries(output.inputs).reduce(
        (total, [path, input]) =>
            path.includes('@shikijs/langs') || path.includes('@shikijs/themes')
                ? total + input.bytesInOutput
                : total,
        0
    );

    const dryRun =
        await $`bunx wrangler deploy --dry-run --config openNext/customWorkers/defaultWrangler.jsonc --env dev`
            .cwd(appPath)
            .quiet()
            .nothrow()
            .text();
    const upload = dryRun.match(/Total Upload: ([\d.]+) KiB \/ gzip: ([\d.]+) KiB/);

    return {
        handlerBytes: (await stat(handlerPath)).size,
        handlerGzipBytes: gzipSync(await file(handlerPath).arrayBuffer()).byteLength,
        shikiBytes,
        uploadKiB: upload ? Number(upload[1]) : null,
        uploadGzipKiB: upload ? Number(upload[2]) : null,
    };
}

if (mode === 'next') {
    console.log(JSON.stringify(await measureNext(), null, 2));
} else if (mode === 'cloudflare') {
    console.log(JSON.stringify(await measureCloudflare(), null, 2));
} else {
    throw new Error('Usage: bun scripts/measure-shiki-bundles.ts next|cloudflare');
}
