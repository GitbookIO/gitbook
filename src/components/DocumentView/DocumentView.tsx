import clsx from 'clsx';
import { Blocks } from './Blocks';

/**
 * Render an entire document.
 */
export function DocumentView(props: { document: any }) {
    const { document } = props;

    return <Blocks nodes={document.nodes} blockStyle={clsx('mt-6')} />;
}
