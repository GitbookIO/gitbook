# Navigation

### Listen to url change

Listen for changes to the current location:

```js
const onLocationChanged = (location) => {
    console.log(location.pathname);
    console.log(location.query);
    console.log(location.hash);
};

module.exports = GitBook.createPlugin({
    init: (dispatch, getState, { Navigation }) => {
        dispatch(Navigation.listen(onLocationChanged));
    }
});
```

The `onLocationChanged` will be triggered for initial state.
