const React = require('react');
const Helmet = require('react-helmet');
const ReactRedux = require('react-redux');
const { InjectedComponent } = require('./components/InjectedComponent');

/**
 * Render a registered component from a store.
 * This method is intended for server-side use in "gitbook".
 *
 * @param  {ReduxStore} store
 * @param  {Descriptor} matching
 * @return {Object} { el, meta }
 */
function renderComponent(store, matching) {
    const el = (
        <ReactRedux.Provider store={store}>
            <InjectedComponent matching={matching} />
        </ReactRedux.Provider>
    );
    const head = Helmet.rewind();

    return { el, head };
}

module.exports = renderComponent;
