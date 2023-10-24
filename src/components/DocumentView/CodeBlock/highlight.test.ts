import { highlight } from './highlight';
import { it } from 'bun:test';

it('should parse plain code', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ text: 'console.log("Hello World")' }],
                    },
                ],
            },
        ],
    });
});

it.only('should parse a multilines plain code', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ text: 'if (value === true) {' }],
                    },
                ],
            },
            {
                object: 'block',
                type: 'code-line',
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ text: '  console.log("Hello World")' }],
                    },
                ],
            },
            {
                object: 'block',
                type: 'code-line',
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ text: '}' }],
                    },
                ],
            },
        ],
    });
});

it('should parse code with an inline', async () => {
    const tokens = await highlight({
        object: 'block',
        type: 'code',
        nodes: [
            {
                object: 'block',
                type: 'code-line',
                nodes: [
                    {
                        object: 'text',
                        leaves: [{ text: 'console.' }],
                    },
                    {
                        object: 'inline',
                        type: 'annotation',
                        nodes: [
                            {
                                object: 'text',
                                leaves: [{ text: 'log' }],
                            },
                        ],
                    },
                    {
                        object: 'text',
                        leaves: [{ text: '("Hello World")' }],
                    },
                ],
            },
        ],
    });
});
