import { tcls } from '@/lib/tailwind';
import type { DocumentBlockColumns } from '@gitbook/api';
import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';

export function Columns(props: BlockProps<DocumentBlockColumns>) {
    const { block, style, ancestorBlocks, document, context } = props;

    return (
        <div className={tcls('flex flex-col md:flex-row gap-x-8', style)}>
            {block.nodes.map((columnBlock) => (
                <Column className={columnBlock.data.width}>
                    <Blocks
                        key={columnBlock.key}
                        nodes={columnBlock.nodes}
                        document={document}
                        ancestorBlocks={[...ancestorBlocks, block, columnBlock]}
                        context={context}
                        blockStyle="flip-heading-hash"
                        style="w-full space-y-4"
                    />
                </Column>
            ))}
        </div>
    );
}

export function Column(props: { children?: React.ReactNode, className?: string }) {
    return <div className={tcls("flex-1 flex-col", props.className)}>{props.children}</div>;
}
