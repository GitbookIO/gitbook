import type { AIChatController } from '../AI';
import { Button } from '../primitives';
import { tString, useLanguage } from '@/intl/client';
import type { TranslationLanguage } from '@/intl/translations';

export function getSuggestedQuestions({
    language,
    suggestions,
}: {
    language: TranslationLanguage;
    suggestions?: string[];
}): string[] {
    const defaultSuggestions = [
        tString(language, 'ai_chat_suggested_questions_about_this_page'),
        tString(language, 'ai_chat_suggested_questions_read_next'),
        tString(language, 'ai_chat_suggested_questions_example'),
    ];
    return Array.from(
        new Set(suggestions && suggestions.length > 0 ? suggestions : defaultSuggestions)
    );
}

export default function AIChatSuggestedQuestions(props: {
    chatController: AIChatController;
    suggestions?: string[];
}) {
    const language = useLanguage();
    const { chatController, suggestions: configuredSuggestions } = props;
    const suggestions = getSuggestedQuestions({ language, suggestions: configuredSuggestions });

    return (
        <div
            className="flex max-w-full flex-col items-start gap-2 self-start"
            data-testid="ai-chat-suggested-questions"
        >
            {suggestions.map((question, index) => (
                <Button
                    truncate={false}
                    data-testid="ai-chat-suggested-question"
                    key={question}
                    variant="blank"
                    size="small"
                    className="animate-blur-in-slow max-w-full border-none bg-primary-solid/1 hover:bg-primary-hover"
                    style={{
                        animationDelay: `${1000 + index * 100}ms`,
                    }}
                    onClick={() => chatController.postMessage({ message: question })}
                >
                    {question}
                </Button>
            ))}
        </div>
    );
}
