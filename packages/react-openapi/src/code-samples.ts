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
        id: 'javascript',
        label: 'JavaScript',
        syntax: 'javascript',
        generate: ({ method, url, headers, body }) => {
            let code = '';

            code += `const response = await fetch('${url}', {
    method: '${method.toUpperCase()}',\n`;

            if (headers) {
                code += indent(`headers: ${JSON.stringify(headers, null, 2)},\n`, 4);
            }

            if (body) {
                code += indent(`body: JSON.stringify(${JSON.stringify(body, null, 2)}),\n`, 4);
            }

            code += `});\n`;
            code += `const data = await response.json();`;

            return code;
        },
    },
    {
        id: 'curl',
        label: 'Curl',
        syntax: 'bash',
        generate: ({ method, url, headers, body }) => {
            const separator = ' \\\n';

            const lines: string[] = ['curl -L'];

            if (method.toUpperCase() !== 'GET') {
                lines.push(`-X ${method.toUpperCase()}`);
            }

            if (headers) {
                Object.entries(headers).forEach(([key, value]) => {
                    lines.push(`-H '${key}: ${value}'`);
                });
            }

            lines.push(`'${url}'`);

            if (body) {
                lines.push(`-d '${JSON.stringify(body)}'`);
            }

            return lines.map((line, index) => (index > 0 ? indent(line, 2) : line)).join(separator);
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
                code += indent(`headers=${JSON.stringify(headers)},\n`, 4);
            }
            if (body) {
                code += indent(`json=${JSON.stringify(body)}\n`, 4);
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
        generate: ({ method, url, headers = {}, body }) => {
            const urlObj = new URL(url);
            const path = urlObj.pathname || '/';

            if (body) {
                // if we had a body add a content length header
                const bodyContent = body ? JSON.stringify(body) : '';
                headers = {
                    ...headers,
                    'Content-Length': Buffer.from(bodyContent).length.toString(),
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

            const bodyString = body ? `\n${JSON.stringify(body, null, 2)}` : '';

            const httpRequest = `${method.toUpperCase()} ${decodeURI(path)} HTTP/1.1
Host: ${urlObj.host}
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
