import { tString, useLanguage } from '@/intl/client';
import type { AIChatController } from '../AI';
import { Button } from '../primitives';

export default function AIChatSuggestedQuestions(props: {
    chatController: AIChatController;
    suggestions?: string[];
}) {
    const language = useLanguage();
    const {
        chatController,
        suggestions = [
            tString(language, 'ai_chat_suggested_questions_about_this_page'),
            tString(language, 'ai_chat_suggested_questions_read_next'),
            tString(language, 'ai_chat_suggested_questions_example'),
        ],
    } = props;

    return (
        <div className="flex flex-col items-center gap-2">
            {suggestions.map((question, index) => (
                <Button
                    key={question}
                    variant="secondary"
                    size="medium"
                    className="max-w-full animate-[present_500ms_both] whitespace-normal"
                    style={{
                        animationDelay: `${800 + index * 100}ms`,
                    }}
                    onClick={() => chatController.postMessage({ message: question })}
                >
                    {question}
                </Button>
            ))}
        </div>
    );
}
