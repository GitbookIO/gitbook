import { describe, expect, it } from 'bun:test';
import { type CodeSampleInput, codeSampleGenerators, parseHostAndPath } from './code-samples';

it('should parse host and path on url strings properly', () => {
    const testUrls = [
        '//example.com/path',
        '//sub.example.com',
        '//example:8080/v1/test',
        'ftp://domain.com',
        '//example.com/com.example',
        'https://example.com/path.com/another.com',
        'example.com/firstPath/secondPath',
    ];

    expect(testUrls.map(parseHostAndPath)).toEqual([
        {
            host: 'example.com',
            path: '/path',
        },

        {
            host: 'sub.example.com',
            path: '/',
        },

        {
            host: 'example:8080',
            path: '/v1/test',
        },

        {
            host: 'domain.com',
            path: '/',
        },

        {
            host: 'example.com',
            path: '/com.example',
        },

        {
            host: 'example.com',
            path: '/path.com/another.com',
        },

        {
            host: 'example.com',
            path: '/firstPath/secondPath',
        },
    ]);
});

describe('curL code sample generator', () => {
    const generator = codeSampleGenerators.find((g) => g.id === 'curl');

    expect(generator).toBeDefined();

    it('should format application/x-www-form-urlencoded body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: application/x-www-form-urlencoded' \\\n  --data 'key=value'"
        );
    });

    it('should format application/json body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: application/json' \\\n  --data '{\n    \"key\": \"value\"\n  }'"
        );
    });

    it('should format application/xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '<key>value</key>',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: application/xml' \\\n  --data-binary $'<key>value</key>'"
        );
    });

    it('should convert json to xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '{ "key": "value" }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: application/xml' \\\n  --data-binary $'<?xml version=1.0?>\n  <key>value</key>\n  '"
        );
    });

    it('should format application/graphql body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/graphql',
            },
            body: '{ key }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: application/json' \\\n  --data '\"{ key }\"'"
        );
    });

    it('should format text/csv body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/csv',
            },
            body: 'key,value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: text/csv' \\\n  --data-binary $'key,value'"
        );
    });

    it('should format application/pdf body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/pdf',
            },
            body: 'file',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: application/pdf' \\\n  --data-binary '@file'"
        );
    });

    it('should format text/plain body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: text/plain' \\\n  --data 'value'"
        );
    });

    it('should format multipart/form-data body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            "curl -L \\\n  --url 'https://example.com/path' \\\n  --header 'Content-Type: multipart/form-data' \\\n  --form 'key=value'"
        );
    });
});

describe('javascript code sample generator', () => {
    const generator = codeSampleGenerators.find((g) => g.id === 'javascript');

    expect(generator).toBeDefined();

    it('should format application/x-www-form-urlencoded body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const params = new URLSearchParams();\n\nparams.append("key", "value");\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "application/x-www-form-urlencoded"\n    },\n    body: params.toString()\n});\n\nconst data = await response.json();'
        );
    });

    it('should format application/json body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "application/json"\n    },\n    body: JSON.stringify({\n      "key": "value"\n    })\n});\n\nconst data = await response.json();'
        );
    });

    it('should format application/xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '<key>value</key>',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const xml = `\n    <key>value</key>`;\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "application/xml"\n    },\n    body: xml\n});\n\nconst data = await response.json();'
        );
    });

    it('should convert json to xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '{ "key": "value" }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const xml = `\n    <?xml version=1.0?>\n    <key>value</key>\n`;\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "application/xml"\n    },\n    body: xml\n});\n\nconst data = await response.json();'
        );
    });

    it('should format application/graphql body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/graphql',
            },
            body: '{ key }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const query = `\n    { key }`;\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "application/graphql"\n    },\n    body: JSON.stringify(query)\n});\n\nconst data = await response.json();'
        );
    });

    it('should format text/csv body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/csv',
            },
            body: 'key,value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const csv = `\n    key,value`;\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "text/csv"\n    },\n    body: csv\n});\n\nconst data = await response.json();'
        );
    });

    it('should format application/pdf body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/pdf',
            },
            body: 'file',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const formData = new FormData();\n\nformData.append("file", "file");\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "application/pdf"\n    },\n    body: formData\n});\n\nconst data = await response.json();'
        );
    });

    it('should format text/plain body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "text/plain"\n    },\n    body: "value"\n});\n\nconst data = await response.json();'
        );
    });

    it('should format multipart/form-data body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'const formData = new FormData();\n\nformData.append("key", "value");\n\nconst response = await fetch(\'https://example.com/path\', {\n    method: \'GET\',\n    headers: {\n      "Content-Type": "multipart/form-data"\n    },\n    body: formData\n});\n\nconst data = await response.json();'
        );
    });
});

describe('python code sample generator', () => {
    const generator = codeSampleGenerators.find((g) => g.id === 'python');

    expect(generator).toBeDefined();

    it('should format application/x-www-form-urlencoded body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"application/x-www-form-urlencoded"},\n    data={"key":"value"}\n)\n\ndata = response.json()'
        );
    });

    it('should format application/json body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"application/json"},\n    data={"key":"value"}\n)\n\ndata = response.json()'
        );
    });

    it('should format application/xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '<key>value</key>',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"application/xml"},\n    data="<key>value</key>"\n)\n\ndata = response.json()'
        );
    });

    it('should convert json to xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '{ "key": "value" }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"application/xml"},\n    data="<?xml version=1.0?>\\n<key>value</key>\\n"\n)\n\ndata = response.json()'
        );
    });

    it('should format application/graphql body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/graphql',
            },
            body: '{ key }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"application/graphql"},\n    data="{ key }"\n)\n\ndata = response.json()'
        );
    });

    it('should format text/csv body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/csv',
            },
            body: 'key,value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"text/csv"},\n    data="key,value"\n)\n\ndata = response.json()'
        );
    });

    it('should format application/pdf body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/pdf',
            },
            body: 'file',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nfiles = {\n    "file": "file",\n}\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"application/pdf"},\n    files=files\n)\n\ndata = response.json()'
        );
    });

    it('should format text/plain body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"text/plain"},\n    data="value"\n)\n\ndata = response.json()'
        );
    });

    it('should format multipart/form-data body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'import requests\n\nfiles = {\n    "key": "value",\n}\n\nresponse = requests.get(\n    "https://example.com/path",\n    headers={"Content-Type":"multipart/form-data"},\n    files=files\n)\n\ndata = response.json()'
        );
    });
});

describe('http code sample generator', () => {
    const generator = codeSampleGenerators.find((g) => g.id === 'http');

    expect(generator).toBeDefined();

    it('should format application/x-www-form-urlencoded body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 15\nAccept: */*\n\n"key=\'value\'"'
        );
    });

    it('should format application/json body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: application/json\nContent-Length: 15\nAccept: */*\n\n{\n  "key": "value"\n}'
        );
    });

    it('should format application/xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '<key>value</key>',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: application/xml\nContent-Length: 18\nAccept: */*\n\n"<key>value</key>"'
        );
    });

    it('should convert json to xml body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/xml',
            },
            body: '{ "key": "value" }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: application/xml\nContent-Length: 24\nAccept: */*\n\n"<?xml version=1.0?>\n<key>value</key>\n"'
        );
    });

    it('should format application/graphql body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/graphql',
            },
            body: '{ key }',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: application/graphql\nContent-Length: 9\nAccept: */*\n\n"{ key }"'
        );
    });

    it('should format text/csv body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/csv',
            },
            body: 'key,value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: text/csv\nContent-Length: 11\nAccept: */*\n\n"key,value"'
        );
    });

    it('should format application/pdf body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'application/pdf',
            },
            body: 'file',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: application/pdf\nContent-Length: 6\nAccept: */*\n\n"file"'
        );
    });

    it('should format text/plain body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'value',
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: text/plain\nContent-Length: 7\nAccept: */*\n\n"value"'
        );
    });

    it('should format multipart/form-data body properly', () => {
        const input: CodeSampleInput = {
            method: 'GET',
            url: 'https://example.com/path',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: {
                key: 'value',
            },
        };

        const output = generator?.generate(input);

        expect(output).toBe(
            'GET /path HTTP/1.1\nHost: example.com\nContent-Type: multipart/form-data\nContent-Length: 15\nAccept: */*\n\n{\n  "key": "value"\n}'
        );
    });
});
