import { useCurrentContent } from '@/components/hooks';
import { tString, useLanguage } from '@/intl/client';
import type { AIChatController } from '../AI';
import { useRecentSearchQueries } from '../Search/recent-queries';
import { Button } from '../primitives';

export default function AIChatSuggestedQuestions(props: {
    chatController: AIChatController;
    suggestions?: string[];
}) {
    const language = useLanguage();
    const { siteSpaceId } = useCurrentContent();
    const recentQueries = useRecentSearchQueries(siteSpaceId ?? '');
    const { chatController, suggestions: configuredSuggestions } = props;

    const defaultSuggestions = [
        tString(language, 'ai_chat_suggested_questions_about_this_page'),
        tString(language, 'ai_chat_suggested_questions_read_next'),
        tString(language, 'ai_chat_suggested_questions_example'),
    ];
    const baseSuggestions =
        configuredSuggestions && configuredSuggestions.length > 0
            ? configuredSuggestions
            : defaultSuggestions;

    const suggestions = [
        ...recentQueries.filter((entry) => entry.action === 'ask').map((entry) => entry.query),
        ...baseSuggestions,
    ].reduce<string[]>((acc, suggestion) => {
        if (acc.includes(suggestion)) {
            return acc;
        }

        acc.push(suggestion);
        return acc;
    }, []);

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
                    className="max-w-full animate-blur-in-slow border-none bg-primary-solid/1 hover:bg-primary-hover"
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
