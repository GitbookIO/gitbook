import { AdaptivePage } from '@/components/AdaptivePages';
import type { RouteLayoutParams } from '@v2/app/utils';

type PageProps = {
    params: Promise<RouteLayoutParams & { responseId: string }>;
};

export default async function Page(props: PageProps) {
    const params = await props.params;
    return <AdaptivePage responseId={params.responseId} />;
}
