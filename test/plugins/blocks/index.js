module.exports = {
    blocks: {
    	"test": {
    		process: function(args) {
    			return "test"+args.body+"test";
    		}
    	},
    	"test2": {
    		end: "endtest2end",
    		process: function(args) {
    			return "test2"+args.body+"test2";
    		}
    	}
    }
};