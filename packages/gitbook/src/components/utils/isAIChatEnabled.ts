import type { GitBookSiteContext } from '@/lib/context';
import { CustomizationAIMode } from '@gitbook/api';

// TODO: remove aiSearch and optional chain once the cache has been fully updated (after 11/07/2025)
export const isAIChatEnabled = (context: GitBookSiteContext) =>
    context.customization.ai?.mode === CustomizationAIMode.Assistant &&
    (context.site.id === 'site_p4Xo4' || context.site.id === 'site_JOVzv');
