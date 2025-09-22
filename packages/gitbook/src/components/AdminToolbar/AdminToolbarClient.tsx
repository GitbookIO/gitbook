'use client';
import { Icon } from '@gitbook/icons';
import { MotionConfig } from 'motion/react';
import { useCheckForContentUpdate } from '../AutoRefreshContent';
import { useVisitorSession } from '../Insights';
import { useCurrentPagePath } from '../hooks';
import { DateRelative } from '../primitives';
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
import type { AdminToolbarClientProps } from './types';

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
    if (visitorSession?.organizationId === context.organizationId) {
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

    const { refreshForUpdates, updated } = useCheckForContentUpdate({
        revisionId: changeRequest.revision,
    });

    return (
        <Toolbar label="Site preview">
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
                {updated ? <RefreshContentButton refreshForUpdates={refreshForUpdates} /> : null}
                {/* Comment in app */}
                <ToolbarButton
                    title="Comment in a GitBook"
                    href={getToolbarHref({
                        href: `${changeRequest.urls.app}~/comments`,
                        siteId: site.id,
                        buttonId: 'comment',
                    })}
                    icon="comment"
                />

                {/* Open production site */}
                {site.urls.published ? (
                    <ToolbarButton
                        title="Open production site"
                        href={getToolbarHref({
                            href: site.urls.published,
                            siteId: site.id,
                            buttonId: 'production-site',
                        })}
                        icon="globe"
                    />
                ) : null}

                {/* Open CR in GitBook */}
                <ToolbarButton
                    title="View change request in GitBook"
                    href={getToolbarHref({
                        href: changeRequest.urls.app,
                        siteId: site.id,
                        buttonId: 'change-request',
                    })}
                    icon="code-pull-request"
                />

                {/* Edit in GitBook */}
                <EditPageButton href={changeRequest.urls.app} siteId={site.id} />
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
        <Toolbar label="Site preview">
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
                {site.urls.published ? (
                    <ToolbarButton
                        title="Open production site"
                        href={getToolbarHref({
                            href: site.urls.published,
                            siteId: site.id,
                            buttonId: 'production-site',
                        })}
                        icon="globe"
                    />
                ) : null}
                <ToolbarButton
                    title="View this revision in GitBook"
                    href={getToolbarHref({
                        href: revision.urls.app,
                        siteId: site.id,
                        buttonId: 'revision',
                    })}
                    icon="code-commit"
                />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function AuthenticatedUserToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { revision, space, site } = context;
    const { refreshForUpdates, updated } = useCheckForContentUpdate({
        revisionId: space.revision,
    });

    return (
        <Toolbar label="Only visible to your GitBook organization">
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
                {updated ? <RefreshContentButton refreshForUpdates={refreshForUpdates} /> : null}
                <ToolbarButton
                    title="Open site in GitBook"
                    href={getToolbarHref({
                        href: site.urls.app,
                        siteId: site.id,
                        buttonId: 'site',
                    })}
                    icon="gear"
                />
                <ToolbarButton
                    title="Customize in GitBook"
                    href={getToolbarHref({
                        href: `${site.urls.app}/customization/general`,
                        siteId: site.id,
                        buttonId: 'customize',
                    })}
                    icon="palette"
                />
                <ToolbarButton
                    title="Open insights in GitBook"
                    href={getToolbarHref({
                        href: `${site.urls.app}/insights`,
                        siteId: site.id,
                        buttonId: 'insights',
                    })}
                    icon="chart-simple"
                />
                <EditPageButton href={space.urls.app} siteId={site.id} />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function EditPageButton(props: {
    href: string;
    siteId: string;
    motionValues?: ToolbarButtonProps['motionValues'];
}) {
    const { href, motionValues, siteId } = props;
    const pagePath = useCurrentPagePath();

    return (
        <ToolbarButton
            title="Edit in GitBook"
            href={getToolbarHref({
                href: `${href}${pagePath.startsWith('/') ? pagePath.slice(1) : pagePath}`,
                siteId,
                buttonId: 'edit',
            })}
            icon="pencil"
            motionValues={motionValues}
        />
    );
}

/**
 * Append utm parameters to a URL to track usage of the toolbar.
 */
function getToolbarHref({
    href,
    siteId,
    buttonId,
}: { href: string; siteId: string; buttonId: string }) {
    const url = new URL(href);
    url.searchParams.set('utm_source', 'content');
    url.searchParams.set('utm_medium', 'toolbar');
    url.searchParams.set('utm_campaign', siteId);
    url.searchParams.set('utm_content', buttonId);

    return url.toString();
}
