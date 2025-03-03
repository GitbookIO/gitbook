'use client';

import clsx from 'clsx';
import { type ComponentPropsWithoutRef, forwardRef, useRef, useState } from 'react';
import { mergeProps, useButton, useDisclosure, useFocusRing } from 'react-aria';
import { useDisclosureState } from 'react-stately';

interface InteractiveSectionTab {
    key: string;
    label: string;
    body: React.ReactNode;
}

export function Section(props: ComponentPropsWithoutRef<'div'>) {
    return <div {...props} className={clsx('openapi-section', props.className)} />;
}

export function SectionHeader(props: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                'openapi-section-header',
                props.className && `${props.className}-header`
            )}
        />
    );
}

export function SectionHeaderContent(props: ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                'openapi-section-header-content',
                props.className && `${props.className}-header-content`
            )}
        />
    );
}

export const SectionBody = forwardRef(function SectionBody(
    props: ComponentPropsWithoutRef<'div'>,
    ref: React.ForwardedRef<HTMLDivElement>
) {
    return (
        <div
            ref={ref}
            {...props}
            className={clsx('openapi-section-body', props.className && `${props.className}-body`)}
        />
    );
});

export function StaticSection(props: {
    className: string;
    header: React.ReactNode;
    children: React.ReactNode;
}) {
    const { className, header, children } = props;
    return (
        <Section className={className}>
            <SectionHeader className={className}>
                <SectionHeaderContent className={className}>{header}</SectionHeaderContent>
            </SectionHeader>
            <SectionBody className={className}>{children}</SectionBody>
        </Section>
    );
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
    /** Body of the section */
    children?: React.ReactNode;
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
        children,
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
                        {(children || selectedTab?.body) && toggeable ? (
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
            {(!toggeable || state.isExpanded) && (children || selectedTab?.body) ? (
                <SectionBody ref={panelRef} {...panelProps} className={className}>
                    {children}
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
