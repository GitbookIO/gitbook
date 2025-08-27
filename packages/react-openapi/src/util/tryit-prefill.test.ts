import { describe, expect, it } from 'bun:test';
import { ExpressionRuntime, parseTemplate } from '@gitbook/expr';
import type { OpenAPIOperationData } from '../types';
import {
    type TryItPrefillExpressionResolver,
    resolveTryItPrefillForOperation,
} from './tryit-prefill';

const expressionRuntime = new ExpressionRuntime();

/**
 * Create a try it prefill expression resolver with visitor data for testing.
 */
function createTryItPrefillResolverWithVisitorData(
    visitorData: Record<string, unknown>
): TryItPrefillExpressionResolver {
    return (expr: string) => {
        const parts = parseTemplate(expr);
        if (!parts.length) {
            return undefined;
        }

        return expressionRuntime.evaluateTemplate(expr, visitorData);
    };
}

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
                            'x-gitbook-tryit-prefill': '{{ visitor.claims.apiToken }}',
                        },
                    ],
                ],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: { claims: { apiToken: 'gb_api_testToken' } },
                }),
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
                            'x-gitbook-tryit-prefill': '{{ visitor.claims.basicAuth }}',
                        },
                    ],
                ],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: { claims: { basicAuth: 'testuser:testpassword' } },
                }),
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
                            'x-gitbook-tryit-prefill': '{{ visitor.claims.apiKey }}',
                        },
                    ],
                ],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: { claims: { apiKey: 'key-123' } },
                }),
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
                            'x-gitbook-tryit-prefill': '{{ visitor.claims.missing }}',
                        },
                    ],
                ],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: { claims: {} },
                }),
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
                        'x-gitbook-tryit-prefill': '{{ visitor.claims.api.endpointUrl }}',
                    },
                ],
                securities: [],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: {
                        claims: {
                            api: { endpointUrl: 'https://api.gitbook-staging.com/v1/' },
                        },
                    },
                }),
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
                                'x-gitbook-tryit-prefill':
                                    '{{ visitor.claims.api.env === "staging" ?  "gitbook-staging.com" : "gitbook.com" }}',
                            },
                            version: {
                                default: 'v1',
                                'x-gitbook-tryit-prefill': '{{ visitor.claims.api.version }}',
                            },
                        },
                    },
                ],
                securities: [],
            };

            const overrideEnvResult = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: {
                        claims: {
                            api: { env: 'staging' },
                        },
                    },
                }),
            });

            expect(overrideEnvResult).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: {
                                default: 'gitbook-staging.com',
                            },
                            version: {
                                default: 'v1',
                            },
                        },
                    },
                ],
            });

            const overrideVersionResult = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: {
                        claims: {
                            api: { version: 'v2' },
                        },
                    },
                }),
            });

            expect(overrideVersionResult).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: {
                                default: 'gitbook.com',
                            },
                            version: {
                                default: 'v2',
                            },
                        },
                    },
                ],
            });

            const overrideBoth = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: {
                        claims: {
                            api: { env: 'staging', version: 'v2' },
                        },
                    },
                }),
            });

            expect(overrideBoth).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: {
                                default: 'gitbook-staging.com',
                            },
                            version: {
                                default: 'v2',
                            },
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
                                'x-gitbook-tryit-prefill':
                                    '{{ visitor.claims.api.env === "staging" ?  "gitbook-staging.com" : "gitbook.com" }}',
                            },
                            version: {
                                default: 'v1',
                                'x-gitbook-tryit-prefill': '{{ visitor.claims.api.version }}',
                            },
                        },
                    },
                ],
                securities: [],
            };

            const result = resolveTryItPrefillForOperation({
                operation,
                resolveTryItPrefillExpression: createTryItPrefillResolverWithVisitorData({
                    visitor: { claims: { isBetaUser: true } },
                }),
            });

            expect(result).toEqual({
                servers: [
                    {
                        url: 'https://api.{domain}/{version}/',
                        description: 'Versioned API endpoint by environment',
                        variables: {
                            domain: {
                                default: 'gitbook.com',
                            },
                            version: {
                                default: 'v1',
                            },
                        },
                    },
                ],
            });
        });
    });
});
