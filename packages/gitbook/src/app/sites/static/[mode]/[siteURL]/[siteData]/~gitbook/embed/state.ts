import type { IconName } from '@gitbook/icons';
import { createStore } from 'zustand';

/**
 * State of the UI frame for the embed.
 */
export const embedFrameStore = createStore<{
    /**
     * Title displayed in the frame
     */
    title: string;

    /**
     * Control buttons displayed in the frame.
     */
    buttons: Array<{
        label: string;
        icon: IconName;
        onClick: () => void;
    }>;
}>((set) => ({
    title: '',
    buttons: [],
}));
