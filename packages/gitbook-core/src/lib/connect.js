const React = require('react');
const ReactRedux = require('react-redux');
const { injectIntl } = require('react-intl');

const ContextShape = require('../propTypes/Context');

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
            gitbook: ContextShape.isRequired
        },

        render() {
            const { gitbook } = this.context;
            const { children, ...props } = this.props;
            const { actions, store } = gitbook;

            const actionsProps = mapActionsToProps(actions, store.dispatch);

            return <Component {...props} {...actionsProps}>{children}</Component>;
        }
    });
}

/**
 * Connect to i18n
 * @param {ReactComponent} Component
 * @return {ReactComponent}
 */
function connectToI18n(Component) {
    return injectIntl(({intl, children, ...props}) => {
        const i18n = {
            t: (id, values) => intl.formatMessage({ id }, values)
        };

        return <Component {...props} i18n={i18n}>{children}</Component>;
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
    Component = ReactRedux.connect(mapStateToProps)(Component);
    Component = connectToI18n(Component);
    Component = connectToActions(Component, mapActionsToProps);

    return Component;
}

module.exports = connect;
