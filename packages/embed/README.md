# `@gitbook/embed`

Embed the GitBook Docs Assistant in your product or website.

# Usage

## As a script from your docs site

All GitBook docs site includes a script to easily embed the docs assistant as a widget on your website.

The script is served at `https://docs.company.com/~gitbook/embed/script.js`.

You can find the embed script from your docs site settings, or you can copy the following and replace the `docs.company.com` by your docs site hostname.

```html
<script>
(function(){var w=window;var gb=w.GitBook;if(typeof gb!=="function"){var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.GitBook=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://docs.company.com/~gitbook/embed/script.js';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s, x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
</script>
```

## As a package from NPM

Install the package: `npm install @gitbook/embed` and import it in your web application:

```tsx
import { GitBook } from '@gitbook/embed';

```

## As React components

After installing the NPM package, you can import prebuilt React components:

```tsx
import { GitBookProvider, GitBookChatView } from '@gitbook/embed/react';

<GitBookProvider siteURL="https://docs.company.com">
    <GitBookChatView />
</GitBookProvider>
```
