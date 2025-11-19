import { describe, expect, it } from 'bun:test';
import { getSecurityHeaders } from './OpenAPICodeSample';
import type { OpenAPIOperationData } from './types';

describe('getSecurityHeaders', () => {
    it('should handle custom HTTP scheme with x-prefix', () => {
        const securities: OpenAPIOperationData['securities'] = [
            [
                'customScheme',
                {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    'x-prefix': 'CustomScheme',
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

    it('should use x-prefix with x-placeholder together', () => {
        const securities: OpenAPIOperationData['securities'] = [
            [
                'customAuth',
                {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    'x-prefix': 'Token',
                    'x-placeholder': 'MY_CUSTOM_TOKEN',
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
});
