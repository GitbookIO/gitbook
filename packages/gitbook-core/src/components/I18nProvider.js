const { Map } = require('immutable');
const React = require('react');
const intl = require('react-intl');
const ReactRedux = require('react-redux');

const I18nProvider = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        messages: React.PropTypes.object
    },

    render() {
        let { messages } = this.props;
        messages = messages.get('en', Map()).toJS();

        return (
            <intl.IntlProvider locale={'en'} messages={messages}>
                {this.props.children}
            </intl.IntlProvider>
        );
    }
});

const mapStateToProps = state => {
    return { messages: state.i18n.messages };
};

module.exports = ReactRedux.connect(mapStateToProps)(I18nProvider);
