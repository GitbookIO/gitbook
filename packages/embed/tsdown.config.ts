import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: ['src/index.ts', 'src/react/index.ts'],
        dts: true,
        format: ['esm'],
    },
]);
