module.exports = {
    blocks: {
    	"test": {
    		process: function(body, args, kwargs) {
    			return "test"+body+"test";
    		}
    	},
    	"test2": {
    		end: "endtest2end",
    		process: function(body, args, kwargs) {
    			return "test2"+body+"test2";
    		}
    	}
    }
};