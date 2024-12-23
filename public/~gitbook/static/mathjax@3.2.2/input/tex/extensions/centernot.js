!(function () {
    'use strict';
    var e,
        t,
        a,
        n = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            286: function (e, t, a) {
                var n =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                a = t && e[t],
                                n = 0;
                            if (a) return a.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && n >= e.length && (e = void 0),
                                            { value: e && e[n++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    r =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.CenternotConfiguration = t.filterCenterOver = void 0);
                var o = a(251),
                    i = r(a(193)),
                    u = r(a(748)),
                    l = a(871),
                    p = r(a(360));
                function c(e) {
                    var t,
                        a,
                        r = e.data;
                    try {
                        for (
                            var o = n(r.getList('centerOver')), i = o.next();
                            !i.done;
                            i = o.next()
                        ) {
                            var l = i.value,
                                p = u.default.getTexClass(l.childNodes[0].childNodes[0]);
                            null !== p &&
                                u.default.setProperties(
                                    l.parent.parent.parent.parent.parent.parent,
                                    { texClass: p },
                                );
                        }
                    } catch (e) {
                        t = { error: e };
                    } finally {
                        try {
                            i && !i.done && (a = o.return) && a.call(o);
                        } finally {
                            if (t) throw t.error;
                        }
                    }
                }
                new l.CommandMap(
                    'centernot',
                    {
                        centerOver: 'CenterOver',
                        centernot: ['Macro', '\\centerOver{#1}{{\u29f8}}', 1],
                    },
                    {
                        CenterOver: function (e, t) {
                            var a = '{' + e.GetArgument(t) + '}',
                                n = e.ParseArg(t),
                                r = new i.default(a, e.stack.env, e.configuration).mml(),
                                o = e.create('node', 'TeXAtom', [
                                    new i.default(a, e.stack.env, e.configuration).mml(),
                                    e.create(
                                        'node',
                                        'mpadded',
                                        [
                                            e.create('node', 'mpadded', [n], {
                                                width: 0,
                                                lspace: '-.5width',
                                            }),
                                            e.create('node', 'mphantom', [r]),
                                        ],
                                        { width: 0, lspace: '-.5width' },
                                    ),
                                ]);
                            e.configuration.addNode('centerOver', r), e.Push(o);
                        },
                        Macro: p.default.Macro,
                    },
                ),
                    (t.filterCenterOver = c),
                    (t.CenternotConfiguration = o.Configuration.create('centernot', {
                        handler: { macro: ['centernot'] },
                        postprocessors: [c],
                    }));
            },
            955: function (e, t) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (t.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            251: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (t.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (t.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            748: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.NodeUtil.default);
            },
            871: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (t.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (t.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (t.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (t.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (t.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (t.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (t.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (t.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            193: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.TexParser.default);
            },
            360: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.base.BaseMethods.default);
            },
        },
        r = {};
    function o(e) {
        var t = r[e];
        if (void 0 !== t) return t.exports;
        var a = (r[e] = { exports: {} });
        return n[e].call(a.exports, a, a.exports, o), a.exports;
    }
    (e = o(955)),
        (t = o(667)),
        (a = o(286)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/centernot', t.q, 'tex-extension'),
        (0, e.r8)({ _: { input: { tex: { centernot: { CenternotConfiguration: a } } } } });
})();
