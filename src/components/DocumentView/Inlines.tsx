import clsx from 'clsx';
import { Text } from './Text';
import { Inline } from './Inline';

export function Inlines<T>(props: { nodes: T[] }) {
    const { nodes } = props;

    return (
        <>
            {nodes.map((node, index) => {
                if (node.object === 'text') {
                    return <Text key={node.key} text={node} />;
                }

                return <Inline key={node.key} inline={node} />;
            })}
        </>
    );
}
