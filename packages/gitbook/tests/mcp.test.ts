import { expect, it } from 'bun:test';
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { getContentTestURL } from './utils';

it('should expose a MCP server', async () => {
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
});
