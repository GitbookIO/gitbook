'use client';

import clsx from 'clsx';
import { useRef } from 'react';
import { mergeProps, useButton, useDisclosure, useFocusRing } from 'react-aria';
import { useDisclosureState } from 'react-stately';
import { useStore } from 'zustand';
import { OpenAPISelect, OpenAPISelectItem } from './OpenAPISelect';
import { Section, SectionBody, SectionHeader, SectionHeaderContent } from './StaticSection';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';

interface InteractiveSectionTab {
    key: string;
    label: string;
    body: React.ReactNode;
}

/**
 * To optimize rendering, most of the components are server-components,
 * and the interactiveness is mainly handled by a few key components like this one.
 */
export function InteractiveSection(props: {
    id?: string;
    /** Class name to be set on the section, sub-elements will use it as prefix */
    className: string;
    /** If true, the content can be toggeable */
    toggeable?: boolean;
    /** Default state of the toggle */
    defaultOpened?: boolean;
    /** Icon to display for the toggle */
    toggleIcon?: React.ReactNode;
    /** Tabs of content to display */
    tabs?: Array<InteractiveSectionTab>;
    /** Default tab to have opened */
    defaultTab?: string;
    /** Content of the header */
    header?: React.ReactNode;
    /** Children to display within the container */
    overlay?: React.ReactNode;

    /** State key to use with a store */
    stateKey?: string;
}) {
    const {
        id,
        className,
        toggeable = false,
        defaultOpened = true,
        tabs = [],
        defaultTab = tabs[0]?.key,
        header,
        overlay,
        toggleIcon = '▶',
        stateKey = 'interactive-section',
    } = props;
    const state = useDisclosureState({
        defaultExpanded: defaultOpened,
    });
    const panelRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const { buttonProps: triggerProps, panelProps } = useDisclosure({}, state, panelRef);
    const { buttonProps } = useButton(triggerProps, triggerRef);
    const { isFocusVisible, focusProps } = useFocusRing();
    const store = useStore(getOrCreateStoreByKey(stateKey, defaultTab));

    const selectedTab: InteractiveSectionTab | undefined =
        tabs.find((tab) => tab.key === store.key) ?? tabs[0];

    return (
        <Section
            id={id}
            className={clsx(
                'openapi-section',
                toggeable ? 'openapi-section-toggeable' : null,
                className,
                toggeable ? `${className}-${state.isExpanded ? 'opened' : 'closed'}` : null
            )}
        >
            {header ? (
                <SectionHeader
                    onClick={() => {
                        if (toggeable) {
                            state.toggle();
                        }
                    }}
                    className={className}
                >
                    <SectionHeaderContent className={className}>
                        {selectedTab?.body && toggeable ? (
                            <button
                                {...mergeProps(buttonProps, focusProps)}
                                ref={triggerRef}
                                className={clsx('openapi-section-toggle', `${className}-toggle`)}
                                style={{
                                    outline: isFocusVisible
                                        ? '2px solid rgb(var(--primary-color-500) / 0.4)'
                                        : 'none',
                                }}
                            >
                                {toggleIcon}
                            </button>
                        ) : null}
                        {header}
                    </SectionHeaderContent>
                    <div
                        className={clsx(
                            'openapi-section-header-controls',
                            `${className}-header-controls`
                        )}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        {tabs.length > 1 ? (
                            <OpenAPISelect
                                className={clsx(
                                    'openapi-section-select',
                                    `${className}-tabs-select`
                                )}
                                items={tabs}
                                selectedKey={selectedTab?.key ?? ''}
                                onSelectionChange={(key) => {
                                    store.setKey(key);
                                    state.expand();
                                }}
                                placement="bottom end"
                            >
                                {tabs.map((tab) => (
                                    <OpenAPISelectItem key={tab.key} id={tab.key} value={tab}>
                                        {tab.label}
                                    </OpenAPISelectItem>
                                ))}
                            </OpenAPISelect>
                        ) : null}
                    </div>
                </SectionHeader>
            ) : null}
            {(!toggeable || state.isExpanded) && selectedTab?.body ? (
                <SectionBody ref={panelRef} {...panelProps} className={className}>
                    {selectedTab?.body}
                </SectionBody>
            ) : null}
            {overlay ? (
                <div className={clsx('openapi-section-overlay', `${className}-overlay`)}>
                    {overlay}
                </div>
            ) : null}
        </Section>
    );
}
