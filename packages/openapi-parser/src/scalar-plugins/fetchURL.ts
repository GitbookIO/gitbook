import { normalize } from '@scalar/openapi-parser';
import type { ParsePlugin } from '../parse';

export const fetchUrlsDefaultConfiguration = {
    limit: 40,
};

export const fetchURL = (): ParsePlugin => ({
    validate(value) {
        return URL.canParse(value);
    },
    async exec(value) {
        try {
            const response = await fetch(value);
            if (!response.ok) {
                return { ok: false };
            }
            const text = await response.text();
            return {
                ok: true,
                data: normalize(text),
            };
        } catch {
            return { ok: false };
        }
    },
});
