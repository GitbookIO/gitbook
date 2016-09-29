const React = require('react');
const { Provider } = require('react-redux');

/**
 * React component to provide a GitBook context to children components.
 */

const ContextProvider = React.createClass({
    propTypes: {
        context: React.PropTypes.object.isRequired,
        children: React.PropTypes.node
    },

    childContextTypes: {
        gitbookContext: React.PropTypes.object.isRequired
    },

    getChildContext() {
        const { context } = this.props;

        return {
            gitbookContext: context
        };
    },

    render() {
        const { context, children } = this.props;
        return <Provider store={context}>{children}</Provider>;
    }
});

module.exports = ContextProvider;
