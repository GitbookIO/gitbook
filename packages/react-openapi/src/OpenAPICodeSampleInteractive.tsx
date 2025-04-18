'use client';
import clsx from 'clsx';
import type { MediaTypeRenderer } from './OpenAPICodeSample';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { createStateKey } from './utils';

export function OpenAPIMediaTypeExamplesSelector(props: {
    method: string;
    path: string;
    renderers: MediaTypeRenderer[];
    selectIcon?: React.ReactNode;
    blockKey?: string;
}) {
    const { method, path, renderers, selectIcon, blockKey } = props;
    if (!renderers[0]) {
        throw new Error('No renderers provided');
    }
    const stateKey = createStateKey('request-body-media-type', blockKey);
    const state = useSelectState(stateKey, renderers[0].mediaType);
    const selected = renderers.find((r) => r.mediaType === state.key) || renderers[0];

    return (
        <div className="openapi-codesample-selectors">
            <MediaTypeSelector selectIcon={selectIcon} stateKey={stateKey} renderers={renderers} />
            <ExamplesSelector
                selectIcon={selectIcon}
                method={method}
                path={path}
                renderer={selected}
            />
        </div>
    );
}

function MediaTypeSelector(props: {
    stateKey: string;
    renderers: MediaTypeRenderer[];
    selectIcon?: React.ReactNode;
}) {
    const { renderers, stateKey, selectIcon } = props;

    if (renderers.length < 2) {
        return null;
    }

    const items = renderers.map((renderer) => ({
        key: renderer.mediaType,
        label: renderer.mediaType,
    }));

    return (
        <OpenAPISelect
            className={clsx('openapi-select')}
            items={renderers.map((renderer) => ({
                key: renderer.mediaType,
                label: renderer.mediaType,
            }))}
            icon={selectIcon}
            stateKey={stateKey}
            placement="bottom start"
        >
            {items.map((item) => (
                <OpenAPISelectItem key={item.key} id={item.key} value={item}>
                    {item.label}
                </OpenAPISelectItem>
            ))}
        </OpenAPISelect>
    );
}

function ExamplesSelector(props: {
    method: string;
    path: string;
    renderer: MediaTypeRenderer;
    selectIcon?: React.ReactNode;
}) {
    const { method, path, renderer, selectIcon } = props;
    if (renderer.examples.length < 2) {
        return null;
    }

    const items = renderer.examples.map((example, index) => ({
        key: index,
        label: example.example.summary || `Example ${index + 1}`,
    }));

    return (
        <OpenAPISelect
            items={items}
            icon={selectIcon}
            stateKey={`media-type-sample-${renderer.mediaType}-${method}-${path}`}
            placement="bottom start"
        >
            {items.map((item) => (
                <OpenAPISelectItem key={item.key} id={item.key} value={item}>
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
    blockKey?: string;
}) {
    const { renderers, method, path, blockKey } = props;
    if (!renderers[0]) {
        throw new Error('No renderers provided');
    }

    const mediaTypeState = useSelectState(
        createStateKey('request-body-media-type', blockKey),
        renderers[0].mediaType
    );
    const selected = renderers.find((r) => r.mediaType === mediaTypeState.key) ?? renderers[0];
    if (selected.examples.length === 0) {
        return selected.element;
    }
    return <ExamplesBody method={method} path={path} renderer={selected} />;
}

function ExamplesBody(props: { method: string; path: string; renderer: MediaTypeRenderer }) {
    const { method, path, renderer } = props;
    const exampleState = useSelectState(
        `media-type-sample-${renderer.mediaType}-${method}-${path}`,
        renderer.mediaType
    );
    const example = renderer.examples[Number(exampleState.key)] ?? renderer.examples[0];
    if (!example) {
        throw new Error(`No example found for key ${exampleState.key}`);
    }
    return example.element;
}
