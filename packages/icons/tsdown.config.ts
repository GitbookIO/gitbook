import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: 'src/index.ts',
        unbundle: true,
    },
    {
        entry: 'src/icons.ts',
    },
]);
