const React = require('react');
const { Provider } = require('react-redux');

const ContextShape = require('../propTypes/Context');

/**
 * React component to provide a GitBook context to children components.
 */

const ContextProvider = React.createClass({
    propTypes: {
        context: ContextShape.isRequired,
        children: React.PropTypes.node
    },

    childContextTypes: {
        gitbook: ContextShape
    },

    getChildContext() {
        const { context } = this.props;

        return {
            gitbook: context
        };
    },

    render() {
        const { context, children } = this.props;
        return <Provider store={context.store}>{children}</Provider>;
    }
});

module.exports = ContextProvider;
