!(function () {
    'use strict';
    var t = {
            433: function (t, e, r) {
                var n,
                    a =
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
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
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
                            function r() {
                                this.constructor = t;
                            }
                            n(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((r.prototype = e.prototype), new r()));
                        }),
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var a in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, a) &&
                                                    (t[a] = e[a]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                r = e && t[e],
                                n = 0;
                            if (r) return r.call(t);
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
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                a,
                                i = r.call(t),
                                o = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    o.push(n.value);
                            } catch (t) {
                                a = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (a) throw a.error;
                                }
                            }
                            return o;
                        },
                    c =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, a = 0, i = e.length; a < i; a++)
                                    (!n && a in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, a)),
                                        (n[a] = e[a]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    l =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EnrichHandler =
                        e.EnrichedMathDocumentMixin =
                        e.EnrichedMathItemMixin =
                            void 0);
                var h = r(184),
                    u = r(769),
                    p = r(758),
                    f = r(77),
                    d = l(r(712)),
                    y = 'none';
                function M(t, e, r) {
                    return (function (t) {
                        function n() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            a(n, t),
                            (n.prototype.serializeMml = function (t) {
                                if ('outerHTML' in t) return t.outerHTML;
                                if (
                                    'undefined' != typeof Element &&
                                    'undefined' != typeof window &&
                                    t instanceof Element
                                ) {
                                    var e = window.document.createElement('div');
                                    return e.appendChild(t), e.innerHTML;
                                }
                                return t.toString();
                            }),
                            (n.prototype.enrich = function (t, n) {
                                if (
                                    (void 0 === n && (n = !1), !(this.state() >= u.STATE.ENRICHED))
                                ) {
                                    if (!this.isEscaped && (t.options.enableEnrichment || n)) {
                                        t.options.sre.speech !== y &&
                                            ((y = t.options.sre.speech),
                                            h.mathjax.retryAfter(
                                                d.default
                                                    .setupEngine(t.options.sre)
                                                    .then(function () {
                                                        return d.default.sreReady();
                                                    }),
                                            ));
                                        var a = new t.options.MathItem('', e);
                                        try {
                                            var i = (this.inputData.originalMml = r(this.root));
                                            (a.math = this.serializeMml(d.default.toEnriched(i))),
                                                (a.display = this.display),
                                                a.compile(t),
                                                (this.root = a.root),
                                                (this.inputData.enrichedMml = a.math);
                                        } catch (e) {
                                            t.options.enrichError(t, this, e);
                                        }
                                    }
                                    this.state(u.STATE.ENRICHED);
                                }
                            }),
                            (n.prototype.attachSpeech = function (t) {
                                var e, r;
                                if (!(this.state() >= u.STATE.ATTACHSPEECH)) {
                                    var n =
                                        this.root.attributes.get('aria-label') ||
                                        this.getSpeech(this.root);
                                    if (n) {
                                        var a = t.adaptor,
                                            i = this.typesetRoot;
                                        a.setAttribute(i, 'aria-label', n);
                                        try {
                                            for (
                                                var s = o(a.childNodes(i)), c = s.next();
                                                !c.done;
                                                c = s.next()
                                            ) {
                                                var l = c.value;
                                                a.setAttribute(l, 'aria-hidden', 'true');
                                            }
                                        } catch (t) {
                                            e = { error: t };
                                        } finally {
                                            try {
                                                c && !c.done && (r = s.return) && r.call(s);
                                            } finally {
                                                if (e) throw e.error;
                                            }
                                        }
                                    }
                                    this.state(u.STATE.ATTACHSPEECH);
                                }
                            }),
                            (n.prototype.getSpeech = function (t) {
                                var e,
                                    r,
                                    n = t.attributes;
                                if (!n) return '';
                                var a = n.getExplicit('data-semantic-speech');
                                if (!n.getExplicit('data-semantic-parent') && a) return a;
                                try {
                                    for (
                                        var i = o(t.childNodes), s = i.next();
                                        !s.done;
                                        s = i.next()
                                    ) {
                                        var c = s.value,
                                            l = this.getSpeech(c);
                                        if (null != l) return l;
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = i.return) && r.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return '';
                            }),
                            n
                        );
                    })(t);
                }
                function m(t, e) {
                    var r;
                    return (
                        (r = (function (t) {
                            function r() {
                                for (var r = [], n = 0; n < arguments.length; n++)
                                    r[n] = arguments[n];
                                var a = t.apply(this, c([], s(r), !1)) || this;
                                e.setMmlFactory(a.mmlFactory);
                                var i = a.constructor.ProcessBits;
                                i.has('enriched') ||
                                    (i.allocate('enriched'), i.allocate('attach-speech'));
                                var o = new p.SerializedMmlVisitor(a.mmlFactory),
                                    l = function (t) {
                                        return o.visitTree(t);
                                    };
                                return (a.options.MathItem = M(a.options.MathItem, e, l)), a;
                            }
                            return (
                                a(r, t),
                                (r.prototype.attachSpeech = function () {
                                    var t, e;
                                    if (!this.processed.isSet('attach-speech')) {
                                        try {
                                            for (
                                                var r = o(this.math), n = r.next();
                                                !n.done;
                                                n = r.next()
                                            ) {
                                                n.value.attachSpeech(this);
                                            }
                                        } catch (e) {
                                            t = { error: e };
                                        } finally {
                                            try {
                                                n && !n.done && (e = r.return) && e.call(r);
                                            } finally {
                                                if (t) throw t.error;
                                            }
                                        }
                                        this.processed.set('attach-speech');
                                    }
                                    return this;
                                }),
                                (r.prototype.enrich = function () {
                                    var t, e;
                                    if (!this.processed.isSet('enriched')) {
                                        if (this.options.enableEnrichment)
                                            try {
                                                for (
                                                    var r = o(this.math), n = r.next();
                                                    !n.done;
                                                    n = r.next()
                                                ) {
                                                    n.value.enrich(this);
                                                }
                                            } catch (e) {
                                                t = { error: e };
                                            } finally {
                                                try {
                                                    n && !n.done && (e = r.return) && e.call(r);
                                                } finally {
                                                    if (t) throw t.error;
                                                }
                                            }
                                        this.processed.set('enriched');
                                    }
                                    return this;
                                }),
                                (r.prototype.enrichError = function (t, e, r) {
                                    console.warn('Enrichment error:', r);
                                }),
                                (r.prototype.state = function (e, r) {
                                    return (
                                        void 0 === r && (r = !1),
                                        t.prototype.state.call(this, e, r),
                                        e < u.STATE.ENRICHED && this.processed.clear('enriched'),
                                        this
                                    );
                                }),
                                r
                            );
                        })(t)),
                        (r.OPTIONS = i(i({}, t.OPTIONS), {
                            enableEnrichment: !0,
                            enrichError: function (t, e, r) {
                                return t.enrichError(t, e, r);
                            },
                            renderActions: (0, f.expandable)(
                                i(i({}, t.OPTIONS.renderActions), {
                                    enrich: [u.STATE.ENRICHED],
                                    attachSpeech: [u.STATE.ATTACHSPEECH],
                                }),
                            ),
                            sre: (0, f.expandable)({
                                speech: 'none',
                                domain: 'mathspeak',
                                style: 'default',
                                locale: 'en',
                            }),
                        })),
                        r
                    );
                }
                (0, u.newState)('ENRICHED', 30),
                    (0, u.newState)('ATTACHSPEECH', 155),
                    (e.EnrichedMathItemMixin = M),
                    (e.EnrichedMathDocumentMixin = m),
                    (e.EnrichHandler = function (t, e) {
                        return (
                            e.setAdaptor(t.adaptor), (t.documentClass = m(t.documentClass, e)), t
                        );
                    });
            },
            306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            712: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Sre = MathJax._.a11y.sre.Sre),
                    (e.sreReady = MathJax._.a11y.sre.sreReady),
                    (e.default = MathJax._.a11y.sre.default);
            },
            723: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    (e.PV = MathJax._.components.global.combineDefaults),
                    (e.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
            769: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.protoItem = MathJax._.core.MathItem.protoItem),
                    (e.AbstractMathItem = MathJax._.core.MathItem.AbstractMathItem),
                    (e.STATE = MathJax._.core.MathItem.STATE),
                    (e.newState = MathJax._.core.MathItem.newState);
            },
            758: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.DATAMJX = MathJax._.core.MmlTree.SerializedMmlVisitor.DATAMJX),
                    (e.toEntity = MathJax._.core.MmlTree.SerializedMmlVisitor.toEntity),
                    (e.SerializedMmlVisitor =
                        MathJax._.core.MmlTree.SerializedMmlVisitor.SerializedMmlVisitor);
            },
            184: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.mathjax = MathJax._.mathjax.mathjax);
            },
            77: function (t, e) {
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
            475: function (t, e) {
                e.K = MathJax._.input.mathml_ts.MathML;
            },
        },
        e = {};
    function r(n) {
        var a = e[n];
        if (void 0 !== a) return a.exports;
        var i = (e[n] = { exports: {} });
        return t[n].call(i.exports, i, i.exports, r), i.exports;
    }
    !(function () {
        var t = r(723),
            e = r(306),
            n = r(433);
        MathJax.loader && MathJax.loader.checkVersion('a11y/semantic-enrich', e.q, 'a11y'),
            (0, t.r8)({ _: { a11y: { 'semantic-enrich': n } } });
        var a = r(712),
            i = r(475);
        MathJax.loader &&
            (0, t.PV)(MathJax.config.loader, 'a11y/semantic-enrich', {
                checkReady: function () {
                    return a.default.sreReady();
                },
            }),
            MathJax.startup &&
                MathJax.startup.extendHandler(function (t) {
                    return (0, n.EnrichHandler)(t, new i.K());
                });
    })();
})();
