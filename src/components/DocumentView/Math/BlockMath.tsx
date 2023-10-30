import { DocumentBlockMath } from '@gitbook/api';
import { KaTeX } from './KaTeX';
import { BlockProps } from '../Block';
import { tcls } from '@/lib/tailwind';

export async function BlockMath(props: BlockProps<DocumentBlockMath>) {
    const { block, style } = props;

    return <KaTeX formula={block.data.formula} inline={false} className={tcls(style)} />;
}
