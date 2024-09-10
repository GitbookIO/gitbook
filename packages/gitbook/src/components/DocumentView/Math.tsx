import { DocumentBlockMath, DocumentInlineMath } from '@gitbook/api';
import { MathFormula } from '@gitbook/react-math';

import { getStaticFileURL } from '@/lib/assets';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { InlineProps } from './Inline';

const assetsUrl = getStaticFileURL('math');

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
