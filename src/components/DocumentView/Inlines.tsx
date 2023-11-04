import { Text } from './Text';
import { Inline } from './Inline';
import { DocumentContextProps } from './DocumentView';
import { DocumentInlinesRich } from '@gitbook/api';

export function Inlines<T extends DocumentInlinesRich>(
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
