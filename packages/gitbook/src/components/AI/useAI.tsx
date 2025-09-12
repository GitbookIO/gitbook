'use client';

import { CustomizationAIMode } from '@gitbook/api';
import { Icon, type IconName, IconStyle } from '@gitbook/icons';
import * as React from 'react';
import type { ReactNode } from 'react';

import { tString, useLanguage } from '@/intl/client';
import type { GitBookAssistant } from '@gitbook/browser-types';
import { useAIChatController, useAIChatState } from '.';
import { AIChatIcon, getAIChatName } from '../AIChat';
import { useIntegrationAssistants } from '../Integrations';
import { useSearch } from '../Search/useSearch';

// Unify assistants configuration context with the assistants hook in one place
export type AIConfig = {
    aiMode: CustomizationAIMode;
    trademark: boolean;
};

export type Assistant = Omit<GitBookAssistant, 'icon'> & {
    /**
     * Unique identifier for the assistant. Generated automatically using Crypto.randomUUID().
     * @example '123e4567-e89b-12d3-a456-426614174000'
     */
    id: string;

    /**
     * Display mode for the assistant. Currently, only `overlay` is supported for custom assistants.
     * - `overlay`: Display the assistant in an overlay on top of the page.
     * - `sidebar`: Display the assistant in a sidebar next to the page. Only supported for the GitBook Assistant.
     * - `search`: Display the assistant inside the search container. Only supported for GitBook AI Search.
     * @default 'overlay'
     */
    mode?: 'overlay' | 'sidebar' | 'search';

    /**
     * Whether the assistant is displayed in the page action menu.
     * @default false
     */
    pageAction: boolean;

    /**
     * Icon of the assistant displayed in the UI.
     */
    icon: ReactNode;
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

type AIContext = {
    config: AIConfig;
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
            label: getAIChatName(language, config.trademark),
            icon: (
                <AIChatIcon
                    state={chat.loading ? 'thinking' : 'default'}
                    trademark={config.trademark}
                />
            ),
            open: (query?: string) => {
                chatController.open();
                if (query) {
                    chatController.postMessage({ message: query });
                }
            },
            pageAction: true,
            ui: true,
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
            open: (query?: string) => {
                if (query) {
                    setSearchState((prev) =>
                        prev ? { ...prev, query: null, ask: query, open: true } : null
                    );
                }
            },
            pageAction: false,
            ui: false,
            mode: 'search',
        });
    }

    const integrationAssistants = useIntegrationAssistants();
    if (integrationAssistants.length > 0) {
        assistants.push(
            ...integrationAssistants.map((assistant) => ({
                ...assistant,
                icon: <Icon icon={assistant.icon as IconName} className="size-4" />,
                open: (query?: string) => {
                    setSearchState((prev) => ({
                        ask: null, // Reset ask as we assume the assistant will handle it
                        query: prev?.query ?? null,
                        scope: prev?.scope ?? 'default',
                        open: false,
                    }));
                    assistant.open(query);
                },
            }))
        );
    }

    return {
        config,
        assistants,
    };
}
