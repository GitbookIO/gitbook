const React = require('react');
const classNames = require('classnames');

const Button = React.createClass({
    propTypes: {
        active:    React.PropTypes.bool,
        href:      React.PropTypes.string,
        className: React.PropTypes.string,
        children:  React.PropTypes.node,
        onClick:   React.PropTypes.func
    },

    render() {
        const { children, active, onClick } = this.props;
        const className = classNames('GitBook/Button', this.props.className, {
            active
        });

        return <button className={className} onClick={onClick}>{children}</button>;
    }
});

module.exports = Button;
