import { expect, it } from 'bun:test';
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { getContentTestURL } from './utils';

it(
    'should expose a MCP server',
    async () => {
        const client = new Client({
            name: 'test',
            version: '1.0.0',
        });

        await client.connect(
            new StreamableHTTPClientTransport(
                new URL(getContentTestURL('https://gitbook.com/docs/~gitbook/mcp'))
            )
        );

        const tools = await client.listTools();
        expect(tools.tools[0]?.name).toBe('searchDocumentation');

        const response = await client.callTool({
            name: 'searchDocumentation',
            arguments: {
                query: 'git',
            },
        });

        // @ts-expect-error - response.content is of type unknown
        expect(response.content[0]?.text).toContain('Title:');
    },
    { timeout: 10_000 }
);

it(
    'should expose a MCP server on the authenticated path',
    async () => {
        const client = new Client({
            name: 'test',
            version: '1.0.0',
        });

        await client.connect(
            new StreamableHTTPClientTransport(
                new URL(getContentTestURL('https://gitbook.com/docs/~gitbook/mcp/auth'))
            )
        );

        const tools = await client.listTools();
        expect(tools.tools[0]?.name).toBe('searchDocumentation');
        expect(tools.tools[1]?.name).toBe('getPage');
    },
    { timeout: 10_000 }
);

it(
    'should get a page from another site space through MCP',
    async () => {
        const client = new Client({
            name: 'test',
            version: '1.0.0',
        });

        await client.connect(
            new StreamableHTTPClientTransport(
                new URL(
                    getContentTestURL(
                        'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/~gitbook/mcp/auth'
                    )
                )
            )
        );

        const response = await client.callTool({
            name: 'getPage',
            arguments: {
                url: 'https://gitbook-open-e2e-sites.gitbook.io/api-multi-versions-share-links/8tNo6MeXg7CkFMzSSz81/3.0/other-page',
            },
        });

        // @ts-expect-error - response.content is of type unknown
        expect(response.content[0]?.text).toContain('# Other Page');
    },
    { timeout: 15_000 }
);
