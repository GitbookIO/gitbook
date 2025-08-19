# `@gitbook/embed`

Embed the GitBook Docs Assistant in your product or website.

# Usage

## As a script from your docs site

All GitBook docs site includes a script to easily embed the docs assistant as a widget on your website.

The script is served at `https://docs.company.com/~gitbook/embed/script.js`.

You can find the embed script from your docs site settings, or you can copy the following and replace the `docs.company.com` by your docs site hostname.

```html
<script src="https://docs.company.com/~gitbook/embed/script.js"></script>
<script>
window.GitBook('show');
</script>
```

## As a package from NPM

Install the package: `npm install @gitbook/embed` and import it in your web application:

```tsx
import { createGitBook } from '@gitbook/embed';

const gitbook = createGitBook({
    siteURL: 'https://docs.company.com'
});

const iframe = document.createElement('iframe');
iframe.src = gitbook.getFrameURL();

const frame = gitbook.createFrame(iframe);
```

## As React components

After installing the NPM package, you can import prebuilt React components:

```tsx
import { GitBookProvider, GitBookAssistantFrame } from '@gitbook/embed/react';

<GitBookProvider siteURL="https://docs.company.com">
    <GitBookAssistantFrame />
</GitBookProvider>
```
