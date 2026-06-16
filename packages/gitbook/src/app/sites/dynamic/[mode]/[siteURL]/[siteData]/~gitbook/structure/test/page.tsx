import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { StructurePreviewTest } from '@/components/StructurePreview/StructurePreviewTest';
import { getStructurePreviewSnapshot } from '../snapshot';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function Page(props: PageProps) {
    const { context } = await getDynamicSiteContext(await props.params);
    return <StructurePreviewTest initialSnapshot={getStructurePreviewSnapshot(context)} />;
}
