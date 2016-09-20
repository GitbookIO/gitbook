const ACTION_TYPES = require('./TYPES');

/**
 * Find all components matching a descriptor
 * @param {List<ComponentDescriptor>} state
 * @param {String} matching.role
 */
function findMatchingComponents(state, matching) {
    return state
    .filter(({descriptor}) => {
        if (matching.role && matching.role !== descriptor.role) {
            return false;
        }

        return true;
    })
    .map(component => component.Component);
}

/**
 * Register a new component
 * @param  {React.Class} Component
 * @param  {Descriptor} descriptor
 * @return {Action}
 */
function registerComponent(Component, descriptor) {
    return {
        type: ACTION_TYPES.REGISTER_COMPONENT,
        Component,
        descriptor
    };
}

module.exports = {
    findMatchingComponents,
    registerComponent
};
