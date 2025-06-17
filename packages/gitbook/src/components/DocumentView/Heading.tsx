import type { DocumentBlockHeading } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { HashLinkButton, hashLinkButtonWrapperStyles } from './HashLinkButton';
import { renderInlines } from './Inlines';
import { getBlockTextStyle } from './spacing';

export function Heading(props: BlockProps<DocumentBlockHeading>) {
    const { block, style, context, ...rest } = props;

    const textStyle = getBlockTextStyle(block);

    const Tag = TAGS[block.type];

    let id = block.meta?.id ?? '';
    id = context.getId ? context.getId(id) : id;

    return (
        <Tag
            id={id}
            className={tcls(
                textStyle.textSize,
                'heading',
                'grid',
                'scroll-m-12',
                hashLinkButtonWrapperStyles,
                style
            )}
        >
            <HashLinkButton
                id={id}
                block={block}
                className={tcls('-ml-6', textStyle.anchorButtonMarginTop)}
                iconClassName={tcls('size-4')}
                label="Direct link to heading"
            />

            <div
                className={tcls(
                    'grid-area-1-1',
                    'z-[1]',
                    'justify-self-start',
                    'text-left',
                    textStyle.lineHeight,
                    textStyle.marginTop
                )}
            >
                {renderInlines({ context, nodes: block.nodes, ancestorInlines: [], ...rest })}
            </div>
        </Tag>
    );
}

const TAGS: { [type in DocumentBlockHeading['type']]: React.ElementType } = {
    // The h1 is reserved for the page title
    'heading-1': 'h2',
    'heading-2': 'h3',
    'heading-3': 'h4',
};
