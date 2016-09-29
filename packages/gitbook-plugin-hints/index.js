
module.exports = {
    blocks: {
        hint: ({ kwargs }) => {
            return {
                style: kwargs.style || 'info',
                icon:  kwargs.icon
            };
        }
    }
};
