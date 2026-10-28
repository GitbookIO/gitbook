import { CustomizationAIMode } from '@gitbook/api';

// `ai.mode` is exclusive: Assistant (chat) and Search (ask) are distinct features; None means no AI.
export const isAIChatEnabled = (mode: CustomizationAIMode | undefined) =>
    mode === CustomizationAIMode.Assistant;

export const isAISearchEnabled = (mode: CustomizationAIMode | undefined) =>
    mode === CustomizationAIMode.Search;

export const isAIEnabled = (mode: CustomizationAIMode | undefined) =>
    isAIChatEnabled(mode) || isAISearchEnabled(mode);
