import {
    isFormData,
    isPDF,
    isFormUrlEncoded,
    isText,
    isXML,
    isCSV,
    isGraphQL,
    isPlainObject,
} from './code-samples/contentTypeChecks';
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

            const contentType = (headers && headers['Content-Type']) || '';

            if (body && Object.keys(body).length > 0) {
                const bodyContent = BodyGenerators.getCurlBody(body, contentType);

                if (!bodyContent) {
                    return '';
                }

                if (Array.isArray(bodyContent)) {
                    lines.push(...bodyContent);
                } else {
                    lines.push(bodyContent);
                }
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

            if (body) {
                const lines = BodyGenerators.getJavaScriptBody(body, headers);

                if (!lines) {
                    return '';
                }

                // add the generated code to the top
                code += lines.code;
                body = lines.body;
                headers = lines.headers;
            }

            code += `const response = await fetch('${url}', {
    method: '${method.toUpperCase()}',\n`;

            if (headers) {
                code += indent(`headers: ${stringifyOpenAPI(headers, null, 2)},\n`, 4);
            }

            if (body) {
                code += indent(`body: ${body}\n`, 4);
            }

            code += `});\n\n`;
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

            if (body) {
                const lines = BodyGenerators.getPythonBody(body, headers);

                if (!lines) {
                    return '';
                }

                // add the generated code to the top
                code += lines.code;
                body = lines.body;
                headers = lines.headers;
            }

            code += `response = requests.${method.toLowerCase()}(\n`;
            code += indent(`"${url}",\n`, 4);

            if (headers) {
                code += indent(`headers=${stringifyOpenAPI(headers)},\n`, 4);
            }

            if (body) {
                if (body === 'files') {
                    code += indent(`files=${body}\n`, 4);
                } else {
                    code += indent(`data=${stringifyOpenAPI(body)}\n`, 4);
                }
            }

            code += ')\n\n';
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

                const contentType = (headers && headers['Content-Type']) || '';

                const bodyString = BodyGenerators.getHTTPBody(body, contentType);

                if (bodyString) {
                    body = bodyString;
                }

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

// Body Generators
const BodyGenerators = {
    getCurlBody(body: any, contentType: string): string | string[] | undefined {
        if (!body) return undefined;

        // If the content type is form data and the body is a plain object, convert it to curl form data
        if (isFormData(contentType) && isPlainObject(body)) {
            return Object.entries(body).map(([key, value]) => `--form '${key}=${String(value)}'`);
        }

        const typeHandlers = {
            pdf: () => `--data-binary '@${body}'`,
            formUrlEncoded: () => {
                const encoded = isPlainObject(body)
                    ? Object.entries(body)
                          .map(([key, value]) => `${key}=${String(value)}`)
                          .join('&')
                    : String(body);
                return `--data '${encoded}'`;
            },
            text: () => `--data '${String(body).replace(/"/g, '')}'`,
            xmlOrCsv: () => `--data-binary $'${stringifyOpenAPI(body).replace(/"/g, '')}'`,
            default: () => `--data '${stringifyOpenAPI(body)}'`,
        };

        if (isPDF(contentType)) return typeHandlers.pdf();
        if (isFormUrlEncoded(contentType)) return typeHandlers.formUrlEncoded();
        if (isText(contentType)) return typeHandlers.text();
        if (isXML(contentType) || isCSV(contentType)) {
            return typeHandlers.xmlOrCsv();
        }

        return typeHandlers.default();
    },
    getJavaScriptBody: (body: any, headers?: Record<string, string>) => {
        if (!body || !headers) return;

        let code = '';
        const contentType: string = headers['Content-Type'] || '';

        if (isFormData(contentType)) {
            code += 'const formData = new FormData();\n\n';
            if (isPlainObject(body)) {
                Object.entries(body).forEach(([key, value]) => {
                    code += `formData.append("${key}", "${String(value)}");\n`;
                });
            } else if (typeof body === 'string') {
                code += `formData.append("file", "${body}");\n`;
            }
            code += '\n';
            body = 'formData';
        }

        if (isFormUrlEncoded(contentType)) {
            code += 'const params = new URLSearchParams();\n\n';
            if (isPlainObject(body)) {
                Object.entries(body).forEach(([key, value]) => {
                    code += `params.append("${key}", "${String(value)}");\n`;
                });
            }
            code += '\n';
            body = 'params.toString()';
        }

        if (isGraphQL(contentType)) {
            headers['Content-Type'] = 'application/json';
            if (isPlainObject(body)) {
                Object.entries(body).forEach(([key, value]) => {
                    code += `const ${key} = \`${String(value)}\`;\n`;
                });
                body = 'JSON.stringify({ query, variables })';
            } else {
                code += `const query = \`${String(body)}\`;\n\n`;
                body = 'JSON.stringify(query)';
            }
        }

        if (isCSV(contentType)) {
            code += 'const csv = `\n';
            code += indent(String(body), 4);
            code += '`;\n\n';
            body = 'csv';
        }

        if (isPDF(contentType)) {
            code += 'const formData = new FormData();\n\n';
            code += `formData.append("file", "${body}");\n\n`;
            body = 'formData';
        }

        if (isXML(contentType)) {
            body = `\`${String(body)}\``;
        }

        body =
            typeof body === 'object'
                ? `JSON.stringify(${stringifyOpenAPI(body, null, 2)})`
                : isText(headers?.['Content-Type'])
                  ? stringifyOpenAPI(body, null, 2)
                  : body;
        return { body, code, headers };
    },
    getPythonBody: (body: any, headers?: Record<string, string>) => {
        if (!body || !headers) return;
        let code = '';
        const contentType: string = headers['Content-Type'] || '';

        if (isFormData(contentType)) {
            code += 'files = {\n';
            if (isPlainObject(body)) {
                Object.entries(body).forEach(([key, value]) => {
                    code += indent(`"${key}": "${String(value)}",`, 4) + '\n';
                });
            }
            code += '}\n\n';
            body = 'files';
        }

        if (isPDF(contentType)) {
            code += 'files = {\n';
            code += indent(`"file": "${body}",`, 4) + '\n';
            code += '}\n\n';
            body = 'files';
        }

        return { body, code, headers };
    },
    getHTTPBody: (body: any, contentType: string) => {
        if (!body) return undefined;

        const typeHandlers = {
            pdf: () => `\n${stringifyOpenAPI(body, null, 2)}`,
            formUrlEncoded: () => {
                const encoded = isPlainObject(body)
                    ? Object.entries(body)
                          .map(([key, value]) => `${key}=${String(value)}`)
                          .join('&')
                    : String(body);
                return `\n${encoded}`;
            },
            text: () => `\n${String(body).replace(/"/g, '')}`,
            xmlOrCsv: () => `\n${stringifyOpenAPI(body).replace(/"/g, '')}`,
            default: () => `\n${stringifyOpenAPI(body)}`,
        };

        if (isPDF(contentType)) return typeHandlers.pdf();
        if (isFormUrlEncoded(contentType)) return typeHandlers.formUrlEncoded();
        if (isText(contentType)) return typeHandlers.text();
        if (isXML(contentType) || isCSV(contentType)) {
            return typeHandlers.xmlOrCsv();
        }

        return typeHandlers.default();
    },
};
