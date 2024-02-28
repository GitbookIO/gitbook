import { ContentKitBox } from '@gitbook/api';

import { ContentKitServerElementProps } from './types';

export function ElementBox(
    props: React.PropsWithChildren<ContentKitServerElementProps<ContentKitBox>>,
) {
    const { element, children } = props;

    return <div style={{ flexGrow: element.grow ?? 0 }}>{children}</div>;
}
