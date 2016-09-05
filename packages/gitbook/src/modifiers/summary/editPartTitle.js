/**
    Edit title of a part in the summary

    @param {Summary} summary
    @param {Number} index
    @param {String} newTitle
    @return {Summary}
*/
function editPartTitle(summary, index, newTitle) {
    let parts = summary.getParts();

    let part = parts.get(index);
    if (!part) {
        return summary;
    }

    part = part.set('title', newTitle);
    parts = parts.set(index, part);

    return summary.set('parts', parts);
}

module.exports = editPartTitle;
