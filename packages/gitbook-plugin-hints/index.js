
module.exports = {
    blocks: {
        hint: ({ kwargs, children }) => {
            return {
                children,
                style: kwargs.style || 'info',
                icon:  kwargs.icon
            };
        }
    }
};
