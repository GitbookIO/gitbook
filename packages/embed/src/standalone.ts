import {
    type CreateGitBookOptions,
    type GitBookClient,
    type GitBookFrameClient,
    type GitBookPlaceholderSettings,
    type GitBookToolDefinition,
    createGitBook,
} from './client';

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
    // Post a user message
    | ['postUserMessage', string]
    // Register a tool
    | ['registerTool', GitBookToolDefinition]
    // Clear the chat
    | ['clearChat']
    // Configure the placeholder
    | ['setPlaceholder', GitBookPlaceholderSettings];

if (typeof window !== 'undefined') {
    const widgetButton = document.createElement('button');
    widgetButton.classList.add('gitbook-widget-button');
    widgetButton.style.position = 'fixed';
    widgetButton.style.bottom = '20px';
    widgetButton.style.right = '20px';
    widgetButton.style.zIndex = '1000';
    widgetButton.style.width = '50px';
    widgetButton.style.height = '50px';

    const widgetWindow = document.createElement('div');
    widgetWindow.classList.add('gitbook-widget-window');
    widgetWindow.style.position = 'fixed';
    widgetWindow.style.bottom = '20px';
    widgetWindow.style.right = '20px';
    widgetWindow.style.zIndex = '1000';
    widgetWindow.style.width = '300px';
    widgetWindow.style.height = '400px';
    widgetWindow.style.backgroundColor = 'white';
    widgetWindow.style.border = '1px solid #ccc';
    widgetWindow.style.borderRadius = '5px';
    widgetWindow.style.padding = '10px';
    widgetWindow.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.1)';

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
        }
    };

    // @ts-expect-error - GitBook is not defined in the global scope
    const precalls = ((window.GitBook as any) ?? []) as StandaloneCalls[];

    // @ts-expect-error - GitBook is not defined in the global scope
    window.GitBook = GitBook;
    precalls.forEach((call) => GitBook(...call));
}
