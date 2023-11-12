import { DocumentInlineMath } from '@gitbook/api';

import { KaTeX } from './KaTeX';
import { InlineProps } from '../Inline';

export async function InlineMath(props: InlineProps<DocumentInlineMath>) {
    const { inline } = props;

    return <KaTeX formula={inline.data.formula} inline={true} />;
}
