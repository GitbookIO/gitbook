# Plugins

Plugins are the best way to extend {{ book.GB }} functionality (ebook and website). The existing plugins can do a lot of useful things: bring math formulas display support, track visits using Google Analytics, etc.

### How to find plugins?

Plugins can be easily searched on [plugins.gitbook.com](https://plugins.gitbook.com).


### How to install a plugin?

Once you find a plugin that you want to install, you need to add it to your `book.json`:

```
{
    "plugins": ["myPlugin", "anotherPlugin"]
}
```

You can also define a specific version for the plugin using: `"myPlugin@0.3.1"`. By default {{ book.GB }} resolves the latest available version of the plugin compatible with the current {{ book.GB }} version.

### {{ book.GB }}.com

Plugins are automatically installed on [{{ book.GB }}.com](https://www.gitbook.com). Locally, run `gitbook install` to install and prepare all plugins for your books.

### Configuring plugins

Plugins specific configurations are stored in `pluginsConfig`. You have to refer to the documentation of the plugin itself for details about the available options.
