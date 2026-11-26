'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type {
    GetFrameURLOptions,
    GitBookEmbeddableConfiguration,
    GitBookFrameClient,
    GitBookNavigateEvent,
} from '../client';
import { useGitBook } from './GitBookProvider';

export type GitBookFrameProps = {
    className?: string;

    /** Called when the reader opens a page in the docs tab, or switches to another tab. */
    onNavigate?: (event: GitBookNavigateEvent) => void;

    /** Called when the built-in close button is clicked. */
    onClose?: () => void;

    /** Called when Escape is pressed inside the frame and nothing in it (a menu, a dialog) used it. */
    onEscape?: () => void;
} & GetFrameURLOptions &
    Partial<GitBookEmbeddableConfiguration>;

/**
 * Render a frame with the GitBook Assistant in it.
 */
export function GitBookFrame(props: GitBookFrameProps) {
    const {
        className,
        colorScheme,
        visitor,
        actions = [],
        greeting,
        suggestions,
        tools = [],
        tabs = ['assistant', 'search', 'docs'],
        defaultTab,
        defaultPage,
        trademark = true,
        closeButton = false,
        assistantName,
        onNavigate,
        onClose,
        onEscape,
    } = props;

    const frameRef = useRef<HTMLIFrameElement>(null);
    const gitbook = useGitBook();
    const [gitbookFrame, setGitbookFrame] = useState<GitBookFrameClient | null>(null);

    const frameURL = useMemo(
        () => gitbook.getFrameURL({ visitor, colorScheme }),
        [gitbook, visitor, colorScheme]
    );

    useEffect(() => {
        if (frameRef.current) {
            setGitbookFrame(gitbook.createFrame(frameRef.current));
        }
    }, [gitbook]);

    // Read through a ref so inline callbacks don't resubscribe on every render.
    const handlers = useRef({ onNavigate, onClose, onEscape });
    useEffect(() => {
        handlers.current = { onNavigate, onClose, onEscape };
    });

    useEffect(() => {
        if (!gitbookFrame) {
            return;
        }
        const unsubscribes = [
            gitbookFrame.on('navigate', (event) => handlers.current.onNavigate?.(event)),
            gitbookFrame.on('close', () => handlers.current.onClose?.()),
            gitbookFrame.on('escape', () => handlers.current.onEscape?.()),
        ];
        return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }, [gitbookFrame]);

    useEffect(() => {
        gitbookFrame?.configure({
            tabs,
            defaultTab,
            defaultPage,
            actions,
            greeting,
            suggestions,
            tools,
            closeButton,
            trademark,
            assistantName,
        });
    }, [
        gitbookFrame,
        actions,
        greeting,
        suggestions,
        tools,
        tabs,
        defaultTab,
        defaultPage,
        closeButton,
        trademark,
        assistantName,
    ]);

    return (
        <iframe
            title="GitBook"
            ref={frameRef}
            src={frameURL}
            width="100%"
            height="100%"
            allow="clipboard-write"
            className={className}
        />
    );
}
