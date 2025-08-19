import './style.css';

import {
    type CreateGitBookOptions,
    type GetFrameURLOptions,
    type GitBookClient,
    type GitBookFrameClient,
    type GitBookPlaceholderSettings,
    type GitBookToolDefinition,
    createGitBook,
} from '../client';

export type GitBook = () => void;

type StandaloneCalls =
    // Initialize the widget
    | ['init', CreateGitBookOptions, GetFrameURLOptions]
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
    | ['setPlaceholder', GitBookPlaceholderSettings]
    // Navigate to a page
    | ['navigateToPage', string]
    // Navigate to the assistant
    | ['navigateToAssistant'];

export type GitBookStandalone = ((...args: StandaloneCalls) => void) & {
    q?: StandaloneCalls[];
};

const widgetButton = document.createElement('button');
widgetButton.id = 'gitbook-widget-button';
widgetButton.addEventListener('click', () => {
    GitBook('toggle');
});

const widgetWindow = document.createElement('div');
widgetWindow.id = 'gitbook-widget-window';
widgetWindow.classList.add('hidden');

let widgetIframe: HTMLIFrameElement | undefined;

document.body.appendChild(widgetButton);
document.body.appendChild(widgetWindow);

let _client: GitBookClient | undefined;
let _frame: GitBookFrameClient | undefined;
let frameOptions: GetFrameURLOptions | undefined;

function getClient() {
    if (!_client) {
        throw new Error(
            'GitBook client not initialized. Call GitBook("init", { siteURL: "..." }) first.'
        );
    }
    return _client;
}

function getIframe() {
    if (!widgetIframe || !_frame) {
        const client = getClient();

        widgetIframe?.remove();
        widgetIframe = document.createElement('iframe');
        widgetIframe.id = 'gitbook-widget-iframe';
        widgetIframe.src = client.getFrameURL({
            ...frameOptions,
        });
        widgetWindow.appendChild(widgetIframe);

        _frame = client.createFrame(widgetIframe);
    }
    return { iframe: widgetIframe, frame: _frame };
}

const GitBook = (...args: StandaloneCalls) => {
    switch (args[0]) {
        case 'init':
            if (_client) {
                throw new Error(
                    'GitBook client already initialized. Call GitBook("unload") first.'
                );
            }
            _client = createGitBook(args[1]);
            frameOptions = args[2];
            break;
        case 'unload':
            _client = undefined;
            _frame = undefined;
            widgetIframe?.remove();
            widgetWindow.classList.add('hidden');
            break;
        case 'show':
            widgetButton.style.display = 'block';
            break;
        case 'hide':
            widgetButton.style.display = 'none';
            break;
        case 'open':
            widgetWindow.classList.remove('hidden');
            getIframe();
            break;
        case 'toggle':
            widgetWindow.classList.toggle('hidden');
            getIframe();
            break;
        case 'close':
            widgetWindow.classList.add('hidden');
            break;
        case 'postUserMessage':
            getIframe().frame.postUserMessage(args[1]);
            break;
        case 'registerTool':
            getIframe().frame.registerTool(args[1]);
            break;
        case 'clearChat':
            getIframe().frame.clearChat();
            break;
        case 'setPlaceholder':
            getIframe().frame.setPlaceholder(args[1]);
            break;
        case 'navigateToPage':
            getIframe().frame.navigateToPage(args[1]);
            break;
        case 'navigateToAssistant':
            getIframe().frame.navigateToAssistant();
            break;
    }
};

// @ts-expect-error - GitBook is not defined in the global scope
const precalls = (window.GitBook as GitBookStandalone | undefined)?.q ?? [];

// @ts-expect-error - GitBook is not defined in the global scope
window.GitBook = GitBook;
precalls.forEach((call) => GitBook(...call));
