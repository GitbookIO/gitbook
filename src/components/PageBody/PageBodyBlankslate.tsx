import { RevisionPage, RevisionPageDocument, RevisionPageType } from '@gitbook/api';

import { Card } from '@/components/primitives';
import { pageHref } from '@/lib/links';
import { tcls } from '@/lib/tailwind';

/**
 * Blankslate when the page has no document or the document is empty.
 */
export function PageBodyBlankslate(props: {
    page: RevisionPageDocument;
    rootPages: RevisionPage[];
}) {
    const { page, rootPages } = props;

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
            {page.pages.map((child) => {
                return (
                    <Card
                        key={child.id}
                        title={child.title}
                        href={
                            child.type === RevisionPageType.Link
                                ? child.href!
                                : pageHref(rootPages, child)
                        }
                    />
                );
            })}
        </div>
    );
}
