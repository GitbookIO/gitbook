import type { AIChatController } from '../AI/useAIChat';
import { Button } from '../primitives';

const DEFAULT_SUGGESTED_QUESTIONS = [
    'What is this page about?',
    'What should I read next?',
    'Can you give an example?',
];

export default function AIChatSuggestedQuestions(props: { chatController: AIChatController }) {
    const { chatController } = props;

    return (
        <div className="flex flex-col items-center gap-2">
            {DEFAULT_SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                    key={question}
                    label={question}
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
