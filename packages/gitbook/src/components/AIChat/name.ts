import { tString } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';

export function getAIChatName(language: TranslationLanguage, trademark: boolean) {
    return trademark
        ? tString(language, 'ai_chat_assistant_name')
        : tString(language, 'ai_chat_assistant_name_unbranded');
}
