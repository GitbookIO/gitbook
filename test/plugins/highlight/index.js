module.exports = {
    blocks: {
        "code": {
            process: function(blk) {
                var lang = blk.kwargs.language || 'code';

                return lang+"_"+blk.body+"_"+lang;
            }
        }
    }
};