'use client';
import { Icon } from '@gitbook/icons';
import { MotionConfig } from 'motion/react';
import * as motion from 'motion/react-client';
import { DateRelative } from '../primitives';
import type { AdminToolbarClientProps } from './AdminToolbar';
import { IframeWrapper } from './IframeWrapper';
import { RefreshChangeRequestButton } from './RefreshChangeRequestButton';
import {
    Toolbar,
    ToolbarBody,
    ToolbarButton,
    ToolbarButtonGroup,
    ToolbarSeparator,
} from './Toolbar';
import { getCopyVariants } from './transitions';

export function AdminToolbarClient(props: AdminToolbarClientProps) {
    const { context } = props;

    if (context.changeRequest) {
        return (
            <IframeWrapper>
                <MotionConfig reducedMotion="user">
                    <ChangeRequestToolbar context={context} />
                </MotionConfig>
            </IframeWrapper>
        );
    }

    if (context.revisionId !== context.space.revision) {
        return (
            <IframeWrapper>
                <MotionConfig reducedMotion="user">
                    <RevisionToolbar context={context} />
                </MotionConfig>
            </IframeWrapper>
        );
    }

    return null;
}

function ChangeRequestToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { space, changeRequest, site } = context;

    if (!changeRequest) {
        return null;
    }

    const crLabel = changeRequest.subject || 'Untitled';
    const author = changeRequest.createdBy.displayName;

    return (
        <Toolbar>
            <ToolbarBody>
                <ToolbarTitle prefix="Change request" suffix={crLabel} />
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
                <RefreshChangeRequestButton
                    spaceId={space.id}
                    changeRequestId={changeRequest.id}
                    revisionId={changeRequest.revision}
                    updatedAt={new Date(changeRequest.updatedAt).getTime()}
                    key="refresh-button"
                />
                {/* Comment in app */}
                <ToolbarButton
                    title="Comment in app"
                    href={`${changeRequest.urls.app}~/comments`}
                    key="comment-button"
                    icon="comment"
                />

                {/* Open production site */}
                <ToolbarButton
                    title="Open production site"
                    href={site.urls.published}
                    key="open-production-site-button"
                    icon="globe"
                />

                {/* Open CR in GitBook */}
                <ToolbarButton
                    title="View CR in GitBook"
                    href={changeRequest.urls.app}
                    key="view-change-request-button"
                    icon="code-branch"
                />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function RevisionToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { revision, site } = context;

    if (!revision) {
        return null;
    }

    const gitURL = revision.git?.url;

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
                            'Open commit in Git client'
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
                    icon={gitURL ? (gitURL.includes('github.com') ? 'github' : 'gitlab') : 'github'}
                />
                <ToolbarButton
                    title="Open production site"
                    href={site.urls.published}
                    key="open-production-site-button"
                    icon="globe"
                />
                <ToolbarButton
                    title="View this version in GitBook"
                    href={revision.urls.app}
                    icon="code-commit"
                />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}

function ToolbarTitle(props: { prefix: string; suffix: string }) {
    return (
        <div className="flex items-center gap-1 text-xs ">
            <ToolbarTitlePrefix title={props.prefix} />
            <ToolbarTitleSuffix title={props.suffix} />
        </div>
    );
}

function ToolbarTitlePrefix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(0)}
            className="font-light text-neutral-7 dark:text-neutral-3"
        >
            {props.title}
        </motion.span>
    );
}

function ToolbarTitleSuffix(props: { title: string }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="max-w-[24ch] truncate font-semibold text-neutral-3 dark:text-neutral-2"
        >
            {props.title}
        </motion.span>
    );
}

function ToolbarSubtitle(props: { subtitle: React.ReactNode }) {
    return (
        <motion.span
            {...getCopyVariants(1)}
            className="text-neutral-7 text-xxs dark:text-neutral-2"
        >
            {props.subtitle}
        </motion.span>
    );
}
