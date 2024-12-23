!(function () {
    'use strict';
    var t,
        e,
        i,
        o = {
            62: function (t, e, i) {
                var o,
                    s =
                        (this && this.__extends) ||
                        ((o = function (t, e) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var i in e)
                                            Object.prototype.hasOwnProperty.call(e, i) &&
                                                (t[i] = e[i]);
                                    }),
                                o(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function i() {
                                this.constructor = t;
                            }
                            o(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((i.prototype = e.prototype), new i()));
                        }),
                    n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, i = 1, o = arguments.length; i < o; i++)
                                            for (var s in (e = arguments[i]))
                                                Object.prototype.hasOwnProperty.call(e, s) &&
                                                    (t[s] = e[s]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    r =
                        (this && this.__read) ||
                        function (t, e) {
                            var i = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!i) return t;
                            var o,
                                s,
                                n = i.call(t),
                                r = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(o = n.next()).done; )
                                    r.push(o.value);
                            } catch (t) {
                                s = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (i = n.return) && i.call(n);
                                } finally {
                                    if (s) throw s.error;
                                }
                            }
                            return r;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, i) {
                            if (i || 2 === arguments.length)
                                for (var o, s = 0, n = e.length; s < n; s++)
                                    (!o && s in e) ||
                                        (o || (o = Array.prototype.slice.call(e, 0, s)),
                                        (o[s] = e[s]));
                            return t.concat(o || Array.prototype.slice.call(e));
                        },
                    l =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                i = e && t[e],
                                o = 0;
                            if (i) return i.call(t);
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AssistiveMmlHandler =
                        e.AssistiveMmlMathDocumentMixin =
                        e.AssistiveMmlMathItemMixin =
                        e.LimitedMmlVisitor =
                            void 0);
                var p = i(769),
                    c = i(433),
                    u = i(77),
                    h = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            s(e, t),
                            (e.prototype.getAttributes = function (e) {
                                return t.prototype.getAttributes
                                    .call(this, e)
                                    .replace(/ ?id=".*?"/, '');
                            }),
                            e
                        );
                    })(c.SerializedMmlVisitor);
                function m(t) {
                    return (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            s(e, t),
                            (e.prototype.assistiveMml = function (t, e) {
                                if (
                                    (void 0 === e && (e = !1),
                                    !(this.state() >= p.STATE.ASSISTIVEMML))
                                ) {
                                    if (!this.isEscaped && (t.options.enableAssistiveMml || e)) {
                                        var i = t.adaptor,
                                            o = t
                                                .toMML(this.root)
                                                .replace(/\n */g, '')
                                                .replace(/<!--.*?-->/g, ''),
                                            s = i.firstChild(i.body(i.parse(o, 'text/html'))),
                                            n = i.node(
                                                'mjx-assistive-mml',
                                                {
                                                    unselectable: 'on',
                                                    display: this.display ? 'block' : 'inline',
                                                },
                                                [s],
                                            );
                                        i.setAttribute(
                                            i.firstChild(this.typesetRoot),
                                            'aria-hidden',
                                            'true',
                                        ),
                                            i.setStyle(this.typesetRoot, 'position', 'relative'),
                                            i.append(this.typesetRoot, n);
                                    }
                                    this.state(p.STATE.ASSISTIVEMML);
                                }
                            }),
                            e
                        );
                    })(t);
                }
                function M(t) {
                    var e;
                    return (
                        (e = (function (t) {
                            function e() {
                                for (var e = [], i = 0; i < arguments.length; i++)
                                    e[i] = arguments[i];
                                var o = t.apply(this, a([], r(e), !1)) || this,
                                    s = o.constructor,
                                    n = s.ProcessBits;
                                return (
                                    n.has('assistive-mml') || n.allocate('assistive-mml'),
                                    (o.visitor = new h(o.mmlFactory)),
                                    (o.options.MathItem = m(o.options.MathItem)),
                                    'addStyles' in o && o.addStyles(s.assistiveStyles),
                                    o
                                );
                            }
                            return (
                                s(e, t),
                                (e.prototype.toMML = function (t) {
                                    return this.visitor.visitTree(t);
                                }),
                                (e.prototype.assistiveMml = function () {
                                    var t, e;
                                    if (!this.processed.isSet('assistive-mml')) {
                                        try {
                                            for (
                                                var i = l(this.math), o = i.next();
                                                !o.done;
                                                o = i.next()
                                            ) {
                                                o.value.assistiveMml(this);
                                            }
                                        } catch (e) {
                                            t = { error: e };
                                        } finally {
                                            try {
                                                o && !o.done && (e = i.return) && e.call(i);
                                            } finally {
                                                if (t) throw t.error;
                                            }
                                        }
                                        this.processed.set('assistive-mml');
                                    }
                                    return this;
                                }),
                                (e.prototype.state = function (e, i) {
                                    return (
                                        void 0 === i && (i = !1),
                                        t.prototype.state.call(this, e, i),
                                        e < p.STATE.ASSISTIVEMML &&
                                            this.processed.clear('assistive-mml'),
                                        this
                                    );
                                }),
                                e
                            );
                        })(t)),
                        (e.OPTIONS = n(n({}, t.OPTIONS), {
                            enableAssistiveMml: !0,
                            renderActions: (0, u.expandable)(
                                n(n({}, t.OPTIONS.renderActions), {
                                    assistiveMml: [p.STATE.ASSISTIVEMML],
                                }),
                            ),
                        })),
                        (e.assistiveStyles = {
                            'mjx-assistive-mml': {
                                position: 'absolute !important',
                                top: '0px',
                                left: '0px',
                                clip: 'rect(1px, 1px, 1px, 1px)',
                                padding: '1px 0px 0px 0px !important',
                                border: '0px !important',
                                display: 'block !important',
                                width: 'auto !important',
                                overflow: 'hidden !important',
                                '-webkit-touch-callout': 'none',
                                '-webkit-user-select': 'none',
                                '-khtml-user-select': 'none',
                                '-moz-user-select': 'none',
                                '-ms-user-select': 'none',
                                'user-select': 'none',
                            },
                            'mjx-assistive-mml[display="block"]': { width: '100% !important' },
                        }),
                        e
                    );
                }
                (e.LimitedMmlVisitor = h),
                    (0, p.newState)('ASSISTIVEMML', 153),
                    (e.AssistiveMmlMathItemMixin = m),
                    (e.AssistiveMmlMathDocumentMixin = M),
                    (e.AssistiveMmlHandler = function (t) {
                        return (t.documentClass = M(t.documentClass)), t;
                    });
            },
            306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            723: function (t, e) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
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
            433: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.DATAMJX = MathJax._.core.MmlTree.SerializedMmlVisitor.DATAMJX),
                    (e.toEntity = MathJax._.core.MmlTree.SerializedMmlVisitor.toEntity),
                    (e.SerializedMmlVisitor =
                        MathJax._.core.MmlTree.SerializedMmlVisitor.SerializedMmlVisitor);
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
        },
        s = {};
    function n(t) {
        var e = s[t];
        if (void 0 !== e) return e.exports;
        var i = (s[t] = { exports: {} });
        return o[t].call(i.exports, i, i.exports, n), i.exports;
    }
    (t = n(723)),
        (e = n(306)),
        (i = n(62)),
        MathJax.loader && MathJax.loader.checkVersion('a11y/assistive-mml', e.q, 'a11y'),
        (0, t.r8)({ _: { a11y: { 'assistive-mml': i } } }),
        MathJax.startup &&
            MathJax.startup.extendHandler(function (t) {
                return (0, i.AssistiveMmlHandler)(t);
            });
})();
