import { describe, expect, it } from 'bun:test';

import type { OpenAPIOperationData } from '../types';
import { buildTryItOperation } from './buildTryItOperation';
import { type TryItValues, authKey, buildTryItRequest, toProxyRequest } from './request';

function operationData(overrides: Partial<OpenAPIOperationData> = {}): OpenAPIOperationData {
    return {
        path: '/pets/{petId}',
        method: 'post',
        servers: [
            { url: 'https://{region}.example.com/v1/', variables: { region: { default: 'eu' } } },
        ],
        securities: [
            ['bearer', { type: 'http', scheme: 'bearer' }],
            ['key', { type: 'apiKey', name: 'api_key', in: 'query' }],
        ],
        operation: {
            security: [{ bearer: [] }, { key: [] }],
            parameters: [
                { name: 'petId', in: 'path', schema: { type: 'string' }, example: '42' },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                {
                    name: 'sort',
                    in: 'query',
                    required: true,
                    schema: { type: 'string', enum: ['asc', 'desc'] },
                },
                { name: 'X-Trace', in: 'header', schema: { type: 'string' } },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: { name: { type: 'string', example: 'Rex' } },
                        },
                    },
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            required: ['photo'],
                            properties: {
                                caption: { type: 'string' },
                                photo: { type: 'string', format: 'binary' },
                                id: { type: 'string', readOnly: true },
                            },
                        },
                    },
                },
            },
            responses: {},
        },
        ...overrides,
    } as OpenAPIOperationData;
}

function values(data: OpenAPIOperationData, overrides: Partial<TryItValues> = {}): TryItValues {
    const operation = buildTryItOperation(data);
    return {
        server: data.servers[0],
        serverVariables: {},
        schemes: [],
        auth: {},
        parameters: {},
        mediaType: operation.body?.mediaTypes[0],
        bodyText: '',
        bodyFields: {},
        bodyFiles: {},
        ...overrides,
    };
}

describe('buildTryItOperation', () => {
    it('describes parameters with their defaults, placeholders and enums', () => {
        const operation = buildTryItOperation(operationData());
        expect(operation.parameters).toEqual([
            {
                name: 'petId',
                in: 'path',
                required: true,
                description: undefined,
                placeholder: '42',
                defaultValue: '42',
            },
            {
                name: 'limit',
                in: 'query',
                required: false,
                description: undefined,
                placeholder: '10',
                defaultValue: '10',
            },
            {
                name: 'sort',
                in: 'query',
                required: true,
                description: undefined,
                enum: ['asc', 'desc'],
                placeholder: 'asc',
            },
            {
                name: 'X-Trace',
                in: 'header',
                required: false,
                description: undefined,
                placeholder: 'string',
            },
        ]);
    });

    it('turns JSON bodies into editable text and multipart bodies into fields', () => {
        const { body } = buildTryItOperation(operationData());
        expect(body?.required).toBe(true);

        const [json, multipart] = body?.mediaTypes ?? [];
        expect(json?.kind).toBe('raw');
        expect(JSON.parse(json?.examples[0]?.value ?? '')).toEqual({ name: 'Rex' });

        expect(multipart?.kind).toBe('multipart');
        expect(
            multipart?.fields.map((field) => [field.name, field.required, field.binary])
        ).toEqual([
            ['caption', false, false],
            ['photo', true, true],
        ]);
    });

    it('lists each security requirement as an option', () => {
        const { securityOptions } = buildTryItOperation(operationData());
        expect(securityOptions).toEqual([
            { label: 'bearer', schemes: ['bearer'] },
            { label: 'key', schemes: ['key'] },
        ]);
    });

    it('keeps the operation-level parameter when the path item defines the same one', () => {
        const data = operationData();
        data.operation.parameters = [
            { name: 'petId', in: 'path', description: 'path item' },
            { name: 'petId', in: 'path', description: 'operation' },
        ];
        const { parameters } = buildTryItOperation(data);
        expect(parameters).toHaveLength(1);
        expect(parameters[0]?.description).toBe('operation');
    });
});

describe('buildTryItRequest', () => {
    const data = operationData();
    const operation = buildTryItOperation(data);
    const [bearer, key] = data.securities;

    it('builds the URL, headers and JSON body', () => {
        const request = buildTryItRequest(
            operation,
            values(data, {
                serverVariables: { region: 'us' },
                schemes: bearer ? [bearer] : [],
                auth: { [authKey('bearer')]: 'secret' },
                parameters: {
                    'path:petId': 'a b',
                    'query:sort': 'desc',
                    'header:X-Trace': 'abc',
                },
                bodyText: '{"name":"Rex"}',
            })
        );

        expect(request).toEqual({
            url: 'https://us.example.com/v1/pets/a%20b?sort=desc',
            method: 'POST',
            headers: {
                'X-Trace': 'abc',
                Authorization: 'Bearer secret',
                'Content-Type': 'application/json',
            },
            body: '{"name":"Rex"}',
            cookies: '',
            missing: [],
        });
    });

    it('reports empty required fields', () => {
        const request = buildTryItRequest(operation, values(data));
        expect(request.missing).toEqual(['petId', 'sort', 'body']);
    });

    it('puts query API keys in the query string', () => {
        const request = buildTryItRequest(
            operation,
            values(data, {
                schemes: key ? [key] : [],
                auth: { [authKey('key')]: 'k' },
                parameters: { 'path:petId': '1', 'query:sort': 'asc' },
                bodyText: '{}',
            })
        );
        expect(request.url).toBe('https://eu.example.com/v1/pets/1?sort=asc&api_key=k');
    });

    it('encodes basic auth as UTF-8', () => {
        const request = buildTryItRequest(
            operation,
            values(data, {
                schemes: [['basic', { type: 'http', scheme: 'basic' }]],
                auth: { [authKey('basic', 'username')]: 'é', [authKey('basic', 'password')]: 'p' },
            })
        );
        expect(request.headers.Authorization).toBe(`Basic ${btoa('Ã©:p')}`);
    });

    it('sends multipart bodies without a Content-Type so the browser adds the boundary', () => {
        const multipart = operation.body?.mediaTypes[1];
        const photo = new File(['x'], 'photo.png');
        const request = buildTryItRequest(
            operation,
            values(data, {
                mediaType: multipart,
                parameters: { 'path:petId': '1', 'query:sort': 'asc' },
                bodyFields: { caption: 'hi' },
                bodyFiles: { photo: [photo] },
            })
        );
        expect(request.headers['Content-Type']).toBeUndefined();
        expect(request.body).toBeInstanceOf(FormData);
        const form = request.body as FormData;
        expect(form.get('caption')).toBe('hi');
        expect(form.get('photo')).toBeInstanceOf(File);
    });

    it('routes through the proxy and forwards cookies in a header', () => {
        const proxied = toProxyRequest(
            {
                url: 'https://api.example.com/x?a=1',
                method: 'GET',
                headers: {},
                body: undefined,
                cookies: 'session=1',
                missing: [],
            },
            'https://app.gitbook.com/~scalar/proxy?token=t&site_id=s'
        );
        const url = new URL(proxied.url);
        expect(url.searchParams.get('scalar_url')).toBe('https://api.example.com/x?a=1');
        expect(url.searchParams.get('token')).toBe('t');
        expect(proxied.headers['X-Scalar-Cookie']).toBe('session=1');
    });

    it('repeats exploded array query parameters', () => {
        const arrays = operationData();
        arrays.operation.parameters = [
            { name: 'id', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
            {
                name: 'tag',
                in: 'query',
                explode: false,
                schema: { type: 'array', items: { type: 'string' } },
            },
        ];
        arrays.operation.requestBody = undefined;
        const request = buildTryItRequest(
            buildTryItOperation(arrays),
            values(arrays, { parameters: { 'query:id': '1, 2', 'query:tag': 'a,b' } })
        );
        expect(request.url).toBe('https://eu.example.com/v1/pets/{petId}?id=1&id=2&tag=a%2Cb');
    });

    it('lets auth replace a header parameter of the same name, whatever its case', () => {
        const withHeader = operationData();
        withHeader.operation.parameters = [{ name: 'authorization', in: 'header' }];
        withHeader.operation.requestBody = undefined;
        const request = buildTryItRequest(
            buildTryItOperation(withHeader),
            values(withHeader, {
                schemes: bearer ? [bearer] : [],
                auth: { [authKey('bearer')]: 'secret' },
                parameters: { 'header:authorization': 'manual' },
            })
        );
        expect(request.headers).toEqual({ Authorization: 'Bearer secret' });
    });

    it('never sends a multipart Content-Type without a boundary', () => {
        const opaque = operationData();
        opaque.operation.requestBody = {
            content: { 'multipart/form-data': { schema: { type: 'object' } } },
        };
        const operation = buildTryItOperation(opaque);
        expect(operation.body?.mediaTypes[0]?.kind).toBe('raw');
        const request = buildTryItRequest(
            operation,
            values(opaque, { parameters: { 'path:petId': '1' }, bodyText: 'x' })
        );
        expect(request.headers['Content-Type']).toBeUndefined();
    });
});
