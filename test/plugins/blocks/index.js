var assert = require("assert");

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
        },
        "test4join": {
            blocks: [
                "also", "finally"
            ],
            process: function(blk) {
                assert(blk.blocks.length, 2);
                assert(blk.blocks[0].name, "also");
                assert(blk.blocks[1].name, "finally");
                return [blk.body, blk.blocks[0].body, blk.blocks[1].body].join(blk.kwargs.separator);
            }
        }
    }
};