# Connect to the context

`GitBook.connect(Component, [mapStateToProps], [mapActionsToProps])` connects a react component to the GitBook context.

It does not modify the component class passed to it.
Instead, it returns a new, connected component class, for you to use.

### `mapStateToProps(state, [ownProps]): stateProps`

If specified, the component will subscribe to GitBook store updates. Any time it updates, `mapStateToProps` will be called. Its result must be a plain object, and it will be merged into the component’s props.

If you omit it, the component will not be subscribed to the GitBook store. If `ownProps` is specified as a second argument, its value will be the props passed to your component, and `mapStateToProps` will be additionally re-invoked whenever the component receives new props (e.g. if props received from a parent component have shallowly changed, and you use the `ownProps` argument, `mapStateToProps` is re-evaluated).

For example to render the title of the current page:

```js
const GitBook = require('gitbook-core');

let PageTitle = React.createClass({
    render() {
        const { page } = this.props;
        return <h1>{page.title}</h1>;
    }
});

function mapStateToProps(state) {
    return { page: state.page };
}

PageTitle = GitBook.connect(PageTitle, mapStateToProps);
```

### `mapActionsToProps(actions, [dispatch])`
