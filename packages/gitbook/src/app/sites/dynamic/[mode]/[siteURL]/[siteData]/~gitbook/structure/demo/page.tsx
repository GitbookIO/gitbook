import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { StructurePreview } from '@/components/StructurePreview';
import { GITBOOK_APP_URL } from '@/lib/env';
import type { Metadata } from 'next';
import { getStructurePreviewSnapshot } from '../snapshot';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function Page(props: PageProps) {
    const { context } = await getDynamicSiteContext(await props.params);
    return (
        <StructurePreview
            initialSnapshot={getStructurePreviewSnapshot(context)}
            GITBOOK_APP_URL={GITBOOK_APP_URL}
        />
    );
}
