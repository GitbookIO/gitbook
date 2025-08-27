import './style.css';

import {
    type CreateGitBookOptions,
    type GetFrameURLOptions,
    type GitBookClient,
    type GitBookEmbeddableConfiguration,
    type GitBookFrameClient,
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
    // Clear the chat
    | ['clearChat']
    // Configure the embed
    | ['configure', Partial<GitBookEmbeddableConfiguration>]
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
widgetButton.innerHTML = `
    <span id="gitbook-widget-button-icon"></span>
    <span id="gitbook-widget-button-label">Ask</span>
`;

const widgetWindow = document.createElement('div');
widgetWindow.id = 'gitbook-widget-window';
widgetWindow.classList.add('hidden');

document.body.appendChild(widgetButton);
document.body.appendChild(widgetWindow);

let widgetIframe: HTMLIFrameElement | undefined;
let _client: GitBookClient | undefined;
let _frame: GitBookFrameClient | undefined;
let frameOptions: GetFrameURLOptions | undefined;
let frameConfiguration: GitBookEmbeddableConfiguration = {
    buttons: [],
    welcomeMessage: '',
    suggestions: [],
    tools: [],
};

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
            widgetButton.classList.remove('hidden');
            break;
        case 'hide':
            widgetButton.classList.add('hidden');
            break;
        case 'open':
            widgetWindow.classList.remove('hidden');
            widgetButton.classList.add('open');
            getIframe();
            break;
        case 'toggle':
            widgetWindow.classList.toggle('hidden');
            widgetButton.classList.toggle('open');
            getIframe();
            break;
        case 'close':
            widgetWindow.classList.add('hidden');
            widgetButton.classList.remove('open');
            break;
        case 'postUserMessage':
            getIframe().frame.postUserMessage(args[1]);
            break;
        case 'configure':
            frameConfiguration = {
                ...frameConfiguration,
                ...args[1],
            };
            getIframe().frame.configure({
                ...frameConfiguration,
                buttons: [
                    ...frameConfiguration.buttons,

                    // Always include a close button
                    {
                        icon: 'close',
                        label: 'Close',
                        onClick: () => {
                            GitBook('close');
                        },
                    },
                ],
            });
            break;
        case 'clearChat':
            getIframe().frame.clearChat();
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

GitBook('configure', {});
