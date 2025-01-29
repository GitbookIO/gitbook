'use client';

import React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';

interface Props {
    tabs: {
        key: string;
        label: string;
        body: React.ReactNode;
    }[];
}

export function OpenAPITabs({ tabs }: Props) {
    return (
        <Tabs>
            <TabList>
                {tabs.map((tab) => (
                    <Tab key={`Tab-${tab.key}`} id={tab.key}>
                        {tab.label}
                    </Tab>
                ))}
            </TabList>
            {tabs.map((tab) => (
                <TabPanel key={`TabPanel-${tab.key}`} id={tab.key}>
                    {tab.body}
                </TabPanel>
            ))}
        </Tabs>
    );
}
