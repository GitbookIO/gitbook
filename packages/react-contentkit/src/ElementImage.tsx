import type { ContentKitImage } from '@gitbook/api';

import type { ContentKitServerElementProps } from './types';

export function ElementImage(props: ContentKitServerElementProps<ContentKitImage>) {
    const { element } = props;

    // TODO: do block display with aspect ratio

    return <img src={element.source.url} className="contentkit-image" />;
}
