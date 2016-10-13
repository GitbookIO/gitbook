# plugin-search

This plugin is the interface used by all the search plugins (`plugin-lunr`, `plugin-algolia`, etc.)

## Registering a Search handler

Your plugin must register as a Search handler during its `activate` method:


``` js
GitBook.createPlugin({
    activate: (dispatch, getState, { Search }) => {
        dispatch(Search.registerHandler('my-plugin-name', searchHandler));
    },
    reduce
})

/**
 * Search against a query
 * @param  {String} query
 * @return {Promise<List<Result>>}
 */
function searchHandler(query, dispatch, getState) {
    ...
}
```

Your search handler must return a List of result-shaped objects. A result object has the following shape:

``` js
result = {
  title: string,  // The title of the resource, as displayed in the list of results.

  url:   string,  // The URL to access the matched resource.

  body:  string   // (optional) The context of the matched text (can be a sentence
                  // containing matching words). It will be displayed near the result.
}
```


