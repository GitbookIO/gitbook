import type { AIToolCallResult, AIToolDefinition } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

/**
 * Custom tool definition to be passed to the AI assistant.
 */
export type GitBookToolDefinition = AIToolDefinition & {
    /**
     * Confirmation action to be displayed to the user before executing the tool.
     */
    confirmation?: {
        icon?: IconName;
        label: string;
    };

    /**
     * Callback when the tool is executed.
     * The input is provided by the AI assistant following the input schema of the tool.
     */
    execute: (input: object) => Promise<Pick<AIToolCallResult, 'output' | 'summary'>>;
};

/**
 * Placeholder settings.
 */
export type GitBookPlaceholderSettings = {
    /**
     * Welcome message to be displayed in the placeholder.
     */
    welcomeMessage: string;

    /**
     * Suggestions to be displayed in the placeholder.
     */
    suggestions: string[];
};

/**
 * Messages sent from the parent to the frame.
 */
export type ParentToFrameMessage =
    | {
          type: 'postUserMessage';
          message: string;
      }
    | {
          type: 'registerTool';
          tool: GitBookToolDefinition;
      }
    | {
          type: 'clearChat';
      }
    | {
          type: 'setPlaceholder';
          settings: GitBookPlaceholderSettings;
      }
    | {
          type: 'navigateToPage';
          pagePath: string;
      }
    | {
          type: 'navigateToAssistant';
      };

/**
 * Messages sent from the frame to the parent.
 */
export type FrameToParentMessage = {
    type: 'close';
};
