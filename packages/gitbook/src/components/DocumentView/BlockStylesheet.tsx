import type { BlockStylesheetName } from './blockStylesheets';
import { getAssetURL } from '@/lib/assets';
import { buildVersion } from '@/lib/build';

export function getBlockStylesheetURL(name: BlockStylesheetName): string {
    return getAssetURL(`css/${name}.css?v=${buildVersion()}`);
}

// `href` + `precedence` opt into React's stylesheet hoisting: the tag moves to `<head>`, dedupes
// across every block on the page, and holds paint until it loads, so the block never flashes
// unstyled. `blocks` sorts after Next's own `next` precedence, keeping the previous cascade order.
export function BlockStylesheet(props: { name: BlockStylesheetName }) {
    return <link rel="stylesheet" href={getBlockStylesheetURL(props.name)} precedence="blocks" />;
}
