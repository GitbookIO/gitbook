import type { ContentKitBox } from '@gitbook/api';
import type React from 'react';

import type { ContentKitServerElementProps } from './types';

export function ElementBox(
    props: React.PropsWithChildren<ContentKitServerElementProps<ContentKitBox>>
) {
    const { element, children } = props;

    return <div style={{ flexGrow: element.grow ?? 0 }}>{children}</div>;
}
