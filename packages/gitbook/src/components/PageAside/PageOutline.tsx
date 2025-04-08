import { getSpaceLanguage, t } from '@/intl/server';
import { getDocumentSections } from '@/lib/document-sections';
import { tcls } from '@/lib/tailwind';
import type { JSONDocument } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import type { GitBookSiteContext } from '@v2/lib/context';
import React from 'react';
import { ScrollSectionsList } from './ScrollSectionsList';

export function PageOutline(props: {
    document: JSONDocument | null;
    context: GitBookSiteContext;
}) {
    const { document, context } = props;
    const { customization } = context;
    const language = getSpaceLanguage(customization);

    return (
        <div>
            <div className="mb-1 flex flex-row items-center gap-2 font-semibold text-xs uppercase tracking-wide">
                <Icon icon="block-quote" className={tcls('size-3')} />
                {t(language, 'on_this_page')}
            </div>
            <div
                className={tcls(
                    'flex',
                    'flex-col'

                    // 'page-api-block:xl:max-2xl:py-0',
                    // // Hide it for api page, until hovered
                    // 'page-api-block:xl:max-2xl:hidden',
                    // 'page-api-block:xl:max-2xl:group-hover/aside:flex'
                )}
            >
                {document ? (
                    <React.Suspense fallback={null}>
                        <PageAsideSections document={document} context={context} />
                    </React.Suspense>
                ) : null}
            </div>
        </div>
    );
}

async function PageAsideSections(props: { document: JSONDocument; context: GitBookSiteContext }) {
    const { document, context } = props;

    const sections = await getDocumentSections(context, document);

    return sections.length > 1 ? <ScrollSectionsList sections={sections} /> : null;
}
