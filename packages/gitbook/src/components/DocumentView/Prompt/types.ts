import type { DocumentBlockCode } from '@gitbook/api';

export type PromptBlock = {
    object: 'block';
    type: 'prompt';
    key?: string;
    data: {
        icon?: string;
        description?: string;
        openInAIProviders?: boolean;
        preview?: boolean;
    };
    nodes?: DocumentBlockCode[];
    isVoid?: false;
};
