!(function () {
    'use strict';
    var t,
        e,
        a,
        o = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            596: function (t, e, a) {
                var o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                a = e && t[e],
                                o = 0;
                            if (a) return a.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && o >= t.length && (t = void 0),
                                            { value: t && t[o++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    n =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SetOptionsConfiguration = e.SetOptionsUtil = void 0);
                var i = a(251),
                    r = a(871),
                    l = n(a(402)),
                    p = n(a(398)),
                    s = a(924),
                    u = n(a(360)),
                    f = a(74);
                e.SetOptionsUtil = {
                    filterPackage: function (t, e) {
                        if ('tex' !== e && !i.ConfigurationHandler.get(e))
                            throw new l.default('NotAPackage', 'Not a defined package: %1', e);
                        var a = t.options.setoptions,
                            o = a.allowOptions[e];
                        if ((void 0 === o && !a.allowPackageDefault) || !1 === o)
                            throw new l.default(
                                'PackageNotSettable',
                                'Options can\'t be set for package "%1"',
                                e,
                            );
                        return !0;
                    },
                    filterOption: function (t, e, a) {
                        var o,
                            n = t.options.setoptions,
                            i = n.allowOptions[e] || {},
                            r = i.hasOwnProperty(a) && !(0, f.isObject)(i[a]) ? i[a] : null;
                        if (!1 === r || (null === r && !n.allowOptionsDefault))
                            throw new l.default(
                                'OptionNotSettable',
                                'Option "%1" is not allowed to be set',
                                a,
                            );
                        if (
                            !(null === (o = 'tex' === e ? t.options : t.options[e]) || void 0 === o
                                ? void 0
                                : o.hasOwnProperty(a))
                        )
                            throw 'tex' === e
                                ? new l.default('InvalidTexOption', 'Invalid TeX option "%1"', a)
                                : new l.default(
                                      'InvalidOptionKey',
                                      'Invalid option "%1" for package "%2"',
                                      a,
                                      e,
                                  );
                        return !0;
                    },
                    filterValue: function (t, e, a, o) {
                        return o;
                    },
                };
                var c = new r.CommandMap(
                    'setoptions',
                    { setOptions: 'SetOptions' },
                    {
                        SetOptions: function (t, e) {
                            var a,
                                n,
                                i = t.GetBrackets(e) || 'tex',
                                r = p.default.keyvalOptions(t.GetArgument(e)),
                                l = t.options.setoptions;
                            if (l.filterPackage(t, i))
                                try {
                                    for (
                                        var s = o(Object.keys(r)), u = s.next();
                                        !u.done;
                                        u = s.next()
                                    ) {
                                        var f = u.value;
                                        l.filterOption(t, i, f) &&
                                            (('tex' === i ? t.options : t.options[i])[f] =
                                                l.filterValue(t, i, f, r[f]));
                                    }
                                } catch (t) {
                                    a = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (n = s.return) && n.call(s);
                                    } finally {
                                        if (a) throw a.error;
                                    }
                                }
                        },
                    },
                );
                e.SetOptionsConfiguration = i.Configuration.create('setoptions', {
                    handler: { macro: ['setoptions'] },
                    config: function (t, e) {
                        var a = e.parseOptions.handlers.get('macro').lookup('require');
                        a &&
                            (c.add('Require', new s.Macro('Require', a._func)),
                            c.add(
                                'require',
                                new s.Macro('require', u.default.Macro, [
                                    '\\Require{#2}\\setOptions[#2]{#1}',
                                    2,
                                    '',
                                ]),
                            ));
                    },
                    priority: 3,
                    options: {
                        setoptions: {
                            filterPackage: e.SetOptionsUtil.filterPackage,
                            filterOption: e.SetOptionsUtil.filterOption,
                            filterValue: e.SetOptionsUtil.filterValue,
                            allowPackageDefault: !0,
                            allowOptionsDefault: !0,
                            allowOptions: (0, f.expandable)({
                                tex: {
                                    FindTeX: !1,
                                    formatError: !1,
                                    package: !1,
                                    baseURL: !1,
                                    tags: !1,
                                    maxBuffer: !1,
                                    maxMaxros: !1,
                                    macros: !1,
                                    environments: !1,
                                },
                                setoptions: !1,
                                autoload: !1,
                                require: !1,
                                configmacros: !1,
                                tagformat: !1,
                            }),
                        },
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
            74: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.isObject = MathJax._.util.Options.isObject),
                    (e.APPEND = MathJax._.util.Options.APPEND),
                    (e.REMOVE = MathJax._.util.Options.REMOVE),
                    (e.OPTIONS = MathJax._.util.Options.OPTIONS),
                    (e.Expandable = MathJax._.util.Options.Expandable),
                    (e.expandable = MathJax._.util.Options.expandable),
                    (e.makeArray = MathJax._.util.Options.makeArray),
                    (e.keys = MathJax._.util.Options.keys),
                    (e.copy = MathJax._.util.Options.copy),
                    (e.insert = MathJax._.util.Options.insert),
                    (e.defaultOptions = MathJax._.util.Options.defaultOptions),
                    (e.userOptions = MathJax._.util.Options.userOptions),
                    (e.selectOptions = MathJax._.util.Options.selectOptions),
                    (e.selectOptionsFromKeys = MathJax._.util.Options.selectOptionsFromKeys),
                    (e.separateOptions = MathJax._.util.Options.separateOptions),
                    (e.lookup = MathJax._.util.Options.lookup);
            },
            251: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (e.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (e.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
            },
            398: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseUtil.default);
            },
            924: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Symbol = MathJax._.input.tex.Symbol.Symbol),
                    (e.Macro = MathJax._.input.tex.Symbol.Macro);
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
            360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
        },
        n = {};
    function i(t) {
        var e = n[t];
        if (void 0 !== e) return e.exports;
        var a = (n[t] = { exports: {} });
        return o[t].call(a.exports, a, a.exports, i), a.exports;
    }
    (t = i(955)),
        (e = i(667)),
        (a = i(596)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/setoptions', e.q, 'tex-extension'),
        (0, t.r8)({ _: { input: { tex: { setoptions: { SetOptionsConfiguration: a } } } } });
})();
