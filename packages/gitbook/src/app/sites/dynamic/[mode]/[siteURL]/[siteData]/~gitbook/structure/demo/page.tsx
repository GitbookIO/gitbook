import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { StructurePreview } from '@/components/StructurePreview';
import { GITBOOK_APP_URL } from '@/lib/env';
import { getStructurePreviewSnapshot } from '../snapshot';

type PageProps = {
    params: Promise<RouteLayoutParams>;
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
