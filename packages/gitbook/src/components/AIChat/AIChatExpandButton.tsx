'use client';

import { tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { Button } from '../primitives';
import { useAIChatWidthStore } from './useAIChatWidthStore';

/**
 * Toggle the panel between its default and maximum width. Tracks the live width
 * so the icon and action stay correct when the panel is resized with the drag
 * handle. Desktop only — the panel is a full-screen modal on mobile.
 */
export function AIChatExpandButton() {
    const language = useLanguage();
    const { toggleWidth, isMaxWidth } = useAIChatWidthStore();

    return (
        <Button
            onClick={toggleWidth}
            iconOnly
            icon={
                <Icon
                    icon={
                        isMaxWidth
                            ? 'arrow-down-left-and-arrow-up-right-to-center'
                            : 'arrow-up-right-and-arrow-down-left-from-center'
                    }
                    className="scale-90"
                />
            }
            label={tString(
                language,
                isMaxWidth ? 'ai_chat_collapse_panel' : 'ai_chat_expand_panel'
            )}
            variant="blank"
            className="max-lg:hidden"
        />
    );
}
