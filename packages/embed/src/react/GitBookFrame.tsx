'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
    GetFrameURLOptions,
    GitBookEmbeddableConfiguration,
    GitBookFrameClient,
} from '../client';
import { useGitBook } from './GitBookProvider';

export type GitBookFrameProps = {
    className?: string;
} & GetFrameURLOptions &
    GitBookEmbeddableConfiguration;

/**
 * Render a frame with the GitBook Assistant in it.
 */
export function GitBookFrame(props: GitBookFrameProps) {
    const { className, visitor, buttons, welcomeMessage, suggestions, tools } = props;

    const frameRef = useRef<HTMLIFrameElement>(null);
    const gitbook = useGitBook();
    const [gitbookFrame, setGitbookFrame] = useState<GitBookFrameClient | null>(null);

    const frameURL = useMemo(() => gitbook.getFrameURL({ visitor }), [gitbook, visitor]);

    useEffect(() => {
        if (frameRef.current) {
            setGitbookFrame(gitbook.createFrame(frameRef.current));
        }
    }, [gitbook]);

    useEffect(() => {
        gitbookFrame?.configure({
            buttons,
            welcomeMessage,
            suggestions,
            tools,
        });
    }, [gitbookFrame, buttons, welcomeMessage, suggestions, tools]);

    return (
        <iframe
            title="GitBook"
            ref={frameRef}
            src={frameURL}
            width="100%"
            height="100%"
            className={className}
        />
    );
}
