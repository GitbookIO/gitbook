const React = require('react');
const intl = require('react-intl');
const ReactRedux = require('react-redux');

const IntlProvider = React.createClass({
    propTypes: {
        children: React.PropTypes.node
    },

    render() {
        // TODO
        const messages = {};

        return (
            <intl.IntlProvider locale={'en'} messages={messages}>
                {this.props.children}
            </intl.IntlProvider>
        );
    }
});

module.exports = ReactRedux.connect()(IntlProvider);
