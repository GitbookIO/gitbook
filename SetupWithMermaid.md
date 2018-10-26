# Gitbook Setup w/ Mermaid

## Gitbook

### Install gitbook cli

- First run:

```
$ npm install gitbook-cli -g
```
- In gitbook repository run:
```
$ gitbook init ./directory
```
    - This will create a new gitbook in the directory you specify.

- Install plugins `$ gitbook install`

- Test that gitbook is running correctly. Run `$ gitbook serve`

- Install mermaid package below.

### Mermaid

[Mermaid Docs](https://www.npmjs.com/package/gitbook-plugin-mermaid-cli)

- Install plugin in main gitbook directory:
```
npm i gitbook-plugin-mermaid-cli
```

- Navigate to corresponding book directory and create/update book.json to include the following:
```json
{
    "plugins": ["mermaid-cli"],
    "pluginsConfig": {
        "mermaid-cli": {
            "chromeDir": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        }
    }
}
```

- Run in terminal:
```zsh
# see https://github.com/GoogleChrome/puppeteer/blob/v1.8.0/docs/api.md#environment-variables 
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# install plugin 
gitbook install
# run the gitbook 
gitbook serve
```

- Run `$ gitbook install` in corresponding book directory.

- Run `$ gitbook serve` UML diagrams should render correctly.
