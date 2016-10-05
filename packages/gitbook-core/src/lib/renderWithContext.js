const React = require('react');

const { InjectedComponent } = require('../components/InjectedComponent');
const PJAXWrapper = require('../components/PJAXWrapper');
const I18nProvider = require('../components/I18nProvider');
const ContextProvider = require('../components/ContextProvider');
const Navigation = require('../actions/navigation');
const contextShape = require('../shapes/context');

const GitBookApplication = React.createClass({
    propTypes: {
        context: contextShape
    },

    componentDidMount() {
        const { context } = this.props;
        context.dispatch(Navigation.activate());
    },

    componentWillUnmount() {
        const { context } = this.props;
        context.dispatch(Navigation.deactivate());
    },

    render() {
        const { context } = this.props;

        return (
            <ContextProvider context={context}>
                <PJAXWrapper>
                    <I18nProvider>
                        <InjectedComponent matching={{ role: 'Body' }} />
                    </I18nProvider>
                </PJAXWrapper>
            </ContextProvider>
        );
    }
});


/**
 * Render the application for a GitBook context.
 *
 * @param  {GitBookContext} context
 * @return {React.Element} element
 */
function renderWithContext(context) {
    return (
        <GitBookApplication context={context} />
    );
}

module.exports = renderWithContext;
