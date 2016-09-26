const React = require('react');
const { Provider } = require('react-redux');
const { InjectedComponent } = require('./components/InjectedComponent');
const PJAXWrapper = require('./components/PJAXWrapper');

/**
 * Render the application for a store
 * @param  {ReduxStore} store
 * @return {React.Element} element
 */
function renderWithStore(store) {
    return (
        <Provider store={store}>
            <PJAXWrapper>
                <InjectedComponent matching={{ role: 'Body' }} />
            </PJAXWrapper>
        </Provider>
    );
}

module.exports = renderWithStore;
