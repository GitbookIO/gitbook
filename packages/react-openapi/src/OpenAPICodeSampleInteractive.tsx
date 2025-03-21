'use client';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useStore } from 'zustand';
import type { MediaTypeRenderer } from './OpenAPICodeSample';
import type { OpenAPIOperationData } from './types';
import { getOrCreateTabStoreByKey } from './useSyncedTabsGlobalState';

function useMediaTypeState(data: OpenAPIOperationData, defaultKey: string) {
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

function useMediaTypeSampleIndexState(data: OpenAPIOperationData, mediaType: string) {
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
    data: OpenAPIOperationData;
    renderers: MediaTypeRenderer[];
}) {
    const { data, renderers } = props;
    if (!renderers[0]) {
        throw new Error('No renderers provided');
    }
    const state = useMediaTypeState(data, renderers[0].mediaType);
    const selected = renderers.find((r) => r.mediaType === state.mediaType) || renderers[0];

    return (
        <div className="openapi-codesample-selectors">
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
            <ExamplesSelector data={data} renderer={selected} />
        </div>
    );
}

function ExamplesSelector(props: {
    data: OpenAPIOperationData;
    renderer: MediaTypeRenderer;
}) {
    const { data, renderer } = props;
    const state = useMediaTypeSampleIndexState(data, renderer.mediaType);
    if (renderer.examples.length === 0) {
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
    data: OpenAPIOperationData;
    renderers: MediaTypeRenderer[];
}) {
    const { renderers, data } = props;
    if (!renderers[0]) {
        throw new Error('No renderers provided');
    }
    const mediaTypeState = useMediaTypeState(data, renderers[0].mediaType);
    const selected =
        renderers.find((r) => r.mediaType === mediaTypeState.mediaType) ?? renderers[0];
    if (selected.examples.length === 0) {
        return selected.element;
    }
    return <ExamplesBody data={data} renderer={selected} />;
}

function ExamplesBody(props: { data: OpenAPIOperationData; renderer: MediaTypeRenderer }) {
    const { data, renderer } = props;
    const exampleState = useMediaTypeSampleIndexState(data, renderer.mediaType);
    const example = renderer.examples[exampleState.index] ?? renderer.examples[0];
    if (!example) {
        throw new Error(`No example found for index ${exampleState.index}`);
    }
    return example.element;
}
