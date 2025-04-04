'use client';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useStore } from 'zustand';
import type { MediaTypeRenderer } from './OpenAPICodeSample';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';

type MediaTypeState = {
    mediaType: string;
    setMediaType: (mediaType: string) => void;
};

function useMediaTypeState(
    data: { method: string; path: string },
    defaultKey: string
): MediaTypeState {
    const { method, path } = data;
    const store = useStore(getOrCreateStoreByKey(`media-type-${method}-${path}`, defaultKey));
    if (typeof store.key !== 'string') {
        throw new Error('Media type key is not a string');
    }
    return {
        mediaType: store.key,
        setMediaType: useCallback((index: string) => store.setKey(index), [store.setKey]),
    };
}

function useMediaTypeSampleIndexState(data: { method: string; path: string }, mediaType: string) {
    const { method, path } = data;
    const store = useStore(
        getOrCreateStoreByKey(`media-type-sample-${mediaType}-${method}-${path}`, 0)
    );
    if (typeof store.key !== 'number') {
        throw new Error('Example key is not a number');
    }
    return {
        index: store.key,
        setIndex: useCallback((index: number) => store.setKey(index), [store.setKey]),
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
        <OpenAPISelect
            className={clsx('openapi-select')}
            selectedKey={state.mediaType}
            items={renderers.map((renderer) => ({
                key: renderer.mediaType,
                label: renderer.mediaType,
            }))}
            onChange={(e) => state.setMediaType(String(e))}
        >
            {renderers.map((renderer) => (
                <OpenAPISelectItem key={renderer.mediaType} value={renderer}>
                    {renderer.mediaType}
                </OpenAPISelectItem>
            ))}
        </OpenAPISelect>
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

    const items = renderer.examples.map((example, index) => ({
        key: index,
        label: example.example.summary || `Example ${index + 1}`,
    }));

    return (
        <OpenAPISelect
            className={clsx('openapi-select')}
            items={items}
            selectedKey={String(state.index)}
            onChange={(e) => state.setIndex(Number(e))}
        >
            {items.map((item) => (
                <OpenAPISelectItem key={item.key} value={item}>
                    {item.label}
                </OpenAPISelectItem>
            ))}
        </OpenAPISelect>
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
