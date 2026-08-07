'use client';

import { Fragment, useCallback, useRef } from 'react';
import type { Key } from 'react-aria';
import { Separator, Text } from 'react-aria-components';
import { useStore } from 'zustand';
import { useOpenAPICodeSampleAssistant } from './OpenAPICodeSampleAssistant';
import { OpenAPIPath } from './OpenAPIPath';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { StaticSection } from './StaticSection';
import type { OpenAPIClientContext } from './context';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';
import { tString } from './translate';
import type { OpenAPIOperationData } from './types';

/**
 * Key of the synthetic "Custom" option that opens the assistant to rewrite the
 * code sample. Chosen to avoid colliding with generated (`default-*`) or custom
 * (`custom-sample-*`) sample keys.
 */
const CUSTOM_CODE_SAMPLE_KEY = 'gitbook-ai-rewrite';

function useCodeSampleState(initialKey: Key = 'default') {
    const store = useStore(getOrCreateStoreByKey('codesample', initialKey));
    return {
        key: store.key,
        setKey: useCallback((key: Key) => store.setKey(key), [store.setKey]),
    };
}

type CodeSampleItem = OpenAPISelectItem & {
    icon?: React.ReactNode;
    syntax?: string;
    body: React.ReactNode;
    footer?: React.ReactNode;
};

function OpenAPICodeSampleHeader(props: {
    items: CodeSampleItem[];
    selected: CodeSampleItem;
    data: OpenAPIOperationData;
    selectIcon?: React.ReactNode;
    context: OpenAPIClientContext;
    getSelectedCode: () => string;
}) {
    const { data, items, selected, selectIcon, context, getSelectedCode } = props;
    const assistant = useOpenAPICodeSampleAssistant();

    // When an assistant is available, append a "Custom" option that opens it
    // pre-filled to rewrite the currently displayed sample in any language.
    const customItem: CodeSampleItem | null = assistant
        ? {
              key: CUSTOM_CODE_SAMPLE_KEY,
              label: tString(context.translation, 'code_sample_custom'),
              action: true,
              body: null,
          }
        : null;
    const allItems = customItem ? [...items, customItem] : items;

    const onCustomRewrite = () => {
        if (!assistant) {
            return;
        }
        const code = getSelectedCode();
        if (!code.trim()) {
            return;
        }
        assistant.onRewrite({
            id: `${context.blockKey ?? 'openapi'}-${String(selected.key)}`,
            code,
            syntax: selected.syntax,
            label: typeof selected.label === 'string' ? selected.label : undefined,
            prompt: tString(context.translation, 'code_sample_rewrite_prompt'),
        });
    };

    return (
        <>
            <OpenAPIPath
                context={context}
                canCopy={false}
                withServer={false}
                data={data}
                methodBadgeSize="small"
            />
            {allItems.length > 1 ? (
                <OpenAPISelect
                    icon={selectIcon}
                    items={allItems}
                    stateKey="codesample"
                    placement="bottom end"
                    onAction={onCustomRewrite}
                >
                    {allItems.map((item) =>
                        item.key === CUSTOM_CODE_SAMPLE_KEY && assistant ? (
                            <Fragment key={item.key}>
                                <Separator className="border-tint-subtle border-t" />
                                <OpenAPISelectItem
                                    id={item.key}
                                    value={item}
                                    textValue={tString(context.translation, 'code_sample_custom')}
                                    className="openapi-select-item-custom"
                                >
                                    {assistant.icon}
                                    <span className="openapi-select-item-text">
                                        <Text slot="label">{item.label}</Text>
                                        <Text slot="description">
                                            {tString(
                                                context.translation,
                                                'code_sample_custom_description',
                                                assistant.label
                                            )}
                                        </Text>
                                    </span>
                                </OpenAPISelectItem>
                            </Fragment>
                        ) : (
                            <OpenAPISelectItem
                                key={item.key}
                                id={item.key}
                                value={item}
                                textValue={typeof item.label === 'string' ? item.label : undefined}
                            >
                                {item.icon ?? null}
                                <Text slot="label">{item.label}</Text>
                            </OpenAPISelectItem>
                        )
                    )}
                </OpenAPISelect>
            ) : items[0] ? (
                <span className="openapi-codesample-label">
                    {items[0].icon ?? null}
                    {items[0].label}
                </span>
            ) : null}
        </>
    );
}

export function OpenAPICodeSampleBody(props: {
    items: CodeSampleItem[];
    data: OpenAPIOperationData;
    selectIcon?: React.ReactNode;
    context: OpenAPIClientContext;
}) {
    const { items, data, selectIcon, context } = props;
    if (!items[0]) {
        throw new Error('No items provided');
    }

    const state = useCodeSampleState(items[0]?.key);
    const panelRef = useRef<HTMLDivElement>(null);

    const selected = items.find((item) => item.key === state.key) || items[0];

    if (!selected) {
        return null;
    }

    return (
        <StaticSection
            header={
                <OpenAPICodeSampleHeader
                    context={context}
                    selectIcon={selectIcon}
                    data={data}
                    items={items}
                    selected={selected}
                    getSelectedCode={() => readPanelCodeText(panelRef.current)}
                />
            }
            className="openapi-codesample"
        >
            <div ref={panelRef} id={selected.key as string} className="openapi-codesample-panel">
                {selected.body ? selected.body : null}
                {selected.footer ? selected.footer : null}
            </div>
        </StaticSection>
    );
}

/**
 * Extract the plain code text of the code block currently displayed in a panel.
 * Mirrors the host code block rendering, where empty lines are represented with
 * a span of class "ew".
 */
function readPanelCodeText(panel: HTMLElement | null): string {
    const code = panel?.querySelector('code');
    if (!code) {
        return '';
    }

    let text = '';
    const iterate = (node: Node) => {
        if (node instanceof HTMLBRElement) {
            text += '\n';
        } else if (node instanceof HTMLSpanElement) {
            if (node.classList.contains('ew')) {
                text += '\n';
            } else {
                text += node.innerText;
            }
        } else if (node instanceof HTMLElement) {
            node.childNodes.forEach(iterate);
        } else {
            text += node.textContent ?? '';
        }
    };
    iterate(code);

    return text;
}
