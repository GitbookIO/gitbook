import { stringifyOpenAPI } from './stringifyOpenAPI';
import { HarRequest, snippetz } from '@scalar/snippetz';
export type { Request as HarRequest } from 'har-format';

export interface CodeSampleInput {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
}

interface CodeSampleGenerator {
    id: string;
    label: string;
    syntax: string;
    generate: (operation: CodeSampleInput) => string;
}

export const codeSampleGenerators: CodeSampleGenerator[] = [
    {
        id: 'curl',
        label: 'cURL',
        syntax: 'bash',
        generate: (props) => {
            return snippetz().print('shell', 'curl', getSnippetzOptions(props)) ?? '';
        },
    },
    {
        id: 'javascript',
        label: 'JavaScript',
        syntax: 'javascript',
        generate: (props) => {
            return snippetz().print('js', 'fetch', getSnippetzOptions(props)) ?? '';
        },
    },
    {
        id: 'python',
        label: 'Python',
        syntax: 'python',
        generate: (props) => {
            return snippetz().print('python', 'requests', getSnippetzOptions(props)) ?? '';
        },
    },
    {
        id: 'http',
        label: 'HTTP',
        syntax: 'bash',
        generate: (props) => {
            return snippetz().print('http', 'http1.1', getSnippetzOptions(props)) ?? '';
        },
    },
];

function getSnippetzOptions({ method, url, headers, body }: CodeSampleInput): Partial<HarRequest> {
    // Check if the URL is valid and parse it
    try {
        new URL(url);
    } catch (e) {
        url = 'http://api_url' + url;
    }

    return {
        method,
        url: url,
        headers: Object.entries(headers ?? {}).map(([key, value]) => ({
            name: key,
            value,
        })),
        postData: {
            mimeType: headers?.['Content-Type'] ?? '',
            text: body ? stringifyOpenAPI(body, null, 2) : '',
        },
    };
}

export function parseHostAndPath(url: string) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname || '/';
        return { host: urlObj.host, path };
    } catch (e) {
        // If the URL was invalid do our best to parse the URL.
        // Check for the protocol part and pull it off to grab the host
        const splitted = url.split('//');
        const fullUrl = splitted[1] ? splitted[1] : url;

        // separate paths from the first element (host)
        const parts = fullUrl.split('/');
        // pull off the host (mutates)
        const host = parts.shift();
        // add a leading slash and join the paths again
        const path = '/' + parts.join('/');

        return { host, path };
    }
}
