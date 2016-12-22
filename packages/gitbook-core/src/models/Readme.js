const { Record } = require('immutable');
const File = require('./File');

const DEFAULTS = {
    file: new File()
};

class Readme extends Record(DEFAULTS) {
    constructor(state = {}) {
        super({
            file: File.create(state.file)
        });
    }

    static create(state) {
        return state instanceof Readme ?
            state : new Readme(state);
    }
}

module.exports = Readme;
