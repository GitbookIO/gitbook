import type { DocumentBlockHeading } from '@gitbook/api';

import type { BlockProps } from './Block';
import { HashLinkButton, shouldShowHashLinks } from './HashLinkButton';
import { HeadingRevealWrapper } from './HeadingRevealWrapper';
import { Inlines } from './Inlines';
import { getCommentAnchorProps, getTextAlignment } from './utils';
import { getSpaceLanguage, tString } from '@/intl/server';
import { defaultLanguage } from '@/intl/translations';
import { cx } from '@/lib/classnames';

export async function Heading(props: BlockProps<DocumentBlockHeading>) {
    const { block, style, context, ...rest } = props;

    const Tag = TAGS[block.type];

    let id = block.meta?.id ?? '';
    id = context.getId ? context.getId(id) : id;

    const language = context.contentContext
        ? await getSpaceLanguage(context.contentContext)
        : defaultLanguage;

    const showHashLink = shouldShowHashLinks(context);

    return (
        <HeadingRevealWrapper
            as={Tag}
            id={id}
            {...getCommentAnchorProps(context, block.key)}
            className={cx(
                'heading',
                block.type,
                'font-heading',
                'pdf-heading',
                getTextAlignment(block.data.align),
                style
            )}
        >
            <span
                // Cover-aware contrast text applies only to the page body, not to documents
                // rendered in overlays (search answers, AI chat) on a background-cover page.
                data-cover-aware-text={context.isPageBody ? '' : undefined}
                className={cx('heading-text', getTextAlignment(block.data.align))}
            >
                <Inlines {...rest} context={context} nodes={block.nodes} ancestorInlines={[]} />
            </span>

            {showHashLink ? (
                <HashLinkButton
                    id={id}
                    block={block}
                    label={tString(language, 'direct_link_to_heading')}
                />
            ) : null}
        </HeadingRevealWrapper>
    );
}

const TAGS: { [type in DocumentBlockHeading['type']]: React.ElementType } = {
    // The h1 is reserved for the page title
    'heading-1': 'h2',
    'heading-2': 'h3',
    'heading-3': 'h4',
};
