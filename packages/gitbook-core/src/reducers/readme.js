const { Record } = require('immutable');
const FileState = require('./file');

class ReadmeState extends Record({
    file: new FileState()
}) {
    constructor(state = {}) {
        super({
            file: new FileState(state.file)
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
