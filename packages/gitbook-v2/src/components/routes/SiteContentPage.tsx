import { GitBookSiteContext } from '@v2/lib/context';
import Link from 'next/link';

export async function SiteContentPage({ context }: { context: GitBookSiteContext }) {
    const { site, linker } = context;

    return (
        <div>
            <p>Found site {site.id}</p>
            <Link href={linker.toPathInSpace('hello/world')}>Hello world</Link>
        </div>
    );
}
