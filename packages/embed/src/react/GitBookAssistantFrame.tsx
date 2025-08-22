import React from 'react';
import type { GetFrameURLOptions, GitBookFrameClient } from '../client';
import { useGitBook } from './GitBookProvider';

export type GitBookAssistantFrameProps = {
    title?: string;
    className?: string;
} & GetFrameURLOptions;

/**
 * Render a frame with the GitBook Assistant in it.
 */
export function GitBookAssistantFrame(props: GitBookAssistantFrameProps) {
    const { title, className, ...frameOptions } = props;

    const frameRef = React.useRef<HTMLIFrameElement>(null);
    const gitbookFrameRef = React.useRef<GitBookFrameClient | null>(null);
    const gitbook = useGitBook();
    const frameURL = gitbook.getFrameURL(frameOptions);

    React.useEffect(() => {
        if (frameRef.current) {
            gitbookFrameRef.current = gitbook.createFrame(frameRef.current);
        }
    }, [gitbook]);

    return (
        <div className={className}>
            <iframe
                title={title ?? 'GitBook Assistant'}
                ref={frameRef}
                src={frameURL}
                width="100%"
                height="100%"
            />
        </div>
    );
}
