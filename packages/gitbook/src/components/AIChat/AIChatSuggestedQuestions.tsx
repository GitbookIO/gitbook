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
        <div className="flex flex-col items-start gap-2 self-start">
            {suggestions.map((question, index) => (
                <Button
                    key={question}
                    variant="blank"
                    size="medium"
                    className="max-w-full animate-blur-in-slow border-none bg-primary-solid/1 px-3 py-1.5 hover:bg-primary-hover"
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
