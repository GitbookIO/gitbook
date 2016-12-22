# plugin-sharing

This plugin adds sharing buttons in the GitBook website toolbar to share book on social networks.

### Disable this plugin

This is a default plugin and it can be disabled using a `book.json` configuration:

```
{
    plugins: ["-sharing"]
}
```

### Configuration

This plugin can be configured in the `book.json`:

Default configuration is:

```js
{
    "pluginsConfig": {
        "sharing": {
            "facebook": true,
            "twitter": true,
            "google": false,
            "weibo": false,
            "instapaper": false,
            "vk": false,
            "all": [
                "facebook", "google", "twitter",
                "weibo", "instapaper"
            ]
        }
    }
}
```
