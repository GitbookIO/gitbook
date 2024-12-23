!(function () {
    'use strict';
    var t,
        e,
        o,
        r,
        n,
        i,
        a,
        s,
        l = {
            18: function (t, e, o) {
                var r,
                    n =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, o = 1, r = arguments.length; o < r; o++)
                                            for (var n in (e = arguments[o]))
                                                Object.prototype.hasOwnProperty.call(e, n) &&
                                                    (t[n] = e[n]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, o, r) {
                                  void 0 === r && (r = o);
                                  var n = Object.getOwnPropertyDescriptor(e, o);
                                  (n &&
                                      !('get' in n
                                          ? !e.__esModule
                                          : n.writable || n.configurable)) ||
                                      (n = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[o];
                                          },
                                      }),
                                      Object.defineProperty(t, r, n);
                              }
                            : function (t, e, o, r) {
                                  void 0 === r && (r = o), (t[r] = e[o]);
                              }),
                    s =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    l =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var o in t)
                                    'default' !== o &&
                                        Object.prototype.hasOwnProperty.call(t, o) &&
                                        a(e, t, o);
                            return s(e, t), e;
                        },
                    c =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                o = e && t[e],
                                r = 0;
                            if (o) return o.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && r >= t.length && (t = void 0),
                                            { value: t && t[r++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    u =
                        (this && this.__read) ||
                        function (t, e) {
                            var o = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!o) return t;
                            var r,
                                n,
                                i = o.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (o = i.return) && o.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    h =
                        (this && this.__spreadArray) ||
                        function (t, e, o) {
                            if (o || 2 === arguments.length)
                                for (var r, n = 0, i = e.length; n < i; n++)
                                    (!r && n in e) ||
                                        (r || (r = Array.prototype.slice.call(e, 0, n)),
                                        (r[n] = e[n]));
                            return t.concat(r || Array.prototype.slice.call(e));
                        },
                    p =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.setA11yOption =
                        e.setA11yOptions =
                        e.ExplorerHandler =
                        e.ExplorerMathDocumentMixin =
                        e.ExplorerMathItemMixin =
                            void 0);
                var f = o(769),
                    d = o(511),
                    y = o(77),
                    v = o(433),
                    g = o(850),
                    m = l(o(269)),
                    x = l(o(85)),
                    b = o(854),
                    _ = o(367),
                    w = p(o(712));
                function M(t, e) {
                    return (function (t) {
                        function o() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e.explorers = {}),
                                (e.attached = []),
                                (e.restart = []),
                                (e.refocus = !1),
                                (e.savedId = null),
                                e
                            );
                        }
                        return (
                            n(o, t),
                            (o.prototype.explorable = function (t, o) {
                                if (
                                    (void 0 === o && (o = !1), !(this.state() >= f.STATE.EXPLORER))
                                ) {
                                    if (!this.isEscaped && (t.options.enableExplorer || o)) {
                                        var r = this.typesetRoot,
                                            n = e(this.root);
                                        this.savedId &&
                                            (this.typesetRoot.setAttribute(
                                                'sre-explorer-id',
                                                this.savedId,
                                            ),
                                            (this.savedId = null)),
                                            (this.explorers = (function (t, e, o) {
                                                var r,
                                                    n,
                                                    i = {};
                                                try {
                                                    for (
                                                        var a = c(Object.keys(A)), s = a.next();
                                                        !s.done;
                                                        s = a.next()
                                                    ) {
                                                        var l = s.value;
                                                        i[l] = A[l](t, e, o);
                                                    }
                                                } catch (t) {
                                                    r = { error: t };
                                                } finally {
                                                    try {
                                                        s && !s.done && (n = a.return) && n.call(a);
                                                    } finally {
                                                        if (r) throw r.error;
                                                    }
                                                }
                                                return i;
                                            })(t, r, n)),
                                            this.attachExplorers(t);
                                    }
                                    this.state(f.STATE.EXPLORER);
                                }
                            }),
                            (o.prototype.attachExplorers = function (t) {
                                var e, o, r, n;
                                this.attached = [];
                                var i = [];
                                try {
                                    for (
                                        var a = c(Object.keys(this.explorers)), s = a.next();
                                        !s.done;
                                        s = a.next()
                                    ) {
                                        var l = s.value;
                                        (p = this.explorers[l]) instanceof m.AbstractKeyExplorer &&
                                            (p.AddEvents(), (p.stoppable = !1), i.unshift(p)),
                                            t.options.a11y[l]
                                                ? (p.Attach(), this.attached.push(l))
                                                : p.Detach();
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (o = a.return) && o.call(a);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                try {
                                    for (var u = c(i), h = u.next(); !h.done; h = u.next()) {
                                        var p;
                                        if ((p = h.value).attached) {
                                            p.stoppable = !0;
                                            break;
                                        }
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        h && !h.done && (n = u.return) && n.call(u);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (o.prototype.rerender = function (e, o) {
                                var r, n;
                                void 0 === o && (o = f.STATE.RERENDER),
                                    (this.savedId =
                                        this.typesetRoot.getAttribute('sre-explorer-id')),
                                    (this.refocus =
                                        window.document.activeElement === this.typesetRoot);
                                try {
                                    for (
                                        var i = c(this.attached), a = i.next();
                                        !a.done;
                                        a = i.next()
                                    ) {
                                        var s = a.value,
                                            l = this.explorers[s];
                                        l.active && (this.restart.push(s), l.Stop());
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (n = i.return) && n.call(i);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                t.prototype.rerender.call(this, e, o);
                            }),
                            (o.prototype.updateDocument = function (e) {
                                var o = this;
                                t.prototype.updateDocument.call(this, e),
                                    this.refocus && this.typesetRoot.focus(),
                                    this.restart.forEach(function (t) {
                                        return o.explorers[t].Start();
                                    }),
                                    (this.restart = []),
                                    (this.refocus = !1);
                            }),
                            o
                        );
                    })(t);
                }
                function O(t) {
                    var e;
                    return (
                        (e = (function (t) {
                            function e() {
                                for (var e = [], o = 0; o < arguments.length; o++)
                                    e[o] = arguments[o];
                                var r = t.apply(this, h([], u(e), !1)) || this,
                                    n = r.constructor.ProcessBits;
                                n.has('explorer') || n.allocate('explorer');
                                var i = new v.SerializedMmlVisitor(r.mmlFactory),
                                    a = function (t) {
                                        return i.visitTree(t);
                                    };
                                return (
                                    (r.options.MathItem = M(r.options.MathItem, a)),
                                    (r.explorerRegions = S(r)),
                                    r
                                );
                            }
                            return (
                                n(e, t),
                                (e.prototype.explorable = function () {
                                    var t, e;
                                    if (!this.processed.isSet('explorer')) {
                                        if (this.options.enableExplorer)
                                            try {
                                                for (
                                                    var o = c(this.math), r = o.next();
                                                    !r.done;
                                                    r = o.next()
                                                ) {
                                                    r.value.explorable(this);
                                                }
                                            } catch (e) {
                                                t = { error: e };
                                            } finally {
                                                try {
                                                    r && !r.done && (e = o.return) && e.call(o);
                                                } finally {
                                                    if (t) throw t.error;
                                                }
                                            }
                                        this.processed.set('explorer');
                                    }
                                    return this;
                                }),
                                (e.prototype.state = function (e, o) {
                                    return (
                                        void 0 === o && (o = !1),
                                        t.prototype.state.call(this, e, o),
                                        e < f.STATE.EXPLORER && this.processed.clear('explorer'),
                                        this
                                    );
                                }),
                                e
                            );
                        })(t)),
                        (e.OPTIONS = i(i({}, t.OPTIONS), {
                            enableExplorer: !0,
                            renderActions: (0, y.expandable)(
                                i(i({}, t.OPTIONS.renderActions), {
                                    explorable: [f.STATE.EXPLORER],
                                }),
                            ),
                            sre: (0, y.expandable)(i(i({}, t.OPTIONS.sre), { speech: 'shallow' })),
                            a11y: {
                                align: 'top',
                                backgroundColor: 'Blue',
                                backgroundOpacity: 20,
                                braille: !1,
                                flame: !1,
                                foregroundColor: 'Black',
                                foregroundOpacity: 100,
                                highlight: 'None',
                                hover: !1,
                                infoPrefix: !1,
                                infoRole: !1,
                                infoType: !1,
                                keyMagnifier: !1,
                                magnification: 'None',
                                magnify: '400%',
                                mouseMagnifier: !1,
                                speech: !0,
                                subtitles: !0,
                                treeColoring: !1,
                                viewBraille: !1,
                            },
                        })),
                        e
                    );
                }
                function S(t) {
                    return {
                        speechRegion: new _.LiveRegion(t),
                        brailleRegion: new _.LiveRegion(t),
                        magnifier: new _.HoverRegion(t),
                        tooltip1: new _.ToolTip(t),
                        tooltip2: new _.ToolTip(t),
                        tooltip3: new _.ToolTip(t),
                    };
                }
                (0, f.newState)('EXPLORER', 160),
                    (e.ExplorerMathItemMixin = M),
                    (e.ExplorerMathDocumentMixin = O),
                    (e.ExplorerHandler = function (t, e) {
                        return (
                            void 0 === e && (e = null),
                            !t.documentClass.prototype.enrich &&
                                e &&
                                (t = (0, d.EnrichHandler)(t, e)),
                            (t.documentClass = O(t.documentClass)),
                            t
                        );
                    });
                var A = {
                    speech: function (t, e) {
                        for (var o, r = [], n = 2; n < arguments.length; n++)
                            r[n - 2] = arguments[n];
                        var i = (o = m.SpeechExplorer).create.apply(
                            o,
                            h([t, t.explorerRegions.speechRegion, e], u(r), !1),
                        );
                        i.speechGenerator.setOptions({
                            locale: t.options.sre.locale,
                            domain: t.options.sre.domain,
                            style: t.options.sre.style,
                            modality: 'speech',
                        });
                        var a = i.speechGenerator.getOptions().locale;
                        return (
                            a !== w.default.engineSetup().locale &&
                                ((t.options.sre.locale = w.default.engineSetup().locale),
                                i.speechGenerator.setOptions({ locale: t.options.sre.locale })),
                            (i.showRegion = 'subtitles'),
                            i
                        );
                    },
                    braille: function (t, e) {
                        for (var o, r = [], n = 2; n < arguments.length; n++)
                            r[n - 2] = arguments[n];
                        var i = (o = m.SpeechExplorer).create.apply(
                            o,
                            h([t, t.explorerRegions.brailleRegion, e], u(r), !1),
                        );
                        return (
                            i.speechGenerator.setOptions({
                                locale: 'nemeth',
                                domain: 'default',
                                style: 'default',
                                modality: 'braille',
                            }),
                            (i.showRegion = 'viewBraille'),
                            i
                        );
                    },
                    keyMagnifier: function (t, e) {
                        for (var o, r = [], n = 2; n < arguments.length; n++)
                            r[n - 2] = arguments[n];
                        return (o = m.Magnifier).create.apply(
                            o,
                            h([t, t.explorerRegions.magnifier, e], u(r), !1),
                        );
                    },
                    mouseMagnifier: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return x.ContentHoverer.create(
                            t,
                            t.explorerRegions.magnifier,
                            e,
                            function (t) {
                                return t.hasAttribute('data-semantic-type');
                            },
                            function (t) {
                                return t;
                            },
                        );
                    },
                    hover: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return x.FlameHoverer.create(t, null, e);
                    },
                    infoType: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return x.ValueHoverer.create(
                            t,
                            t.explorerRegions.tooltip1,
                            e,
                            function (t) {
                                return t.hasAttribute('data-semantic-type');
                            },
                            function (t) {
                                return t.getAttribute('data-semantic-type');
                            },
                        );
                    },
                    infoRole: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return x.ValueHoverer.create(
                            t,
                            t.explorerRegions.tooltip2,
                            e,
                            function (t) {
                                return t.hasAttribute('data-semantic-role');
                            },
                            function (t) {
                                return t.getAttribute('data-semantic-role');
                            },
                        );
                    },
                    infoPrefix: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return x.ValueHoverer.create(
                            t,
                            t.explorerRegions.tooltip3,
                            e,
                            function (t) {
                                return t.hasAttribute('data-semantic-prefix');
                            },
                            function (t) {
                                return t.getAttribute('data-semantic-prefix');
                            },
                        );
                    },
                    flame: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return b.FlameColorer.create(t, null, e);
                    },
                    treeColoring: function (t, e) {
                        for (var o = [], r = 2; r < arguments.length; r++) o[r - 2] = arguments[r];
                        return b.TreeColorer.create.apply(b.TreeColorer, h([t, null, e], u(o), !1));
                    },
                };
                function E(t, e, o) {
                    switch (e) {
                        case 'magnification':
                            switch (o) {
                                case 'None':
                                    (t.options.a11y.magnification = o),
                                        (t.options.a11y.keyMagnifier = !1),
                                        (t.options.a11y.mouseMagnifier = !1);
                                    break;
                                case 'Keyboard':
                                    (t.options.a11y.magnification = o),
                                        (t.options.a11y.keyMagnifier = !0),
                                        (t.options.a11y.mouseMagnifier = !1);
                                    break;
                                case 'Mouse':
                                    (t.options.a11y.magnification = o),
                                        (t.options.a11y.keyMagnifier = !1),
                                        (t.options.a11y.mouseMagnifier = !0);
                            }
                            break;
                        case 'highlight':
                            switch (o) {
                                case 'None':
                                    (t.options.a11y.highlight = o),
                                        (t.options.a11y.hover = !1),
                                        (t.options.a11y.flame = !1);
                                    break;
                                case 'Hover':
                                    (t.options.a11y.highlight = o),
                                        (t.options.a11y.hover = !0),
                                        (t.options.a11y.flame = !1);
                                    break;
                                case 'Flame':
                                    (t.options.a11y.highlight = o),
                                        (t.options.a11y.hover = !1),
                                        (t.options.a11y.flame = !0);
                            }
                            break;
                        default:
                            t.options.a11y[e] = o;
                    }
                }
                (e.setA11yOptions = function (t, e) {
                    var o,
                        r,
                        n = w.default.engineSetup();
                    for (var i in e)
                        void 0 === t.options.a11y[i]
                            ? void 0 !== n[i] && (t.options.sre[i] = e[i])
                            : (E(t, i, e[i]), 'locale' === i && (t.options.sre[i] = e[i]));
                    try {
                        for (var a = c(t.math), s = a.next(); !s.done; s = a.next()) {
                            s.value.attachExplorers(t);
                        }
                    } catch (t) {
                        o = { error: t };
                    } finally {
                        try {
                            s && !s.done && (r = a.return) && r.call(a);
                        } finally {
                            if (o) throw o.error;
                        }
                    }
                }),
                    (e.setA11yOption = E);
                var C = {},
                    k = function (t, e) {
                        var o,
                            r,
                            n = w.default.clearspeakPreferences.getLocalePreferences()[e];
                        if (!n) {
                            var i = t.findID('Accessibility', 'Speech', 'Clearspeak');
                            return i && i.disable(), null;
                        }
                        !(function (t, e) {
                            var o,
                                r,
                                n = t.pool.lookup('speechRules'),
                                i = function (e) {
                                    if (C[e]) return 'continue';
                                    t.factory.get('variable')(
                                        t.factory,
                                        {
                                            name: 'csprf_' + e,
                                            setter: function (t) {
                                                (C[e] = t),
                                                    n.setValue(
                                                        'clearspeak-' +
                                                            w.default.clearspeakPreferences.addPreference(
                                                                w.default.clearspeakStyle(),
                                                                e,
                                                                t,
                                                            ),
                                                    );
                                            },
                                            getter: function () {
                                                return C[e] || 'Auto';
                                            },
                                        },
                                        t.pool,
                                    );
                                };
                            try {
                                for (var a = c(e), s = a.next(); !s.done; s = a.next()) i(s.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                        })(t, Object.keys(n));
                        var a = [],
                            s = function (t) {
                                a.push({
                                    title: t,
                                    values: n[t].map(function (e) {
                                        return e.replace(RegExp('^' + t + '_'), '');
                                    }),
                                    variable: 'csprf_' + t,
                                });
                            };
                        try {
                            for (
                                var l = c(Object.getOwnPropertyNames(n)), u = l.next();
                                !u.done;
                                u = l.next()
                            ) {
                                s(u.value);
                            }
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                u && !u.done && (r = l.return) && r.call(l);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        var h = t.factory.get('selectionBox')(
                            t.factory,
                            {
                                title: 'Clearspeak Preferences',
                                signature: '',
                                order: 'alphabetic',
                                grid: 'square',
                                selections: a,
                            },
                            t,
                        );
                        return {
                            type: 'command',
                            id: 'ClearspeakPreferences',
                            content: 'Select Preferences',
                            action: function () {
                                return h.post(0, 0);
                            },
                        };
                    };
                g.MJContextMenu.DynamicSubmenus.set('Clearspeak', function (t, e) {
                    var o = t.pool.lookup('locale').getValue(),
                        r = k(t, o),
                        n = [];
                    try {
                        n = w.default.clearspeakPreferences.smartPreferences(t.mathItem, o);
                    } catch (t) {
                        console.log(t);
                    }
                    return (
                        r && n.splice(2, 0, r),
                        t.factory.get('subMenu')(t.factory, { items: n, id: 'Clearspeak' }, e)
                    );
                });
                g.MJContextMenu.DynamicSubmenus.set('A11yLanguage', function (t, e) {
                    var o,
                        r,
                        n = [];
                    try {
                        for (
                            var i = c(w.default.locales.keys()), a = i.next();
                            !a.done;
                            a = i.next()
                        ) {
                            var s = a.value;
                            'nemeth' !== s &&
                                n.push({
                                    type: 'radio',
                                    id: s,
                                    content: w.default.locales.get(s) || s,
                                    variable: 'locale',
                                });
                        }
                    } catch (t) {
                        o = { error: t };
                    } finally {
                        try {
                            a && !a.done && (r = i.return) && r.call(i);
                        } finally {
                            if (o) throw o.error;
                        }
                    }
                    return (
                        n.sort(function (t, e) {
                            return t.content.localeCompare(e.content, 'en');
                        }),
                        t.factory.get('subMenu')(t.factory, { items: n, id: 'Language' }, e)
                    );
                });
            },
            724: function (t, e, o) {
                var r =
                        (this && this.__read) ||
                        function (t, e) {
                            var o = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!o) return t;
                            var r,
                                n,
                                i = o.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (o = i.return) && o.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        },
                    n =
                        (this && this.__spreadArray) ||
                        function (t, e, o) {
                            if (o || 2 === arguments.length)
                                for (var r, n = 0, i = e.length; n < i; n++)
                                    (!r && n in e) ||
                                        (r || (r = Array.prototype.slice.call(e, 0, n)),
                                        (r[n] = e[n]));
                            return t.concat(r || Array.prototype.slice.call(e));
                        },
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                o = e && t[e],
                                r = 0;
                            if (o) return o.call(t);
                            if (t && 'number' == typeof t.length)
                                return {
                                    next: function () {
                                        return (
                                            t && r >= t.length && (t = void 0),
                                            { value: t && t[r++], done: !t }
                                        );
                                    },
                                };
                            throw new TypeError(
                                e ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        },
                    a =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractExplorer = void 0);
                var s = a(o(712)),
                    l = (function () {
                        function t(t, e, o) {
                            for (var r = [], n = 3; n < arguments.length; n++)
                                r[n - 3] = arguments[n];
                            (this.document = t),
                                (this.region = e),
                                (this.node = o),
                                (this.stoppable = !0),
                                (this.events = []),
                                (this.highlighter = this.getHighlighter()),
                                (this._active = !1);
                        }
                        return (
                            (t.stopEvent = function (t) {
                                t.preventDefault ? t.preventDefault() : (t.returnValue = !1),
                                    t.stopImmediatePropagation
                                        ? t.stopImmediatePropagation()
                                        : t.stopPropagation && t.stopPropagation(),
                                    (t.cancelBubble = !0);
                            }),
                            (t.create = function (t, e, o) {
                                for (var i = [], a = 3; a < arguments.length; a++)
                                    i[a - 3] = arguments[a];
                                var s = new (this.bind.apply(
                                    this,
                                    n([void 0, t, e, o], r(i), !1),
                                ))();
                                return s;
                            }),
                            (t.prototype.Events = function () {
                                return this.events;
                            }),
                            Object.defineProperty(t.prototype, 'active', {
                                get: function () {
                                    return this._active;
                                },
                                set: function (t) {
                                    this._active = t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.Attach = function () {
                                this.AddEvents();
                            }),
                            (t.prototype.Detach = function () {
                                this.RemoveEvents();
                            }),
                            (t.prototype.Start = function () {
                                (this.highlighter = this.getHighlighter()), (this.active = !0);
                            }),
                            (t.prototype.Stop = function () {
                                this.active &&
                                    (this.region.Clear(), this.region.Hide(), (this.active = !1));
                            }),
                            (t.prototype.AddEvents = function () {
                                var t, e;
                                try {
                                    for (
                                        var o = i(this.events), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var a = r(n.value, 2),
                                            s = a[0],
                                            l = a[1];
                                        this.node.addEventListener(s, l);
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        n && !n.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }),
                            (t.prototype.RemoveEvents = function () {
                                var t, e;
                                try {
                                    for (
                                        var o = i(this.events), n = o.next();
                                        !n.done;
                                        n = o.next()
                                    ) {
                                        var a = r(n.value, 2),
                                            s = a[0],
                                            l = a[1];
                                        this.node.removeEventListener(s, l);
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        n && !n.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }),
                            (t.prototype.Update = function (t) {
                                void 0 === t && (t = !1);
                            }),
                            (t.prototype.getHighlighter = function () {
                                var t = this.document.options.a11y,
                                    e = {
                                        color: t.foregroundColor.toLowerCase(),
                                        alpha: t.foregroundOpacity / 100,
                                    },
                                    o = {
                                        color: t.backgroundColor.toLowerCase(),
                                        alpha: t.backgroundOpacity / 100,
                                    };
                                return s.default.getHighlighter(o, e, {
                                    renderer: this.document.outputJax.name,
                                    browser: 'v3',
                                });
                            }),
                            (t.prototype.stopEvent = function (e) {
                                this.stoppable && t.stopEvent(e);
                            }),
                            t
                        );
                    })();
                e.AbstractExplorer = l;
            },
            269: function (t, e, o) {
                var r,
                    n =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    i =
                        (this && this.__awaiter) ||
                        function (t, e, o, r) {
                            return new (o || (o = Promise))(function (n, i) {
                                function a(t) {
                                    try {
                                        l(r.next(t));
                                    } catch (t) {
                                        i(t);
                                    }
                                }
                                function s(t) {
                                    try {
                                        l(r.throw(t));
                                    } catch (t) {
                                        i(t);
                                    }
                                }
                                function l(t) {
                                    var e;
                                    t.done
                                        ? n(t.value)
                                        : ((e = t.value),
                                          e instanceof o
                                              ? e
                                              : new o(function (t) {
                                                    t(e);
                                                })).then(a, s);
                                }
                                l((r = r.apply(t, e || [])).next());
                            });
                        },
                    a =
                        (this && this.__generator) ||
                        function (t, e) {
                            var o,
                                r,
                                n,
                                i,
                                a = {
                                    label: 0,
                                    sent: function () {
                                        if (1 & n[0]) throw n[1];
                                        return n[1];
                                    },
                                    trys: [],
                                    ops: [],
                                };
                            return (
                                (i = { next: s(0), throw: s(1), return: s(2) }),
                                'function' == typeof Symbol &&
                                    (i[Symbol.iterator] = function () {
                                        return this;
                                    }),
                                i
                            );
                            function s(i) {
                                return function (s) {
                                    return (function (i) {
                                        if (o)
                                            throw new TypeError('Generator is already executing.');
                                        for (; a; )
                                            try {
                                                if (
                                                    ((o = 1),
                                                    r &&
                                                        (n =
                                                            2 & i[0]
                                                                ? r.return
                                                                : i[0]
                                                                  ? r.throw ||
                                                                    ((n = r.return) && n.call(r), 0)
                                                                  : r.next) &&
                                                        !(n = n.call(r, i[1])).done)
                                                )
                                                    return n;
                                                switch (
                                                    ((r = 0), n && (i = [2 & i[0], n.value]), i[0])
                                                ) {
                                                    case 0:
                                                    case 1:
                                                        n = i;
                                                        break;
                                                    case 4:
                                                        return a.label++, { value: i[1], done: !1 };
                                                    case 5:
                                                        a.label++, (r = i[1]), (i = [0]);
                                                        continue;
                                                    case 7:
                                                        (i = a.ops.pop()), a.trys.pop();
                                                        continue;
                                                    default:
                                                        if (
                                                            !((n = a.trys),
                                                            (n = n.length > 0 && n[n.length - 1]) ||
                                                                (6 !== i[0] && 2 !== i[0]))
                                                        ) {
                                                            a = 0;
                                                            continue;
                                                        }
                                                        if (
                                                            3 === i[0] &&
                                                            (!n || (i[1] > n[0] && i[1] < n[3]))
                                                        ) {
                                                            a.label = i[1];
                                                            break;
                                                        }
                                                        if (6 === i[0] && a.label < n[1]) {
                                                            (a.label = n[1]), (n = i);
                                                            break;
                                                        }
                                                        if (n && a.label < n[2]) {
                                                            (a.label = n[2]), a.ops.push(i);
                                                            break;
                                                        }
                                                        n[2] && a.ops.pop(), a.trys.pop();
                                                        continue;
                                                }
                                                i = e.call(t, a);
                                            } catch (t) {
                                                (i = [6, t]), (r = 0);
                                            } finally {
                                                o = n = 0;
                                            }
                                        if (5 & i[0]) throw i[1];
                                        return { value: i[0] ? i[1] : void 0, done: !0 };
                                    })([i, s]);
                                };
                            }
                        },
                    s =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Magnifier = e.SpeechExplorer = e.AbstractKeyExplorer = void 0);
                var l = o(724),
                    c = s(o(712)),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e.attached = !1),
                                (e.eventsAttached = !1),
                                (e.events = t.prototype.Events.call(e).concat([
                                    ['keydown', e.KeyDown.bind(e)],
                                    ['focusin', e.FocusIn.bind(e)],
                                    ['focusout', e.FocusOut.bind(e)],
                                ])),
                                (e.oldIndex = null),
                                e
                            );
                        }
                        return (
                            n(e, t),
                            (e.prototype.FocusIn = function (t) {}),
                            (e.prototype.FocusOut = function (t) {
                                this.Stop();
                            }),
                            (e.prototype.Update = function (t) {
                                if ((void 0 === t && (t = !1), this.active || t)) {
                                    this.highlighter.unhighlight();
                                    var e = this.walker.getFocus(!0).getNodes();
                                    e.length ||
                                        (this.walker.refocus(),
                                        (e = this.walker.getFocus().getNodes())),
                                        this.highlighter.highlight(e);
                                }
                            }),
                            (e.prototype.Attach = function () {
                                t.prototype.Attach.call(this),
                                    (this.attached = !0),
                                    (this.oldIndex = this.node.tabIndex),
                                    (this.node.tabIndex = 1),
                                    this.node.setAttribute('role', 'application');
                            }),
                            (e.prototype.AddEvents = function () {
                                this.eventsAttached ||
                                    (t.prototype.AddEvents.call(this), (this.eventsAttached = !0));
                            }),
                            (e.prototype.Detach = function () {
                                this.active &&
                                    ((this.node.tabIndex = this.oldIndex),
                                    (this.oldIndex = null),
                                    this.node.removeAttribute('role')),
                                    (this.attached = !1);
                            }),
                            (e.prototype.Stop = function () {
                                this.active &&
                                    (this.highlighter.unhighlight(), this.walker.deactivate()),
                                    t.prototype.Stop.call(this);
                            }),
                            e
                        );
                    })(l.AbstractExplorer);
                e.AbstractKeyExplorer = u;
                var h = (function (t) {
                    function e(e, o, r, n) {
                        var i = t.call(this, e, o, r) || this;
                        return (
                            (i.document = e),
                            (i.region = o),
                            (i.node = r),
                            (i.mml = n),
                            (i.showRegion = 'subtitles'),
                            (i.init = !1),
                            (i.restarted = !1),
                            i.initWalker(),
                            i
                        );
                    }
                    return (
                        n(e, t),
                        (e.prototype.Start = function () {
                            var o = this;
                            if (this.attached) {
                                var r = this.getOptions();
                                if (!this.init)
                                    return (
                                        (this.init = !0),
                                        void (e.updatePromise = e.updatePromise
                                            .then(function () {
                                                return i(o, void 0, void 0, function () {
                                                    var t = this;
                                                    return a(this, function (e) {
                                                        return [
                                                            2,
                                                            c.default
                                                                .sreReady()
                                                                .then(function () {
                                                                    return c.default.setupEngine({
                                                                        locale: r.locale,
                                                                    });
                                                                })
                                                                .then(function () {
                                                                    t.Speech(t.walker), t.Start();
                                                                }),
                                                        ];
                                                    });
                                                });
                                            })
                                            .catch(function (t) {
                                                return console.log(t.message);
                                            }))
                                    );
                                t.prototype.Start.call(this),
                                    (this.speechGenerator = c.default.getSpeechGenerator('Direct')),
                                    this.speechGenerator.setOptions(r),
                                    (this.walker = c.default.getWalker(
                                        'table',
                                        this.node,
                                        this.speechGenerator,
                                        this.highlighter,
                                        this.mml,
                                    )),
                                    this.walker.activate(),
                                    this.Update(),
                                    this.document.options.a11y[this.showRegion] &&
                                        e.updatePromise.then(function () {
                                            return o.region.Show(o.node, o.highlighter);
                                        }),
                                    (this.restarted = !0);
                            }
                        }),
                        (e.prototype.Update = function (o) {
                            var r = this;
                            void 0 === o && (o = !1), t.prototype.Update.call(this, o);
                            var n = this.speechGenerator.getOptions();
                            'speech' === n.modality &&
                                ((this.document.options.sre.domain = n.domain),
                                (this.document.options.sre.style = n.style),
                                (this.document.options.a11y.speechRules =
                                    n.domain + '-' + n.style)),
                                (e.updatePromise = e.updatePromise.then(function () {
                                    return i(r, void 0, void 0, function () {
                                        var t = this;
                                        return a(this, function (e) {
                                            return [
                                                2,
                                                c.default
                                                    .sreReady()
                                                    .then(function () {
                                                        return c.default.setupEngine({
                                                            modality: n.modality,
                                                            locale: n.locale,
                                                        });
                                                    })
                                                    .then(function () {
                                                        return t.region.Update(t.walker.speech());
                                                    }),
                                            ];
                                        });
                                    });
                                }));
                        }),
                        (e.prototype.Speech = function (t) {
                            var o = this;
                            e.updatePromise.then(function () {
                                t.speech(),
                                    o.node.setAttribute('hasspeech', 'true'),
                                    o.Update(),
                                    o.restarted &&
                                        o.document.options.a11y[o.showRegion] &&
                                        o.region.Show(o.node, o.highlighter);
                            });
                        }),
                        (e.prototype.KeyDown = function (t) {
                            var e = t.keyCode;
                            if (((this.walker.modifier = t.shiftKey), 27 === e))
                                return this.Stop(), void this.stopEvent(t);
                            if (this.active) {
                                if ((this.Move(e), this.triggerLink(e))) return;
                                this.stopEvent(t);
                            } else
                                ((32 === e && t.shiftKey) || 13 === e) &&
                                    (this.Start(), this.stopEvent(t));
                        }),
                        (e.prototype.triggerLink = function (t) {
                            var e, o;
                            if (13 !== t) return !1;
                            var r =
                                null === (e = this.walker.getFocus().getNodes()) || void 0 === e
                                    ? void 0
                                    : e[0];
                            return (
                                !!(null ===
                                    (o =
                                        null == r
                                            ? void 0
                                            : r.getAttribute('data-semantic-postfix')) ||
                                void 0 === o
                                    ? void 0
                                    : o.match(/(^| )link($| )/)) &&
                                (r.parentNode.dispatchEvent(new MouseEvent('click')), !0)
                            );
                        }),
                        (e.prototype.Move = function (t) {
                            this.walker.move(t), this.Update();
                        }),
                        (e.prototype.initWalker = function () {
                            this.speechGenerator = c.default.getSpeechGenerator('Tree');
                            var t = c.default.getWalker(
                                'dummy',
                                this.node,
                                this.speechGenerator,
                                this.highlighter,
                                this.mml,
                            );
                            this.walker = t;
                        }),
                        (e.prototype.getOptions = function () {
                            var t = this.speechGenerator.getOptions(),
                                e = this.document.options.sre;
                            return (
                                'speech' !== t.modality ||
                                    (t.locale === e.locale &&
                                        t.domain === e.domain &&
                                        t.style === e.style) ||
                                    ((t.domain = e.domain),
                                    (t.style = e.style),
                                    (t.locale = e.locale),
                                    this.walker.update(t)),
                                t
                            );
                        }),
                        (e.updatePromise = Promise.resolve()),
                        e
                    );
                })(u);
                e.SpeechExplorer = h;
                var p = (function (t) {
                    function e(e, o, r, n) {
                        var i = t.call(this, e, o, r) || this;
                        return (
                            (i.document = e),
                            (i.region = o),
                            (i.node = r),
                            (i.mml = n),
                            (i.walker = c.default.getWalker(
                                'table',
                                i.node,
                                c.default.getSpeechGenerator('Dummy'),
                                i.highlighter,
                                i.mml,
                            )),
                            i
                        );
                    }
                    return (
                        n(e, t),
                        (e.prototype.Update = function (e) {
                            void 0 === e && (e = !1),
                                t.prototype.Update.call(this, e),
                                this.showFocus();
                        }),
                        (e.prototype.Start = function () {
                            t.prototype.Start.call(this),
                                this.attached &&
                                    (this.region.Show(this.node, this.highlighter),
                                    this.walker.activate(),
                                    this.Update());
                        }),
                        (e.prototype.showFocus = function () {
                            var t = this.walker.getFocus().getNodes()[0];
                            this.region.Show(t, this.highlighter);
                        }),
                        (e.prototype.Move = function (t) {
                            this.walker.move(t) && this.Update();
                        }),
                        (e.prototype.KeyDown = function (t) {
                            var e = t.keyCode;
                            return (
                                (this.walker.modifier = t.shiftKey),
                                27 === e
                                    ? (this.Stop(), void this.stopEvent(t))
                                    : this.active && 13 !== e
                                      ? (this.Move(e), void this.stopEvent(t))
                                      : void (
                                            ((32 === e && t.shiftKey) || 13 === e) &&
                                            (this.Start(), this.stopEvent(t))
                                        )
                            );
                        }),
                        e
                    );
                })(u);
                e.Magnifier = p;
            },
            85: function (t, e, o) {
                var r,
                    n =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var o = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!o) return t;
                            var r,
                                n,
                                i = o.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (o = i.return) && o.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.FlameHoverer =
                        e.ContentHoverer =
                        e.ValueHoverer =
                        e.Hoverer =
                        e.AbstractMouseExplorer =
                            void 0);
                var a = o(367),
                    s = o(724);
                o(712);
                var l = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (
                            (e.events = t.prototype.Events.call(e).concat([
                                ['mouseover', e.MouseOver.bind(e)],
                                ['mouseout', e.MouseOut.bind(e)],
                            ])),
                            e
                        );
                    }
                    return (
                        n(e, t),
                        (e.prototype.MouseOver = function (t) {
                            this.Start();
                        }),
                        (e.prototype.MouseOut = function (t) {
                            this.Stop();
                        }),
                        e
                    );
                })(s.AbstractExplorer);
                e.AbstractMouseExplorer = l;
                var c = (function (t) {
                    function e(e, o, r, n, i) {
                        var a = t.call(this, e, o, r) || this;
                        return (
                            (a.document = e),
                            (a.region = o),
                            (a.node = r),
                            (a.nodeQuery = n),
                            (a.nodeAccess = i),
                            a
                        );
                    }
                    return (
                        n(e, t),
                        (e.prototype.MouseOut = function (e) {
                            (e.clientX === this.coord[0] && e.clientY === this.coord[1]) ||
                                (this.highlighter.unhighlight(),
                                this.region.Hide(),
                                t.prototype.MouseOut.call(this, e));
                        }),
                        (e.prototype.MouseOver = function (e) {
                            t.prototype.MouseOver.call(this, e);
                            var o = e.target;
                            this.coord = [e.clientX, e.clientY];
                            var r = i(this.getNode(o), 2),
                                n = r[0],
                                a = r[1];
                            n &&
                                (this.highlighter.unhighlight(),
                                this.highlighter.highlight([n]),
                                this.region.Update(a),
                                this.region.Show(n, this.highlighter));
                        }),
                        (e.prototype.getNode = function (t) {
                            for (var e = t; t && t !== this.node; ) {
                                if (this.nodeQuery(t)) return [t, this.nodeAccess(t)];
                                t = t.parentNode;
                            }
                            for (t = e; t; ) {
                                if (this.nodeQuery(t)) return [t, this.nodeAccess(t)];
                                var o = t.childNodes[0];
                                t = o && 'defs' === o.tagName ? t.childNodes[1] : o;
                            }
                            return [null, null];
                        }),
                        e
                    );
                })(l);
                e.Hoverer = c;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return n(e, t), e;
                })(c);
                e.ValueHoverer = u;
                var h = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return n(e, t), e;
                })(c);
                e.ContentHoverer = h;
                var p = (function (t) {
                    function e(e, o, r) {
                        var n =
                            t.call(
                                this,
                                e,
                                new a.DummyRegion(e),
                                r,
                                function (t) {
                                    return n.highlighter.isMactionNode(t);
                                },
                                function () {},
                            ) || this;
                        return (n.document = e), (n.node = r), n;
                    }
                    return n(e, t), e;
                })(c);
                e.FlameHoverer = p;
            },
            367: function (t, e, o) {
                var r,
                    n,
                    i,
                    a,
                    s =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.HoverRegion =
                        e.LiveRegion =
                        e.ToolTip =
                        e.StringRegion =
                        e.DummyRegion =
                        e.AbstractRegion =
                            void 0);
                var l = o(888),
                    c = (function () {
                        function t(t) {
                            (this.document = t),
                                (this.CLASS = this.constructor),
                                this.AddStyles(),
                                this.AddElement();
                        }
                        return (
                            (t.prototype.AddStyles = function () {
                                if (!this.CLASS.styleAdded) {
                                    var t = this.document.adaptor.node('style');
                                    (t.innerHTML = this.CLASS.style.cssText),
                                        this.document.adaptor
                                            .head(this.document.adaptor.document)
                                            .appendChild(t),
                                        (this.CLASS.styleAdded = !0);
                                }
                            }),
                            (t.prototype.AddElement = function () {
                                var t = this.document.adaptor.node('div');
                                t.classList.add(this.CLASS.className),
                                    (t.style.backgroundColor = 'white'),
                                    (this.div = t),
                                    (this.inner = this.document.adaptor.node('div')),
                                    this.div.appendChild(this.inner),
                                    this.document.adaptor
                                        .body(this.document.adaptor.document)
                                        .appendChild(this.div);
                            }),
                            (t.prototype.Show = function (t, e) {
                                this.position(t),
                                    this.highlight(e),
                                    this.div.classList.add(this.CLASS.className + '_Show');
                            }),
                            (t.prototype.Hide = function () {
                                this.div.classList.remove(this.CLASS.className + '_Show');
                            }),
                            (t.prototype.stackRegions = function (t) {
                                for (
                                    var e = t.getBoundingClientRect(),
                                        o = 0,
                                        r = Number.POSITIVE_INFINITY,
                                        n = this.document.adaptor.document.getElementsByClassName(
                                            this.CLASS.className + '_Show',
                                        ),
                                        i = 0,
                                        a = void 0;
                                    (a = n[i]);
                                    i++
                                )
                                    a !== this.div &&
                                        ((o = Math.max(a.getBoundingClientRect().bottom, o)),
                                        (r = Math.min(a.getBoundingClientRect().left, r)));
                                var s = (o || e.bottom + 10) + window.pageYOffset,
                                    l =
                                        (r < Number.POSITIVE_INFINITY ? r : e.left) +
                                        window.pageXOffset;
                                (this.div.style.top = s + 'px'), (this.div.style.left = l + 'px');
                            }),
                            (t.styleAdded = !1),
                            t
                        );
                    })();
                e.AbstractRegion = c;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        s(e, t),
                        (e.prototype.Clear = function () {}),
                        (e.prototype.Update = function () {}),
                        (e.prototype.Hide = function () {}),
                        (e.prototype.Show = function () {}),
                        (e.prototype.AddElement = function () {}),
                        (e.prototype.AddStyles = function () {}),
                        (e.prototype.position = function () {}),
                        (e.prototype.highlight = function (t) {}),
                        e
                    );
                })(c);
                e.DummyRegion = u;
                var h = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        s(e, t),
                        (e.prototype.Clear = function () {
                            this.Update(''),
                                (this.inner.style.top = ''),
                                (this.inner.style.backgroundColor = '');
                        }),
                        (e.prototype.Update = function (t) {
                            (this.inner.textContent = ''), (this.inner.textContent = t);
                        }),
                        (e.prototype.position = function (t) {
                            this.stackRegions(t);
                        }),
                        (e.prototype.highlight = function (t) {
                            var e = t.colorString();
                            (this.inner.style.backgroundColor = e.background),
                                (this.inner.style.color = e.foreground);
                        }),
                        e
                    );
                })(c);
                e.StringRegion = h;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        s(e, t),
                        (e.className = 'MJX_ToolTip'),
                        (e.style = new l.CssStyles(
                            (((n = {})['.' + e.className] = {
                                position: 'absolute',
                                display: 'inline-block',
                                height: '1px',
                                width: '1px',
                            }),
                            (n['.' + e.className + '_Show'] = {
                                width: 'auto',
                                height: 'auto',
                                opacity: 1,
                                'text-align': 'center',
                                'border-radius': '6px',
                                padding: '0px 0px',
                                'border-bottom': '1px dotted black',
                                position: 'absolute',
                                'z-index': 202,
                            }),
                            n),
                        )),
                        e
                    );
                })(h);
                e.ToolTip = p;
                var f = (function (t) {
                    function e(e) {
                        var o = t.call(this, e) || this;
                        return (o.document = e), o.div.setAttribute('aria-live', 'assertive'), o;
                    }
                    return (
                        s(e, t),
                        (e.className = 'MJX_LiveRegion'),
                        (e.style = new l.CssStyles(
                            (((i = {})['.' + e.className] = {
                                position: 'absolute',
                                top: '0',
                                height: '1px',
                                width: '1px',
                                padding: '1px',
                                overflow: 'hidden',
                            }),
                            (i['.' + e.className + '_Show'] = {
                                top: '0',
                                position: 'absolute',
                                width: 'auto',
                                height: 'auto',
                                padding: '0px 0px',
                                opacity: 1,
                                'z-index': '202',
                                left: 0,
                                right: 0,
                                margin: '0 auto',
                                'background-color': 'rgba(0, 0, 255, 0.2)',
                                'box-shadow': '0px 10px 20px #888',
                                border: '2px solid #CCCCCC',
                            }),
                            i),
                        )),
                        e
                    );
                })(h);
                e.LiveRegion = f;
                var d = (function (t) {
                    function e(e) {
                        var o = t.call(this, e) || this;
                        return (o.document = e), (o.inner.style.lineHeight = '0'), o;
                    }
                    return (
                        s(e, t),
                        (e.prototype.position = function (t) {
                            var e,
                                o = t.getBoundingClientRect(),
                                r = this.div.getBoundingClientRect(),
                                n = o.left + o.width / 2 - r.width / 2;
                            switch (
                                ((n = n < 0 ? 0 : n),
                                (n += window.pageXOffset),
                                this.document.options.a11y.align)
                            ) {
                                case 'top':
                                    e = o.top - r.height - 10;
                                    break;
                                case 'bottom':
                                    e = o.bottom + 10;
                                    break;
                                default:
                                    e = o.top + o.height / 2 - r.height / 2;
                            }
                            (e = (e += window.pageYOffset) < 0 ? 0 : e),
                                (this.div.style.top = e + 'px'),
                                (this.div.style.left = n + 'px');
                        }),
                        (e.prototype.highlight = function (t) {
                            if (
                                !this.inner.firstChild ||
                                this.inner.firstChild.hasAttribute('sre-highlight')
                            ) {
                                var e = t.colorString();
                                (this.inner.style.backgroundColor = e.background),
                                    (this.inner.style.color = e.foreground);
                            }
                        }),
                        (e.prototype.Show = function (e, o) {
                            (this.div.style.fontSize = this.document.options.a11y.magnify),
                                this.Update(e),
                                t.prototype.Show.call(this, e, o);
                        }),
                        (e.prototype.Clear = function () {
                            (this.inner.textContent = ''),
                                (this.inner.style.top = ''),
                                (this.inner.style.backgroundColor = '');
                        }),
                        (e.prototype.Update = function (t) {
                            this.Clear();
                            var e = this.cloneNode(t);
                            this.inner.appendChild(e);
                        }),
                        (e.prototype.cloneNode = function (t) {
                            var e = t.cloneNode(!0);
                            if ('MJX-CONTAINER' !== e.nodeName) {
                                'g' !== e.nodeName &&
                                    (e.style.marginLeft = e.style.marginRight = '0');
                                for (var o = t; o && 'MJX-CONTAINER' !== o.nodeName; )
                                    o = o.parentNode;
                                if ('MJX-MATH' !== e.nodeName && 'svg' !== e.nodeName)
                                    if (
                                        'svg' ===
                                        (e = o.firstChild.cloneNode(!1).appendChild(e).parentNode)
                                            .nodeName
                                    ) {
                                        e.firstChild.setAttribute(
                                            'transform',
                                            'matrix(1 0 0 -1 0 0)',
                                        );
                                        var r = parseFloat(e.getAttribute('viewBox').split(/ /)[2]),
                                            n = parseFloat(e.getAttribute('width')),
                                            i = t.getBBox(),
                                            a = i.x,
                                            s = i.y,
                                            l = i.width,
                                            c = i.height;
                                        e.setAttribute('viewBox', [a, -(s + c), l, c].join(' ')),
                                            e.removeAttribute('style'),
                                            e.setAttribute('width', (n / r) * l + 'ex'),
                                            e.setAttribute('height', (n / r) * c + 'ex'),
                                            o.setAttribute('sre-highlight', 'false');
                                    }
                                (e = o.cloneNode(!1).appendChild(e).parentNode).style.margin = '0';
                            }
                            return e;
                        }),
                        (e.className = 'MJX_HoverRegion'),
                        (e.style = new l.CssStyles(
                            (((a = {})['.' + e.className] = {
                                position: 'absolute',
                                height: '1px',
                                width: '1px',
                                padding: '1px',
                                overflow: 'hidden',
                            }),
                            (a['.' + e.className + '_Show'] = {
                                position: 'absolute',
                                width: 'max-content',
                                height: 'auto',
                                padding: '0px 0px',
                                opacity: 1,
                                'z-index': '202',
                                margin: '0 auto',
                                'background-color': 'rgba(0, 0, 255, 0.2)',
                                'box-shadow': '0px 10px 20px #888',
                                border: '2px solid #CCCCCC',
                            }),
                            a),
                        )),
                        e
                    );
                })(c);
                e.HoverRegion = d;
            },
            854: function (t, e, o) {
                var r,
                    n =
                        (this && this.__extends) ||
                        ((r = function (t, e) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (t, e) {
                                            t.__proto__ = e;
                                        }) ||
                                    function (t, e) {
                                        for (var o in e)
                                            Object.prototype.hasOwnProperty.call(e, o) &&
                                                (t[o] = e[o]);
                                    }),
                                r(t, e)
                            );
                        }),
                        function (t, e) {
                            if ('function' != typeof e && null !== e)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(e) +
                                        ' is not a constructor or null',
                                );
                            function o() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((o.prototype = e.prototype), new o()));
                        }),
                    i =
                        (this && this.__importDefault) ||
                        function (t) {
                            return t && t.__esModule ? t : { default: t };
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.TreeColorer = e.FlameColorer = e.AbstractTreeExplorer = void 0);
                var a = o(724),
                    s = i(o(712)),
                    l = (function (t) {
                        function e(e, o, r, n) {
                            var i = t.call(this, e, null, r) || this;
                            return (
                                (i.document = e),
                                (i.region = o),
                                (i.node = r),
                                (i.mml = n),
                                (i.stoppable = !1),
                                i
                            );
                        }
                        return (
                            n(e, t),
                            (e.prototype.Attach = function () {
                                t.prototype.Attach.call(this), this.Start();
                            }),
                            (e.prototype.Detach = function () {
                                this.Stop(), t.prototype.Detach.call(this);
                            }),
                            e
                        );
                    })(a.AbstractExplorer);
                e.AbstractTreeExplorer = l;
                var c = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.Start = function () {
                            this.active ||
                                ((this.active = !0), this.highlighter.highlightAll(this.node));
                        }),
                        (e.prototype.Stop = function () {
                            this.active && this.highlighter.unhighlightAll(), (this.active = !1);
                        }),
                        e
                    );
                })(l);
                e.FlameColorer = c;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.Start = function () {
                            if (!this.active) {
                                this.active = !0;
                                var t = s.default.getSpeechGenerator('Color');
                                this.node.hasAttribute('hasforegroundcolor') ||
                                    (t.generateSpeech(this.node, this.mml),
                                    this.node.setAttribute('hasforegroundcolor', 'true')),
                                    this.highlighter.colorizeAll(this.node);
                            }
                        }),
                        (e.prototype.Stop = function () {
                            this.active && this.highlighter.uncolorizeAll(this.node),
                                (this.active = !1);
                        }),
                        e
                    );
                })(l);
                e.TreeColorer = u;
            },
            306: function (t, e) {
                (e.q = void 0), (e.q = '3.2.2');
            },
            511: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.EnrichedMathItemMixin =
                        MathJax._.a11y['semantic-enrich'].EnrichedMathItemMixin),
                    (e.EnrichedMathDocumentMixin =
                        MathJax._.a11y['semantic-enrich'].EnrichedMathDocumentMixin),
                    (e.EnrichHandler = MathJax._.a11y['semantic-enrich'].EnrichHandler);
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
            888: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.CssStyles = MathJax._.util.StyleList.CssStyles);
            },
            850: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MJContextMenu = MathJax._.ui.menu.MJContextMenu.MJContextMenu);
            },
        },
        c = {};
    function u(t) {
        var e = c[t];
        if (void 0 !== e) return e.exports;
        var o = (c[t] = { exports: {} });
        return l[t].call(o.exports, o, o.exports, u), o.exports;
    }
    (t = u(723)),
        (e = u(306)),
        (o = u(18)),
        (r = u(724)),
        (n = u(269)),
        (i = u(85)),
        (a = u(367)),
        (s = u(854)),
        MathJax.loader && MathJax.loader.checkVersion('a11y/explorer', e.q, 'a11y'),
        (0, t.r8)({
            _: {
                a11y: {
                    explorer_ts: o,
                    explorer: {
                        Explorer: r,
                        KeyExplorer: n,
                        MouseExplorer: i,
                        Region: a,
                        TreeExplorer: s,
                    },
                },
            },
        }),
        MathJax.startup &&
            MathJax.startup.extendHandler(function (t) {
                return (0, o.ExplorerHandler)(t);
            });
})();
