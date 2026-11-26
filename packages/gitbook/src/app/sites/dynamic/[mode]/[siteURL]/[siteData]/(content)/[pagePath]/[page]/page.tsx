import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { type RouteParams, getDynamicSiteContext, getPagePathFromParams } from '@/app/utils';
import { SitePage, generateSitePageMetadata } from '@/components/SitePage';
import { parseUpdatesPageParam } from '@/lib/updates-url';

type PageProps = {
    params: Promise<RouteParams & { page: string }>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    const updatesPage = parseUpdatesPageParam(params.page);
    if (updatesPage === null) {
        notFound();
    }
    const { context } = await getDynamicSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return (
        <SitePage
            context={context}
            pageParams={{ pathname }}
            staticRoute={false}
            updatesPage={updatesPage}
        />
    );
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const updatesPage = parseUpdatesPageParam(params.page);
    if (updatesPage === null) {
        notFound();
    }
    const { context } = await getDynamicSiteContext(params);
    const pathname = getPagePathFromParams(params);

    return generateSitePageMetadata({
        context,
        pageParams: { pathname },
        updatesPage,
    });
}
