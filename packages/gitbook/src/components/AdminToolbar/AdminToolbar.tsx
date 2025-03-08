import { Icon } from '@gitbook/icons';
import type { GitBookSiteContext } from '@v2/lib/context';
import { headers } from 'next/headers';
import React from 'react';

import { tcls } from '@/lib/tailwind';
import { throwIfDataError } from '@v2/lib/data';

import { DateRelative } from '../primitives';
import { RefreshChangeRequestButton } from './RefreshChangeRequestButton';
import { Toolbar, ToolbarBody, ToolbarButton, ToolbarButtonGroups } from './Toolbar';

interface AdminToolbarProps {
    context: GitBookSiteContext;
}

function ToolbarLayout(props: { children: React.ReactNode }) {
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

                'bg-tint-12/9',
                'dark:bg-tint-1/9',

                'shadow-lg',
                'min-h-10',
                'min-w-40',
                'p-2',
                'max-w-md',
                'border-tint-12/1',
                'backdrop-blur-md'
            )}
        >
            <React.Suspense fallback={null}>{props.children}</React.Suspense>
        </div>
    );
}

/**
 * Toolbar with information for the content admin when previewing a revision or change-request.
 */
export async function AdminToolbar(props: AdminToolbarProps) {
    const { context } = props;
    const mode = (await headers()).get('x-gitbook-mode');

    if (mode === 'multi-id') {
        // We don't show the admin toolbar in multi-id mode, as it's used for previewing in the dashboard.
        return null;
    }

    if (context.changeRequest) {
        return <ChangeRequestToolbar context={context} />;
    }

    if (context.revisionId !== context.space.revision) {
        return <RevisionToolbar context={context} />;
    }

    return null;
}

async function ChangeRequestToolbar(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { space, changeRequest } = context;

    if (!changeRequest) {
        return null;
    }

    return (
        <ToolbarLayout>
            <Toolbar>
                <ToolbarButton title="Open in application" href={changeRequest.urls.app}>
                    <Icon icon="code-branch" className="size-4" />
                </ToolbarButton>
                <ToolbarBody>
                    <p>
                        #{changeRequest.number}: {changeRequest.subject ?? 'No subject'}
                    </p>
                    <p className="text-tint-2 text-xs dark:text-tint-11">
                        Change request updated <DateRelative value={changeRequest.updatedAt} />
                    </p>
                </ToolbarBody>
                <ToolbarButtonGroups>
                    <ToolbarButton title="Open in application" href={changeRequest.urls.app}>
                        <Icon icon="arrow-up-right-from-square" className="size-4" />
                    </ToolbarButton>
                    <RefreshChangeRequestButton
                        spaceId={space.id}
                        changeRequestId={changeRequest.id}
                        revisionId={changeRequest.revision}
                        updatedAt={new Date(changeRequest.updatedAt).getTime()}
                    />
                </ToolbarButtonGroups>
            </Toolbar>
        </ToolbarLayout>
    );
}

async function RevisionToolbar(props: { context: GitBookSiteContext }) {
    const { context } = props;
    const { space, revisionId } = context;

    const revision = await throwIfDataError(
        context.dataFetcher.getRevision({
            spaceId: space.id,
            revisionId,
            metadata: true,
        })
    );

    return (
        <ToolbarLayout>
            <Toolbar>
                <ToolbarButton title="Open in application" href={revision.urls.app}>
                    <Icon icon="code-commit" className="size-4" />
                </ToolbarButton>
                <ToolbarBody>
                    <p>
                        Revision created <DateRelative value={revision.createdAt} />
                    </p>
                    {revision.git ? (
                        <p className="text-tint-2 text-xs dark:text-tint-11">
                            {revision.git.message}
                        </p>
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
        </ToolbarLayout>
    );
}
