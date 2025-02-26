import {
    type RevisionPageDocument,
    RevisionPageType,
    SiteInsightsLinkPosition,
} from '@gitbook/api';
import type { GitBookAnyContext } from '@v2/lib/context';

import { Card } from '@/components/primitives';
import { resolveContentRef } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageIcon } from '../PageIcon';

/**
 * Blankslate when the page has no document or the document is empty.
 */
export async function PageBodyBlankslate(props: {
    page: RevisionPageDocument;
    context: GitBookAnyContext;
}) {
    const { page, context } = props;

    const pages = page.pages.filter((child) =>
        child.type === RevisionPageType.Document ? !child.hidden : true
    );
    if (!pages.length) {
        return null;
    }

    const pageElements = await Promise.all(
        pages.map(async (child) => {
            const icon = <PageIcon page={child} style={['text-base', 'text-tint']} />;

            if (child.type === RevisionPageType.Computed) {
                throw new Error(
                    'Unexpected computed page, it should have been computed in the API'
                );
            }
            if (child.type === RevisionPageType.Link) {
                const resolved = await resolveContentRef(child.target, context);
                if (!resolved) {
                    return null;
                }

                return (
                    <Card
                        key={child.id}
                        leadingIcon={icon}
                        title={child.title}
                        href={resolved.href}
                        insights={{
                            type: 'link_click',
                            link: {
                                target: child.target,
                                position: SiteInsightsLinkPosition.Content,
                            },
                        }}
                    />
                );
            }
            const href = context.linker.toPathForPage({ pages: context.pages, page: child });
            return <Card key={child.id} title={child.title} leadingIcon={icon} href={href} />;
        })
    );

    return (
        <div
            className={tcls(
                'grid',
                'max-w-3xl',
                'w-full',
                'mx-auto',
                'gap-4',
                'grid-cols-1',
                'sm:grid-cols-2'
            )}
        >
            {pageElements}
        </div>
    );
}
