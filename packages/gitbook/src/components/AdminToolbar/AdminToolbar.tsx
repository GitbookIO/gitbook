import type { GitBookSiteContext } from '@/lib/context';
import { AdminToolbarClient } from './AdminToolbarClient';

export interface AdminToolbarProps {
    context: GitBookSiteContext;
}

// Serializable version of GitBookSiteContext (excludes functions)
export type SerializableGitBookSiteContext = Omit<
    GitBookSiteContext,
    'linker' | 'imageResizer' | 'dataFetcher'
>;

export interface AdminToolbarClientProps {
    context: SerializableGitBookSiteContext;
}

/**
 * Server component that determines what type of toolbar to show and passes data to client component
 */
export async function AdminToolbar(props: AdminToolbarProps) {
    const { context } = props;

    if (context.changeRequest || context.revisionId !== context.space.revision) {
        // Create a serializable version of the context by removing function-containing objects
        const { linker, imageResizer, dataFetcher, ...serializableContext } = context;

        return <AdminToolbarClient context={serializableContext} />;
    }
}
