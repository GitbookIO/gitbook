import type { GitBookSiteContext } from '@/lib/context';
import { AdminToolbarClient } from './AdminToolbarClient';
import type { AdminToolbarContext } from './types';

export interface AdminToolbarProps {
    context: GitBookSiteContext;
}

/**
 * Server component that determines what type of toolbar to show and passes data to client component
 */
export async function AdminToolbar(props: AdminToolbarProps) {
    const { context } = props;

    // Create a minimal context to avoid serializing and passing too many data to the client
    const minimalContext: AdminToolbarContext = {
        organizationId: context.organizationId,
        revisionId: context.revisionId,
        space: {
            id: context.space.id,
            revision: context.space.revision,
            urls: {
                app: context.space.urls.app,
            },
        },
        changeRequest: context.changeRequest
            ? {
                  id: context.changeRequest.id,
                  number: context.changeRequest.number,
                  subject: context.changeRequest.subject,
                  revision: context.changeRequest.revision,
                  updatedAt: context.changeRequest.updatedAt,
                  createdBy: {
                      displayName: context.changeRequest.createdBy.displayName,
                  },
                  urls: {
                      app: context.changeRequest.urls.app,
                  },
              }
            : null,
        revision: {
            createdAt: context.revision.createdAt,
            urls: {
                app: context.revision.urls.app,
            },
            git: context.revision.git
                ? {
                      url: context.revision.git.url,
                  }
                : null,
        },
        site: {
            id: context.site.id,
            title: context.site.title,
            urls: {
                app: context.site.urls.app,
                published: context.site.urls.published,
            },
        },
    };

    return <AdminToolbarClient context={minimalContext} />;
}
