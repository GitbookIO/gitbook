# GitBook Docs Embed (`@gitbook/embed`)

Embed your GitBook docs in your product or website.

The Docs Embed can contain two tabs:
- **Assistant**: The [GitBook Assistant](https://gitbook.com/docs/publishing-documentation/gitbook-ai-assistant) - an AI-powered chat interface to help users find answers
- **Docs**: A browser for navigating your documentation site

The embed is set up automatically based on your site's configuration. You can optionally customize and override the configuration with custom actions, tools, suggested questions, [Authenticated Access](https://gitbook.com/docs/publishing-documentation/authenticated-access), and more. See the [Configuration](#configuration) section for all available options.

# Usage

## As a standalone script from your docs site

All GitBook docs sites include a script to easily add the Docs Embed as a widget on your website.

The script is served at `https://docs.company.com/~gitbook/embed/script.js`.

You can find the embed script from your docs site settings, or you can copy the following and replace `docs.company.com` with your docs site hostname.

```html
<script src="https://docs.company.com/~gitbook/embed/script.js"></script>
<script>
// Initialize with Authenticated Access (optional)
window.GitBook('init', 
    { siteURL: 'https://docs.company.com' },
    { visitor: { token: 'your-jwt-token' } }
);
window.GitBook('show');
</script>
```

The standalone script provides a global `GitBook` function. See the [API Reference](#api-reference) section for all available methods.

### Example: Configuring the widget

```javascript
GitBook('configure', {
    button: {
        label: 'Ask',
        icon: 'assistant' // 'assistant' | 'sparkle' | 'circle-question' | 'book'
    },
    tabs: ['assistant', 'docs'],
    actions: [
        {
            icon: 'circle-question',
            label: 'Contact Support',
            onClick: () => window.open('https://support.example.com', '_blank')
        }
    ],
    greeting: { title: 'Welcome!', subtitle: 'How can I help?' },
    suggestions: ['What is GitBook?', 'How do I get started?'],
    tools: [/* ... */]
});
```

See the [Configuration](#configuration) section for all available options.

## As a package from NPM

Install the package: `npm install @gitbook/embed` and import it in your web application:

```tsx
import { createGitBook } from '@gitbook/embed';

const gitbook = createGitBook({
    siteURL: 'https://docs.company.com'
});

// Create an iframe and get its URL
const iframe = document.createElement('iframe');
iframe.src = gitbook.getFrameURL({
    visitor: {
        token: 'your-jwt-token', // Optional: for Adaptive Content or Authenticated Access
        unsignedClaims: { // Optional: custom claims for dynamic expressions
            userId: '123',
            plan: 'premium'
        }
    }
});

// Create a frame client to communicate with the iframe
const frame = gitbook.createFrame(iframe);

// Use the frame client methods
frame.navigateToPage('/getting-started'); // Navigate to a page in the docs tab
frame.navigateToAssistant(); // Switch to the assistant tab
frame.postUserMessage('How do I get started?');
frame.clearChat();

// Configure the embed (see Configuration section for all options)
frame.configure({
    tabs: ['assistant', 'docs'],
    actions: [
        {
            icon: 'circle-question',
            label: 'Contact Support',
            onClick: () => window.open('https://support.example.com', '_blank')
        }
    ],
    greeting: { title: 'Welcome!', subtitle: 'How can I help?' },
    suggestions: ['What is GitBook?', 'How do I get started?'],
    tools: [/* ... */]
});

// Listen to events
frame.on('close', () => {
    console.log('Frame closed');
});
```

## As React components

After installing the NPM package, you can import prebuilt React components:

```tsx
import { GitBookProvider, GitBookFrame } from '@gitbook/embed/react';

<GitBookProvider siteURL="https://docs.company.com">
    <GitBookFrame
        visitor={{
            token: 'your-jwt-token', // Optional: for Adaptive Content or Authenticated Access
            unsignedClaims: { userId: '123' } // Optional: custom claims for dynamic expressions
        }}
        tabs={['assistant', 'docs']}
        greeting={{ title: 'Welcome!', subtitle: 'How can I help?' }}
        suggestions={['What is GitBook?', 'How do I get started?']}
        actions={[
            {
                icon: 'circle-question',
                label: 'Contact Support',
                onClick: () => window.open('https://support.example.com', '_blank')
            }
        ]}
        tools={[/* ... */]}
    />
</GitBookProvider>
```

You can also use the `useGitBook` hook to access the client:

```tsx
import { useGitBook } from '@gitbook/embed/react';

function MyComponent() {
    const gitbook = useGitBook();
    const frameURL = gitbook.getFrameURL({ visitor: { token: '...' } });
    // ...
}
```

# API Reference

## Method Comparison

| Method | Standalone Script | NPM Package | React Components |
|--------|------------------|-------------|------------------|
| **Initialize** | `GitBook('init', options, frameOptions)` | `createGitBook(options)` | `<GitBookProvider siteURL="...">` |
| **Get frame URL** | ❌ (handled internally) | `client.getFrameURL(options)` | `useGitBook().getFrameURL(options)` |
| **Create frame client** | ❌ (handled internally) | `client.createFrame(iframe)` | `useGitBook().createFrame(iframe)` |
| **Show/Hide widget** | `GitBook('show')` / `GitBook('hide')` | ❌ | ❌ |
| **Open/Close window** | `GitBook('open')` / `GitBook('close')` / `GitBook('toggle')` | ❌ | ❌ |
| **Navigate to page** | `GitBook('navigateToPage', path)` | `frame.navigateToPage(path)` | Via frame client |
| **Navigate to assistant** | `GitBook('navigateToAssistant')` | `frame.navigateToAssistant()` | Via frame client |
| **Post message** | `GitBook('postUserMessage', message)` | `frame.postUserMessage(message)` | Via frame client |
| **Clear chat** | `GitBook('clearChat')` | `frame.clearChat()` | Via frame client |
| **Configure** | `GitBook('configure', settings)` | `frame.configure(settings)` | Props on `<GitBookFrame>` |
| **Event listeners** | ❌ | `frame.on(event, listener)` | Via frame client |
| **Unload** | `GitBook('unload')` | ❌ | ❌ |

## Method Signatures

### Standalone Script

- `GitBook('init', options: { siteURL: string }, frameOptions?: { visitor?: {...} })` - Initialize widget
- `GitBook('show')` - Show widget button
- `GitBook('hide')` - Hide widget button
- `GitBook('open')` - Open widget window
- `GitBook('close')` - Close widget window
- `GitBook('toggle')` - Toggle widget window
- `GitBook('navigateToPage', path: string)` - Navigate to page
- `GitBook('navigateToAssistant')` - Navigate to assistant tab
- `GitBook('postUserMessage', message: string)` - Post message to chat
- `GitBook('clearChat')` - Clear chat history
- `GitBook('configure', settings: {...})` - Configure widget
- `GitBook('unload')` - Unload widget

### NPM Package

**Client Factory:**
- `createGitBook(options: { siteURL: string })` → `GitBookClient`
- `client.getFrameURL(options?: { visitor?: {...} })` → `string`
- `client.createFrame(iframe: HTMLIFrameElement)` → `GitBookFrameClient`

**Frame Client:**
- `frame.navigateToPage(path: string)` → `void`
- `frame.navigateToAssistant()` → `void`
- `frame.postUserMessage(message: string)` → `void`
- `frame.clearChat()` → `void`
- `frame.configure(settings: Partial<GitBookEmbeddableConfiguration>)` → `void`
- `frame.on(event: string, listener: Function)` → `() => void` (unsubscribe)

### React Components

**Components:**
- `<GitBookProvider siteURL: string>` - Provider component
- `<GitBookFrame {...props}>` - Frame component (accepts all config options as props)

**Hooks:**
- `useGitBook()` → `GitBookClient` (must be used within `<GitBookProvider>`)

# Configuration

Configuration options are available across usage methods as follows:
- **Standalone script**: via `GitBook('configure', {...})`
- **NPM package**: via `frame.configure({...})`
- **React components**: via props on `<GitBookFrame>`

### `tabs`

Available in: Standalone script, NPM package, React components

Override which tabs are displayed. Defaults to your site's configuration.

- **Type**: `('assistant' | 'docs')[]`
- **Options**:
  - `['assistant', 'docs']` - Show both tabs
  - `['assistant']` - Show only the assistant tab
  - `['docs']` - Show only the docs tab

```javascript
tabs: ['assistant', 'docs']
```

### `actions`

Available in: Standalone script, NPM package, React components

Custom action buttons rendered in the sidebar alongside tabs. Each action button triggers a callback when clicked.

- **Type**: `GitBookEmbeddableActionDefinition[]`
- **Properties**:
  - `icon`: `string` - Icon name (e.g., `'circle-question'`, `'book'`, `'sparkle'`, `'rocket'`, `'assistant'`)
  - `label`: `string` - Button label text
  - `onClick`: `() => void | Promise<void>` - Callback function when clicked

```javascript
actions: [
    {
        icon: 'circle-question',
        label: 'Contact Support',
        onClick: () => window.open('https://support.example.com', '_blank')
    },
    {
        icon: 'rocket',
        label: 'Get started',
        onClick: () => {
            GitBook('navigateToPage', '/getting-started');
        }
    }
]
```

### `greeting`

Available in: Standalone script, NPM package, React components

Welcome message displayed in the [Assistant](https://gitbook.com/docs/publishing-documentation/gitbook-ai-assistant) tab.

- **Type**: `{ title: string, subtitle: string }`

```javascript
greeting: {
    title: 'Welcome!',
    subtitle: 'How can I help you today?'
}
```

### `suggestions`

Available in: Standalone script, NPM package, React components

Suggested questions displayed in the [Assistant](https://gitbook.com/docs/publishing-documentation/gitbook-ai-assistant) welcome screen.

- **Type**: `string[]`

```javascript
suggestions: [
    'What is GitBook?',
    'How do I get started?',
    'What can you do?'
]
```

### `tools`

Available in: Standalone script, NPM package, React components

Custom AI tools to extend the [Assistant](https://gitbook.com/docs/publishing-documentation/gitbook-ai-assistant). Tools allow the assistant to execute functions and integrate with your own systems.

**Note**: In addition to custom tools, the Assistant will always have access to any [MCP servers you define](https://gitbook.com/docs/publishing-documentation/gitbook-ai-assistant#extend-gitbook-assistant-with-mcp-servers) in your site's AI settings.

- **Type**: `GitBookToolDefinition[]`
- **Properties**:
  - `name`: `string` - Unique tool identifier
  - `description`: `string` - Description of what the tool does (used by the AI to decide when and how to use it).
  - `inputSchema`: `object` - JSON schema defining the tool's input parameters
  - `execute`: `(input: object) => Promise<{ output: any, summary: string }>` - Async function that executes the tool.
    - `output`: The result of the tool execution, provided to the AI to continue working with. Not shown to the user.
    - `summary`: The visual summary of the tool execution, shown in the user's chat window.
  - `confirmation`: `{ icon?: string, label: string }` (optional) - Confirmation button shown before execution, useful for actions that require the user's express approval.

```javascript
tools: [
    {
        name: 'get_user_info',
        description: 'Get information about the current user',
        inputSchema: {
            type: 'object',
            properties: {
                userId: { 
                    type: 'string', 
                    description: 'The user ID to look up' 
                }
            },
            required: ['userId']
        },
        execute: async (input) => {
            const user = await fetch(`/api/users/${input.userId}`).then(r => r.json());
            return {
                output: { name: user.name, plan: user.plan },
                summary: `Retrieved info for user ${user.name}`
            };
        }
    },
    {
        name: 'create_ticket',
        description: 'Create a support ticket',
        confirmation: {
            icon: 'circle-question',
            label: 'Create support ticket?'
        },
        inputSchema: {
            type: 'object',
            properties: {
                subject: { type: 'string' },
                description: { type: 'string' }
            },
            required: ['subject', 'description']
        },
        execute: async (input) => {
            const ticket = await fetch('/api/tickets', {
                method: 'POST',
                body: JSON.stringify(input)
            }).then(r => r.json());
            return {
                output: { ticketId: ticket.id },
                summary: `Created ticket #${ticket.id}`
            };
        }
    }
]
```

### `visitor` (Authenticated Access)

Available in: Standalone script (via `init`), NPM package (via `getFrameURL()`), React components (as prop)

[Authenticated Access](https://gitbook.com/docs/publishing-documentation/authenticated-access) options passed when creating the frame URL. Used for [Adaptive Content](https://gitbook.com/docs/publishing-documentation/adaptive-content) and [Authenticated Access](https://gitbook.com/docs/publishing-documentation/authenticated-access).

**Note**: This is not a configuration option but rather a parameter when initializing the frame or creating the frame URL.

**Standalone script**: Pass as the second argument to `GitBook('init', options, frameOptions)`
**NPM package**: Pass to `getFrameURL({ visitor: {...} })`
**React components**: Pass as the `visitor` prop on `<GitBookFrame>`

- **Type**: `{ token?: string, unsignedClaims?: Record<string, unknown> }`
- **Properties**:
  - `token`: `string` (optional) - Signed JWT token for [Adaptive Content](https://gitbook.com/docs/publishing-documentation/adaptive-content) or [Authenticated Access](https://gitbook.com/docs/publishing-documentation/authenticated-access)
  - `unsignedClaims`: `Record<string, unknown>` (optional) - Unsigned claims that can be used in dynamic expressions via `visitor.claims.unsigned.<claim-name>`

```javascript
visitor: {
    token: 'your-jwt-token',
    unsignedClaims: {
        userId: '123',
        plan: 'premium',
        role: 'admin'
    }
}
```

### `button`

Available in: Standalone script only

Configure the widget button for the standalone script. This option is not available when using the NPM package or React components, since they can be customized completely.

- **Type**: `{ label: string, icon: 'assistant' | 'sparkle' | 'circle-question' | 'book' }`
- **Properties**:
  - `label`: `string` - Button label text
  - `icon`: `'assistant' | 'sparkle' | 'circle-question' | 'book'` - Icon displayed on the button

```javascript
button: {
    label: 'Ask',
    icon: 'assistant'
}
```
