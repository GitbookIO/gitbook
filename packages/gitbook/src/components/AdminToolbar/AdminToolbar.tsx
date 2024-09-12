import { Space } from '@gitbook/api';
import React from 'react';

import { SiteContentPointer, getChangeRequest, getRevision } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

interface AdminToolbarProps {
    content: SiteContentPointer;
    space: Space;
}

/**
 * Toolbar with information for the content admin when previewing a revision or change-request.
 */
export function AdminToolbar(props: AdminToolbarProps) {
    const { content } = props;

    const toolbar = (() => {
        if (content.changeRequestId) {
            return (
                <ChangeRequestToolbar
                    spaceId={content.spaceId}
                    changeRequestId={content.changeRequestId}
                />
            );
        }

        if (content.revisionId) {
            return <RevisionToolbar spaceId={content.spaceId} revisionId={content.revisionId} />;
        }

        return null;
    })();

    if (!toolbar) {
        return null;
    }

    return (
        <div
            className={tcls(
                'fixed',
                'bottom-5',
                'left-1/2',
                'z-50',
                'transform',
                '-translate-x-1/2',
                'rounded-full',
                'bg-dark-1/9',
                'shadow-lg',
                'min-h-10',
                'min-w-40',
                'p-2',
                'max-w-md',
                'border-dark-1',
                'backdrop-blur-sm',
            )}
        >
            <React.Suspense fallback={null}>{toolbar}</React.Suspense>
        </div>
    );
}

async function ChangeRequestToolbar(props: { spaceId: string; changeRequestId: string }) {
    const { spaceId, changeRequestId } = props;

    const changeRequest = await getChangeRequest(spaceId, changeRequestId);

    return (
        <ToolbarButton href={changeRequest.urls.app}>
            Change request #{changeRequest.number}: {changeRequest.subject ?? 'No subject'}
        </ToolbarButton>
    );
}

async function RevisionToolbar(props: { spaceId: string; revisionId: string }) {
    const { spaceId, revisionId } = props;

    const revision = await getRevision(spaceId, revisionId, {
        metadata: false,
    });

    return (
        <ToolbarButton href={revision.urls.app}>
            Revision created on {new Date(revision.createdAt).toLocaleDateString()}
        </ToolbarButton>
    );
}

function ToolbarButton(props: { href: string; children: React.ReactNode }) {
    const { href, children } = props;

    return (
        <a
            href={href}
            className={tcls(
                'block',
                'text-sm',
                'px-4',
                'py-1',
                'rounded-full',
                'hover:bg-dark-1',
                'hover:text-white',
                'truncate',
                'text-light',
                'dark:text-light',
                'dark:hover:bg-dark-2',
            )}
        >
            {children}
        </a>
    );
}
