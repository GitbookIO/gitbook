const React = require('react');
const connect = require('./connect');

const UnsafeComponent = require('./UnsafeComponent');

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
        components:    React.PropTypes.arrayOf(React.PropTypes.func).isRequired,
        props:         React.PropTypes.object,
        withContainer: React.PropTypes.bool
    },

    render() {
        const { components, props, ...divProps } = this.props;

        const inner = components.map(Component => {
            if (Component.sandbox === false) {
                return <Component key={Component.displayName} {...props} />;
            } else {
                return <UnsafeComponent key={Component.displayName} Component={Component} props={props} />;
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
 * Find all components matching a descriptor
 * @param {List<ComponentDescriptor>} components
 * @param {String} matching.role
 */
function findMatchingComponents(components, matching) {
    return components
    .filter(({descriptor}) => {
        if (matching.role && matching.role === descriptor.role) {
            return false;
        }

        return true;
    })
    .map(component => component.Component);
}

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
    InjectedComponent: connect(InjectedComponentSet, (state, props) => {
        const result = mapStateToProps(state, props);
        result.components = result.components.slice(0, 1);
        result.withContainer = false;
        return result;
    }),
    InjectedComponentSet: connect(InjectedComponentSet, mapStateToProps)
};
