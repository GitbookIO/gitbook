const React = require('react');
const { Provider } = require('react-redux');

const { InjectedComponent } = require('./components/InjectedComponent');
const PJAXWrapper = require('./components/PJAXWrapper');
const IntlProvider = require('./components/IntlProvider');

/**
 * Render the application for a store
 * @param  {ReduxStore} store
 * @return {React.Element} element
 */
function renderWithStore(store) {
    return (
        <Provider store={store}>
            <PJAXWrapper>
                <IntlProvider>
                    <InjectedComponent matching={{ role: 'Body' }} />
                </IntlProvider>
            </PJAXWrapper>
        </Provider>
    );
}

module.exports = renderWithStore;
