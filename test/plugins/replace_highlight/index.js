module.exports = {
    blocks: {
        "code": {
            process: function(blk) {
                var lang = blk.kwargs.language || "code";

                return {
                    body: lang+"_"+blk.body+"_"+lang,
                    html: false
                };
            }
        }
    }
};