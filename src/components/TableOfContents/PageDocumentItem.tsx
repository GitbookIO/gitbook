import { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { tcls } from '@/lib/tailwind';
import Link, { LinkProps } from 'next/link';
import { PagesList } from './PagesList';
import { pageHref } from '@/lib/links';
import { ToggeableLinkItem } from './ToggeableLinkItem';

export function PageDocumentItem(props: {
    page: RevisionPageDocument;
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
}) {
    const { page, activePage, ancestors } = props;

    const hasActiveDescendant = ancestors.some((ancestor) => ancestor.id === page.id);

    const linkProps = {
        href: pageHref(page.path || ''),
        className: tcls(
            'flex',
            'flex-row',
            'justify-between',
            'rounded',
            'px-2',
            'py-1.5',
            'text-sm',
            'transition-colors',
            'duration-100',
            activePage.id === page.id
                ? ['bg-primary-100', 'text-primary-500', 'font-semibold']
                : ['hover:bg-slate-100', 'text-slate-500', 'font-normal'],
        ),
    };

    return (
        <li className={tcls('flex', 'flex-col', 'mb-0.5')}>
            {page.pages && page.pages.length ? (
                <ToggeableLinkItem
                    {...linkProps}
                    descendants={
                        <PagesList
                            pages={page.pages}
                            style={tcls('ms-2', 'ps-3', 'my-2', 'border-l', 'border-slate-200')}
                            activePage={activePage}
                            ancestors={ancestors}
                        />
                    }
                    defaultOpen={hasActiveDescendant || activePage.id === page.id}
                >
                    {page.title}
                </ToggeableLinkItem>
            ) : (
                <Link {...linkProps}>{page.title}</Link>
            )}
        </li>
    );
}
