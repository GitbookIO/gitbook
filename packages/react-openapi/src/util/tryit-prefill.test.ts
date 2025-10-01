import { describe, expect, it } from 'bun:test';
import type { PrefillInputContextData } from '../OpenAPIPrefillContextProvider';
import type { OpenAPIOperationData } from '../types';
import {
    resolvePrefillCodePlaceholderFromSecurityScheme,
    resolveTryItPrefillForOperation,
    resolveURLWithPrefillCodePlaceholdersFromServer,
} from './tryit-prefill';

describe('resolveTryItPrefillForOperation', () => {
    describe('prefill authentication info', () => {
        it('should resolve prefill for bearer token scheme', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces/<spaceId>',
                method: 'GET',
                operation: { summary: 'Get space by ID' },
                servers: [{ url: 'https://api.gitbook.com/v1/' }],
                securities: [
                    [
                        'apiTokenScheme',
                        {
                            type: 'http',
                            scheme: 'bearer',
                            'x-gitbook-prefill': '{{ visitor.claims.apiToken }}',
                        },
                    ],
                ],
            };

            const prefillInputContext: PrefillInputContextData = {
                visitor: { claims: { apiToken: 'gb_api_testToken' } },
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext,
            });

            expect(result).toEqual({
                authentication: {
                    securitySchemes: {
                        apiTokenScheme: { token: 'gb_api_testToken' },
                    },
                },
            });
        });

        it('should resolve prefill for basic auth scheme', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces',
                method: 'PUT',
                operation: { summary: 'Create space in an org' },
                servers: [{ url: 'https://api.gitbook.com/v1/' }],
                securities: [
                    [
                        'basicAuthScheme',
                        {
                            type: 'http',
                            scheme: 'basic',
                            'x-gitbook-prefill': '{{ visitor.claims.basicAuth }}',
                        },
                    ],
                ],
            };

            const prefillInputContext: PrefillInputContextData = {
                visitor: { claims: { basicAuth: 'testuser:testpassword' } },
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext,
            });

            expect(result).toEqual({
                authentication: {
                    securitySchemes: {
                        basicAuthScheme: { username: 'testuser', password: 'testpassword' },
                    },
                },
            });
        });

        it('should resolve prefill for apiKey scheme', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces/<spaceId>',
                method: 'POST',
                operation: { summary: 'Update space by ID' },
                servers: [{ url: 'https://api.gitbook.com/v1/' }],
                securities: [
                    [
                        'apiKeyHeader',
                        {
                            type: 'apiKey',
                            in: 'header',
                            name: 'X-API-KEY',
                            'x-gitbook-prefill': '{{ visitor.claims.apiKey }}',
                        },
                    ],
                ],
            };

            const prefillInputContext: PrefillInputContextData = {
                visitor: { claims: { apiKey: 'key-123' } },
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext,
            });

            expect(result).toEqual({
                authentication: {
                    securitySchemes: {
                        apiKeyHeader: { name: 'X-API-KEY', in: 'header', value: 'key-123' },
                    },
                },
            });
        });

        it('should return empty object if no visitor data matches prefill expression', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces',
                method: 'GET',
                operation: { summary: 'List all spaces in an org' },
                servers: [{ url: 'https://api.gitbook.com/v1/' }],
                securities: [
                    [
                        'bearer',
                        {
                            type: 'http',
                            scheme: 'bearer',
                            'x-gitbook-prefill': '{{ visitor.claims.missing }}',
                        },
                    ],
                ],
            };

            const prefillInputContext: PrefillInputContextData = {
                visitor: { claims: {} },
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext,
            });

            expect(result).toEqual({});
        });
    });

    describe('prefill server info', () => {
        it('should prefill server at url level', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces',
                method: 'GET',
                operation: { summary: 'List spaces in an org' },
                servers: [
                    {
                        url: 'https://api.gitbook.com/v1/',
                        description: 'GitBook API endpoint',
                        'x-gitbook-prefill': '{{ visitor.claims.api.endpointUrl }}',
                    },
                ],
                securities: [],
            };

            const prefillInputContext: PrefillInputContextData = {
                visitor: {
                    claims: { api: { endpointUrl: 'https://api.gitbook-staging.com/v1/' } },
                },
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext,
            });

            expect(result).toEqual({
                servers: [
                    {
                        url: 'https://api.gitbook-staging.com/v1/',
                        description: 'GitBook API endpoint',
                    },
                ],
            });
        });

        it('should prefill server at variables level', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces',
                method: 'GET',
                operation: { summary: 'List spaces in an org' },
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: {
                                default: 'gitbook.com',
                                'x-gitbook-prefill':
                                    '{{ visitor.claims.api.env === "staging" ?  "gitbook-staging.com" : "gitbook.com" }}',
                            },
                            version: {
                                default: 'v1',
                                'x-gitbook-prefill': '{{ visitor.claims.api.version }}',
                            },
                        },
                    },
                ],
                securities: [],
            };

            // Override env
            const overrideEnvResult = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext: { visitor: { claims: { api: { env: 'staging' } } } },
            });
            expect(overrideEnvResult).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: { default: 'gitbook-staging.com' },
                            version: { default: 'v1' },
                        },
                    },
                ],
            });

            // Override version
            const overrideVersionResult = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext: { visitor: { claims: { api: { version: 'v2' } } } },
            });
            expect(overrideVersionResult).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: { default: 'gitbook.com' },
                            version: { default: 'v2' },
                        },
                    },
                ],
            });

            // Override both
            const overrideBoth = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext: {
                    visitor: { claims: { api: { env: 'staging', version: 'v2' } } },
                },
            });
            expect(overrideBoth).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: { default: 'gitbook-staging.com' },
                            version: { default: 'v2' },
                        },
                    },
                ],
            });
        });

        it('should ignore server prefill when no matching visitor data', () => {
            const operation: OpenAPIOperationData = {
                path: '/orgs/<orgId>/spaces',
                method: 'GET',
                operation: { summary: 'List spaces in an org' },
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: {
                                default: 'gitbook.com',
                                'x-gitbook-prefill':
                                    '{{ visitor.claims.api.env === "staging" ?  "gitbook-staging.com" : "gitbook.com" }}',
                            },
                            version: {
                                default: 'v1',
                                'x-gitbook-prefill': '{{ visitor.claims.api.version }}',
                            },
                        },
                    },
                ],
                securities: [],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                prefillInputContext: { visitor: { claims: { isBetaUser: true } } },
            });

            expect(result).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: { default: 'gitbook.com' },
                            version: { default: 'v1' },
                        },
                    },
                ],
            });
        });
    });
});

describe('resolvePrefillCodePlaceholderFromSecurityScheme (integration style)', () => {
    it('should return placeholder for bearer token scheme', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'bearer',
                'x-gitbook-prefill': '{{ visitor.claims.apiToken }}',
            },
        });

        expect(result).toBe('$$__X-GITBOOK-PREFILL[(visitor.claims.apiToken)]__$$');
    });

    it('should return placeholder for basic auth scheme', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'basic',
                'x-gitbook-prefill': '{{ visitor.claims.basicAuth }}',
            },
        });

        expect(result).toBe('$$__X-GITBOOK-PREFILL[(visitor.claims.basicAuth)]__$$');
    });

    it('should build placeholder for apiKey scheme', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-KEY',
                'x-gitbook-prefill': '{{ visitor.claims.apiKey }}',
            },
        });

        expect(result).toBe('$$__X-GITBOOK-PREFILL[(visitor.claims.apiKey)]__$$');
    });

    it('should return placeholder with default value if provided', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'bearer',
                'x-gitbook-prefill': '{{ visitor.claims.missing }}',
            },
            defaultPlaceholderValue: 'YOUR_API_TOKEN',
        });

        expect(result).toBe(
            `$$__X-GITBOOK-PREFILL[(visitor.claims.missing) ?? 'YOUR_API_TOKEN']__$$`
        );
    });

    it('should concatenate text and expression in prefill', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'bearer',
                'x-gitbook-prefill': 'Bearer {{ visitor.claims.apiToken }}',
            },
        });

        expect(result).toBe('$$__X-GITBOOK-PREFILL[("Bearer " + visitor.claims.apiToken)]__$$');
    });

    it('should handle multiple expressions in prefill', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'basic',
                'x-gitbook-prefill': '{{ visitor.claims.username }}:{{ visitor.claims.password }}',
            },
        });

        expect(result).toBe(
            '$$__X-GITBOOK-PREFILL[(visitor.claims.username + ":" + visitor.claims.password)]__$$'
        );
    });

    it('should return empty default value if no prefill property exists', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'bearer',
            },
            defaultPlaceholderValue: 'YOUR_API_TOKEN',
        });

        expect(result).toBe('YOUR_API_TOKEN');
    });

    it('should return empty string if no prefill property exists', () => {
        const result = resolvePrefillCodePlaceholderFromSecurityScheme({
            security: {
                type: 'http',
                scheme: 'bearer',
            },
        });

        expect(result).toBe('');
    });
});

describe('resolveURLWithPrefillCodePlaceholdersFromServer', () => {
    it('should return a simple URL when no prefills are present', () => {
        const result = resolveURLWithPrefillCodePlaceholdersFromServer({
            url: 'https://api.example.com/v1',
        });

        expect(result).toBe('https://api.example.com/v1');
    });

    it('should replace a variable with its default when no prefill is set', () => {
        const result = resolveURLWithPrefillCodePlaceholdersFromServer({
            url: 'https://{region}.example.com',
            variables: {
                region: { default: 'us-east-1' },
            },
        });

        expect(result).toBe('https://us-east-1.example.com');
    });

    it('should return a placeholder for variable-level prefill only', () => {
        const result = resolveURLWithPrefillCodePlaceholdersFromServer({
            url: 'https://{region}.example.com',
            variables: {
                region: { default: 'us-east-1', 'x-gitbook-prefill': '{{ user.region }}' },
            },
        });

        expect(result).toBe(
            `$$__X-GITBOOK-PREFILL[(\`https://\${(user.region ?? 'us-east-1')}.example.com\`)]__$$`
        );
    });

    it('should wrap full URL when URL-level prefill exists', () => {
        const result = resolveURLWithPrefillCodePlaceholdersFromServer({
            url: 'https://api.example.com/v1',
            'x-gitbook-prefill': '{{ user.baseUrl }}',
        });

        expect(result).toBe(
            "$$__X-GITBOOK-PREFILL[(user.baseUrl ?? 'https://api.example.com/v1')]__$$"
        );
    });

    it('should combine variable-level and URL-level prefills correctly', () => {
        const result = resolveURLWithPrefillCodePlaceholdersFromServer({
            url: 'https://{region}.example.com/{version}',
            'x-gitbook-prefill': '{{ user.baseUrl }}',
            variables: {
                region: { default: 'us-east-1', 'x-gitbook-prefill': '{{ user.region }}' },
                version: { default: 'v1' },
            },
        });

        expect(result).toBe(
            "$$__X-GITBOOK-PREFILL[(user.baseUrl ?? `https://${(user.region ?? 'us-east-1')}.example.com/v1`)]__$$"
        );
    });
});
