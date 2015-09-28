var assert = require("assert");

module.exports = {
    blocks: {
        "test": {
            shortcuts: {
                parsers:  ["markdown"],
                start: "$$",
                end: "$$"
            },
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
        },
        "test5args": {
            process: function(blk) {
                return "test5"+blk.args.join(",")+"test5";
            }
        },
        "test5kwargs": {
            process: function(blk) {
                var s = blk.args.join(",");
                for (var key in blk.kwargs) {
                    s = s + ","+key+":"+blk.kwargs[key];
                }

                return "test5"+s+"test5";
            }
        },
        "test6context": {
            process: function() {
                return "test6"+(this.ctx.name)+"test6";
            }
        },
    }
};