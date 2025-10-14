import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: 'src/index.ts',
        unbundle: true,
        external: ['@react-stately/disclosure', '@react-stately/util'],
    },
]);
