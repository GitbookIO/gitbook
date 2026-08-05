import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/index.ts', 'src/light.ts', 'src/core.ts'],
        unbundle: true,
    },
]);
