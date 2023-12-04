import { JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';

import { ContentRefContext } from '@/lib/references';
import { tcls } from '@/lib/tailwind';

import { PageCover } from './PageCover';
import { PageFooterNavigation } from './PageFooterNavigation';
import { PageHeader } from './PageHeader';
import { DocumentView } from '../DocumentView';

export function PageBody(props: {
    space: Space;
    page: RevisionPageDocument;
    context: ContentRefContext;
    document: JSONDocument | null;
    withDesktopTableOfContents: boolean;
    withAside: boolean;
}) {
    const { space, context, page, document, withDesktopTableOfContents, withAside } = props;

    return (
        <main
            className={tcls(
                'py-8',
                'px-4',
                'lg:px-12',
                'flex-1',
                withAside ? null : 'mr-56',
                withDesktopTableOfContents ? null : 'xl:ml-72',
            )}
        >
            {page.cover && page.layout.cover && page.layout.coverSize === 'hero' ? (
                <PageCover as="hero" page={page} cover={page.cover} context={context} />
            ) : null}

            <PageHeader page={page} />
            {document ? (
                <DocumentView document={document} style={['space-y-6']} context={context} />
            ) : null}

            {page.layout.pagination ? (
                <PageFooterNavigation space={space} pages={context.pages} page={page} />
            ) : null}
        </main>
    );
}
