import { ContentKitHStack, ContentKitVStack } from '@gitbook/api';

import { ContentKitServerElementProps } from './types';
import classNames from 'classnames';

export function ElementStack(
    props: React.PropsWithChildren<
        ContentKitServerElementProps<ContentKitHStack | ContentKitVStack>
    >,
) {
    const { element, children } = props;

    return (
        <div
            className={classNames(
                'contentkit-stack',
                `contentkit-${element.type}`,
                `contentkit-stack-align-${element.align ?? 'start'}`,
            )}
        >
            {children}
        </div>
    );
}
