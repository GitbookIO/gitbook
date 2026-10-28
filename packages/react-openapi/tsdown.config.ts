import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: 'src/index.ts',
        // One file per module, so consumers can deep-import past the barrel.
        unbundle: true,
    },
]);
