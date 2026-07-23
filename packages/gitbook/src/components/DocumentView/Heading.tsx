import type { DocumentBlockHeading } from '@gitbook/api';

import { getSpaceLanguage, tString } from '@/intl/server';
import { defaultLanguage } from '@/intl/translations';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { HashLinkButton, hashLinkButtonWrapperStyles } from './HashLinkButton';
import { HeadingRevealWrapper } from './HeadingRevealWrapper';
import { Inlines } from './Inlines';
import { getBlockTextStyle } from './spacing';
import { getTextAlignment } from './utils';

export async function Heading(props: BlockProps<DocumentBlockHeading>) {
    const { block, style, context, ...rest } = props;

    const textStyle = getBlockTextStyle(block);

    const Tag = TAGS[block.type];

    let id = block.meta?.id ?? '';
    id = context.getId ? context.getId(id) : id;

    const language = context.contentContext
        ? await getSpaceLanguage(context.contentContext)
        : defaultLanguage;

    return (
        <HeadingRevealWrapper
            as={Tag}
            id={id}
            className={tcls(
                textStyle.textSize,
                'heading',
                'pdf-heading',
                'block',
                'pr-6',
                'pointer-fine:flex',
                'pointer-fine:items-baseline',
                'pointer-fine:pr-0',
                'scroll-mt-(--content-scroll-margin)',
                getTextAlignment(block.data.align),
                hashLinkButtonWrapperStyles,
                style,
                textStyle.marginTop
            )}
        >
            <span
                className={tcls(
                    'pointer-fine:flex-1',
                    'z-1',
                    'justify-self-start',
                    'max-w-full',
                    'break-words',
                    // Cover-aware contrast text applies only to the page body, not to documents
                    // rendered in overlays (search answers, AI chat) on a background-cover page.
                    context.isPageBody && 'page-cover-background:text-contrast-cover',
                    getTextAlignment(block.data.align),
                    textStyle.lineHeight
                )}
            >
                <Inlines {...rest} context={context} nodes={block.nodes} ancestorInlines={[]} />
            </span>

            <HashLinkButton
                id={id}
                block={block}
                className={tcls(
                    'absolute ml-1',
                    block.type === 'heading-1'
                        ? '[transform:translateY(0.125em)]'
                        : '[transform:translateY(0.1875em)]',
                    'pointer-fine:-ml-6 pointer-fine:relative pointer-fine:order-first pointer-fine:self-center pointer-fine:pr-2 pointer-fine:[transform:none]',
                    'pointer-fine:[.flip-heading-hash_&]:order-last pointer-fine:[.flip-heading-hash_&]:ml-1 pointer-fine:[.flip-heading-hash_&]:pl-2'
                )}
                iconClassName={tcls('size-4')}
                label={tString(language, 'direct_link_to_heading')}
            />
        </HeadingRevealWrapper>
    );
}

const TAGS: { [type in DocumentBlockHeading['type']]: React.ElementType } = {
    // The h1 is reserved for the page title
    'heading-1': 'h2',
    'heading-2': 'h3',
    'heading-3': 'h4',
};
