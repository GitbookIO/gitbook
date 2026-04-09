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
    | ['configure', Partial<GitBookEmbeddableConfiguration & StandaloneConfiguration>]
    // Navigate to a page
    | ['navigateToPage', string]
    // Navigate to the assistant
    | ['navigateToAssistant'];

type StandaloneConfiguration = {
    /** Configure the button to open the embed */
    button: {
        /** Label to be displayed in the button. */
        label: string;
        /** Icon to be displayed in the button. */
        icon: 'assistant' | 'sparkle' | 'help' | 'book';
    };
};

export type GitBookStandalone = ((...args: StandaloneCalls) => void) & {
    q?: StandaloneCalls[];
};

let widgetIframe: HTMLIFrameElement | undefined;
let _client: GitBookClient | undefined;
let _frame: GitBookFrameClient | undefined;
let frameOptions: GetFrameURLOptions | undefined;
let lastPushedColorScheme: 'light' | 'dark' | undefined;
let frameConfiguration: GitBookEmbeddableConfiguration & StandaloneConfiguration = {
    button: {
        label: 'Ask',
        icon: 'assistant',
    },
    actions: [],
    greeting: { title: '', subtitle: '' },
    suggestions: [],
    tools: [],
    tabs: ['assistant', 'docs'],
    trademark: true,
};

const widgetButton = document.createElement('button');
widgetButton.id = 'gitbook-widget-button';
widgetButton.addEventListener('click', () => {
    GitBook('toggle');
});
widgetButton.innerHTML = `
    <span id="gitbook-widget-button-icon" data-icon="${frameConfiguration.button.icon}"></span>
    <span id="gitbook-widget-button-label">${frameConfiguration.button.label}</span>
`;

const widgetWindow = document.createElement('div');
widgetWindow.id = 'gitbook-widget-window';
widgetWindow.classList.add('hidden');

document.body.appendChild(widgetButton);
document.body.appendChild(widgetWindow);

/** Resolved `color-scheme` from the iframe element (incl. inheritance from `#gitbook-widget-window`). */
function colorSchemeFromIframe(): 'light' | 'dark' | undefined {
    if (!widgetIframe) return undefined;
    const v = getComputedStyle(widgetIframe).colorScheme.trim().toLowerCase();
    return v === 'dark' || v === 'light' ? v : undefined;
}

function pushColorSchemeToFrame() {
    if (!_frame) return;

    const desired = frameConfiguration.colorScheme ?? colorSchemeFromIframe();
    if (desired === lastPushedColorScheme) return;
    lastPushedColorScheme = desired;

    _frame.configure({
        ...frameConfiguration,
        colorScheme: desired,
    });
}

/** Re-push when the host page or widget chrome changes theme (class/style) or OS preference changes. */
function installHostThemeBridge() {
    const onChange = () => pushColorSchemeToFrame();
    window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', onChange);

    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(onChange);
    const opts: MutationObserverInit = {
        attributes: true,
        attributeFilter: ['class', 'style'],
    };
    observer.observe(document.documentElement, opts);
    // Safari: `color-scheme` on `#gitbook-widget-window` does not always surface on `<html>`.
    observer.observe(widgetWindow, opts);
}
installHostThemeBridge();

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
        lastPushedColorScheme = undefined;
        widgetIframe = document.createElement('iframe');
        widgetIframe.id = 'gitbook-widget-iframe';
        widgetIframe.src = client.getFrameURL({
            ...frameOptions,
        });
        widgetWindow.appendChild(widgetIframe);

        _frame = client.createFrame(widgetIframe);
        _frame.on('close', () => {
            widgetWindow.classList.add('hidden');
            widgetButton.classList.remove('open');
        });

        pushColorSchemeToFrame();
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
        case 'configure': {
            const settings = args[1];

            // If trademark is disabled, change the (branded) icon to the sparkle icon
            if (
                settings.trademark === false &&
                !settings.button?.icon &&
                frameConfiguration.button.icon === 'assistant'
            ) {
                settings.button = {
                    label: frameConfiguration.button.label,
                    icon: 'sparkle',
                };
            }

            frameConfiguration = {
                ...frameConfiguration,
                ...settings,
            };
            // Update the button label and icon
            if (settings.button?.label) {
                const label = widgetButton.querySelector('#gitbook-widget-button-label');
                if (label) {
                    label.textContent = settings.button.label;
                }
            }
            if (settings.button?.icon) {
                const icon = widgetButton.querySelector('#gitbook-widget-button-icon');
                if (icon) {
                    icon.setAttribute('data-icon', settings.button.icon);
                }
            }

            const { frame } = getIframe();
            // Always propagate configuration updates, even when color-scheme doesn't change.
            frame.configure({
                ...frameConfiguration,
            });
            pushColorSchemeToFrame();
            break;
        }
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
