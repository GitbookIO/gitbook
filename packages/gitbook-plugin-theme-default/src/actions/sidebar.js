const ActionTypes = require('./types');

/**
 * Toggle the sidebar
 * @return {Action}
 */
function toggle() {
    return { type: ActionTypes.TOGGLE_SIDEBAR };
}

module.exports = {
    toggle
};
