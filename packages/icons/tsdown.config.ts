import { defineConfig } from 'tsdown';

export default defineConfig([
    {
        entry: [
            'src/index.ts',
            'src/icons.ts',
            'src/types.ts',
            'src/getIconStyle.ts',
            'src/IconSources.ts',
            'src/version.ts',
        ],
        unbundle: true,
    },
]);
