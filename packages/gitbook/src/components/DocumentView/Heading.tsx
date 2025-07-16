import type { DocumentBlockHeading } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { HashLinkButton, hashLinkButtonWrapperStyles } from './HashLinkButton';
import { Inlines } from './Inlines';
import { getBlockTextStyle } from './spacing';
import { getTextAlignment } from './utils';

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
                'flex',
                'items-baseline',
                'scroll-m-12',
                hashLinkButtonWrapperStyles,
                style,
                textStyle.marginTop
            )}
        >
            <HashLinkButton
                id={id}
                block={block}
                className={tcls('-ml-6', 'pr-2')}
                iconClassName={tcls('size-4')}
                label="Direct link to heading"
            />

            <div
                className={tcls(
                    'grid-area-1-1',
                    'z-[1]',
                    'justify-self-start',
                    getTextAlignment(block.data.align),
                    textStyle.lineHeight
                )}
            >
                <Inlines {...rest} context={context} nodes={block.nodes} ancestorInlines={[]} />
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
