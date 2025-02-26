import type { RevisionPage, RevisionPageGroup } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';

import { hasPageVisibleDescendant } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { TOCPageIcon } from './TOCPageIcon';

export function PageGroupItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageGroup;
    context: GitBookSiteContext;
}) {
    const { rootPages, page, context } = props;

    return (
        <li className={tcls('flex', 'flex-col', 'group/page-group-item')}>
            <div
                className={tcls(
                    'flex',
                    'items-center',

                    'gap-3',
                    'px-3',
                    'z-[1]',
                    'sticky',
                    '-top-5',
                    'pt-6',
                    'group-first/page-group-item:-mt-5',
                    'pb-3', // Add extra padding to make the header fade a bit nicer
                    '-mb-1.5', // Then pull the page items a bit closer, effective bottom padding is 1.5 units / 6px.

                    'text-xs',
                    'tracking-wide',
                    'font-semibold',
                    'uppercase',

                    '[mask-image:linear-gradient(rgba(0,0,0,1)_70%,rgba(0,0,0,0))]', // Fade out effect of fixed page items. We want the fade to start past the header, this is a good approximation.
                    'bg-tint-base',
                    'sidebar-filled:bg-tint-subtle',
                    'theme-muted:bg-tint-subtle',
                    'theme-bold-tint:bg-tint-subtle',
                    '[html.sidebar-filled.theme-muted_&]:bg-tint-base',
                    '[html.sidebar-filled.theme-bold.tint_&]:bg-tint-base',
                    '[html.sidebar-default.theme-gradient_&]:bg-gradient-primary',
                    '[html.sidebar-default.theme-gradient.tint_&]:bg-gradient-tint'
                )}
            >
                <TOCPageIcon page={page} />
                {page.title}
            </div>
            {hasPageVisibleDescendant(page) ? (
                <PagesList rootPages={rootPages} pages={page.pages} context={context} />
            ) : null}
        </li>
    );
}
