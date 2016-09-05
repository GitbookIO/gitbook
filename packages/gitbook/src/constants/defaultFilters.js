const Immutable = require('immutable');
const moment = require('moment');

module.exports = Immutable.Map({
    // Format a date
    // ex: 'MMMM Do YYYY, h:mm:ss a
    date(time, format) {
        return moment(time).format(format);
    },

    // Relative Time
    dateFromNow(time) {
        return moment(time).fromNow();
    }
});
