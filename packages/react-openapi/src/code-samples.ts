import { stringifyOpenAPI } from './stringifyOpenAPI';

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
        generate: ({ method, url, headers, body }) => {
            const separator = ' \\\n';

            const lines: string[] = ['curl -L'];

            if (method.toUpperCase() !== 'GET') {
                lines.push(`--request ${method.toUpperCase()}`);
            }

            lines.push(`--url '${url}'`);

            if (headers) {
                Object.entries(headers).forEach(([key, value]) => {
                    lines.push(`--header '${key}: ${value}'`);
                });
            }

            if (body && Object.keys(body).length > 0) {
                lines.push(`--data '${stringifyOpenAPI(body)}'`);
            }

            return lines.map((line, index) => (index > 0 ? indent(line, 2) : line)).join(separator);
        },
    },
    {
        id: 'javascript',
        label: 'JavaScript',
        syntax: 'javascript',
        generate: ({ method, url, headers, body }) => {
            let code = '';

            code += `const response = await fetch('${url}', {
    method: '${method.toUpperCase()}',\n`;

            if (headers) {
                code += indent(`headers: ${stringifyOpenAPI(headers, null, 2)},\n`, 4);
            }

            if (body) {
                code += indent(`body: JSON.stringify(${stringifyOpenAPI(body, null, 2)}),\n`, 4);
            }

            code += `});\n`;
            code += `const data = await response.json();`;

            return code;
        },
    },
    {
        id: 'python',
        label: 'Python',
        syntax: 'python',
        generate: ({ method, url, headers, body }) => {
            let code = 'import requests\n\n';
            code += `response = requests.${method.toLowerCase()}(\n`;
            code += indent(`"${url}",\n`, 4);
            if (headers) {
                code += indent(`headers=${stringifyOpenAPI(headers)},\n`, 4);
            }
            if (body) {
                code += indent(`json=${stringifyOpenAPI(body)}\n`, 4);
            }
            code += ')\n';
            code += `data = response.json()`;
            return code;
        },
    },
    {
        id: 'http',
        label: 'HTTP',
        syntax: 'bash',
        generate: ({ method, url, headers = {}, body }: CodeSampleInput) => {
            const { host, path } = parseHostAndPath(url);

            if (body) {
                // if we had a body add a content length header
                const bodyContent = body ? stringifyOpenAPI(body) : '';
                // handle unicode chars with a text encoder
                const encoder = new TextEncoder();

                headers = {
                    ...headers,
                    'Content-Length': encoder.encode(bodyContent).length.toString(),
                };
            }

            if (!headers.hasOwnProperty('Accept')) {
                headers.Accept = '*/*';
            }

            const headerString = headers
                ? Object.entries(headers)
                      .map(([key, value]) =>
                          key.toLowerCase() !== 'host' ? `${key}: ${value}` : ``,
                      )
                      .join('\n') + '\n'
                : '';

            const bodyString = body ? `\n${stringifyOpenAPI(body, null, 2)}` : '';

            const httpRequest = `${method.toUpperCase()} ${decodeURI(path)} HTTP/1.1
Host: ${host}
${headerString}${bodyString}`;

            return httpRequest;
        },
    },
];

function indent(code: string, spaces: number) {
    const indent = ' '.repeat(spaces);
    return code
        .split('\n')
        .map((line) => (line ? indent + line : ''))
        .join('\n');
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
