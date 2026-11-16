import type {
    DocumentBlockDrawing,
    DocumentBlockEmbed,
    DocumentBlockFile,
    DocumentBlockImage,
    DocumentBlockImages,
    JSONDocument,
} from '@gitbook/api';

import type { DocumentContextProps } from './DocumentView';
import { Inlines } from './Inlines';
import { getCommentAnchorProps } from './utils';
import { type ClassValue, cx } from '@/lib/classnames';
import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';

export type CaptionAlign = NonNullable<DocumentBlockImages['data']['align']>;

const captionAlignStyles = {
    center: 'gb-caption-center',
    left: 'gb-caption-left',
    right: 'gb-caption-right',
} satisfies Record<CaptionAlign, ClassValue>;

/**
 * Wrap a content of a block that has a potential caption.
 */
export function Caption(
    props: {
        children: React.ReactNode;
        document: JSONDocument;
        style?: ClassValue;
        fit?: boolean;
        wrapperStyle?: ClassValue;
        align?: CaptionAlign;
        block: DocumentBlockImage | DocumentBlockDrawing | DocumentBlockEmbed | DocumentBlockFile;
        withBorder?: boolean;
        withFrame?: boolean;
        /**
         * Expose the block key for commenting; off inside an `images` block, which carries the key
         * itself since its images aren't comment targets.
         */
        withBlockKey?: boolean;
    } & DocumentContextProps
) {
    const {
        children,
        document,
        block,
        context,
        fit = false,
        withBorder = false,
        withFrame = false,
        wrapperStyle = [
            'gb-caption-media',
            fit && 'gb-caption-fit',
            withBorder && 'gb-caption-bordered',
            withFrame && 'gb-caption-framed',
        ],
        style,
        align = 'center',
        withBlockKey = false,
    } = props;

    const anchorProps = withBlockKey ? getCommentAnchorProps(context, block.key) : {};

    const caption = getNodeFragmentByName(block, 'caption');
    const captionParagraph = caption?.nodes[0];

    if (
        !captionParagraph ||
        captionParagraph.type !== 'paragraph' ||
        isNodeEmpty(captionParagraph)
    ) {
        return (
            <div {...anchorProps} className={cx(style, wrapperStyle)}>
                {children}
            </div>
        );
    }

    return (
        <picture {...anchorProps} className={cx('gb-caption', style)}>
            <div className={cx(wrapperStyle, captionAlignStyles[align])}>{children}</div>
            <figcaption className={cx('gb-caption-text', withFrame && 'gb-caption-text-framed')}>
                <Inlines
                    nodes={captionParagraph.nodes}
                    document={document}
                    context={context}
                    ancestorInlines={[]}
                />
            </figcaption>
        </picture>
    );
}
