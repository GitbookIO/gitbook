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
 * Custom button definition to be passed to the embeddable GitBook.
 */
export type GitBookEmbeddableButtonDefinition = {
    /**
     * Icon to be displayed in the button.
     */
    icon: IconName;

    /**
     * Label to be displayed in the button.
     */
    label: string;

    /**
     * Callback when the button is clicked.
     */
    onClick: () => void | Promise<void>;
};

/**
 * Overall configuration for the layout of the embeddable GitBook.
 */
export type GitBookEmbeddableConfiguration = {
    /**
     * Buttons to be displayed in the header of the embeddable GitBook.
     */
    buttons: GitBookEmbeddableButtonDefinition[];

    /** Message to be displayed in the welcome page. */
    welcomeMessage: string;

    /** Suggestions of questions to be displayed in the welcome page. */
    suggestions: string[];

    /** Tools to be provided to the assistant. */
    tools: GitBookToolDefinition[];
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
          type: 'clearChat';
      }
    | {
          type: 'configure';
          settings: GitBookEmbeddableConfiguration;
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
