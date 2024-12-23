!(function () {
    'use strict';
    var t,
        a,
        e,
        n = {
            667: function (t, a) {
                (a.q = void 0), (a.q = '3.2.2');
            },
            359: function (t, a, e) {
                var n,
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var a = 'function' == typeof Symbol && Symbol.iterator,
                                e = a && t[a],
                                n = 0;
                            if (e) return e.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && n >= t.length && (t = void 0),
                                            { value: t && t[n++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                a ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.ConfigMacrosConfiguration = void 0);
                var r = e(251),
                    p = e(74),
                    l = e(871),
                    s = i(e(945)),
                    u = e(924),
                    c = i(e(432)),
                    M = e(975),
                    x = 'configmacros-map',
                    f = 'configmacros-env-map';
                a.ConfigMacrosConfiguration = r.Configuration.create('configmacros', {
                    init: function (t) {
                        new l.CommandMap(x, {}, {}),
                            new l.EnvironmentMap(f, s.default.environment, {}, {}),
                            t.append(
                                r.Configuration.local({
                                    handler: { macro: [x], environment: [f] },
                                    priority: 3,
                                }),
                            );
                    },
                    config: function (t, a) {
                        !(function (t) {
                            var a,
                                e,
                                n = t.parseOptions.handlers.retrieve(x),
                                i = t.parseOptions.options.macros;
                            try {
                                for (
                                    var r = o(Object.keys(i)), p = r.next();
                                    !p.done;
                                    p = r.next()
                                ) {
                                    var l = p.value,
                                        s = 'string' == typeof i[l] ? [i[l]] : i[l],
                                        M = Array.isArray(s[2])
                                            ? new u.Macro(
                                                  l,
                                                  c.default.MacroWithTemplate,
                                                  s.slice(0, 2).concat(s[2]),
                                              )
                                            : new u.Macro(l, c.default.Macro, s);
                                    n.add(l, M);
                                }
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    p && !p.done && (e = r.return) && e.call(r);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                        })(a),
                            (function (t) {
                                var a,
                                    e,
                                    n = t.parseOptions.handlers.retrieve(f),
                                    i = t.parseOptions.options.environments;
                                try {
                                    for (
                                        var r = o(Object.keys(i)), p = r.next();
                                        !p.done;
                                        p = r.next()
                                    ) {
                                        var l = p.value;
                                        n.add(
                                            l,
                                            new u.Macro(l, c.default.BeginEnv, [!0].concat(i[l])),
                                        );
                                    }
                                } catch (t) {
                                    a = { error: t };
                                } finally {
                                    try {
                                        p && !p.done && (e = r.return) && e.call(r);
                                    } finally {
                                        if (a) throw a.error;
                                    }
                                }
                            })(a);
                    },
                    items: ((n = {}), (n[M.BeginEnvItem.prototype.kind] = M.BeginEnvItem), n),
                    options: { macros: (0, p.expandable)({}), environments: (0, p.expandable)({}) },
                });
            },
            955: function (t, a) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (a.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            74: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.isObject = MathJax._.util.Options.isObject),
                    (a.APPEND = MathJax._.util.Options.APPEND),
                    (a.REMOVE = MathJax._.util.Options.REMOVE),
                    (a.OPTIONS = MathJax._.util.Options.OPTIONS),
                    (a.Expandable = MathJax._.util.Options.Expandable),
                    (a.expandable = MathJax._.util.Options.expandable),
                    (a.makeArray = MathJax._.util.Options.makeArray),
                    (a.keys = MathJax._.util.Options.keys),
                    (a.copy = MathJax._.util.Options.copy),
                    (a.insert = MathJax._.util.Options.insert),
                    (a.defaultOptions = MathJax._.util.Options.defaultOptions),
                    (a.userOptions = MathJax._.util.Options.userOptions),
                    (a.selectOptions = MathJax._.util.Options.selectOptions),
                    (a.selectOptionsFromKeys = MathJax._.util.Options.selectOptionsFromKeys),
                    (a.separateOptions = MathJax._.util.Options.separateOptions),
                    (a.lookup = MathJax._.util.Options.lookup);
            },
            251: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (a.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (a.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            945: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.default = MathJax._.input.tex.ParseMethods.default);
            },
            924: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.Symbol = MathJax._.input.tex.Symbol.Symbol),
                    (a.Macro = MathJax._.input.tex.Symbol.Macro);
            },
            871: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.parseResult = MathJax._.input.tex.SymbolMap.parseResult),
                    (a.AbstractSymbolMap = MathJax._.input.tex.SymbolMap.AbstractSymbolMap),
                    (a.RegExpMap = MathJax._.input.tex.SymbolMap.RegExpMap),
                    (a.AbstractParseMap = MathJax._.input.tex.SymbolMap.AbstractParseMap),
                    (a.CharacterMap = MathJax._.input.tex.SymbolMap.CharacterMap),
                    (a.DelimiterMap = MathJax._.input.tex.SymbolMap.DelimiterMap),
                    (a.MacroMap = MathJax._.input.tex.SymbolMap.MacroMap),
                    (a.CommandMap = MathJax._.input.tex.SymbolMap.CommandMap),
                    (a.EnvironmentMap = MathJax._.input.tex.SymbolMap.EnvironmentMap);
            },
            975: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.BeginEnvItem = MathJax._.input.tex.newcommand.NewcommandItems.BeginEnvItem);
            },
            432: function (t, a) {
                Object.defineProperty(a, '__esModule', { value: !0 }),
                    (a.default = MathJax._.input.tex.newcommand.NewcommandMethods.default);
            },
        },
        o = {};
    function i(t) {
        var a = o[t];
        if (void 0 !== a) return a.exports;
        var e = (o[t] = { exports: {} });
        return n[t].call(e.exports, e, e.exports, i), e.exports;
    }
    (t = i(955)),
        (a = i(667)),
        (e = i(359)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/configmacros', a.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { configmacros: { ConfigMacrosConfiguration: e } } } } });
})();
