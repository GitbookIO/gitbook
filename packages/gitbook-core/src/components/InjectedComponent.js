const React = require('react');
const ReactRedux = require('react-redux');
const { List } = require('immutable');

const UnsafeComponent = require('./UnsafeComponent');
const { findMatchingComponents } = require('../actions/components');

/*
    Public: InjectedComponent makes it easy to include a set of dynamically registered
    components inside of your React render method. Rather than explicitly render
    an array of buttons, for example, you can use InjectedComponentSet:

    ```js
    <InjectedComponentSet className="message-actions"
                      matching={{role: 'ThreadActionButton'}}
                      props={{ a: 1 }}>
    ```

    InjectedComponentSet will look up components registered for the location you provide,
    render them inside a {Flexbox} and pass them `exposedProps`. By default, all injected
    children are rendered inside {UnsafeComponent} wrappers to prevent third-party code
    from throwing exceptions that break React renders.

    InjectedComponentSet monitors the ComponentStore for changes. If a new component
    is registered into the location you provide, InjectedComponentSet will re-render.
    If no matching components is found, the InjectedComponent renders an empty span.
 */


const InjectedComponentSet = React.createClass({
    propTypes: {
        components:    React.PropTypes.oneOfType([
            React.PropTypes.arrayOf(React.PropTypes.func),
            React.PropTypes.instanceOf(List)
        ]).isRequired,
        props:         React.PropTypes.object,
        withContainer: React.PropTypes.bool
    },

    render() {
        const { components, props, ...divProps } = this.props;

        const inner = components.map(Comp => {
            if (Comp.sandbox === false) {
                return <Comp key={Comp.displayName} {...props} />;
            } else {
                return <UnsafeComponent key={Comp.displayName} Component={Comp} props={props} />;
            }
        });

        return (
            <div {...divProps}>
                {inner}
            </div>
        );
    }
});

/**
 * Map Redux state to InjectedComponentSet's props
 */
function mapStateToProps(state, props) {
    const { components } = state;
    const { matching } = props;

    return {
        components: findMatchingComponents(components, matching)
    };
}

module.exports = {
    InjectedComponent: ReactRedux.connect((state, props) => {
        const result = mapStateToProps(state, props);
        result.components = result.components.slice(0, 1);
        result.withContainer = false;
        return result;
    })(InjectedComponentSet),
    InjectedComponentSet: ReactRedux.connect(mapStateToProps)(InjectedComponentSet)
};
