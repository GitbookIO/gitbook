'use client';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useStore } from 'zustand';
import type { MediaTypeRenderer } from './OpenAPICodeSample';
import { getOrCreateTabStoreByKey } from './useSyncedTabsGlobalState';

type MediaTypeState = {
    mediaType: string;
    setMediaType: (mediaType: string) => void;
};

function useMediaTypeState(
    data: { method: string; path: string },
    defaultKey: string
): MediaTypeState {
    const { method, path } = data;
    const store = useStore(getOrCreateTabStoreByKey(`media-type-${method}-${path}`, defaultKey));
    if (typeof store.tabKey !== 'string') {
        throw new Error('Media type key is not a string');
    }
    return {
        mediaType: store.tabKey,
        setMediaType: useCallback((index: string) => store.setTabKey(index), [store.setTabKey]),
    };
}

function useMediaTypeSampleIndexState(data: { method: string; path: string }, mediaType: string) {
    const { method, path } = data;
    const store = useStore(
        getOrCreateTabStoreByKey(`media-type-sample-${mediaType}-${method}-${path}`, 0)
    );
    if (typeof store.tabKey !== 'number') {
        throw new Error('Example key is not a number');
    }
    return {
        index: store.tabKey,
        setIndex: useCallback((index: number) => store.setTabKey(index), [store.setTabKey]),
    };
}

export function OpenAPIMediaTypeExamplesSelector(props: {
    method: string;
    path: string;
    renderers: MediaTypeRenderer[];
}) {
    const { method, path, renderers } = props;
    if (!renderers[0]) {
        throw new Error('No renderers provided');
    }
    const state = useMediaTypeState({ method, path }, renderers[0].mediaType);
    const selected = renderers.find((r) => r.mediaType === state.mediaType) || renderers[0];

    return (
        <div className="openapi-codesample-selectors">
            <MediaTypeSelector state={state} renderers={renderers} />
            <ExamplesSelector method={method} path={path} renderer={selected} />
        </div>
    );
}

function MediaTypeSelector(props: {
    state: MediaTypeState;
    renderers: MediaTypeRenderer[];
}) {
    const { renderers, state } = props;

    if (renderers.length < 2) {
        return null;
    }

    return (
        <select
            className={clsx('openapi-select')}
            value={state.mediaType}
            onChange={(e) => state.setMediaType(e.target.value)}
        >
            {renderers.map((renderer) => (
                <option key={renderer.mediaType} value={renderer.mediaType}>
                    {renderer.mediaType}
                </option>
            ))}
        </select>
    );
}

function ExamplesSelector(props: {
    method: string;
    path: string;
    renderer: MediaTypeRenderer;
}) {
    const { method, path, renderer } = props;
    const state = useMediaTypeSampleIndexState({ method, path }, renderer.mediaType);
    if (renderer.examples.length < 2) {
        return null;
    }

    return (
        <select
            className={clsx('openapi-select')}
            value={String(state.index)}
            onChange={(e) => state.setIndex(Number(e.target.value))}
        >
            {renderer.examples.map((example, index) => (
                <option key={index} value={index}>
                    {example.example.summary || `Example ${index + 1}`}
                </option>
            ))}
        </select>
    );
}

export function OpenAPIMediaTypeExamplesBody(props: {
    method: string;
    path: string;
    renderers: MediaTypeRenderer[];
}) {
    const { renderers, method, path } = props;
    if (!renderers[0]) {
        throw new Error('No renderers provided');
    }
    const mediaTypeState = useMediaTypeState({ method, path }, renderers[0].mediaType);
    const selected =
        renderers.find((r) => r.mediaType === mediaTypeState.mediaType) ?? renderers[0];
    if (selected.examples.length === 0) {
        return selected.element;
    }
    return <ExamplesBody method={method} path={path} renderer={selected} />;
}

function ExamplesBody(props: { method: string; path: string; renderer: MediaTypeRenderer }) {
    const { method, path, renderer } = props;
    const exampleState = useMediaTypeSampleIndexState({ method, path }, renderer.mediaType);
    const example = renderer.examples[exampleState.index] ?? renderer.examples[0];
    if (!example) {
        throw new Error(`No example found for index ${exampleState.index}`);
    }
    return example.element;
}
