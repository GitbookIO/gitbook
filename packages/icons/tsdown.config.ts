import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/index.ts', 'src/icons.ts'],
        unbundle: true,
    },
]);
