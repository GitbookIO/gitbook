/* eslint-disable no-console */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactRedux = require('react-redux');

/*
 Public: Renders a component provided via the `component` prop, and ensures that
 failures in the component's code do not cause state inconsistencies elsewhere in
 the application. This component is used by {InjectedComponent} and
 {InjectedComponentSet} to isolate third party code that could be buggy.

 Occasionally, having your component wrapped in {UnsafeComponent} can cause style
 issues. For example, in a Flexbox, the `div.unsafe-component-wrapper` will cause
 your `flex` and `order` values to be one level too deep. For these scenarios,
 UnsafeComponent looks for `containerStyles` on your React component and attaches
 them to the wrapper div.
 */


const UnsafeComponent = React.createClass({
    propTypes: {
        Component: React.PropTypes.func.isRequired,
        props:     React.PropTypes.object
    },

    componentDidMount() {
        return this.renderInjected();
    },

    componentDidUpdate() {
        return this.renderInjected();
    },

    componentWillUnmount() {
        return this.unmountInjected();
    },

    renderInjected() {
        const { Component, props } = this.props;
        const { store } = this.context;

        const node = ReactDOM.findDOMNode(this);

        try {
            this.injected = (
                <ReactRedux.Provider store={store}>
                    <Component {...props}/>
                </ReactRedux.Provider>
            );

            ReactDOM.render(this.injected, node);
        } catch (err) {
            console.error(err);
        }
    },

    unmountInjected() {
        try {
            const node = ReactDOM.findDOMNode(this);
            return ReactDOM.unmountComponentAtNode(node);
        } catch (err) {
            console.error(err);
        }
    },

    focus() {
        if (this.injected.focus != null) {
            return this.injected.focus();
        }
    },

    blur() {
        if (this.injected.blur != null) {
            return this.injected.blur();
        }
    },

    render() {
        return <div name="unsafe-component-wrapper" />;
    }
});

module.exports = ReactRedux.connect()(UnsafeComponent);
