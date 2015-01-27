module.exports = {
    blocks: {
    	"test": {
    		process: function(blk) {
    			return "test"+blk.body+"test";
    		}
    	},
    	"test2": {
    		end: "endtest2end",
    		process: function(blk) {
    			return "test2"+blk.body+"test2";
    		}
    	},
        "test3join": {
            blocks: [
                "also"
            ],
            process: function(blk) {
                return [blk.body, blk.blocks[0].body].join(blk.kwargs.separator);
            }
        }
    }
};