'use client';

import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { Markdown } from './Markdown';

interface Props {
    tabs: {
        key: string;
        label: string;
        body: React.ReactNode;
        description: string;
    }[];
}

function OpenAPITabs({ children }: React.PropsWithChildren) {
    return <Tabs>{children}</Tabs>;
}

function OpenAPITabsList({ tabs }: Props) {
    return (
        <TabList>
            {tabs.map((tab) => (
                <Tab key={`Tab-${tab.key}`} id={tab.key}>
                    {tab.label}
                </Tab>
            ))}
        </TabList>
    );
}

function OpenAPITabsPanels({ tabs }: Props) {
    return (
        <>
            {tabs.map((tab) => (
                <TabPanel key={`TabPanel-${tab.key}`} id={tab.key}>
                    {tab.body}
                    <Markdown source={tab.description} className="openapi-tabs-footer" />
                </TabPanel>
            ))}
        </>
    );
}

export { OpenAPITabs, OpenAPITabsList, OpenAPITabsPanels };
