import './style.css';

import {
    type CreateGitBookOptions,
    type GitBookClient,
    type GitBookFrameClient,
    type GitBookPlaceholderSettings,
    type GitBookToolDefinition,
    createGitBook,
} from '../client';

export type GitBook = () => void;

type StandaloneCalls =
    // Initialize the widget
    | ['init', CreateGitBookOptions]
    // Unload the widget
    | ['unload']
    // Show the widget
    | ['show']
    // Hide the widget
    | ['hide']
    // Open the window
    | ['open']
    // Close the window
    | ['close']
    // Toggle the window
    | ['toggle']
    // Post a user message
    | ['postUserMessage', string]
    // Register a tool
    | ['registerTool', GitBookToolDefinition]
    // Clear the chat
    | ['clearChat']
    // Configure the placeholder
    | ['setPlaceholder', GitBookPlaceholderSettings];

export type GitBookStandalone = ((...args: StandaloneCalls) => void) & {
    q?: StandaloneCalls[];
};

if (typeof window !== 'undefined') {
    const widgetButton = document.createElement('button');
    widgetButton.id = 'gitbook-widget-button';
    widgetButton.addEventListener('click', () => {
        GitBook('toggle');
    });

    const widgetWindow = document.createElement('div');
    widgetWindow.id = 'gitbook-widget-window';
    widgetWindow.classList.add('hidden');

    document.body.appendChild(widgetButton);
    document.body.appendChild(widgetWindow);

    let client: GitBookClient | undefined;
    let frame: GitBookFrameClient | undefined;

    const GitBook = (...args: StandaloneCalls) => {
        switch (args[0]) {
            case 'init':
                client = createGitBook(args[1]);
                break;
            case 'unload':
                client = undefined;
                frame = undefined;
                break;
            case 'show':
                widgetButton.style.display = 'block';
                break;
            case 'hide':
                widgetButton.style.display = 'none';
                break;
            case 'open':
                widgetWindow.classList.remove('hidden');
                break;
            case 'toggle':
                widgetWindow.classList.toggle('hidden');
                break;
            case 'close':
                widgetWindow.classList.add('hidden');
                break;
        }
    };

    // @ts-expect-error - GitBook is not defined in the global scope
    const precalls = (window.GitBook as GitBookStandalone | undefined)?.q ?? [];

    // @ts-expect-error - GitBook is not defined in the global scope
    window.GitBook = GitBook;
    precalls.forEach((call) => GitBook(...call));
}
