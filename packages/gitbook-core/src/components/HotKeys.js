const React = require('react');
const Mousetrap = require('mousetrap');
const { Map } = require('immutable');

/**
 * Defines hotkeys globally when this component is mounted.
 *
 * keyMap = {
 *   'escape': (e) => quit()
 *   'mod+s': (e) => save()
 * }
 *
 * <HotKeys keyMap={keyMap}>
 *   < ... />
 * </HotKeys>
 */

const HotKeys = React.createClass({
    propTypes: {
        children: React.PropTypes.node.isRequired,
        keyMap: React.PropTypes.objectOf(React.PropTypes.func)
    },

    getDefaultProps() {
        return { keyMap: [] };
    },

    updateBindings(keyMap) {
        Map(keyMap).forEach((handler, key) => {
            Mousetrap.bind(key, handler);
        });
    },

    clearBindings(keyMap) {
        Map(keyMap).forEach((handler, key) => {
            Mousetrap.unbind(key, handler);
        });
    },

    componentDidMount() {
        this.updateBindings(this.props.keyMap);
    },

    componentDidUpdate(prevProps) {
        this.clearBindings(prevProps.keyMap);
        this.updateBindings(this.props.keyMap);
    },

    componentWillUnmount() {
        this.clearBindings(this.props.keyMap);
    },

    render() {
        // Simply render the only child
        return React.Children.only(this.props.children);
    }
});

module.exports = HotKeys;
