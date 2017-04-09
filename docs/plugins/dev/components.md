# Components

## Injection

Plugins can inject components by registering React components to some roles.

#### Register a component

During the initialization phase of your plugin, dispatch the `GitBook.registerComponent` action:

```js
dispatch(GitBook.registerComponent(MyCustomButton, { role: 'toolbar:buttons:left' }));
```

#### Roles

Custom roles can be use for interoperability with other plugins, but {{ book.GB }} and the default theme set a convention for common roles:

| Role | Description | Props |
| ---- | ----------- | ----- |
| `page:container` | DIV container for the page's content | `{ page: Page }` |
| `summary:container` | DIV container for the whole summary | `{ summary: Summary }` |
| `summary:parts` | DIV container for summary's parts | `{ parts: List<SummaryPart> }` |
| `summary:part` | DIV for a specific part | `{ part: SummaryPart }` |
| `summary:articles` | UL container for a part's articles | `{ articles: List<SummaryArticle> }` |
| `summary:article` | LI for a specific article | `{ article: SummaryArticle }` |

## Default Components

#### `GitBook.Head`

Extends meta tags of a page. This is an alias for [react-helmet](https://github.com/nfl/react-helmet).

```js
<GitBook.Head
    title="My page"
  />
```

#### `GitBook.ImportCSS`

Imports a CSS file by resolving the path correctly according to the current page:

```js
<GitBook.ImportCSS href="myfile.css" />
```

#### `GitBook.ImportJS`

Imports a JS file by resolving the path correctly according to the current page:

```js
<GitBook.ImportJS src="mylib.js" />
```

#### `GitBook.InjectedComponent`

Injects a component matching a specific role:

```js
<GitBook.InjectedComponent matching={{ role: 'mycustomrole' }} props={{ someProp: 1 }}>
    <b>Inner content</b>
</GitBook.InjectedComponent>
```

#### `GitBook.InjectedComponentSet`

Same API as `InjectedComponentSet` but renders the matching components in chain instead of composed:

```js
<GitBook.InjectedComponentSet matching={{ role: 'mytoolbar' }} />
```

**Warning:** Children are discarded.

#### `GitBook.FlexLayout` and `GitBook.FlexBox`

A simple wrapper that provides a Flexbox layout with the given direction and style. Any additional props you set on the Flexbox are rendered.

```js
<GitBook.FlexLayout column>
    <GitBook.FlexBox>First column</GitBook.FlexBox>
    <GitBook.FlexBox>Second column</GitBook.FlexBox>
</GitBook.FlexLayout>
```
