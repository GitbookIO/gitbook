import { ContentKitText } from '@gitbook/api';

import { ContentKitServerElementProps } from './types';
import classNames from 'classnames';

export function ElementText(
    props: React.PropsWithChildren<ContentKitServerElementProps<ContentKitText>>,
) {
    const { element, children } = props;

    return (
        <span
            className={classNames(
                'contentkit-text',
                element.style ? `contentkit-text-${element.style}` : null,
            )}
        >
            {children}
        </span>
    );
}
