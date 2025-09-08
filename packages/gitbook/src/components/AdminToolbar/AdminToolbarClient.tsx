'use client';
import { useReducedMotion } from 'framer-motion';
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
                <ChangeRequestToolbar context={context} />
            </IframeWrapper>
        );
    }

    if (context.revisionId !== context.space.revision) {
        return (
            <IframeWrapper>
                <RevisionToolbar context={context} />
            </IframeWrapper>
        );
    }

    return null;
}

function ChangeRequestToolbar(props: AdminToolbarClientProps) {
    const { context } = props;
    const { space, changeRequest, site } = context;
    const reduceMotion = Boolean(useReducedMotion());

    if (!changeRequest) {
        return null;
    }

    const crLabel = changeRequest.subject || 'Untitled change request';
    const author = changeRequest.createdBy.displayName;

    return (
        <Toolbar>
            <ToolbarBody>
                <div className="flex items-center gap-1 text-xs">
                    <motion.span
                        {...(reduceMotion ? undefined : { ...getCopyVariants(0) })}
                        className="font-light text-neutral-7 dark:text-neutral-3"
                    >
                        #{changeRequest.number}
                    </motion.span>
                    <motion.span
                        {...(reduceMotion ? undefined : { ...getCopyVariants(1) })}
                        className="max-w-[24ch] truncate font-semibold text-neutral-3 dark:text-neutral-2"
                    >
                        {crLabel}
                    </motion.span>
                </div>
                <motion.span
                    {...(reduceMotion ? undefined : { ...getCopyVariants(2) })}
                    className="text-[10px] text-neutral-7 text-xs dark:text-neutral-2"
                >
                    <DateRelative value={changeRequest.updatedAt} /> by {author}
                </motion.span>
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
                    href={`${site.urls.published}`}
                    key="open-production-site-button"
                    icon="globe"
                />

                {/* Open CR in GitBook */}
                <ToolbarButton
                    title="View CR in GitBook"
                    href={`${changeRequest.urls.app}`}
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
    const reduceMotion = Boolean(useReducedMotion());

    if (!revision) {
        return null;
    }

    const gitURL = revision.git?.url;

    return (
        <Toolbar>
            <ToolbarBody>
                <div className="flex items-center gap-1 text-xs">
                    <motion.span
                        {...(reduceMotion ? undefined : { ...getCopyVariants(0) })}
                        className="font-light text-neutral-7 dark:text-neutral-3"
                    >
                        Site revision
                    </motion.span>
                    <motion.span
                        {...(reduceMotion ? undefined : { ...getCopyVariants(1) })}
                        className="max-w-[24ch] truncate font-semibold text-neutral-3 dark:text-neutral-2"
                    >
                        {context.site.title}
                    </motion.span>
                </div>
                <motion.span
                    {...(reduceMotion ? undefined : { ...getCopyVariants(2) })}
                    className="text-[10px] text-neutral-7 text-xs dark:text-neutral-2"
                >
                    Created <DateRelative value={revision.createdAt} />
                </motion.span>
            </ToolbarBody>
            <ToolbarButtonGroup>
                {/* Open commit in Git client */}
                <ToolbarButton
                    title={gitURL ? 'Open commit in Git client' : 'Setup GitSync to edit using git'}
                    href={gitURL}
                    disabled={!gitURL}
                    icon={gitURL ? (gitURL.includes('github.com') ? 'github' : 'gitlab') : 'github'}
                />

                {/* Open production site */}
                <ToolbarButton
                    title="Open production site"
                    href={`${site.urls.published}`}
                    key="open-production-site-button"
                    icon="globe"
                />

                {/* Open revision in GitBook */}
                <ToolbarButton
                    title="View revision in GitBook"
                    href={revision.urls.app}
                    icon="code-commit"
                />
            </ToolbarButtonGroup>
        </Toolbar>
    );
}
