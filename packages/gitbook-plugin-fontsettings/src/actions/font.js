
const TYPES = {
    INCREASE: 'font/increase',
    DECREASE: 'font/decrease',
    RESET:    'font/reset'
};

function increase() {
    return { type: TYPES.INCREASE };
}

function decrease() {
    return { type: TYPES.DECREASE };
}

function reset() {
    return { type: TYPES.RESET };
}

module.exports = {
    TYPES,
    increase,
    decrease,
    reset
};
