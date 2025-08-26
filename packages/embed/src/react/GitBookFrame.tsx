import React from 'react';
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

    const frameRef = React.useRef<HTMLIFrameElement>(null);
    const gitbook = useGitBook();
    const [gitbookFrame, setGitbookFrame] = React.useState<GitBookFrameClient | null>(null);

    const frameURL = React.useMemo(() => gitbook.getFrameURL({ visitor }), [gitbook, visitor]);

    React.useEffect(() => {
        if (frameRef.current) {
            setGitbookFrame(gitbook.createFrame(frameRef.current));
        }
    }, [gitbook]);

    React.useEffect(() => {
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
