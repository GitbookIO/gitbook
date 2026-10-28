'use client';

import clsx from 'classnames';
import { useId, useState } from 'react';

import { OpenAPISelect, useSelectState } from './OpenAPISelect';
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
    tabs?: InteractiveSectionTab[];
    /** Default tab to have opened */
    defaultTab?: string;
    /** Content of the header */
    header?: React.ReactNode;
    /** Children to display within the container */
    overlay?: React.ReactNode;
    /** State key to use with a store */
    stateKey?: string;
    /** Icon for the tabs select */
    selectIcon?: React.ReactNode;
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
        selectIcon,
        stateKey = 'interactive-section',
    } = props;
    const [isExpanded, setIsExpanded] = useState(defaultOpened);
    const panelId = useId();
    const store = useSelectState(stateKey, defaultTab);

    const selectedTab: InteractiveSectionTab | undefined =
        tabs.find((tab) => tab.key === store.key) ?? tabs[0];

    return (
        <Section
            id={id}
            className={clsx(
                'openapi-section',
                toggeable ? 'openapi-section-toggeable' : null,
                className,
                toggeable ? `${className}-${isExpanded ? 'opened' : 'closed'}` : null
            )}
        >
            {header ? (
                <SectionHeader
                    onClick={() => {
                        if (toggeable) {
                            setIsExpanded((expanded) => !expanded);
                        }
                    }}
                    className={className}
                >
                    <SectionHeaderContent className={className}>
                        {selectedTab?.body && toggeable ? (
                            <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                                className={clsx('openapi-section-toggle', `${className}-toggle`)}
                            >
                                {toggleIcon}
                            </button>
                        ) : null}
                        {header}
                    </SectionHeaderContent>
                    {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events */}
                    <div
                        className={clsx(
                            'openapi-section-header-controls',
                            `${className}-header-controls`
                        )}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        {tabs.length > 0 ? (
                            <OpenAPISelect
                                stateKey={stateKey}
                                items={tabs}
                                onChange={() => {
                                    setIsExpanded(true);
                                }}
                                icon={selectIcon}
                                placement="bottom end"
                            >
                                {(tab) => tab.label}
                            </OpenAPISelect>
                        ) : null}
                    </div>
                </SectionHeader>
            ) : null}
            {(!toggeable || isExpanded) && selectedTab?.body ? (
                <SectionBody id={panelId} className={className}>
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
