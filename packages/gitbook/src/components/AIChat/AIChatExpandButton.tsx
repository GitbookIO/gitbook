'use client';

import { tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { Button } from '../primitives';
import { useAIChatWidthStore, useIsAIChatMaxWidth } from './useAIChatWidthStore';

export function AIChatExpandButton() {
    const language = useLanguage();
    const toggleWidth = useAIChatWidthStore((state) => state.toggleWidth);
    const isMaxWidth = useIsAIChatMaxWidth();

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
