# Markdown

Most of the examples from this documentation are in Markdown, which is the default parser for {{ book.GB }}, but you can also opt for the [AsciiDoc syntax](asciidoc.md).

Below is a quick overview of the Markdown syntax that you can use with {{ book.GB }}.

### Headings

To create a heading, add one to six `#` symbols before your heading text followed by one space.

```markdown
# This is an <h1> tag
## This is an <h2> tag
###### This is an <h6> tag
```

You can also add H1 and H2 headings with underlining:

```
This is an <h1> heading
=======================

This is an <h2> heading
---------------------
```

{{ book.GB }} supports a nice way for explicitly setting the header ID. If you follow the header text with an opening curly bracket (separated from the text with a least one space), a hash, the ID and a closing curly bracket, the ID is set on the header. If you use the trailing hash feature of atx style headers, the header ID has to go after the trailing hashes. For example:

```markdown
Hello {#id}
-----

# Hello {#id}

# Hello # {#id}
```

### Paragraphs and Line Breaks {#paragraphs}

A paragraph is simply one or more consecutive lines of text, separated by one or more blank lines (a line containing nothing but spaces or tabs is considered blank). Normal paragraphs should not be indented with spaces or tabs.

```
Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a *separate paragraph*.
```

### Emphasis {#emphasis}

```markdown
*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

~~This text will be crossed out.~~

_You **can** combine them_
```

### Lists {#lists}

Markdown supports ordered (numbered) and unordered (bulleted) lists with as many nested items as you want (or need). You can also combine both ordered and unordered types in one list.

##### Ordered

Ordered lists use numbers followed by periods:

```markdown
1. Item 1
2. Item 2
3. Item 3
   1. Item 3a
   2. Item 3b

1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b
```

##### Unordered

For unordered lists you can use asterisks, pluses, or hyphens:

```markdown
* Item 1
+ Item 2
- Item 3
  - Item 3a
  - Item 3b  
```

### Links {#links}

Markdown supports two style of links: inline and reference.

#### Inline

A simple link can be created by surrounding the text with square brackets and the link URL with parentheses:

```markdown
[An example inline link](http://example.com/ "Title") with a title attribute.
[An example inline link](http://example.net/) with no title attribute.
```

#### References

There is another way to create links which does not interrupt the text flow. The URL and title are defined using a reference name and this reference name is then used in square brackets instead of the link URL:

```markdown
This is [an example][id] reference-style link.
```

Then, anywhere in the document, you define your link label like this, on a line by itself:

```markdown
[id]: http://example.com/  "Optional Title Here"
```

Both types of links can point to relative paths, anchors or absolute urls:

```
[Relative path](relative/path/)
[Anchor](link#anchor)
[Absolute url](http://google.com)
```

### Images {#images}

Images can be created in a similar way as links: just use an exclamation mark before the square brackets. The link text acts as an alternative text of the image and the link URL specifies the image source:

```markdown
![Beautiful image](img/image.jpg)
```

### Blockquotes {#blockquotes}

To create a blockquote, simply add the `>` before any text you want to quote. All the lines that are started with the `>` will be added to the blockquote. 

```markdown
As Kanye West said:

> We're living the future so
> the present is our past.
```

If you want to break a blockquote in two parts, add a blank line with leading `>` between these parts:

```markdown
> This is the first line
> 
> This is the second line
```

Blockquotes can also be nested:

```markdown
> The first level of quoting
>
> > The nested blockquote
>
> Another first level of quoting
```

You can use any block-level elements inside a blockquote, such as headers, lists, code blocks:

~~~
> ## Header
> 
> 1. List item
> 2. List item
> 
> ```
> Example code: <?php echo "Hello world"; ?>
> ```
~~~

### Tables {#tables}
Tables are created using pipe `|` to separate each column and hyphens `-` to separate table headers:

```markdown
| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |
```

Colons can be used to align columns:

```markdown
| First Header    | Second Header | Third Header     |
| :-------------- | :-----------: | ---------------: |
| First column    | Second column | Third column     |
| is left-aligned | is centered   | is right-aligned |
```

The outher pipes are optional and you don't have to make a table perfectly aligned - there must be at least three hyphens in each column of the header row.

### Code {#code}

To create a code block, indent every line of block by 4 spaces or 1 tab:

```markdown
A paragraph

   a code block
```

or use triple backticks (`):

~~~
```
This is a code block
```
~~~

It is recommended to place a blank line before and after code blocks to make the raw formatting easier to read.

##### Inline code block

Text fragments can be marked up as code by surrounding them with backticks:

```markdown
Use `gitbook` to convert `text` in Markdown to `HTML`.
```

##### Syntax highlighting

You can explicitly define the language to be used for syntax highlighting by adding its name after the opening backticks.

Below is the short Ruby code block:

```ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
```

If your code contains templating syntax such as `{{ this }}` (see [templating](/docs/templating/variables.md)), you can disable templating with a `raw` block:

~~~
{% raw %}
    ```html
    <span>{{ this will not be interpreted as templating }}</span>
    ```
{% endraw %}
~~~

### Footnotes {#footnotes}

Footnotes are created in a way similar to reference-style links. Footnotes are relative to pages.

```markdown
Text prior to footnote reference.[^2]

[^2]: Comment to include in footnote.
```

### HTML {#html-syntax}

{{ book.GB }} supports use of raw HTML in your text, Markdown syntax in HTML is not processed:

```html
<div>
Markdown here will not be **parsed**
</div>
```

### Horizontal Rule {#hr-syntax}

Horizontal rules can be added using three or more asterisks, hyphens, or underscores. They can also be separated by spaces or tabs:

```markdown
Asterisks

***

* * * 

Hyphens

---

- - -

Underscores

___

_ _ _

```

### Ignoring Markdown formatting {#ignore-md-syntax}

You can tell {{ book.GB }} to ignore (escape) Markdown formatting by using `\` before the Markdown character.

```
Let's rename \*our-new-project\* to \*our-old-project\*.
```
