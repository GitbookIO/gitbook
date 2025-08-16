'use client';

import { CustomizationAIMode } from '@gitbook/api';
import { Icon, type IconName } from '@gitbook/icons';
import * as React from 'react';
import type { ReactNode } from 'react';

import { useAIChatController, useAIChatState } from '.';
import { AIChatIcon, getAIChatName } from '../AIChat';
import { useCustomAssistants } from '../Integrations';
import { useSearch } from '../Search';

// Unify assistants configuration context with the assistants hook in one place
export type AIConfig = {
    aiMode: CustomizationAIMode;
    trademark: boolean;
};

const AIContext = React.createContext<AIConfig | null>(null);

export function AIContextProvider(props: React.PropsWithChildren<AIConfig>): React.ReactElement {
    const { aiMode, trademark, children } = props;
    const value = React.useMemo(() => ({ aiMode, trademark }), [aiMode, trademark]);
    return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

function useAIConfig(): AIConfig {
    const ctx = React.useContext(AIContext);
    if (!ctx) {
        throw new Error('useAI must be used within AIContextProvider');
    }
    return ctx;
}

export type AssistantItem = {
    label: string;
    icon: ReactNode;
    onOpen: (query?: string) => void;
};

type AIContext = AIConfig & {
    assistants: AssistantItem[];
};

/**
 * Unified assistants list combining the built-in GitBook Assistant (when enabled)
 * with any custom assistants registered at runtime.
 */
export function useAI(): AIContext {
    const config = useAIConfig();
    const chat = useAIChatState();
    const chatController = useAIChatController();

    const withAssistant = config.aiMode === CustomizationAIMode.Assistant;
    const [, setSearchState] = useSearch(!withAssistant);

    const assistants: AssistantItem[] = [];

    if (withAssistant) {
        assistants.push({
            label: getAIChatName(config.trademark),
            icon: (
                <AIChatIcon
                    state={chat.loading ? 'thinking' : 'default'}
                    trademark={config.trademark}
                />
            ),
            onOpen: (query?: string) => {
                chatController.open();
                if (query) {
                    chatController.postMessage({ message: query });
                    setSearchState({
                        ask: query,
                        query: null,
                        global: false,
                        open: false,
                    });
                }
            },
        });
    }

    const customAssistants = useCustomAssistants();
    if (customAssistants.length > 0) {
        assistants.push(
            ...customAssistants.map((assistant) => ({
                ...assistant,
                icon: <Icon icon={assistant.icon as IconName} className="size-4" />,
            }))
        );
    }

    return {
        ...config,
        assistants,
    };
}
