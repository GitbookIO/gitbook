/*
 * Minimal types containing only the fields needed for AdminToolbar to restrict what gets serialized
 */

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

export type MinimalSpace = {
    id: string;
    revision: string;
    urls: {
        app: string;
    };
};

export type MinimalSite = {
    id: string;
    title: string;
    urls: {
        app: string;
        published: string | undefined;
    };
};

export type AdminToolbarContext = {
    organizationId: string;
    revisionId: string;
    space: MinimalSpace;
    changeRequest: MinimalChangeRequest | null;
    revision: MinimalRevision;
    site: MinimalSite;
};

export interface AdminToolbarClientProps {
    context: AdminToolbarContext;
}
