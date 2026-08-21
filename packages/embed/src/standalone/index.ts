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
let frameConfigured = false;
let frameConfiguration: GitBookEmbeddableConfiguration & StandaloneConfiguration = {
    button: {
        label: 'Ask',
        icon: 'assistant',
    },
    actions: [],
    greeting: { title: '', subtitle: '' },
    suggestions: [],
    tools: [],
    tabs: ['assistant', 'search', 'docs'],
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

/**
 * The one scheme everything follows: the widget's chrome, the frame's URL and the docs inside it.
 * Either it was configured, or we match the page we are embedded in (RND-12558).
 */
function resolveColorScheme(): 'light' | 'dark' {
    const configured = frameOptions?.colorScheme;
    // Callers are plain JS, so anything else — a typo, a `system` — falls back to the page rather
    // than reaching the CSS and the frame's URL, where the two would disagree.
    return configured === 'light' || configured === 'dark' ? configured : hostColorScheme();
}

/**
 * The scheme the embedding page renders in, which is not the visitor's OS preference: a page that
 * never opted into dark stays light however the OS is set.
 *
 * Resolving a `light-dark()` is the only way to read it. A page's *used* color scheme isn't exposed
 * anywhere — the CSSOM gives computed values, and a `<meta name="color-scheme">` (the common way to
 * declare it) never even reaches those.
 */
function hostColorScheme(): 'light' | 'dark' {
    const probe = document.createElement('div');
    // The first `color` is the fallback where `light-dark()` is unsupported: without it the probe
    // would inherit the page's own text colour and a white one would read as dark.
    probe.style.cssText =
        'display:none;color:rgb(0,0,0);color:light-dark(rgb(0,0,0), rgb(255,255,255))';
    document.body.appendChild(probe);
    const used = getComputedStyle(probe).color;
    probe.remove();

    return used === 'rgb(255, 255, 255)' ? 'dark' : 'light';
}

/** Mirror the resolved scheme onto the widget's own chrome, and hand it back for the frame's URL. */
function applyColorScheme(): 'light' | 'dark' {
    const colorScheme = resolveColorScheme();
    for (const element of [widgetButton, widgetWindow]) {
        element.dataset.colorScheme = colorScheme;
    }
    return colorScheme;
}

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
        widgetIframe.allow = 'clipboard-write';
        // One read for both, so the docs can't come back in a different scheme than the panel.
        widgetIframe.src = client.getFrameURL({ ...frameOptions, colorScheme: applyColorScheme() });
        widgetWindow.appendChild(widgetIframe);

        _frame = client.createFrame(widgetIframe);
        _frame.on('close', () => {
            widgetWindow.classList.add('hidden');
            widgetButton.classList.remove('open');
        });
        // A new frame starts from the site's own defaults, so replay whatever the host configured.
        if (frameConfigured) {
            _frame.configure(frameConfiguration);
        }
    }
    return { iframe: widgetIframe, frame: _frame };
}

const GitBook = (...args: StandaloneCalls) => {
    switch (args[0]) {
        case 'init': {
            // `~gitbook/embed/script.js` already calls `init`, so an integrator following the docs
            // ends up calling it a second time. Take the new options instead of throwing: throwing
            // here dropped every call queued behind it (RND-12558).
            _client = createGitBook(args[1]);
            frameOptions = {
                // Replace rather than merge: a call that leaves out `visitor` — a logout, another
                // site — must not keep the token from the last one.
                ...args[2],
                // Except the scheme, where the first one wins: `script.js` passes the site's own
                // theme when it pins one, and that is not the integrator's to override.
                colorScheme: frameOptions?.colorScheme ?? args[2]?.colorScheme,
            };
            const colorScheme = applyColorScheme();

            // Rebuild the frame only if the new options change its URL — reloading it on the
            // loader's `init` plus the integrator's would throw away a chat for nothing.
            const frameURL = _client.getFrameURL({ ...frameOptions, colorScheme });
            if (widgetIframe && widgetIframe.src !== frameURL) {
                const wasOpen = !widgetWindow.classList.contains('hidden');
                widgetIframe.remove();
                widgetIframe = undefined;
                _frame = undefined;
                if (wasOpen) {
                    getIframe();
                }
            }
            break;
        }
        case 'unload':
            _client = undefined;
            _frame = undefined;
            widgetIframe?.remove();
            widgetIframe = undefined;
            frameOptions = undefined;
            frameConfigured = false;
            applyColorScheme();
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

            frameConfigured = true;
            getIframe().frame.configure({
                ...frameConfiguration,
            });
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
// Replay each queued call on its own, so one that throws doesn't drop the rest.
precalls.forEach((call) => {
    try {
        GitBook(...call);
    } catch (error) {
        console.error('[gitbook:embed]', error);
    }
});
