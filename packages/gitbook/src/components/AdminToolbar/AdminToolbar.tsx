import { Space } from '@gitbook/api';
import { Icon } from '@gitbook/icons';
import React from 'react';

import { ContentPointer, getChangeRequest, getRevision } from '@/lib/api';
import { tcls } from '@/lib/tailwind';

import { DateRelative } from '../primitives';

interface AdminToolbarProps {
    content: ContentPointer;
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
        <Toolbar>
            <ToolbarButton title="Open in application" href={changeRequest.urls.app}>
                <Icon icon="code-branch" className="size-4" />
            </ToolbarButton>
            <ToolbarBody>
                <p>
                    #{changeRequest.number}: {changeRequest.subject ?? 'No subject'}
                </p>
                <p className="text-xs text-light/8 dark:text-light/8">
                    Change request updated <DateRelative value={changeRequest.updatedAt} />
                </p>
            </ToolbarBody>
            <ToolbarButtonGroups>
                <ToolbarButton title="Open in application" href={changeRequest.urls.app}>
                    <Icon icon="arrow-up-right-from-square" className="size-4" />
                </ToolbarButton>
                <ToolbarButton title="Refresh" href={'?'}>
                    <Icon icon="rotate-right" className="size-4" />
                </ToolbarButton>
            </ToolbarButtonGroups>
        </Toolbar>
    );
}

async function RevisionToolbar(props: { spaceId: string; revisionId: string }) {
    const { spaceId, revisionId } = props;

    const revision = await getRevision(spaceId, revisionId, {
        metadata: true,
    });

    return (
        <Toolbar>
            <ToolbarButton title="Open in application" href={revision.urls.app}>
                <Icon icon="code-commit" className="size-4" />
            </ToolbarButton>
            <ToolbarBody>
                <p>
                    Revision created <DateRelative value={revision.createdAt} />
                </p>
                {revision.git ? (
                    <p className="text-xs text-light/8 dark:text-light/8">{revision.git.message}</p>
                ) : null}
            </ToolbarBody>
            <ToolbarButtonGroups>
                <ToolbarButton title="Open in application" href={revision.urls.app}>
                    <Icon icon="arrow-up-right-from-square" className="size-4" />
                </ToolbarButton>
                {revision.git?.url ? (
                    <ToolbarButton title="Open git commit" href={revision.git.url}>
                        <Icon
                            icon={revision.git.url.includes('github.com') ? 'github' : 'gitlab'}
                            className="size-4"
                        />
                    </ToolbarButton>
                ) : null}
            </ToolbarButtonGroups>
        </Toolbar>
    );
}

function Toolbar(props: { children: React.ReactNode }) {
    const { children } = props;

    return (
        <div
            className={tcls(
                'flex',
                'flex-row',
                'items-center',
                'gap-4',
                'text-sm',
                'px-4',
                'py-1',
                'rounded-full',
                'truncate',
                'text-light',
                'dark:text-light',
            )}
        >
            {children}
        </div>
    );
}

function ToolbarBody(props: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1">{props.children}</div>;
}

function ToolbarButtonGroups(props: { children: React.ReactNode }) {
    return <div className="flex flex-row gap-2">{props.children}</div>;
}

function ToolbarButton(props: { title: string; href: string; children: React.ReactNode }) {
    const { title, href, children } = props;
    return (
        <a
            title={title}
            href={href}
            className={tcls(
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'size-11',
                'gap-1',
                'text-sm',
                'rounded-full',
                'hover:bg-dark-1',
                'hover:text-white',
                'truncate',
                'text-light',
                'dark:text-light',
                'dark:hover:bg-dark-2',
                'hover:shadow-lg',
            )}
        >
            {children}
        </a>
    );
}
