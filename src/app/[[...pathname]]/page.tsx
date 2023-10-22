import { headers } from 'next/headers';

import { api } from '@/lib/api';
import { SpaceContent } from '@/components/SpaceContent';

interface PageParams {
    pathname?: string[];
}

export default async function Page(props: { params: PageParams }) {
    const {
        params: { pathname },
    } = props;

    const { space, revision } = await fetchData(props.params);

    return (
        <SpaceContent
            space={space}
            revision={revision}
            pagePath={pathname ? pathname.join('/') : ''}
        />
    );
}

export async function generateMetadata({ params }: { params: PageParams }) {
    const { space, revision } = await fetchData(params);

    return {
        title: space.title,
    };
}

/**
 * Fetch all the data needed for the page.
 */
async function fetchData(params: PageParams) {
    const headersList = headers();
    const spaceId = headersList.get('x-gitbook-space');

    if (!spaceId) {
        throw new Error('Missing space id');
    }

    const [{ data: space }, { data: revision }] = await Promise.all([
        api().spaces.getSpaceById(spaceId),
        api().spaces.getCurrentRevision(spaceId),
    ]);

    return {
        space,
        revision,
    };
}
