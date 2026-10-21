import type { DocumentBlockMath, DocumentInlineMath } from '@gitbook/api';
import { MathFormula } from '@gitbook/react-math';

import type { BlockProps } from './Block';
import type { InlineProps } from './Inline';
import { getCommentAnchorProps } from './utils';
import { getAssetURL } from '@/lib/assets';
import { tcls } from '@/lib/tailwind';

const assetsUrl = getAssetURL('math');

export async function BlockMath(props: BlockProps<DocumentBlockMath>) {
    const { block, style, context } = props;

    // `MathFormula` only forwards `className`, so the comment anchor needs its own wrapper.
    return (
        <div {...getCommentAnchorProps(context, block.key)} className={tcls(style)}>
            <MathFormula
                formula={block.data.formula}
                inline={false}
                className="overflow-x-auto"
                assetsUrl={assetsUrl}
            />
        </div>
    );
}

export async function InlineMath(props: InlineProps<DocumentInlineMath>) {
    const { inline } = props;

    return <MathFormula formula={inline.data.formula} inline={true} assetsUrl={assetsUrl} />;
}
