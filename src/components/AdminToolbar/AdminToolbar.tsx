import React from 'react';

import { ContentPointer, getChangeRequest, getRevision, getRevisionPages } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

interface AdminToolbarProps {
    content: ContentPointer;
}

/**
 * Toolbar with information for the content admin when previewing a revision or change-request.
 */
export function AdminToolbar(props: AdminToolbarProps) {
    const { content } = props;

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
                'bg-slate-950',
                'shadow-lg',
                'min-h-10',
                'min-w-40',
                'p-2',
                'max-w-md',
                'border-slate-300',
            )}
        >
            <React.Suspense fallback={null}>
                {content.changeRequestId ? (
                    <ChangeRequestToolbar
                        spaceId={content.spaceId}
                        changeRequestId={content.changeRequestId}
                    />
                ) : null}
                {content.revisionId ? (
                    <RevisionToolbar spaceId={content.spaceId} revisionId={content.revisionId} />
                ) : null}
            </React.Suspense>
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

    const revision = await getRevision(spaceId, revisionId);

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
                'text-slate-400',
                'rounded-full',
                'hover:bg-slate-800',
                'hover:text-white',
                'truncate',
            )}
        >
            {children}
        </a>
    );
}
