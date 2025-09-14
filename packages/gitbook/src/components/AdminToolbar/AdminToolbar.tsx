import type { GitBookSiteContext } from '@/lib/context';
import { AdminToolbarClient } from './AdminToolbarClient';

export interface AdminToolbarProps {
    context: GitBookSiteContext;
}

// Minimal types containing only the fields needed for AdminToolbar to restrict what gets serialized
export type MinimalChangeRequest = {
    id: string;
    number: number;
    subject: string | null;
    revision: string;
    updatedAt: string;
    createdBy: {
        displayName: string;
    };
    urls: {
        app: string;
    };
};

export type MinimalRevision = {
    createdAt: string;
    urls: {
        app: string;
    };
    git?: {
        url: string | undefined;
    } | null;
};

export type AdminToolbarContext = {
    organizationId: string;
    revisionId: string;
    space: {
        id: string;
        revision: string;
        urls: {
            app: string;
        };
    };
    changeRequest: MinimalChangeRequest | null;
    revision: MinimalRevision;
    site: {
        title: string;
        urls: {
            app: string;
            published: string | undefined;
        };
    };
};

export interface AdminToolbarClientProps {
    context: AdminToolbarContext;
}

/**
 * Server component that determines what type of toolbar to show and passes data to client component
 */
export async function AdminToolbar(props: AdminToolbarProps) {
    const { context } = props;

    // Create a minimal context with only the fields needed for AdminToolbar
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
            title: context.site.title,
            urls: {
                app: context.site.urls.app,
                published: context.site.urls.published,
            },
        },
    };

    return <AdminToolbarClient context={minimalContext} />;
}
