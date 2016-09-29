const React = require('react');
const { Provider } = require('react-redux');

const { InjectedComponent } = require('../components/InjectedComponent');
const PJAXWrapper = require('../components/PJAXWrapper');
const IntlProvider = require('../components/IntlProvider');

/**
 * Render the application for a store
 * @param  {GitBookContext} context
 * @return {React.Element} element
 */
function renderWithContext(context) {
    return (
        <Provider store={context.store}>
            <PJAXWrapper>
                <IntlProvider>
                    <InjectedComponent matching={{ role: 'Body' }} />
                </IntlProvider>
            </PJAXWrapper>
        </Provider>
    );
}

module.exports = renderWithContext;
