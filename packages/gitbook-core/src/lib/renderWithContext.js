const React = require('react');

const { InjectedComponent } = require('../components/InjectedComponent');
const PJAXWrapper = require('../components/PJAXWrapper');
const I18nProvider = require('../components/I18nProvider');
const ContextProvider = require('../components/ContextProvider');

/**
 * Render the application for a GitBook context.
 *
 * @param  {GitBookContext} context
 * @return {React.Element} element
 */
function renderWithContext(context) {
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

module.exports = renderWithContext;
