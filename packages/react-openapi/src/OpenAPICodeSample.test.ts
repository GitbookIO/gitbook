import { describe, expect, it } from 'bun:test';
import { getSecurityHeaders } from './OpenAPICodeSample';
import type { OpenAPIOperationData } from './types';

describe('getSecurityHeaders', () => {
    it('should handle custom HTTP scheme with x-gitbook-prefix', () => {
        const securities: OpenAPIOperationData['securities'] = [
            [
                'customScheme',
                {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    'x-gitbook-prefix': 'CustomScheme',
                },
            ],
        ];

        const result = getSecurityHeaders({
            securityRequirement: [{ customScheme: [] }],
            securities,
        });

        expect(result).toEqual({
            Authorization: 'CustomScheme YOUR_API_KEY',
        });
    });

    it('should use x-gitbook-prefix with x-gitbook-token-placeholder together', () => {
        const securities: OpenAPIOperationData['securities'] = [
            [
                'customAuth',
                {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    'x-gitbook-prefix': 'Token',
                    'x-gitbook-token-placeholder': 'MY_CUSTOM_TOKEN',
                },
            ],
        ];

        const result = getSecurityHeaders({
            securityRequirement: [{ customAuth: [] }],
            securities,
        });

        expect(result).toEqual({
            Authorization: 'Token MY_CUSTOM_TOKEN',
        });
    });

    it('should not use x-gitbook-prefix for http scheme', () => {
        const securities: OpenAPIOperationData['securities'] = [
            [
                'customAuth',
                {
                    type: 'http',
                    in: 'header',
                    name: 'Authorization',
                    scheme: 'bearer',
                    'x-gitbook-prefix': 'Token',
                },
            ],
        ];

        const result = getSecurityHeaders({
            securityRequirement: [{ customAuth: [] }],
            securities,
        });

        expect(result).toEqual({
            Authorization: 'Bearer YOUR_SECRET_TOKEN',
        });
    });
});
