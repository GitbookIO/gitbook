'use client';

import * as React from 'react';

// Subset of the WebMCP `ModelContext` interface (https://webmachinelearning.github.io/webmcp/).
type ModelContext = {
    registerTool: (
        tool: {
            name: string;
            description: string;
            inputSchema?: object;
            execute: (input: object, options?: { signal?: AbortSignal }) => Promise<unknown>;
        },
        options?: { signal?: AbortSignal }
    ) => Promise<void>;
};

/**
 * Expose the site's MCP tools (`~gitbook/mcp`) to browser agents through WebMCP, so anything
 * added to the server is automatically available to them. Renders nothing.
 */
export function WebMCP(props: { mcpURL: string }) {
    const { mcpURL } = props;

    React.useEffect(() => {
        const modelContext = (document as { modelContext?: ModelContext }).modelContext;
        if (!modelContext) {
            return;
        }

        // Aborting unregisters the tools and discards a load still in flight.
        const controller = new AbortController();
        const { signal } = controller;

        (async () => {
            // The MCP SDK is imported lazily: only agentic browsers pay for it.
            const [{ Client }, { StreamableHTTPClientTransport }] = await Promise.all([
                import('@modelcontextprotocol/sdk/client/index.js'),
                import('@modelcontextprotocol/sdk/client/streamableHttp.js'),
            ]);
            // Tagged so WebMCP calls are distinguishable in insights (the request URL is tracked).
            const url = new URL(mcpURL, window.location.href);
            url.searchParams.set('client', 'webmcp');
            const client = new Client({ name: 'gitbook-webmcp', version: '1.0.0' });
            await client.connect(new StreamableHTTPClientTransport(url));
            const { tools } = await client.listTools();
            if (signal.aborted) {
                return;
            }

            for (const tool of tools) {
                // Answer synthesis takes 20-30s and browser agents abort tool calls around 30s.
                if (tool.name === 'askQuestion') {
                    continue;
                }
                await modelContext.registerTool(
                    {
                        name: tool.name,
                        description: tool.description ?? tool.name,
                        inputSchema: tool.inputSchema,
                        // The MCP result (`content` blocks, plus `isError` on failure) is passed through.
                        execute: (input, options) =>
                            client.callTool(
                                { name: tool.name, arguments: input as Record<string, unknown> },
                                undefined,
                                { signal: options?.signal }
                            ),
                    },
                    { signal }
                );
            }
        })().catch((error) => {
            // oxlint-disable-next-line no-console
            console.warn('WebMCP: could not expose the site MCP tools', error);
        });

        return () => controller.abort();
    }, [mcpURL]);

    return null;
}
