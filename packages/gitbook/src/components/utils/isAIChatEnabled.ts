import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationAIMode } from '@gitbook/api';

export const isAIChatEnabled = (context: GitBookSiteContext) =>
    context.customization.ai.mode === CustomizationAIMode.Assistant;
