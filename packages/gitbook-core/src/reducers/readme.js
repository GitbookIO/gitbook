const { Record } = require('immutable');
const File = require('../models/file');

class ReadmeState extends Record({
    file: new File()
}) {
    constructor(state = {}) {
        super({
            file: new File(state.file)
        });
    }

    static create(state) {
        return state instanceof ReadmeState ?
            state : new ReadmeState(state);
    }
}

module.exports = (state, action) => {
    return ReadmeState.create(state);
};
