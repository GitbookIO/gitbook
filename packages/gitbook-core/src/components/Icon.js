const React = require('react');

const Icon = React.createClass({
    propTypes: {
        id:        React.PropTypes.string,
        type:      React.PropTypes.string,
        className: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            type: 'fa'
        };
    },

    render() {
        const { id, type } = this.props;
        let { className } = this.props;

        if (id) {
            className = type + ' ' + type + '-' + id;
        }

        return <i className={className}/>;
    }
});

module.exports = Icon;
