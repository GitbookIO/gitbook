import type { DocumentInline, DocumentText } from '@gitbook/api';

import type { SlimJSONDocument } from '@/lib/slim-document';
import type { DocumentContextProps } from './DocumentView';
import { Inline } from './Inline';
import { Text } from './Text';

export function Inlines<T extends DocumentInline | DocumentText>(
    props: DocumentContextProps & {
        /**
         * Document being rendered.
         */
        document: SlimJSONDocument;

        /**
         * Ancestors of the current inline.
         */
        ancestorInlines: DocumentInline[];

        /**
         * Nodes to render
         */
        nodes: T[];
    }
) {
    const { nodes, document, ancestorInlines, ...contextProps } = props;

    return nodes.map((node, index) => {
        const key = node.key || `key-${index}`;

        if (node.object === 'text') {
            return <Text key={key} text={node} />;
        }

        return (
            <Inline
                key={key}
                inline={node}
                document={document}
                ancestorInlines={ancestorInlines}
                {...contextProps}
            />
        );
    });
}
