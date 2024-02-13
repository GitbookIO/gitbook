import { Space } from '@gitbook/api';
import { headers } from 'next/headers';
import React from 'react';

import { ContentPointer, getChangeRequest, getRevision, getRevisionPages } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

interface AdminToolbarProps {
    content: ContentPointer;
    space: Space;
}

/**
 * Toolbar with information for the content admin when previewing a revision or change-request.
 */
export function AdminToolbar(props: AdminToolbarProps) {
    const { content, space } = props;
    const headersSet = headers();

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

        if (headersSet.get('x-gitbook-mode') === 'multi-id') {
            return <ShareFeedbackToolbar space={space} />;
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
                'bg-slate-950',
                'shadow-lg',
                'min-h-10',
                'min-w-40',
                'p-2',
                'max-w-md',
                'border-slate-300',
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

    const revision = await getRevision(spaceId, revisionId);

    return (
        <ToolbarButton href={revision.urls.app}>
            Revision created on {new Date(revision.createdAt).toLocaleDateString()}
        </ToolbarButton>
    );
}

async function ShareFeedbackToolbar(props: { space: Space }) {
    const { space } = props;

    return (
        <ToolbarButton
            href={`https://survey.refiner.io/e61q1m-ejr82o?response_organization_id=${space.organization}&response_space_id=${space.id}&response_org_id=${space.organization}&contact_space=${space.id}&response_source=open-preview-feedback`}
        >
            Share feedback about the new version
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
