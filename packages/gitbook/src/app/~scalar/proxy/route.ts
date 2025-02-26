import { NextRequest, NextResponse } from 'next/server';

type ProxyRequest = {
    url: string;
    method: string;
    headers: Record<string, string>;
    data: Record<string, any>;
};

export const runtime = 'edge';

/**
 * Taken from https://github.com/scalar/scalar/tree/main/packages/api-client-proxy
 */
export async function POST(req: NextRequest) {
    const requestBody: ProxyRequest = await req.json();

    const isGetOrHeadRequest = ['get', 'head'].includes(requestBody.method.trim().toLowerCase());
    const body = isGetOrHeadRequest
        ? null
        : requestBody.data
          ? JSON.stringify(requestBody.data)
          : null;

    // Default options are marked with *
    try {
        const response = await fetch(requestBody.url.trim(), {
            // *GET, POST, PUT, DELETE, etc.
            method: requestBody.method.trim(),
            // no-cors, *cors, same-origin
            // mode: 'cors', // Not supported on Cloudflare Workers
            // *default, no-cache, reload, force-cache, only-if-cached
            // cache: 'no-cache', // Not supported on Cloudflare Workers
            // include, *same-origin, omit
            // credentials: 'include', // Not supported on Cloudflare Workers
            headers: requestBody.headers,
            // manual, *follow, error
            redirect: 'follow',
            // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            // referrerPolicy: 'no-referrer', // Not supported on Cloudflare Workers
            // body data type must match "Content-Type" header
            body,
        });

        const headers: Record<string, string> = {};

        const proxyHeaders = [...response.headers];
        proxyHeaders.forEach(([key, value]) => {
            if (['access-control-allow-origin'].includes(key.toLowerCase())) {
                return;
            }

            headers[key] = value;
        });

        const text = await response.text();

        return NextResponse.json({
            statusCode: response.status,
            // TODO: Do we need body?
            // body: …
            data: text,
            headers: {
                ...headers,
                'X-API-Client-Content-Length': text.length,
            },
            // TODO: transform cookie data
            cookies: response.headers.get('cookies'),
        });
    } catch (error) {
        console.error(
            'Scalar API Client Proxy Error',
            (error as Error).stack ?? (error as Error).message ?? error,
        );
        return NextResponse.json({
            data: 'Scalar API Client Proxy Error',
        });
    }
}
