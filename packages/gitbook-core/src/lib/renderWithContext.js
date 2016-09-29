const React = require('react');

const { InjectedComponent } = require('../components/InjectedComponent');
const PJAXWrapper = require('../components/PJAXWrapper');
const IntlProvider = require('../components/IntlProvider');
const ContextProvider = require('../components/IntlProvider');

/**
 * Render the application for a store
 * @param  {GitBookContext} context
 * @return {React.Element} element
 */
function renderWithContext(context) {
    return (
        <ContextProvider context={context}>
            <PJAXWrapper>
                <IntlProvider>
                    <InjectedComponent matching={{ role: 'Body' }} />
                </IntlProvider>
            </PJAXWrapper>
        </ContextProvider>
    );
}

module.exports = renderWithContext;
