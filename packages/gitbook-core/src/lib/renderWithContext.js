const React = require('react');

const { InjectedComponent } = require('../components/InjectedComponent');
const PJAXWrapper = require('../components/PJAXWrapper');
const I18nProvider = require('../components/I18nProvider');
const ContextProvider = require('../components/ContextProvider');
const Navigation = require('../actions/navigation');
const contextShape = require('../shapes/context');

const GitBookApplication = React.createClass({
    propTypes: {
        context:  contextShape,
        matching: React.PropTypes.object
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
        const { context, matching } = this.props;

        return (
            <ContextProvider context={context}>
                <PJAXWrapper>
                    <I18nProvider>
                        <InjectedComponent matching={matching} />
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
 * @param  {Object} matching
 * @return {React.Element} element
 */
function renderWithContext(context, matching) {
    return (
        <GitBookApplication context={context} matching={matching} />
    );
}

module.exports = renderWithContext;
