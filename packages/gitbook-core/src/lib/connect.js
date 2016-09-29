const ReactRedux = require('react-redux');

/**
 * Connect a component to the GitBook store
 * @param {ReactComponent} Component
 * @param {Function} mapStateToProps
 * @return {ReactComponent}
 */
function connect(Component, mapStateToProps, mapDispatchToProps) {
    return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Component);
}

module.exports = connect;
