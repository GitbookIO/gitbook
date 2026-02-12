import { tString, useLanguage } from '@/intl/client';
import type { AIChatController } from '../AI';
import { Button } from '../primitives';

export default function AIChatSuggestedQuestions(props: {
    chatController: AIChatController;
    suggestions?: string[];
}) {
    const language = useLanguage();
    const { chatController, suggestions: _suggestions } = props;

    const suggestions =
        _suggestions && _suggestions.length > 0
            ? _suggestions
            : [
                  tString(language, 'ai_chat_suggested_questions_about_this_page'),
                  tString(language, 'ai_chat_suggested_questions_read_next'),
                  tString(language, 'ai_chat_suggested_questions_example'),
              ];

    return (
        <div
            className="flex max-w-full max-w-full flex-col items-start gap-2 self-start"
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
