import { DocumentBlockMath } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { KaTeX } from './KaTeX';
import { BlockProps } from '../Block';

export async function BlockMath(props: BlockProps<DocumentBlockMath>) {
    const { block, style } = props;

    return <KaTeX formula={block.data.formula} inline={false} className={tcls(style)} />;
}
