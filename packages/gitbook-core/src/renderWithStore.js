const React = require('react');
const { Provider } = require('react-redux');
const { InjectedComponent } = require('./components/InjectedComponent');

/**
 * Render the application for a store
 * @param  {ReduxStore} store
 * @return {React.Element} element
 */
function renderWithStore(store) {
    return (
        <Provider store={store}>
            <InjectedComponent matching={{ role: 'Body' }} />
        </Provider>
    );
}

module.exports = renderWithStore;
