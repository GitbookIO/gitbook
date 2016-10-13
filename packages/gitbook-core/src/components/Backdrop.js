const React = require('react');
const HotKeys = require('./HotKeys');

/**
 * Backdrop for modals, dropdown, etc. that covers the whole screen
 * and handles click and pressing escape.
 *
 * <Backdrop onClose={onCloseModal} />
 */
const Backdrop = React.createClass({
    propTypes: {
        // Callback when backdrop is closed
        onClose:  React.PropTypes.func.isRequired,
        // Z-index for the backdrop
        zIndex:   React.PropTypes.number,
        children: React.PropTypes.node
    },

    getDefaultProps() {
        return {
            zIndex: 200
        };
    },

    onClick(event) {
        const { onClose } = this.props;

        event.preventDefault();
        event.stopPropagation();

        onClose();
    },

    render() {
        const { zIndex, children, onClose } = this.props;
        const style = {
            zIndex,
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%'
        };
        const keyMap = {
            'escape': onClose
        };

        return (
            <HotKeys keyMap={keyMap}>
                <div style={style} onClick={this.onClick}>{children}</div>
            </HotKeys>
        );
    }
});

module.exports = Backdrop;
