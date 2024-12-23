!(function () {
    'use strict';
    var t,
        e,
        a,
        n = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            376: function (t, e, a) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.UnicodeConfiguration = e.UnicodeMethods = void 0);
                var o = a(251),
                    i = n(a(402)),
                    r = a(871),
                    u = n(a(398)),
                    l = n(a(748)),
                    c = a(992);
                e.UnicodeMethods = {};
                var p = {};
                (e.UnicodeMethods.Unicode = function (t, e) {
                    var a = t.GetBrackets(e),
                        n = null,
                        o = null;
                    a &&
                        (a.replace(/ /g, '').match(/^(\d+(\.\d*)?|\.\d+),(\d+(\.\d*)?|\.\d+)$/)
                            ? ((n = a.replace(/ /g, '').split(/,/)), (o = t.GetBrackets(e)))
                            : (o = a));
                    var r = u.default.trimSpaces(t.GetArgument(e)).replace(/^0x/, 'x');
                    if (!r.match(/^(x[0-9A-Fa-f]+|[0-9]+)$/))
                        throw new i.default('BadUnicode', 'Argument to \\unicode must be a number');
                    var d = parseInt(r.match(/^x/) ? '0' + r : r);
                    p[d] ? o || (o = p[d][2]) : (p[d] = [800, 200, o, d]),
                        n &&
                            ((p[d][0] = Math.floor(1e3 * parseFloat(n[0]))),
                            (p[d][1] = Math.floor(1e3 * parseFloat(n[1]))));
                    var M = t.stack.env.font,
                        s = {};
                    o
                        ? ((p[d][2] = s.fontfamily = o.replace(/'/g, "'")),
                          M &&
                              (M.match(/bold/) && (s.fontweight = 'bold'),
                              M.match(/italic|-mathit/) && (s.fontstyle = 'italic')))
                        : M && (s.mathvariant = M);
                    var x = t.create('token', 'mtext', s, (0, c.numeric)(r));
                    l.default.setProperty(x, 'unicode', !0), t.Push(x);
                }),
                    new r.CommandMap('unicode', { unicode: 'Unicode' }, e.UnicodeMethods),
                    (e.UnicodeConfiguration = o.Configuration.create('unicode', {
                        handler: { macro: ['unicode'] },
                    }));
            },
            955: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            992: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.options = MathJax._.util.Entities.options),
                    (e.entities = MathJax._.util.Entities.entities),
                    (e.add = MathJax._.util.Entities.add),
                    (e.remove = MathJax._.util.Entities.remove),
                    (e.translate = MathJax._.util.Entities.translate),
                    (e.numeric = MathJax._.util.Entities.numeric);
            },
            251: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (e.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (e.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            748: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.NodeUtil.default);
            },
            398: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseUtil.default);
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
        },
        o = {};
    function i(t) {
        var e = o[t];
        if (void 0 !== e) return e.exports;
        var a = (o[t] = { exports: {} });
        return n[t].call(a.exports, a, a.exports, i), a.exports;
    }
    (t = i(955)),
        (e = i(667)),
        (a = i(376)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/unicode', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { unicode: { UnicodeConfiguration: a } } } } });
})();
