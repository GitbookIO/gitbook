'use client';

import { CustomizationAIMode } from '@gitbook/api';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import * as React from 'react';

import { tString, useLanguage } from '@/intl/client';
import type { Assistant } from '@gitbook/browser-types';
import { useAIChatController, useAIChatState } from '.';
import { AIChatIcon, getAIChatName } from '../AIChat';
import { useCustomAssistants } from '../Integrations';
import { useSearch } from '../Search/useSearch';

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

type AIContext = AIConfig & {
    assistants: Assistant[];
};

/**
 * Unified assistants list combining the built-in GitBook Assistant (when enabled)
 * with any custom assistants registered at runtime.
 */
export function useAI(): AIContext {
    const config = useAIConfig();
    const chat = useAIChatState();
    const chatController = useAIChatController();
    const language = useLanguage();
    const [, setSearchState] = useSearch();

    const assistants: Assistant[] = [];

    if (config.aiMode === CustomizationAIMode.Assistant) {
        assistants.push({
            id: 'gitbook-assistant',
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
                }
            },
            button: true,
            mode: 'sidebar',
        });
    } else if (config.aiMode === CustomizationAIMode.Search) {
        assistants.push({
            id: 'gitbook-ai-search',
            label: tString(language, 'ai_chat_context_badge'),
            icon: (
                <div className="relative">
                    <Icon icon="search" className="size-4" />
                    <Icon
                        icon="sparkle"
                        iconStyle={IconStyle.Solid}
                        className="absolute top-[2.5px] left-[2.6px] size-2"
                    />
                </div>
            ),
            onOpen: (query?: string) => {
                if (query) {
                    setSearchState((prev) =>
                        prev ? { ...prev, query: null, ask: query, open: true } : null
                    );
                }
            },
            button: false,
            mode: 'search',
        });
    }

    const customAssistants = useCustomAssistants();
    if (customAssistants.length > 0) {
        assistants.push(
            ...customAssistants.map((assistant) => ({
                ...assistant,
                icon:
                    typeof assistant.icon === 'string' ? (
                        <Icon icon={assistant.icon as IconName} className="size-4" />
                    ) : (
                        assistant.icon
                    ),
            }))
        );
    }

    return {
        ...config,
        assistants,
    };
}
