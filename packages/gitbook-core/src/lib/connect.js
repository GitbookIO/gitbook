const React = require('react');
const ReactRedux = require('react-redux');

/**
 * Use the GitBook context provided by ContextProvider to map actions to props
 * @param  {ReactComponent} Component
 * @param  {Function} mapActionsToProps
 * @return {ReactComponent}
 */
function connectToActions(Component, mapActionsToProps) {
    if (!mapActionsToProps) {
        return Component;
    }

    return React.createClass({
        displayName: `ConnectActions(${Component.displayName})`,
        propTypes: {
            children: React.PropTypes.node
        },

        contextTypes: {
            gitbookContext: React.PropTypes.object.isRequired
        },

        render() {
            const { gitbookContext } = this.context;
            const { children, ...props } = this.props;
            const { actions, store } = gitbookContext;

            const actionsProps = mapActionsToProps(actions, store.dispatch);

            return <Component {...props} {...actionsProps}>{children}</Component>;
        }
    });
}

/**
 * Connect a component to the GitBook context (store and actions).
 *
 * @param {ReactComponent} Component
 * @param {Function} mapStateToProps
 * @return {ReactComponent}
 */
function connect(Component, mapStateToProps, mapActionsToProps) {
    const connectToStore = ReactRedux.connect(mapStateToProps);
    return connectToActions(connectToStore(Component), mapActionsToProps);
}

module.exports = connect;
