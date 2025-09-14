'use client';
import { Icon } from '@gitbook/icons';
import { MotionConfig } from 'motion/react';
import { useVisitorSession } from '../Insights';
import { useCurrentPagePath } from '../hooks';
import { DateRelative } from '../primitives';
import type { AdminToolbarClientProps } from './AdminToolbar';
import { IframeWrapper } from './IframeWrapper';
import { RefreshContentButton } from './RefreshContentButton';
import {
    Toolbar,
    ToolbarBody,
    ToolbarButton,
    ToolbarButtonGroup,
    type ToolbarButtonProps,
    ToolbarSeparator,
    ToolbarSubtitle,
    ToolbarTitle,
} from './Toolbar';

export function AdminToolbarClient(props: AdminToolbarClientProps) {
    const { context } = props;
    const visitorSession = useVisitorSession();

    // If there is a change request, show the change request toolbar
    if (context.changeRequest) {
        return (
            <IframeWrapper>
                <MotionConfig reducedMotion="user">
                    <ChangeRequestToolbar context={context} />
                </MotionConfig>
            </IframeWrapper>
        );
    }

    // If the revision is not the current revision, the user is looking at a previous version of the site, so show the revision toolbar
    if (context.revisionId !== context.space.revision) {
        return (
            <IframeWrapper>
                <MotionConfig reducedMotion="user">
                    <RevisionToolbar context={context} />
                </MotionConfig>
            </IframeWrapper>
        );
    }

    // If the user is authenticated and part of the organization owning this site, show the authenticated user toolbar
    if (visitorSession?.organizationId === context.organizationId || 1) {
        return (
            <IframeWrapper>
                <MotionConfig reducedMotion="user">
                    <AuthenticatedUserToolbar context={context} />
                </MotionConfig>
            </IframeWrapper>
        );
    }
}

function ChangeRequestToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { changeRequest, site } = context;
    if (!changeRequest) {
        throw new Error('Change request is not set');
    }

    const author = changeRequest.createdBy.displayName;

    return (
        <Toolbar>
            <ToolbarBody>
                <ToolbarTitle
                    prefix="Change request"
                    suffix={`#${changeRequest.number} ${changeRequest.subject || 'Untitled'}`}
                />
                <ToolbarSubtitle
                    subtitle={
                        <>
                            <DateRelative value={changeRequest.updatedAt} /> by {author}
                        </>
                    }
                />
            </ToolbarBody>

            <ToolbarSeparator />

            <ToolbarButtonGroup>
                {/* Refresh to retrieve latest changes */}
                <RefreshContentButton
                    revisionId={changeRequest.revision}
                    updatedAt={new Date(changeRequest.updatedAt).getTime()}
                />
                {/* Comment in app */}
                <ToolbarButton
                    title="Comment in a GitBook"
                    href={`${changeRequest.urls.app}~/comments`}
                    icon="comment"
                />

                {/* Open production site */}
                <ToolbarButton
                    title="Open production site"
                    href={site.urls.published}
                    icon="globe"
                />

                {/* Open CR in GitBook */}
                <ToolbarButton
                    title="View change request in GitBook"
                    href={changeRequest.urls.app}
                    icon="code-pull-request"
                />

                {/* Edit in GitBook */}
                <EditPageButton href={changeRequest.urls.app} />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function RevisionToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { revision, site } = context;
    if (!revision) {
        throw new Error('Revision is not set');
    }

    const gitURL = revision.git?.url;
    const isGitHub = gitURL?.includes('github.com');
    const gitProvider = isGitHub ? 'GitHub' : 'GitLab';

    return (
        <Toolbar>
            <ToolbarBody>
                <ToolbarTitle prefix="Site version" suffix={context.site.title} />
                <ToolbarSubtitle
                    subtitle={
                        <>
                            Created <DateRelative value={revision.createdAt} />
                        </>
                    }
                />
            </ToolbarBody>
            <ToolbarSeparator />
            <ToolbarButtonGroup>
                {/* Open commit in Git client */}
                <ToolbarButton
                    title={
                        gitURL ? (
                            `Open commit in ${gitProvider}`
                        ) : (
                            <div className="flex items-center gap-2">
                                Setup GitSync to edit using Git{' '}
                                <div className="flex items-center gap-1 text-neutral-8 text-xs hover:text-neutral-6 hover:underline dark:text-neutral-3">
                                    <a
                                        href="https://gitbook.com/docs/getting-started/git-sync"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className=""
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Learn more
                                    </a>
                                    <Icon icon="arrow-up-right" className="size-3" />
                                </div>
                            </div>
                        )
                    }
                    href={gitURL}
                    disabled={!gitURL}
                    icon={gitURL ? (isGitHub ? 'github' : 'gitlab') : 'github'}
                />
                <ToolbarButton
                    title="Open production site"
                    href={site.urls.published}
                    icon="globe"
                />
                <ToolbarButton
                    title="View this revision in GitBook"
                    href={revision.urls.app}
                    icon="code-commit"
                />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function AuthenticatedUserToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { revision, space, site } = context;
    return (
        <Toolbar>
            <ToolbarBody>
                <ToolbarTitle prefix="Site" suffix={context.site.title} />
                <ToolbarSubtitle
                    subtitle={
                        <>
                            Updated <DateRelative value={revision.createdAt} />
                        </>
                    }
                />
            </ToolbarBody>
            <ToolbarSeparator />
            <ToolbarButtonGroup>
                {/* Refresh to retrieve latest changes */}
                <RefreshContentButton
                    revisionId={space.revision}
                    updatedAt={new Date(revision.createdAt).getTime()}
                />
                <ToolbarButton title="Open site in GitBook" href={site.urls.app} icon="gear" />
                <ToolbarButton
                    title="Customize in GitBook"
                    href={`${site.urls.app}/customization/general`}
                    icon="palette"
                />
                <ToolbarButton
                    title="Open insights in GitBook"
                    href={`${site.urls.app}/insights`}
                    icon="chart-simple"
                />
                <EditPageButton href={space.urls.app} />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function EditPageButton(props: {
    href: string;
    motionValues?: ToolbarButtonProps['motionValues'];
}) {
    const { href, motionValues } = props;
    const pagePath = useCurrentPagePath();

    return (
        <ToolbarButton
            title="Edit in GitBook"
            href={`${href}${pagePath.startsWith('/') ? pagePath.slice(1) : pagePath}`}
            icon="pencil"
            motionValues={motionValues}
        />
    );
}
