import { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { clsx } from 'clsx';
import { PagesList } from './PagesList';
import { Trademark } from './Trademark';

export function TableOfContents(props: {
    revision: Revision;
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
}) {
    const { revision, activePage, ancestors } = props;

    return (
        <aside
            className={clsx(
                'flex-col',
                'hidden lg:flex fixed z-20 inset-0 top-16 left-[max(0px,calc(50%-45rem))] right-auto w-[19rem]',
            )}
        >
            <div className={clsx('flex-1', 'overflow-y-auto', 'pt-6 pb-14 pl-8 pr-6')}>
                <PagesList pages={revision.pages} activePage={activePage} ancestors={ancestors} />
            </div>
            <Trademark />
        </aside>
    );
}
