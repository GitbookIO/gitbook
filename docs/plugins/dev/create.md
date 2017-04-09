
# Create a plugin

A {{ book.GB }} plugin is a node package published on NPM that follows a defined convention.

## Structure

Any plugin consists of at least two files: `package.json` and `index.js`.

#### package.json

`package.json` is a manifest format for describing **Node.js modules**. It declares dependencies, version, ownership, and other information required to run a plugin in {{ book.GB }}. 

A plugin manifest `package.json` can also contain details about the required configuration, whereas the configuration schema is defined in the `gitbook` field of the manifest (This field follows the [JSON-Schema](http://json-schema.org) guidelines). The **package name** must begin with `gitbook-plugin-` and the **package engines** should contain `gitbook`.

`package.json` example:

```js
{
    "name": "gitbook-plugin-mytest",
    "version": "0.0.1",
    "description": "This is my first GitBook plugin",
    "engines": {
        "gitbook": ">1.x.x"
    },
    "gitbook": {
        "properties": {
            "myConfigKey": {
                "type": "string",
                "default": "it's the default value",
                "description": "It defines my awesome config!"
            }
        }
    }
}
```

More information about `package.json` is available in the [NPM documentation](https://docs.npmjs.com/files/package.json).

#### index.js

`index.js` file is the main entry point of your plugin runtime. Here you can define all the things your plugin should perform using [hooks](hooks.md), [blocks](blocks.md) and [filters](filters.md). 

`index.js` example:

```js
module.exports = {
    // Map of hooks
    hooks: {},

    // Map of new blocks
    blocks: {},

    // Map of new filters
    filters: {}
};
```

### Bootstrap your first plugin

To create, test and release plugins you can use `gitbook-plugin` command-line utility.

Install `gitbook-plugin` from NPM:

```
$ npm install gitbook-plugin -g
```

create your plugin:

```
$ gitbook-plugin create
```

You will be asked for a plugin name, and a few other things to complete the creation process.