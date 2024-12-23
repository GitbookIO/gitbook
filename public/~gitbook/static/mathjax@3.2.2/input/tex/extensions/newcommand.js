!(function () {
    'use strict';
    var e,
        t,
        n,
        a,
        r,
        i,
        o = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            48: function (e, t, n) {
                var a,
                    r =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (e, t, n, a) {
                                  void 0 === a && (a = n);
                                  var r = Object.getOwnPropertyDescriptor(t, n);
                                  (r &&
                                      !('get' in r
                                          ? !t.__esModule
                                          : r.writable || r.configurable)) ||
                                      (r = {
                                          enumerable: !0,
                                          get: function () {
                                              return t[n];
                                          },
                                      }),
                                      Object.defineProperty(e, a, r);
                              }
                            : function (e, t, n, a) {
                                  void 0 === a && (a = n), (e[a] = t[n]);
                              }),
                    i =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (e, t) {
                                  Object.defineProperty(e, 'default', { enumerable: !0, value: t });
                              }
                            : function (e, t) {
                                  e.default = t;
                              }),
                    o =
                        (this && this.__importStar) ||
                        function (e) {
                            if (e && e.__esModule) return e;
                            var t = {};
                            if (null != e)
                                for (var n in e)
                                    'default' !== n &&
                                        Object.prototype.hasOwnProperty.call(e, n) &&
                                        r(t, e, n);
                            return i(t, e), t;
                        },
                    u =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.NewcommandConfiguration = void 0);
                var l = n(251),
                    f = n(205),
                    c = u(n(406));
                n(297);
                var s = u(n(945)),
                    d = o(n(871));
                t.NewcommandConfiguration = l.Configuration.create('newcommand', {
                    handler: { macro: ['Newcommand-macros'] },
                    items: ((a = {}), (a[f.BeginEnvItem.prototype.kind] = f.BeginEnvItem), a),
                    options: { maxMacros: 1e3 },
                    init: function (e) {
                        new d.DelimiterMap(c.default.NEW_DELIMITER, s.default.delimiter, {}),
                            new d.CommandMap(c.default.NEW_COMMAND, {}, {}),
                            new d.EnvironmentMap(
                                c.default.NEW_ENVIRONMENT,
                                s.default.environment,
                                {},
                                {},
                            ),
                            e.append(
                                l.Configuration.local({
                                    handler: {
                                        character: [],
                                        delimiter: [c.default.NEW_DELIMITER],
                                        macro: [c.default.NEW_DELIMITER, c.default.NEW_COMMAND],
                                        environment: [c.default.NEW_ENVIRONMENT],
                                    },
                                    priority: -1,
                                }),
                            );
                    },
                });
            },
            205: function (e, t, n) {
                var a,
                    r =
                        (this && this.__extends) ||
                        ((a = function (e, t) {
                            return (
                                (a =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var n in t)
                                            Object.prototype.hasOwnProperty.call(t, n) &&
                                                (e[n] = t[n]);
                                    }),
                                a(e, t)
                            );
                        }),
                        function (e, t) {
                            if ('function' != typeof t && null !== t)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(t) +
                                        ' is not a constructor or null',
                                );
                            function n() {
                                this.constructor = e;
                            }
                            a(e, t),
                                (e.prototype =
                                    null === t
                                        ? Object.create(t)
                                        : ((n.prototype = t.prototype), new n()));
                        }),
                    i =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }), (t.BeginEnvItem = void 0);
                var o = i(n(402)),
                    u = (function (e) {
                        function t() {
                            return (null !== e && e.apply(this, arguments)) || this;
                        }
                        return (
                            r(t, e),
                            Object.defineProperty(t.prototype, 'kind', {
                                get: function () {
                                    return 'beginEnv';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(t.prototype, 'isOpen', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.checkItem = function (t) {
                                if (t.isKind('end')) {
                                    if (t.getName() !== this.getName())
                                        throw new o.default(
                                            'EnvBadEnd',
                                            '\\begin{%1} ended with \\end{%2}',
                                            this.getName(),
                                            t.getName(),
                                        );
                                    return [[this.factory.create('mml', this.toMml())], !0];
                                }
                                if (t.isKind('stop'))
                                    throw new o.default(
                                        'EnvMissingEnd',
                                        'Missing \\end{%1}',
                                        this.getName(),
                                    );
                                return e.prototype.checkItem.call(this, t);
                            }),
                            t
                        );
                    })(n(76).BaseItem);
                t.BeginEnvItem = u;
            },
            297: function (e, t, n) {
                var a =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var r = a(n(107));
                new (n(871).CommandMap)(
                    'Newcommand-macros',
                    {
                        newcommand: 'NewCommand',
                        renewcommand: 'NewCommand',
                        newenvironment: 'NewEnvironment',
                        renewenvironment: 'NewEnvironment',
                        def: 'MacroDef',
                        let: 'Let',
                    },
                    r.default,
                );
            },
            107: function (e, t, n) {
                var a =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (e, t, n, a) {
                                  void 0 === a && (a = n);
                                  var r = Object.getOwnPropertyDescriptor(t, n);
                                  (r &&
                                      !('get' in r
                                          ? !t.__esModule
                                          : r.writable || r.configurable)) ||
                                      (r = {
                                          enumerable: !0,
                                          get: function () {
                                              return t[n];
                                          },
                                      }),
                                      Object.defineProperty(e, a, r);
                              }
                            : function (e, t, n, a) {
                                  void 0 === a && (a = n), (e[a] = t[n]);
                              }),
                    r =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (e, t) {
                                  Object.defineProperty(e, 'default', { enumerable: !0, value: t });
                              }
                            : function (e, t) {
                                  e.default = t;
                              }),
                    i =
                        (this && this.__importStar) ||
                        function (e) {
                            if (e && e.__esModule) return e;
                            var t = {};
                            if (null != e)
                                for (var n in e)
                                    'default' !== n &&
                                        Object.prototype.hasOwnProperty.call(e, n) &&
                                        a(t, e, n);
                            return r(t, e), t;
                        },
                    o =
                        (this && this.__importDefault) ||
                        function (e) {
                            return e && e.__esModule ? e : { default: e };
                        };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var u = o(n(402)),
                    l = i(n(871)),
                    f = o(n(360)),
                    c = o(n(398)),
                    s = o(n(406)),
                    d = {
                        NewCommand: function (e, t) {
                            var n = s.default.GetCsNameArgument(e, t),
                                a = s.default.GetArgCount(e, t),
                                r = e.GetBrackets(t),
                                i = e.GetArgument(t);
                            s.default.addMacro(e, n, d.Macro, [i, a, r]);
                        },
                        NewEnvironment: function (e, t) {
                            var n = c.default.trimSpaces(e.GetArgument(t)),
                                a = s.default.GetArgCount(e, t),
                                r = e.GetBrackets(t),
                                i = e.GetArgument(t),
                                o = e.GetArgument(t);
                            s.default.addEnvironment(e, n, d.BeginEnv, [!0, i, o, a, r]);
                        },
                        MacroDef: function (e, t) {
                            var n = s.default.GetCSname(e, t),
                                a = s.default.GetTemplate(e, t, '\\' + n),
                                r = e.GetArgument(t);
                            a instanceof Array
                                ? s.default.addMacro(e, n, d.MacroWithTemplate, [r].concat(a))
                                : s.default.addMacro(e, n, d.Macro, [r, a]);
                        },
                        Let: function (e, t) {
                            var n = s.default.GetCSname(e, t),
                                a = e.GetNext();
                            '=' === a && (e.i++, (a = e.GetNext()));
                            var r = e.configuration.handlers;
                            if ('\\' !== a) {
                                e.i++;
                                var i = r.get('delimiter').lookup(a);
                                i
                                    ? s.default.addDelimiter(e, '\\' + n, i.char, i.attributes)
                                    : s.default.addMacro(e, n, d.Macro, [a]);
                            } else {
                                t = s.default.GetCSname(e, t);
                                var o = r.get('delimiter').lookup('\\' + t);
                                if (o)
                                    return void s.default.addDelimiter(
                                        e,
                                        '\\' + n,
                                        o.char,
                                        o.attributes,
                                    );
                                var u = r.get('macro').applicable(t);
                                if (!u) return;
                                if (u instanceof l.MacroMap) {
                                    var f = u.lookup(t);
                                    return void s.default.addMacro(e, n, f.func, f.args, f.symbol);
                                }
                                o = u.lookup(t);
                                var c = s.default.disassembleSymbol(n, o);
                                s.default.addMacro(
                                    e,
                                    n,
                                    function (e, t) {
                                        for (var n = [], a = 2; a < arguments.length; a++)
                                            n[a - 2] = arguments[a];
                                        var r = s.default.assembleSymbol(n);
                                        return u.parser(e, r);
                                    },
                                    c,
                                );
                            }
                        },
                        MacroWithTemplate: function (e, t, n, a) {
                            for (var r = [], i = 4; i < arguments.length; i++)
                                r[i - 4] = arguments[i];
                            var o = parseInt(a, 10);
                            if (o) {
                                var l = [];
                                if ((e.GetNext(), r[0] && !s.default.MatchParam(e, r[0])))
                                    throw new u.default(
                                        'MismatchUseDef',
                                        "Use of %1 doesn't match its definition",
                                        t,
                                    );
                                for (var f = 0; f < o; f++)
                                    l.push(s.default.GetParameter(e, t, r[f + 1]));
                                n = c.default.substituteArgs(e, l, n);
                            }
                            (e.string = c.default.addArgs(e, n, e.string.slice(e.i))),
                                (e.i = 0),
                                c.default.checkMaxMacros(e);
                        },
                        BeginEnv: function (e, t, n, a, r, i) {
                            if (t.getProperty('end') && e.stack.env.closing === t.getName()) {
                                delete e.stack.env.closing;
                                var o = e.string.slice(e.i);
                                return (
                                    (e.string = a),
                                    (e.i = 0),
                                    e.Parse(),
                                    (e.string = o),
                                    (e.i = 0),
                                    e.itemFactory.create('end').setProperty('name', t.getName())
                                );
                            }
                            if (r) {
                                var u = [];
                                if (null != i) {
                                    var l = e.GetBrackets('\\begin{' + t.getName() + '}');
                                    u.push(null == l ? i : l);
                                }
                                for (var f = u.length; f < r; f++)
                                    u.push(e.GetArgument('\\begin{' + t.getName() + '}'));
                                (n = c.default.substituteArgs(e, u, n)),
                                    (a = c.default.substituteArgs(e, [], a));
                            }
                            return (
                                (e.string = c.default.addArgs(e, n, e.string.slice(e.i))),
                                (e.i = 0),
                                e.itemFactory.create('beginEnv').setProperty('name', t.getName())
                            );
                        },
                    };
                (d.Macro = f.default.Macro), (t.default = d);
            },
            406: function (e, t, n) {
                var a =
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    };
                Object.defineProperty(t, '__esModule', { value: !0 });
                var r,
                    i = a(n(398)),
                    o = a(n(402)),
                    u = n(924);
                !(function (e) {
                    function t(e, t) {
                        return e.string.substr(e.i, t.length) !== t ||
                            (t.match(/\\[a-z]+$/i) &&
                                e.string.charAt(e.i + t.length).match(/[a-z]/i))
                            ? 0
                            : ((e.i += t.length), 1);
                    }
                    (e.disassembleSymbol = function (e, t) {
                        var n = [e, t.char];
                        if (t.attributes)
                            for (var a in t.attributes) n.push(a), n.push(t.attributes[a]);
                        return n;
                    }),
                        (e.assembleSymbol = function (e) {
                            for (var t = e[0], n = e[1], a = {}, r = 2; r < e.length; r += 2)
                                a[e[r]] = e[r + 1];
                            return new u.Symbol(t, n, a);
                        }),
                        (e.GetCSname = function (e, t) {
                            if ('\\' !== e.GetNext())
                                throw new o.default(
                                    'MissingCS',
                                    '%1 must be followed by a control sequence',
                                    t,
                                );
                            return i.default.trimSpaces(e.GetArgument(t)).substr(1);
                        }),
                        (e.GetCsNameArgument = function (e, t) {
                            var n = i.default.trimSpaces(e.GetArgument(t));
                            if (
                                ('\\' === n.charAt(0) && (n = n.substr(1)),
                                !n.match(/^(.|[a-z]+)$/i))
                            )
                                throw new o.default(
                                    'IllegalControlSequenceName',
                                    'Illegal control sequence name for %1',
                                    t,
                                );
                            return n;
                        }),
                        (e.GetArgCount = function (e, t) {
                            var n = e.GetBrackets(t);
                            if (n && !(n = i.default.trimSpaces(n)).match(/^[0-9]+$/))
                                throw new o.default(
                                    'IllegalParamNumber',
                                    'Illegal number of parameters specified in %1',
                                    t,
                                );
                            return n;
                        }),
                        (e.GetTemplate = function (e, t, n) {
                            for (
                                var a = e.GetNext(), r = [], i = 0, u = e.i;
                                e.i < e.string.length;

                            ) {
                                if ('#' === (a = e.GetNext())) {
                                    if (
                                        (u !== e.i && (r[i] = e.string.substr(u, e.i - u)),
                                        !(a = e.string.charAt(++e.i)).match(/^[1-9]$/))
                                    )
                                        throw new o.default(
                                            'CantUseHash2',
                                            'Illegal use of # in template for %1',
                                            n,
                                        );
                                    if (parseInt(a) !== ++i)
                                        throw new o.default(
                                            'SequentialParam',
                                            'Parameters for %1 must be numbered sequentially',
                                            n,
                                        );
                                    u = e.i + 1;
                                } else if ('{' === a)
                                    return (
                                        u !== e.i && (r[i] = e.string.substr(u, e.i - u)),
                                        r.length > 0 ? [i.toString()].concat(r) : i
                                    );
                                e.i++;
                            }
                            throw new o.default(
                                'MissingReplacementString',
                                'Missing replacement string for definition of %1',
                                t,
                            );
                        }),
                        (e.GetParameter = function (e, n, a) {
                            if (null == a) return e.GetArgument(n);
                            for (var r = e.i, i = 0, u = 0; e.i < e.string.length; ) {
                                var l = e.string.charAt(e.i);
                                if ('{' === l)
                                    e.i === r && (u = 1), e.GetArgument(n), (i = e.i - r);
                                else {
                                    if (t(e, a)) return u && (r++, (i -= 2)), e.string.substr(r, i);
                                    if ('\\' === l) {
                                        e.i++, i++, (u = 0);
                                        var f = e.string.substr(e.i).match(/[a-z]+|./i);
                                        f && ((e.i += f[0].length), (i = e.i - r));
                                    } else e.i++, i++, (u = 0);
                                }
                            }
                            throw new o.default('RunawayArgument', 'Runaway argument for %1?', n);
                        }),
                        (e.MatchParam = t),
                        (e.addDelimiter = function (t, n, a, r) {
                            t.configuration.handlers
                                .retrieve(e.NEW_DELIMITER)
                                .add(n, new u.Symbol(n, a, r));
                        }),
                        (e.addMacro = function (t, n, a, r, i) {
                            void 0 === i && (i = ''),
                                t.configuration.handlers
                                    .retrieve(e.NEW_COMMAND)
                                    .add(n, new u.Macro(i || n, a, r));
                        }),
                        (e.addEnvironment = function (t, n, a, r) {
                            t.configuration.handlers
                                .retrieve(e.NEW_ENVIRONMENT)
                                .add(n, new u.Macro(n, a, r));
                        }),
                        (e.NEW_DELIMITER = 'new-Delimiter'),
                        (e.NEW_COMMAND = 'new-Command'),
                        (e.NEW_ENVIRONMENT = 'new-Environment');
                })(r || (r = {})),
                    (t.default = r);
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
            945: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseMethods.default);
            },
            398: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.ParseUtil.default);
            },
            76: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.MmlStack = MathJax._.input.tex.StackItem.MmlStack),
                    (t.BaseItem = MathJax._.input.tex.StackItem.BaseItem);
            },
            924: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Symbol = MathJax._.input.tex.Symbol.Symbol),
                    (t.Macro = MathJax._.input.tex.Symbol.Macro);
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
            360: function (e, t) {
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.default = MathJax._.input.tex.base.BaseMethods.default);
            },
        },
        u = {};
    function l(e) {
        var t = u[e];
        if (void 0 !== t) return t.exports;
        var n = (u[e] = { exports: {} });
        return o[e].call(n.exports, n, n.exports, l), n.exports;
    }
    (e = l(955)),
        (t = l(667)),
        (n = l(48)),
        (a = l(205)),
        (r = l(107)),
        (i = l(406)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/newcommand', t.q, 'tex-extension'),
        (0, e.r8)({
            _: {
                input: {
                    tex: {
                        newcommand: {
                            NewcommandConfiguration: n,
                            NewcommandItems: a,
                            NewcommandMethods: r,
                            NewcommandUtil: i,
                        },
                    },
                },
            },
        });
})();
