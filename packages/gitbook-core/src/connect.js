const ReactRedux = require('react-redux');

/**
 * Connect a component to the GitBook store
 * @param {ReactComponent} Component
 * @param {Function} mapStateToProps
 * @return {ReactComponent}
 */
function connect(Component, mapStateToProps) {
    return ReactRedux.connect(mapStateToProps)(Component);
}

module.exports = connect;
