import type { ContentKitDivider } from '@gitbook/api';

import classNames from 'classnames';
import type { ContentKitServerElementProps } from './types';

export function ElementDivider(props: ContentKitServerElementProps<ContentKitDivider>) {
    const { element } = props;

    return (
        <div
            className={classNames(
                'contentkit-divider',
                `contentkit-divider-${element.size ?? 'medium'}`
            )}
        />
    );
}
