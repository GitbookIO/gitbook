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
    space: {
        id: string;
        revision: string;
    };
    changeRequest: MinimalChangeRequest | null;
    revision: MinimalRevision;
    revisionId: string;
    site: {
        title: string;
        urls: {
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

    if (context.changeRequest || context.revisionId !== context.space.revision) {
        // Create a minimal context with only the fields needed for AdminToolbar
        const minimalContext: AdminToolbarContext = {
            space: {
                id: context.space.id,
                revision: context.space.revision,
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
            revisionId: context.revisionId,
            site: {
                title: context.site.title,
                urls: {
                    published: context.site.urls.published,
                },
            },
        };

        return <AdminToolbarClient context={minimalContext} />;
    }
}
