import { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import React from 'react';

import { IntlContext } from '@/lib/intl';
import { tcls } from '@/lib/tailwind';

import { PagesList } from './PagesList';
import { Trademark } from './Trademark';
import { SIDE_COLUMN_WITHOUT_HEADER, SIDE_COLUMN_WITH_HEADER } from '../layout';

export function TableOfContents(
    props: IntlContext & {
        revision: Revision;
        activePage: RevisionPageDocument;
        ancestors: Array<RevisionPageDocument | RevisionPageGroup>;
        header?: React.ReactNode;
        withHeaderOffset?: boolean;
    },
) {
    const { space, revision, activePage, ancestors, header, withHeaderOffset = false } = props;

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
                withHeaderOffset ? SIDE_COLUMN_WITH_HEADER : SIDE_COLUMN_WITHOUT_HEADER,
                'border-r',
                'border-slate-200',
            )}
        >
            {header ? <div className={tcls('pt-6', 'pb-3', 'pr-4')}>{header}</div> : null}
            <div
                className={tcls(
                    'flex-1',
                    'overflow-y-auto',
                    header ? 'pt-3' : 'pt-6',
                    'pb-14',
                    'pr-4',
                )}
            >
                <PagesList pages={revision.pages} activePage={activePage} ancestors={ancestors} />
            </div>
            <Trademark space={space} />
        </aside>
    );
}
