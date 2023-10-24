import { ClassValue } from '@/lib/tailwind';
import { Blocks } from './Blocks';
import { ContentRefContext } from '@/lib/references';

export interface DocumentContextProps {
    context: ContentRefContext;
}

/**
 * Render an entire document.
 */
export function DocumentView(
    props: DocumentContextProps & {
        document: any;
        style?: ClassValue;
    },
) {
    const { document, style, ...context } = props;

    return <Blocks nodes={document.nodes} blockStyle={'mt-6'} style={style} {...context} />;
}
