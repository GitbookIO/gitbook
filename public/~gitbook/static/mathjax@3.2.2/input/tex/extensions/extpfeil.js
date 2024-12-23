!(function () {
    'use strict';
    var t,
        e,
        a,
        o = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            646: function (t, e, a) {
                var o =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.ExtpfeilConfiguration = e.ExtpfeilMethods = void 0);
                var n = a(251),
                    r = a(871),
                    i = a(939),
                    u = o(a(892)),
                    x = a(417),
                    p = o(a(402));
                (e.ExtpfeilMethods = {}),
                    (e.ExtpfeilMethods.xArrow = i.AmsMethods.xArrow),
                    (e.ExtpfeilMethods.NewExtArrow = function (t, a) {
                        var o = t.GetArgument(a),
                            n = t.GetArgument(a),
                            r = t.GetArgument(a);
                        if (!o.match(/^\\([a-z]+|.)$/i))
                            throw new p.default(
                                'NewextarrowArg1',
                                'First argument to %1 must be a control sequence name',
                                a,
                            );
                        if (!n.match(/^(\d+),(\d+)$/))
                            throw new p.default(
                                'NewextarrowArg2',
                                'Second argument to %1 must be two integers separated by a comma',
                                a,
                            );
                        if (!r.match(/^(\d+|0x[0-9A-F]+)$/i))
                            throw new p.default(
                                'NewextarrowArg3',
                                'Third argument to %1 must be a unicode character number',
                                a,
                            );
                        o = o.substr(1);
                        var i = n.split(',');
                        u.default.addMacro(t, o, e.ExtpfeilMethods.xArrow, [
                            parseInt(r),
                            parseInt(i[0]),
                            parseInt(i[1]),
                        ]);
                    }),
                    new r.CommandMap(
                        'extpfeil',
                        {
                            xtwoheadrightarrow: ['xArrow', 8608, 12, 16],
                            xtwoheadleftarrow: ['xArrow', 8606, 17, 13],
                            xmapsto: ['xArrow', 8614, 6, 7],
                            xlongequal: ['xArrow', 61, 7, 7],
                            xtofrom: ['xArrow', 8644, 12, 12],
                            Newextarrow: 'NewExtArrow',
                        },
                        e.ExtpfeilMethods,
                    );
                e.ExtpfeilConfiguration = n.Configuration.create('extpfeil', {
                    handler: { macro: ['extpfeil'] },
                    init: function (t) {
                        x.NewcommandConfiguration.init(t);
                    },
                });
            },
            955: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (e.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (e.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            871: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (e.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (e.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (e.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (e.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (e.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (e.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (e.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (e.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
            939: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AmsMethods = MathJax._.input.tex.ams.AmsMethods.AmsMethods),
                    (e.NEW_OPS = MathJax._.input.tex.ams.AmsMethods.NEW_OPS);
            },
            417: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NewcommandConfiguration =
                        MathJax._.input.tex.newcommand.NewcommandConfiguration.NewcommandConfiguration);
            },
            892: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.newcommand.NewcommandUtil.default);
            },
        },
        n = {};
    function r(t) {
        var e = n[t];
        if (void 0 !== e) return e.exports;
        var a = (n[t] = { exports: {} });
        return o[t].call(a.exports, a, a.exports, r), a.exports;
    }
    (t = r(955)),
        (e = r(667)),
        (a = r(646)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/extpfeil', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { extpfeil: { ExtpfeilConfiguration: a } } } } });
})();
