import { LoadPlugin, isJson, isYaml, ERRORS } from '@scalar/openapi-parser';
import fs from 'fs';

import { dirname, join } from './path';

export const readFiles: (prefix?: string) => LoadPlugin = (prefix?: string) => {
    return {
        check(value?: any) {
            // Not a string
            if (typeof value !== 'string') {
                return false;
            }

            // URL
            if (value.startsWith('http://') || value.startsWith('https://')) {
                return false;
            }

            // Line breaks
            if (value.includes('\n')) {
                return false;
            }

            // JSON
            if (isJson(value)) {
                return false;
            }

            // YAML (run through YAML.parse)
            if (isYaml(value)) {
                return false;
            }

            return true;
        },
        async get(value?: any) {
            // Fetch the file if it's a URL
            if (prefix) {
                try {
                    const response = await fetch(`${prefix}/${value}`);

                    return await response.text();
                } catch (error) {
                    console.error('[readFiles]', error);
                }
            }

            if (!fs.existsSync(value)) {
                throw new Error(ERRORS.FILE_DOES_NOT_EXIST.replace('%s', value));
            }

            try {
                return fs.readFileSync(value, 'utf-8');
            } catch (error) {
                console.error('[readFiles]', error);
            }
        },
        resolvePath(value: any, reference: string) {
            const dir = dirname(value);
            return join(dir, reference);
        },
        getDir(value: any) {
            return dirname(value);
        },
        getFilename(value: any) {
            return value.split('/').pop();
        },
    };
};
