'use client';

import classNames from 'classnames';
import React from 'react';

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
    /** Icons to display for the toggle */
    toggleOpenIcon?: React.ReactNode;
    toggleCloseIcon?: React.ReactNode;
    /** Tabs of content to display */
    tabs?: Array<{
        key: string;
        label: string;
        body: React.ReactNode;
    }>;
    /** Default tab to have opened */
    defaultTab?: string;
    /** Content of the header */
    header: React.ReactNode;
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
        toggleOpenIcon = '▶',
        toggleCloseIcon = '▼',
    } = props;

    const [opened, setOpened] = React.useState(defaultOpened);
    const [selectedTabKey, setSelectedTab] = React.useState(defaultTab);
    const selectedTab = tabs.find((tab) => tab.key === selectedTabKey) ?? tabs[0];

    return (
        <div
            id={id}
            className={classNames(
                'openapi-section',
                toggeable ? 'openapi-section-toggeable' : null,
                className,
                toggeable ? `${className}-${opened ? 'opened' : 'closed'}` : null,
            )}
        >
            <div
                onClick={() => {
                    if (toggeable) {
                        setOpened(!opened);
                    }
                }}
                className={classNames('openapi-section-header', `${className}-header`)}
            >
                <div
                    className={classNames(
                        'openapi-section-header-content',
                        `${className}-header-content`,
                    )}
                >
                    {header}
                </div>
                <div
                    className={classNames(
                        'openapi-section-header-controls',
                        `${className}-header-controls`,
                    )}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    {tabs.length ? (
                        <select
                            className={classNames(
                                'openapi-section-select',
                                'openapi-select',
                                `${className}-tabs-select`,
                            )}
                            value={selectedTab.key}
                            onChange={(event) => {
                                setSelectedTab(event.target.value);
                                setOpened(true);
                            }}
                        >
                            {tabs.map((tab) => (
                                <option key={tab.key} value={tab.key}>
                                    {tab.label}
                                </option>
                            ))}
                        </select>
                    ) : null}
                    {(children || selectedTab?.body) && toggeable ? (
                        <button
                            className={classNames('openapi-section-toggle', `${className}-toggle`)}
                            onClick={() => setOpened(!opened)}
                        >
                            {opened ? toggleCloseIcon : toggleOpenIcon}
                        </button>
                    ) : null}
                </div>
            </div>
            {(!toggeable || opened) && (children || selectedTab?.body) ? (
                <div className={classNames('openapi-section-body', `${className}-body`)}>
                    {children}
                    {selectedTab.body}
                </div>
            ) : null}
            {overlay}
        </div>
    );
}
