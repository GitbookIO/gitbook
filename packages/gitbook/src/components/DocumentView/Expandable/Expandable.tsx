import type { DocumentBlockExpandable } from '@gitbook/api';
import { Icon } from '@gitbook/icons';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { shouldShowHashLinks } from '../HashLinkButton';
import { Inlines } from '../Inlines';
import { getCommentAnchorProps, getCommentKeyProp } from '../utils';
import { Details } from './Details';
import './Expandable.css';
import { ToggleChevron } from '@/components/primitives';
import { getSpaceLanguage, tString } from '@/intl/server';
import { defaultLanguage } from '@/intl/translations';
import { getNodeFragmentByType } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

export async function Expandable(props: BlockProps<DocumentBlockExpandable>) {
    const { block, style, ancestorBlocks, document, context } = props;

    const title = getNodeFragmentByType(block, 'expandable-title');
    const body = getNodeFragmentByType(block, 'expandable-body');
    const isDefaultExpanded = block.data.defaultExpanded ?? false;

    const titleParagraph = title?.nodes[0];

    if (!title || !body || titleParagraph?.type !== 'paragraph') {
        return null;
    }

    let id = block.meta?.id ?? '';
    id = context.getId ? context.getId(id) : id;

    const language = context.contentContext
        ? await getSpaceLanguage(context.contentContext)
        : defaultLanguage;

    const showHashLink = shouldShowHashLinks(context);

    return (
        <Details
            id={id}
            {...getCommentKeyProp(context, block.key)}
            open={context.mode === 'print' || isDefaultExpanded}
            className={style}
        >
            <summary
                {...getCommentAnchorProps(context, titleParagraph.key)}
                className={tcls(
                    'expandable-summary',
                    showHashLink && 'expandable-summary-anchored'
                )}
            >
                <ToggleChevron
                    orientation="right-to-down"
                    open={context.mode === 'print'}
                    className="expandable-chevron"
                />
                <Inlines
                    nodes={titleParagraph.nodes}
                    document={document}
                    context={context}
                    ancestorInlines={[]}
                />
                {showHashLink ? (
                    <a
                        href={`#${id}`}
                        aria-label={tString(language, 'direct_link_to_heading')}
                        className="expandable-anchor"
                    >
                        <Icon icon="hashtag" className="expandable-anchor-icon" />
                    </a>
                ) : null}
            </summary>
            <Blocks
                nodes={body.nodes}
                document={document}
                ancestorBlocks={[...ancestorBlocks, block]}
                context={context}
                style="space-y-4 px-10 pb-5"
            />
        </Details>
    );
}
