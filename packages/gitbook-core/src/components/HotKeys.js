const React = require('react');
const Mousetrap = require('mousetrap');
const { string, node, func, shape, arrayOf } = React.PropTypes;

const bindingShape = shape({
    // A key "escape", a combination of key "mod+s", or a key sequence "ctrl+x ctrl+s"
    key: string.isRequired,
    // function (event) {}
    handler: func.isRequired
});

/**
 * Defines hotkeys globally when this component is mounted.
 *
 * keymap = [{
 *   key: 'escape',
 *   handler: (e) => quit()
 * }, {
 *   key: 'mod+s',
 *   handler: (e) => save()
 * }]
 *
 * <HotKeys keymap={keymap}>
 *   < ... />
 * </HotKeys>
 */

const HotKeys = React.createClass({
    propTypes: {
        children: node.isRequired,
        keymap: arrayOf(bindingShape)
    },

    getDefaultProps() {
        return { keymap: [] };
    },

    componentDidMount() {
        this.props.keymap.forEach((binding) => {
            Mousetrap.bind(binding.key, binding.handler);
        });
    },

    componentWillUnmount() {
        this.props.keymap.forEach((binding) => {
            Mousetrap.unbind(binding.key, binding.handler);
        });
    },

    render() {
        // Simply render the only child
        return React.Children.only(this.props.children);
    }
});

module.exports = HotKeys;
