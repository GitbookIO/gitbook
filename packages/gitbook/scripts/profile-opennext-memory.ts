import { file, sleep, spawn } from 'bun';
import { stat } from 'node:fs/promises';
import { createConnection } from 'node:net';
import { join } from 'node:path';
import WebSocket from 'ws';

type HeapUsage = {
    usedSize: number;
    totalSize: number;
    embedderHeapUsedSize: number;
    backingStorageSize: number;
};

type DevWorker = {
    command: string[];
    process: WorkerProcess;
};

type WorkerProcess = {
    exitCode: number | null;
    exited: Promise<number>;
    stdin: { write(data: string): unknown };
    kill(): void;
};

const appPath = `${import.meta.dir}/..`;
const requestURL = process.env.PROFILE_URL ?? 'http://127.0.0.1:8771/url/gitbook.com/docs';
const requestCount = Number.parseInt(process.env.PROFILE_REQUESTS ?? '20', 10);
const forceGarbageCollection = process.env.PROFILE_FORCE_GC === 'true';
const settleMs = Number.parseInt(process.env.PROFILE_SETTLE_MS ?? '5000', 10);

if (
    !Number.isSafeInteger(requestCount) ||
    requestCount < 1 ||
    !Number.isSafeInteger(settleMs) ||
    settleMs < 0
) {
    throw new Error('PROFILE_REQUESTS and PROFILE_SETTLE_MS must be positive integers');
}

const workers: DevWorker[] = [];

try {
    const server = await startWorker(['bun', 'run', 'dev:cf:server'], 8772);
    workers.push(server);
    const middleware = await startWorker(['bun', 'run', 'dev:cf:middleware'], 8771);
    workers.push(middleware);

    const coldResponse = await requestUntilReady(requestURL);
    await maybeCollectGarbage();

    const cold = await getMeasurements();
    const responses = await Promise.all(
        Array.from({ length: requestCount }, () => request(requestURL))
    );

    await sleep(settleMs);
    await maybeCollectGarbage();

    const afterLoad = await getMeasurements();
    const bundle = await getBundleMetrics();

    // oxlint-disable-next-line no-console -- JSON on stdout is this script's public interface.
    console.log(
        JSON.stringify(
            {
                requestURL,
                requestCount,
                forceGarbageCollection,
                settleMs,
                coldResponse,
                responses: summarizeResponses(responses),
                heap: { cold, afterLoad },
                bundle,
            },
            null,
            2
        )
    );
} finally {
    for (const worker of workers.reverse()) {
        await stopWorker(worker.process);
    }
}

async function startWorker(command: string[], port: number): Promise<DevWorker> {
    const process = spawn(command, {
        cwd: appPath,
        stdin: 'pipe',
        stdout: 'ignore',
        stderr: 'ignore',
    });

    try {
        await waitForPort(port, process);
        return { command, process };
    } catch (error) {
        process.kill();
        await process.exited;
        throw error;
    }
}

async function stopWorker(process: WorkerProcess) {
    process.stdin.write('x\n');
    await Promise.race([process.exited, sleep(5_000)]);

    if (process.exitCode === null) {
        process.kill();
        await process.exited;
    }
}

async function waitForPort(port: number, process: WorkerProcess) {
    const timeout = Date.now() + 60_000;

    while (Date.now() < timeout) {
        if (process.exitCode !== null) {
            throw new Error(`Worker exited before becoming ready: ${process.exitCode}`);
        }

        try {
            await connectToPort(port);
            return;
        } catch {
            await sleep(250);
        }
    }

    throw new Error(`Worker did not become ready within 60 seconds on port ${port}`);
}

async function connectToPort(port: number) {
    await new Promise<void>((resolve, reject) => {
        const socket = createConnection({ host: '127.0.0.1', port });
        socket.once('connect', () => {
            socket.destroy();
            resolve();
        });
        socket.once('error', (error) => {
            socket.destroy();
            reject(error);
        });
    });
}

async function request(url: string) {
    const startedAt = performance.now();
    const response = await fetch(url);
    const body = await response.arrayBuffer();

    return {
        status: response.status,
        bytes: body.byteLength,
        durationMs: Math.round(performance.now() - startedAt),
    };
}

async function requestUntilReady(url: string) {
    let response: Awaited<ReturnType<typeof request>> | undefined;

    for (let attempt = 0; attempt < 20; attempt += 1) {
        response = await request(url);
        if (response.status < 500) {
            return response;
        }
        await sleep(250);
    }

    throw new Error(`Worker did not return a successful response: ${response?.status}`);
}

function summarizeResponses(responses: Awaited<ReturnType<typeof request>>[]) {
    return {
        statuses: Object.fromEntries(
            Object.entries(Object.groupBy(responses, ({ status }) => status)).map(
                ([status, groupedResponses]) => [status, groupedResponses?.length ?? 0]
            )
        ),
        bytes: responses.reduce((total, { bytes }) => total + bytes, 0),
        maxDurationMs: Math.max(...responses.map(({ durationMs }) => durationMs)),
    };
}

async function getMeasurements() {
    return {
        server: await sendDevtoolsCommand<HeapUsage>(
            'ws://127.0.0.1:9229/ws',
            'Runtime.getHeapUsage'
        ),
        middleware: await sendDevtoolsCommand<HeapUsage>(
            'ws://127.0.0.1:9230/ws',
            'Runtime.getHeapUsage'
        ),
    };
}

async function maybeCollectGarbage() {
    if (!forceGarbageCollection) {
        return;
    }

    await Promise.all([
        collectGarbage('ws://127.0.0.1:9229/ws'),
        collectGarbage('ws://127.0.0.1:9230/ws'),
    ]);
}

async function collectGarbage(url: string) {
    await new Promise<void>((resolve, reject) => {
        const websocket = new WebSocket(url);
        const timeout = setTimeout(() => {
            websocket.terminate();
            reject(new Error('Timed out waiting for HeapProfiler.takeHeapSnapshot'));
        }, 60_000);

        websocket.on('open', () => {
            websocket.send(
                JSON.stringify({
                    id: 1,
                    method: 'HeapProfiler.takeHeapSnapshot',
                    params: { reportProgress: false },
                })
            );
        });
        websocket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.id !== 1) {
                return;
            }

            clearTimeout(timeout);
            websocket.terminate();
            if (message.error) {
                reject(new Error(message.error.message));
                return;
            }
            resolve();
        });
        websocket.on('error', () => {
            clearTimeout(timeout);
            reject(new Error(`Unable to connect to DevTools: ${url}`));
        });
    });
}

async function sendDevtoolsCommand<Result>(url: string, method: string): Promise<Result> {
    return new Promise<Result>((resolve, reject) => {
        const websocket = new WebSocket(url);
        const timeout = setTimeout(() => {
            websocket.terminate();
            reject(new Error(`Timed out waiting for ${method}`));
        }, 10_000);

        websocket.on('open', () => {
            websocket.send(JSON.stringify({ id: 1, method }));
        });
        websocket.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.id !== 1) {
                return;
            }

            clearTimeout(timeout);
            websocket.terminate();
            if (message.error) {
                reject(new Error(message.error.message));
                return;
            }
            resolve(message.result as Result);
        });
        websocket.on('error', () => {
            clearTimeout(timeout);
            reject(new Error(`Unable to connect to DevTools: ${url}`));
        });
    });
}

async function getBundleMetrics() {
    const handlerPath = join(
        appPath,
        '.open-next/server-functions/default/packages/gitbook/handler.mjs'
    );
    const metafilePath = `${handlerPath}.meta.json`;
    const metafile = (await file(metafilePath).json()) as {
        outputs: Record<string, { inputs: Record<string, { bytesInOutput: number }> }>;
    };
    const [outputPath] = Object.keys(metafile.outputs);
    if (!outputPath) {
        throw new Error(`No output found in metafile: ${metafilePath}`);
    }
    const output = metafile.outputs[outputPath];
    if (!output) {
        throw new Error(`Missing output in metafile: ${outputPath}`);
    }
    const shikiBytes = Object.entries(output.inputs).reduce(
        (total, [path, input]) =>
            path.includes('@shikijs/langs') ? total + input.bytesInOutput : total,
        0
    );

    return {
        handlerBytes: (await stat(handlerPath)).size,
        shikiLanguageBytes: shikiBytes,
    };
}
