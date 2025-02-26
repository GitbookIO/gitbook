import { ContentKitBlock } from '@gitbook/api';
import React from 'react';

import { ContentKitServerElementProps } from './types';

export function ElementBlock(
    props: React.PropsWithChildren<ContentKitServerElementProps<ContentKitBlock>>,
) {
    const { element, children } = props;

    return <>{children}</>;
}
