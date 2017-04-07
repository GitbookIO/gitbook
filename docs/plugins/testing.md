# Testing your plugin

### On local machine

Testing your plugin on your book before publishing is possible using [npm link](https://docs.npmjs.com/cli/link).

In the plugin's folder, run:

```
$ npm link
```

then in your book's folder:

```
$ npm link gitbook-plugin-<plugin's name>
```

### Unit testing on Travis

[gitbook-tester](https://github.com/todvora/gitbook-tester) makes it easy to write **Node.js/Mocha** unit tests for your plugins. Using [Travis.org](https://travis.org), tests can be run on each commit/tag.
