/*
 * Demo on how to proxy requests to the renderer with a given space ID and a base path.
 */

const spaceId = Bun.argv[2];
const basePath = Bun.argv[3] ?? '';
const port = 5000;

if (!spaceId) {
    throw new Error('Please provide a space id as an argument');
}

console.log(`Proxying space ${spaceId} on http://localhost:${port}/${basePath}`);

Bun.serve({
    port,
    fetch: async (req) => {
        const url = new URL(req.url);
        const upUrl = isNextUrl(url)
            ? `http://localhost:3000${url.pathname}`
            : `http://localhost:3000/${spaceId}${url.pathname}`;

        const headers = new Headers(req.headers);

        headers.set('x-gitbook-host', url.host);
        headers.set('x-gitbook-basepath', basePath);

        const response = await fetch(upUrl, {
            method: req.method,
            headers: headers,
            verbose: true,
        });
        const body = await response.text();

        return new Response(body, {
            status: response.status,
            headers: {
                'content-type': response.headers.get('content-type') || 'text/html',
            },
        });
    },
});

function isNextUrl(url: URL) {
    return url.pathname.startsWith('/_next/');
}
