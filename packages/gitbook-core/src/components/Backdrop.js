const React      = require('react');

/**
 * Backdrop for modals, dropdown, etc. that covers the whole screen
 * and handles click.
 *
 * <Backdrop onClick={onCloseModal} />
 */
const Backdrop = React.createClass({
    propTypes: {
        // Callback when backdrop is clicked
        onClick:  React.PropTypes.func.isRequired,
        // Z-index for the backdrop
        zIndex:   React.PropTypes.number
    },

    getDefaultProps() {
        return {
            zIndex: 200
        };
    },

    render() {
        const { zIndex, onClick } = this.props;
        const style = {
            zIndex,
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%'
        };

        return <div style={style} onClick={onClick}></div>;
    }
});

module.exports = Backdrop;
