import type { Plugin } from '@scalar/json-magic/bundle';
import { normalize } from '@scalar/openapi-parser';

export const fetchUrlsDefaultConfiguration = {
    limit: 40,
};

export const fetchURL = (): Plugin => ({
    type: 'loader',
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
