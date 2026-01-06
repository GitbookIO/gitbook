import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: 'src/index.ts',
        outDir: 'dist',
    },
    {
        entry: 'src/react/index.ts',
        outDir: 'dist/react',
        unbundle: true,
    },
]);
