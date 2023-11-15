import { DocumentInline, DocumentText } from '@gitbook/api';

import { DocumentContextProps } from './DocumentView';
import { Inline } from './Inline';
import { Text } from './Text';

export function Inlines<T extends DocumentInline | DocumentText>(
    props: DocumentContextProps & { nodes: T[] },
) {
    const { nodes, ...contextProps } = props;

    return (
        <>
            {nodes.map((node, index) => {
                if (node.object === 'text') {
                    return <Text key={node.key} text={node} />;
                }

                return <Inline key={node.key} inline={node} {...contextProps} />;
            })}
        </>
    );
}
