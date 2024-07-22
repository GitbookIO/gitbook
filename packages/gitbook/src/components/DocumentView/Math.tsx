import { DocumentBlockMath, DocumentInlineMath } from '@gitbook/api';

import { getStaticFileURL } from '@/lib/assets';
import { tcls } from '@/lib/tailwind';

import { MathFormula } from '@gitbook/react-math';

import { BlockProps } from './Block';
import { InlineProps } from './Inline';

const mathJaxUrl = getStaticFileURL('mathjax@3.2.2/tex-chtml.js');

export async function BlockMath(props: BlockProps<DocumentBlockMath>) {
    const { block, style } = props;

    return (
        <MathFormula
            formula={block.data.formula}
            inline={false}
            className={tcls(style, 'overflow-x-auto')}
            mathJaxUrl={mathJaxUrl}
        />
    );
}

export async function InlineMath(props: InlineProps<DocumentInlineMath>) {
    const { inline } = props;

    return <MathFormula formula={inline.data.formula} inline={true} mathJaxUrl={mathJaxUrl} />;
}
