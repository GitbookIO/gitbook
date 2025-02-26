import type { ContentKitText } from '@gitbook/api';
import type React from 'react';

import classNames from 'classnames';
import type { ContentKitServerElementProps } from './types';

export function ElementText(
    props: React.PropsWithChildren<ContentKitServerElementProps<ContentKitText>>
) {
    const { element, children } = props;

    return (
        <span
            className={classNames(
                'contentkit-text',
                element.style ? `contentkit-text-${element.style}` : null
            )}
        >
            {children}
        </span>
    );
}
