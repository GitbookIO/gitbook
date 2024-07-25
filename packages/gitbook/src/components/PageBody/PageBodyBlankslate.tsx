import { RevisionPage, RevisionPageDocument, RevisionPageType } from '@gitbook/api';

import { Card } from '@/components/primitives';
import { pageHref } from '@/lib/links';
import { ContentRefContext, resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

/**
 * Blankslate when the page has no document or the document is empty.
 */
export async function PageBodyBlankslate(props: {
    page: RevisionPageDocument;
    rootPages: RevisionPage[];
    context: ContentRefContext;
}) {
    const { page, rootPages, context } = props;

    if (!page.pages.length) {
        return null;
    }

    return (
        <div
            className={tcls(
                'grid',
                'max-w-3xl',
                'w-full',
                'mx-auto',
                'gap-4',
                'grid-cols-1',
                'sm:grid-cols-2',
            )}
        >
            {await Promise.all(
                page.pages.map(async (child) => {
                    if (child.type === RevisionPageType.Link) {
                        const resolved = await resolveContentRef(child.target, context);
                        if (!resolved) {
                            return null;
                        }

                        return <Card key={child.id} title={child.title} href={resolved.href} />;
                    } else {
                        return (
                            <Card
                                key={child.id}
                                title={child.title}
                                href={pageHref(rootPages, child)}
                            />
                        );
                    }
                }),
            )}
        </div>
    );
}
