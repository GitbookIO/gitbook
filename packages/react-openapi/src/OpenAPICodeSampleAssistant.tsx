'use client';

import { createContext, useContext } from 'react';

/**
 * A request to rewrite a code sample with the assistant.
 */
export interface OpenAPICodeSampleRewriteInput {
    /** Stable identifier of the code sample, used to stage the reference. */
    id: string;
    /** Source code of the currently displayed code sample. */
    code: string;
    /** Syntax/language of the code sample (e.g. `bash`, `python`). */
    syntax?: string;
    /** Human-readable label of the code sample (e.g. `cURL`). */
    label?: string;
    /** Localized prompt to pre-fill in the assistant input as a draft. */
    prompt: string;
}

/**
 * Capability provided by the host app to let the assistant rewrite a code sample.
 * When present, the code sample selector exposes a "Custom" option.
 */
export interface OpenAPICodeSampleAssistant {
    /** Display name of the assistant (e.g. `GitBook Assistant`). */
    label: string;
    /** Logo/icon of the assistant, displayed next to the "Custom" option. */
    icon: React.ReactNode;
    /**
     * Open the assistant with the given code sample staged as a reference and the
     * prompt pre-filled as a draft (not sent).
     */
    onRewrite: (input: OpenAPICodeSampleRewriteInput) => void;
}

const OpenAPICodeSampleAssistantContext = createContext<OpenAPICodeSampleAssistant | null>(null);

/**
 * Provide the assistant capability to the code sample selector.
 * Pass `null` to disable the "Custom" rewrite option.
 */
export function OpenAPICodeSampleAssistantProvider(props: {
    value: OpenAPICodeSampleAssistant | null;
    children: React.ReactNode;
}) {
    return (
        <OpenAPICodeSampleAssistantContext.Provider value={props.value}>
            {props.children}
        </OpenAPICodeSampleAssistantContext.Provider>
    );
}

/**
 * Access the assistant capability, or `null` when no assistant is available.
 */
export function useOpenAPICodeSampleAssistant() {
    return useContext(OpenAPICodeSampleAssistantContext);
}
