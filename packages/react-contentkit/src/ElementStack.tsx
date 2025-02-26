import type { ContentKitHStack, ContentKitVStack } from '@gitbook/api';
import type React from 'react';

import classNames from 'classnames';
import type { ContentKitServerElementProps } from './types';

export function ElementStack(
    props: React.PropsWithChildren<
        ContentKitServerElementProps<ContentKitHStack | ContentKitVStack>
    >
) {
    const { element, children } = props;

    return (
        <div
            className={classNames(
                'contentkit-stack',
                `contentkit-${element.type}`,
                `contentkit-stack-align-${element.align ?? 'start'}`
            )}
        >
            {children}
        </div>
    );
}
