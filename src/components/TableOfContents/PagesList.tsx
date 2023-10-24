import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { ClassValue, clsx } from 'clsx';
import { PageDocumentItem } from './PageDocumentItem';
import { PageGroupItem } from './PageGroupItem';

export function PagesList(props: {
    pages: RevisionPage[];
    activePage: RevisionPageDocument;
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
    style?: ClassValue;
}) {
    const { pages, activePage, ancestors, style } = props;

    return (
        <ul className={clsx('flex', 'flex-col', style)}>
            {pages.map((page) => {
                if (page.type === 'group') {
                    return (
                        <PageGroupItem
                            key={page.id}
                            page={page}
                            activePage={activePage}
                            ancestors={ancestors}
                        />
                    );
                }

                return (
                    <PageDocumentItem
                        key={page.id}
                        page={page}
                        activePage={activePage}
                        ancestors={ancestors}
                    />
                );
            })}
        </ul>
    );
}
