import { AdaptivePage } from '@/components/AdaptivePages';
import type { RouteLayoutParams } from '@v2/app/utils';

type PageProps = {
    params: Promise<RouteLayoutParams>;
};

export default async function Page(_props: PageProps) {
    return <AdaptivePage />;
}
