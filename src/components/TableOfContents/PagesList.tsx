import { RevisionPage, RevisionPageDocument } from '@gitbook/api';
import { ClassValue, clsx } from 'clsx';
import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';

export function PagesList(props: {
    pages: RevisionPage[];
    activePage: RevisionPageDocument;
    style?: ClassValue;
}) {
    const { pages, activePage, style } = props;

    return (
        <ul className={clsx('flex', 'flex-col', style)}>
            {pages.map((page) => {
                if (page.type === 'group') {
                    return <PageGroupItem key={page.id} page={page} activePage={activePage} />;
                }

                return <PageDocumentItem key={page.id} page={page} activePage={activePage} />;
            })}
        </ul>
    );
}
