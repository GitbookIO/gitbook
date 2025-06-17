import type { DocumentInlineAnnotation } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';

import { Blocks } from '../Blocks';
import type { InlineProps } from '../Inline';
import { renderInlines } from '../Inlines';
import { AnnotationPopover } from './AnnotationPopover';

export function Annotation(props: InlineProps<DocumentInlineAnnotation>) {
    const { inline, context, document, children } = props;

    const fragment = getNodeFragmentByType(inline, 'annotation-body');
    const content =
        children ?? renderInlines({ document, context, nodes: inline.nodes, ancestorInlines: [] });

    if (!fragment) {
        return <>{content}</>;
    }

    return (
        <AnnotationPopover
            body={
                <Blocks
                    document={document}
                    ancestorBlocks={[]}
                    context={context}
                    nodes={fragment.nodes}
                    style={['space-y-4']}
                />
            }
        >
            {content}
        </AnnotationPopover>
    );
}
