/* eslint-disable no-console */
const React = require('react');
const ReactDOM = require('react-dom');
const ReactRedux = require('react-redux');

const isServerSide = typeof window === 'undefined';

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
        props:     React.PropTypes.object,
        children:  React.PropTypes.node
    },
    contextTypes: {
        store: React.PropTypes.object
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

    getInjected() {
        const { Component, props, children } = this.props;
        const { store } = this.context;

        return (
            <ReactRedux.Provider store={store}>
                <Component {...props}>{children}</Component>
            </ReactRedux.Provider>
        );
    },

    renderInjected() {
        const node = ReactDOM.findDOMNode(this);

        try {
            this.injected = this.getInjected();

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
        let inner;

        if (isServerSide) {
            inner = this.getInjected();
        }

        return <div name="unsafe-component-wrapper">{inner}</div>;
    }
});

module.exports = ReactRedux.connect()(UnsafeComponent);
