'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';
import { mergeProps, useButton, useDisclosure, useFocusRing } from 'react-aria';
import { useDisclosureState } from 'react-stately';
import { Section, SectionBody, SectionHeader, SectionHeaderContent } from './StaticSection';

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
    } = props;

    const [selectedTabKey, setSelectedTab] = useState(defaultTab);
    const selectedTab: InteractiveSectionTab | undefined =
        tabs.find((tab) => tab.key === selectedTabKey) ?? tabs[0];

    const state = useDisclosureState({
        defaultExpanded: defaultOpened,
    });
    const panelRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const { buttonProps: triggerProps, panelProps } = useDisclosure({}, state, panelRef);
    const { buttonProps } = useButton(triggerProps, triggerRef);
    const { isFocusVisible, focusProps } = useFocusRing();

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
                            <select
                                className={clsx(
                                    'openapi-section-select',
                                    'openapi-select',
                                    `${className}-tabs-select`
                                )}
                                value={selectedTab?.key ?? ''}
                                onChange={(event) => {
                                    setSelectedTab(event.target.value);
                                    state.expand();
                                }}
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.key} value={tab.key}>
                                        {tab.label}
                                    </option>
                                ))}
                            </select>
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
