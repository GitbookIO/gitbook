import type React from 'react';

import type { ContentKitBlock } from '@gitbook/api';

import type { ContentKitServerElementProps } from './types';

export function ElementBlock(
    props: React.PropsWithChildren<ContentKitServerElementProps<ContentKitBlock>>
) {
    const { children } = props;

    return <>{children}</>;
}
