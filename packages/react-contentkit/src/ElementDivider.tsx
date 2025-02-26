import { ContentKitDivider } from '@gitbook/api';
import React from 'react';

import { ContentKitServerElementProps } from './types';
import classNames from 'classnames';

export function ElementDivider(props: ContentKitServerElementProps<ContentKitDivider>) {
    const { element } = props;

    return (
        <div
            className={classNames(
                'contentkit-divider',
                `contentkit-divider-${element.size ?? 'medium'}`,
            )}
        />
    );
}
