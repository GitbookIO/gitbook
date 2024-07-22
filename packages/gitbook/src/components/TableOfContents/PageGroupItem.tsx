import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { Emoji } from '@/components/primitives';
import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';

export function PageGroupItem(props: {
    rootPages: RevisionPage[];
    page: RevisionPageGroup;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    context: ContentRefContext;
}) {
    const { rootPages, page, ancestors, context } = props;

    return (
        <li className={tcls('flex', 'flex-col')}>
            <div
                className={tcls(
                    'px-5',
                    'pt-6',
                    'pb-1.5',
                    'text-xs',
                    'tracking-wide',
                    'font-semibold',
                    'uppercase',
                    'z-[1]',
                    'sticky',
                    '-top-4',
                    'bg-gradient-to-b',
                    'from-light',
                    'to-transparent',
                    'from-65%',
                    'dark:from-dark',
                    'dark:tracking-wider',
                    'dark:to-transparent',
                )}
            >
                {page.emoji ? <Emoji code={page.emoji} style={['mr-3']} /> : null}
                {page.title}
            </div>
            {page.pages && page.pages.length ? (
                <PagesList
                    rootPages={rootPages}
                    pages={page.pages}
                    ancestors={ancestors}
                    context={context}
                />
            ) : null}
        </li>
    );
}
