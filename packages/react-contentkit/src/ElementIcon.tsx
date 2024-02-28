import { ContentKitIcon } from '@gitbook/api';
import { ContentKitServerContext } from './types';

export function ElementIcon(props: { icon: ContentKitIcon; context: ContentKitServerContext }) {
    const { icon, context } = props;
    const C = context.icons[icon];
    if (!C) {
        return <span className="contentkit-icon" />;
    }

    return <C className="contentkit-icon" />;
}
