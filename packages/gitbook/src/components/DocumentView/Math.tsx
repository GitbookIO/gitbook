import type { DocumentBlockMath, DocumentInlineMath } from '@gitbook/api';
import { MathFormula } from '@gitbook/react-math';

import { getAssetURL } from '@/lib/assets';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import type { InlineProps } from './Inline';

const assetsUrl = getAssetURL('math');

export async function BlockMath(props: BlockProps<DocumentBlockMath>) {
    const { block, style } = props;

    return (
        <MathFormula
            formula={block.data.formula}
            inline={false}
            className={tcls(style, 'overflow-x-auto')}
            assetsUrl={assetsUrl}
        />
    );
}

export async function InlineMath(props: InlineProps<DocumentInlineMath>) {
    const { inline } = props;

    return <MathFormula formula={inline.data.formula} inline={true} assetsUrl={assetsUrl} />;
}
