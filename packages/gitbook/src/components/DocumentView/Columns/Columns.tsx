import type { DocumentBlockColumns } from '@gitbook/api';
import { BlockProps } from "../Block";
import { Blocks } from '../Blocks';
import { tcls } from '@/lib/tailwind';

export function Columns(props: BlockProps<DocumentBlockColumns>) {
     const { block, style, ancestorBlocks, document, context } = props;

    return <div className={tcls("flex gap-4", style)}>
        {block.nodes.map((columnBlock) => (<Column>
            <Blocks 
                key={columnBlock.key} 
                nodes={columnBlock.nodes} 
                document={document}
                ancestorBlocks={[...ancestorBlocks, block, columnBlock]}
                context={context}
                blockStyle='flip-heading-hash'
                style='w-full space-y-4' />
        </Column>))}
    </div>;
}

export function Column(props: { children?: React.ReactNode; }) {
    return (
        <div className="flex-column flex-1">
            {props.children}
        </div>
    );
}