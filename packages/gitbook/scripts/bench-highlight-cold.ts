import { spawn } from 'bun';

import type { DocumentBlockCode } from '@gitbook/api';

/**
 * Time the first highlights in fresh processes, where grammars and themes are loaded.
 * Usage: bun scripts/bench-highlight-cold.ts [runs]
 */

const SAMPLES: Record<string, string> = {
    javascript: 'const answer = await fetch("/api").then((r) => r.json());',
    python: 'def greet(name: str) -> str:\n    return f"Hello {name}"',
    vue: '<template><p>{{ msg }}</p></template>\n<script setup>\nconst msg = "hi";\n</script>',
};

function codeBlock(syntax: string, code: string): DocumentBlockCode {
    return {
        object: 'block',
        type: 'code',
        data: { syntax },
        nodes: code.split('\n').map((text) => ({
            object: 'block',
            type: 'code-line',
            data: {},
            nodes: [{ object: 'text', leaves: [{ object: 'leaf', marks: [], text }] }],
        })),
    } as DocumentBlockCode;
}

if (process.env.BENCH_CHILD) {
    const importStart = performance.now();
    const { highlight } = await import('../src/components/DocumentView/CodeBlock/highlight');
    const importMs = performance.now() - importStart;
    const start = performance.now();
    await Promise.all(
        Object.entries(SAMPLES).map(([syntax, code]) => highlight(codeBlock(syntax, code), []))
    );
    const firstMs = performance.now() - start;
    console.log(JSON.stringify({ importMs, firstMs, rssMB: process.memoryUsage().rss / 1e6 }));
} else {
    const runs = Number(process.argv[2] ?? 5);
    const results: { importMs: number; firstMs: number; rssMB: number }[] = [];
    for (let i = 0; i < runs; i++) {
        const child = spawn(['bun', import.meta.path], {
            env: { ...process.env, BENCH_CHILD: '1' },
            stdout: 'pipe',
        });
        results.push(JSON.parse(await new Response(child.stdout).text()));
    }
    const median = (values: number[]) =>
        values.sort((a, b) => a - b)[Math.floor(values.length / 2)]!;
    console.log(
        JSON.stringify({
            runs,
            importMsMedian: Math.round(median(results.map((r) => r.importMs))),
            firstHighlightMsMedian: Math.round(median(results.map((r) => r.firstMs))),
            rssMBMedian: Math.round(median(results.map((r) => r.rssMB))),
        })
    );
}
