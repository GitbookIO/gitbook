module.exports = {
    blocks: {
        "code": {
            process: function(blk) {
                return "code_"+blk.body+"_code";
            }
        }
    }
};