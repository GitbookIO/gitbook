'use client';
import { Icon } from '@gitbook/icons';
import { MotionConfig, motion } from 'motion/react';
import { useCheckForContentUpdate } from '../AutoRefreshContent';
import { useVisitor } from '../Insights';
import { useCurrentPagePath } from '../hooks';
import { HideToolbarButton } from './HideToolbarButton';
import { IframeWrapper } from './IframeWrapper';
import { RefreshContentButton } from './RefreshContentButton';
import {
    Toolbar,
    ToolbarBody,
    ToolbarButton,
    ToolbarButtonGroup,
    type ToolbarButtonProps,
    ToolbarSubtitle,
    ToolbarTitle,
} from './Toolbar';
import {
    type ToolbarControlsContextValue,
    ToolbarControlsProvider,
} from './ToolbarControlsContext';
import { ToolbarDate } from './ToolbarDate';
import type { AdminToolbarClientProps, AdminToolbarContext } from './types';
import { useToolbarVisibility } from './utils';

export function AdminToolbarClient(props: AdminToolbarClientProps) {
    const { context, onPersistentClose, onSessionClose, onToggleMinify } = props;
    const {
        minified,
        setMinified,
        shouldAutoExpand,
        hidden,
        minimize,
        closeSession,
        closePersistent,
    } = useToolbarVisibility({
        onPersistentClose,
        onSessionClose,
        onToggleMinify,
    });

    const visitor = useVisitor();

    const toolbarControls: ToolbarControlsContextValue = {
        minimize,
        closeSession,
        closePersistent,
        shouldAutoExpand,
    };

    if (hidden) {
        return null;
    }

    // If there is a change request, show the change request toolbar
    if (context.changeRequest) {
        return (
            <ToolbarControlsWrapper value={toolbarControls}>
                <ChangeRequestToolbar
                    context={context}
                    minified={minified}
                    onMinifiedChange={setMinified}
                />
            </ToolbarControlsWrapper>
        );
    }

    // If the revision is not the current revision, the user is looking at a previous version of the site, so show the revision toolbar
    if (context.revisionId !== context.space.revision) {
        return (
            <ToolbarControlsWrapper value={toolbarControls}>
                <RevisionToolbar
                    context={context}
                    minified={minified}
                    onMinifiedChange={setMinified}
                />
            </ToolbarControlsWrapper>
        );
    }

    // If the user is authenticated and part of the organization owning this site, show the authenticated user toolbar
    if (visitor?.organizationId === context.organizationId) {
        return (
            <ToolbarControlsWrapper value={toolbarControls}>
                <AuthenticatedUserToolbar
                    context={context}
                    minified={minified}
                    onMinifiedChange={setMinified}
                />
            </ToolbarControlsWrapper>
        );
    }

    return null;
}

/**
 * Reusable wrapper that provides tooling and containers that are used by all types of toolbar views.
 */
export function ToolbarControlsWrapper(
    props: React.PropsWithChildren<{ value: ToolbarControlsContextValue | null }>
) {
    const { children, value } = props;
    return (
        <ToolbarControlsProvider value={value}>
            <IframeWrapper>
                <MotionConfig reducedMotion="user">{children}</MotionConfig>
            </IframeWrapper>
        </ToolbarControlsProvider>
    );
}

interface ToolbarViewProps {
    context: AdminToolbarContext;
    minified: boolean;
    onMinifiedChange: (value: boolean) => void;
}

function ChangeRequestToolbar(props: ToolbarViewProps) {
    const { context, minified, onMinifiedChange } = props;
    const { changeRequest, site } = context;
    if (!changeRequest) {
        throw new Error('Change request is not set');
    }

    const author = changeRequest.createdBy.displayName;

    const { refreshForUpdates, updated } = useCheckForContentUpdate({
        revisionId: changeRequest.revision,
    });

    return (
        <Toolbar minified={minified} onMinifiedChange={onMinifiedChange}>
            <ToolbarBody>
                <ToolbarTitle
                    prefix={`Change #${changeRequest.number}:`}
                    suffix={`${changeRequest.subject || 'Untitled'}`}
                />
                <ToolbarSubtitle
                    subtitle={
                        <>
                            <ToolbarDate value={changeRequest.updatedAt} />{' '}
                            <motion.span layout="position">by {author}</motion.span>
                        </>
                    }
                />
            </ToolbarBody>

            <ToolbarActions>
                {/* Refresh to retrieve latest changes */}
                {updated ? <RefreshContentButton refreshForUpdates={refreshForUpdates} /> : null}

                {/* Edit in GitBook */}
                <EditPageButton href={changeRequest.urls.app} siteId={site.id} />

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

                {/* Open published/live site */}
                {site.urls.published ? (
                    <ToolbarButton
                        title="Open live site"
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
            </ToolbarActions>
        </Toolbar>
    );
}

function RevisionToolbar(props: ToolbarViewProps) {
    const { context, minified, onMinifiedChange } = props;
    const { revision, site } = context;
    if (!revision) {
        throw new Error('Revision is not set');
    }

    const gitURL = revision.git?.url;
    const isGitHub = gitURL?.includes('github.com');
    const gitProvider = isGitHub ? 'GitHub' : 'GitLab';

    return (
        <Toolbar minified={minified} onMinifiedChange={onMinifiedChange}>
            <ToolbarBody>
                <ToolbarTitle prefix="Prior version of " suffix={context.site.title} />
                <ToolbarSubtitle subtitle={<ToolbarDate value={revision.createdAt} />} />
            </ToolbarBody>
            <ToolbarActions>
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
                        title="Open live site"
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
            </ToolbarActions>
        </Toolbar>
    );
}

function AuthenticatedUserToolbar(props: ToolbarViewProps) {
    const { context, minified, onMinifiedChange } = props;
    const { revision, space, site } = context;
    const { refreshForUpdates, updated } = useCheckForContentUpdate({
        revisionId: space.revision,
    });

    return (
        <Toolbar minified={minified} onMinifiedChange={onMinifiedChange}>
            <ToolbarBody>
                <ToolbarTitle suffix={context.site.title} />
                <ToolbarSubtitle subtitle={<ToolbarDate value={revision.createdAt} />} />
            </ToolbarBody>
            <ToolbarActions>
                {/* Refresh to retrieve latest changes */}
                {updated ? <RefreshContentButton refreshForUpdates={refreshForUpdates} /> : null}

                {/* Edit in GitBook */}
                <EditPageButton href={space.urls.app} siteId={site.id} />

                {/* Open site in GitBook */}
                <ToolbarButton
                    title="View site configuration"
                    href={getToolbarHref({
                        href: site.urls.app,
                        siteId: site.id,
                        buttonId: 'site',
                    })}
                    icon="folder-gear"
                />

                {/* Customize in GitBook */}
                <ToolbarButton
                    title="Customize site"
                    href={getToolbarHref({
                        href: `${site.urls.app}/customization/general`,
                        siteId: site.id,
                        buttonId: 'customize',
                    })}
                    icon="palette"
                />

                {/* Open insights in GitBook */}
                <ToolbarButton
                    title="Open insights"
                    href={getToolbarHref({
                        href: `${site.urls.app}/insights`,
                        siteId: site.id,
                        buttonId: 'insights',
                    })}
                    icon="chart-simple"
                />
            </ToolbarActions>
        </Toolbar>
    );
}

function ToolbarActions(props: { children: React.ReactNode }) {
    const { children } = props;

    return (
        <ToolbarButtonGroup>
            {children}
            <HideToolbarButton />
        </ToolbarButtonGroup>
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
            title="Edit this page"
            href={getToolbarHref({
                href: `${href}${pagePath.startsWith('/') ? pagePath.slice(1) : pagePath}`,
                siteId,
                buttonId: 'edit',
            })}
            icon="pen-to-square"
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
