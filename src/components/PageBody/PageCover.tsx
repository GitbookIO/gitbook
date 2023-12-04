import { RevisionPageDocument, RevisionPageDocumentCover } from '@gitbook/api';

import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import defaultPageCover from './default-page-cover.svg';
import { PAGE_COVER_HEIGHT } from '../layout';

/**
 * Cover for the page.
 */
export async function PageCover(props: {
    as: 'hero' | 'full';
    page: RevisionPageDocument;
    cover: RevisionPageDocumentCover;
    context: ContentRefContext;
}) {
    const { as, cover, context } = props;
    const resolved = cover.ref ? await resolveContentRef(cover.ref, context) : null;

    return (
        <div
            className={tcls(
                PAGE_COVER_HEIGHT,
                'overflow-hidden',
                // Negative margin to balance the container padding
                as === 'full'
                    ? ['-mx-4', 'sm:-mx-6', 'md:-mx-8']
                    : ['max-w-3xl', 'mx-auto', 'rounded-md', 'mb-8'],
            )}
        >
            <img
                alt="Page cover image"
                src={resolved?.href ?? defaultPageCover.src}
                fetchPriority="low"
                className={tcls('w-full', 'h-full', 'object-cover', 'object-center')}
            />
        </div>
    );
}
