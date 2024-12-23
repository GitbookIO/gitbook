!(function () {
    'use strict';
    var e,
        t,
        a,
        o = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            778: function (e, t, a) {
                var o =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                a = t && e[t],
                                o = 0;
                            if (a) return a.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && o >= e.length && (e = void 0),
                                            { value: e && e[o++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    r =
                        (this && this.__read) ||
                        function (e, t) {
                            var a = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!a) return e;
                            var o,
                                r,
                                n = a.call(e),
                                i = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(o = n.next()).done; )
                                    i.push(o.value);
                            } catch (e) {
                                r = { error: e };
                            } finally {
                                try {
                                    o && !o.done && (a = n.return) && a.call(n);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return i;
                        },
                    n =
                        (this && this.__spreadArray) ||
                        function (e, t, a) {
                            if (a || 2 === arguments.length)
                                for (var o, r = 0, n = t.length; r < n; r++)
                                    (!o && r in t) ||
                                        (o || (o = Array.prototype.slice.call(t, 0, r)),
                                        (o[r] = t[r]));
                            return e.concat(o || Array.prototype.slice.call(t));
                        },
                    i =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.RequireConfiguration =
                        t.options =
                        t.RequireMethods =
                        t.RequireLoad =
                            void 0);
                var p = a(251),
                    s = a(871),
                    u = i(a(402)),
                    l = a(955),
                    c = a(629),
                    x = a(282),
                    h = a(149),
                    f = a(74),
                    M = l.MathJax.config;
                function d(e, t) {
                    var a,
                        r = e.parseOptions.options.require,
                        n = e.parseOptions.packageData.get('require').required,
                        i = t.substr(r.prefix.length);
                    if (n.indexOf(i) < 0) {
                        n.push(i),
                            (function (e, t) {
                                var a, r;
                                void 0 === t && (t = []);
                                var n = e.parseOptions.options.require.prefix;
                                try {
                                    for (var i = o(t), p = i.next(); !p.done; p = i.next()) {
                                        var s = p.value;
                                        s.substr(0, n.length) === n && d(e, s);
                                    }
                                } catch (e) {
                                    a = { error: e };
                                } finally {
                                    try {
                                        p && !p.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (a) throw a.error;
                                    }
                                }
                            })(e, x.CONFIG.dependencies[t]);
                        var s = p.ConfigurationHandler.get(i);
                        if (s) {
                            var u = M[t] || {};
                            s.options &&
                                1 === Object.keys(s.options).length &&
                                s.options[i] &&
                                (((a = {})[i] = u), (u = a)),
                                e.configuration.add(i, e, u);
                            var l = e.parseOptions.packageData.get('require').configured;
                            s.preprocessors.length &&
                                !l.has(i) &&
                                (l.set(i, !0), h.mathjax.retryAfter(Promise.resolve()));
                        }
                    }
                }
                function _(e, t) {
                    var a = e.options.require,
                        o = a.allow,
                        r = ('[' === t.substr(0, 1) ? '' : a.prefix) + t;
                    if (!(o.hasOwnProperty(r) ? o[r] : o.hasOwnProperty(t) ? o[t] : a.defaultAllow))
                        throw new u.default(
                            'BadRequire',
                            'Extension "%1" is not allowed to be loaded',
                            r,
                        );
                    c.Package.packages.has(r)
                        ? d(e.configuration.packageData.get('require').jax, r)
                        : h.mathjax.retryAfter(x.Loader.load(r));
                }
                (t.RequireLoad = _),
                    (t.RequireMethods = {
                        Require: function (e, t) {
                            var a = e.GetArgument(t);
                            if (a.match(/[^_a-zA-Z0-9]/) || '' === a)
                                throw new u.default(
                                    'BadPackageName',
                                    'Argument for %1 is not a valid package name',
                                    t,
                                );
                            _(e, a);
                        },
                    }),
                    (t.options = {
                        require: {
                            allow: (0, f.expandable)({
                                base: !1,
                                'all-packages': !1,
                                autoload: !1,
                                configmacros: !1,
                                tagformat: !1,
                                setoptions: !1,
                            }),
                            defaultAllow: !0,
                            prefix: 'tex',
                        },
                    }),
                    new s.CommandMap('require', { require: 'Require' }, t.RequireMethods),
                    (t.RequireConfiguration = p.Configuration.create('require', {
                        handler: { macro: ['require'] },
                        config: function (e, t) {
                            t.parseOptions.packageData.set('require', {
                                jax: t,
                                required: n([], r(t.options.packages), !1),
                                configured: new Map(),
                            });
                            var a = t.parseOptions.options.require,
                                o = a.prefix;
                            if (o.match(/[^_a-zA-Z0-9]/))
                                throw Error('Illegal characters used in \\require prefix');
                            x.CONFIG.paths[o] ||
                                (x.CONFIG.paths[o] = '[mathjax]/input/tex/extensions'),
                                (a.prefix = '[' + o + ']/');
                        },
                        options: t.options,
                    }));
            },
            955: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.isObject = MathJax._.components.global.isObject),
                    (t.combineConfig = MathJax._.components.global.combineConfig),
                    (t.combineDefaults = MathJax._.components.global.combineDefaults),
                    (t.combineWithMathJax = MathJax._.components.global.combineWithMathJax),
                    (t.MathJax = MathJax._.components.global.MathJax);
            },
            149: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.mathjax = MathJax._.mathjax.mathjax);
            },
            74: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.isObject = MathJax._.util.Options.isObject),
                    (t.APPEND = MathJax._.util.Options.APPEND),
                    (t.REMOVE = MathJax._.util.Options.REMOVE),
                    (t.OPTIONS = MathJax._.util.Options.OPTIONS),
                    (t.Expandable = MathJax._.util.Options.Expandable),
                    (t.expandable = MathJax._.util.Options.expandable),
                    (t.makeArray = MathJax._.util.Options.makeArray),
                    (t.keys = MathJax._.util.Options.keys),
                    (t.copy = MathJax._.util.Options.copy),
                    (t.insert = MathJax._.util.Options.insert),
                    (t.defaultOptions = MathJax._.util.Options.defaultOptions),
                    (t.userOptions = MathJax._.util.Options.userOptions),
                    (t.selectOptions = MathJax._.util.Options.selectOptions),
                    (t.selectOptionsFromKeys = MathJax._.util.Options.selectOptionsFromKeys),
                    (t.separateOptions = MathJax._.util.Options.separateOptions),
                    (t.lookup = MathJax._.util.Options.lookup);
            },
            251: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Configuration = MathJax._.input.tex.Configuration.Configuration),
                    (t.ConfigurationHandler =
                        MathJax._.input.tex.Configuration.ConfigurationHandler),
                    (t.ParserConfiguration = MathJax._.input.tex.Configuration.ParserConfiguration);
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
            402: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.TexError.default);
            },
            282: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.PathFilters = MathJax._.components.loader.PathFilters),
                    (t.Loader = MathJax._.components.loader.Loader),
                    (t.MathJax = MathJax._.components.loader.MathJax),
                    (t.CONFIG = MathJax._.components.loader.CONFIG);
            },
            629: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.PackageError = MathJax._.components.package.PackageError),
                    (t.Package = MathJax._.components.package.Package);
            },
        },
        r = {};
    function n(e) {
        var t = r[e];
        if (void 0 !== t) return t.exports;
        var a = (r[e] = { exports: {} });
        return o[e].call(a.exports, a, a.exports, n), a.exports;
    }
    (e = n(955)),
        (t = n(667)),
        (a = n(778)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/require', t.q, 'tex-extension'),
        (0, e.combineWithMathJax)({
            _: { input: { tex: { require: { RequireConfiguration: a } } } },
        });
})();
