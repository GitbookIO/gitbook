const React = require('react');
const { InjectedComponent } = require('./components/InjectedComponent');

const Application = React.createClass({
    render() {
        return <InjectedComponent matching={{ role: 'Body' }} />
    }
});

module.exports = Application;
