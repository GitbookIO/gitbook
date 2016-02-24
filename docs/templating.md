# Templating

GitBook uses the Nunjucks templating language to process pages and theme's templates.

The Nunjucks syntax is very similar to **Jinja2** or **Liquid**.

### Variables

A variable looks up a value from the template context. If you wanted to simply display a variable, you would do:

```
{{ username }}
```

This looks up username from the context and displays it. Variable names can have dots in them which lookup properties, just like javascript. You can also use the square bracket syntax.

```
{{ foo.bar }}
{{ foo["bar"] }}
```

If a value is undefined, nothing is displayed. The following all output nothing if foo is undefined: `{{ foo }}`, `{{ foo.bar }}`, `{{ foo.bar.baz }}`.

### Filters

Filters are essentially functions that can be applied to variables. They are called with a pipe operator (`|`) and can take arguments.

```
{{ foo | title }}
{{ foo | join(",") }}
{{ foo | replace("foo", "bar") | capitalize }}
```

The third example shows how you can chain filters. It would display "Bar", by first replacing "foo" with "bar" and then capitalizing it.
