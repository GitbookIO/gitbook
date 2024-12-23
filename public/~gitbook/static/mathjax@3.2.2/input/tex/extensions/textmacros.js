!(function () {
    'use strict';
    var t,
        e,
        a,
        n,
        o,
        r = {
            667: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            762: function (t, e, a) {
                var n,
                    o =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosConfiguration = e.TextBaseConfiguration = void 0);
                var r = a(251),
                    s = o(a(278)),
                    i = a(680),
                    c = a(935),
                    l = a(787),
                    u = a(807);
                function p(t, e, a, n) {
                    var o = t.configuration.packageData.get('textmacros');
                    return (
                        t instanceof l.TextParser || (o.texParser = t),
                        [new l.TextParser(e, n ? { mathvariant: n } : {}, o.parseOptions, a).mml()]
                    );
                }
                a(557),
                    (e.TextBaseConfiguration = r.Configuration.create('text-base', {
                        parser: 'text',
                        handler: { character: ['command', 'text-special'], macro: ['text-macros'] },
                        fallback: {
                            character: function (t, e) {
                                t.text += e;
                            },
                            macro: function (t, e) {
                                var a = t.texParser,
                                    n = a.lookup('macro', e);
                                n &&
                                    n._func !== u.TextMacrosMethods.Macro &&
                                    t.Error(
                                        'MathMacro',
                                        '%1 is only supported in math mode',
                                        '\\' + e,
                                    ),
                                    a.parse('macro', [t, e]);
                            },
                        },
                        items:
                            ((n = {}),
                            (n[c.StartItem.prototype.kind] = c.StartItem),
                            (n[c.StopItem.prototype.kind] = c.StopItem),
                            (n[c.MmlItem.prototype.kind] = c.MmlItem),
                            (n[c.StyleItem.prototype.kind] = c.StyleItem),
                            n),
                    })),
                    (e.TextMacrosConfiguration = r.Configuration.create('textmacros', {
                        config: function (t, e) {
                            var a = new r.ParserConfiguration(
                                e.parseOptions.options.textmacros.packages,
                                ['tex', 'text'],
                            );
                            a.init();
                            var n = new s.default(a, []);
                            (n.options = e.parseOptions.options),
                                a.config(e),
                                i.TagsFactory.addTags(a.tags),
                                (n.tags = i.TagsFactory.getDefault()),
                                (n.tags.configuration = n),
                                (n.packageData = e.parseOptions.packageData),
                                n.packageData.set('textmacros', {
                                    parseOptions: n,
                                    jax: e,
                                    texParser: null,
                                }),
                                (n.options.internalMath = p);
                        },
                        preprocessors: [
                            function (t) {
                                var e = t.data.packageData.get('textmacros');
                                e.parseOptions.nodeFactory.setMmlFactory(e.jax.mmlFactory);
                            },
                        ],
                        options: { textmacros: { packages: ['text-base'] } },
                    }));
            },
            557: function (t, e, a) {
                Object.defineProperty(e, '__esModule', { value: !0 });
                var n = a(871),
                    o = a(108),
                    r = a(807),
                    s = a(230);
                new n.MacroMap(
                    'text-special',
                    {
                        $: 'Math',
                        '%': 'Comment',
                        '^': 'MathModeOnly',
                        _: 'MathModeOnly',
                        '&': 'Misplaced',
                        '#': 'Misplaced',
                        '~': 'Tilde',
                        ' ': 'Space',
                        '\t': 'Space',
                        '\r': 'Space',
                        '\n': 'Space',
                        '\xa0': 'Tilde',
                        '{': 'OpenBrace',
                        '}': 'CloseBrace',
                        '`': 'OpenQuote',
                        "'": 'CloseQuote',
                    },
                    r.TextMacrosMethods,
                ),
                    new n.CommandMap(
                        'text-macros',
                        {
                            '(': 'Math',
                            $: 'SelfQuote',
                            _: 'SelfQuote',
                            '%': 'SelfQuote',
                            '{': 'SelfQuote',
                            '}': 'SelfQuote',
                            ' ': 'SelfQuote',
                            '&': 'SelfQuote',
                            '#': 'SelfQuote',
                            '\\': 'SelfQuote',
                            "'": ['Accent', '\xb4'],
                            '\u2019': ['Accent', '\xb4'],
                            '`': ['Accent', '`'],
                            '\u2018': ['Accent', '`'],
                            '^': ['Accent', '^'],
                            '"': ['Accent', '\xa8'],
                            '~': ['Accent', '~'],
                            '=': ['Accent', '\xaf'],
                            '.': ['Accent', '\u02d9'],
                            u: ['Accent', '\u02d8'],
                            v: ['Accent', '\u02c7'],
                            emph: 'Emph',
                            rm: ['SetFont', o.TexConstant.Variant.NORMAL],
                            mit: ['SetFont', o.TexConstant.Variant.ITALIC],
                            oldstyle: ['SetFont', o.TexConstant.Variant.OLDSTYLE],
                            cal: ['SetFont', o.TexConstant.Variant.CALLIGRAPHIC],
                            it: ['SetFont', '-tex-mathit'],
                            bf: ['SetFont', o.TexConstant.Variant.BOLD],
                            bbFont: ['SetFont', o.TexConstant.Variant.DOUBLESTRUCK],
                            scr: ['SetFont', o.TexConstant.Variant.SCRIPT],
                            frak: ['SetFont', o.TexConstant.Variant.FRAKTUR],
                            sf: ['SetFont', o.TexConstant.Variant.SANSSERIF],
                            tt: ['SetFont', o.TexConstant.Variant.MONOSPACE],
                            tiny: ['SetSize', 0.5],
                            Tiny: ['SetSize', 0.6],
                            scriptsize: ['SetSize', 0.7],
                            small: ['SetSize', 0.85],
                            normalsize: ['SetSize', 1],
                            large: ['SetSize', 1.2],
                            Large: ['SetSize', 1.44],
                            LARGE: ['SetSize', 1.73],
                            huge: ['SetSize', 2.07],
                            Huge: ['SetSize', 2.49],
                            Bbb: ['Macro', '{\\bbFont #1}', 1],
                            textnormal: ['Macro', '{\\rm #1}', 1],
                            textup: ['Macro', '{\\rm #1}', 1],
                            textrm: ['Macro', '{\\rm #1}', 1],
                            textit: ['Macro', '{\\it #1}', 1],
                            textbf: ['Macro', '{\\bf #1}', 1],
                            textsf: ['Macro', '{\\sf #1}', 1],
                            texttt: ['Macro', '{\\tt #1}', 1],
                            dagger: ['Insert', '\u2020'],
                            ddagger: ['Insert', '\u2021'],
                            S: ['Insert', '\xa7'],
                            ',': ['Spacer', s.MATHSPACE.thinmathspace],
                            ':': ['Spacer', s.MATHSPACE.mediummathspace],
                            '>': ['Spacer', s.MATHSPACE.mediummathspace],
                            ';': ['Spacer', s.MATHSPACE.thickmathspace],
                            '!': ['Spacer', s.MATHSPACE.negativethinmathspace],
                            enspace: ['Spacer', 0.5],
                            quad: ['Spacer', 1],
                            qquad: ['Spacer', 2],
                            thinspace: ['Spacer', s.MATHSPACE.thinmathspace],
                            negthinspace: ['Spacer', s.MATHSPACE.negativethinmathspace],
                            hskip: 'Hskip',
                            hspace: 'Hskip',
                            kern: 'Hskip',
                            mskip: 'Hskip',
                            mspace: 'Hskip',
                            mkern: 'Hskip',
                            rule: 'rule',
                            Rule: ['Rule'],
                            Space: ['Rule', 'blank'],
                            color: 'CheckAutoload',
                            textcolor: 'CheckAutoload',
                            colorbox: 'CheckAutoload',
                            fcolorbox: 'CheckAutoload',
                            href: 'CheckAutoload',
                            style: 'CheckAutoload',
                            class: 'CheckAutoload',
                            cssId: 'CheckAutoload',
                            unicode: 'CheckAutoload',
                            ref: ['HandleRef', !1],
                            eqref: ['HandleRef', !0],
                        },
                        r.TextMacrosMethods,
                    );
            },
            807: function (t, e, a) {
                var n =
                    (this && this.__importDefault) ||
                    function (t) {
                        return t && t.__esModule ? t : { default: t };
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TextMacrosMethods = void 0);
                var o = n(a(193)),
                    r = a(832),
                    s = n(a(360));
                e.TextMacrosMethods = {
                    Comment: function (t, e) {
                        for (; t.i < t.string.length && '\n' !== t.string.charAt(t.i); ) t.i++;
                        t.i++;
                    },
                    Math: function (t, e) {
                        t.saveText();
                        for (var a, n, r = t.i, s = 0; (n = t.GetNext()); )
                            switch (((a = t.i++), n)) {
                                case '\\':
                                    ')' === t.GetCS() && (n = '\\(');
                                case '$':
                                    if (0 === s && e === n) {
                                        var i = t.texParser.configuration,
                                            c = new o.default(
                                                t.string.substr(r, a - r),
                                                t.stack.env,
                                                i,
                                            ).mml();
                                        return void t.PushMath(c);
                                    }
                                    break;
                                case '{':
                                    s++;
                                    break;
                                case '}':
                                    0 === s &&
                                        t.Error(
                                            'ExtraCloseMissingOpen',
                                            'Extra close brace or missing open brace',
                                        ),
                                        s--;
                            }
                        t.Error('MathNotTerminated', 'Math-mode is not properly terminated');
                    },
                    MathModeOnly: function (t, e) {
                        t.Error('MathModeOnly', "'%1' allowed only in math mode", e);
                    },
                    Misplaced: function (t, e) {
                        t.Error('Misplaced', "'%1' can not be used here", e);
                    },
                    OpenBrace: function (t, e) {
                        var a = t.stack.env;
                        t.envStack.push(a), (t.stack.env = Object.assign({}, a));
                    },
                    CloseBrace: function (t, e) {
                        t.envStack.length
                            ? (t.saveText(), (t.stack.env = t.envStack.pop()))
                            : t.Error(
                                  'ExtraCloseMissingOpen',
                                  'Extra close brace or missing open brace',
                              );
                    },
                    OpenQuote: function (t, e) {
                        t.string.charAt(t.i) === e
                            ? ((t.text += '\u201c'), t.i++)
                            : (t.text += '\u2018');
                    },
                    CloseQuote: function (t, e) {
                        t.string.charAt(t.i) === e
                            ? ((t.text += '\u201d'), t.i++)
                            : (t.text += '\u2019');
                    },
                    Tilde: function (t, e) {
                        t.text += '\xa0';
                    },
                    Space: function (t, e) {
                        for (t.text += ' '; t.GetNext().match(/\s/); ) t.i++;
                    },
                    SelfQuote: function (t, e) {
                        t.text += e.substr(1);
                    },
                    Insert: function (t, e, a) {
                        t.text += a;
                    },
                    Accent: function (t, e, a) {
                        var n = t.ParseArg(e),
                            o = t.create('token', 'mo', {}, a);
                        t.addAttributes(o), t.Push(t.create('node', 'mover', [n, o]));
                    },
                    Emph: function (t, e) {
                        var a =
                            '-tex-mathit' === t.stack.env.mathvariant ? 'normal' : '-tex-mathit';
                        t.Push(t.ParseTextArg(e, { mathvariant: a }));
                    },
                    SetFont: function (t, e, a) {
                        t.saveText(), (t.stack.env.mathvariant = a);
                    },
                    SetSize: function (t, e, a) {
                        t.saveText(), (t.stack.env.mathsize = a);
                    },
                    CheckAutoload: function (t, e) {
                        var a = t.configuration.packageData.get('autoload'),
                            n = t.texParser;
                        e = e.slice(1);
                        var o = n.lookup('macro', e);
                        if (!o || (a && o._func === a.Autoload)) {
                            if ((n.parse('macro', [n, e]), !o)) return;
                            (0, r.retryAfter)(Promise.resolve());
                        }
                        n.parse('macro', [t, e]);
                    },
                    Macro: s.default.Macro,
                    Spacer: s.default.Spacer,
                    Hskip: s.default.Hskip,
                    rule: s.default.rule,
                    Rule: s.default.Rule,
                    HandleRef: s.default.HandleRef,
                };
            },
            787: function (t, e, a) {
                var n,
                    o =
                        (this && this.__extends) ||
                        ((n = function (t, e) {
                            return (
                                (n =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var a in e)
                                            Object.prototype.hasOwnProperty.call(e, a) &&
                                                (t[a] = e[a]);
                                    }),
                                n(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function a() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((a.prototype = e.prototype), new a()));
                        }),
                    r =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                a = e && t[e],
                                n = 0;
                            if (a) return a.call(t);
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
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    s =
                        (this && this.__read) ||
                        function (t, e) {
                            var a = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!a) return t;
                            var n,
                                o,
                                r = a.call(t),
                                s = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = r.next()).done; )
                                    s.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (a = r.return) && a.call(r);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return s;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, a) {
                            if (a || 2 === arguments.length)
                                for (var n, o = 0, r = e.length; o < r; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    c =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.TextParser = void 0);
                var l = c(a(193)),
                    u = c(a(402)),
                    p = c(a(398)),
                    m = a(801),
                    h = c(a(748)),
                    x = a(935),
                    M = (function (t) {
                        function e(e, a, n, o) {
                            var r = t.call(this, e, a, n) || this;
                            return (r.level = o), r;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'texParser', {
                                get: function () {
                                    return this.configuration.packageData.get('textmacros')
                                        .texParser;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'tags', {
                                get: function () {
                                    return this.texParser.tags;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.mml = function () {
                                return null != this.level
                                    ? this.create('node', 'mstyle', this.nodes, {
                                          displaystyle: !1,
                                          scriptlevel: this.level,
                                      })
                                    : 1 === this.nodes.length
                                      ? this.nodes[0]
                                      : this.create('node', 'mrow', this.nodes);
                            }),
                            (e.prototype.Parse = function () {
                                (this.text = ''),
                                    (this.nodes = []),
                                    (this.envStack = []),
                                    t.prototype.Parse.call(this);
                            }),
                            (e.prototype.saveText = function () {
                                if (this.text) {
                                    var t = this.stack.env.mathvariant,
                                        e = p.default.internalText(
                                            this,
                                            this.text,
                                            t ? { mathvariant: t } : {},
                                        );
                                    (this.text = ''), this.Push(e);
                                }
                            }),
                            (e.prototype.Push = function (e) {
                                if ((this.text && this.saveText(), e instanceof x.StopItem))
                                    return t.prototype.Push.call(this, e);
                                e instanceof x.StyleItem
                                    ? (this.stack.env.mathcolor = this.stack.env.color)
                                    : e instanceof m.AbstractMmlNode &&
                                      (this.addAttributes(e), this.nodes.push(e));
                            }),
                            (e.prototype.PushMath = function (t) {
                                var e,
                                    a,
                                    n = this.stack.env;
                                t.isKind('TeXAtom') || (t = this.create('node', 'TeXAtom', [t]));
                                try {
                                    for (
                                        var o = r(['mathsize', 'mathcolor']), s = o.next();
                                        !s.done;
                                        s = o.next()
                                    ) {
                                        var i = s.value;
                                        n[i] &&
                                            !t.attributes.getExplicit(i) &&
                                            (t.isToken ||
                                                t.isKind('mstyle') ||
                                                (t = this.create('node', 'mstyle', [t])),
                                            h.default.setAttribute(t, i, n[i]));
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (a = o.return) && a.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                t.isInferred && (t = this.create('node', 'mrow', t.childNodes)),
                                    this.nodes.push(t);
                            }),
                            (e.prototype.addAttributes = function (t) {
                                var e,
                                    a,
                                    n = this.stack.env;
                                if (t.isToken)
                                    try {
                                        for (
                                            var o = r(['mathsize', 'mathcolor', 'mathvariant']),
                                                s = o.next();
                                            !s.done;
                                            s = o.next()
                                        ) {
                                            var i = s.value;
                                            n[i] &&
                                                !t.attributes.getExplicit(i) &&
                                                h.default.setAttribute(t, i, n[i]);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            s && !s.done && (a = o.return) && a.call(o);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                            }),
                            (e.prototype.ParseTextArg = function (t, a) {
                                return new e(
                                    this.GetArgument(t),
                                    (a = Object.assign(Object.assign({}, this.stack.env), a)),
                                    this.configuration,
                                ).mml();
                            }),
                            (e.prototype.ParseArg = function (t) {
                                return new e(
                                    this.GetArgument(t),
                                    this.stack.env,
                                    this.configuration,
                                ).mml();
                            }),
                            (e.prototype.Error = function (t, e) {
                                for (var a = [], n = 2; n < arguments.length; n++)
                                    a[n - 2] = arguments[n];
                                throw new (u.default.bind.apply(
                                    u.default,
                                    i([void 0, t, e], s(a), !1),
                                ))();
                            }),
                            e
                        );
                    })(l.default);
                e.TextParser = M;
            },
            955: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            801: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TEXCLASS = MathJax._.core.MmlTree.MmlNode.TEXCLASS),
                    (e.TEXCLASSNAMES = MathJax._.core.MmlTree.MmlNode.TEXCLASSNAMES),
                    (e.indentAttributes = MathJax._.core.MmlTree.MmlNode.indentAttributes),
                    (e.AbstractMmlNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlNode),
                    (e.AbstractMmlTokenNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlTokenNode),
                    (e.AbstractMmlLayoutNode =
                        MathJax._.core.MmlTree.MmlNode.AbstractMmlLayoutNode),
                    (e.AbstractMmlBaseNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlBaseNode),
                    (e.AbstractMmlEmptyNode = MathJax._.core.MmlTree.MmlNode.AbstractMmlEmptyNode),
                    (e.TextNode = MathJax._.core.MmlTree.MmlNode.TextNode),
                    (e.XMLNode = MathJax._.core.MmlTree.MmlNode.XMLNode);
            },
            832: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.handleRetriesFor = MathJax._.util.Retries.handleRetriesFor),
                    (e.retryAfter = MathJax._.util.Retries.retryAfter);
            },
            230: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BIGDIMEN = MathJax._.util.lengths.BIGDIMEN),
                    (e.UNITS = MathJax._.util.lengths.UNITS),
                    (e.RELUNITS = MathJax._.util.lengths.RELUNITS),
                    (e.MATHSPACE = MathJax._.util.lengths.MATHSPACE),
                    (e.length2em = MathJax._.util.lengths.length2em),
                    (e.percent = MathJax._.util.lengths.percent),
                    (e.em = MathJax._.util.lengths.em),
                    (e.emRounded = MathJax._.util.lengths.emRounded),
                    (e.px = MathJax._.util.lengths.px);
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
            278: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.ParseOptions.default);
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
            680: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Label = MathJax._.input.tex.Tags.Label),
                    (e.TagInfo = MathJax._.input.tex.Tags.TagInfo),
                    (e.AbstractTags = MathJax._.input.tex.Tags.AbstractTags),
                    (e.NoTags = MathJax._.input.tex.Tags.NoTags),
                    (e.AllTags = MathJax._.input.tex.Tags.AllTags),
                    (e.TagsFactory = MathJax._.input.tex.Tags.TagsFactory);
            },
            108: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TexConstant = MathJax._.input.tex.TexConstants.TexConstant);
            },
            402: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexError.default);
            },
            193: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.TexParser.default);
            },
            935: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.StartItem = MathJax._.input.tex.base.BaseItems.StartItem),
                    (e.StopItem = MathJax._.input.tex.base.BaseItems.StopItem),
                    (e.OpenItem = MathJax._.input.tex.base.BaseItems.OpenItem),
                    (e.CloseItem = MathJax._.input.tex.base.BaseItems.CloseItem),
                    (e.PrimeItem = MathJax._.input.tex.base.BaseItems.PrimeItem),
                    (e.SubsupItem = MathJax._.input.tex.base.BaseItems.SubsupItem),
                    (e.OverItem = MathJax._.input.tex.base.BaseItems.OverItem),
                    (e.LeftItem = MathJax._.input.tex.base.BaseItems.LeftItem),
                    (e.Middle = MathJax._.input.tex.base.BaseItems.Middle),
                    (e.RightItem = MathJax._.input.tex.base.BaseItems.RightItem),
                    (e.BeginItem = MathJax._.input.tex.base.BaseItems.BeginItem),
                    (e.EndItem = MathJax._.input.tex.base.BaseItems.EndItem),
                    (e.StyleItem = MathJax._.input.tex.base.BaseItems.StyleItem),
                    (e.PositionItem = MathJax._.input.tex.base.BaseItems.PositionItem),
                    (e.CellItem = MathJax._.input.tex.base.BaseItems.CellItem),
                    (e.MmlItem = MathJax._.input.tex.base.BaseItems.MmlItem),
                    (e.FnItem = MathJax._.input.tex.base.BaseItems.FnItem),
                    (e.NotItem = MathJax._.input.tex.base.BaseItems.NotItem),
                    (e.NonscriptItem = MathJax._.input.tex.base.BaseItems.NonscriptItem),
                    (e.DotsItem = MathJax._.input.tex.base.BaseItems.DotsItem),
                    (e.ArrayItem = MathJax._.input.tex.base.BaseItems.ArrayItem),
                    (e.EqnArrayItem = MathJax._.input.tex.base.BaseItems.EqnArrayItem),
                    (e.EquationItem = MathJax._.input.tex.base.BaseItems.EquationItem);
            },
            360: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.default = MathJax._.input.tex.base.BaseMethods.default);
            },
        },
        s = {};
    function i(t) {
        var e = s[t];
        if (void 0 !== e) return e.exports;
        var a = (s[t] = { exports: {} });
        return r[t].call(a.exports, a, a.exports, i), a.exports;
    }
    (t = i(955)),
        (e = i(667)),
        (a = i(762)),
        (n = i(807)),
        (o = i(787)),
        MathJax.loader && MathJax.loader.checkVersion('[tex]/textmacros', e.q, 'tex-extension'),
        (0, t.r8)({
            _: {
                input: {
                    tex: {
                        textmacros: {
                            TextMacrosConfiguration: a,
                            TextMacrosMethods: n,
                            TextParser: o,
                        },
                    },
                },
            },
        });
})();
