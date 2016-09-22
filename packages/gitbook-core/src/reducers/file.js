const { Record } = require('immutable');

const DEFAULTS = {
    type:  '',
    mtime: '',
    path:  ''
};

class FileState extends Record(DEFAULTS) {
    static create(state) {
        return state instanceof FileState ?
            state : new FileState(state);
    }
}

module.exports = FileState;
