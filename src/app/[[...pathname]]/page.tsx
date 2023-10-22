import { headers } from 'next/headers';

import { api } from '@/lib/api';
import { SpaceContent } from '@/components/SpaceContent';

export default async function Page(props: { params: { pathname?: string[] } }) {
    const {
        params: { pathname },
    } = props;

    const headersList = headers();
    const spaceId = headersList.get('x-gitbook-space');

    if (!spaceId) {
        throw new Error('Missing space id');
    }

    const [{ data: space }, { data: revision }] = await Promise.all([
        api().spaces.getSpaceById(spaceId),
        api().spaces.getCurrentRevision(spaceId),
    ]);

    return (
        <SpaceContent
            space={space}
            revision={revision}
            pagePath={pathname ? pathname.join('/') : ''}
        />
    );
}
