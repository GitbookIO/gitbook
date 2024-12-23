!(function () {
    'use strict';
    var t,
        e,
        r,
        n,
        o,
        i,
        a,
        s,
        l,
        u,
        c,
        p,
        f,
        h,
        d,
        y,
        O,
        M,
        E,
        v,
        m,
        b,
        g,
        L,
        N,
        R,
        T,
        S,
        A,
        C,
        _,
        x,
        I,
        w,
        P,
        j,
        D,
        B,
        k,
        X,
        H,
        W,
        F,
        q,
        J,
        z,
        G,
        V,
        U,
        K,
        $,
        Y,
        Z,
        Q,
        tt,
        et,
        rt,
        nt,
        ot,
        it,
        at,
        st,
        lt,
        ut,
        ct,
        pt,
        ft,
        ht,
        dt,
        yt,
        Ot,
        Mt,
        Et,
        vt,
        mt,
        bt,
        gt,
        Lt,
        Nt = {
            444: function (t, e, r) {
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HTMLAdaptor = void 0);
                var a = (function (t) {
                    function e(e) {
                        var r = t.call(this, e.document) || this;
                        return (r.window = e), (r.parser = new e.DOMParser()), r;
                    }
                    return (
                        o(e, t),
                        (e.prototype.parse = function (t, e) {
                            return (
                                void 0 === e && (e = 'text/html'), this.parser.parseFromString(t, e)
                            );
                        }),
                        (e.prototype.create = function (t, e) {
                            return e
                                ? this.document.createElementNS(e, t)
                                : this.document.createElement(t);
                        }),
                        (e.prototype.text = function (t) {
                            return this.document.createTextNode(t);
                        }),
                        (e.prototype.head = function (t) {
                            return t.head || t;
                        }),
                        (e.prototype.body = function (t) {
                            return t.body || t;
                        }),
                        (e.prototype.root = function (t) {
                            return t.documentElement || t;
                        }),
                        (e.prototype.doctype = function (t) {
                            return t.doctype ? '<!DOCTYPE '.concat(t.doctype.name, '>') : '';
                        }),
                        (e.prototype.tags = function (t, e, r) {
                            void 0 === r && (r = null);
                            var n = r ? t.getElementsByTagNameNS(r, e) : t.getElementsByTagName(e);
                            return Array.from(n);
                        }),
                        (e.prototype.getElements = function (t, e) {
                            var r,
                                n,
                                o = [];
                            try {
                                for (var a = i(t), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    'string' == typeof l
                                        ? (o = o.concat(
                                              Array.from(this.document.querySelectorAll(l)),
                                          ))
                                        : Array.isArray(l) ||
                                            l instanceof this.window.NodeList ||
                                            l instanceof this.window.HTMLCollection
                                          ? (o = o.concat(Array.from(l)))
                                          : o.push(l);
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
                            return o;
                        }),
                        (e.prototype.contains = function (t, e) {
                            return t.contains(e);
                        }),
                        (e.prototype.parent = function (t) {
                            return t.parentNode;
                        }),
                        (e.prototype.append = function (t, e) {
                            return t.appendChild(e);
                        }),
                        (e.prototype.insert = function (t, e) {
                            return this.parent(e).insertBefore(t, e);
                        }),
                        (e.prototype.remove = function (t) {
                            return this.parent(t).removeChild(t);
                        }),
                        (e.prototype.replace = function (t, e) {
                            return this.parent(e).replaceChild(t, e);
                        }),
                        (e.prototype.clone = function (t) {
                            return t.cloneNode(!0);
                        }),
                        (e.prototype.split = function (t, e) {
                            return t.splitText(e);
                        }),
                        (e.prototype.next = function (t) {
                            return t.nextSibling;
                        }),
                        (e.prototype.previous = function (t) {
                            return t.previousSibling;
                        }),
                        (e.prototype.firstChild = function (t) {
                            return t.firstChild;
                        }),
                        (e.prototype.lastChild = function (t) {
                            return t.lastChild;
                        }),
                        (e.prototype.childNodes = function (t) {
                            return Array.from(t.childNodes);
                        }),
                        (e.prototype.childNode = function (t, e) {
                            return t.childNodes[e];
                        }),
                        (e.prototype.kind = function (t) {
                            var e = t.nodeType;
                            return 1 === e || 3 === e || 8 === e ? t.nodeName.toLowerCase() : '';
                        }),
                        (e.prototype.value = function (t) {
                            return t.nodeValue || '';
                        }),
                        (e.prototype.textContent = function (t) {
                            return t.textContent;
                        }),
                        (e.prototype.innerHTML = function (t) {
                            return t.innerHTML;
                        }),
                        (e.prototype.outerHTML = function (t) {
                            return t.outerHTML;
                        }),
                        (e.prototype.serializeXML = function (t) {
                            return new this.window.XMLSerializer().serializeToString(t);
                        }),
                        (e.prototype.setAttribute = function (t, e, r, n) {
                            return (
                                void 0 === n && (n = null),
                                n
                                    ? ((e = n.replace(/.*\//, '') + ':' + e.replace(/^.*:/, '')),
                                      t.setAttributeNS(n, e, r))
                                    : t.setAttribute(e, r)
                            );
                        }),
                        (e.prototype.getAttribute = function (t, e) {
                            return t.getAttribute(e);
                        }),
                        (e.prototype.removeAttribute = function (t, e) {
                            return t.removeAttribute(e);
                        }),
                        (e.prototype.hasAttribute = function (t, e) {
                            return t.hasAttribute(e);
                        }),
                        (e.prototype.allAttributes = function (t) {
                            return Array.from(t.attributes).map(function (t) {
                                return { name: t.name, value: t.value };
                            });
                        }),
                        (e.prototype.addClass = function (t, e) {
                            t.classList
                                ? t.classList.add(e)
                                : (t.className = (t.className + ' ' + e).trim());
                        }),
                        (e.prototype.removeClass = function (t, e) {
                            t.classList
                                ? t.classList.remove(e)
                                : (t.className = t.className
                                      .split(/ /)
                                      .filter(function (t) {
                                          return t !== e;
                                      })
                                      .join(' '));
                        }),
                        (e.prototype.hasClass = function (t, e) {
                            return t.classList
                                ? t.classList.contains(e)
                                : t.className.split(/ /).indexOf(e) >= 0;
                        }),
                        (e.prototype.setStyle = function (t, e, r) {
                            t.style[e] = r;
                        }),
                        (e.prototype.getStyle = function (t, e) {
                            return t.style[e];
                        }),
                        (e.prototype.allStyles = function (t) {
                            return t.style.cssText;
                        }),
                        (e.prototype.insertRules = function (t, e) {
                            var r, n;
                            try {
                                for (var o = i(e.reverse()), a = o.next(); !a.done; a = o.next()) {
                                    var s = a.value;
                                    try {
                                        t.sheet.insertRule(s, 0);
                                    } catch (t) {
                                        console.warn(
                                            "MathJax: can't insert css rule '"
                                                .concat(s, "': ")
                                                .concat(t.message),
                                        );
                                    }
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (n = o.return) && n.call(o);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }),
                        (e.prototype.fontSize = function (t) {
                            var e = this.window.getComputedStyle(t);
                            return parseFloat(e.fontSize);
                        }),
                        (e.prototype.fontFamily = function (t) {
                            return this.window.getComputedStyle(t).fontFamily || '';
                        }),
                        (e.prototype.nodeSize = function (t, e, r) {
                            if (
                                (void 0 === e && (e = 1), void 0 === r && (r = !1), r && t.getBBox)
                            ) {
                                var n = t.getBBox();
                                return [n.width / e, n.height / e];
                            }
                            return [t.offsetWidth / e, t.offsetHeight / e];
                        }),
                        (e.prototype.nodeBBox = function (t) {
                            var e = t.getBoundingClientRect();
                            return { left: e.left, right: e.right, top: e.top, bottom: e.bottom };
                        }),
                        e
                    );
                })(r(5009).AbstractDOMAdaptor);
                e.HTMLAdaptor = a;
            },
            6191: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.browserAdaptor = void 0);
                var n = r(444);
                e.browserAdaptor = function () {
                    return new n.HTMLAdaptor(window);
                };
            },
            9515: function (t, e, r) {
                var n =
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
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MathJax =
                        e.combineWithMathJax =
                        e.combineDefaults =
                        e.combineConfig =
                        e.isObject =
                            void 0);
                var o = r(3282);
                function i(t) {
                    return 'object' == typeof t && null !== t;
                }
                function a(t, e) {
                    var r, o;
                    try {
                        for (var s = n(Object.keys(e)), l = s.next(); !l.done; l = s.next()) {
                            var u = l.value;
                            '__esModule' !== u &&
                                (!i(t[u]) || !i(e[u]) || e[u] instanceof Promise
                                    ? null !== e[u] && void 0 !== e[u] && (t[u] = e[u])
                                    : a(t[u], e[u]));
                        }
                    } catch (t) {
                        r = { error: t };
                    } finally {
                        try {
                            l && !l.done && (o = s.return) && o.call(s);
                        } finally {
                            if (r) throw r.error;
                        }
                    }
                    return t;
                }
                (e.isObject = i),
                    (e.combineConfig = a),
                    (e.combineDefaults = function t(e, r, o) {
                        var a, s;
                        e[r] || (e[r] = {}), (e = e[r]);
                        try {
                            for (var l = n(Object.keys(o)), u = l.next(); !u.done; u = l.next()) {
                                var c = u.value;
                                i(e[c]) && i(o[c])
                                    ? t(e, c, o[c])
                                    : null == e[c] && null != o[c] && (e[c] = o[c]);
                            }
                        } catch (t) {
                            a = { error: t };
                        } finally {
                            try {
                                u && !u.done && (s = l.return) && s.call(l);
                            } finally {
                                if (a) throw a.error;
                            }
                        }
                        return e;
                    }),
                    (e.combineWithMathJax = function (t) {
                        return a(e.MathJax, t);
                    }),
                    void 0 === r.g.MathJax && (r.g.MathJax = {}),
                    r.g.MathJax.version ||
                        (r.g.MathJax = { version: o.VERSION, _: {}, config: r.g.MathJax }),
                    (e.MathJax = r.g.MathJax);
            },
            3282: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.VERSION = void 0),
                    (e.VERSION = '3.2.2');
            },
            5009: function (t, e) {
                var r =
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
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractDOMAdaptor = void 0);
                var n = (function () {
                    function t(t) {
                        void 0 === t && (t = null), (this.document = t);
                    }
                    return (
                        (t.prototype.node = function (t, e, n, o) {
                            var i, a;
                            void 0 === e && (e = {}), void 0 === n && (n = []);
                            var s = this.create(t, o);
                            this.setAttributes(s, e);
                            try {
                                for (var l = r(n), u = l.next(); !u.done; u = l.next()) {
                                    var c = u.value;
                                    this.append(s, c);
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (a = l.return) && a.call(l);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            return s;
                        }),
                        (t.prototype.setAttributes = function (t, e) {
                            var n, o, i, a, s, l;
                            if (e.style && 'string' != typeof e.style)
                                try {
                                    for (
                                        var u = r(Object.keys(e.style)), c = u.next();
                                        !c.done;
                                        c = u.next()
                                    ) {
                                        var p = c.value;
                                        this.setStyle(
                                            t,
                                            p.replace(/-([a-z])/g, function (t, e) {
                                                return e.toUpperCase();
                                            }),
                                            e.style[p],
                                        );
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (o = u.return) && o.call(u);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                            if (e.properties)
                                try {
                                    for (
                                        var f = r(Object.keys(e.properties)), h = f.next();
                                        !h.done;
                                        h = f.next()
                                    ) {
                                        t[(p = h.value)] = e.properties[p];
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        h && !h.done && (a = f.return) && a.call(f);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                            try {
                                for (
                                    var d = r(Object.keys(e)), y = d.next();
                                    !y.done;
                                    y = d.next()
                                ) {
                                    ('style' === (p = y.value) && 'string' != typeof e.style) ||
                                        'properties' === p ||
                                        this.setAttribute(t, p, e[p]);
                                }
                            } catch (t) {
                                s = { error: t };
                            } finally {
                                try {
                                    y && !y.done && (l = d.return) && l.call(d);
                                } finally {
                                    if (s) throw s.error;
                                }
                            }
                        }),
                        (t.prototype.replace = function (t, e) {
                            return this.insert(t, e), this.remove(e), e;
                        }),
                        (t.prototype.childNode = function (t, e) {
                            return this.childNodes(t)[e];
                        }),
                        (t.prototype.allClasses = function (t) {
                            var e = this.getAttribute(t, 'class');
                            return e
                                ? e
                                      .replace(/  +/g, ' ')
                                      .replace(/^ /, '')
                                      .replace(/ $/, '')
                                      .split(/ /)
                                : [];
                        }),
                        t
                    );
                })();
                e.AbstractDOMAdaptor = n;
            },
            3494: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractFindMath = void 0);
                var n = r(7233),
                    o = (function () {
                        function t(t) {
                            var e = this.constructor;
                            this.options = (0, n.userOptions)(
                                (0, n.defaultOptions)({}, e.OPTIONS),
                                t,
                            );
                        }
                        return (t.OPTIONS = {}), t;
                    })();
                e.AbstractFindMath = o;
            },
            3670: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AbstractHandler = void 0);
                var i = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return o(e, t), e;
                    })(r(5722).AbstractMathDocument),
                    a = (function () {
                        function t(t, e) {
                            void 0 === e && (e = 5),
                                (this.documentClass = i),
                                (this.adaptor = t),
                                (this.priority = e);
                        }
                        return (
                            Object.defineProperty(t.prototype, 'name', {
                                get: function () {
                                    return this.constructor.NAME;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.handlesDocument = function (t) {
                                return !1;
                            }),
                            (t.prototype.create = function (t, e) {
                                return new this.documentClass(t, this.adaptor, e);
                            }),
                            (t.NAME = 'generic'),
                            t
                        );
                    })();
                e.AbstractHandler = a;
            },
            805: function (t, e, r) {
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HandlerList = void 0);
                var a = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.register = function (t) {
                            return this.add(t, t.priority);
                        }),
                        (e.prototype.unregister = function (t) {
                            this.remove(t);
                        }),
                        (e.prototype.handlesDocument = function (t) {
                            var e, r;
                            try {
                                for (var n = i(this), o = n.next(); !o.done; o = n.next()) {
                                    var a = o.value.item;
                                    if (a.handlesDocument(t)) return a;
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = n.return) && r.call(n);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            throw new Error("Can't find handler for document");
                        }),
                        (e.prototype.document = function (t, e) {
                            return void 0 === e && (e = null), this.handlesDocument(t).create(t, e);
                        }),
                        e
                    );
                })(r(8666).PrioritizedList);
                e.HandlerList = a;
            },
            9206: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractInputJax = void 0);
                var n = r(7233),
                    o = r(7525),
                    i = (function () {
                        function t(t) {
                            void 0 === t && (t = {}),
                                (this.adaptor = null),
                                (this.mmlFactory = null);
                            var e = this.constructor;
                            (this.options = (0, n.userOptions)(
                                (0, n.defaultOptions)({}, e.OPTIONS),
                                t,
                            )),
                                (this.preFilters = new o.FunctionList()),
                                (this.postFilters = new o.FunctionList());
                        }
                        return (
                            Object.defineProperty(t.prototype, 'name', {
                                get: function () {
                                    return this.constructor.NAME;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.setAdaptor = function (t) {
                                this.adaptor = t;
                            }),
                            (t.prototype.setMmlFactory = function (t) {
                                this.mmlFactory = t;
                            }),
                            (t.prototype.initialize = function () {}),
                            (t.prototype.reset = function () {
                                for (var t = [], e = 0; e < arguments.length; e++)
                                    t[e] = arguments[e];
                            }),
                            Object.defineProperty(t.prototype, 'processStrings', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.findMath = function (t, e) {
                                return [];
                            }),
                            (t.prototype.executeFilters = function (t, e, r, n) {
                                var o = { math: e, document: r, data: n };
                                return t.execute(o), o.data;
                            }),
                            (t.NAME = 'generic'),
                            (t.OPTIONS = {}),
                            t
                        );
                    })();
                e.AbstractInputJax = i;
            },
            5722: function (t, e, r) {
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
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractMathDocument =
                        e.resetAllOptions =
                        e.resetOptions =
                        e.RenderList =
                            void 0);
                var l = r(7233),
                    u = r(9206),
                    c = r(2975),
                    p = r(9e3),
                    f = r(4474),
                    h = r(3909),
                    d = r(6751),
                    y = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            (e.create = function (t) {
                                var e,
                                    r,
                                    n = new this();
                                try {
                                    for (
                                        var o = i(Object.keys(t)), s = o.next();
                                        !s.done;
                                        s = o.next()
                                    ) {
                                        var l = s.value,
                                            u = a(this.action(l, t[l]), 2),
                                            c = u[0],
                                            p = u[1];
                                        p && n.add(c, p);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = o.return) && r.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return n;
                            }),
                            (e.action = function (t, e) {
                                var r,
                                    n,
                                    o,
                                    i,
                                    s,
                                    l,
                                    u = !0,
                                    c = e[0];
                                if (1 === e.length || 'boolean' == typeof e[1])
                                    2 === e.length && (u = e[1]),
                                        (s = (r = a(this.methodActions(t), 2))[0]),
                                        (l = r[1]);
                                else if ('string' == typeof e[1])
                                    if ('string' == typeof e[2]) {
                                        4 === e.length && (u = e[3]);
                                        var p = a(e.slice(1), 2),
                                            f = p[0],
                                            h = p[1];
                                        (s = (n = a(this.methodActions(f, h), 2))[0]), (l = n[1]);
                                    } else
                                        3 === e.length && (u = e[2]),
                                            (s = (o = a(this.methodActions(e[1]), 2))[0]),
                                            (l = o[1]);
                                else
                                    4 === e.length && (u = e[3]),
                                        (s = (i = a(e.slice(1), 2))[0]),
                                        (l = i[1]);
                                return [{ id: t, renderDoc: s, renderMath: l, convert: u }, c];
                            }),
                            (e.methodActions = function (t, e) {
                                return (
                                    void 0 === e && (e = t),
                                    [
                                        function (e) {
                                            return t && e[t](), !1;
                                        },
                                        function (t, r) {
                                            return e && t[e](r), !1;
                                        },
                                    ]
                                );
                            }),
                            (e.prototype.renderDoc = function (t, e) {
                                var r, n;
                                void 0 === e && (e = f.STATE.UNPROCESSED);
                                try {
                                    for (
                                        var o = i(this.items), a = o.next();
                                        !a.done;
                                        a = o.next()
                                    ) {
                                        var s = a.value;
                                        if (s.priority >= e && s.item.renderDoc(t)) return;
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (n = o.return) && n.call(o);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }),
                            (e.prototype.renderMath = function (t, e, r) {
                                var n, o;
                                void 0 === r && (r = f.STATE.UNPROCESSED);
                                try {
                                    for (
                                        var a = i(this.items), s = a.next();
                                        !s.done;
                                        s = a.next()
                                    ) {
                                        var l = s.value;
                                        if (l.priority >= r && l.item.renderMath(t, e)) return;
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (o = a.return) && o.call(a);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                            }),
                            (e.prototype.renderConvert = function (t, e, r) {
                                var n, o;
                                void 0 === r && (r = f.STATE.LAST);
                                try {
                                    for (
                                        var a = i(this.items), s = a.next();
                                        !s.done;
                                        s = a.next()
                                    ) {
                                        var l = s.value;
                                        if (l.priority > r) return;
                                        if (l.item.convert && l.item.renderMath(t, e)) return;
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (o = a.return) && o.call(a);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                            }),
                            (e.prototype.findID = function (t) {
                                var e, r;
                                try {
                                    for (
                                        var n = i(this.items), o = n.next();
                                        !o.done;
                                        o = n.next()
                                    ) {
                                        var a = o.value;
                                        if (a.item.id === t) return a.item;
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        o && !o.done && (r = n.return) && r.call(n);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return null;
                            }),
                            e
                        );
                    })(r(8666).PrioritizedList);
                (e.RenderList = y),
                    (e.resetOptions = { all: !1, processed: !1, inputJax: null, outputJax: null }),
                    (e.resetAllOptions = { all: !0, processed: !0, inputJax: [], outputJax: [] });
                var O = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            (e.prototype.compile = function (t) {
                                return null;
                            }),
                            e
                        );
                    })(u.AbstractInputJax),
                    M = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            (e.prototype.typeset = function (t, e) {
                                return void 0 === e && (e = null), null;
                            }),
                            (e.prototype.escaped = function (t, e) {
                                return null;
                            }),
                            e
                        );
                    })(c.AbstractOutputJax),
                    E = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return o(e, t), e;
                    })(p.AbstractMathList),
                    v = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return o(e, t), e;
                    })(f.AbstractMathItem),
                    m = (function () {
                        function t(e, r, n) {
                            var o = this,
                                i = this.constructor;
                            (this.document = e),
                                (this.options = (0, l.userOptions)(
                                    (0, l.defaultOptions)({}, i.OPTIONS),
                                    n,
                                )),
                                (this.math = new (this.options.MathList || E)()),
                                (this.renderActions = y.create(this.options.renderActions)),
                                (this.processed = new t.ProcessBits()),
                                (this.outputJax = this.options.OutputJax || new M());
                            var a = this.options.InputJax || [new O()];
                            Array.isArray(a) || (a = [a]),
                                (this.inputJax = a),
                                (this.adaptor = r),
                                this.outputJax.setAdaptor(r),
                                this.inputJax.map(function (t) {
                                    return t.setAdaptor(r);
                                }),
                                (this.mmlFactory = this.options.MmlFactory || new h.MmlFactory()),
                                this.inputJax.map(function (t) {
                                    return t.setMmlFactory(o.mmlFactory);
                                }),
                                this.outputJax.initialize(),
                                this.inputJax.map(function (t) {
                                    return t.initialize();
                                });
                        }
                        return (
                            Object.defineProperty(t.prototype, 'kind', {
                                get: function () {
                                    return this.constructor.KIND;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.addRenderAction = function (t) {
                                for (var e = [], r = 1; r < arguments.length; r++)
                                    e[r - 1] = arguments[r];
                                var n = a(y.action(t, e), 2),
                                    o = n[0],
                                    i = n[1];
                                this.renderActions.add(o, i);
                            }),
                            (t.prototype.removeRenderAction = function (t) {
                                var e = this.renderActions.findID(t);
                                e && this.renderActions.remove(e);
                            }),
                            (t.prototype.render = function () {
                                return this.renderActions.renderDoc(this), this;
                            }),
                            (t.prototype.rerender = function (t) {
                                return (
                                    void 0 === t && (t = f.STATE.RERENDER),
                                    this.state(t - 1),
                                    this.render(),
                                    this
                                );
                            }),
                            (t.prototype.convert = function (t, e) {
                                void 0 === e && (e = {});
                                var r = (0, l.userOptions)(
                                        {
                                            format: this.inputJax[0].name,
                                            display: !0,
                                            end: f.STATE.LAST,
                                            em: 16,
                                            ex: 8,
                                            containerWidth: null,
                                            lineWidth: 1e6,
                                            scale: 1,
                                            family: '',
                                        },
                                        e,
                                    ),
                                    n = r.format,
                                    o = r.display,
                                    i = r.end,
                                    a = r.ex,
                                    s = r.em,
                                    u = r.containerWidth,
                                    c = r.lineWidth,
                                    p = r.scale,
                                    h = r.family;
                                null === u && (u = 80 * a);
                                var d = this.inputJax.reduce(function (t, e) {
                                        return e.name === n ? e : t;
                                    }, null),
                                    y = new this.options.MathItem(t, d, o);
                                return (
                                    (y.start.node = this.adaptor.body(this.document)),
                                    y.setMetrics(s, a, u, c, p),
                                    this.outputJax.options.mtextInheritFont &&
                                        (y.outputData.mtextFamily = h),
                                    this.outputJax.options.merrorInheritFont &&
                                        (y.outputData.merrorFamily = h),
                                    y.convert(this, i),
                                    y.typesetRoot || y.root
                                );
                            }),
                            (t.prototype.findMath = function (t) {
                                return (
                                    void 0 === t && (t = null), this.processed.set('findMath'), this
                                );
                            }),
                            (t.prototype.compile = function () {
                                var t, e, r, n;
                                if (!this.processed.isSet('compile')) {
                                    var o = [];
                                    try {
                                        for (
                                            var a = i(this.math), s = a.next();
                                            !s.done;
                                            s = a.next()
                                        ) {
                                            var l = s.value;
                                            this.compileMath(l),
                                                void 0 !== l.inputData.recompile && o.push(l);
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            s && !s.done && (e = a.return) && e.call(a);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                    try {
                                        for (var u = i(o), c = u.next(); !c.done; c = u.next()) {
                                            var p = (l = c.value).inputData.recompile;
                                            l.state(p.state),
                                                (l.inputData.recompile = p),
                                                this.compileMath(l);
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            c && !c.done && (n = u.return) && n.call(u);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                    this.processed.set('compile');
                                }
                                return this;
                            }),
                            (t.prototype.compileMath = function (t) {
                                try {
                                    t.compile(this);
                                } catch (e) {
                                    if (e.retry || e.restart) throw e;
                                    this.options.compileError(this, t, e), (t.inputData.error = e);
                                }
                            }),
                            (t.prototype.compileError = function (t, e) {
                                (t.root = this.mmlFactory.create('math', null, [
                                    this.mmlFactory.create(
                                        'merror',
                                        { 'data-mjx-error': e.message, title: e.message },
                                        [
                                            this.mmlFactory.create('mtext', null, [
                                                this.mmlFactory
                                                    .create('text')
                                                    .setText('Math input error'),
                                            ]),
                                        ],
                                    ),
                                ])),
                                    t.display && t.root.attributes.set('display', 'block'),
                                    (t.inputData.error = e.message);
                            }),
                            (t.prototype.typeset = function () {
                                var t, e;
                                if (!this.processed.isSet('typeset')) {
                                    try {
                                        for (
                                            var r = i(this.math), n = r.next();
                                            !n.done;
                                            n = r.next()
                                        ) {
                                            var o = n.value;
                                            try {
                                                o.typeset(this);
                                            } catch (t) {
                                                if (t.retry || t.restart) throw t;
                                                this.options.typesetError(this, o, t),
                                                    (o.outputData.error = t);
                                            }
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
                                    this.processed.set('typeset');
                                }
                                return this;
                            }),
                            (t.prototype.typesetError = function (t, e) {
                                (t.typesetRoot = this.adaptor.node(
                                    'mjx-container',
                                    { class: 'MathJax mjx-output-error', jax: this.outputJax.name },
                                    [
                                        this.adaptor.node(
                                            'span',
                                            {
                                                'data-mjx-error': e.message,
                                                title: e.message,
                                                style: {
                                                    color: 'red',
                                                    'background-color': 'yellow',
                                                    'line-height': 'normal',
                                                },
                                            },
                                            [this.adaptor.text('Math output error')],
                                        ),
                                    ],
                                )),
                                    t.display &&
                                        this.adaptor.setAttributes(t.typesetRoot, {
                                            style: {
                                                display: 'block',
                                                margin: '1em 0',
                                                'text-align': 'center',
                                            },
                                        }),
                                    (t.outputData.error = e.message);
                            }),
                            (t.prototype.getMetrics = function () {
                                return (
                                    this.processed.isSet('getMetrics') ||
                                        (this.outputJax.getMetrics(this),
                                        this.processed.set('getMetrics')),
                                    this
                                );
                            }),
                            (t.prototype.updateDocument = function () {
                                var t, e;
                                if (!this.processed.isSet('updateDocument')) {
                                    try {
                                        for (
                                            var r = i(this.math.reversed()), n = r.next();
                                            !n.done;
                                            n = r.next()
                                        ) {
                                            n.value.updateDocument(this);
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
                                    this.processed.set('updateDocument');
                                }
                                return this;
                            }),
                            (t.prototype.removeFromDocument = function (t) {
                                return void 0 === t && (t = !1), this;
                            }),
                            (t.prototype.state = function (t, e) {
                                var r, n;
                                void 0 === e && (e = !1);
                                try {
                                    for (
                                        var o = i(this.math), a = o.next();
                                        !a.done;
                                        a = o.next()
                                    ) {
                                        a.value.state(t, e);
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        a && !a.done && (n = o.return) && n.call(o);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                                return (
                                    t < f.STATE.INSERTED && this.processed.clear('updateDocument'),
                                    t < f.STATE.TYPESET &&
                                        (this.processed.clear('typeset'),
                                        this.processed.clear('getMetrics')),
                                    t < f.STATE.COMPILED && this.processed.clear('compile'),
                                    this
                                );
                            }),
                            (t.prototype.reset = function (t) {
                                var r;
                                return (
                                    void 0 === t && (t = { processed: !0 }),
                                    (t = (0, l.userOptions)(Object.assign({}, e.resetOptions), t))
                                        .all && Object.assign(t, e.resetAllOptions),
                                    t.processed && this.processed.reset(),
                                    t.inputJax &&
                                        this.inputJax.forEach(function (e) {
                                            return e.reset.apply(e, s([], a(t.inputJax), !1));
                                        }),
                                    t.outputJax &&
                                        (r = this.outputJax).reset.apply(
                                            r,
                                            s([], a(t.outputJax), !1),
                                        ),
                                    this
                                );
                            }),
                            (t.prototype.clear = function () {
                                return this.reset(), this.math.clear(), this;
                            }),
                            (t.prototype.concat = function (t) {
                                return this.math.merge(t), this;
                            }),
                            (t.prototype.clearMathItemsWithin = function (t) {
                                var e,
                                    r = this.getMathItemsWithin(t);
                                return (e = this.math).remove.apply(e, s([], a(r), !1)), r;
                            }),
                            (t.prototype.getMathItemsWithin = function (t) {
                                var e, r, n, o;
                                Array.isArray(t) || (t = [t]);
                                var a = this.adaptor,
                                    s = [],
                                    l = a.getElements(t, this.document);
                                try {
                                    t: for (
                                        var u = i(this.math), c = u.next();
                                        !c.done;
                                        c = u.next()
                                    ) {
                                        var p = c.value;
                                        try {
                                            for (
                                                var f = ((n = void 0), i(l)), h = f.next();
                                                !h.done;
                                                h = f.next()
                                            ) {
                                                var d = h.value;
                                                if (p.start.node && a.contains(d, p.start.node)) {
                                                    s.push(p);
                                                    continue t;
                                                }
                                            }
                                        } catch (t) {
                                            n = { error: t };
                                        } finally {
                                            try {
                                                h && !h.done && (o = f.return) && o.call(f);
                                            } finally {
                                                if (n) throw n.error;
                                            }
                                        }
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (r = u.return) && r.call(u);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return s;
                            }),
                            (t.KIND = 'MathDocument'),
                            (t.OPTIONS = {
                                OutputJax: null,
                                InputJax: null,
                                MmlFactory: null,
                                MathList: E,
                                MathItem: v,
                                compileError: function (t, e, r) {
                                    t.compileError(e, r);
                                },
                                typesetError: function (t, e, r) {
                                    t.typesetError(e, r);
                                },
                                renderActions: (0, l.expandable)({
                                    find: [f.STATE.FINDMATH, 'findMath', '', !1],
                                    compile: [f.STATE.COMPILED],
                                    metrics: [f.STATE.METRICS, 'getMetrics', '', !1],
                                    typeset: [f.STATE.TYPESET],
                                    update: [f.STATE.INSERTED, 'updateDocument', !1],
                                }),
                            }),
                            (t.ProcessBits = (0, d.BitFieldClass)(
                                'findMath',
                                'compile',
                                'getMetrics',
                                'typeset',
                                'updateDocument',
                            )),
                            t
                        );
                    })();
                e.AbstractMathDocument = m;
            },
            4474: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.newState = e.STATE = e.AbstractMathItem = e.protoItem = void 0),
                    (e.protoItem = function (t, e, r, n, o, i, a) {
                        return (
                            void 0 === a && (a = null),
                            {
                                open: t,
                                math: e,
                                close: r,
                                n: n,
                                start: { n: o },
                                end: { n: i },
                                display: a,
                            }
                        );
                    });
                var r = (function () {
                    function t(t, r, n, o, i) {
                        void 0 === n && (n = !0),
                            void 0 === o && (o = { i: 0, n: 0, delim: '' }),
                            void 0 === i && (i = { i: 0, n: 0, delim: '' }),
                            (this.root = null),
                            (this.typesetRoot = null),
                            (this.metrics = {}),
                            (this.inputData = {}),
                            (this.outputData = {}),
                            (this._state = e.STATE.UNPROCESSED),
                            (this.math = t),
                            (this.inputJax = r),
                            (this.display = n),
                            (this.start = o),
                            (this.end = i),
                            (this.root = null),
                            (this.typesetRoot = null),
                            (this.metrics = {}),
                            (this.inputData = {}),
                            (this.outputData = {});
                    }
                    return (
                        Object.defineProperty(t.prototype, 'isEscaped', {
                            get: function () {
                                return null === this.display;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.render = function (t) {
                            t.renderActions.renderMath(this, t);
                        }),
                        (t.prototype.rerender = function (t, r) {
                            void 0 === r && (r = e.STATE.RERENDER),
                                this.state() >= r && this.state(r - 1),
                                t.renderActions.renderMath(this, t, r);
                        }),
                        (t.prototype.convert = function (t, r) {
                            void 0 === r && (r = e.STATE.LAST),
                                t.renderActions.renderConvert(this, t, r);
                        }),
                        (t.prototype.compile = function (t) {
                            this.state() < e.STATE.COMPILED &&
                                ((this.root = this.inputJax.compile(this, t)),
                                this.state(e.STATE.COMPILED));
                        }),
                        (t.prototype.typeset = function (t) {
                            this.state() < e.STATE.TYPESET &&
                                ((this.typesetRoot = t.outputJax[
                                    this.isEscaped ? 'escaped' : 'typeset'
                                ](this, t)),
                                this.state(e.STATE.TYPESET));
                        }),
                        (t.prototype.updateDocument = function (t) {}),
                        (t.prototype.removeFromDocument = function (t) {
                            void 0 === t && (t = !1);
                        }),
                        (t.prototype.setMetrics = function (t, e, r, n, o) {
                            this.metrics = {
                                em: t,
                                ex: e,
                                containerWidth: r,
                                lineWidth: n,
                                scale: o,
                            };
                        }),
                        (t.prototype.state = function (t, r) {
                            return (
                                void 0 === t && (t = null),
                                void 0 === r && (r = !1),
                                null != t &&
                                    (t < e.STATE.INSERTED &&
                                        this._state >= e.STATE.INSERTED &&
                                        this.removeFromDocument(r),
                                    t < e.STATE.TYPESET &&
                                        this._state >= e.STATE.TYPESET &&
                                        (this.outputData = {}),
                                    t < e.STATE.COMPILED &&
                                        this._state >= e.STATE.COMPILED &&
                                        (this.inputData = {}),
                                    (this._state = t)),
                                this._state
                            );
                        }),
                        (t.prototype.reset = function (t) {
                            void 0 === t && (t = !1), this.state(e.STATE.UNPROCESSED, t);
                        }),
                        t
                    );
                })();
                (e.AbstractMathItem = r),
                    (e.STATE = {
                        UNPROCESSED: 0,
                        FINDMATH: 10,
                        COMPILED: 20,
                        CONVERT: 100,
                        METRICS: 110,
                        RERENDER: 125,
                        TYPESET: 150,
                        INSERTED: 200,
                        LAST: 1e4,
                    }),
                    (e.newState = function (t, r) {
                        if (t in e.STATE) throw Error('State ' + t + ' already exists');
                        e.STATE[t] = r;
                    });
            },
            9e3: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractMathList = void 0);
                var i = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.isBefore = function (t, e) {
                            return (
                                t.start.i < e.start.i ||
                                (t.start.i === e.start.i && t.start.n < e.start.n)
                            );
                        }),
                        e
                    );
                })(r(103).LinkedList);
                e.AbstractMathList = i;
            },
            91: function (t, e) {
                var r =
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
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Attributes = e.INHERIT = void 0),
                    (e.INHERIT = '_inherit_');
                var n = (function () {
                    function t(t, e) {
                        (this.global = e),
                            (this.defaults = Object.create(e)),
                            (this.inherited = Object.create(this.defaults)),
                            (this.attributes = Object.create(this.inherited)),
                            Object.assign(this.defaults, t);
                    }
                    return (
                        (t.prototype.set = function (t, e) {
                            this.attributes[t] = e;
                        }),
                        (t.prototype.setList = function (t) {
                            Object.assign(this.attributes, t);
                        }),
                        (t.prototype.get = function (t) {
                            var r = this.attributes[t];
                            return r === e.INHERIT && (r = this.global[t]), r;
                        }),
                        (t.prototype.getExplicit = function (t) {
                            if (this.attributes.hasOwnProperty(t)) return this.attributes[t];
                        }),
                        (t.prototype.getList = function () {
                            for (var t, e, n = [], o = 0; o < arguments.length; o++)
                                n[o] = arguments[o];
                            var i = {};
                            try {
                                for (var a = r(n), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    i[l] = this.get(l);
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    s && !s.done && (e = a.return) && e.call(a);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return i;
                        }),
                        (t.prototype.setInherited = function (t, e) {
                            this.inherited[t] = e;
                        }),
                        (t.prototype.getInherited = function (t) {
                            return this.inherited[t];
                        }),
                        (t.prototype.getDefault = function (t) {
                            return this.defaults[t];
                        }),
                        (t.prototype.isSet = function (t) {
                            return (
                                this.attributes.hasOwnProperty(t) ||
                                this.inherited.hasOwnProperty(t)
                            );
                        }),
                        (t.prototype.hasDefault = function (t) {
                            return t in this.defaults;
                        }),
                        (t.prototype.getExplicitNames = function () {
                            return Object.keys(this.attributes);
                        }),
                        (t.prototype.getInheritedNames = function () {
                            return Object.keys(this.inherited);
                        }),
                        (t.prototype.getDefaultNames = function () {
                            return Object.keys(this.defaults);
                        }),
                        (t.prototype.getGlobalNames = function () {
                            return Object.keys(this.global);
                        }),
                        (t.prototype.getAllAttributes = function () {
                            return this.attributes;
                        }),
                        (t.prototype.getAllInherited = function () {
                            return this.inherited;
                        }),
                        (t.prototype.getAllDefaults = function () {
                            return this.defaults;
                        }),
                        (t.prototype.getAllGlobals = function () {
                            return this.global;
                        }),
                        t
                    );
                })();
                e.Attributes = n;
            },
            6336: function (t, e, r) {
                var n;
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MML = void 0);
                var o = r(9007),
                    i = r(3233),
                    a = r(450),
                    s = r(3050),
                    l = r(2756),
                    u = r(4770),
                    c = r(6030),
                    p = r(7265),
                    f = r(9878),
                    h = r(6850),
                    d = r(7131),
                    y = r(6145),
                    O = r(1314),
                    M = r(1581),
                    E = r(7238),
                    v = r(5741),
                    m = r(5410),
                    b = r(6661),
                    g = r(9145),
                    L = r(4461),
                    N = r(5184),
                    R = r(6405),
                    T = r(1349),
                    S = r(5022),
                    A = r(4359),
                    C = r(142),
                    _ = r(7590),
                    x = r(3985),
                    I = r(9102),
                    w = r(3948),
                    P = r(1334);
                e.MML =
                    (((n = {})[i.MmlMath.prototype.kind] = i.MmlMath),
                    (n[a.MmlMi.prototype.kind] = a.MmlMi),
                    (n[s.MmlMn.prototype.kind] = s.MmlMn),
                    (n[l.MmlMo.prototype.kind] = l.MmlMo),
                    (n[u.MmlMtext.prototype.kind] = u.MmlMtext),
                    (n[c.MmlMspace.prototype.kind] = c.MmlMspace),
                    (n[p.MmlMs.prototype.kind] = p.MmlMs),
                    (n[f.MmlMrow.prototype.kind] = f.MmlMrow),
                    (n[f.MmlInferredMrow.prototype.kind] = f.MmlInferredMrow),
                    (n[h.MmlMfrac.prototype.kind] = h.MmlMfrac),
                    (n[d.MmlMsqrt.prototype.kind] = d.MmlMsqrt),
                    (n[y.MmlMroot.prototype.kind] = y.MmlMroot),
                    (n[O.MmlMstyle.prototype.kind] = O.MmlMstyle),
                    (n[M.MmlMerror.prototype.kind] = M.MmlMerror),
                    (n[E.MmlMpadded.prototype.kind] = E.MmlMpadded),
                    (n[v.MmlMphantom.prototype.kind] = v.MmlMphantom),
                    (n[m.MmlMfenced.prototype.kind] = m.MmlMfenced),
                    (n[b.MmlMenclose.prototype.kind] = b.MmlMenclose),
                    (n[g.MmlMaction.prototype.kind] = g.MmlMaction),
                    (n[L.MmlMsub.prototype.kind] = L.MmlMsub),
                    (n[L.MmlMsup.prototype.kind] = L.MmlMsup),
                    (n[L.MmlMsubsup.prototype.kind] = L.MmlMsubsup),
                    (n[N.MmlMunder.prototype.kind] = N.MmlMunder),
                    (n[N.MmlMover.prototype.kind] = N.MmlMover),
                    (n[N.MmlMunderover.prototype.kind] = N.MmlMunderover),
                    (n[R.MmlMmultiscripts.prototype.kind] = R.MmlMmultiscripts),
                    (n[R.MmlMprescripts.prototype.kind] = R.MmlMprescripts),
                    (n[R.MmlNone.prototype.kind] = R.MmlNone),
                    (n[T.MmlMtable.prototype.kind] = T.MmlMtable),
                    (n[S.MmlMlabeledtr.prototype.kind] = S.MmlMlabeledtr),
                    (n[S.MmlMtr.prototype.kind] = S.MmlMtr),
                    (n[A.MmlMtd.prototype.kind] = A.MmlMtd),
                    (n[C.MmlMaligngroup.prototype.kind] = C.MmlMaligngroup),
                    (n[_.MmlMalignmark.prototype.kind] = _.MmlMalignmark),
                    (n[x.MmlMglyph.prototype.kind] = x.MmlMglyph),
                    (n[I.MmlSemantics.prototype.kind] = I.MmlSemantics),
                    (n[I.MmlAnnotation.prototype.kind] = I.MmlAnnotation),
                    (n[I.MmlAnnotationXML.prototype.kind] = I.MmlAnnotationXML),
                    (n[w.TeXAtom.prototype.kind] = w.TeXAtom),
                    (n[P.MathChoice.prototype.kind] = P.MathChoice),
                    (n[o.TextNode.prototype.kind] = o.TextNode),
                    (n[o.XMLNode.prototype.kind] = o.XMLNode),
                    n);
            },
            1759: function (t, e, r) {
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathMLVisitor = void 0);
                var a = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.document = null), e;
                    }
                    return (
                        o(e, t),
                        (e.prototype.visitTree = function (t, e) {
                            this.document = e;
                            var r = e.createElement('top');
                            return this.visitNode(t, r), (this.document = null), r.firstChild;
                        }),
                        (e.prototype.visitTextNode = function (t, e) {
                            e.appendChild(this.document.createTextNode(t.getText()));
                        }),
                        (e.prototype.visitXMLNode = function (t, e) {
                            e.appendChild(t.getXML().cloneNode(!0));
                        }),
                        (e.prototype.visitInferredMrowNode = function (t, e) {
                            var r, n;
                            try {
                                for (var o = i(t.childNodes), a = o.next(); !a.done; a = o.next()) {
                                    var s = a.value;
                                    this.visitNode(s, e);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (n = o.return) && n.call(o);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }),
                        (e.prototype.visitDefault = function (t, e) {
                            var r,
                                n,
                                o = this.document.createElement(t.kind);
                            this.addAttributes(t, o);
                            try {
                                for (var a = i(t.childNodes), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    this.visitNode(l, o);
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
                            e.appendChild(o);
                        }),
                        (e.prototype.addAttributes = function (t, e) {
                            var r,
                                n,
                                o = t.attributes,
                                a = o.getExplicitNames();
                            try {
                                for (var s = i(a), l = s.next(); !l.done; l = s.next()) {
                                    var u = l.value;
                                    e.setAttribute(u, o.getExplicit(u).toString());
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (n = s.return) && n.call(s);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }),
                        e
                    );
                })(r(6325).MmlVisitor);
                e.MathMLVisitor = a;
            },
            3909: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlFactory = void 0);
                var i = r(7860),
                    a = r(6336),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'MML', {
                                get: function () {
                                    return this.node;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaultNodes = a.MML),
                            e
                        );
                    })(i.AbstractNodeFactory);
                e.MmlFactory = s;
            },
            9007: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
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
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.XMLNode =
                        e.TextNode =
                        e.AbstractMmlEmptyNode =
                        e.AbstractMmlBaseNode =
                        e.AbstractMmlLayoutNode =
                        e.AbstractMmlTokenNode =
                        e.AbstractMmlNode =
                        e.indentAttributes =
                        e.TEXCLASSNAMES =
                        e.TEXCLASS =
                            void 0);
                var l = r(91),
                    u = r(4596);
                (e.TEXCLASS = {
                    ORD: 0,
                    OP: 1,
                    BIN: 2,
                    REL: 3,
                    OPEN: 4,
                    CLOSE: 5,
                    PUNCT: 6,
                    INNER: 7,
                    VCENTER: 8,
                    NONE: -1,
                }),
                    (e.TEXCLASSNAMES = [
                        'ORD',
                        'OP',
                        'BIN',
                        'REL',
                        'OPEN',
                        'CLOSE',
                        'PUNCT',
                        'INNER',
                        'VCENTER',
                    ]);
                var c = ['', 'thinmathspace', 'mediummathspace', 'thickmathspace'],
                    p = [
                        [0, -1, 2, 3, 0, 0, 0, 1],
                        [-1, -1, 0, 3, 0, 0, 0, 1],
                        [2, 2, 0, 0, 2, 0, 0, 2],
                        [3, 3, 0, 0, 3, 0, 0, 3],
                        [0, 0, 0, 0, 0, 0, 0, 0],
                        [0, -1, 2, 3, 0, 0, 0, 1],
                        [1, 1, 0, 1, 1, 1, 1, 1],
                        [1, -1, 2, 3, 1, 0, 1, 1],
                    ];
                e.indentAttributes = [
                    'indentalign',
                    'indentalignfirst',
                    'indentshift',
                    'indentshiftfirst',
                ];
                var f = (function (t) {
                    function r(e, r, n) {
                        void 0 === r && (r = {}), void 0 === n && (n = []);
                        var o = t.call(this, e) || this;
                        return (
                            (o.prevClass = null),
                            (o.prevLevel = null),
                            (o.texclass = null),
                            o.arity < 0 &&
                                ((o.childNodes = [e.create('inferredMrow')]),
                                (o.childNodes[0].parent = o)),
                            o.setChildren(n),
                            (o.attributes = new l.Attributes(
                                e.getNodeClass(o.kind).defaults,
                                e.getNodeClass('math').defaults,
                            )),
                            o.attributes.setList(r),
                            o
                        );
                    }
                    return (
                        o(r, t),
                        (r.prototype.copy = function (t) {
                            var e, r, n, o;
                            void 0 === t && (t = !1);
                            var s = this.factory.create(this.kind);
                            if (((s.properties = i({}, this.properties)), this.attributes)) {
                                var l = this.attributes.getAllAttributes();
                                try {
                                    for (
                                        var u = a(Object.keys(l)), c = u.next();
                                        !c.done;
                                        c = u.next()
                                    ) {
                                        var p = c.value;
                                        ('id' !== p || t) && s.attributes.set(p, l[p]);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (r = u.return) && r.call(u);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                            }
                            if (this.childNodes && this.childNodes.length) {
                                var f = this.childNodes;
                                1 === f.length && f[0].isInferred && (f = f[0].childNodes);
                                try {
                                    for (var h = a(f), d = h.next(); !d.done; d = h.next()) {
                                        var y = d.value;
                                        y ? s.appendChild(y.copy()) : s.childNodes.push(null);
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        d && !d.done && (o = h.return) && o.call(h);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                            }
                            return s;
                        }),
                        Object.defineProperty(r.prototype, 'texClass', {
                            get: function () {
                                return this.texclass;
                            },
                            set: function (t) {
                                this.texclass = t;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isToken', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isEmbellished', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isSpacelike', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'linebreakContainer', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'hasNewLine', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'arity', {
                            get: function () {
                                return 1 / 0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isInferred', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'Parent', {
                            get: function () {
                                for (var t = this.parent; t && t.notParent; ) t = t.Parent;
                                return t;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'notParent', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (r.prototype.setChildren = function (e) {
                            return this.arity < 0
                                ? this.childNodes[0].setChildren(e)
                                : t.prototype.setChildren.call(this, e);
                        }),
                        (r.prototype.appendChild = function (e) {
                            var r,
                                n,
                                o = this;
                            if (this.arity < 0) return this.childNodes[0].appendChild(e), e;
                            if (e.isInferred) {
                                if (this.arity === 1 / 0)
                                    return (
                                        e.childNodes.forEach(function (e) {
                                            return t.prototype.appendChild.call(o, e);
                                        }),
                                        e
                                    );
                                var i = e;
                                (e = this.factory.create('mrow')).setChildren(i.childNodes),
                                    (e.attributes = i.attributes);
                                try {
                                    for (
                                        var s = a(i.getPropertyNames()), l = s.next();
                                        !l.done;
                                        l = s.next()
                                    ) {
                                        var u = l.value;
                                        e.setProperty(u, i.getProperty(u));
                                    }
                                } catch (t) {
                                    r = { error: t };
                                } finally {
                                    try {
                                        l && !l.done && (n = s.return) && n.call(s);
                                    } finally {
                                        if (r) throw r.error;
                                    }
                                }
                            }
                            return t.prototype.appendChild.call(this, e);
                        }),
                        (r.prototype.replaceChild = function (e, r) {
                            return this.arity < 0
                                ? (this.childNodes[0].replaceChild(e, r), e)
                                : t.prototype.replaceChild.call(this, e, r);
                        }),
                        (r.prototype.core = function () {
                            return this;
                        }),
                        (r.prototype.coreMO = function () {
                            return this;
                        }),
                        (r.prototype.coreIndex = function () {
                            return 0;
                        }),
                        (r.prototype.childPosition = function () {
                            for (var t, e, r = this, n = r.parent; n && n.notParent; )
                                (r = n), (n = n.parent);
                            if (n) {
                                var o = 0;
                                try {
                                    for (
                                        var i = a(n.childNodes), s = i.next();
                                        !s.done;
                                        s = i.next()
                                    ) {
                                        if (s.value === r) return o;
                                        o++;
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        s && !s.done && (e = i.return) && e.call(i);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                            }
                            return null;
                        }),
                        (r.prototype.setTeXclass = function (t) {
                            return this.getPrevClass(t), null != this.texClass ? this : t;
                        }),
                        (r.prototype.updateTeXclass = function (t) {
                            t &&
                                ((this.prevClass = t.prevClass),
                                (this.prevLevel = t.prevLevel),
                                (t.prevClass = t.prevLevel = null),
                                (this.texClass = t.texClass));
                        }),
                        (r.prototype.getPrevClass = function (t) {
                            t &&
                                ((this.prevClass = t.texClass),
                                (this.prevLevel = t.attributes.get('scriptlevel')));
                        }),
                        (r.prototype.texSpacing = function () {
                            var t = null != this.prevClass ? this.prevClass : e.TEXCLASS.NONE,
                                r = this.texClass || e.TEXCLASS.ORD;
                            if (t === e.TEXCLASS.NONE || r === e.TEXCLASS.NONE) return '';
                            t === e.TEXCLASS.VCENTER && (t = e.TEXCLASS.ORD),
                                r === e.TEXCLASS.VCENTER && (r = e.TEXCLASS.ORD);
                            var n = p[t][r];
                            return (this.prevLevel > 0 || this.attributes.get('scriptlevel') > 0) &&
                                n >= 0
                                ? ''
                                : c[Math.abs(n)];
                        }),
                        (r.prototype.hasSpacingAttributes = function () {
                            return this.isEmbellished && this.coreMO().hasSpacingAttributes();
                        }),
                        (r.prototype.setInheritedAttributes = function (t, e, n, o) {
                            var i, l;
                            void 0 === t && (t = {}),
                                void 0 === e && (e = !1),
                                void 0 === n && (n = 0),
                                void 0 === o && (o = !1);
                            var u = this.attributes.getAllDefaults();
                            try {
                                for (
                                    var c = a(Object.keys(t)), p = c.next();
                                    !p.done;
                                    p = c.next()
                                ) {
                                    var f = p.value;
                                    if (u.hasOwnProperty(f) || r.alwaysInherit.hasOwnProperty(f)) {
                                        var h = s(t[f], 2),
                                            d = h[0],
                                            y = h[1];
                                        ((r.noInherit[d] || {})[this.kind] || {})[f] ||
                                            this.attributes.setInherited(f, y);
                                    }
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    p && !p.done && (l = c.return) && l.call(c);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                            void 0 === this.attributes.getExplicit('displaystyle') &&
                                this.attributes.setInherited('displaystyle', e),
                                void 0 === this.attributes.getExplicit('scriptlevel') &&
                                    this.attributes.setInherited('scriptlevel', n),
                                o && this.setProperty('texprimestyle', o);
                            var O = this.arity;
                            if (
                                O >= 0 &&
                                O !== 1 / 0 &&
                                ((1 === O && 0 === this.childNodes.length) ||
                                    (1 !== O && this.childNodes.length !== O))
                            )
                                if (O < this.childNodes.length)
                                    this.childNodes = this.childNodes.slice(0, O);
                                else
                                    for (; this.childNodes.length < O; )
                                        this.appendChild(this.factory.create('mrow'));
                            this.setChildInheritedAttributes(t, e, n, o);
                        }),
                        (r.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                            var o, i;
                            try {
                                for (
                                    var s = a(this.childNodes), l = s.next();
                                    !l.done;
                                    l = s.next()
                                ) {
                                    l.value.setInheritedAttributes(t, e, r, n);
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (i = s.return) && i.call(s);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                        }),
                        (r.prototype.addInheritedAttributes = function (t, e) {
                            var r,
                                n,
                                o = i({}, t);
                            try {
                                for (
                                    var s = a(Object.keys(e)), l = s.next();
                                    !l.done;
                                    l = s.next()
                                ) {
                                    var u = l.value;
                                    'displaystyle' !== u &&
                                        'scriptlevel' !== u &&
                                        'style' !== u &&
                                        (o[u] = [this.kind, e[u]]);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (n = s.return) && n.call(s);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return o;
                        }),
                        (r.prototype.inheritAttributesFrom = function (t) {
                            var e = t.attributes,
                                r = e.get('displaystyle'),
                                n = e.get('scriptlevel'),
                                o = e.isSet('mathsize')
                                    ? { mathsize: ['math', e.get('mathsize')] }
                                    : {},
                                i = t.getProperty('texprimestyle') || !1;
                            this.setInheritedAttributes(o, r, n, i);
                        }),
                        (r.prototype.verifyTree = function (t) {
                            if ((void 0 === t && (t = null), null !== t)) {
                                this.verifyAttributes(t);
                                var e = this.arity;
                                t.checkArity &&
                                    e >= 0 &&
                                    e !== 1 / 0 &&
                                    ((1 === e && 0 === this.childNodes.length) ||
                                        (1 !== e && this.childNodes.length !== e)) &&
                                    this.mError(
                                        'Wrong number of children for "' + this.kind + '" node',
                                        t,
                                        !0,
                                    ),
                                    this.verifyChildren(t);
                            }
                        }),
                        (r.prototype.verifyAttributes = function (t) {
                            var e, r;
                            if (t.checkAttributes) {
                                var n = this.attributes,
                                    o = [];
                                try {
                                    for (
                                        var i = a(n.getExplicitNames()), s = i.next();
                                        !s.done;
                                        s = i.next()
                                    ) {
                                        var l = s.value;
                                        'data-' === l.substr(0, 5) ||
                                            void 0 !== n.getDefault(l) ||
                                            l.match(/^(?:class|style|id|(?:xlink:)?href)$/) ||
                                            o.push(l);
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
                                o.length &&
                                    this.mError(
                                        'Unknown attributes for ' +
                                            this.kind +
                                            ' node: ' +
                                            o.join(', '),
                                        t,
                                    );
                            }
                        }),
                        (r.prototype.verifyChildren = function (t) {
                            var e, r;
                            try {
                                for (
                                    var n = a(this.childNodes), o = n.next();
                                    !o.done;
                                    o = n.next()
                                ) {
                                    o.value.verifyTree(t);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = n.return) && r.call(n);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (r.prototype.mError = function (t, e, r) {
                            if (
                                (void 0 === r && (r = !1),
                                this.parent && this.parent.isKind('merror'))
                            )
                                return null;
                            var n = this.factory.create('merror');
                            if ((n.attributes.set('data-mjx-message', t), e.fullErrors || r)) {
                                var o = this.factory.create('mtext'),
                                    i = this.factory.create('text');
                                i.setText(e.fullErrors ? t : this.kind),
                                    o.appendChild(i),
                                    n.appendChild(o),
                                    this.parent.replaceChild(n, this);
                            } else this.parent.replaceChild(n, this), n.appendChild(this);
                            return n;
                        }),
                        (r.defaults = {
                            mathbackground: l.INHERIT,
                            mathcolor: l.INHERIT,
                            mathsize: l.INHERIT,
                            dir: l.INHERIT,
                        }),
                        (r.noInherit = {
                            mstyle: {
                                mpadded: {
                                    width: !0,
                                    height: !0,
                                    depth: !0,
                                    lspace: !0,
                                    voffset: !0,
                                },
                                mtable: { width: !0, height: !0, depth: !0, align: !0 },
                            },
                            maligngroup: { mrow: { groupalign: !0 }, mtable: { groupalign: !0 } },
                        }),
                        (r.alwaysInherit = { scriptminsize: !0, scriptsizemultiplier: !0 }),
                        (r.verifyDefaults = {
                            checkArity: !0,
                            checkAttributes: !1,
                            fullErrors: !1,
                            fixMmultiscripts: !0,
                            fixMtables: !0,
                        }),
                        r
                    );
                })(u.AbstractNode);
                e.AbstractMmlNode = f;
                var h = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'isToken', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.getText = function () {
                            var t,
                                e,
                                r = '';
                            try {
                                for (
                                    var n = a(this.childNodes), o = n.next();
                                    !o.done;
                                    o = n.next()
                                ) {
                                    var i = o.value;
                                    i instanceof M && (r += i.getText());
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    o && !o.done && (e = n.return) && e.call(n);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return r;
                        }),
                        (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                            var o, i;
                            try {
                                for (
                                    var s = a(this.childNodes), l = s.next();
                                    !l.done;
                                    l = s.next()
                                ) {
                                    var u = l.value;
                                    u instanceof f && u.setInheritedAttributes(t, e, r, n);
                                }
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (i = s.return) && i.call(s);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                        }),
                        (e.prototype.walkTree = function (t, e) {
                            var r, n;
                            t(this, e);
                            try {
                                for (
                                    var o = a(this.childNodes), i = o.next();
                                    !i.done;
                                    i = o.next()
                                ) {
                                    var s = i.value;
                                    s instanceof f && s.walkTree(t, e);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    i && !i.done && (n = o.return) && n.call(o);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return e;
                        }),
                        (e.defaults = i(i({}, f.defaults), {
                            mathvariant: 'normal',
                            mathsize: l.INHERIT,
                        })),
                        e
                    );
                })(f);
                e.AbstractMmlTokenNode = h;
                var d = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'isSpacelike', {
                            get: function () {
                                return this.childNodes[0].isSpacelike;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isEmbellished', {
                            get: function () {
                                return this.childNodes[0].isEmbellished;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return -1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.core = function () {
                            return this.childNodes[0];
                        }),
                        (e.prototype.coreMO = function () {
                            return this.childNodes[0].coreMO();
                        }),
                        (e.prototype.setTeXclass = function (t) {
                            return (
                                (t = this.childNodes[0].setTeXclass(t)),
                                this.updateTeXclass(this.childNodes[0]),
                                t
                            );
                        }),
                        (e.defaults = f.defaults),
                        e
                    );
                })(f);
                e.AbstractMmlLayoutNode = d;
                var y = (function (t) {
                    function r() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(r, t),
                        Object.defineProperty(r.prototype, 'isEmbellished', {
                            get: function () {
                                return this.childNodes[0].isEmbellished;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (r.prototype.core = function () {
                            return this.childNodes[0];
                        }),
                        (r.prototype.coreMO = function () {
                            return this.childNodes[0].coreMO();
                        }),
                        (r.prototype.setTeXclass = function (t) {
                            var r, n;
                            this.getPrevClass(t), (this.texClass = e.TEXCLASS.ORD);
                            var o = this.childNodes[0];
                            o
                                ? this.isEmbellished || o.isKind('mi')
                                    ? ((t = o.setTeXclass(t)), this.updateTeXclass(this.core()))
                                    : (o.setTeXclass(null), (t = this))
                                : (t = this);
                            try {
                                for (
                                    var i = a(this.childNodes.slice(1)), s = i.next();
                                    !s.done;
                                    s = i.next()
                                ) {
                                    var l = s.value;
                                    l && l.setTeXclass(null);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (n = i.return) && n.call(i);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return t;
                        }),
                        (r.defaults = f.defaults),
                        r
                    );
                })(f);
                e.AbstractMmlBaseNode = y;
                var O = (function (t) {
                    function r() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(r, t),
                        Object.defineProperty(r.prototype, 'isToken', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isEmbellished', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isSpacelike', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'linebreakContainer', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'hasNewLine', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'arity', {
                            get: function () {
                                return 0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'isInferred', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'notParent', {
                            get: function () {
                                return !1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'Parent', {
                            get: function () {
                                return this.parent;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'texClass', {
                            get: function () {
                                return e.TEXCLASS.NONE;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'prevClass', {
                            get: function () {
                                return e.TEXCLASS.NONE;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(r.prototype, 'prevLevel', {
                            get: function () {
                                return 0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (r.prototype.hasSpacingAttributes = function () {
                            return !1;
                        }),
                        Object.defineProperty(r.prototype, 'attributes', {
                            get: function () {
                                return null;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (r.prototype.core = function () {
                            return this;
                        }),
                        (r.prototype.coreMO = function () {
                            return this;
                        }),
                        (r.prototype.coreIndex = function () {
                            return 0;
                        }),
                        (r.prototype.childPosition = function () {
                            return 0;
                        }),
                        (r.prototype.setTeXclass = function (t) {
                            return t;
                        }),
                        (r.prototype.texSpacing = function () {
                            return '';
                        }),
                        (r.prototype.setInheritedAttributes = function (t, e, r, n) {}),
                        (r.prototype.inheritAttributesFrom = function (t) {}),
                        (r.prototype.verifyTree = function (t) {}),
                        (r.prototype.mError = function (t, e, r) {
                            return void 0 === r && (r = !1), null;
                        }),
                        r
                    );
                })(u.AbstractEmptyNode);
                e.AbstractMmlEmptyNode = O;
                var M = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.text = ''), e;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'text';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.getText = function () {
                            return this.text;
                        }),
                        (e.prototype.setText = function (t) {
                            return (this.text = t), this;
                        }),
                        (e.prototype.copy = function () {
                            return this.factory.create(this.kind).setText(this.getText());
                        }),
                        (e.prototype.toString = function () {
                            return this.text;
                        }),
                        e
                    );
                })(O);
                e.TextNode = M;
                var E = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.xml = null), (e.adaptor = null), e;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'XML';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.getXML = function () {
                            return this.xml;
                        }),
                        (e.prototype.setXML = function (t, e) {
                            return (
                                void 0 === e && (e = null), (this.xml = t), (this.adaptor = e), this
                            );
                        }),
                        (e.prototype.getSerializedXML = function () {
                            return this.adaptor.serializeXML(this.xml);
                        }),
                        (e.prototype.copy = function () {
                            return this.factory
                                .create(this.kind)
                                .setXML(this.adaptor.clone(this.xml));
                        }),
                        (e.prototype.toString = function () {
                            return 'XML data';
                        }),
                        e
                    );
                })(O);
                e.XMLNode = E;
            },
            3948: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.TeXAtom = void 0);
                var a = r(9007),
                    s = r(2756),
                    l = (function (t) {
                        function e(e, r, n) {
                            var o = t.call(this, e, r, n) || this;
                            return (
                                (o.texclass = a.TEXCLASS.ORD),
                                o.setProperty('texClass', o.texClass),
                                o
                            );
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'TeXAtom';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return -1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'notParent', {
                                get: function () {
                                    return (
                                        this.childNodes[0] &&
                                        1 === this.childNodes[0].childNodes.length
                                    );
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                return this.childNodes[0].setTeXclass(null), this.adjustTeXclass(t);
                            }),
                            (e.prototype.adjustTeXclass = function (t) {
                                return t;
                            }),
                            (e.defaults = i({}, a.AbstractMmlBaseNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlBaseNode);
                (e.TeXAtom = l), (l.prototype.adjustTeXclass = s.MmlMo.prototype.adjustTeXclass);
            },
            9145: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMaction = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'maction';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'selected', {
                                get: function () {
                                    var t = this.attributes.get('selection'),
                                        e = Math.max(1, Math.min(this.childNodes.length, t)) - 1;
                                    return this.childNodes[e] || this.factory.create('mrow');
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isEmbellished', {
                                get: function () {
                                    return this.selected.isEmbellished;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isSpacelike', {
                                get: function () {
                                    return this.selected.isSpacelike;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.core = function () {
                                return this.selected.core();
                            }),
                            (e.prototype.coreMO = function () {
                                return this.selected.coreMO();
                            }),
                            (e.prototype.verifyAttributes = function (e) {
                                (t.prototype.verifyAttributes.call(this, e),
                                'toggle' !== this.attributes.get('actiontype') &&
                                    void 0 !== this.attributes.getExplicit('selection')) &&
                                    delete this.attributes.getAllAttributes().selection;
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                'tooltip' === this.attributes.get('actiontype') &&
                                    this.childNodes[1] &&
                                    this.childNodes[1].setTeXclass(null);
                                var e = this.selected;
                                return (t = e.setTeXclass(t)), this.updateTeXclass(e), t;
                            }),
                            (e.prototype.nextToggleSelection = function () {
                                var t = Math.max(1, this.attributes.get('selection') + 1);
                                t > this.childNodes.length && (t = 1),
                                    this.attributes.set('selection', t);
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlNode.defaults), {
                                actiontype: 'toggle',
                                selection: 1,
                            })),
                            e
                        );
                    })(a.AbstractMmlNode);
                e.MmlMaction = s;
            },
            142: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMaligngroup = void 0);
                var a = r(9007),
                    s = r(91),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'maligngroup';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isSpacelike', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (e, r, n, o) {
                                (e = this.addInheritedAttributes(
                                    e,
                                    this.attributes.getAllAttributes(),
                                )),
                                    t.prototype.setChildInheritedAttributes.call(this, e, r, n, o);
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), {
                                groupalign: s.INHERIT,
                            })),
                            e
                        );
                    })(a.AbstractMmlLayoutNode);
                e.MmlMaligngroup = l;
            },
            7590: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMalignmark = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'malignmark';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isSpacelike', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlNode.defaults), { edge: 'left' })),
                            e
                        );
                    })(a.AbstractMmlNode);
                e.MmlMalignmark = s;
            },
            3233: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMath = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'math';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (e, r, n, o) {
                                'display' === this.attributes.get('mode') &&
                                    this.attributes.setInherited('display', 'block'),
                                    (e = this.addInheritedAttributes(
                                        e,
                                        this.attributes.getAllAttributes(),
                                    )),
                                    (r =
                                        !!this.attributes.get('displaystyle') ||
                                        (!this.attributes.get('displaystyle') &&
                                            'block' === this.attributes.get('display'))),
                                    this.attributes.setInherited('displaystyle', r),
                                    (n =
                                        this.attributes.get('scriptlevel') ||
                                        this.constructor.defaults.scriptlevel),
                                    t.prototype.setChildInheritedAttributes.call(this, e, r, n, o);
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), {
                                mathvariant: 'normal',
                                mathsize: 'normal',
                                mathcolor: '',
                                mathbackground: 'transparent',
                                dir: 'ltr',
                                scriptlevel: 0,
                                displaystyle: !1,
                                display: 'inline',
                                maxwidth: '',
                                overflow: 'linebreak',
                                altimg: '',
                                'altimg-width': '',
                                'altimg-height': '',
                                'altimg-valign': '',
                                alttext: '',
                                cdgroup: '',
                                scriptsizemultiplier: 1 / Math.sqrt(2),
                                scriptminsize: '8px',
                                infixlinebreakstyle: 'before',
                                lineleading: '1ex',
                                linebreakmultchar: '\u2062',
                                indentshift: 'auto',
                                indentalign: 'auto',
                                indenttarget: '',
                                indentalignfirst: 'indentalign',
                                indentshiftfirst: 'indentshift',
                                indentalignlast: 'indentalign',
                                indentshiftlast: 'indentshift',
                            })),
                            e
                        );
                    })(a.AbstractMmlLayoutNode);
                e.MmlMath = s;
            },
            1334: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MathChoice = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'MathChoice';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 4;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'notParent', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setInheritedAttributes = function (t, e, r, n) {
                                var o = e ? 0 : Math.max(0, Math.min(r, 2)) + 1,
                                    i = this.childNodes[o] || this.factory.create('mrow');
                                this.parent.replaceChild(i, this),
                                    i.setInheritedAttributes(t, e, r, n);
                            }),
                            (e.defaults = i({}, a.AbstractMmlBaseNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlBaseNode);
                e.MathChoice = s;
            },
            6661: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMenclose = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'menclose';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return -1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContininer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                return (
                                    (t = this.childNodes[0].setTeXclass(t)),
                                    this.updateTeXclass(this.childNodes[0]),
                                    t
                                );
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlNode.defaults), {
                                notation: 'longdiv',
                            })),
                            e
                        );
                    })(a.AbstractMmlNode);
                e.MmlMenclose = s;
            },
            1581: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMerror = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'merror';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return -1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i({}, a.AbstractMmlNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlNode);
                e.MmlMerror = s;
            },
            5410: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMfenced = void 0);
                var s = r(9007),
                    l = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e.texclass = s.TEXCLASS.INNER),
                                (e.separators = []),
                                (e.open = null),
                                (e.close = null),
                                e
                            );
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mfenced';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                this.getPrevClass(t),
                                    this.open && (t = this.open.setTeXclass(t)),
                                    this.childNodes[0] && (t = this.childNodes[0].setTeXclass(t));
                                for (var e = 1, r = this.childNodes.length; e < r; e++)
                                    this.separators[e - 1] &&
                                        (t = this.separators[e - 1].setTeXclass(t)),
                                        this.childNodes[e] &&
                                            (t = this.childNodes[e].setTeXclass(t));
                                return (
                                    this.close && (t = this.close.setTeXclass(t)),
                                    this.updateTeXclass(this.open),
                                    t
                                );
                            }),
                            (e.prototype.setChildInheritedAttributes = function (e, r, n, o) {
                                var i, s;
                                this.addFakeNodes();
                                try {
                                    for (
                                        var l = a([this.open, this.close].concat(this.separators)),
                                            u = l.next();
                                        !u.done;
                                        u = l.next()
                                    ) {
                                        var c = u.value;
                                        c && c.setInheritedAttributes(e, r, n, o);
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (s = l.return) && s.call(l);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                                t.prototype.setChildInheritedAttributes.call(this, e, r, n, o);
                            }),
                            (e.prototype.addFakeNodes = function () {
                                var t,
                                    e,
                                    r = this.attributes.getList('open', 'close', 'separators'),
                                    n = r.open,
                                    o = r.close,
                                    i = r.separators;
                                if (
                                    ((n = n.replace(/[ \t\n\r]/g, '')),
                                    (o = o.replace(/[ \t\n\r]/g, '')),
                                    (i = i.replace(/[ \t\n\r]/g, '')),
                                    n &&
                                        (this.open = this.fakeNode(
                                            n,
                                            { fence: !0, form: 'prefix' },
                                            s.TEXCLASS.OPEN,
                                        )),
                                    i)
                                ) {
                                    for (; i.length < this.childNodes.length - 1; )
                                        i += i.charAt(i.length - 1);
                                    var l = 0;
                                    try {
                                        for (
                                            var u = a(this.childNodes.slice(1)), c = u.next();
                                            !c.done;
                                            c = u.next()
                                        ) {
                                            c.value &&
                                                this.separators.push(this.fakeNode(i.charAt(l++)));
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            c && !c.done && (e = u.return) && e.call(u);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                }
                                o &&
                                    (this.close = this.fakeNode(
                                        o,
                                        { fence: !0, form: 'postfix' },
                                        s.TEXCLASS.CLOSE,
                                    ));
                            }),
                            (e.prototype.fakeNode = function (t, e, r) {
                                void 0 === e && (e = {}), void 0 === r && (r = null);
                                var n = this.factory.create('text').setText(t),
                                    o = this.factory.create('mo', e, [n]);
                                return (o.texClass = r), (o.parent = this), o;
                            }),
                            (e.defaults = i(i({}, s.AbstractMmlNode.defaults), {
                                open: '(',
                                close: ')',
                                separators: ',',
                            })),
                            e
                        );
                    })(s.AbstractMmlNode);
                e.MmlMfenced = l;
            },
            6850: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMfrac = void 0);
                var s = r(9007),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mfrac';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 2;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                var e, r;
                                this.getPrevClass(t);
                                try {
                                    for (
                                        var n = a(this.childNodes), o = n.next();
                                        !o.done;
                                        o = n.next()
                                    ) {
                                        o.value.setTeXclass(null);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        o && !o.done && (r = n.return) && r.call(n);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return this;
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                (!e || r > 0) && r++,
                                    this.childNodes[0].setInheritedAttributes(t, !1, r, n),
                                    this.childNodes[1].setInheritedAttributes(t, !1, r, !0);
                            }),
                            (e.defaults = i(i({}, s.AbstractMmlBaseNode.defaults), {
                                linethickness: 'medium',
                                numalign: 'center',
                                denomalign: 'center',
                                bevelled: !1,
                            })),
                            e
                        );
                    })(s.AbstractMmlBaseNode);
                e.MmlMfrac = l;
            },
            3985: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMglyph = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mglyph';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.verifyAttributes = function (e) {
                                var r = this.attributes.getList('src', 'fontfamily', 'index'),
                                    n = r.src,
                                    o = r.fontfamily,
                                    i = r.index;
                                '' !== n || ('' !== o && '' !== i)
                                    ? t.prototype.verifyAttributes.call(this, e)
                                    : this.mError(
                                          'mglyph must have either src or fontfamily and index attributes',
                                          e,
                                          !0,
                                      );
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlTokenNode.defaults), {
                                alt: '',
                                src: '',
                                index: '',
                                width: 'auto',
                                height: 'auto',
                                valign: '0em',
                            })),
                            e
                        );
                    })(a.AbstractMmlTokenNode);
                e.MmlMglyph = s;
            },
            450: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMi = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mi';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setInheritedAttributes = function (r, n, o, i) {
                                void 0 === r && (r = {}),
                                    void 0 === n && (n = !1),
                                    void 0 === o && (o = 0),
                                    void 0 === i && (i = !1),
                                    t.prototype.setInheritedAttributes.call(this, r, n, o, i),
                                    this.getText().match(e.singleCharacter) &&
                                        !r.mathvariant &&
                                        this.attributes.setInherited('mathvariant', 'italic');
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                this.getPrevClass(t);
                                var r = this.getText();
                                return (
                                    r.length > 1 &&
                                        r.match(e.operatorName) &&
                                        'normal' === this.attributes.get('mathvariant') &&
                                        void 0 === this.getProperty('autoOP') &&
                                        void 0 === this.getProperty('texClass') &&
                                        ((this.texClass = a.TEXCLASS.OP),
                                        this.setProperty('autoOP', !0)),
                                    this
                                );
                            }),
                            (e.defaults = i({}, a.AbstractMmlTokenNode.defaults)),
                            (e.operatorName = /^[a-z][a-z0-9]*$/i),
                            (e.singleCharacter =
                                /^[\uD800-\uDBFF]?.[\u0300-\u036F\u1AB0-\u1ABE\u1DC0-\u1DFF\u20D0-\u20EF]*$/),
                            e
                        );
                    })(a.AbstractMmlTokenNode);
                e.MmlMi = s;
            },
            6405: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlNone = e.MmlMprescripts = e.MmlMmultiscripts = void 0);
                var a = r(9007),
                    s = r(4461),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mmultiscripts';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                this.childNodes[0].setInheritedAttributes(t, e, r, n);
                                for (var o = !1, i = 1, a = 0; i < this.childNodes.length; i++) {
                                    var s = this.childNodes[i];
                                    if (s.isKind('mprescripts')) {
                                        if (!o && ((o = !0), i % 2 == 0)) {
                                            var l = this.factory.create('mrow');
                                            this.childNodes.splice(i, 0, l), (l.parent = this), i++;
                                        }
                                    } else {
                                        var u = n || a % 2 == 0;
                                        s.setInheritedAttributes(t, !1, r + 1, u), a++;
                                    }
                                }
                                this.childNodes.length % 2 == (o ? 1 : 0) &&
                                    (this.appendChild(this.factory.create('mrow')),
                                    this.childNodes[
                                        this.childNodes.length - 1
                                    ].setInheritedAttributes(t, !1, r + 1, n));
                            }),
                            (e.prototype.verifyChildren = function (e) {
                                for (
                                    var r = !1, n = e.fixMmultiscripts, o = 0;
                                    o < this.childNodes.length;
                                    o++
                                ) {
                                    var i = this.childNodes[o];
                                    i.isKind('mprescripts') &&
                                        (r
                                            ? i.mError(
                                                  i.kind + ' can only appear once in ' + this.kind,
                                                  e,
                                                  !0,
                                              )
                                            : ((r = !0),
                                              o % 2 != 0 ||
                                                  n ||
                                                  this.mError(
                                                      'There must be an equal number of prescripts of each type',
                                                      e,
                                                  )));
                                }
                                this.childNodes.length % 2 != (r ? 1 : 0) ||
                                    n ||
                                    this.mError(
                                        'There must be an equal number of scripts of each type',
                                        e,
                                    ),
                                    t.prototype.verifyChildren.call(this, e);
                            }),
                            (e.defaults = i({}, s.MmlMsubsup.defaults)),
                            e
                        );
                    })(s.MmlMsubsup);
                e.MmlMmultiscripts = l;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'mprescripts';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.verifyTree = function (e) {
                            t.prototype.verifyTree.call(this, e),
                                this.parent &&
                                    !this.parent.isKind('mmultiscripts') &&
                                    this.mError(
                                        this.kind + ' must be a child of mmultiscripts',
                                        e,
                                        !0,
                                    );
                        }),
                        (e.defaults = i({}, a.AbstractMmlNode.defaults)),
                        e
                    );
                })(a.AbstractMmlNode);
                e.MmlMprescripts = u;
                var c = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'none';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.verifyTree = function (e) {
                            t.prototype.verifyTree.call(this, e),
                                this.parent &&
                                    !this.parent.isKind('mmultiscripts') &&
                                    this.mError(
                                        this.kind + ' must be a child of mmultiscripts',
                                        e,
                                        !0,
                                    );
                        }),
                        (e.defaults = i({}, a.AbstractMmlNode.defaults)),
                        e
                    );
                })(a.AbstractMmlNode);
                e.MmlNone = c;
            },
            3050: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMn = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mn';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i({}, a.AbstractMmlTokenNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlTokenNode);
                e.MmlMn = s;
            },
            2756: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    s =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMo = void 0);
                var l = r(9007),
                    u = r(4082),
                    c = r(505),
                    p = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e._texClass = null), (e.lspace = 5 / 18), (e.rspace = 5 / 18), e
                            );
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'texClass', {
                                get: function () {
                                    if (null === this._texClass) {
                                        var t = this.getText(),
                                            e = a(this.handleExplicitForm(this.getForms()), 3),
                                            r = e[0],
                                            n = e[1],
                                            o = e[2],
                                            i = this.constructor.OPTABLE,
                                            s = i[r][t] || i[n][t] || i[o][t];
                                        return s ? s[2] : l.TEXCLASS.REL;
                                    }
                                    return this._texClass;
                                },
                                set: function (t) {
                                    this._texClass = t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mo';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isEmbellished', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'hasNewLine', {
                                get: function () {
                                    return 'newline' === this.attributes.get('linebreak');
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.coreParent = function () {
                                for (
                                    var t = this, e = this, r = this.factory.getNodeClass('math');
                                    e &&
                                    e.isEmbellished &&
                                    e.coreMO() === this &&
                                    !(e instanceof r);

                                )
                                    (t = e), (e = e.parent);
                                return t;
                            }),
                            (e.prototype.coreText = function (t) {
                                if (!t) return '';
                                if (t.isEmbellished) return t.coreMO().getText();
                                for (
                                    ;
                                    (((t.isKind('mrow') ||
                                        (t.isKind('TeXAtom') &&
                                            t.texClass !== l.TEXCLASS.VCENTER) ||
                                        t.isKind('mstyle') ||
                                        t.isKind('mphantom')) &&
                                        1 === t.childNodes.length) ||
                                        t.isKind('munderover')) &&
                                    t.childNodes[0];

                                )
                                    t = t.childNodes[0];
                                return t.isToken ? t.getText() : '';
                            }),
                            (e.prototype.hasSpacingAttributes = function () {
                                return (
                                    this.attributes.isSet('lspace') ||
                                    this.attributes.isSet('rspace')
                                );
                            }),
                            Object.defineProperty(e.prototype, 'isAccent', {
                                get: function () {
                                    var t = !1,
                                        e = this.coreParent().parent;
                                    if (e) {
                                        var r = e.isKind('mover')
                                            ? e.childNodes[e.over].coreMO()
                                                ? 'accent'
                                                : ''
                                            : e.isKind('munder')
                                              ? e.childNodes[e.under].coreMO()
                                                  ? 'accentunder'
                                                  : ''
                                              : e.isKind('munderover')
                                                ? this === e.childNodes[e.over].coreMO()
                                                    ? 'accent'
                                                    : this === e.childNodes[e.under].coreMO()
                                                      ? 'accentunder'
                                                      : ''
                                                : '';
                                        if (r)
                                            t =
                                                void 0 !== e.attributes.getExplicit(r)
                                                    ? t
                                                    : this.attributes.get('accent');
                                    }
                                    return t;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                var e = this.attributes.getList('form', 'fence'),
                                    r = e.form,
                                    n = e.fence;
                                return void 0 === this.getProperty('texClass') &&
                                    (this.attributes.isSet('lspace') ||
                                        this.attributes.isSet('rspace'))
                                    ? null
                                    : (n &&
                                          this.texClass === l.TEXCLASS.REL &&
                                          ('prefix' === r && (this.texClass = l.TEXCLASS.OPEN),
                                          'postfix' === r && (this.texClass = l.TEXCLASS.CLOSE)),
                                      this.adjustTeXclass(t));
                            }),
                            (e.prototype.adjustTeXclass = function (t) {
                                var e = this.texClass,
                                    r = this.prevClass;
                                if (e === l.TEXCLASS.NONE) return t;
                                if (
                                    (t
                                        ? (!t.getProperty('autoOP') ||
                                              (e !== l.TEXCLASS.BIN && e !== l.TEXCLASS.REL) ||
                                              (r = t.texClass = l.TEXCLASS.ORD),
                                          (r = this.prevClass = t.texClass || l.TEXCLASS.ORD),
                                          (this.prevLevel =
                                              this.attributes.getInherited('scriptlevel')))
                                        : (r = this.prevClass = l.TEXCLASS.NONE),
                                    e !== l.TEXCLASS.BIN ||
                                        (r !== l.TEXCLASS.NONE &&
                                            r !== l.TEXCLASS.BIN &&
                                            r !== l.TEXCLASS.OP &&
                                            r !== l.TEXCLASS.REL &&
                                            r !== l.TEXCLASS.OPEN &&
                                            r !== l.TEXCLASS.PUNCT))
                                )
                                    if (
                                        r !== l.TEXCLASS.BIN ||
                                        (e !== l.TEXCLASS.REL &&
                                            e !== l.TEXCLASS.CLOSE &&
                                            e !== l.TEXCLASS.PUNCT)
                                    ) {
                                        if (e === l.TEXCLASS.BIN) {
                                            for (
                                                var n = this, o = this.parent;
                                                o &&
                                                o.parent &&
                                                o.isEmbellished &&
                                                (1 === o.childNodes.length ||
                                                    (!o.isKind('mrow') && o.core() === n));

                                            )
                                                (n = o), (o = o.parent);
                                            o.childNodes[o.childNodes.length - 1] === n &&
                                                (this.texClass = l.TEXCLASS.ORD);
                                        }
                                    } else t.texClass = this.prevClass = l.TEXCLASS.ORD;
                                else this.texClass = l.TEXCLASS.ORD;
                                return this;
                            }),
                            (e.prototype.setInheritedAttributes = function (e, r, n, o) {
                                void 0 === e && (e = {}),
                                    void 0 === r && (r = !1),
                                    void 0 === n && (n = 0),
                                    void 0 === o && (o = !1),
                                    t.prototype.setInheritedAttributes.call(this, e, r, n, o);
                                var i = this.getText();
                                this.checkOperatorTable(i),
                                    this.checkPseudoScripts(i),
                                    this.checkPrimes(i),
                                    this.checkMathAccent(i);
                            }),
                            (e.prototype.checkOperatorTable = function (t) {
                                var e,
                                    r,
                                    n = a(this.handleExplicitForm(this.getForms()), 3),
                                    o = n[0],
                                    i = n[1],
                                    l = n[2];
                                this.attributes.setInherited('form', o);
                                var c = this.constructor.OPTABLE,
                                    p = c[o][t] || c[i][t] || c[l][t];
                                if (p) {
                                    void 0 === this.getProperty('texClass') &&
                                        (this.texClass = p[2]);
                                    try {
                                        for (
                                            var f = s(Object.keys(p[3] || {})), h = f.next();
                                            !h.done;
                                            h = f.next()
                                        ) {
                                            var d = h.value;
                                            this.attributes.setInherited(d, p[3][d]);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            h && !h.done && (r = f.return) && r.call(f);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                    (this.lspace = (p[0] + 1) / 18),
                                        (this.rspace = (p[1] + 1) / 18);
                                } else {
                                    var y = (0, u.getRange)(t);
                                    if (y) {
                                        void 0 === this.getProperty('texClass') &&
                                            (this.texClass = y[2]);
                                        var O = this.constructor.MMLSPACING[y[2]];
                                        (this.lspace = (O[0] + 1) / 18),
                                            (this.rspace = (O[1] + 1) / 18);
                                    }
                                }
                            }),
                            (e.prototype.getForms = function () {
                                for (
                                    var t = this, e = this.parent, r = this.Parent;
                                    r && r.isEmbellished;

                                )
                                    (t = e), (e = r.parent), (r = r.Parent);
                                if (e && e.isKind('mrow') && 1 !== e.nonSpaceLength()) {
                                    if (e.firstNonSpace() === t)
                                        return ['prefix', 'infix', 'postfix'];
                                    if (e.lastNonSpace() === t)
                                        return ['postfix', 'infix', 'prefix'];
                                }
                                return ['infix', 'prefix', 'postfix'];
                            }),
                            (e.prototype.handleExplicitForm = function (t) {
                                if (this.attributes.isSet('form')) {
                                    var e = this.attributes.get('form');
                                    t = [e].concat(
                                        t.filter(function (t) {
                                            return t !== e;
                                        }),
                                    );
                                }
                                return t;
                            }),
                            (e.prototype.checkPseudoScripts = function (t) {
                                var e = this.constructor.pseudoScripts;
                                if (t.match(e)) {
                                    var r = this.coreParent().Parent,
                                        n = !r || !(r.isKind('msubsup') && !r.isKind('msub'));
                                    this.setProperty('pseudoscript', n),
                                        n &&
                                            (this.attributes.setInherited('lspace', 0),
                                            this.attributes.setInherited('rspace', 0));
                                }
                            }),
                            (e.prototype.checkPrimes = function (t) {
                                var e = this.constructor.primes;
                                if (t.match(e)) {
                                    var r = this.constructor.remapPrimes,
                                        n = (0, c.unicodeString)(
                                            (0, c.unicodeChars)(t).map(function (t) {
                                                return r[t];
                                            }),
                                        );
                                    this.setProperty('primes', n);
                                }
                            }),
                            (e.prototype.checkMathAccent = function (t) {
                                var e = this.Parent;
                                if (
                                    void 0 === this.getProperty('mathaccent') &&
                                    e &&
                                    e.isKind('munderover')
                                ) {
                                    var r = e.childNodes[0];
                                    if (!r.isEmbellished || r.coreMO() !== this) {
                                        var n = this.constructor.mathaccents;
                                        t.match(n) && this.setProperty('mathaccent', !0);
                                    }
                                }
                            }),
                            (e.defaults = i(i({}, l.AbstractMmlTokenNode.defaults), {
                                form: 'infix',
                                fence: !1,
                                separator: !1,
                                lspace: 'thickmathspace',
                                rspace: 'thickmathspace',
                                stretchy: !1,
                                symmetric: !1,
                                maxsize: 'infinity',
                                minsize: '0em',
                                largeop: !1,
                                movablelimits: !1,
                                accent: !1,
                                linebreak: 'auto',
                                lineleading: '1ex',
                                linebreakstyle: 'before',
                                indentalign: 'auto',
                                indentshift: '0',
                                indenttarget: '',
                                indentalignfirst: 'indentalign',
                                indentshiftfirst: 'indentshift',
                                indentalignlast: 'indentalign',
                                indentshiftlast: 'indentshift',
                            })),
                            (e.MMLSPACING = u.MMLSPACING),
                            (e.OPTABLE = u.OPTABLE),
                            (e.pseudoScripts = new RegExp(
                                [
                                    '^["\'*`',
                                    '\xaa',
                                    '\xb0',
                                    '\xb2-\xb4',
                                    '\xb9',
                                    '\xba',
                                    '\u2018-\u201f',
                                    '\u2032-\u2037\u2057',
                                    '\u2070\u2071',
                                    '\u2074-\u207f',
                                    '\u2080-\u208e',
                                    ']+$',
                                ].join(''),
                            )),
                            (e.primes = new RegExp(['^["\'`', '\u2018-\u201f', ']+$'].join(''))),
                            (e.remapPrimes = {
                                34: 8243,
                                39: 8242,
                                96: 8245,
                                8216: 8245,
                                8217: 8242,
                                8218: 8242,
                                8219: 8245,
                                8220: 8246,
                                8221: 8243,
                                8222: 8243,
                                8223: 8246,
                            }),
                            (e.mathaccents = new RegExp(
                                [
                                    '^[',
                                    '\xb4\u0301\u02ca',
                                    '`\u0300\u02cb',
                                    '\xa8\u0308',
                                    '~\u0303\u02dc',
                                    '\xaf\u0304\u02c9',
                                    '\u02d8\u0306',
                                    '\u02c7\u030c',
                                    '^\u0302\u02c6',
                                    '\u2192\u20d7',
                                    '\u02d9\u0307',
                                    '\u02da\u030a',
                                    '\u20db',
                                    '\u20dc',
                                    ']$',
                                ].join(''),
                            )),
                            e
                        );
                    })(l.AbstractMmlTokenNode);
                e.MmlMo = p;
            },
            7238: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMpadded = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mpadded';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), {
                                width: '',
                                height: '',
                                depth: '',
                                lspace: 0,
                                voffset: 0,
                            })),
                            e
                        );
                    })(a.AbstractMmlLayoutNode);
                e.MmlMpadded = s;
            },
            5741: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMphantom = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mphantom';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i({}, a.AbstractMmlLayoutNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlLayoutNode);
                e.MmlMphantom = s;
            },
            6145: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMroot = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mroot';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 2;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                return (
                                    this.getPrevClass(t),
                                    this.childNodes[0].setTeXclass(null),
                                    this.childNodes[1].setTeXclass(null),
                                    this
                                );
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                this.childNodes[0].setInheritedAttributes(t, e, r, !0),
                                    this.childNodes[1].setInheritedAttributes(t, !1, r + 2, n);
                            }),
                            (e.defaults = i({}, a.AbstractMmlNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlNode);
                e.MmlMroot = s;
            },
            9878: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlInferredMrow = e.MmlMrow = void 0);
                var s = r(9007),
                    l = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e._core = null), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mrow';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isSpacelike', {
                                get: function () {
                                    var t, e;
                                    try {
                                        for (
                                            var r = a(this.childNodes), n = r.next();
                                            !n.done;
                                            n = r.next()
                                        ) {
                                            if (!n.value.isSpacelike) return !1;
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
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isEmbellished', {
                                get: function () {
                                    var t,
                                        e,
                                        r = !1,
                                        n = 0;
                                    try {
                                        for (
                                            var o = a(this.childNodes), i = o.next();
                                            !i.done;
                                            i = o.next()
                                        ) {
                                            var s = i.value;
                                            if (s)
                                                if (s.isEmbellished) {
                                                    if (r) return !1;
                                                    (r = !0), (this._core = n);
                                                } else if (!s.isSpacelike) return !1;
                                            n++;
                                        }
                                    } catch (e) {
                                        t = { error: e };
                                    } finally {
                                        try {
                                            i && !i.done && (e = o.return) && e.call(o);
                                        } finally {
                                            if (t) throw t.error;
                                        }
                                    }
                                    return r;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.core = function () {
                                return this.isEmbellished && null != this._core
                                    ? this.childNodes[this._core]
                                    : this;
                            }),
                            (e.prototype.coreMO = function () {
                                return this.isEmbellished && null != this._core
                                    ? this.childNodes[this._core].coreMO()
                                    : this;
                            }),
                            (e.prototype.nonSpaceLength = function () {
                                var t,
                                    e,
                                    r = 0;
                                try {
                                    for (
                                        var n = a(this.childNodes), o = n.next();
                                        !o.done;
                                        o = n.next()
                                    ) {
                                        var i = o.value;
                                        i && !i.isSpacelike && r++;
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        o && !o.done && (e = n.return) && e.call(n);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                return r;
                            }),
                            (e.prototype.firstNonSpace = function () {
                                var t, e;
                                try {
                                    for (
                                        var r = a(this.childNodes), n = r.next();
                                        !n.done;
                                        n = r.next()
                                    ) {
                                        var o = n.value;
                                        if (o && !o.isSpacelike) return o;
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
                                return null;
                            }),
                            (e.prototype.lastNonSpace = function () {
                                for (var t = this.childNodes.length; --t >= 0; ) {
                                    var e = this.childNodes[t];
                                    if (e && !e.isSpacelike) return e;
                                }
                                return null;
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                var e, r, n, o;
                                if (
                                    null != this.getProperty('open') ||
                                    null != this.getProperty('close')
                                ) {
                                    this.getPrevClass(t), (t = null);
                                    try {
                                        for (
                                            var i = a(this.childNodes), l = i.next();
                                            !l.done;
                                            l = i.next()
                                        ) {
                                            t = l.value.setTeXclass(t);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            l && !l.done && (r = i.return) && r.call(i);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                    null == this.texClass && (this.texClass = s.TEXCLASS.INNER);
                                } else {
                                    try {
                                        for (
                                            var u = a(this.childNodes), c = u.next();
                                            !c.done;
                                            c = u.next()
                                        ) {
                                            t = c.value.setTeXclass(t);
                                        }
                                    } catch (t) {
                                        n = { error: t };
                                    } finally {
                                        try {
                                            c && !c.done && (o = u.return) && o.call(u);
                                        } finally {
                                            if (n) throw n.error;
                                        }
                                    }
                                    this.childNodes[0] && this.updateTeXclass(this.childNodes[0]);
                                }
                                return t;
                            }),
                            (e.defaults = i({}, s.AbstractMmlNode.defaults)),
                            e
                        );
                    })(s.AbstractMmlNode);
                e.MmlMrow = l;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'inferredMrow';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'isInferred', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'notParent', {
                            get: function () {
                                return !0;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.toString = function () {
                            return '[' + this.childNodes.join(',') + ']';
                        }),
                        (e.defaults = l.defaults),
                        e
                    );
                })(l);
                e.MmlInferredMrow = u;
            },
            7265: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMs = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'ms';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlTokenNode.defaults), {
                                lquote: '"',
                                rquote: '"',
                            })),
                            e
                        );
                    })(a.AbstractMmlTokenNode);
                e.MmlMs = s;
            },
            6030: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMspace = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.NONE), e;
                        }
                        return (
                            o(e, t),
                            (e.prototype.setTeXclass = function (t) {
                                return t;
                            }),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mspace';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isSpacelike', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'hasNewline', {
                                get: function () {
                                    var t = this.attributes;
                                    return (
                                        null == t.getExplicit('width') &&
                                        null == t.getExplicit('height') &&
                                        null == t.getExplicit('depth') &&
                                        'newline' === t.get('linebreak')
                                    );
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlTokenNode.defaults), {
                                width: '0em',
                                height: '0ex',
                                depth: '0ex',
                                linebreak: 'auto',
                            })),
                            e
                        );
                    })(a.AbstractMmlTokenNode);
                e.MmlMspace = s;
            },
            7131: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMsqrt = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'msqrt';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return -1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                return (
                                    this.getPrevClass(t), this.childNodes[0].setTeXclass(null), this
                                );
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                this.childNodes[0].setInheritedAttributes(t, e, r, !0);
                            }),
                            (e.defaults = i({}, a.AbstractMmlNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlNode);
                e.MmlMsqrt = s;
            },
            1314: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMstyle = void 0);
                var a = r(9007),
                    s = r(91),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mstyle';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'notParent', {
                                get: function () {
                                    return (
                                        this.childNodes[0] &&
                                        1 === this.childNodes[0].childNodes.length
                                    );
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                var o = this.attributes.getExplicit('scriptlevel');
                                null != o &&
                                    ((o = o.toString()).match(/^\s*[-+]/)
                                        ? (r += parseInt(o))
                                        : (r = parseInt(o)),
                                    (n = !1));
                                var i = this.attributes.getExplicit('displaystyle');
                                null != i && ((e = !0 === i), (n = !1));
                                var a = this.attributes.getExplicit('data-cramped');
                                null != a && (n = a),
                                    (t = this.addInheritedAttributes(
                                        t,
                                        this.attributes.getAllAttributes(),
                                    )),
                                    this.childNodes[0].setInheritedAttributes(t, e, r, n);
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlLayoutNode.defaults), {
                                scriptlevel: s.INHERIT,
                                displaystyle: s.INHERIT,
                                scriptsizemultiplier: 1 / Math.sqrt(2),
                                scriptminsize: '8px',
                                mathbackground: s.INHERIT,
                                mathcolor: s.INHERIT,
                                dir: s.INHERIT,
                                infixlinebreakstyle: 'before',
                            })),
                            e
                        );
                    })(a.AbstractMmlLayoutNode);
                e.MmlMstyle = l;
            },
            4461: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMsup = e.MmlMsub = e.MmlMsubsup = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'msubsup';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 3;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'base', {
                                get: function () {
                                    return 0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'sub', {
                                get: function () {
                                    return 1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'sup', {
                                get: function () {
                                    return 2;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                var o = this.childNodes;
                                o[0].setInheritedAttributes(t, e, r, n),
                                    o[1].setInheritedAttributes(t, !1, r + 1, n || 1 === this.sub),
                                    o[2] &&
                                        o[2].setInheritedAttributes(
                                            t,
                                            !1,
                                            r + 1,
                                            n || 2 === this.sub,
                                        );
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), {
                                subscriptshift: '',
                                superscriptshift: '',
                            })),
                            e
                        );
                    })(a.AbstractMmlBaseNode);
                e.MmlMsubsup = s;
                var l = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'msub';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 2;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.defaults = i({}, s.defaults)),
                        e
                    );
                })(s);
                e.MmlMsub = l;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'msup';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 2;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'sup', {
                            get: function () {
                                return 1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'sub', {
                            get: function () {
                                return 2;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.defaults = i({}, s.defaults)),
                        e
                    );
                })(s);
                e.MmlMsup = u;
            },
            1349: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMtable = void 0);
                var s = r(9007),
                    l = r(505),
                    u = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (
                                (e.properties = { useHeight: !0 }), (e.texclass = s.TEXCLASS.ORD), e
                            );
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mtable';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setInheritedAttributes = function (e, r, n, o) {
                                var i, l;
                                try {
                                    for (
                                        var u = a(s.indentAttributes), c = u.next();
                                        !c.done;
                                        c = u.next()
                                    ) {
                                        var p = c.value;
                                        e[p] && this.attributes.setInherited(p, e[p][1]),
                                            void 0 !== this.attributes.getExplicit(p) &&
                                                delete this.attributes.getAllAttributes()[p];
                                    }
                                } catch (t) {
                                    i = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (l = u.return) && l.call(u);
                                    } finally {
                                        if (i) throw i.error;
                                    }
                                }
                                t.prototype.setInheritedAttributes.call(this, e, r, n, o);
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                var o, i, s, u;
                                try {
                                    for (
                                        var c = a(this.childNodes), p = c.next();
                                        !p.done;
                                        p = c.next()
                                    ) {
                                        (O = p.value).isKind('mtr') ||
                                            this.replaceChild(
                                                this.factory.create('mtr'),
                                                O,
                                            ).appendChild(O);
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        p && !p.done && (i = c.return) && i.call(c);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                                (r = this.getProperty('scriptlevel') || r),
                                    (e = !(
                                        !this.attributes.getExplicit('displaystyle') &&
                                        !this.attributes.getDefault('displaystyle')
                                    )),
                                    (t = this.addInheritedAttributes(t, {
                                        columnalign: this.attributes.get('columnalign'),
                                        rowalign: 'center',
                                    }));
                                var f = this.attributes.getExplicit('data-cramped'),
                                    h = (0, l.split)(this.attributes.get('rowalign'));
                                try {
                                    for (
                                        var d = a(this.childNodes), y = d.next();
                                        !y.done;
                                        y = d.next()
                                    ) {
                                        var O = y.value;
                                        (t.rowalign[1] = h.shift() || t.rowalign[1]),
                                            O.setInheritedAttributes(t, e, r, !!f);
                                    }
                                } catch (t) {
                                    s = { error: t };
                                } finally {
                                    try {
                                        y && !y.done && (u = d.return) && u.call(d);
                                    } finally {
                                        if (s) throw s.error;
                                    }
                                }
                            }),
                            (e.prototype.verifyChildren = function (e) {
                                for (
                                    var r = null, n = this.factory, o = 0;
                                    o < this.childNodes.length;
                                    o++
                                ) {
                                    var i = this.childNodes[o];
                                    if (i.isKind('mtr')) r = null;
                                    else {
                                        var a = i.isKind('mtd');
                                        if (
                                            (r
                                                ? (this.removeChild(i), o--)
                                                : (r = this.replaceChild(n.create('mtr'), i)),
                                            r.appendChild(a ? i : n.create('mtd', {}, [i])),
                                            !e.fixMtables)
                                        ) {
                                            i.parent.removeChild(i),
                                                (i.parent = this),
                                                a && r.appendChild(n.create('mtd'));
                                            var s = i.mError(
                                                'Children of ' +
                                                    this.kind +
                                                    ' must be mtr or mlabeledtr',
                                                e,
                                                a,
                                            );
                                            r.childNodes[r.childNodes.length - 1].appendChild(s);
                                        }
                                    }
                                }
                                t.prototype.verifyChildren.call(this, e);
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                var e, r;
                                this.getPrevClass(t);
                                try {
                                    for (
                                        var n = a(this.childNodes), o = n.next();
                                        !o.done;
                                        o = n.next()
                                    ) {
                                        o.value.setTeXclass(null);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        o && !o.done && (r = n.return) && r.call(n);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return this;
                            }),
                            (e.defaults = i(i({}, s.AbstractMmlNode.defaults), {
                                align: 'axis',
                                rowalign: 'baseline',
                                columnalign: 'center',
                                groupalign: '{left}',
                                alignmentscope: !0,
                                columnwidth: 'auto',
                                width: 'auto',
                                rowspacing: '1ex',
                                columnspacing: '.8em',
                                rowlines: 'none',
                                columnlines: 'none',
                                frame: 'none',
                                framespacing: '0.4em 0.5ex',
                                equalrows: !1,
                                equalcolumns: !1,
                                displaystyle: !1,
                                side: 'right',
                                minlabelspacing: '0.8em',
                            })),
                            e
                        );
                    })(s.AbstractMmlNode);
                e.MmlMtable = u;
            },
            4359: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMtd = void 0);
                var a = r(9007),
                    s = r(91),
                    l = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mtd';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return -1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.verifyChildren = function (e) {
                                !this.parent || this.parent.isKind('mtr')
                                    ? t.prototype.verifyChildren.call(this, e)
                                    : this.mError(
                                          this.kind +
                                              ' can only be a child of an mtr or mlabeledtr',
                                          e,
                                          !0,
                                      );
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                return (
                                    this.getPrevClass(t), this.childNodes[0].setTeXclass(null), this
                                );
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), {
                                rowspan: 1,
                                columnspan: 1,
                                rowalign: s.INHERIT,
                                columnalign: s.INHERIT,
                                groupalign: s.INHERIT,
                            })),
                            e
                        );
                    })(a.AbstractMmlBaseNode);
                e.MmlMtd = l;
            },
            4770: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlMtext = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.texclass = a.TEXCLASS.ORD), e;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mtext';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'isSpacelike', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i({}, a.AbstractMmlTokenNode.defaults)),
                            e
                        );
                    })(a.AbstractMmlTokenNode);
                e.MmlMtext = s;
            },
            5022: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMlabeledtr = e.MmlMtr = void 0);
                var s = r(9007),
                    l = r(91),
                    u = r(505),
                    c = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'mtr';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                var o, i, s, l;
                                try {
                                    for (
                                        var c = a(this.childNodes), p = c.next();
                                        !p.done;
                                        p = c.next()
                                    ) {
                                        (y = p.value).isKind('mtd') ||
                                            this.replaceChild(
                                                this.factory.create('mtd'),
                                                y,
                                            ).appendChild(y);
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        p && !p.done && (i = c.return) && i.call(c);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                                var f = (0, u.split)(this.attributes.get('columnalign'));
                                1 === this.arity && f.unshift(this.parent.attributes.get('side')),
                                    (t = this.addInheritedAttributes(t, {
                                        rowalign: this.attributes.get('rowalign'),
                                        columnalign: 'center',
                                    }));
                                try {
                                    for (
                                        var h = a(this.childNodes), d = h.next();
                                        !d.done;
                                        d = h.next()
                                    ) {
                                        var y = d.value;
                                        (t.columnalign[1] = f.shift() || t.columnalign[1]),
                                            y.setInheritedAttributes(t, e, r, n);
                                    }
                                } catch (t) {
                                    s = { error: t };
                                } finally {
                                    try {
                                        d && !d.done && (l = h.return) && l.call(h);
                                    } finally {
                                        if (s) throw s.error;
                                    }
                                }
                            }),
                            (e.prototype.verifyChildren = function (e) {
                                var r, n;
                                if (!this.parent || this.parent.isKind('mtable')) {
                                    try {
                                        for (
                                            var o = a(this.childNodes), i = o.next();
                                            !i.done;
                                            i = o.next()
                                        ) {
                                            var s = i.value;
                                            if (!s.isKind('mtd'))
                                                this.replaceChild(
                                                    this.factory.create('mtd'),
                                                    s,
                                                ).appendChild(s),
                                                    e.fixMtables ||
                                                        s.mError(
                                                            'Children of ' +
                                                                this.kind +
                                                                ' must be mtd',
                                                            e,
                                                        );
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            i && !i.done && (n = o.return) && n.call(o);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                    t.prototype.verifyChildren.call(this, e);
                                } else
                                    this.mError(
                                        this.kind + ' can only be a child of an mtable',
                                        e,
                                        !0,
                                    );
                            }),
                            (e.prototype.setTeXclass = function (t) {
                                var e, r;
                                this.getPrevClass(t);
                                try {
                                    for (
                                        var n = a(this.childNodes), o = n.next();
                                        !o.done;
                                        o = n.next()
                                    ) {
                                        o.value.setTeXclass(null);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        o && !o.done && (r = n.return) && r.call(n);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return this;
                            }),
                            (e.defaults = i(i({}, s.AbstractMmlNode.defaults), {
                                rowalign: l.INHERIT,
                                columnalign: l.INHERIT,
                                groupalign: l.INHERIT,
                            })),
                            e
                        );
                    })(s.AbstractMmlNode);
                e.MmlMtr = c;
                var p = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'mlabeledtr';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(c);
                e.MmlMlabeledtr = p;
            },
            5184: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlMover = e.MmlMunder = e.MmlMunderover = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'munderover';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 3;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'base', {
                                get: function () {
                                    return 0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'under', {
                                get: function () {
                                    return 1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'over', {
                                get: function () {
                                    return 2;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'linebreakContainer', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.setChildInheritedAttributes = function (t, e, r, n) {
                                var o = this.childNodes;
                                o[0].setInheritedAttributes(t, e, r, n || !!o[this.over]);
                                var i = !(e || !o[0].coreMO().attributes.get('movablelimits')),
                                    a = this.constructor.ACCENTS;
                                o[1].setInheritedAttributes(
                                    t,
                                    !1,
                                    this.getScriptlevel(a[1], i, r),
                                    n || 1 === this.under,
                                ),
                                    this.setInheritedAccent(1, a[1], e, r, n, i),
                                    o[2] &&
                                        (o[2].setInheritedAttributes(
                                            t,
                                            !1,
                                            this.getScriptlevel(a[2], i, r),
                                            n || 2 === this.under,
                                        ),
                                        this.setInheritedAccent(2, a[2], e, r, n, i));
                            }),
                            (e.prototype.getScriptlevel = function (t, e, r) {
                                return (!e && this.attributes.get(t)) || r++, r;
                            }),
                            (e.prototype.setInheritedAccent = function (t, e, r, n, o, i) {
                                var a = this.childNodes[t];
                                if (null == this.attributes.getExplicit(e) && a.isEmbellished) {
                                    var s = a.coreMO().attributes.get('accent');
                                    this.attributes.setInherited(e, s),
                                        s !== this.attributes.getDefault(e) &&
                                            a.setInheritedAttributes(
                                                {},
                                                r,
                                                this.getScriptlevel(e, i, n),
                                                o,
                                            );
                                }
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), {
                                accent: !1,
                                accentunder: !1,
                                align: 'center',
                            })),
                            (e.ACCENTS = ['', 'accentunder', 'accent']),
                            e
                        );
                    })(a.AbstractMmlBaseNode);
                e.MmlMunderover = s;
                var l = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'munder';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 2;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.defaults = i({}, s.defaults)),
                        e
                    );
                })(s);
                e.MmlMunder = l;
                var u = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'mover';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'arity', {
                            get: function () {
                                return 2;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'over', {
                            get: function () {
                                return 1;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        Object.defineProperty(e.prototype, 'under', {
                            get: function () {
                                return 2;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.defaults = i({}, s.defaults)),
                        (e.ACCENTS = ['', 'accent', 'accentunder']),
                        e
                    );
                })(s);
                e.MmlMover = u;
            },
            9102: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.MmlAnnotation = e.MmlAnnotationXML = e.MmlSemantics = void 0);
                var a = r(9007),
                    s = (function (t) {
                        function e() {
                            return (null !== t && t.apply(this, arguments)) || this;
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'kind', {
                                get: function () {
                                    return 'semantics';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'arity', {
                                get: function () {
                                    return 1;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            Object.defineProperty(e.prototype, 'notParent', {
                                get: function () {
                                    return !0;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.defaults = i(i({}, a.AbstractMmlBaseNode.defaults), {
                                definitionUrl: null,
                                encoding: null,
                            })),
                            e
                        );
                    })(a.AbstractMmlBaseNode);
                e.MmlSemantics = s;
                var l = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'annotation-xml';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.prototype.setChildInheritedAttributes = function () {}),
                        (e.defaults = i(i({}, a.AbstractMmlNode.defaults), {
                            definitionUrl: null,
                            encoding: null,
                            cd: 'mathmlkeys',
                            name: '',
                            src: null,
                        })),
                        e
                    );
                })(a.AbstractMmlNode);
                e.MmlAnnotationXML = l;
                var u = (function (t) {
                    function e() {
                        var e = (null !== t && t.apply(this, arguments)) || this;
                        return (e.properties = { isChars: !0 }), e;
                    }
                    return (
                        o(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return 'annotation';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (e.defaults = i({}, l.defaults)),
                        e
                    );
                })(l);
                e.MmlAnnotation = u;
            },
            6325: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.MmlVisitor = void 0);
                var i = r(3909),
                    a = (function (t) {
                        function e(e) {
                            return (
                                void 0 === e && (e = null),
                                e || (e = new i.MmlFactory()),
                                t.call(this, e) || this
                            );
                        }
                        return (
                            o(e, t),
                            (e.prototype.visitTextNode = function (t) {
                                for (var e = [], r = 1; r < arguments.length; r++)
                                    e[r - 1] = arguments[r];
                            }),
                            (e.prototype.visitXMLNode = function (t) {
                                for (var e = [], r = 1; r < arguments.length; r++)
                                    e[r - 1] = arguments[r];
                            }),
                            e
                        );
                    })(r(8823).AbstractVisitor);
                e.MmlVisitor = a;
            },
            4082: function (t, e, r) {
                var n =
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
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.OPTABLE = e.MMLSPACING = e.getRange = e.RANGES = e.MO = e.OPDEF = void 0);
                var o = r(9007);
                function i(t, e, r, n) {
                    return (
                        void 0 === r && (r = o.TEXCLASS.BIN),
                        void 0 === n && (n = null),
                        [t, e, r, n]
                    );
                }
                (e.OPDEF = i),
                    (e.MO = {
                        ORD: i(0, 0, o.TEXCLASS.ORD),
                        ORD11: i(1, 1, o.TEXCLASS.ORD),
                        ORD21: i(2, 1, o.TEXCLASS.ORD),
                        ORD02: i(0, 2, o.TEXCLASS.ORD),
                        ORD55: i(5, 5, o.TEXCLASS.ORD),
                        NONE: i(0, 0, o.TEXCLASS.NONE),
                        OP: i(1, 2, o.TEXCLASS.OP, {
                            largeop: !0,
                            movablelimits: !0,
                            symmetric: !0,
                        }),
                        OPFIXED: i(1, 2, o.TEXCLASS.OP, { largeop: !0, movablelimits: !0 }),
                        INTEGRAL: i(0, 1, o.TEXCLASS.OP, { largeop: !0, symmetric: !0 }),
                        INTEGRAL2: i(1, 2, o.TEXCLASS.OP, { largeop: !0, symmetric: !0 }),
                        BIN3: i(3, 3, o.TEXCLASS.BIN),
                        BIN4: i(4, 4, o.TEXCLASS.BIN),
                        BIN01: i(0, 1, o.TEXCLASS.BIN),
                        BIN5: i(5, 5, o.TEXCLASS.BIN),
                        TALLBIN: i(4, 4, o.TEXCLASS.BIN, { stretchy: !0 }),
                        BINOP: i(4, 4, o.TEXCLASS.BIN, { largeop: !0, movablelimits: !0 }),
                        REL: i(5, 5, o.TEXCLASS.REL),
                        REL1: i(1, 1, o.TEXCLASS.REL, { stretchy: !0 }),
                        REL4: i(4, 4, o.TEXCLASS.REL),
                        RELSTRETCH: i(5, 5, o.TEXCLASS.REL, { stretchy: !0 }),
                        RELACCENT: i(5, 5, o.TEXCLASS.REL, { accent: !0 }),
                        WIDEREL: i(5, 5, o.TEXCLASS.REL, { accent: !0, stretchy: !0 }),
                        OPEN: i(0, 0, o.TEXCLASS.OPEN, { fence: !0, stretchy: !0, symmetric: !0 }),
                        CLOSE: i(0, 0, o.TEXCLASS.CLOSE, {
                            fence: !0,
                            stretchy: !0,
                            symmetric: !0,
                        }),
                        INNER: i(0, 0, o.TEXCLASS.INNER),
                        PUNCT: i(0, 3, o.TEXCLASS.PUNCT),
                        ACCENT: i(0, 0, o.TEXCLASS.ORD, { accent: !0 }),
                        WIDEACCENT: i(0, 0, o.TEXCLASS.ORD, { accent: !0, stretchy: !0 }),
                    }),
                    (e.RANGES = [
                        [32, 127, o.TEXCLASS.REL, 'mo'],
                        [160, 191, o.TEXCLASS.ORD, 'mo'],
                        [192, 591, o.TEXCLASS.ORD, 'mi'],
                        [688, 879, o.TEXCLASS.ORD, 'mo'],
                        [880, 6688, o.TEXCLASS.ORD, 'mi'],
                        [6832, 6911, o.TEXCLASS.ORD, 'mo'],
                        [6912, 7615, o.TEXCLASS.ORD, 'mi'],
                        [7616, 7679, o.TEXCLASS.ORD, 'mo'],
                        [7680, 8191, o.TEXCLASS.ORD, 'mi'],
                        [8192, 8303, o.TEXCLASS.ORD, 'mo'],
                        [8304, 8351, o.TEXCLASS.ORD, 'mo'],
                        [8448, 8527, o.TEXCLASS.ORD, 'mi'],
                        [8528, 8591, o.TEXCLASS.ORD, 'mn'],
                        [8592, 8703, o.TEXCLASS.REL, 'mo'],
                        [8704, 8959, o.TEXCLASS.BIN, 'mo'],
                        [8960, 9215, o.TEXCLASS.ORD, 'mo'],
                        [9312, 9471, o.TEXCLASS.ORD, 'mn'],
                        [9472, 10223, o.TEXCLASS.ORD, 'mo'],
                        [10224, 10239, o.TEXCLASS.REL, 'mo'],
                        [10240, 10495, o.TEXCLASS.ORD, 'mtext'],
                        [10496, 10623, o.TEXCLASS.REL, 'mo'],
                        [10624, 10751, o.TEXCLASS.ORD, 'mo'],
                        [10752, 11007, o.TEXCLASS.BIN, 'mo'],
                        [11008, 11055, o.TEXCLASS.ORD, 'mo'],
                        [11056, 11087, o.TEXCLASS.REL, 'mo'],
                        [11088, 11263, o.TEXCLASS.ORD, 'mo'],
                        [11264, 11744, o.TEXCLASS.ORD, 'mi'],
                        [11776, 11903, o.TEXCLASS.ORD, 'mo'],
                        [11904, 12255, o.TEXCLASS.ORD, 'mi', 'normal'],
                        [12272, 12351, o.TEXCLASS.ORD, 'mo'],
                        [12352, 42143, o.TEXCLASS.ORD, 'mi', 'normal'],
                        [42192, 43055, o.TEXCLASS.ORD, 'mi'],
                        [43056, 43071, o.TEXCLASS.ORD, 'mn'],
                        [43072, 55295, o.TEXCLASS.ORD, 'mi'],
                        [63744, 64255, o.TEXCLASS.ORD, 'mi', 'normal'],
                        [64256, 65023, o.TEXCLASS.ORD, 'mi'],
                        [65024, 65135, o.TEXCLASS.ORD, 'mo'],
                        [65136, 65791, o.TEXCLASS.ORD, 'mi'],
                        [65792, 65935, o.TEXCLASS.ORD, 'mn'],
                        [65936, 74751, o.TEXCLASS.ORD, 'mi', 'normal'],
                        [74752, 74879, o.TEXCLASS.ORD, 'mn'],
                        [74880, 113823, o.TEXCLASS.ORD, 'mi', 'normal'],
                        [113824, 119391, o.TEXCLASS.ORD, 'mo'],
                        [119648, 119679, o.TEXCLASS.ORD, 'mn'],
                        [119808, 120781, o.TEXCLASS.ORD, 'mi'],
                        [120782, 120831, o.TEXCLASS.ORD, 'mn'],
                        [122624, 129023, o.TEXCLASS.ORD, 'mo'],
                        [129024, 129279, o.TEXCLASS.REL, 'mo'],
                        [129280, 129535, o.TEXCLASS.ORD, 'mo'],
                        [131072, 195103, o.TEXCLASS.ORD, 'mi', 'normnal'],
                    ]),
                    (e.getRange = function (t) {
                        var r,
                            o,
                            i = t.codePointAt(0);
                        try {
                            for (var a = n(e.RANGES), s = a.next(); !s.done; s = a.next()) {
                                var l = s.value;
                                if (i <= l[1]) {
                                    if (i >= l[0]) return l;
                                    break;
                                }
                            }
                        } catch (t) {
                            r = { error: t };
                        } finally {
                            try {
                                s && !s.done && (o = a.return) && o.call(a);
                            } finally {
                                if (r) throw r.error;
                            }
                        }
                        return null;
                    }),
                    (e.MMLSPACING = [
                        [0, 0],
                        [1, 2],
                        [3, 3],
                        [4, 4],
                        [0, 0],
                        [0, 0],
                        [0, 3],
                    ]),
                    (e.OPTABLE = {
                        prefix: {
                            '(': e.MO.OPEN,
                            '+': e.MO.BIN01,
                            '-': e.MO.BIN01,
                            '[': e.MO.OPEN,
                            '{': e.MO.OPEN,
                            '|': e.MO.OPEN,
                            '||': [
                                0,
                                0,
                                o.TEXCLASS.BIN,
                                { fence: !0, stretchy: !0, symmetric: !0 },
                            ],
                            '|||': [
                                0,
                                0,
                                o.TEXCLASS.ORD,
                                { fence: !0, stretchy: !0, symmetric: !0 },
                            ],
                            '\xac': e.MO.ORD21,
                            '\xb1': e.MO.BIN01,
                            '\u2016': [0, 0, o.TEXCLASS.ORD, { fence: !0, stretchy: !0 }],
                            '\u2018': [0, 0, o.TEXCLASS.OPEN, { fence: !0 }],
                            '\u201c': [0, 0, o.TEXCLASS.OPEN, { fence: !0 }],
                            '\u2145': e.MO.ORD21,
                            '\u2146': i(2, 0, o.TEXCLASS.ORD),
                            '\u2200': e.MO.ORD21,
                            '\u2202': e.MO.ORD21,
                            '\u2203': e.MO.ORD21,
                            '\u2204': e.MO.ORD21,
                            '\u2207': e.MO.ORD21,
                            '\u220f': e.MO.OP,
                            '\u2210': e.MO.OP,
                            '\u2211': e.MO.OP,
                            '\u2212': e.MO.BIN01,
                            '\u2213': e.MO.BIN01,
                            '\u221a': [1, 1, o.TEXCLASS.ORD, { stretchy: !0 }],
                            '\u221b': e.MO.ORD11,
                            '\u221c': e.MO.ORD11,
                            '\u2220': e.MO.ORD,
                            '\u2221': e.MO.ORD,
                            '\u2222': e.MO.ORD,
                            '\u222b': e.MO.INTEGRAL,
                            '\u222c': e.MO.INTEGRAL,
                            '\u222d': e.MO.INTEGRAL,
                            '\u222e': e.MO.INTEGRAL,
                            '\u222f': e.MO.INTEGRAL,
                            '\u2230': e.MO.INTEGRAL,
                            '\u2231': e.MO.INTEGRAL,
                            '\u2232': e.MO.INTEGRAL,
                            '\u2233': e.MO.INTEGRAL,
                            '\u22c0': e.MO.OP,
                            '\u22c1': e.MO.OP,
                            '\u22c2': e.MO.OP,
                            '\u22c3': e.MO.OP,
                            '\u2308': e.MO.OPEN,
                            '\u230a': e.MO.OPEN,
                            '\u2329': e.MO.OPEN,
                            '\u2772': e.MO.OPEN,
                            '\u27e6': e.MO.OPEN,
                            '\u27e8': e.MO.OPEN,
                            '\u27ea': e.MO.OPEN,
                            '\u27ec': e.MO.OPEN,
                            '\u27ee': e.MO.OPEN,
                            '\u2980': [0, 0, o.TEXCLASS.ORD, { fence: !0, stretchy: !0 }],
                            '\u2983': e.MO.OPEN,
                            '\u2985': e.MO.OPEN,
                            '\u2987': e.MO.OPEN,
                            '\u2989': e.MO.OPEN,
                            '\u298b': e.MO.OPEN,
                            '\u298d': e.MO.OPEN,
                            '\u298f': e.MO.OPEN,
                            '\u2991': e.MO.OPEN,
                            '\u2993': e.MO.OPEN,
                            '\u2995': e.MO.OPEN,
                            '\u2997': e.MO.OPEN,
                            '\u29fc': e.MO.OPEN,
                            '\u2a00': e.MO.OP,
                            '\u2a01': e.MO.OP,
                            '\u2a02': e.MO.OP,
                            '\u2a03': e.MO.OP,
                            '\u2a04': e.MO.OP,
                            '\u2a05': e.MO.OP,
                            '\u2a06': e.MO.OP,
                            '\u2a07': e.MO.OP,
                            '\u2a08': e.MO.OP,
                            '\u2a09': e.MO.OP,
                            '\u2a0a': e.MO.OP,
                            '\u2a0b': e.MO.INTEGRAL2,
                            '\u2a0c': e.MO.INTEGRAL,
                            '\u2a0d': e.MO.INTEGRAL2,
                            '\u2a0e': e.MO.INTEGRAL2,
                            '\u2a0f': e.MO.INTEGRAL2,
                            '\u2a10': e.MO.OP,
                            '\u2a11': e.MO.OP,
                            '\u2a12': e.MO.OP,
                            '\u2a13': e.MO.OP,
                            '\u2a14': e.MO.OP,
                            '\u2a15': e.MO.INTEGRAL2,
                            '\u2a16': e.MO.INTEGRAL2,
                            '\u2a17': e.MO.INTEGRAL2,
                            '\u2a18': e.MO.INTEGRAL2,
                            '\u2a19': e.MO.INTEGRAL2,
                            '\u2a1a': e.MO.INTEGRAL2,
                            '\u2a1b': e.MO.INTEGRAL2,
                            '\u2a1c': e.MO.INTEGRAL2,
                            '\u2afc': e.MO.OP,
                            '\u2aff': e.MO.OP,
                        },
                        postfix: {
                            '!!': i(1, 0),
                            '!': [1, 0, o.TEXCLASS.CLOSE, null],
                            '"': e.MO.ACCENT,
                            '&': e.MO.ORD,
                            ')': e.MO.CLOSE,
                            '++': i(0, 0),
                            '--': i(0, 0),
                            '..': i(0, 0),
                            '...': e.MO.ORD,
                            "'": e.MO.ACCENT,
                            ']': e.MO.CLOSE,
                            '^': e.MO.WIDEACCENT,
                            _: e.MO.WIDEACCENT,
                            '`': e.MO.ACCENT,
                            '|': e.MO.CLOSE,
                            '}': e.MO.CLOSE,
                            '~': e.MO.WIDEACCENT,
                            '||': [
                                0,
                                0,
                                o.TEXCLASS.BIN,
                                { fence: !0, stretchy: !0, symmetric: !0 },
                            ],
                            '|||': [
                                0,
                                0,
                                o.TEXCLASS.ORD,
                                { fence: !0, stretchy: !0, symmetric: !0 },
                            ],
                            '\xa8': e.MO.ACCENT,
                            '\xaa': e.MO.ACCENT,
                            '\xaf': e.MO.WIDEACCENT,
                            '\xb0': e.MO.ORD,
                            '\xb2': e.MO.ACCENT,
                            '\xb3': e.MO.ACCENT,
                            '\xb4': e.MO.ACCENT,
                            '\xb8': e.MO.ACCENT,
                            '\xb9': e.MO.ACCENT,
                            '\xba': e.MO.ACCENT,
                            '\u02c6': e.MO.WIDEACCENT,
                            '\u02c7': e.MO.WIDEACCENT,
                            '\u02c9': e.MO.WIDEACCENT,
                            '\u02ca': e.MO.ACCENT,
                            '\u02cb': e.MO.ACCENT,
                            '\u02cd': e.MO.WIDEACCENT,
                            '\u02d8': e.MO.ACCENT,
                            '\u02d9': e.MO.ACCENT,
                            '\u02da': e.MO.ACCENT,
                            '\u02dc': e.MO.WIDEACCENT,
                            '\u02dd': e.MO.ACCENT,
                            '\u02f7': e.MO.WIDEACCENT,
                            '\u0302': e.MO.WIDEACCENT,
                            '\u0311': e.MO.ACCENT,
                            '\u03f6': e.MO.REL,
                            '\u2016': [0, 0, o.TEXCLASS.ORD, { fence: !0, stretchy: !0 }],
                            '\u2019': [0, 0, o.TEXCLASS.CLOSE, { fence: !0 }],
                            '\u201a': e.MO.ACCENT,
                            '\u201b': e.MO.ACCENT,
                            '\u201d': [0, 0, o.TEXCLASS.CLOSE, { fence: !0 }],
                            '\u201e': e.MO.ACCENT,
                            '\u201f': e.MO.ACCENT,
                            '\u2032': e.MO.ORD,
                            '\u2033': e.MO.ACCENT,
                            '\u2034': e.MO.ACCENT,
                            '\u2035': e.MO.ACCENT,
                            '\u2036': e.MO.ACCENT,
                            '\u2037': e.MO.ACCENT,
                            '\u203e': e.MO.WIDEACCENT,
                            '\u2057': e.MO.ACCENT,
                            '\u20db': e.MO.ACCENT,
                            '\u20dc': e.MO.ACCENT,
                            '\u2309': e.MO.CLOSE,
                            '\u230b': e.MO.CLOSE,
                            '\u232a': e.MO.CLOSE,
                            '\u23b4': e.MO.WIDEACCENT,
                            '\u23b5': e.MO.WIDEACCENT,
                            '\u23dc': e.MO.WIDEACCENT,
                            '\u23dd': e.MO.WIDEACCENT,
                            '\u23de': e.MO.WIDEACCENT,
                            '\u23df': e.MO.WIDEACCENT,
                            '\u23e0': e.MO.WIDEACCENT,
                            '\u23e1': e.MO.WIDEACCENT,
                            '\u25a0': e.MO.BIN3,
                            '\u25a1': e.MO.BIN3,
                            '\u25aa': e.MO.BIN3,
                            '\u25ab': e.MO.BIN3,
                            '\u25ad': e.MO.BIN3,
                            '\u25ae': e.MO.BIN3,
                            '\u25af': e.MO.BIN3,
                            '\u25b0': e.MO.BIN3,
                            '\u25b1': e.MO.BIN3,
                            '\u25b2': e.MO.BIN4,
                            '\u25b4': e.MO.BIN4,
                            '\u25b6': e.MO.BIN4,
                            '\u25b7': e.MO.BIN4,
                            '\u25b8': e.MO.BIN4,
                            '\u25bc': e.MO.BIN4,
                            '\u25be': e.MO.BIN4,
                            '\u25c0': e.MO.BIN4,
                            '\u25c1': e.MO.BIN4,
                            '\u25c2': e.MO.BIN4,
                            '\u25c4': e.MO.BIN4,
                            '\u25c5': e.MO.BIN4,
                            '\u25c6': e.MO.BIN4,
                            '\u25c7': e.MO.BIN4,
                            '\u25c8': e.MO.BIN4,
                            '\u25c9': e.MO.BIN4,
                            '\u25cc': e.MO.BIN4,
                            '\u25cd': e.MO.BIN4,
                            '\u25ce': e.MO.BIN4,
                            '\u25cf': e.MO.BIN4,
                            '\u25d6': e.MO.BIN4,
                            '\u25d7': e.MO.BIN4,
                            '\u25e6': e.MO.BIN4,
                            '\u266d': e.MO.ORD02,
                            '\u266e': e.MO.ORD02,
                            '\u266f': e.MO.ORD02,
                            '\u2773': e.MO.CLOSE,
                            '\u27e7': e.MO.CLOSE,
                            '\u27e9': e.MO.CLOSE,
                            '\u27eb': e.MO.CLOSE,
                            '\u27ed': e.MO.CLOSE,
                            '\u27ef': e.MO.CLOSE,
                            '\u2980': [0, 0, o.TEXCLASS.ORD, { fence: !0, stretchy: !0 }],
                            '\u2984': e.MO.CLOSE,
                            '\u2986': e.MO.CLOSE,
                            '\u2988': e.MO.CLOSE,
                            '\u298a': e.MO.CLOSE,
                            '\u298c': e.MO.CLOSE,
                            '\u298e': e.MO.CLOSE,
                            '\u2990': e.MO.CLOSE,
                            '\u2992': e.MO.CLOSE,
                            '\u2994': e.MO.CLOSE,
                            '\u2996': e.MO.CLOSE,
                            '\u2998': e.MO.CLOSE,
                            '\u29fd': e.MO.CLOSE,
                        },
                        infix: {
                            '!=': e.MO.BIN4,
                            '#': e.MO.ORD,
                            $: e.MO.ORD,
                            '%': [3, 3, o.TEXCLASS.ORD, null],
                            '&&': e.MO.BIN4,
                            '': e.MO.ORD,
                            '*': e.MO.BIN3,
                            '**': i(1, 1),
                            '*=': e.MO.BIN4,
                            '+': e.MO.BIN4,
                            '+=': e.MO.BIN4,
                            ',': [
                                0,
                                3,
                                o.TEXCLASS.PUNCT,
                                { linebreakstyle: 'after', separator: !0 },
                            ],
                            '-': e.MO.BIN4,
                            '-=': e.MO.BIN4,
                            '->': e.MO.BIN5,
                            '.': [0, 3, o.TEXCLASS.PUNCT, { separator: !0 }],
                            '/': e.MO.ORD11,
                            '//': i(1, 1),
                            '/=': e.MO.BIN4,
                            ':': [1, 2, o.TEXCLASS.REL, null],
                            ':=': e.MO.BIN4,
                            ';': [
                                0,
                                3,
                                o.TEXCLASS.PUNCT,
                                { linebreakstyle: 'after', separator: !0 },
                            ],
                            '<': e.MO.REL,
                            '<=': e.MO.BIN5,
                            '<>': i(1, 1),
                            '=': e.MO.REL,
                            '==': e.MO.BIN4,
                            '>': e.MO.REL,
                            '>=': e.MO.BIN5,
                            '?': [1, 1, o.TEXCLASS.CLOSE, null],
                            '@': e.MO.ORD11,
                            '\\': e.MO.ORD,
                            '^': e.MO.ORD11,
                            _: e.MO.ORD11,
                            '|': [2, 2, o.TEXCLASS.ORD, { fence: !0, stretchy: !0, symmetric: !0 }],
                            '||': [
                                2,
                                2,
                                o.TEXCLASS.BIN,
                                { fence: !0, stretchy: !0, symmetric: !0 },
                            ],
                            '|||': [
                                2,
                                2,
                                o.TEXCLASS.ORD,
                                { fence: !0, stretchy: !0, symmetric: !0 },
                            ],
                            '\xb1': e.MO.BIN4,
                            '\xb7': e.MO.BIN4,
                            '\xd7': e.MO.BIN4,
                            '\xf7': e.MO.BIN4,
                            '\u02b9': e.MO.ORD,
                            '\u0300': e.MO.ACCENT,
                            '\u0301': e.MO.ACCENT,
                            '\u0303': e.MO.WIDEACCENT,
                            '\u0304': e.MO.ACCENT,
                            '\u0306': e.MO.ACCENT,
                            '\u0307': e.MO.ACCENT,
                            '\u0308': e.MO.ACCENT,
                            '\u030c': e.MO.ACCENT,
                            '\u0332': e.MO.WIDEACCENT,
                            '\u0338': e.MO.REL4,
                            '\u2015': [0, 0, o.TEXCLASS.ORD, { stretchy: !0 }],
                            '\u2017': [0, 0, o.TEXCLASS.ORD, { stretchy: !0 }],
                            '\u2020': e.MO.BIN3,
                            '\u2021': e.MO.BIN3,
                            '\u2022': e.MO.BIN4,
                            '\u2026': e.MO.INNER,
                            '\u2043': e.MO.BIN4,
                            '\u2044': e.MO.TALLBIN,
                            '\u2061': e.MO.NONE,
                            '\u2062': e.MO.NONE,
                            '\u2063': [
                                0,
                                0,
                                o.TEXCLASS.NONE,
                                { linebreakstyle: 'after', separator: !0 },
                            ],
                            '\u2064': e.MO.NONE,
                            '\u20d7': e.MO.ACCENT,
                            '\u2111': e.MO.ORD,
                            '\u2113': e.MO.ORD,
                            '\u2118': e.MO.ORD,
                            '\u211c': e.MO.ORD,
                            '\u2190': e.MO.WIDEREL,
                            '\u2191': e.MO.RELSTRETCH,
                            '\u2192': e.MO.WIDEREL,
                            '\u2193': e.MO.RELSTRETCH,
                            '\u2194': e.MO.WIDEREL,
                            '\u2195': e.MO.RELSTRETCH,
                            '\u2196': e.MO.RELSTRETCH,
                            '\u2197': e.MO.RELSTRETCH,
                            '\u2198': e.MO.RELSTRETCH,
                            '\u2199': e.MO.RELSTRETCH,
                            '\u219a': e.MO.RELACCENT,
                            '\u219b': e.MO.RELACCENT,
                            '\u219c': e.MO.WIDEREL,
                            '\u219d': e.MO.WIDEREL,
                            '\u219e': e.MO.WIDEREL,
                            '\u219f': e.MO.WIDEREL,
                            '\u21a0': e.MO.WIDEREL,
                            '\u21a1': e.MO.RELSTRETCH,
                            '\u21a2': e.MO.WIDEREL,
                            '\u21a3': e.MO.WIDEREL,
                            '\u21a4': e.MO.WIDEREL,
                            '\u21a5': e.MO.RELSTRETCH,
                            '\u21a6': e.MO.WIDEREL,
                            '\u21a7': e.MO.RELSTRETCH,
                            '\u21a8': e.MO.RELSTRETCH,
                            '\u21a9': e.MO.WIDEREL,
                            '\u21aa': e.MO.WIDEREL,
                            '\u21ab': e.MO.WIDEREL,
                            '\u21ac': e.MO.WIDEREL,
                            '\u21ad': e.MO.WIDEREL,
                            '\u21ae': e.MO.RELACCENT,
                            '\u21af': e.MO.RELSTRETCH,
                            '\u21b0': e.MO.RELSTRETCH,
                            '\u21b1': e.MO.RELSTRETCH,
                            '\u21b2': e.MO.RELSTRETCH,
                            '\u21b3': e.MO.RELSTRETCH,
                            '\u21b4': e.MO.RELSTRETCH,
                            '\u21b5': e.MO.RELSTRETCH,
                            '\u21b6': e.MO.RELACCENT,
                            '\u21b7': e.MO.RELACCENT,
                            '\u21b8': e.MO.REL,
                            '\u21b9': e.MO.WIDEREL,
                            '\u21ba': e.MO.REL,
                            '\u21bb': e.MO.REL,
                            '\u21bc': e.MO.WIDEREL,
                            '\u21bd': e.MO.WIDEREL,
                            '\u21be': e.MO.RELSTRETCH,
                            '\u21bf': e.MO.RELSTRETCH,
                            '\u21c0': e.MO.WIDEREL,
                            '\u21c1': e.MO.WIDEREL,
                            '\u21c2': e.MO.RELSTRETCH,
                            '\u21c3': e.MO.RELSTRETCH,
                            '\u21c4': e.MO.WIDEREL,
                            '\u21c5': e.MO.RELSTRETCH,
                            '\u21c6': e.MO.WIDEREL,
                            '\u21c7': e.MO.WIDEREL,
                            '\u21c8': e.MO.RELSTRETCH,
                            '\u21c9': e.MO.WIDEREL,
                            '\u21ca': e.MO.RELSTRETCH,
                            '\u21cb': e.MO.WIDEREL,
                            '\u21cc': e.MO.WIDEREL,
                            '\u21cd': e.MO.RELACCENT,
                            '\u21ce': e.MO.RELACCENT,
                            '\u21cf': e.MO.RELACCENT,
                            '\u21d0': e.MO.WIDEREL,
                            '\u21d1': e.MO.RELSTRETCH,
                            '\u21d2': e.MO.WIDEREL,
                            '\u21d3': e.MO.RELSTRETCH,
                            '\u21d4': e.MO.WIDEREL,
                            '\u21d5': e.MO.RELSTRETCH,
                            '\u21d6': e.MO.RELSTRETCH,
                            '\u21d7': e.MO.RELSTRETCH,
                            '\u21d8': e.MO.RELSTRETCH,
                            '\u21d9': e.MO.RELSTRETCH,
                            '\u21da': e.MO.WIDEREL,
                            '\u21db': e.MO.WIDEREL,
                            '\u21dc': e.MO.WIDEREL,
                            '\u21dd': e.MO.WIDEREL,
                            '\u21de': e.MO.REL,
                            '\u21df': e.MO.REL,
                            '\u21e0': e.MO.WIDEREL,
                            '\u21e1': e.MO.RELSTRETCH,
                            '\u21e2': e.MO.WIDEREL,
                            '\u21e3': e.MO.RELSTRETCH,
                            '\u21e4': e.MO.WIDEREL,
                            '\u21e5': e.MO.WIDEREL,
                            '\u21e6': e.MO.WIDEREL,
                            '\u21e7': e.MO.RELSTRETCH,
                            '\u21e8': e.MO.WIDEREL,
                            '\u21e9': e.MO.RELSTRETCH,
                            '\u21ea': e.MO.RELSTRETCH,
                            '\u21eb': e.MO.RELSTRETCH,
                            '\u21ec': e.MO.RELSTRETCH,
                            '\u21ed': e.MO.RELSTRETCH,
                            '\u21ee': e.MO.RELSTRETCH,
                            '\u21ef': e.MO.RELSTRETCH,
                            '\u21f0': e.MO.WIDEREL,
                            '\u21f1': e.MO.REL,
                            '\u21f2': e.MO.REL,
                            '\u21f3': e.MO.RELSTRETCH,
                            '\u21f4': e.MO.RELACCENT,
                            '\u21f5': e.MO.RELSTRETCH,
                            '\u21f6': e.MO.WIDEREL,
                            '\u21f7': e.MO.RELACCENT,
                            '\u21f8': e.MO.RELACCENT,
                            '\u21f9': e.MO.RELACCENT,
                            '\u21fa': e.MO.RELACCENT,
                            '\u21fb': e.MO.RELACCENT,
                            '\u21fc': e.MO.RELACCENT,
                            '\u21fd': e.MO.WIDEREL,
                            '\u21fe': e.MO.WIDEREL,
                            '\u21ff': e.MO.WIDEREL,
                            '\u2201': i(1, 2, o.TEXCLASS.ORD),
                            '\u2205': e.MO.ORD,
                            '\u2206': e.MO.BIN3,
                            '\u2208': e.MO.REL,
                            '\u2209': e.MO.REL,
                            '\u220a': e.MO.REL,
                            '\u220b': e.MO.REL,
                            '\u220c': e.MO.REL,
                            '\u220d': e.MO.REL,
                            '\u220e': e.MO.BIN3,
                            '\u2212': e.MO.BIN4,
                            '\u2213': e.MO.BIN4,
                            '\u2214': e.MO.BIN4,
                            '\u2215': e.MO.TALLBIN,
                            '\u2216': e.MO.BIN4,
                            '\u2217': e.MO.BIN4,
                            '\u2218': e.MO.BIN4,
                            '\u2219': e.MO.BIN4,
                            '\u221d': e.MO.REL,
                            '\u221e': e.MO.ORD,
                            '\u221f': e.MO.REL,
                            '\u2223': e.MO.REL,
                            '\u2224': e.MO.REL,
                            '\u2225': e.MO.REL,
                            '\u2226': e.MO.REL,
                            '\u2227': e.MO.BIN4,
                            '\u2228': e.MO.BIN4,
                            '\u2229': e.MO.BIN4,
                            '\u222a': e.MO.BIN4,
                            '\u2234': e.MO.REL,
                            '\u2235': e.MO.REL,
                            '\u2236': e.MO.REL,
                            '\u2237': e.MO.REL,
                            '\u2238': e.MO.BIN4,
                            '\u2239': e.MO.REL,
                            '\u223a': e.MO.BIN4,
                            '\u223b': e.MO.REL,
                            '\u223c': e.MO.REL,
                            '\u223d': e.MO.REL,
                            '\u223d\u0331': e.MO.BIN3,
                            '\u223e': e.MO.REL,
                            '\u223f': e.MO.BIN3,
                            '\u2240': e.MO.BIN4,
                            '\u2241': e.MO.REL,
                            '\u2242': e.MO.REL,
                            '\u2242\u0338': e.MO.REL,
                            '\u2243': e.MO.REL,
                            '\u2244': e.MO.REL,
                            '\u2245': e.MO.REL,
                            '\u2246': e.MO.REL,
                            '\u2247': e.MO.REL,
                            '\u2248': e.MO.REL,
                            '\u2249': e.MO.REL,
                            '\u224a': e.MO.REL,
                            '\u224b': e.MO.REL,
                            '\u224c': e.MO.REL,
                            '\u224d': e.MO.REL,
                            '\u224e': e.MO.REL,
                            '\u224e\u0338': e.MO.REL,
                            '\u224f': e.MO.REL,
                            '\u224f\u0338': e.MO.REL,
                            '\u2250': e.MO.REL,
                            '\u2251': e.MO.REL,
                            '\u2252': e.MO.REL,
                            '\u2253': e.MO.REL,
                            '\u2254': e.MO.REL,
                            '\u2255': e.MO.REL,
                            '\u2256': e.MO.REL,
                            '\u2257': e.MO.REL,
                            '\u2258': e.MO.REL,
                            '\u2259': e.MO.REL,
                            '\u225a': e.MO.REL,
                            '\u225b': e.MO.REL,
                            '\u225c': e.MO.REL,
                            '\u225d': e.MO.REL,
                            '\u225e': e.MO.REL,
                            '\u225f': e.MO.REL,
                            '\u2260': e.MO.REL,
                            '\u2261': e.MO.REL,
                            '\u2262': e.MO.REL,
                            '\u2263': e.MO.REL,
                            '\u2264': e.MO.REL,
                            '\u2265': e.MO.REL,
                            '\u2266': e.MO.REL,
                            '\u2266\u0338': e.MO.REL,
                            '\u2267': e.MO.REL,
                            '\u2268': e.MO.REL,
                            '\u2269': e.MO.REL,
                            '\u226a': e.MO.REL,
                            '\u226a\u0338': e.MO.REL,
                            '\u226b': e.MO.REL,
                            '\u226b\u0338': e.MO.REL,
                            '\u226c': e.MO.REL,
                            '\u226d': e.MO.REL,
                            '\u226e': e.MO.REL,
                            '\u226f': e.MO.REL,
                            '\u2270': e.MO.REL,
                            '\u2271': e.MO.REL,
                            '\u2272': e.MO.REL,
                            '\u2273': e.MO.REL,
                            '\u2274': e.MO.REL,
                            '\u2275': e.MO.REL,
                            '\u2276': e.MO.REL,
                            '\u2277': e.MO.REL,
                            '\u2278': e.MO.REL,
                            '\u2279': e.MO.REL,
                            '\u227a': e.MO.REL,
                            '\u227b': e.MO.REL,
                            '\u227c': e.MO.REL,
                            '\u227d': e.MO.REL,
                            '\u227e': e.MO.REL,
                            '\u227f': e.MO.REL,
                            '\u227f\u0338': e.MO.REL,
                            '\u2280': e.MO.REL,
                            '\u2281': e.MO.REL,
                            '\u2282': e.MO.REL,
                            '\u2282\u20d2': e.MO.REL,
                            '\u2283': e.MO.REL,
                            '\u2283\u20d2': e.MO.REL,
                            '\u2284': e.MO.REL,
                            '\u2285': e.MO.REL,
                            '\u2286': e.MO.REL,
                            '\u2287': e.MO.REL,
                            '\u2288': e.MO.REL,
                            '\u2289': e.MO.REL,
                            '\u228a': e.MO.REL,
                            '\u228b': e.MO.REL,
                            '\u228c': e.MO.BIN4,
                            '\u228d': e.MO.BIN4,
                            '\u228e': e.MO.BIN4,
                            '\u228f': e.MO.REL,
                            '\u228f\u0338': e.MO.REL,
                            '\u2290': e.MO.REL,
                            '\u2290\u0338': e.MO.REL,
                            '\u2291': e.MO.REL,
                            '\u2292': e.MO.REL,
                            '\u2293': e.MO.BIN4,
                            '\u2294': e.MO.BIN4,
                            '\u2295': e.MO.BIN4,
                            '\u2296': e.MO.BIN4,
                            '\u2297': e.MO.BIN4,
                            '\u2298': e.MO.BIN4,
                            '\u2299': e.MO.BIN4,
                            '\u229a': e.MO.BIN4,
                            '\u229b': e.MO.BIN4,
                            '\u229c': e.MO.BIN4,
                            '\u229d': e.MO.BIN4,
                            '\u229e': e.MO.BIN4,
                            '\u229f': e.MO.BIN4,
                            '\u22a0': e.MO.BIN4,
                            '\u22a1': e.MO.BIN4,
                            '\u22a2': e.MO.REL,
                            '\u22a3': e.MO.REL,
                            '\u22a4': e.MO.ORD55,
                            '\u22a5': e.MO.REL,
                            '\u22a6': e.MO.REL,
                            '\u22a7': e.MO.REL,
                            '\u22a8': e.MO.REL,
                            '\u22a9': e.MO.REL,
                            '\u22aa': e.MO.REL,
                            '\u22ab': e.MO.REL,
                            '\u22ac': e.MO.REL,
                            '\u22ad': e.MO.REL,
                            '\u22ae': e.MO.REL,
                            '\u22af': e.MO.REL,
                            '\u22b0': e.MO.REL,
                            '\u22b1': e.MO.REL,
                            '\u22b2': e.MO.REL,
                            '\u22b3': e.MO.REL,
                            '\u22b4': e.MO.REL,
                            '\u22b5': e.MO.REL,
                            '\u22b6': e.MO.REL,
                            '\u22b7': e.MO.REL,
                            '\u22b8': e.MO.REL,
                            '\u22b9': e.MO.REL,
                            '\u22ba': e.MO.BIN4,
                            '\u22bb': e.MO.BIN4,
                            '\u22bc': e.MO.BIN4,
                            '\u22bd': e.MO.BIN4,
                            '\u22be': e.MO.BIN3,
                            '\u22bf': e.MO.BIN3,
                            '\u22c4': e.MO.BIN4,
                            '\u22c5': e.MO.BIN4,
                            '\u22c6': e.MO.BIN4,
                            '\u22c7': e.MO.BIN4,
                            '\u22c8': e.MO.REL,
                            '\u22c9': e.MO.BIN4,
                            '\u22ca': e.MO.BIN4,
                            '\u22cb': e.MO.BIN4,
                            '\u22cc': e.MO.BIN4,
                            '\u22cd': e.MO.REL,
                            '\u22ce': e.MO.BIN4,
                            '\u22cf': e.MO.BIN4,
                            '\u22d0': e.MO.REL,
                            '\u22d1': e.MO.REL,
                            '\u22d2': e.MO.BIN4,
                            '\u22d3': e.MO.BIN4,
                            '\u22d4': e.MO.REL,
                            '\u22d5': e.MO.REL,
                            '\u22d6': e.MO.REL,
                            '\u22d7': e.MO.REL,
                            '\u22d8': e.MO.REL,
                            '\u22d9': e.MO.REL,
                            '\u22da': e.MO.REL,
                            '\u22db': e.MO.REL,
                            '\u22dc': e.MO.REL,
                            '\u22dd': e.MO.REL,
                            '\u22de': e.MO.REL,
                            '\u22df': e.MO.REL,
                            '\u22e0': e.MO.REL,
                            '\u22e1': e.MO.REL,
                            '\u22e2': e.MO.REL,
                            '\u22e3': e.MO.REL,
                            '\u22e4': e.MO.REL,
                            '\u22e5': e.MO.REL,
                            '\u22e6': e.MO.REL,
                            '\u22e7': e.MO.REL,
                            '\u22e8': e.MO.REL,
                            '\u22e9': e.MO.REL,
                            '\u22ea': e.MO.REL,
                            '\u22eb': e.MO.REL,
                            '\u22ec': e.MO.REL,
                            '\u22ed': e.MO.REL,
                            '\u22ee': e.MO.ORD55,
                            '\u22ef': e.MO.INNER,
                            '\u22f0': e.MO.REL,
                            '\u22f1': [5, 5, o.TEXCLASS.INNER, null],
                            '\u22f2': e.MO.REL,
                            '\u22f3': e.MO.REL,
                            '\u22f4': e.MO.REL,
                            '\u22f5': e.MO.REL,
                            '\u22f6': e.MO.REL,
                            '\u22f7': e.MO.REL,
                            '\u22f8': e.MO.REL,
                            '\u22f9': e.MO.REL,
                            '\u22fa': e.MO.REL,
                            '\u22fb': e.MO.REL,
                            '\u22fc': e.MO.REL,
                            '\u22fd': e.MO.REL,
                            '\u22fe': e.MO.REL,
                            '\u22ff': e.MO.REL,
                            '\u2305': e.MO.BIN3,
                            '\u2306': e.MO.BIN3,
                            '\u2322': e.MO.REL4,
                            '\u2323': e.MO.REL4,
                            '\u2329': e.MO.OPEN,
                            '\u232a': e.MO.CLOSE,
                            '\u23aa': e.MO.ORD,
                            '\u23af': [0, 0, o.TEXCLASS.ORD, { stretchy: !0 }],
                            '\u23b0': e.MO.OPEN,
                            '\u23b1': e.MO.CLOSE,
                            '\u2500': e.MO.ORD,
                            '\u25b3': e.MO.BIN4,
                            '\u25b5': e.MO.BIN4,
                            '\u25b9': e.MO.BIN4,
                            '\u25bd': e.MO.BIN4,
                            '\u25bf': e.MO.BIN4,
                            '\u25c3': e.MO.BIN4,
                            '\u25ef': e.MO.BIN3,
                            '\u2660': e.MO.ORD,
                            '\u2661': e.MO.ORD,
                            '\u2662': e.MO.ORD,
                            '\u2663': e.MO.ORD,
                            '\u2758': e.MO.REL,
                            '\u27f0': e.MO.RELSTRETCH,
                            '\u27f1': e.MO.RELSTRETCH,
                            '\u27f5': e.MO.WIDEREL,
                            '\u27f6': e.MO.WIDEREL,
                            '\u27f7': e.MO.WIDEREL,
                            '\u27f8': e.MO.WIDEREL,
                            '\u27f9': e.MO.WIDEREL,
                            '\u27fa': e.MO.WIDEREL,
                            '\u27fb': e.MO.WIDEREL,
                            '\u27fc': e.MO.WIDEREL,
                            '\u27fd': e.MO.WIDEREL,
                            '\u27fe': e.MO.WIDEREL,
                            '\u27ff': e.MO.WIDEREL,
                            '\u2900': e.MO.RELACCENT,
                            '\u2901': e.MO.RELACCENT,
                            '\u2902': e.MO.RELACCENT,
                            '\u2903': e.MO.RELACCENT,
                            '\u2904': e.MO.RELACCENT,
                            '\u2905': e.MO.RELACCENT,
                            '\u2906': e.MO.RELACCENT,
                            '\u2907': e.MO.RELACCENT,
                            '\u2908': e.MO.REL,
                            '\u2909': e.MO.REL,
                            '\u290a': e.MO.RELSTRETCH,
                            '\u290b': e.MO.RELSTRETCH,
                            '\u290c': e.MO.WIDEREL,
                            '\u290d': e.MO.WIDEREL,
                            '\u290e': e.MO.WIDEREL,
                            '\u290f': e.MO.WIDEREL,
                            '\u2910': e.MO.WIDEREL,
                            '\u2911': e.MO.RELACCENT,
                            '\u2912': e.MO.RELSTRETCH,
                            '\u2913': e.MO.RELSTRETCH,
                            '\u2914': e.MO.RELACCENT,
                            '\u2915': e.MO.RELACCENT,
                            '\u2916': e.MO.RELACCENT,
                            '\u2917': e.MO.RELACCENT,
                            '\u2918': e.MO.RELACCENT,
                            '\u2919': e.MO.RELACCENT,
                            '\u291a': e.MO.RELACCENT,
                            '\u291b': e.MO.RELACCENT,
                            '\u291c': e.MO.RELACCENT,
                            '\u291d': e.MO.RELACCENT,
                            '\u291e': e.MO.RELACCENT,
                            '\u291f': e.MO.RELACCENT,
                            '\u2920': e.MO.RELACCENT,
                            '\u2921': e.MO.RELSTRETCH,
                            '\u2922': e.MO.RELSTRETCH,
                            '\u2923': e.MO.REL,
                            '\u2924': e.MO.REL,
                            '\u2925': e.MO.REL,
                            '\u2926': e.MO.REL,
                            '\u2927': e.MO.REL,
                            '\u2928': e.MO.REL,
                            '\u2929': e.MO.REL,
                            '\u292a': e.MO.REL,
                            '\u292b': e.MO.REL,
                            '\u292c': e.MO.REL,
                            '\u292d': e.MO.REL,
                            '\u292e': e.MO.REL,
                            '\u292f': e.MO.REL,
                            '\u2930': e.MO.REL,
                            '\u2931': e.MO.REL,
                            '\u2932': e.MO.REL,
                            '\u2933': e.MO.RELACCENT,
                            '\u2934': e.MO.REL,
                            '\u2935': e.MO.REL,
                            '\u2936': e.MO.REL,
                            '\u2937': e.MO.REL,
                            '\u2938': e.MO.REL,
                            '\u2939': e.MO.REL,
                            '\u293a': e.MO.RELACCENT,
                            '\u293b': e.MO.RELACCENT,
                            '\u293c': e.MO.RELACCENT,
                            '\u293d': e.MO.RELACCENT,
                            '\u293e': e.MO.REL,
                            '\u293f': e.MO.REL,
                            '\u2940': e.MO.REL,
                            '\u2941': e.MO.REL,
                            '\u2942': e.MO.RELACCENT,
                            '\u2943': e.MO.RELACCENT,
                            '\u2944': e.MO.RELACCENT,
                            '\u2945': e.MO.RELACCENT,
                            '\u2946': e.MO.RELACCENT,
                            '\u2947': e.MO.RELACCENT,
                            '\u2948': e.MO.RELACCENT,
                            '\u2949': e.MO.REL,
                            '\u294a': e.MO.RELACCENT,
                            '\u294b': e.MO.RELACCENT,
                            '\u294c': e.MO.REL,
                            '\u294d': e.MO.REL,
                            '\u294e': e.MO.WIDEREL,
                            '\u294f': e.MO.RELSTRETCH,
                            '\u2950': e.MO.WIDEREL,
                            '\u2951': e.MO.RELSTRETCH,
                            '\u2952': e.MO.WIDEREL,
                            '\u2953': e.MO.WIDEREL,
                            '\u2954': e.MO.RELSTRETCH,
                            '\u2955': e.MO.RELSTRETCH,
                            '\u2956': e.MO.RELSTRETCH,
                            '\u2957': e.MO.RELSTRETCH,
                            '\u2958': e.MO.RELSTRETCH,
                            '\u2959': e.MO.RELSTRETCH,
                            '\u295a': e.MO.WIDEREL,
                            '\u295b': e.MO.WIDEREL,
                            '\u295c': e.MO.RELSTRETCH,
                            '\u295d': e.MO.RELSTRETCH,
                            '\u295e': e.MO.WIDEREL,
                            '\u295f': e.MO.WIDEREL,
                            '\u2960': e.MO.RELSTRETCH,
                            '\u2961': e.MO.RELSTRETCH,
                            '\u2962': e.MO.RELACCENT,
                            '\u2963': e.MO.REL,
                            '\u2964': e.MO.RELACCENT,
                            '\u2965': e.MO.REL,
                            '\u2966': e.MO.RELACCENT,
                            '\u2967': e.MO.RELACCENT,
                            '\u2968': e.MO.RELACCENT,
                            '\u2969': e.MO.RELACCENT,
                            '\u296a': e.MO.RELACCENT,
                            '\u296b': e.MO.RELACCENT,
                            '\u296c': e.MO.RELACCENT,
                            '\u296d': e.MO.RELACCENT,
                            '\u296e': e.MO.RELSTRETCH,
                            '\u296f': e.MO.RELSTRETCH,
                            '\u2970': e.MO.RELACCENT,
                            '\u2971': e.MO.RELACCENT,
                            '\u2972': e.MO.RELACCENT,
                            '\u2973': e.MO.RELACCENT,
                            '\u2974': e.MO.RELACCENT,
                            '\u2975': e.MO.RELACCENT,
                            '\u2976': e.MO.RELACCENT,
                            '\u2977': e.MO.RELACCENT,
                            '\u2978': e.MO.RELACCENT,
                            '\u2979': e.MO.RELACCENT,
                            '\u297a': e.MO.RELACCENT,
                            '\u297b': e.MO.RELACCENT,
                            '\u297c': e.MO.RELACCENT,
                            '\u297d': e.MO.RELACCENT,
                            '\u297e': e.MO.REL,
                            '\u297f': e.MO.REL,
                            '\u2981': e.MO.BIN3,
                            '\u2982': e.MO.BIN3,
                            '\u2999': e.MO.BIN3,
                            '\u299a': e.MO.BIN3,
                            '\u299b': e.MO.BIN3,
                            '\u299c': e.MO.BIN3,
                            '\u299d': e.MO.BIN3,
                            '\u299e': e.MO.BIN3,
                            '\u299f': e.MO.BIN3,
                            '\u29a0': e.MO.BIN3,
                            '\u29a1': e.MO.BIN3,
                            '\u29a2': e.MO.BIN3,
                            '\u29a3': e.MO.BIN3,
                            '\u29a4': e.MO.BIN3,
                            '\u29a5': e.MO.BIN3,
                            '\u29a6': e.MO.BIN3,
                            '\u29a7': e.MO.BIN3,
                            '\u29a8': e.MO.BIN3,
                            '\u29a9': e.MO.BIN3,
                            '\u29aa': e.MO.BIN3,
                            '\u29ab': e.MO.BIN3,
                            '\u29ac': e.MO.BIN3,
                            '\u29ad': e.MO.BIN3,
                            '\u29ae': e.MO.BIN3,
                            '\u29af': e.MO.BIN3,
                            '\u29b0': e.MO.BIN3,
                            '\u29b1': e.MO.BIN3,
                            '\u29b2': e.MO.BIN3,
                            '\u29b3': e.MO.BIN3,
                            '\u29b4': e.MO.BIN3,
                            '\u29b5': e.MO.BIN3,
                            '\u29b6': e.MO.BIN4,
                            '\u29b7': e.MO.BIN4,
                            '\u29b8': e.MO.BIN4,
                            '\u29b9': e.MO.BIN4,
                            '\u29ba': e.MO.BIN4,
                            '\u29bb': e.MO.BIN4,
                            '\u29bc': e.MO.BIN4,
                            '\u29bd': e.MO.BIN4,
                            '\u29be': e.MO.BIN4,
                            '\u29bf': e.MO.BIN4,
                            '\u29c0': e.MO.REL,
                            '\u29c1': e.MO.REL,
                            '\u29c2': e.MO.BIN3,
                            '\u29c3': e.MO.BIN3,
                            '\u29c4': e.MO.BIN4,
                            '\u29c5': e.MO.BIN4,
                            '\u29c6': e.MO.BIN4,
                            '\u29c7': e.MO.BIN4,
                            '\u29c8': e.MO.BIN4,
                            '\u29c9': e.MO.BIN3,
                            '\u29ca': e.MO.BIN3,
                            '\u29cb': e.MO.BIN3,
                            '\u29cc': e.MO.BIN3,
                            '\u29cd': e.MO.BIN3,
                            '\u29ce': e.MO.REL,
                            '\u29cf': e.MO.REL,
                            '\u29cf\u0338': e.MO.REL,
                            '\u29d0': e.MO.REL,
                            '\u29d0\u0338': e.MO.REL,
                            '\u29d1': e.MO.REL,
                            '\u29d2': e.MO.REL,
                            '\u29d3': e.MO.REL,
                            '\u29d4': e.MO.REL,
                            '\u29d5': e.MO.REL,
                            '\u29d6': e.MO.BIN4,
                            '\u29d7': e.MO.BIN4,
                            '\u29d8': e.MO.BIN3,
                            '\u29d9': e.MO.BIN3,
                            '\u29db': e.MO.BIN3,
                            '\u29dc': e.MO.BIN3,
                            '\u29dd': e.MO.BIN3,
                            '\u29de': e.MO.REL,
                            '\u29df': e.MO.BIN3,
                            '\u29e0': e.MO.BIN3,
                            '\u29e1': e.MO.REL,
                            '\u29e2': e.MO.BIN4,
                            '\u29e3': e.MO.REL,
                            '\u29e4': e.MO.REL,
                            '\u29e5': e.MO.REL,
                            '\u29e6': e.MO.REL,
                            '\u29e7': e.MO.BIN3,
                            '\u29e8': e.MO.BIN3,
                            '\u29e9': e.MO.BIN3,
                            '\u29ea': e.MO.BIN3,
                            '\u29eb': e.MO.BIN3,
                            '\u29ec': e.MO.BIN3,
                            '\u29ed': e.MO.BIN3,
                            '\u29ee': e.MO.BIN3,
                            '\u29ef': e.MO.BIN3,
                            '\u29f0': e.MO.BIN3,
                            '\u29f1': e.MO.BIN3,
                            '\u29f2': e.MO.BIN3,
                            '\u29f3': e.MO.BIN3,
                            '\u29f4': e.MO.REL,
                            '\u29f5': e.MO.BIN4,
                            '\u29f6': e.MO.BIN4,
                            '\u29f7': e.MO.BIN4,
                            '\u29f8': e.MO.BIN3,
                            '\u29f9': e.MO.BIN3,
                            '\u29fa': e.MO.BIN3,
                            '\u29fb': e.MO.BIN3,
                            '\u29fe': e.MO.BIN4,
                            '\u29ff': e.MO.BIN4,
                            '\u2a1d': e.MO.BIN3,
                            '\u2a1e': e.MO.BIN3,
                            '\u2a1f': e.MO.BIN3,
                            '\u2a20': e.MO.BIN3,
                            '\u2a21': e.MO.BIN3,
                            '\u2a22': e.MO.BIN4,
                            '\u2a23': e.MO.BIN4,
                            '\u2a24': e.MO.BIN4,
                            '\u2a25': e.MO.BIN4,
                            '\u2a26': e.MO.BIN4,
                            '\u2a27': e.MO.BIN4,
                            '\u2a28': e.MO.BIN4,
                            '\u2a29': e.MO.BIN4,
                            '\u2a2a': e.MO.BIN4,
                            '\u2a2b': e.MO.BIN4,
                            '\u2a2c': e.MO.BIN4,
                            '\u2a2d': e.MO.BIN4,
                            '\u2a2e': e.MO.BIN4,
                            '\u2a2f': e.MO.BIN4,
                            '\u2a30': e.MO.BIN4,
                            '\u2a31': e.MO.BIN4,
                            '\u2a32': e.MO.BIN4,
                            '\u2a33': e.MO.BIN4,
                            '\u2a34': e.MO.BIN4,
                            '\u2a35': e.MO.BIN4,
                            '\u2a36': e.MO.BIN4,
                            '\u2a37': e.MO.BIN4,
                            '\u2a38': e.MO.BIN4,
                            '\u2a39': e.MO.BIN4,
                            '\u2a3a': e.MO.BIN4,
                            '\u2a3b': e.MO.BIN4,
                            '\u2a3c': e.MO.BIN4,
                            '\u2a3d': e.MO.BIN4,
                            '\u2a3e': e.MO.BIN4,
                            '\u2a3f': e.MO.BIN4,
                            '\u2a40': e.MO.BIN4,
                            '\u2a41': e.MO.BIN4,
                            '\u2a42': e.MO.BIN4,
                            '\u2a43': e.MO.BIN4,
                            '\u2a44': e.MO.BIN4,
                            '\u2a45': e.MO.BIN4,
                            '\u2a46': e.MO.BIN4,
                            '\u2a47': e.MO.BIN4,
                            '\u2a48': e.MO.BIN4,
                            '\u2a49': e.MO.BIN4,
                            '\u2a4a': e.MO.BIN4,
                            '\u2a4b': e.MO.BIN4,
                            '\u2a4c': e.MO.BIN4,
                            '\u2a4d': e.MO.BIN4,
                            '\u2a4e': e.MO.BIN4,
                            '\u2a4f': e.MO.BIN4,
                            '\u2a50': e.MO.BIN4,
                            '\u2a51': e.MO.BIN4,
                            '\u2a52': e.MO.BIN4,
                            '\u2a53': e.MO.BIN4,
                            '\u2a54': e.MO.BIN4,
                            '\u2a55': e.MO.BIN4,
                            '\u2a56': e.MO.BIN4,
                            '\u2a57': e.MO.BIN4,
                            '\u2a58': e.MO.BIN4,
                            '\u2a59': e.MO.REL,
                            '\u2a5a': e.MO.BIN4,
                            '\u2a5b': e.MO.BIN4,
                            '\u2a5c': e.MO.BIN4,
                            '\u2a5d': e.MO.BIN4,
                            '\u2a5e': e.MO.BIN4,
                            '\u2a5f': e.MO.BIN4,
                            '\u2a60': e.MO.BIN4,
                            '\u2a61': e.MO.BIN4,
                            '\u2a62': e.MO.BIN4,
                            '\u2a63': e.MO.BIN4,
                            '\u2a64': e.MO.BIN4,
                            '\u2a65': e.MO.BIN4,
                            '\u2a66': e.MO.REL,
                            '\u2a67': e.MO.REL,
                            '\u2a68': e.MO.REL,
                            '\u2a69': e.MO.REL,
                            '\u2a6a': e.MO.REL,
                            '\u2a6b': e.MO.REL,
                            '\u2a6c': e.MO.REL,
                            '\u2a6d': e.MO.REL,
                            '\u2a6e': e.MO.REL,
                            '\u2a6f': e.MO.REL,
                            '\u2a70': e.MO.REL,
                            '\u2a71': e.MO.BIN4,
                            '\u2a72': e.MO.BIN4,
                            '\u2a73': e.MO.REL,
                            '\u2a74': e.MO.REL,
                            '\u2a75': e.MO.REL,
                            '\u2a76': e.MO.REL,
                            '\u2a77': e.MO.REL,
                            '\u2a78': e.MO.REL,
                            '\u2a79': e.MO.REL,
                            '\u2a7a': e.MO.REL,
                            '\u2a7b': e.MO.REL,
                            '\u2a7c': e.MO.REL,
                            '\u2a7d': e.MO.REL,
                            '\u2a7d\u0338': e.MO.REL,
                            '\u2a7e': e.MO.REL,
                            '\u2a7e\u0338': e.MO.REL,
                            '\u2a7f': e.MO.REL,
                            '\u2a80': e.MO.REL,
                            '\u2a81': e.MO.REL,
                            '\u2a82': e.MO.REL,
                            '\u2a83': e.MO.REL,
                            '\u2a84': e.MO.REL,
                            '\u2a85': e.MO.REL,
                            '\u2a86': e.MO.REL,
                            '\u2a87': e.MO.REL,
                            '\u2a88': e.MO.REL,
                            '\u2a89': e.MO.REL,
                            '\u2a8a': e.MO.REL,
                            '\u2a8b': e.MO.REL,
                            '\u2a8c': e.MO.REL,
                            '\u2a8d': e.MO.REL,
                            '\u2a8e': e.MO.REL,
                            '\u2a8f': e.MO.REL,
                            '\u2a90': e.MO.REL,
                            '\u2a91': e.MO.REL,
                            '\u2a92': e.MO.REL,
                            '\u2a93': e.MO.REL,
                            '\u2a94': e.MO.REL,
                            '\u2a95': e.MO.REL,
                            '\u2a96': e.MO.REL,
                            '\u2a97': e.MO.REL,
                            '\u2a98': e.MO.REL,
                            '\u2a99': e.MO.REL,
                            '\u2a9a': e.MO.REL,
                            '\u2a9b': e.MO.REL,
                            '\u2a9c': e.MO.REL,
                            '\u2a9d': e.MO.REL,
                            '\u2a9e': e.MO.REL,
                            '\u2a9f': e.MO.REL,
                            '\u2aa0': e.MO.REL,
                            '\u2aa1': e.MO.REL,
                            '\u2aa1\u0338': e.MO.REL,
                            '\u2aa2': e.MO.REL,
                            '\u2aa2\u0338': e.MO.REL,
                            '\u2aa3': e.MO.REL,
                            '\u2aa4': e.MO.REL,
                            '\u2aa5': e.MO.REL,
                            '\u2aa6': e.MO.REL,
                            '\u2aa7': e.MO.REL,
                            '\u2aa8': e.MO.REL,
                            '\u2aa9': e.MO.REL,
                            '\u2aaa': e.MO.REL,
                            '\u2aab': e.MO.REL,
                            '\u2aac': e.MO.REL,
                            '\u2aad': e.MO.REL,
                            '\u2aae': e.MO.REL,
                            '\u2aaf': e.MO.REL,
                            '\u2aaf\u0338': e.MO.REL,
                            '\u2ab0': e.MO.REL,
                            '\u2ab0\u0338': e.MO.REL,
                            '\u2ab1': e.MO.REL,
                            '\u2ab2': e.MO.REL,
                            '\u2ab3': e.MO.REL,
                            '\u2ab4': e.MO.REL,
                            '\u2ab5': e.MO.REL,
                            '\u2ab6': e.MO.REL,
                            '\u2ab7': e.MO.REL,
                            '\u2ab8': e.MO.REL,
                            '\u2ab9': e.MO.REL,
                            '\u2aba': e.MO.REL,
                            '\u2abb': e.MO.REL,
                            '\u2abc': e.MO.REL,
                            '\u2abd': e.MO.REL,
                            '\u2abe': e.MO.REL,
                            '\u2abf': e.MO.REL,
                            '\u2ac0': e.MO.REL,
                            '\u2ac1': e.MO.REL,
                            '\u2ac2': e.MO.REL,
                            '\u2ac3': e.MO.REL,
                            '\u2ac4': e.MO.REL,
                            '\u2ac5': e.MO.REL,
                            '\u2ac6': e.MO.REL,
                            '\u2ac7': e.MO.REL,
                            '\u2ac8': e.MO.REL,
                            '\u2ac9': e.MO.REL,
                            '\u2aca': e.MO.REL,
                            '\u2acb': e.MO.REL,
                            '\u2acc': e.MO.REL,
                            '\u2acd': e.MO.REL,
                            '\u2ace': e.MO.REL,
                            '\u2acf': e.MO.REL,
                            '\u2ad0': e.MO.REL,
                            '\u2ad1': e.MO.REL,
                            '\u2ad2': e.MO.REL,
                            '\u2ad3': e.MO.REL,
                            '\u2ad4': e.MO.REL,
                            '\u2ad5': e.MO.REL,
                            '\u2ad6': e.MO.REL,
                            '\u2ad7': e.MO.REL,
                            '\u2ad8': e.MO.REL,
                            '\u2ad9': e.MO.REL,
                            '\u2ada': e.MO.REL,
                            '\u2adb': e.MO.REL,
                            '\u2add': e.MO.REL,
                            '\u2add\u0338': e.MO.REL,
                            '\u2ade': e.MO.REL,
                            '\u2adf': e.MO.REL,
                            '\u2ae0': e.MO.REL,
                            '\u2ae1': e.MO.REL,
                            '\u2ae2': e.MO.REL,
                            '\u2ae3': e.MO.REL,
                            '\u2ae4': e.MO.REL,
                            '\u2ae5': e.MO.REL,
                            '\u2ae6': e.MO.REL,
                            '\u2ae7': e.MO.REL,
                            '\u2ae8': e.MO.REL,
                            '\u2ae9': e.MO.REL,
                            '\u2aea': e.MO.REL,
                            '\u2aeb': e.MO.REL,
                            '\u2aec': e.MO.REL,
                            '\u2aed': e.MO.REL,
                            '\u2aee': e.MO.REL,
                            '\u2aef': e.MO.REL,
                            '\u2af0': e.MO.REL,
                            '\u2af1': e.MO.REL,
                            '\u2af2': e.MO.REL,
                            '\u2af3': e.MO.REL,
                            '\u2af4': e.MO.BIN4,
                            '\u2af5': e.MO.BIN4,
                            '\u2af6': e.MO.BIN4,
                            '\u2af7': e.MO.REL,
                            '\u2af8': e.MO.REL,
                            '\u2af9': e.MO.REL,
                            '\u2afa': e.MO.REL,
                            '\u2afb': e.MO.BIN4,
                            '\u2afd': e.MO.BIN4,
                            '\u2afe': e.MO.BIN3,
                            '\u2b45': e.MO.RELSTRETCH,
                            '\u2b46': e.MO.RELSTRETCH,
                            '\u3008': e.MO.OPEN,
                            '\u3009': e.MO.CLOSE,
                            '\ufe37': e.MO.WIDEACCENT,
                            '\ufe38': e.MO.WIDEACCENT,
                        },
                    }),
                    (e.OPTABLE.infix['^'] = e.MO.WIDEREL),
                    (e.OPTABLE.infix._ = e.MO.WIDEREL),
                    (e.OPTABLE.infix['\u2adc'] = e.MO.REL);
            },
            9259: function (t, e, r) {
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
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.SerializedMmlVisitor = e.toEntity = e.DATAMJX = void 0);
                var s = r(6325),
                    l = r(9007),
                    u = r(450);
                e.DATAMJX = 'data-mjx-';
                e.toEntity = function (t) {
                    return '&#x' + t.codePointAt(0).toString(16).toUpperCase() + ';';
                };
                var c = (function (t) {
                    function r() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(r, t),
                        (r.prototype.visitTree = function (t) {
                            return this.visitNode(t, '');
                        }),
                        (r.prototype.visitTextNode = function (t, e) {
                            return this.quoteHTML(t.getText());
                        }),
                        (r.prototype.visitXMLNode = function (t, e) {
                            return e + t.getSerializedXML();
                        }),
                        (r.prototype.visitInferredMrowNode = function (t, e) {
                            var r,
                                n,
                                o = [];
                            try {
                                for (var a = i(t.childNodes), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    o.push(this.visitNode(l, e));
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
                            return o.join('\n');
                        }),
                        (r.prototype.visitTeXAtomNode = function (t, e) {
                            var r = this.childNodeMml(t, e + '  ', '\n');
                            return (
                                e +
                                '<mrow' +
                                this.getAttributes(t) +
                                '>' +
                                (r.match(/\S/) ? '\n' + r + e : '') +
                                '</mrow>'
                            );
                        }),
                        (r.prototype.visitAnnotationNode = function (t, e) {
                            return (
                                e +
                                '<annotation' +
                                this.getAttributes(t) +
                                '>' +
                                this.childNodeMml(t, '', '') +
                                '</annotation>'
                            );
                        }),
                        (r.prototype.visitDefault = function (t, e) {
                            var r = t.kind,
                                n = a(
                                    t.isToken || 0 === t.childNodes.length ? ['', ''] : ['\n', e],
                                    2,
                                ),
                                o = n[0],
                                i = n[1],
                                s = this.childNodeMml(t, e + '  ', o);
                            return (
                                e +
                                '<' +
                                r +
                                this.getAttributes(t) +
                                '>' +
                                (s.match(/\S/) ? o + s + i : '') +
                                '</' +
                                r +
                                '>'
                            );
                        }),
                        (r.prototype.childNodeMml = function (t, e, r) {
                            var n,
                                o,
                                a = '';
                            try {
                                for (var s = i(t.childNodes), l = s.next(); !l.done; l = s.next()) {
                                    var u = l.value;
                                    a += this.visitNode(u, e) + r;
                                }
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (o = s.return) && o.call(s);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return a;
                        }),
                        (r.prototype.getAttributes = function (t) {
                            var e,
                                r,
                                n = [],
                                o = this.constructor.defaultAttributes[t.kind] || {},
                                a = Object.assign(
                                    {},
                                    o,
                                    this.getDataAttributes(t),
                                    t.attributes.getAllAttributes(),
                                ),
                                s = this.constructor.variants;
                            a.hasOwnProperty('mathvariant') &&
                                s.hasOwnProperty(a.mathvariant) &&
                                (a.mathvariant = s[a.mathvariant]);
                            try {
                                for (
                                    var l = i(Object.keys(a)), u = l.next();
                                    !u.done;
                                    u = l.next()
                                ) {
                                    var c = u.value,
                                        p = String(a[c]);
                                    void 0 !== p && n.push(c + '="' + this.quoteHTML(p) + '"');
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    u && !u.done && (r = l.return) && r.call(l);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return n.length ? ' ' + n.join(' ') : '';
                        }),
                        (r.prototype.getDataAttributes = function (t) {
                            var e = {},
                                r = t.attributes.getExplicit('mathvariant'),
                                n = this.constructor.variants;
                            r && n.hasOwnProperty(r) && this.setDataAttribute(e, 'variant', r),
                                t.getProperty('variantForm') &&
                                    this.setDataAttribute(e, 'alternate', '1'),
                                t.getProperty('pseudoscript') &&
                                    this.setDataAttribute(e, 'pseudoscript', 'true'),
                                !1 === t.getProperty('autoOP') &&
                                    this.setDataAttribute(e, 'auto-op', 'false');
                            var o = t.getProperty('scriptalign');
                            o && this.setDataAttribute(e, 'script-align', o);
                            var i = t.getProperty('texClass');
                            if (void 0 !== i) {
                                var a = !0;
                                if (i === l.TEXCLASS.OP && t.isKind('mi')) {
                                    var s = t.getText();
                                    a = !(s.length > 1 && s.match(u.MmlMi.operatorName));
                                }
                                a &&
                                    this.setDataAttribute(
                                        e,
                                        'texclass',
                                        i < 0 ? 'NONE' : l.TEXCLASSNAMES[i],
                                    );
                            }
                            return (
                                t.getProperty('scriptlevel') &&
                                    !1 === t.getProperty('useHeight') &&
                                    this.setDataAttribute(e, 'smallmatrix', 'true'),
                                e
                            );
                        }),
                        (r.prototype.setDataAttribute = function (t, r, n) {
                            t[e.DATAMJX + r] = n;
                        }),
                        (r.prototype.quoteHTML = function (t) {
                            return t
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/\"/g, '&quot;')
                                .replace(/[\uD800-\uDBFF]./g, e.toEntity)
                                .replace(/[\u0080-\uD7FF\uE000-\uFFFF]/g, e.toEntity);
                        }),
                        (r.variants = {
                            '-tex-calligraphic': 'script',
                            '-tex-bold-calligraphic': 'bold-script',
                            '-tex-oldstyle': 'normal',
                            '-tex-bold-oldstyle': 'bold',
                            '-tex-mathit': 'italic',
                        }),
                        (r.defaultAttributes = {
                            math: { xmlns: 'http://www.w3.org/1998/Math/MathML' },
                        }),
                        r
                    );
                })(s.MmlVisitor);
                e.SerializedMmlVisitor = c;
            },
            2975: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractOutputJax = void 0);
                var n = r(7233),
                    o = r(7525),
                    i = (function () {
                        function t(t) {
                            void 0 === t && (t = {}), (this.adaptor = null);
                            var e = this.constructor;
                            (this.options = (0, n.userOptions)(
                                (0, n.defaultOptions)({}, e.OPTIONS),
                                t,
                            )),
                                (this.postFilters = new o.FunctionList());
                        }
                        return (
                            Object.defineProperty(t.prototype, 'name', {
                                get: function () {
                                    return this.constructor.NAME;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (t.prototype.setAdaptor = function (t) {
                                this.adaptor = t;
                            }),
                            (t.prototype.initialize = function () {}),
                            (t.prototype.reset = function () {
                                for (var t = [], e = 0; e < arguments.length; e++)
                                    t[e] = arguments[e];
                            }),
                            (t.prototype.getMetrics = function (t) {}),
                            (t.prototype.styleSheet = function (t) {
                                return null;
                            }),
                            (t.prototype.pageElements = function (t) {
                                return null;
                            }),
                            (t.prototype.executeFilters = function (t, e, r, n) {
                                var o = { math: e, document: r, data: n };
                                return t.execute(o), o.data;
                            }),
                            (t.NAME = 'generic'),
                            (t.OPTIONS = {}),
                            t
                        );
                    })();
                e.AbstractOutputJax = i;
            },
            4574: function (t, e) {
                var r =
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
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AbstractFactory = void 0);
                var i = (function () {
                    function t(t) {
                        var e, n;
                        void 0 === t && (t = null),
                            (this.defaultKind = 'unknown'),
                            (this.nodeMap = new Map()),
                            (this.node = {}),
                            null === t && (t = this.constructor.defaultNodes);
                        try {
                            for (var o = r(Object.keys(t)), i = o.next(); !i.done; i = o.next()) {
                                var a = i.value;
                                this.setNodeClass(a, t[a]);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                i && !i.done && (n = o.return) && n.call(o);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                    }
                    return (
                        (t.prototype.create = function (t) {
                            for (var e = [], r = 1; r < arguments.length; r++)
                                e[r - 1] = arguments[r];
                            return (this.node[t] || this.node[this.defaultKind]).apply(
                                void 0,
                                o([], n(e), !1),
                            );
                        }),
                        (t.prototype.setNodeClass = function (t, e) {
                            this.nodeMap.set(t, e);
                            var r = this,
                                i = this.nodeMap.get(t);
                            this.node[t] = function () {
                                for (var t = [], e = 0; e < arguments.length; e++)
                                    t[e] = arguments[e];
                                return new (i.bind.apply(i, o([void 0, r], n(t), !1)))();
                            };
                        }),
                        (t.prototype.getNodeClass = function (t) {
                            return this.nodeMap.get(t);
                        }),
                        (t.prototype.deleteNodeClass = function (t) {
                            this.nodeMap.delete(t), delete this.node[t];
                        }),
                        (t.prototype.nodeIsKind = function (t, e) {
                            return t instanceof this.getNodeClass(e);
                        }),
                        (t.prototype.getKinds = function () {
                            return Array.from(this.nodeMap.keys());
                        }),
                        (t.defaultNodes = {}),
                        t
                    );
                })();
                e.AbstractFactory = i;
            },
            4596: function (t, e) {
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
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
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
                            function n() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((n.prototype = e.prototype), new n()));
                        }),
                    o =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (o =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, r = 1, n = arguments.length; r < n; r++)
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                o.apply(this, arguments)
                            );
                        },
                    i =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractEmptyNode = e.AbstractNode = void 0);
                var a = (function () {
                    function t(t, e, r) {
                        var n, o;
                        void 0 === e && (e = {}),
                            void 0 === r && (r = []),
                            (this.factory = t),
                            (this.parent = null),
                            (this.properties = {}),
                            (this.childNodes = []);
                        try {
                            for (var a = i(Object.keys(e)), s = a.next(); !s.done; s = a.next()) {
                                var l = s.value;
                                this.setProperty(l, e[l]);
                            }
                        } catch (t) {
                            n = { error: t };
                        } finally {
                            try {
                                s && !s.done && (o = a.return) && o.call(a);
                            } finally {
                                if (n) throw n.error;
                            }
                        }
                        r.length && this.setChildren(r);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'kind', {
                            get: function () {
                                return 'unknown';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.setProperty = function (t, e) {
                            this.properties[t] = e;
                        }),
                        (t.prototype.getProperty = function (t) {
                            return this.properties[t];
                        }),
                        (t.prototype.getPropertyNames = function () {
                            return Object.keys(this.properties);
                        }),
                        (t.prototype.getAllProperties = function () {
                            return this.properties;
                        }),
                        (t.prototype.removeProperty = function () {
                            for (var t, e, r = [], n = 0; n < arguments.length; n++)
                                r[n] = arguments[n];
                            try {
                                for (var o = i(r), a = o.next(); !a.done; a = o.next()) {
                                    var s = a.value;
                                    delete this.properties[s];
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    a && !a.done && (e = o.return) && e.call(o);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                        }),
                        (t.prototype.isKind = function (t) {
                            return this.factory.nodeIsKind(this, t);
                        }),
                        (t.prototype.setChildren = function (t) {
                            var e, r;
                            this.childNodes = [];
                            try {
                                for (var n = i(t), o = n.next(); !o.done; o = n.next()) {
                                    var a = o.value;
                                    this.appendChild(a);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    o && !o.done && (r = n.return) && r.call(n);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (t.prototype.appendChild = function (t) {
                            return this.childNodes.push(t), (t.parent = this), t;
                        }),
                        (t.prototype.replaceChild = function (t, e) {
                            var r = this.childIndex(e);
                            return (
                                null !== r &&
                                    ((this.childNodes[r] = t),
                                    (t.parent = this),
                                    (e.parent = null)),
                                t
                            );
                        }),
                        (t.prototype.removeChild = function (t) {
                            var e = this.childIndex(t);
                            return (
                                null !== e && (this.childNodes.splice(e, 1), (t.parent = null)), t
                            );
                        }),
                        (t.prototype.childIndex = function (t) {
                            var e = this.childNodes.indexOf(t);
                            return -1 === e ? null : e;
                        }),
                        (t.prototype.copy = function () {
                            var t,
                                e,
                                r = this.factory.create(this.kind);
                            r.properties = o({}, this.properties);
                            try {
                                for (
                                    var n = i(this.childNodes || []), a = n.next();
                                    !a.done;
                                    a = n.next()
                                ) {
                                    var s = a.value;
                                    s && r.appendChild(s.copy());
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    a && !a.done && (e = n.return) && e.call(n);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return r;
                        }),
                        (t.prototype.findNodes = function (t) {
                            var e = [];
                            return (
                                this.walkTree(function (r) {
                                    r.isKind(t) && e.push(r);
                                }),
                                e
                            );
                        }),
                        (t.prototype.walkTree = function (t, e) {
                            var r, n;
                            t(this, e);
                            try {
                                for (
                                    var o = i(this.childNodes), a = o.next();
                                    !a.done;
                                    a = o.next()
                                ) {
                                    var s = a.value;
                                    s && s.walkTree(t, e);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (n = o.return) && n.call(o);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                            return e;
                        }),
                        (t.prototype.toString = function () {
                            return this.kind + '(' + this.childNodes.join(',') + ')';
                        }),
                        t
                    );
                })();
                e.AbstractNode = a;
                var s = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        n(e, t),
                        (e.prototype.setChildren = function (t) {}),
                        (e.prototype.appendChild = function (t) {
                            return t;
                        }),
                        (e.prototype.replaceChild = function (t, e) {
                            return e;
                        }),
                        (e.prototype.childIndex = function (t) {
                            return null;
                        }),
                        (e.prototype.walkTree = function (t, e) {
                            return t(this, e), e;
                        }),
                        (e.prototype.toString = function () {
                            return this.kind;
                        }),
                        e
                    );
                })(a);
                e.AbstractEmptyNode = s;
            },
            7860: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractNodeFactory = void 0);
                var i = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.create = function (t, e, r) {
                            return (
                                void 0 === e && (e = {}),
                                void 0 === r && (r = []),
                                this.node[t](e, r)
                            );
                        }),
                        e
                    );
                })(r(4574).AbstractFactory);
                e.AbstractNodeFactory = i;
            },
            8823: function (t, e, r) {
                var n =
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
                    o =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    i =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AbstractVisitor = void 0);
                var a = r(4596),
                    s = (function () {
                        function t(e) {
                            var r, o;
                            this.nodeHandlers = new Map();
                            try {
                                for (var i = n(e.getKinds()), a = i.next(); !a.done; a = i.next()) {
                                    var s = a.value,
                                        l = this[t.methodName(s)];
                                    l && this.nodeHandlers.set(s, l);
                                }
                            } catch (t) {
                                r = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (o = i.return) && o.call(i);
                                } finally {
                                    if (r) throw r.error;
                                }
                            }
                        }
                        return (
                            (t.methodName = function (t) {
                                return (
                                    'visit' +
                                    (t.charAt(0).toUpperCase() + t.substr(1)).replace(
                                        /[^a-z0-9_]/gi,
                                        '_',
                                    ) +
                                    'Node'
                                );
                            }),
                            (t.prototype.visitTree = function (t) {
                                for (var e = [], r = 1; r < arguments.length; r++)
                                    e[r - 1] = arguments[r];
                                return this.visitNode.apply(this, i([t], o(e), !1));
                            }),
                            (t.prototype.visitNode = function (t) {
                                for (var e = [], r = 1; r < arguments.length; r++)
                                    e[r - 1] = arguments[r];
                                var n = this.nodeHandlers.get(t.kind) || this.visitDefault;
                                return n.call.apply(n, i([this, t], o(e), !1));
                            }),
                            (t.prototype.visitDefault = function (t) {
                                for (var e, r, s = [], l = 1; l < arguments.length; l++)
                                    s[l - 1] = arguments[l];
                                if (t instanceof a.AbstractNode)
                                    try {
                                        for (
                                            var u = n(t.childNodes), c = u.next();
                                            !c.done;
                                            c = u.next()
                                        ) {
                                            var p = c.value;
                                            this.visitNode.apply(this, i([p], o(s), !1));
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            c && !c.done && (r = u.return) && r.call(u);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                            }),
                            (t.prototype.setNodeHandler = function (t, e) {
                                this.nodeHandlers.set(t, e);
                            }),
                            (t.prototype.removeNodeHandler = function (t) {
                                this.nodeHandlers.delete(t);
                            }),
                            t
                        );
                    })();
                e.AbstractVisitor = s;
            },
            8912: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.AbstractWrapper = void 0);
                var r = (function () {
                    function t(t, e) {
                        (this.factory = t), (this.node = e);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'kind', {
                            get: function () {
                                return this.node.kind;
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.wrap = function (t) {
                            return this.factory.wrap(t);
                        }),
                        t
                    );
                })();
                e.AbstractWrapper = r;
            },
            3811: function (t, e, r) {
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
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractWrapperFactory = void 0);
                var s = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.wrap = function (t) {
                            for (var e = [], r = 1; r < arguments.length; r++)
                                e[r - 1] = arguments[r];
                            return this.create.apply(this, a([t.kind, t], i(e), !1));
                        }),
                        e
                    );
                })(r(4574).AbstractFactory);
                e.AbstractWrapperFactory = s;
            },
            6272: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.RegisterHTMLHandler = void 0);
                var n = r(5713),
                    o = r(3726);
                e.RegisterHTMLHandler = function (t) {
                    var e = new o.HTMLHandler(t);
                    return n.mathjax.handlers.register(e), e;
                };
            },
            3683: function (t, e, r) {
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
                                            for (var o in (e = arguments[r]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    s =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HTMLDocument = void 0);
                var l = r(5722),
                    u = r(7233),
                    c = r(3363),
                    p = r(3335),
                    f = r(5138),
                    h = r(4474),
                    d = (function (t) {
                        function e(e, r, n) {
                            var o = this,
                                i = a((0, u.separateOptions)(n, f.HTMLDomStrings.OPTIONS), 2),
                                s = i[0],
                                l = i[1];
                            return (
                                ((o = t.call(this, e, r, s) || this).domStrings =
                                    o.options.DomStrings || new f.HTMLDomStrings(l)),
                                (o.domStrings.adaptor = r),
                                (o.styles = []),
                                o
                            );
                        }
                        return (
                            o(e, t),
                            (e.prototype.findPosition = function (t, e, r, n) {
                                var o,
                                    i,
                                    l = this.adaptor;
                                try {
                                    for (var u = s(n[t]), c = u.next(); !c.done; c = u.next()) {
                                        var p = c.value,
                                            f = a(p, 2),
                                            h = f[0],
                                            d = f[1];
                                        if (e <= d && '#text' === l.kind(h))
                                            return { node: h, n: Math.max(e, 0), delim: r };
                                        e -= d;
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        c && !c.done && (i = u.return) && i.call(u);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                                return { node: null, n: 0, delim: r };
                            }),
                            (e.prototype.mathItem = function (t, e, r) {
                                var n = t.math,
                                    o = this.findPosition(t.n, t.start.n, t.open, r),
                                    i = this.findPosition(t.n, t.end.n, t.close, r);
                                return new this.options.MathItem(n, e, t.display, o, i);
                            }),
                            (e.prototype.findMath = function (t) {
                                var e, r, n, o, i, l, c, p, f;
                                if (!this.processed.isSet('findMath')) {
                                    (this.adaptor.document = this.document),
                                        (t = (0, u.userOptions)(
                                            {
                                                elements: this.options.elements || [
                                                    this.adaptor.body(this.document),
                                                ],
                                            },
                                            t,
                                        ));
                                    try {
                                        for (
                                            var h = s(
                                                    this.adaptor.getElements(
                                                        t.elements,
                                                        this.document,
                                                    ),
                                                ),
                                                d = h.next();
                                            !d.done;
                                            d = h.next()
                                        ) {
                                            var y = d.value,
                                                O = a([null, null], 2),
                                                M = O[0],
                                                E = O[1];
                                            try {
                                                for (
                                                    var v = ((n = void 0), s(this.inputJax)),
                                                        m = v.next();
                                                    !m.done;
                                                    m = v.next()
                                                ) {
                                                    var b = m.value,
                                                        g = new this.options.MathList();
                                                    if (b.processStrings) {
                                                        null === M &&
                                                            ((M = (i = a(
                                                                this.domStrings.find(y),
                                                                2,
                                                            ))[0]),
                                                            (E = i[1]));
                                                        try {
                                                            for (
                                                                var L =
                                                                        ((l = void 0),
                                                                        s(b.findMath(M))),
                                                                    N = L.next();
                                                                !N.done;
                                                                N = L.next()
                                                            ) {
                                                                var R = N.value;
                                                                g.push(this.mathItem(R, b, E));
                                                            }
                                                        } catch (t) {
                                                            l = { error: t };
                                                        } finally {
                                                            try {
                                                                N &&
                                                                    !N.done &&
                                                                    (c = L.return) &&
                                                                    c.call(L);
                                                            } finally {
                                                                if (l) throw l.error;
                                                            }
                                                        }
                                                    } else
                                                        try {
                                                            for (
                                                                var T =
                                                                        ((p = void 0),
                                                                        s(b.findMath(y))),
                                                                    S = T.next();
                                                                !S.done;
                                                                S = T.next()
                                                            ) {
                                                                R = S.value;
                                                                var A = new this.options.MathItem(
                                                                    R.math,
                                                                    b,
                                                                    R.display,
                                                                    R.start,
                                                                    R.end,
                                                                );
                                                                g.push(A);
                                                            }
                                                        } catch (t) {
                                                            p = { error: t };
                                                        } finally {
                                                            try {
                                                                S &&
                                                                    !S.done &&
                                                                    (f = T.return) &&
                                                                    f.call(T);
                                                            } finally {
                                                                if (p) throw p.error;
                                                            }
                                                        }
                                                    this.math.merge(g);
                                                }
                                            } catch (t) {
                                                n = { error: t };
                                            } finally {
                                                try {
                                                    m && !m.done && (o = v.return) && o.call(v);
                                                } finally {
                                                    if (n) throw n.error;
                                                }
                                            }
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            d && !d.done && (r = h.return) && r.call(h);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                    this.processed.set('findMath');
                                }
                                return this;
                            }),
                            (e.prototype.updateDocument = function () {
                                return (
                                    this.processed.isSet('updateDocument') ||
                                        (this.addPageElements(),
                                        this.addStyleSheet(),
                                        t.prototype.updateDocument.call(this),
                                        this.processed.set('updateDocument')),
                                    this
                                );
                            }),
                            (e.prototype.addPageElements = function () {
                                var t = this.adaptor.body(this.document),
                                    e = this.documentPageElements();
                                e && this.adaptor.append(t, e);
                            }),
                            (e.prototype.addStyleSheet = function () {
                                var t = this.documentStyleSheet(),
                                    e = this.adaptor;
                                if (t && !e.parent(t)) {
                                    var r = e.head(this.document),
                                        n = this.findSheet(r, e.getAttribute(t, 'id'));
                                    n ? e.replace(t, n) : e.append(r, t);
                                }
                            }),
                            (e.prototype.findSheet = function (t, e) {
                                var r, n;
                                if (e)
                                    try {
                                        for (
                                            var o = s(this.adaptor.tags(t, 'style')), i = o.next();
                                            !i.done;
                                            i = o.next()
                                        ) {
                                            var a = i.value;
                                            if (this.adaptor.getAttribute(a, 'id') === e) return a;
                                        }
                                    } catch (t) {
                                        r = { error: t };
                                    } finally {
                                        try {
                                            i && !i.done && (n = o.return) && n.call(o);
                                        } finally {
                                            if (r) throw r.error;
                                        }
                                    }
                                return null;
                            }),
                            (e.prototype.removeFromDocument = function (t) {
                                var e, r;
                                if (
                                    (void 0 === t && (t = !1),
                                    this.processed.isSet('updateDocument'))
                                )
                                    try {
                                        for (
                                            var n = s(this.math), o = n.next();
                                            !o.done;
                                            o = n.next()
                                        ) {
                                            var i = o.value;
                                            i.state() >= h.STATE.INSERTED &&
                                                i.state(h.STATE.TYPESET, t);
                                        }
                                    } catch (t) {
                                        e = { error: t };
                                    } finally {
                                        try {
                                            o && !o.done && (r = n.return) && r.call(n);
                                        } finally {
                                            if (e) throw e.error;
                                        }
                                    }
                                return this.processed.clear('updateDocument'), this;
                            }),
                            (e.prototype.documentStyleSheet = function () {
                                return this.outputJax.styleSheet(this);
                            }),
                            (e.prototype.documentPageElements = function () {
                                return this.outputJax.pageElements(this);
                            }),
                            (e.prototype.addStyles = function (t) {
                                this.styles.push(t);
                            }),
                            (e.prototype.getStyles = function () {
                                return this.styles;
                            }),
                            (e.KIND = 'HTML'),
                            (e.OPTIONS = i(i({}, l.AbstractMathDocument.OPTIONS), {
                                renderActions: (0, u.expandable)(
                                    i(i({}, l.AbstractMathDocument.OPTIONS.renderActions), {
                                        styles: [h.STATE.INSERTED + 1, '', 'updateStyleSheet', !1],
                                    }),
                                ),
                                MathList: p.HTMLMathList,
                                MathItem: c.HTMLMathItem,
                                DomStrings: null,
                            })),
                            e
                        );
                    })(l.AbstractMathDocument);
                e.HTMLDocument = d;
            },
            5138: function (t, e, r) {
                var n =
                    (this && this.__read) ||
                    function (t, e) {
                        var r = 'function' == typeof Symbol && t[Symbol.iterator];
                        if (!r) return t;
                        var n,
                            o,
                            i = r.call(t),
                            a = [];
                        try {
                            for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                a.push(n.value);
                        } catch (t) {
                            o = { error: t };
                        } finally {
                            try {
                                n && !n.done && (r = i.return) && r.call(i);
                            } finally {
                                if (o) throw o.error;
                            }
                        }
                        return a;
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HTMLDomStrings = void 0);
                var o = r(7233),
                    i = (function () {
                        function t(t) {
                            void 0 === t && (t = null);
                            var e = this.constructor;
                            (this.options = (0, o.userOptions)(
                                (0, o.defaultOptions)({}, e.OPTIONS),
                                t,
                            )),
                                this.init(),
                                this.getPatterns();
                        }
                        return (
                            (t.prototype.init = function () {
                                (this.strings = []),
                                    (this.string = ''),
                                    (this.snodes = []),
                                    (this.nodes = []),
                                    (this.stack = []);
                            }),
                            (t.prototype.getPatterns = function () {
                                var t = (0, o.makeArray)(this.options.skipHtmlTags),
                                    e = (0, o.makeArray)(this.options.ignoreHtmlClass),
                                    r = (0, o.makeArray)(this.options.processHtmlClass);
                                (this.skipHtmlTags = new RegExp('^(?:' + t.join('|') + ')$', 'i')),
                                    (this.ignoreHtmlClass = new RegExp(
                                        '(?:^| )(?:' + e.join('|') + ')(?: |$)',
                                    )),
                                    (this.processHtmlClass = new RegExp(
                                        '(?:^| )(?:' + r + ')(?: |$)',
                                    ));
                            }),
                            (t.prototype.pushString = function () {
                                this.string.match(/\S/) &&
                                    (this.strings.push(this.string), this.nodes.push(this.snodes)),
                                    (this.string = ''),
                                    (this.snodes = []);
                            }),
                            (t.prototype.extendString = function (t, e) {
                                this.snodes.push([t, e.length]), (this.string += e);
                            }),
                            (t.prototype.handleText = function (t, e) {
                                return (
                                    e || this.extendString(t, this.adaptor.value(t)),
                                    this.adaptor.next(t)
                                );
                            }),
                            (t.prototype.handleTag = function (t, e) {
                                if (!e) {
                                    var r = this.options.includeHtmlTags[this.adaptor.kind(t)];
                                    this.extendString(t, r);
                                }
                                return this.adaptor.next(t);
                            }),
                            (t.prototype.handleContainer = function (t, e) {
                                this.pushString();
                                var r = this.adaptor.getAttribute(t, 'class') || '',
                                    n = this.adaptor.kind(t) || '',
                                    o = this.processHtmlClass.exec(r),
                                    i = t;
                                return (
                                    !this.adaptor.firstChild(t) ||
                                    this.adaptor.getAttribute(t, 'data-MJX') ||
                                    (!o && this.skipHtmlTags.exec(n))
                                        ? (i = this.adaptor.next(t))
                                        : (this.adaptor.next(t) &&
                                              this.stack.push([this.adaptor.next(t), e]),
                                          (i = this.adaptor.firstChild(t)),
                                          (e = (e || this.ignoreHtmlClass.exec(r)) && !o)),
                                    [i, e]
                                );
                            }),
                            (t.prototype.handleOther = function (t, e) {
                                return this.pushString(), this.adaptor.next(t);
                            }),
                            (t.prototype.find = function (t) {
                                var e, r;
                                this.init();
                                for (
                                    var o = this.adaptor.next(t),
                                        i = !1,
                                        a = this.options.includeHtmlTags;
                                    t && t !== o;

                                ) {
                                    var s = this.adaptor.kind(t);
                                    '#text' === s
                                        ? (t = this.handleText(t, i))
                                        : a.hasOwnProperty(s)
                                          ? (t = this.handleTag(t, i))
                                          : s
                                            ? ((t = (e = n(this.handleContainer(t, i), 2))[0]),
                                              (i = e[1]))
                                            : (t = this.handleOther(t, i)),
                                        !t &&
                                            this.stack.length &&
                                            (this.pushString(),
                                            (t = (r = n(this.stack.pop(), 2))[0]),
                                            (i = r[1]));
                                }
                                this.pushString();
                                var l = [this.strings, this.nodes];
                                return this.init(), l;
                            }),
                            (t.OPTIONS = {
                                skipHtmlTags: [
                                    'script',
                                    'noscript',
                                    'style',
                                    'textarea',
                                    'pre',
                                    'code',
                                    'annotation',
                                    'annotation-xml',
                                ],
                                includeHtmlTags: { br: '\n', wbr: '', '#comment': '' },
                                ignoreHtmlClass: 'mathjax_ignore',
                                processHtmlClass: 'mathjax_process',
                            }),
                            t
                        );
                    })();
                e.HTMLDomStrings = i;
            },
            3726: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HTMLHandler = void 0);
                var i = r(3670),
                    a = r(3683),
                    s = (function (t) {
                        function e() {
                            var e = (null !== t && t.apply(this, arguments)) || this;
                            return (e.documentClass = a.HTMLDocument), e;
                        }
                        return (
                            o(e, t),
                            (e.prototype.handlesDocument = function (t) {
                                var e = this.adaptor;
                                if ('string' == typeof t)
                                    try {
                                        t = e.parse(t, 'text/html');
                                    } catch (t) {}
                                return (
                                    t instanceof e.window.Document ||
                                    t instanceof e.window.HTMLElement ||
                                    t instanceof e.window.DocumentFragment
                                );
                            }),
                            (e.prototype.create = function (e, r) {
                                var n = this.adaptor;
                                if ('string' == typeof e) e = n.parse(e, 'text/html');
                                else if (
                                    e instanceof n.window.HTMLElement ||
                                    e instanceof n.window.DocumentFragment
                                ) {
                                    var o = e;
                                    (e = n.parse('', 'text/html')), n.append(n.body(e), o);
                                }
                                return t.prototype.create.call(this, e, r);
                            }),
                            e
                        );
                    })(i.AbstractHandler);
                e.HTMLHandler = s;
            },
            3363: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HTMLMathItem = void 0);
                var i = r(4474),
                    a = (function (t) {
                        function e(e, r, n, o, i) {
                            return (
                                void 0 === n && (n = !0),
                                void 0 === o && (o = { node: null, n: 0, delim: '' }),
                                void 0 === i && (i = { node: null, n: 0, delim: '' }),
                                t.call(this, e, r, n, o, i) || this
                            );
                        }
                        return (
                            o(e, t),
                            Object.defineProperty(e.prototype, 'adaptor', {
                                get: function () {
                                    return this.inputJax.adaptor;
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            (e.prototype.updateDocument = function (t) {
                                if (this.state() < i.STATE.INSERTED) {
                                    if (this.inputJax.processStrings) {
                                        var e = this.start.node;
                                        if (e === this.end.node)
                                            this.end.n &&
                                                this.end.n <
                                                    this.adaptor.value(this.end.node).length &&
                                                this.adaptor.split(this.end.node, this.end.n),
                                                this.start.n &&
                                                    (e = this.adaptor.split(
                                                        this.start.node,
                                                        this.start.n,
                                                    )),
                                                this.adaptor.replace(this.typesetRoot, e);
                                        else {
                                            for (
                                                this.start.n &&
                                                (e = this.adaptor.split(e, this.start.n));
                                                e !== this.end.node;

                                            ) {
                                                var r = this.adaptor.next(e);
                                                this.adaptor.remove(e), (e = r);
                                            }
                                            this.adaptor.insert(this.typesetRoot, e),
                                                this.end.n < this.adaptor.value(e).length &&
                                                    this.adaptor.split(e, this.end.n),
                                                this.adaptor.remove(e);
                                        }
                                    } else this.adaptor.replace(this.typesetRoot, this.start.node);
                                    (this.start.node = this.end.node = this.typesetRoot),
                                        (this.start.n = this.end.n = 0),
                                        this.state(i.STATE.INSERTED);
                                }
                            }),
                            (e.prototype.updateStyleSheet = function (t) {
                                t.addStyleSheet();
                            }),
                            (e.prototype.removeFromDocument = function (t) {
                                if ((void 0 === t && (t = !1), this.state() >= i.STATE.TYPESET)) {
                                    var e = this.adaptor,
                                        r = this.start.node,
                                        n = e.text('');
                                    if (t) {
                                        var o = this.start.delim + this.math + this.end.delim;
                                        if (this.inputJax.processStrings) n = e.text(o);
                                        else {
                                            var a = e.parse(o, 'text/html');
                                            n = e.firstChild(e.body(a));
                                        }
                                    }
                                    e.parent(r) && e.replace(n, r),
                                        (this.start.node = this.end.node = n),
                                        (this.start.n = this.end.n = 0);
                                }
                            }),
                            e
                        );
                    })(i.AbstractMathItem);
                e.HTMLMathItem = a;
            },
            3335: function (t, e, r) {
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
                        });
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.HTMLMathList = void 0);
                var i = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return o(e, t), e;
                })(r(9e3).AbstractMathList);
                e.HTMLMathList = i;
            },
            5713: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.mathjax = void 0);
                var n = r(3282),
                    o = r(805),
                    i = r(4542);
                e.mathjax = {
                    version: n.VERSION,
                    handlers: new o.HandlerList(),
                    document: function (t, r) {
                        return e.mathjax.handlers.document(t, r);
                    },
                    handleRetriesFor: i.handleRetriesFor,
                    retryAfter: i.retryAfter,
                    asyncLoad: null,
                };
            },
            9923: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.asyncLoad = void 0);
                var n = r(5713);
                e.asyncLoad = function (t) {
                    return n.mathjax.asyncLoad
                        ? new Promise(function (e, r) {
                              var o = n.mathjax.asyncLoad(t);
                              o instanceof Promise
                                  ? o
                                        .then(function (t) {
                                            return e(t);
                                        })
                                        .catch(function (t) {
                                            return r(t);
                                        })
                                  : e(o);
                          })
                        : Promise.reject(
                              "Can't load '".concat(t, "': No asyncLoad method specified"),
                          );
                };
            },
            6469: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.BBox = void 0);
                var n = r(6010),
                    o = (function () {
                        function t(t) {
                            void 0 === t && (t = { w: 0, h: -n.BIGDIMEN, d: -n.BIGDIMEN }),
                                (this.w = t.w || 0),
                                (this.h = 'h' in t ? t.h : -n.BIGDIMEN),
                                (this.d = 'd' in t ? t.d : -n.BIGDIMEN),
                                (this.L = this.R = this.ic = this.sk = this.dx = 0),
                                (this.scale = this.rscale = 1),
                                (this.pwidth = '');
                        }
                        return (
                            (t.zero = function () {
                                return new t({ h: 0, d: 0, w: 0 });
                            }),
                            (t.empty = function () {
                                return new t();
                            }),
                            (t.prototype.empty = function () {
                                return (this.w = 0), (this.h = this.d = -n.BIGDIMEN), this;
                            }),
                            (t.prototype.clean = function () {
                                this.w === -n.BIGDIMEN && (this.w = 0),
                                    this.h === -n.BIGDIMEN && (this.h = 0),
                                    this.d === -n.BIGDIMEN && (this.d = 0);
                            }),
                            (t.prototype.rescale = function (t) {
                                (this.w *= t), (this.h *= t), (this.d *= t);
                            }),
                            (t.prototype.combine = function (t, e, r) {
                                void 0 === e && (e = 0), void 0 === r && (r = 0);
                                var n = t.rscale,
                                    o = e + n * (t.w + t.L + t.R),
                                    i = r + n * t.h,
                                    a = n * t.d - r;
                                o > this.w && (this.w = o),
                                    i > this.h && (this.h = i),
                                    a > this.d && (this.d = a);
                            }),
                            (t.prototype.append = function (t) {
                                var e = t.rscale;
                                (this.w += e * (t.w + t.L + t.R)),
                                    e * t.h > this.h && (this.h = e * t.h),
                                    e * t.d > this.d && (this.d = e * t.d);
                            }),
                            (t.prototype.updateFrom = function (t) {
                                (this.h = t.h),
                                    (this.d = t.d),
                                    (this.w = t.w),
                                    t.pwidth && (this.pwidth = t.pwidth);
                            }),
                            (t.fullWidth = '100%'),
                            (t.StyleAdjust = [
                                ['borderTopWidth', 'h'],
                                ['borderRightWidth', 'w'],
                                ['borderBottomWidth', 'd'],
                                ['borderLeftWidth', 'w', 0],
                                ['paddingTop', 'h'],
                                ['paddingRight', 'w'],
                                ['paddingBottom', 'd'],
                                ['paddingLeft', 'w', 0],
                            ]),
                            t
                        );
                    })();
                e.BBox = o;
            },
            6751: function (t, e) {
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
                                        for (var r in e)
                                            Object.prototype.hasOwnProperty.call(e, r) &&
                                                (t[r] = e[r]);
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
                            function n() {
                                this.constructor = t;
                            }
                            r(t, e),
                                (t.prototype =
                                    null === e
                                        ? Object.create(e)
                                        : ((n.prototype = e.prototype), new n()));
                        }),
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
                    i =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.BitFieldClass = e.BitField = void 0);
                var s = (function () {
                    function t() {
                        this.bits = 0;
                    }
                    return (
                        (t.allocate = function () {
                            for (var e, r, n = [], i = 0; i < arguments.length; i++)
                                n[i] = arguments[i];
                            try {
                                for (var a = o(n), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    if (this.has(l))
                                        throw new Error('Bit already allocated for ' + l);
                                    if (this.next === t.MAXBIT)
                                        throw new Error('Maximum number of bits already allocated');
                                    this.names.set(l, this.next), (this.next <<= 1);
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (r = a.return) && r.call(a);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                        }),
                        (t.has = function (t) {
                            return this.names.has(t);
                        }),
                        (t.prototype.set = function (t) {
                            this.bits |= this.getBit(t);
                        }),
                        (t.prototype.clear = function (t) {
                            this.bits &= ~this.getBit(t);
                        }),
                        (t.prototype.isSet = function (t) {
                            return !!(this.bits & this.getBit(t));
                        }),
                        (t.prototype.reset = function () {
                            this.bits = 0;
                        }),
                        (t.prototype.getBit = function (t) {
                            var e = this.constructor.names.get(t);
                            if (!e) throw new Error('Unknown bit-field name: ' + t);
                            return e;
                        }),
                        (t.MAXBIT = 1 << 31),
                        (t.next = 1),
                        (t.names = new Map()),
                        t
                    );
                })();
                (e.BitField = s),
                    (e.BitFieldClass = function () {
                        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                        var r = (function (t) {
                            function e() {
                                return (null !== t && t.apply(this, arguments)) || this;
                            }
                            return n(e, t), e;
                        })(s);
                        return r.allocate.apply(r, a([], i(t), !1)), r;
                    });
            },
            5368: function (t, e, r) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.numeric = e.translate = e.remove = e.add = e.entities = e.options = void 0);
                var n = r(4542),
                    o = r(9923);
                (e.options = { loadMissingEntities: !0 }),
                    (e.entities = {
                        ApplyFunction: '\u2061',
                        Backslash: '\u2216',
                        Because: '\u2235',
                        Breve: '\u02d8',
                        Cap: '\u22d2',
                        CenterDot: '\xb7',
                        CircleDot: '\u2299',
                        CircleMinus: '\u2296',
                        CirclePlus: '\u2295',
                        CircleTimes: '\u2297',
                        Congruent: '\u2261',
                        ContourIntegral: '\u222e',
                        Coproduct: '\u2210',
                        Cross: '\u2a2f',
                        Cup: '\u22d3',
                        CupCap: '\u224d',
                        Dagger: '\u2021',
                        Del: '\u2207',
                        Delta: '\u0394',
                        Diamond: '\u22c4',
                        DifferentialD: '\u2146',
                        DotEqual: '\u2250',
                        DoubleDot: '\xa8',
                        DoubleRightTee: '\u22a8',
                        DoubleVerticalBar: '\u2225',
                        DownArrow: '\u2193',
                        DownLeftVector: '\u21bd',
                        DownRightVector: '\u21c1',
                        DownTee: '\u22a4',
                        Downarrow: '\u21d3',
                        Element: '\u2208',
                        EqualTilde: '\u2242',
                        Equilibrium: '\u21cc',
                        Exists: '\u2203',
                        ExponentialE: '\u2147',
                        FilledVerySmallSquare: '\u25aa',
                        ForAll: '\u2200',
                        Gamma: '\u0393',
                        Gg: '\u22d9',
                        GreaterEqual: '\u2265',
                        GreaterEqualLess: '\u22db',
                        GreaterFullEqual: '\u2267',
                        GreaterLess: '\u2277',
                        GreaterSlantEqual: '\u2a7e',
                        GreaterTilde: '\u2273',
                        Hacek: '\u02c7',
                        Hat: '^',
                        HumpDownHump: '\u224e',
                        HumpEqual: '\u224f',
                        Im: '\u2111',
                        ImaginaryI: '\u2148',
                        Integral: '\u222b',
                        Intersection: '\u22c2',
                        InvisibleComma: '\u2063',
                        InvisibleTimes: '\u2062',
                        Lambda: '\u039b',
                        Larr: '\u219e',
                        LeftAngleBracket: '\u27e8',
                        LeftArrow: '\u2190',
                        LeftArrowRightArrow: '\u21c6',
                        LeftCeiling: '\u2308',
                        LeftDownVector: '\u21c3',
                        LeftFloor: '\u230a',
                        LeftRightArrow: '\u2194',
                        LeftTee: '\u22a3',
                        LeftTriangle: '\u22b2',
                        LeftTriangleEqual: '\u22b4',
                        LeftUpVector: '\u21bf',
                        LeftVector: '\u21bc',
                        Leftarrow: '\u21d0',
                        Leftrightarrow: '\u21d4',
                        LessEqualGreater: '\u22da',
                        LessFullEqual: '\u2266',
                        LessGreater: '\u2276',
                        LessSlantEqual: '\u2a7d',
                        LessTilde: '\u2272',
                        Ll: '\u22d8',
                        Lleftarrow: '\u21da',
                        LongLeftArrow: '\u27f5',
                        LongLeftRightArrow: '\u27f7',
                        LongRightArrow: '\u27f6',
                        Longleftarrow: '\u27f8',
                        Longleftrightarrow: '\u27fa',
                        Longrightarrow: '\u27f9',
                        Lsh: '\u21b0',
                        MinusPlus: '\u2213',
                        NestedGreaterGreater: '\u226b',
                        NestedLessLess: '\u226a',
                        NotDoubleVerticalBar: '\u2226',
                        NotElement: '\u2209',
                        NotEqual: '\u2260',
                        NotExists: '\u2204',
                        NotGreater: '\u226f',
                        NotGreaterEqual: '\u2271',
                        NotLeftTriangle: '\u22ea',
                        NotLeftTriangleEqual: '\u22ec',
                        NotLess: '\u226e',
                        NotLessEqual: '\u2270',
                        NotPrecedes: '\u2280',
                        NotPrecedesSlantEqual: '\u22e0',
                        NotRightTriangle: '\u22eb',
                        NotRightTriangleEqual: '\u22ed',
                        NotSubsetEqual: '\u2288',
                        NotSucceeds: '\u2281',
                        NotSucceedsSlantEqual: '\u22e1',
                        NotSupersetEqual: '\u2289',
                        NotTilde: '\u2241',
                        NotVerticalBar: '\u2224',
                        Omega: '\u03a9',
                        OverBar: '\u203e',
                        OverBrace: '\u23de',
                        PartialD: '\u2202',
                        Phi: '\u03a6',
                        Pi: '\u03a0',
                        PlusMinus: '\xb1',
                        Precedes: '\u227a',
                        PrecedesEqual: '\u2aaf',
                        PrecedesSlantEqual: '\u227c',
                        PrecedesTilde: '\u227e',
                        Product: '\u220f',
                        Proportional: '\u221d',
                        Psi: '\u03a8',
                        Rarr: '\u21a0',
                        Re: '\u211c',
                        ReverseEquilibrium: '\u21cb',
                        RightAngleBracket: '\u27e9',
                        RightArrow: '\u2192',
                        RightArrowLeftArrow: '\u21c4',
                        RightCeiling: '\u2309',
                        RightDownVector: '\u21c2',
                        RightFloor: '\u230b',
                        RightTee: '\u22a2',
                        RightTeeArrow: '\u21a6',
                        RightTriangle: '\u22b3',
                        RightTriangleEqual: '\u22b5',
                        RightUpVector: '\u21be',
                        RightVector: '\u21c0',
                        Rightarrow: '\u21d2',
                        Rrightarrow: '\u21db',
                        Rsh: '\u21b1',
                        Sigma: '\u03a3',
                        SmallCircle: '\u2218',
                        Sqrt: '\u221a',
                        Square: '\u25a1',
                        SquareIntersection: '\u2293',
                        SquareSubset: '\u228f',
                        SquareSubsetEqual: '\u2291',
                        SquareSuperset: '\u2290',
                        SquareSupersetEqual: '\u2292',
                        SquareUnion: '\u2294',
                        Star: '\u22c6',
                        Subset: '\u22d0',
                        SubsetEqual: '\u2286',
                        Succeeds: '\u227b',
                        SucceedsEqual: '\u2ab0',
                        SucceedsSlantEqual: '\u227d',
                        SucceedsTilde: '\u227f',
                        SuchThat: '\u220b',
                        Sum: '\u2211',
                        Superset: '\u2283',
                        SupersetEqual: '\u2287',
                        Supset: '\u22d1',
                        Therefore: '\u2234',
                        Theta: '\u0398',
                        Tilde: '\u223c',
                        TildeEqual: '\u2243',
                        TildeFullEqual: '\u2245',
                        TildeTilde: '\u2248',
                        UnderBar: '_',
                        UnderBrace: '\u23df',
                        Union: '\u22c3',
                        UnionPlus: '\u228e',
                        UpArrow: '\u2191',
                        UpDownArrow: '\u2195',
                        UpTee: '\u22a5',
                        Uparrow: '\u21d1',
                        Updownarrow: '\u21d5',
                        Upsilon: '\u03a5',
                        Vdash: '\u22a9',
                        Vee: '\u22c1',
                        VerticalBar: '\u2223',
                        VerticalTilde: '\u2240',
                        Vvdash: '\u22aa',
                        Wedge: '\u22c0',
                        Xi: '\u039e',
                        amp: '&',
                        acute: '\xb4',
                        aleph: '\u2135',
                        alpha: '\u03b1',
                        amalg: '\u2a3f',
                        and: '\u2227',
                        ang: '\u2220',
                        angmsd: '\u2221',
                        angsph: '\u2222',
                        ape: '\u224a',
                        backprime: '\u2035',
                        backsim: '\u223d',
                        backsimeq: '\u22cd',
                        beta: '\u03b2',
                        beth: '\u2136',
                        between: '\u226c',
                        bigcirc: '\u25ef',
                        bigodot: '\u2a00',
                        bigoplus: '\u2a01',
                        bigotimes: '\u2a02',
                        bigsqcup: '\u2a06',
                        bigstar: '\u2605',
                        bigtriangledown: '\u25bd',
                        bigtriangleup: '\u25b3',
                        biguplus: '\u2a04',
                        blacklozenge: '\u29eb',
                        blacktriangle: '\u25b4',
                        blacktriangledown: '\u25be',
                        blacktriangleleft: '\u25c2',
                        bowtie: '\u22c8',
                        boxdl: '\u2510',
                        boxdr: '\u250c',
                        boxminus: '\u229f',
                        boxplus: '\u229e',
                        boxtimes: '\u22a0',
                        boxul: '\u2518',
                        boxur: '\u2514',
                        bsol: '\\',
                        bull: '\u2022',
                        cap: '\u2229',
                        check: '\u2713',
                        chi: '\u03c7',
                        circ: '\u02c6',
                        circeq: '\u2257',
                        circlearrowleft: '\u21ba',
                        circlearrowright: '\u21bb',
                        circledR: '\xae',
                        circledS: '\u24c8',
                        circledast: '\u229b',
                        circledcirc: '\u229a',
                        circleddash: '\u229d',
                        clubs: '\u2663',
                        colon: ':',
                        comp: '\u2201',
                        ctdot: '\u22ef',
                        cuepr: '\u22de',
                        cuesc: '\u22df',
                        cularr: '\u21b6',
                        cup: '\u222a',
                        curarr: '\u21b7',
                        curlyvee: '\u22ce',
                        curlywedge: '\u22cf',
                        dagger: '\u2020',
                        daleth: '\u2138',
                        ddarr: '\u21ca',
                        deg: '\xb0',
                        delta: '\u03b4',
                        digamma: '\u03dd',
                        div: '\xf7',
                        divideontimes: '\u22c7',
                        dot: '\u02d9',
                        doteqdot: '\u2251',
                        dotplus: '\u2214',
                        dotsquare: '\u22a1',
                        dtdot: '\u22f1',
                        ecir: '\u2256',
                        efDot: '\u2252',
                        egs: '\u2a96',
                        ell: '\u2113',
                        els: '\u2a95',
                        empty: '\u2205',
                        epsi: '\u03b5',
                        epsiv: '\u03f5',
                        erDot: '\u2253',
                        eta: '\u03b7',
                        eth: '\xf0',
                        flat: '\u266d',
                        fork: '\u22d4',
                        frown: '\u2322',
                        gEl: '\u2a8c',
                        gamma: '\u03b3',
                        gap: '\u2a86',
                        gimel: '\u2137',
                        gnE: '\u2269',
                        gnap: '\u2a8a',
                        gne: '\u2a88',
                        gnsim: '\u22e7',
                        gt: '>',
                        gtdot: '\u22d7',
                        harrw: '\u21ad',
                        hbar: '\u210f',
                        hellip: '\u2026',
                        hookleftarrow: '\u21a9',
                        hookrightarrow: '\u21aa',
                        imath: '\u0131',
                        infin: '\u221e',
                        intcal: '\u22ba',
                        iota: '\u03b9',
                        jmath: '\u0237',
                        kappa: '\u03ba',
                        kappav: '\u03f0',
                        lEg: '\u2a8b',
                        lambda: '\u03bb',
                        lap: '\u2a85',
                        larrlp: '\u21ab',
                        larrtl: '\u21a2',
                        lbrace: '{',
                        lbrack: '[',
                        le: '\u2264',
                        leftleftarrows: '\u21c7',
                        leftthreetimes: '\u22cb',
                        lessdot: '\u22d6',
                        lmoust: '\u23b0',
                        lnE: '\u2268',
                        lnap: '\u2a89',
                        lne: '\u2a87',
                        lnsim: '\u22e6',
                        longmapsto: '\u27fc',
                        looparrowright: '\u21ac',
                        lowast: '\u2217',
                        loz: '\u25ca',
                        lt: '<',
                        ltimes: '\u22c9',
                        ltri: '\u25c3',
                        macr: '\xaf',
                        malt: '\u2720',
                        mho: '\u2127',
                        mu: '\u03bc',
                        multimap: '\u22b8',
                        nLeftarrow: '\u21cd',
                        nLeftrightarrow: '\u21ce',
                        nRightarrow: '\u21cf',
                        nVDash: '\u22af',
                        nVdash: '\u22ae',
                        natur: '\u266e',
                        nearr: '\u2197',
                        nharr: '\u21ae',
                        nlarr: '\u219a',
                        not: '\xac',
                        nrarr: '\u219b',
                        nu: '\u03bd',
                        nvDash: '\u22ad',
                        nvdash: '\u22ac',
                        nwarr: '\u2196',
                        omega: '\u03c9',
                        omicron: '\u03bf',
                        or: '\u2228',
                        osol: '\u2298',
                        period: '.',
                        phi: '\u03c6',
                        phiv: '\u03d5',
                        pi: '\u03c0',
                        piv: '\u03d6',
                        prap: '\u2ab7',
                        precnapprox: '\u2ab9',
                        precneqq: '\u2ab5',
                        precnsim: '\u22e8',
                        prime: '\u2032',
                        psi: '\u03c8',
                        quot: '"',
                        rarrtl: '\u21a3',
                        rbrace: '}',
                        rbrack: ']',
                        rho: '\u03c1',
                        rhov: '\u03f1',
                        rightrightarrows: '\u21c9',
                        rightthreetimes: '\u22cc',
                        ring: '\u02da',
                        rmoust: '\u23b1',
                        rtimes: '\u22ca',
                        rtri: '\u25b9',
                        scap: '\u2ab8',
                        scnE: '\u2ab6',
                        scnap: '\u2aba',
                        scnsim: '\u22e9',
                        sdot: '\u22c5',
                        searr: '\u2198',
                        sect: '\xa7',
                        sharp: '\u266f',
                        sigma: '\u03c3',
                        sigmav: '\u03c2',
                        simne: '\u2246',
                        smile: '\u2323',
                        spades: '\u2660',
                        sub: '\u2282',
                        subE: '\u2ac5',
                        subnE: '\u2acb',
                        subne: '\u228a',
                        supE: '\u2ac6',
                        supnE: '\u2acc',
                        supne: '\u228b',
                        swarr: '\u2199',
                        tau: '\u03c4',
                        theta: '\u03b8',
                        thetav: '\u03d1',
                        tilde: '\u02dc',
                        times: '\xd7',
                        triangle: '\u25b5',
                        triangleq: '\u225c',
                        upsi: '\u03c5',
                        upuparrows: '\u21c8',
                        veebar: '\u22bb',
                        vellip: '\u22ee',
                        weierp: '\u2118',
                        xi: '\u03be',
                        yen: '\xa5',
                        zeta: '\u03b6',
                        zigrarr: '\u21dd',
                        nbsp: '\xa0',
                        rsquo: '\u2019',
                        lsquo: '\u2018',
                    });
                var i = {};
                function a(t, r) {
                    if ('#' === r.charAt(0)) return s(r.slice(1));
                    if (e.entities[r]) return e.entities[r];
                    if (e.options.loadMissingEntities) {
                        var a = r.match(/^[a-zA-Z](fr|scr|opf)$/)
                            ? RegExp.$1
                            : r.charAt(0).toLowerCase();
                        i[a] ||
                            ((i[a] = !0),
                            (0, n.retryAfter)((0, o.asyncLoad)('./util/entities/' + a + '.js')));
                    }
                    return t;
                }
                function s(t) {
                    var e = 'x' === t.charAt(0) ? parseInt(t.slice(1), 16) : parseInt(t);
                    return String.fromCodePoint(e);
                }
                (e.add = function (t, r) {
                    Object.assign(e.entities, t), (i[r] = !0);
                }),
                    (e.remove = function (t) {
                        delete e.entities[t];
                    }),
                    (e.translate = function (t) {
                        return t.replace(/&([a-z][a-z0-9]*|#(?:[0-9]+|x[0-9a-f]+));/gi, a);
                    }),
                    (e.numeric = s);
            },
            7525: function (t, e, r) {
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
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    s =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.FunctionList = void 0);
                var l = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        o(e, t),
                        (e.prototype.execute = function () {
                            for (var t, e, r = [], n = 0; n < arguments.length; n++)
                                r[n] = arguments[n];
                            try {
                                for (var o = i(this), l = o.next(); !l.done; l = o.next()) {
                                    var u = l.value,
                                        c = u.item.apply(u, s([], a(r), !1));
                                    if (!1 === c) return !1;
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    l && !l.done && (e = o.return) && e.call(o);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return !0;
                        }),
                        (e.prototype.asyncExecute = function () {
                            for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
                            var r = -1,
                                n = this.items;
                            return new Promise(function (e, o) {
                                !(function i() {
                                    for (var l; ++r < n.length; ) {
                                        var u = (l = n[r]).item.apply(l, s([], a(t), !1));
                                        if (u instanceof Promise)
                                            return void u.then(i).catch(function (t) {
                                                return o(t);
                                            });
                                        if (!1 === u) return void e(!1);
                                    }
                                    e(!0);
                                })();
                            });
                        }),
                        e
                    );
                })(r(8666).PrioritizedList);
                e.FunctionList = l;
            },
            103: function (t, e) {
                var r =
                        (this && this.__generator) ||
                        function (t, e) {
                            var r,
                                n,
                                o,
                                i,
                                a = {
                                    label: 0,
                                    sent: function () {
                                        if (1 & o[0]) throw o[1];
                                        return o[1];
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
                                        if (r)
                                            throw new TypeError('Generator is already executing.');
                                        for (; a; )
                                            try {
                                                if (
                                                    ((r = 1),
                                                    n &&
                                                        (o =
                                                            2 & i[0]
                                                                ? n.return
                                                                : i[0]
                                                                  ? n.throw ||
                                                                    ((o = n.return) && o.call(n), 0)
                                                                  : n.next) &&
                                                        !(o = o.call(n, i[1])).done)
                                                )
                                                    return o;
                                                switch (
                                                    ((n = 0), o && (i = [2 & i[0], o.value]), i[0])
                                                ) {
                                                    case 0:
                                                    case 1:
                                                        o = i;
                                                        break;
                                                    case 4:
                                                        return a.label++, { value: i[1], done: !1 };
                                                    case 5:
                                                        a.label++, (n = i[1]), (i = [0]);
                                                        continue;
                                                    case 7:
                                                        (i = a.ops.pop()), a.trys.pop();
                                                        continue;
                                                    default:
                                                        if (
                                                            !((o = a.trys),
                                                            (o = o.length > 0 && o[o.length - 1]) ||
                                                                (6 !== i[0] && 2 !== i[0]))
                                                        ) {
                                                            a = 0;
                                                            continue;
                                                        }
                                                        if (
                                                            3 === i[0] &&
                                                            (!o || (i[1] > o[0] && i[1] < o[3]))
                                                        ) {
                                                            a.label = i[1];
                                                            break;
                                                        }
                                                        if (6 === i[0] && a.label < o[1]) {
                                                            (a.label = o[1]), (o = i);
                                                            break;
                                                        }
                                                        if (o && a.label < o[2]) {
                                                            (a.label = o[2]), a.ops.push(i);
                                                            break;
                                                        }
                                                        o[2] && a.ops.pop(), a.trys.pop();
                                                        continue;
                                                }
                                                i = e.call(t, a);
                                            } catch (t) {
                                                (i = [6, t]), (n = 0);
                                            } finally {
                                                r = o = 0;
                                            }
                                        if (5 & i[0]) throw i[1];
                                        return { value: i[0] ? i[1] : void 0, done: !0 };
                                    })([i, s]);
                                };
                            }
                        },
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        },
                    i =
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.LinkedList = e.ListItem = e.END = void 0),
                    (e.END = Symbol());
                var a = function (t) {
                    void 0 === t && (t = null),
                        (this.next = null),
                        (this.prev = null),
                        (this.data = t);
                };
                e.ListItem = a;
                var s = (function () {
                    function t() {
                        for (var t = [], r = 0; r < arguments.length; r++) t[r] = arguments[r];
                        (this.list = new a(e.END)),
                            (this.list.next = this.list.prev = this.list),
                            this.push.apply(this, o([], n(t), !1));
                    }
                    return (
                        (t.prototype.isBefore = function (t, e) {
                            return t < e;
                        }),
                        (t.prototype.push = function () {
                            for (var t, e, r = [], n = 0; n < arguments.length; n++)
                                r[n] = arguments[n];
                            try {
                                for (var o = i(r), s = o.next(); !s.done; s = o.next()) {
                                    var l = s.value,
                                        u = new a(l);
                                    (u.next = this.list),
                                        (u.prev = this.list.prev),
                                        (this.list.prev = u),
                                        (u.prev.next = u);
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    s && !s.done && (e = o.return) && e.call(o);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return this;
                        }),
                        (t.prototype.pop = function () {
                            var t = this.list.prev;
                            return t.data === e.END
                                ? null
                                : ((this.list.prev = t.prev),
                                  (t.prev.next = this.list),
                                  (t.next = t.prev = null),
                                  t.data);
                        }),
                        (t.prototype.unshift = function () {
                            for (var t, e, r = [], n = 0; n < arguments.length; n++)
                                r[n] = arguments[n];
                            try {
                                for (
                                    var o = i(r.slice(0).reverse()), s = o.next();
                                    !s.done;
                                    s = o.next()
                                ) {
                                    var l = s.value,
                                        u = new a(l);
                                    (u.next = this.list.next),
                                        (u.prev = this.list),
                                        (this.list.next = u),
                                        (u.next.prev = u);
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    s && !s.done && (e = o.return) && e.call(o);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return this;
                        }),
                        (t.prototype.shift = function () {
                            var t = this.list.next;
                            return t.data === e.END
                                ? null
                                : ((this.list.next = t.next),
                                  (t.next.prev = this.list),
                                  (t.next = t.prev = null),
                                  t.data);
                        }),
                        (t.prototype.remove = function () {
                            for (var t, r, n = [], o = 0; o < arguments.length; o++)
                                n[o] = arguments[o];
                            var a = new Map();
                            try {
                                for (var s = i(n), l = s.next(); !l.done; l = s.next()) {
                                    var u = l.value;
                                    a.set(u, !0);
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    l && !l.done && (r = s.return) && r.call(s);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            for (var c = this.list.next; c.data !== e.END; ) {
                                var p = c.next;
                                a.has(c.data) &&
                                    ((c.prev.next = c.next),
                                    (c.next.prev = c.prev),
                                    (c.next = c.prev = null)),
                                    (c = p);
                            }
                        }),
                        (t.prototype.clear = function () {
                            return (
                                (this.list.next.prev = this.list.prev.next = null),
                                (this.list.next = this.list.prev = this.list),
                                this
                            );
                        }),
                        (t.prototype[Symbol.iterator] = function () {
                            var t;
                            return r(this, function (r) {
                                switch (r.label) {
                                    case 0:
                                        (t = this.list.next), (r.label = 1);
                                    case 1:
                                        return t.data === e.END ? [3, 3] : [4, t.data];
                                    case 2:
                                        return r.sent(), (t = t.next), [3, 1];
                                    case 3:
                                        return [2];
                                }
                            });
                        }),
                        (t.prototype.reversed = function () {
                            var t;
                            return r(this, function (r) {
                                switch (r.label) {
                                    case 0:
                                        (t = this.list.prev), (r.label = 1);
                                    case 1:
                                        return t.data === e.END ? [3, 3] : [4, t.data];
                                    case 2:
                                        return r.sent(), (t = t.prev), [3, 1];
                                    case 3:
                                        return [2];
                                }
                            });
                        }),
                        (t.prototype.insert = function (t, r) {
                            void 0 === r && (r = null),
                                null === r && (r = this.isBefore.bind(this));
                            for (
                                var n = new a(t), o = this.list.next;
                                o.data !== e.END && r(o.data, n.data);

                            )
                                o = o.next;
                            return (
                                (n.prev = o.prev), (n.next = o), (o.prev.next = o.prev = n), this
                            );
                        }),
                        (t.prototype.sort = function (e) {
                            var r, n;
                            void 0 === e && (e = null),
                                null === e && (e = this.isBefore.bind(this));
                            var o = [];
                            try {
                                for (var a = i(this), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    o.push(new t(l));
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
                            for (this.list.next = this.list.prev = this.list; o.length > 1; ) {
                                var u = o.shift(),
                                    c = o.shift();
                                u.merge(c, e), o.push(u);
                            }
                            return o.length && (this.list = o[0].list), this;
                        }),
                        (t.prototype.merge = function (t, r) {
                            var o, i, a, s, l;
                            void 0 === r && (r = null),
                                null === r && (r = this.isBefore.bind(this));
                            for (
                                var u = this.list.next, c = t.list.next;
                                u.data !== e.END && c.data !== e.END;

                            )
                                r(c.data, u.data)
                                    ? ((o = n([u, c], 2)),
                                      (c.prev.next = o[0]),
                                      (u.prev.next = o[1]),
                                      (i = n([u.prev, c.prev], 2)),
                                      (c.prev = i[0]),
                                      (u.prev = i[1]),
                                      (a = n([t.list, this.list], 2)),
                                      (this.list.prev.next = a[0]),
                                      (t.list.prev.next = a[1]),
                                      (s = n([t.list.prev, this.list.prev], 2)),
                                      (this.list.prev = s[0]),
                                      (t.list.prev = s[1]),
                                      (u = (l = n([c.next, u], 2))[0]),
                                      (c = l[1]))
                                    : (u = u.next);
                            return (
                                c.data !== e.END &&
                                    ((this.list.prev.next = t.list.next),
                                    (t.list.next.prev = this.list.prev),
                                    (t.list.prev.next = this.list),
                                    (this.list.prev = t.list.prev),
                                    (t.list.next = t.list.prev = t.list)),
                                this
                            );
                        }),
                        t
                    );
                })();
                e.LinkedList = s;
            },
            7233: function (t, e) {
                var r =
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
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.lookup =
                        e.separateOptions =
                        e.selectOptionsFromKeys =
                        e.selectOptions =
                        e.userOptions =
                        e.defaultOptions =
                        e.insert =
                        e.copy =
                        e.keys =
                        e.makeArray =
                        e.expandable =
                        e.Expandable =
                        e.OPTIONS =
                        e.REMOVE =
                        e.APPEND =
                        e.isObject =
                            void 0);
                var i = {}.constructor;
                function a(t) {
                    return (
                        'object' == typeof t &&
                        null !== t &&
                        (t.constructor === i || t.constructor === s)
                    );
                }
                (e.isObject = a),
                    (e.APPEND = '[+]'),
                    (e.REMOVE = '[-]'),
                    (e.OPTIONS = {
                        invalidOption: 'warn',
                        optionError: function (t, r) {
                            if ('fatal' === e.OPTIONS.invalidOption) throw new Error(t);
                            console.warn('MathJax: ' + t);
                        },
                    });
                var s = function () {};
                function l(t) {
                    return Object.assign(Object.create(s.prototype), t);
                }
                function u(t) {
                    return t ? Object.keys(t).concat(Object.getOwnPropertySymbols(t)) : [];
                }
                function c(t) {
                    var e,
                        n,
                        o = {};
                    try {
                        for (var i = r(u(t)), f = i.next(); !f.done; f = i.next()) {
                            var h = f.value,
                                d = Object.getOwnPropertyDescriptor(t, h),
                                y = d.value;
                            Array.isArray(y) ? (d.value = p([], y, !1)) : a(y) && (d.value = c(y)),
                                d.enumerable && (o[h] = d);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            f && !f.done && (n = i.return) && n.call(i);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    return Object.defineProperties(t.constructor === s ? l({}) : {}, o);
                }
                function p(t, i, l) {
                    var f, h;
                    void 0 === l && (l = !0);
                    var d = function (r) {
                        if (l && void 0 === t[r] && t.constructor !== s)
                            return (
                                'symbol' == typeof r && (r = r.toString()),
                                e.OPTIONS.optionError(
                                    'Invalid option "'.concat(r, '" (no default value).'),
                                    r,
                                ),
                                'continue'
                            );
                        var f = i[r],
                            h = t[r];
                        if (!a(f) || null === h || ('object' != typeof h && 'function' != typeof h))
                            Array.isArray(f)
                                ? ((t[r] = []), p(t[r], f, !1))
                                : a(f)
                                  ? (t[r] = c(f))
                                  : (t[r] = f);
                        else {
                            var d = u(f);
                            Array.isArray(h) &&
                            ((1 === d.length &&
                                (d[0] === e.APPEND || d[0] === e.REMOVE) &&
                                Array.isArray(f[d[0]])) ||
                                (2 === d.length &&
                                    d.sort().join(',') === e.APPEND + ',' + e.REMOVE &&
                                    Array.isArray(f[e.APPEND]) &&
                                    Array.isArray(f[e.REMOVE])))
                                ? (f[e.REMOVE] &&
                                      (h = t[r] =
                                          h.filter(function (t) {
                                              return f[e.REMOVE].indexOf(t) < 0;
                                          })),
                                  f[e.APPEND] && (t[r] = o(o([], n(h), !1), n(f[e.APPEND]), !1)))
                                : p(h, f, l);
                        }
                    };
                    try {
                        for (var y = r(u(i)), O = y.next(); !O.done; O = y.next()) {
                            d(O.value);
                        }
                    } catch (t) {
                        f = { error: t };
                    } finally {
                        try {
                            O && !O.done && (h = y.return) && h.call(y);
                        } finally {
                            if (f) throw f.error;
                        }
                    }
                    return t;
                }
                function f(t) {
                    for (var e, n, o = [], i = 1; i < arguments.length; i++)
                        o[i - 1] = arguments[i];
                    var a = {};
                    try {
                        for (var s = r(o), l = s.next(); !l.done; l = s.next()) {
                            var u = l.value;
                            t.hasOwnProperty(u) && (a[u] = t[u]);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            l && !l.done && (n = s.return) && n.call(s);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    return a;
                }
                (e.Expandable = s),
                    (e.expandable = l),
                    (e.makeArray = function (t) {
                        return Array.isArray(t) ? t : [t];
                    }),
                    (e.keys = u),
                    (e.copy = c),
                    (e.insert = p),
                    (e.defaultOptions = function (t) {
                        for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
                        return (
                            e.forEach(function (e) {
                                return p(t, e, !1);
                            }),
                            t
                        );
                    }),
                    (e.userOptions = function (t) {
                        for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
                        return (
                            e.forEach(function (e) {
                                return p(t, e, !0);
                            }),
                            t
                        );
                    }),
                    (e.selectOptions = f),
                    (e.selectOptionsFromKeys = function (t, e) {
                        return f.apply(void 0, o([t], n(Object.keys(e)), !1));
                    }),
                    (e.separateOptions = function (t) {
                        for (var e, n, o, i, a = [], s = 1; s < arguments.length; s++)
                            a[s - 1] = arguments[s];
                        var l = [];
                        try {
                            for (var u = r(a), c = u.next(); !c.done; c = u.next()) {
                                var p = c.value,
                                    f = {},
                                    h = {};
                                try {
                                    for (
                                        var d = ((o = void 0), r(Object.keys(t || {}))),
                                            y = d.next();
                                        !y.done;
                                        y = d.next()
                                    ) {
                                        var O = y.value;
                                        (void 0 === p[O] ? h : f)[O] = t[O];
                                    }
                                } catch (t) {
                                    o = { error: t };
                                } finally {
                                    try {
                                        y && !y.done && (i = d.return) && i.call(d);
                                    } finally {
                                        if (o) throw o.error;
                                    }
                                }
                                l.push(f), (t = h);
                            }
                        } catch (t) {
                            e = { error: t };
                        } finally {
                            try {
                                c && !c.done && (n = u.return) && n.call(u);
                            } finally {
                                if (e) throw e.error;
                            }
                        }
                        return l.unshift(t), l;
                    }),
                    (e.lookup = function (t, e, r) {
                        return void 0 === r && (r = null), e.hasOwnProperty(t) ? e[t] : r;
                    });
            },
            8666: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.PrioritizedList = void 0);
                var r = (function () {
                    function t() {
                        (this.items = []), (this.items = []);
                    }
                    return (
                        (t.prototype[Symbol.iterator] = function () {
                            var t = 0,
                                e = this.items;
                            return {
                                next: function () {
                                    return { value: e[t++], done: t > e.length };
                                },
                            };
                        }),
                        (t.prototype.add = function (e, r) {
                            void 0 === r && (r = t.DEFAULTPRIORITY);
                            var n = this.items.length;
                            do {
                                n--;
                            } while (n >= 0 && r < this.items[n].priority);
                            return this.items.splice(n + 1, 0, { item: e, priority: r }), e;
                        }),
                        (t.prototype.remove = function (t) {
                            var e = this.items.length;
                            do {
                                e--;
                            } while (e >= 0 && this.items[e].item !== t);
                            e >= 0 && this.items.splice(e, 1);
                        }),
                        (t.DEFAULTPRIORITY = 5),
                        t
                    );
                })();
                e.PrioritizedList = r;
            },
            4542: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.retryAfter = e.handleRetriesFor = void 0),
                    (e.handleRetriesFor = function (t) {
                        return new Promise(function e(r, n) {
                            try {
                                r(t());
                            } catch (t) {
                                t.retry && t.retry instanceof Promise
                                    ? t.retry
                                          .then(function () {
                                              return e(r, n);
                                          })
                                          .catch(function (t) {
                                              return n(t);
                                          })
                                    : t.restart && t.restart.isCallback
                                      ? MathJax.Callback.After(function () {
                                            return e(r, n);
                                        }, t.restart)
                                      : n(t);
                            }
                        });
                    }),
                    (e.retryAfter = function (t) {
                        var e = new Error('MathJax retry');
                        throw ((e.retry = t), e);
                    });
            },
            4139: function (t, e) {
                var r =
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
                    };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.CssStyles = void 0);
                var n = (function () {
                    function t(t) {
                        void 0 === t && (t = null), (this.styles = {}), this.addStyles(t);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'cssText', {
                            get: function () {
                                return this.getStyleString();
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.addStyles = function (t) {
                            var e, n;
                            if (t)
                                try {
                                    for (
                                        var o = r(Object.keys(t)), i = o.next();
                                        !i.done;
                                        i = o.next()
                                    ) {
                                        var a = i.value;
                                        this.styles[a] || (this.styles[a] = {}),
                                            Object.assign(this.styles[a], t[a]);
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        i && !i.done && (n = o.return) && n.call(o);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                        }),
                        (t.prototype.removeStyles = function () {
                            for (var t, e, n = [], o = 0; o < arguments.length; o++)
                                n[o] = arguments[o];
                            try {
                                for (var i = r(n), a = i.next(); !a.done; a = i.next()) {
                                    var s = a.value;
                                    delete this.styles[s];
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    a && !a.done && (e = i.return) && e.call(i);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                        }),
                        (t.prototype.clear = function () {
                            this.styles = {};
                        }),
                        (t.prototype.getStyleString = function () {
                            return this.getStyleRules().join('\n\n');
                        }),
                        (t.prototype.getStyleRules = function () {
                            var t,
                                e,
                                n = Object.keys(this.styles),
                                o = new Array(n.length),
                                i = 0;
                            try {
                                for (var a = r(n), s = a.next(); !s.done; s = a.next()) {
                                    var l = s.value;
                                    o[i++] =
                                        l + ' {\n' + this.getStyleDefString(this.styles[l]) + '\n}';
                                }
                            } catch (e) {
                                t = { error: e };
                            } finally {
                                try {
                                    s && !s.done && (e = a.return) && e.call(a);
                                } finally {
                                    if (t) throw t.error;
                                }
                            }
                            return o;
                        }),
                        (t.prototype.getStyleDefString = function (t) {
                            var e,
                                n,
                                o = Object.keys(t),
                                i = new Array(o.length),
                                a = 0;
                            try {
                                for (var s = r(o), l = s.next(); !l.done; l = s.next()) {
                                    var u = l.value;
                                    i[a++] = '  ' + u + ': ' + t[u] + ';';
                                }
                            } catch (t) {
                                e = { error: t };
                            } finally {
                                try {
                                    l && !l.done && (n = s.return) && n.call(s);
                                } finally {
                                    if (e) throw e.error;
                                }
                            }
                            return i.join('\n');
                        }),
                        t
                    );
                })();
                e.CssStyles = n;
            },
            8054: function (t, e) {
                var r =
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
                    n =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.Styles = void 0);
                var i = ['top', 'right', 'bottom', 'left'],
                    a = ['width', 'style', 'color'];
                function s(t) {
                    for (
                        var e = t.split(/((?:'[^']*'|"[^"]*"|,[\s\n]|[^\s\n])*)/g), r = [];
                        e.length > 1;

                    )
                        e.shift(), r.push(e.shift());
                    return r;
                }
                function l(t) {
                    var e,
                        n,
                        o = s(this.styles[t]);
                    0 === o.length && o.push(''),
                        1 === o.length && o.push(o[0]),
                        2 === o.length && o.push(o[0]),
                        3 === o.length && o.push(o[1]);
                    try {
                        for (
                            var i = r(v.connect[t].children), a = i.next();
                            !a.done;
                            a = i.next()
                        ) {
                            var l = a.value;
                            this.setStyle(this.childName(t, l), o.shift());
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            a && !a.done && (n = i.return) && n.call(i);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                function u(t) {
                    var e,
                        n,
                        o = v.connect[t].children,
                        i = [];
                    try {
                        for (var a = r(o), s = a.next(); !s.done; s = a.next()) {
                            var l = s.value,
                                u = this.styles[t + '-' + l];
                            if (!u) return void delete this.styles[t];
                            i.push(u);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            s && !s.done && (n = a.return) && n.call(a);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    i[3] === i[1] &&
                        (i.pop(), i[2] === i[0] && (i.pop(), i[1] === i[0] && i.pop())),
                        (this.styles[t] = i.join(' '));
                }
                function c(t) {
                    var e, n;
                    try {
                        for (
                            var o = r(v.connect[t].children), i = o.next();
                            !i.done;
                            i = o.next()
                        ) {
                            var a = i.value;
                            this.setStyle(this.childName(t, a), this.styles[t]);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            i && !i.done && (n = o.return) && n.call(o);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                }
                function p(t) {
                    var e,
                        i,
                        a = o([], n(v.connect[t].children), !1),
                        s = this.styles[this.childName(t, a.shift())];
                    try {
                        for (var l = r(a), u = l.next(); !u.done; u = l.next()) {
                            var c = u.value;
                            if (this.styles[this.childName(t, c)] !== s)
                                return void delete this.styles[t];
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            u && !u.done && (i = l.return) && i.call(l);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    this.styles[t] = s;
                }
                var f = /^(?:[\d.]+(?:[a-z]+)|thin|medium|thick|inherit|initial|unset)$/,
                    h =
                        /^(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|inherit|initial|unset)$/;
                function d(t) {
                    var e,
                        n,
                        o,
                        i,
                        a = { width: '', style: '', color: '' };
                    try {
                        for (var l = r(s(this.styles[t])), u = l.next(); !u.done; u = l.next()) {
                            var c = u.value;
                            c.match(f) && '' === a.width
                                ? (a.width = c)
                                : c.match(h) && '' === a.style
                                  ? (a.style = c)
                                  : (a.color = c);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            u && !u.done && (n = l.return) && n.call(l);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    try {
                        for (
                            var p = r(v.connect[t].children), d = p.next();
                            !d.done;
                            d = p.next()
                        ) {
                            var y = d.value;
                            this.setStyle(this.childName(t, y), a[y]);
                        }
                    } catch (t) {
                        o = { error: t };
                    } finally {
                        try {
                            d && !d.done && (i = p.return) && i.call(p);
                        } finally {
                            if (o) throw o.error;
                        }
                    }
                }
                function y(t) {
                    var e,
                        n,
                        o = [];
                    try {
                        for (
                            var i = r(v.connect[t].children), a = i.next();
                            !a.done;
                            a = i.next()
                        ) {
                            var s = a.value,
                                l = this.styles[this.childName(t, s)];
                            l && o.push(l);
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            a && !a.done && (n = i.return) && n.call(i);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    o.length ? (this.styles[t] = o.join(' ')) : delete this.styles[t];
                }
                var O = {
                    style: /^(?:normal|italic|oblique|inherit|initial|unset)$/,
                    variant: new RegExp(
                        '^(?:' +
                            [
                                'normal|none',
                                'inherit|initial|unset',
                                'common-ligatures|no-common-ligatures',
                                'discretionary-ligatures|no-discretionary-ligatures',
                                'historical-ligatures|no-historical-ligatures',
                                'contextual|no-contextual',
                                '(?:stylistic|character-variant|swash|ornaments|annotation)\\([^)]*\\)',
                                'small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps',
                                'lining-nums|oldstyle-nums|proportional-nums|tabular-nums',
                                'diagonal-fractions|stacked-fractions',
                                'ordinal|slashed-zero',
                                'jis78|jis83|jis90|jis04|simplified|traditional',
                                'full-width|proportional-width',
                                'ruby',
                            ].join('|') +
                            ')$',
                    ),
                    weight: /^(?:normal|bold|bolder|lighter|[1-9]00|inherit|initial|unset)$/,
                    stretch: new RegExp(
                        '^(?:' +
                            [
                                'normal',
                                '(?:(?:ultra|extra|semi)-)?condensed',
                                '(?:(?:semi|extra|ulta)-)?expanded',
                                'inherit|initial|unset',
                            ].join('|') +
                            ')$',
                    ),
                    size: new RegExp(
                        '^(?:' +
                            [
                                'xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller',
                                '[d.]+%|[d.]+[a-z]+',
                                'inherit|initial|unset',
                            ].join('|') +
                            ')(?:/(?:normal|[d.+](?:%|[a-z]+)?))?$',
                    ),
                };
                function M(t) {
                    var e,
                        o,
                        i,
                        a,
                        l = s(this.styles[t]),
                        u = {
                            style: '',
                            variant: [],
                            weight: '',
                            stretch: '',
                            size: '',
                            family: '',
                            'line-height': '',
                        };
                    try {
                        for (var c = r(l), p = c.next(); !p.done; p = c.next()) {
                            var f = p.value;
                            u.family = f;
                            try {
                                for (
                                    var h = ((i = void 0), r(Object.keys(O))), d = h.next();
                                    !d.done;
                                    d = h.next()
                                ) {
                                    var y = d.value;
                                    if ((Array.isArray(u[y]) || '' === u[y]) && f.match(O[y]))
                                        if ('size' === y) {
                                            var M = n(f.split(/\//), 2),
                                                E = M[0],
                                                m = M[1];
                                            (u[y] = E), m && (u['line-height'] = m);
                                        } else
                                            '' === u.size &&
                                                (Array.isArray(u[y]) ? u[y].push(f) : (u[y] = f));
                                }
                            } catch (t) {
                                i = { error: t };
                            } finally {
                                try {
                                    d && !d.done && (a = h.return) && a.call(h);
                                } finally {
                                    if (i) throw i.error;
                                }
                            }
                        }
                    } catch (t) {
                        e = { error: t };
                    } finally {
                        try {
                            p && !p.done && (o = c.return) && o.call(c);
                        } finally {
                            if (e) throw e.error;
                        }
                    }
                    !(function (t, e) {
                        var n, o;
                        try {
                            for (
                                var i = r(v.connect[t].children), a = i.next();
                                !a.done;
                                a = i.next()
                            ) {
                                var s = a.value,
                                    l = this.childName(t, s);
                                if (Array.isArray(e[s])) {
                                    var u = e[s];
                                    u.length && (this.styles[l] = u.join(' '));
                                } else '' !== e[s] && (this.styles[l] = e[s]);
                            }
                        } catch (t) {
                            n = { error: t };
                        } finally {
                            try {
                                a && !a.done && (o = i.return) && o.call(i);
                            } finally {
                                if (n) throw n.error;
                            }
                        }
                    })(t, u),
                        delete this.styles[t];
                }
                function E(t) {}
                var v = (function () {
                    function t(t) {
                        void 0 === t && (t = ''), this.parse(t);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'cssText', {
                            get: function () {
                                var t,
                                    e,
                                    n = [];
                                try {
                                    for (
                                        var o = r(Object.keys(this.styles)), i = o.next();
                                        !i.done;
                                        i = o.next()
                                    ) {
                                        var a = i.value,
                                            s = this.parentName(a);
                                        this.styles[s] || n.push(a + ': ' + this.styles[a] + ';');
                                    }
                                } catch (e) {
                                    t = { error: e };
                                } finally {
                                    try {
                                        i && !i.done && (e = o.return) && e.call(o);
                                    } finally {
                                        if (t) throw t.error;
                                    }
                                }
                                return n.join(' ');
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        (t.prototype.set = function (e, r) {
                            for (
                                e = this.normalizeName(e),
                                    this.setStyle(e, r),
                                    t.connect[e] &&
                                        !t.connect[e].combine &&
                                        (this.combineChildren(e), delete this.styles[e]);
                                e.match(/-/) && ((e = this.parentName(e)), t.connect[e]);

                            )
                                t.connect[e].combine.call(this, e);
                        }),
                        (t.prototype.get = function (t) {
                            return (
                                (t = this.normalizeName(t)),
                                this.styles.hasOwnProperty(t) ? this.styles[t] : ''
                            );
                        }),
                        (t.prototype.setStyle = function (e, r) {
                            (this.styles[e] = r),
                                t.connect[e] &&
                                    t.connect[e].children &&
                                    t.connect[e].split.call(this, e),
                                '' === r && delete this.styles[e];
                        }),
                        (t.prototype.combineChildren = function (e) {
                            var n,
                                o,
                                i = this.parentName(e);
                            try {
                                for (
                                    var a = r(t.connect[e].children), s = a.next();
                                    !s.done;
                                    s = a.next()
                                ) {
                                    var l = s.value,
                                        u = this.childName(i, l);
                                    t.connect[u].combine.call(this, u);
                                }
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    s && !s.done && (o = a.return) && o.call(a);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                        }),
                        (t.prototype.parentName = function (t) {
                            var e = t.replace(/-[^-]*$/, '');
                            return t === e ? '' : e;
                        }),
                        (t.prototype.childName = function (e, r) {
                            return r.match(/-/)
                                ? r
                                : (t.connect[e] &&
                                      !t.connect[e].combine &&
                                      ((r += e.replace(/.*-/, '-')), (e = this.parentName(e))),
                                  e + '-' + r);
                        }),
                        (t.prototype.normalizeName = function (t) {
                            return t.replace(/[A-Z]/g, function (t) {
                                return '-' + t.toLowerCase();
                            });
                        }),
                        (t.prototype.parse = function (t) {
                            void 0 === t && (t = '');
                            var e = this.constructor.pattern;
                            this.styles = {};
                            for (var r = t.replace(e.comment, '').split(e.style); r.length > 1; ) {
                                var o = n(r.splice(0, 3), 3),
                                    i = o[0],
                                    a = o[1],
                                    s = o[2];
                                if (i.match(/[^\s\n]/)) return;
                                this.set(a, s);
                            }
                        }),
                        (t.pattern = {
                            style: /([-a-z]+)[\s\n]*:[\s\n]*((?:'[^']*'|"[^"]*"|\n|.)*?)[\s\n]*(?:;|$)/g,
                            comment: /\/\*[^]*?\*\//g,
                        }),
                        (t.connect = {
                            padding: { children: i, split: l, combine: u },
                            border: { children: i, split: c, combine: p },
                            'border-top': { children: a, split: d, combine: y },
                            'border-right': { children: a, split: d, combine: y },
                            'border-bottom': { children: a, split: d, combine: y },
                            'border-left': { children: a, split: d, combine: y },
                            'border-width': { children: i, split: l, combine: null },
                            'border-style': { children: i, split: l, combine: null },
                            'border-color': { children: i, split: l, combine: null },
                            font: {
                                children: [
                                    'style',
                                    'variant',
                                    'weight',
                                    'stretch',
                                    'line-height',
                                    'size',
                                    'family',
                                ],
                                split: M,
                                combine: E,
                            },
                        }),
                        t
                    );
                })();
                e.Styles = v;
            },
            6010: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.px =
                        e.emRounded =
                        e.em =
                        e.percent =
                        e.length2em =
                        e.MATHSPACE =
                        e.RELUNITS =
                        e.UNITS =
                        e.BIGDIMEN =
                            void 0),
                    (e.BIGDIMEN = 1e6),
                    (e.UNITS = { px: 1, in: 96, cm: 96 / 2.54, mm: 96 / 25.4 }),
                    (e.RELUNITS = { em: 1, ex: 0.431, pt: 0.1, pc: 1.2, mu: 1 / 18 }),
                    (e.MATHSPACE = {
                        veryverythinmathspace: 1 / 18,
                        verythinmathspace: 2 / 18,
                        thinmathspace: 3 / 18,
                        mediummathspace: 4 / 18,
                        thickmathspace: 5 / 18,
                        verythickmathspace: 6 / 18,
                        veryverythickmathspace: 7 / 18,
                        negativeveryverythinmathspace: -1 / 18,
                        negativeverythinmathspace: -2 / 18,
                        negativethinmathspace: -3 / 18,
                        negativemediummathspace: -4 / 18,
                        negativethickmathspace: -5 / 18,
                        negativeverythickmathspace: -6 / 18,
                        negativeveryverythickmathspace: -7 / 18,
                        thin: 0.04,
                        medium: 0.06,
                        thick: 0.1,
                        normal: 1,
                        big: 2,
                        small: 1 / Math.sqrt(2),
                        infinity: e.BIGDIMEN,
                    }),
                    (e.length2em = function (t, r, n, o) {
                        if (
                            (void 0 === r && (r = 0),
                            void 0 === n && (n = 1),
                            void 0 === o && (o = 16),
                            'string' != typeof t && (t = String(t)),
                            '' === t || null == t)
                        )
                            return r;
                        if (e.MATHSPACE[t]) return e.MATHSPACE[t];
                        var i = t.match(
                            /^\s*([-+]?(?:\.\d+|\d+(?:\.\d*)?))?(pt|em|ex|mu|px|pc|in|mm|cm|%)?/,
                        );
                        if (!i) return r;
                        var a = parseFloat(i[1] || '1'),
                            s = i[2];
                        return e.UNITS.hasOwnProperty(s)
                            ? (a * e.UNITS[s]) / o / n
                            : e.RELUNITS.hasOwnProperty(s)
                              ? a * e.RELUNITS[s]
                              : '%' === s
                                ? (a / 100) * r
                                : a * r;
                    }),
                    (e.percent = function (t) {
                        return (100 * t).toFixed(1).replace(/\.?0+$/, '') + '%';
                    }),
                    (e.em = function (t) {
                        return Math.abs(t) < 0.001
                            ? '0'
                            : t.toFixed(3).replace(/\.?0+$/, '') + 'em';
                    }),
                    (e.emRounded = function (t, e) {
                        return (
                            void 0 === e && (e = 16),
                            (t = (Math.round(t * e) + 0.05) / e),
                            Math.abs(t) < 0.001 ? '0em' : t.toFixed(3).replace(/\.?0+$/, '') + 'em'
                        );
                    }),
                    (e.px = function (t, r, n) {
                        return (
                            void 0 === r && (r = -e.BIGDIMEN),
                            void 0 === n && (n = 16),
                            (t *= n),
                            r && t < r && (t = r),
                            Math.abs(t) < 0.1 ? '0' : t.toFixed(1).replace(/\.0$/, '') + 'px'
                        );
                    });
            },
            7875: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.max = e.sum = void 0),
                    (e.sum = function (t) {
                        return t.reduce(function (t, e) {
                            return t + e;
                        }, 0);
                    }),
                    (e.max = function (t) {
                        return t.reduce(function (t, e) {
                            return Math.max(t, e);
                        }, 0);
                    });
            },
            505: function (t, e) {
                var r =
                        (this && this.__read) ||
                        function (t, e) {
                            var r = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!r) return t;
                            var n,
                                o,
                                i = r.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(n = i.next()).done; )
                                    a.push(n.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    n && !n.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    n =
                        (this && this.__spreadArray) ||
                        function (t, e, r) {
                            if (r || 2 === arguments.length)
                                for (var n, o = 0, i = e.length; o < i; o++)
                                    (!n && o in e) ||
                                        (n || (n = Array.prototype.slice.call(e, 0, o)),
                                        (n[o] = e[o]));
                            return t.concat(n || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.split =
                        e.isPercent =
                        e.unicodeString =
                        e.unicodeChars =
                        e.quotePattern =
                        e.sortLength =
                            void 0),
                    (e.sortLength = function (t, e) {
                        return t.length !== e.length
                            ? e.length - t.length
                            : t === e
                              ? 0
                              : t < e
                                ? -1
                                : 1;
                    }),
                    (e.quotePattern = function (t) {
                        return t.replace(/([\^$(){}+*?\-|\[\]\:\\])/g, '\\$1');
                    }),
                    (e.unicodeChars = function (t) {
                        return Array.from(t).map(function (t) {
                            return t.codePointAt(0);
                        });
                    }),
                    (e.unicodeString = function (t) {
                        return String.fromCodePoint.apply(String, n([], r(t), !1));
                    }),
                    (e.isPercent = function (t) {
                        return !!t.match(/%\s*$/);
                    }),
                    (e.split = function (t) {
                        return t.trim().split(/\s+/);
                    });
            },
        },
        Rt = {};
    function Tt(t) {
        var e = Rt[t];
        if (void 0 !== e) return e.exports;
        var r = (Rt[t] = { exports: {} });
        return Nt[t].call(r.exports, r, r.exports, Tt), r.exports;
    }
    (Tt.g = (function () {
        if ('object' == typeof globalThis) return globalThis;
        try {
            return this || new Function('return this')();
        } catch (t) {
            if ('object' == typeof window) return window;
        }
    })()),
        (t = Tt(9515)),
        (e = Tt(3282)),
        (r = Tt(444)),
        (n = Tt(6191)),
        (o = Tt(5009)),
        (i = Tt(3494)),
        (a = Tt(3670)),
        (s = Tt(805)),
        (l = Tt(9206)),
        (u = Tt(5722)),
        (c = Tt(4474)),
        (p = Tt(9e3)),
        (f = Tt(91)),
        (h = Tt(6336)),
        (d = Tt(1759)),
        (y = Tt(3909)),
        (O = Tt(9007)),
        (M = Tt(3948)),
        (E = Tt(9145)),
        (v = Tt(142)),
        (m = Tt(7590)),
        (b = Tt(3233)),
        (g = Tt(1334)),
        (L = Tt(6661)),
        (N = Tt(1581)),
        (R = Tt(5410)),
        (T = Tt(6850)),
        (S = Tt(3985)),
        (A = Tt(450)),
        (C = Tt(6405)),
        (_ = Tt(3050)),
        (x = Tt(2756)),
        (I = Tt(7238)),
        (w = Tt(5741)),
        (P = Tt(6145)),
        (j = Tt(9878)),
        (D = Tt(7265)),
        (B = Tt(6030)),
        (k = Tt(7131)),
        (X = Tt(1314)),
        (H = Tt(4461)),
        (W = Tt(1349)),
        (F = Tt(4359)),
        (q = Tt(4770)),
        (J = Tt(5022)),
        (z = Tt(5184)),
        (G = Tt(9102)),
        (V = Tt(6325)),
        (U = Tt(4082)),
        (K = Tt(9259)),
        ($ = Tt(2975)),
        (Y = Tt(4574)),
        (Z = Tt(4596)),
        (Q = Tt(7860)),
        (tt = Tt(8823)),
        (et = Tt(8912)),
        (rt = Tt(3811)),
        (nt = Tt(6272)),
        (ot = Tt(3683)),
        (it = Tt(5138)),
        (at = Tt(3726)),
        (st = Tt(3363)),
        (lt = Tt(3335)),
        (ut = Tt(5713)),
        (ct = Tt(9923)),
        (pt = Tt(6469)),
        (ft = Tt(6751)),
        (ht = Tt(5368)),
        (dt = Tt(7525)),
        (yt = Tt(103)),
        (Ot = Tt(7233)),
        (Mt = Tt(8666)),
        (Et = Tt(4542)),
        (vt = Tt(4139)),
        (mt = Tt(8054)),
        (bt = Tt(6010)),
        (gt = Tt(7875)),
        (Lt = Tt(505)),
        MathJax.loader && MathJax.loader.checkVersion('core', e.VERSION, 'core'),
        (0, t.combineWithMathJax)({
            _: {
                adaptors: { HTMLAdaptor: r, browserAdaptor: n },
                components: { global: t },
                core: {
                    DOMAdaptor: o,
                    FindMath: i,
                    Handler: a,
                    HandlerList: s,
                    InputJax: l,
                    MathDocument: u,
                    MathItem: c,
                    MathList: p,
                    MmlTree: {
                        Attributes: f,
                        MML: h,
                        MathMLVisitor: d,
                        MmlFactory: y,
                        MmlNode: O,
                        MmlNodes: {
                            TeXAtom: M,
                            maction: E,
                            maligngroup: v,
                            malignmark: m,
                            math: b,
                            mathchoice: g,
                            menclose: L,
                            merror: N,
                            mfenced: R,
                            mfrac: T,
                            mglyph: S,
                            mi: A,
                            mmultiscripts: C,
                            mn: _,
                            mo: x,
                            mpadded: I,
                            mphantom: w,
                            mroot: P,
                            mrow: j,
                            ms: D,
                            mspace: B,
                            msqrt: k,
                            mstyle: X,
                            msubsup: H,
                            mtable: W,
                            mtd: F,
                            mtext: q,
                            mtr: J,
                            munderover: z,
                            semantics: G,
                        },
                        MmlVisitor: V,
                        OperatorDictionary: U,
                        SerializedMmlVisitor: K,
                    },
                    OutputJax: $,
                    Tree: {
                        Factory: Y,
                        Node: Z,
                        NodeFactory: Q,
                        Visitor: tt,
                        Wrapper: et,
                        WrapperFactory: rt,
                    },
                },
                handlers: {
                    html_ts: nt,
                    html: {
                        HTMLDocument: ot,
                        HTMLDomStrings: it,
                        HTMLHandler: at,
                        HTMLMathItem: st,
                        HTMLMathList: lt,
                    },
                },
                mathjax: ut,
                util: {
                    AsyncLoad: ct,
                    BBox: pt,
                    BitField: ft,
                    Entities: ht,
                    FunctionList: dt,
                    LinkedList: yt,
                    Options: Ot,
                    PrioritizedList: Mt,
                    Retries: Et,
                    StyleList: vt,
                    Styles: mt,
                    lengths: bt,
                    numeric: gt,
                    string: Lt,
                },
            },
        }),
        MathJax.startup &&
            (MathJax.startup.registerConstructor('HTMLHandler', at.HTMLHandler),
            MathJax.startup.registerConstructor('browserAdaptor', n.browserAdaptor),
            MathJax.startup.useHandler('HTMLHandler'),
            MathJax.startup.useAdaptor('browserAdaptor')),
        MathJax.loader &&
            (MathJax._.mathjax.mathjax.asyncLoad = function (t) {
                return MathJax.loader.load(t);
            });
})();
