'use client';

import * as React from 'react';

import { isStructurePreviewNavigationMessage, isStructurePreviewUpdate } from './state';
import type {
    StructurePreviewMessage,
    StructurePreviewSnapshot,
    StructurePreviewUpdate,
} from './types';

export function StructurePreviewTest(props: { initialSnapshot: StructurePreviewSnapshot }) {
    const { initialSnapshot } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const latestUpdateRef = React.useRef<StructurePreviewUpdate>(
        pickEditableSnapshot(initialSnapshot)
    );
    const [iframeSrc, setIframeSrc] = React.useState<string>();
    const [json, setJson] = React.useState(() =>
        stringifyStructurePreviewUpdate(pickEditableSnapshot(initialSnapshot))
    );
    const [error, setError] = React.useState<string | null>(null);
    const [navigationNotification, setNavigationNotification] = React.useState<{
        sectionId: string;
        receivedAt: number;
    } | null>(null);

    const postUpdate = React.useCallback((update: StructurePreviewUpdate) => {
        const targetWindow = iframeRef.current?.contentWindow;
        if (!targetWindow) {
            return;
        }

        const message: StructurePreviewMessage = {
            type: 'gitbook.structure.update',
            payload: update,
        };
        targetWindow.postMessage(message, window.location.origin);
    }, []);

    React.useEffect(() => {
        const url = new URL(window.location.href);
        url.pathname = url.pathname.replace(/\/test\/?$/, '');
        setIframeSrc(url.toString());
    }, []);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent<unknown>) => {
            if (
                event.origin !== window.location.origin ||
                event.source !== iframeRef.current?.contentWindow ||
                !isStructurePreviewNavigationMessage(event.data)
            ) {
                return;
            }

            //In a real case, here we should update variants and siteSpace to reflect the section we are currently in
            setNavigationNotification({
                sectionId: event.data.payload.sectionId,
                receivedAt: Date.now(),
            });
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    React.useEffect(() => {
        if (!navigationNotification) {
            return;
        }

        const timeout = window.setTimeout(() => setNavigationNotification(null), 3000);
        return () => window.clearTimeout(timeout);
    }, [navigationNotification]);

    const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextJson = event.target.value;
        setJson(nextJson);

        const parsedUpdate = parseStructurePreviewUpdate(nextJson);
        if (!parsedUpdate.ok) {
            setError(parsedUpdate.error);
            return;
        }

        setError(null);
        latestUpdateRef.current = parsedUpdate.value;
        postUpdate(parsedUpdate.value);
    };

    return (
        <main className="relative flex h-screen min-h-[720px] flex-col bg-tint-base text-tint">
            <header className="flex shrink-0 items-center justify-between gap-4 border-tint-subtle border-b px-4 py-3">
                <div>
                    <h1 className="font-semibold text-base text-tint-strong">
                        Structure preview test
                    </h1>
                    <p className="text-sm text-tint-subtle">
                        Update sections, variants, and site space JSON in realtime.
                    </p>
                </div>
                <div
                    className={`rounded-md px-2 py-1 font-medium text-xs ${
                        error
                            ? 'bg-danger-subtle/10 text-danger-subtle'
                            : 'bg-success-subtle/10 text-success-subtle'
                    }`}
                >
                    {error ? 'Invalid JSON' : 'Synced'}
                </div>
            </header>
            <div className="grid min-h-0 grow grid-rows-[minmax(360px,45%)_minmax(360px,1fr)] lg:grid-cols-[minmax(420px,42%)_minmax(0,1fr)] lg:grid-rows-1">
                <section className="min-h-0 border-tint-subtle border-b lg:border-r lg:border-b-0">
                    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
                        <label className="block space-y-2">
                            <span className="font-medium text-sm text-tint-strong">
                                Snapshot JSON
                            </span>
                        </label>
                        <textarea
                            value={json}
                            onChange={handleJsonChange}
                            spellCheck={false}
                            className="min-h-0 flex-1 resize-none rounded-md border border-tint bg-tint-subtle p-3 font-mono text-sm text-tint-strong outline-none ring-primary-hover transition-shadow focus:border-primary-hover focus:ring-2"
                        />
                        {error ? <p className="text-danger-subtle text-sm">{error}</p> : null}
                    </div>
                </section>
                <section className="min-h-0 bg-tint-subtle">
                    <iframe
                        ref={iframeRef}
                        src={iframeSrc ?? 'about:blank'}
                        title="Structure preview"
                        className="h-full w-full border-0 bg-tint-base"
                        onLoad={() => postUpdate(latestUpdateRef.current)}
                    />
                </section>
            </div>
            {navigationNotification ? (
                <div
                    key={navigationNotification.receivedAt}
                    role="status"
                    aria-live="polite"
                    className="pointer-events-none fixed right-4 bottom-4 z-10 max-w-sm animate-blur-in rounded-md border border-tint bg-tint-base px-3 py-2 shadow-lg shadow-tint-12/4"
                >
                    <p className="font-medium text-sm text-tint-strong">
                        Navigation update received
                    </p>
                    <p className="mt-0.5 break-all text-sm text-tint-subtle">
                        Section: {navigationNotification.sectionId}
                    </p>
                </div>
            ) : null}
        </main>
    );
}

function pickEditableSnapshot(snapshot: StructurePreviewSnapshot): StructurePreviewUpdate {
    return {
        sections: snapshot.sections,
        variants: snapshot.variants,
        siteSpace: snapshot.siteSpace,
    };
}

function stringifyStructurePreviewUpdate(update: StructurePreviewUpdate) {
    return JSON.stringify(update, null, 2);
}

function parseStructurePreviewUpdate(
    json: string
): { ok: true; value: StructurePreviewUpdate } | { ok: false; error: string } {
    try {
        const value: unknown = JSON.parse(json);
        if (!isStructurePreviewUpdate(value)) {
            return {
                ok: false,
                error: 'Expected a JSON object containing only sections, variants, and siteSpace.',
            };
        }

        return { ok: true, value };
    } catch {
        return { ok: false, error: 'The JSON is not valid.' };
    }
}
