import { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { tcls } from '@/lib/tailwind';
import { PagesList } from './PagesList';
import { Trademark } from './Trademark';
import { IntlContext } from '@/lib/intl';

export function TableOfContents(
    props: IntlContext & {
        revision: Revision;
        activePage: RevisionPageDocument;
        ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    },
) {
    const { space, revision, activePage, ancestors } = props;

    return (
        <aside
            className={tcls(
                'hidden',
                'lg:flex',
                'flex-col',
                'basis-72',
                'grow-0',
                'shrink-0',
                'sticky',
                'top-16',
                'h-[calc(100vh-4rem)]',
                'border-r',
                'border-slate-200',
            )}
        >
            <div className={tcls('flex-1', 'overflow-y-auto', 'pt-6', 'pb-14', 'pr-4')}>
                <PagesList pages={revision.pages} activePage={activePage} ancestors={ancestors} />
            </div>
            <Trademark space={space} />
        </aside>
    );
}
