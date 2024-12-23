!(function () {
    'use strict';
    var t,
        e,
        n,
        r,
        o,
        i,
        a,
        l,
        u,
        s = {
            244: function (t, e, n) {
                var r,
                    o =
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
                                        for (var n in e)
                                            Object.prototype.hasOwnProperty.call(e, n) &&
                                                (t[n] = e[n]);
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
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, n = 1, r = arguments.length; n < r; n++)
                                            for (var o in (e = arguments[n]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.NodeMixin = e.NodeMixinOptions = void 0);
                var a = n(77);
                (e.NodeMixinOptions = { badCSS: !0, badSizes: !0 }),
                    (e.NodeMixin = function (t, n) {
                        var r;
                        return (
                            void 0 === n && (n = {}),
                            (n = (0, a.userOptions)(
                                (0, a.defaultOptions)({}, e.NodeMixinOptions),
                                n,
                            )),
                            (r = (function (t) {
                                function e() {
                                    for (var e = [], n = 0; n < arguments.length; n++)
                                        e[n] = arguments[n];
                                    var r = t.call(this, e[0]) || this,
                                        o = r.constructor;
                                    return (
                                        (r.options = (0, a.userOptions)(
                                            (0, a.defaultOptions)({}, o.OPTIONS),
                                            e[1],
                                        )),
                                        r
                                    );
                                }
                                return (
                                    o(e, t),
                                    (e.prototype.fontSize = function (e) {
                                        return n.badCSS
                                            ? this.options.fontSize
                                            : t.prototype.fontSize.call(this, e);
                                    }),
                                    (e.prototype.fontFamily = function (e) {
                                        return n.badCSS
                                            ? this.options.fontFamily
                                            : t.prototype.fontFamily.call(this, e);
                                    }),
                                    (e.prototype.nodeSize = function (r, o, i) {
                                        if (
                                            (void 0 === o && (o = 1),
                                            void 0 === i && (i = null),
                                            !n.badSizes)
                                        )
                                            return t.prototype.nodeSize.call(this, r, o, i);
                                        var a = this.textContent(r),
                                            l = Array.from(a.replace(e.cjkPattern, '')).length;
                                        return [
                                            (Array.from(a).length - l) * this.options.cjkCharWidth +
                                                l * this.options.unknownCharWidth,
                                            this.options.unknownCharHeight,
                                        ];
                                    }),
                                    (e.prototype.nodeBBox = function (e) {
                                        return n.badSizes
                                            ? { left: 0, right: 0, top: 0, bottom: 0 }
                                            : t.prototype.nodeBBox.call(this, e);
                                    }),
                                    e
                                );
                            })(t)),
                            (r.OPTIONS = i(
                                i({}, n.badCSS ? { fontSize: 16, fontFamily: 'Times' } : {}),
                                n.badSizes
                                    ? {
                                          cjkCharWidth: 1,
                                          unknownCharWidth: 0.6,
                                          unknownCharHeight: 0.8,
                                      }
                                    : {},
                            )),
                            (r.cjkPattern = new RegExp(
                                [
                                    '[',
                                    '\u1100-\u115f',
                                    '\u2329\u232a',
                                    '\u2e80-\u303e',
                                    '\u3040-\u3247',
                                    '\u3250-\u4dbf',
                                    '\u4e00-\ua4c6',
                                    '\ua960-\ua97c',
                                    '\uac00-\ud7a3',
                                    '\uf900-\ufaff',
                                    '\ufe10-\ufe19',
                                    '\ufe30-\ufe6b',
                                    '\uff01-\uff60\uffe0-\uffe6',
                                    '\ud82c\udc00-\ud82c\udc01',
                                    '\ud83c\ude00-\ud83c\ude51',
                                    '\ud840\udc00-\ud8bf\udffd',
                                    ']',
                                ].join(''),
                                'gu',
                            )),
                            r
                        );
                    });
            },
            877: function (t, e, n) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.LiteDocument = void 0);
                var r = n(946),
                    o = (function () {
                        function t() {
                            (this.root = new r.LiteElement('html', {}, [
                                (this.head = new r.LiteElement('head')),
                                (this.body = new r.LiteElement('body')),
                            ])),
                                (this.type = '');
                        }
                        return (
                            Object.defineProperty(t.prototype, 'kind', {
                                get: function () {
                                    return '#document';
                                },
                                enumerable: !1,
                                configurable: !0,
                            }),
                            t
                        );
                    })();
                e.LiteDocument = o;
            },
            946: function (t, e) {
                var n =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (n =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, n = 1, r = arguments.length; n < r; n++)
                                            for (var o in (e = arguments[n]))
                                                Object.prototype.hasOwnProperty.call(e, o) &&
                                                    (t[o] = e[o]);
                                        return t;
                                    }),
                                n.apply(this, arguments)
                            );
                        },
                    r =
                        (this && this.__read) ||
                        function (t, e) {
                            var n = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!n) return t;
                            var r,
                                o,
                                i = n.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (n = i.return) && n.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    o =
                        (this && this.__spreadArray) ||
                        function (t, e, n) {
                            if (n || 2 === arguments.length)
                                for (var r, o = 0, i = e.length; o < i; o++)
                                    (!r && o in e) ||
                                        (r || (r = Array.prototype.slice.call(e, 0, o)),
                                        (r[o] = e[o]));
                            return t.concat(r || Array.prototype.slice.call(e));
                        },
                    i =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                n = e && t[e],
                                r = 0;
                            if (n) return n.call(t);
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.LiteElement = void 0);
                var a = function (t, e, a) {
                    var l, u;
                    void 0 === e && (e = {}),
                        void 0 === a && (a = []),
                        (this.kind = t),
                        (this.attributes = n({}, e)),
                        (this.children = o([], r(a), !1));
                    try {
                        for (var s = i(this.children), c = s.next(); !c.done; c = s.next())
                            c.value.parent = this;
                    } catch (t) {
                        l = { error: t };
                    } finally {
                        try {
                            c && !c.done && (u = s.return) && u.call(s);
                        } finally {
                            if (l) throw l.error;
                        }
                    }
                    this.styles = null;
                };
                e.LiteElement = a;
            },
            6: function (t, e) {
                var n =
                        (this && this.__read) ||
                        function (t, e) {
                            var n = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!n) return t;
                            var r,
                                o,
                                i = n.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (n = i.return) && n.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    r =
                        (this && this.__spreadArray) ||
                        function (t, e, n) {
                            if (n || 2 === arguments.length)
                                for (var r, o = 0, i = e.length; o < i; o++)
                                    (!r && o in e) ||
                                        (r || (r = Array.prototype.slice.call(e, 0, o)),
                                        (r[o] = e[o]));
                            return t.concat(r || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.LiteList = void 0);
                var o = (function () {
                    function t(t) {
                        (this.nodes = []), (this.nodes = r([], n(t), !1));
                    }
                    return (
                        (t.prototype.append = function (t) {
                            this.nodes.push(t);
                        }),
                        (t.prototype[Symbol.iterator] = function () {
                            var t = 0;
                            return {
                                next: function () {
                                    return t === this.nodes.length
                                        ? { value: null, done: !0 }
                                        : { value: this.nodes[t++], done: !1 };
                                },
                            };
                        }),
                        t
                    );
                })();
                e.LiteList = o;
            },
            246: function (t, e, n) {
                var r =
                        (this && this.__createBinding) ||
                        (Object.create
                            ? function (t, e, n, r) {
                                  void 0 === r && (r = n);
                                  var o = Object.getOwnPropertyDescriptor(e, n);
                                  (o &&
                                      !('get' in o
                                          ? !e.__esModule
                                          : o.writable || o.configurable)) ||
                                      (o = {
                                          enumerable: !0,
                                          get: function () {
                                              return e[n];
                                          },
                                      }),
                                      Object.defineProperty(t, r, o);
                              }
                            : function (t, e, n, r) {
                                  void 0 === r && (r = n), (t[r] = e[n]);
                              }),
                    o =
                        (this && this.__setModuleDefault) ||
                        (Object.create
                            ? function (t, e) {
                                  Object.defineProperty(t, 'default', { enumerable: !0, value: e });
                              }
                            : function (t, e) {
                                  t.default = e;
                              }),
                    i =
                        (this && this.__importStar) ||
                        function (t) {
                            if (t && t.__esModule) return t;
                            var e = {};
                            if (null != t)
                                for (var n in t)
                                    'default' !== n &&
                                        Object.prototype.hasOwnProperty.call(t, n) &&
                                        r(e, t, n);
                            return o(e, t), e;
                        },
                    a =
                        (this && this.__read) ||
                        function (t, e) {
                            var n = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!n) return t;
                            var r,
                                o,
                                i = n.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (n = i.return) && n.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    l =
                        (this && this.__values) ||
                        function (t) {
                            var e = 'function' == typeof Symbol && Symbol.iterator,
                                n = e && t[e],
                                r = 0;
                            if (n) return n.call(t);
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
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.LiteParser = e.PATTERNS = void 0);
                var u,
                    s = i(n(29)),
                    c = n(946),
                    p = n(735);
                !(function (t) {
                    (t.TAGNAME = '[a-z][^\\s\\n>]*'),
                        (t.ATTNAME = '[a-z][^\\s\\n>=]*'),
                        (t.VALUE = '(?:\'[^\']*\'|"[^"]*"|[^\\s\\n]+)'),
                        (t.VALUESPLIT = '(?:\'([^\']*)\'|"([^"]*)"|([^\\s\\n]+))'),
                        (t.SPACE = '(?:\\s|\\n)+'),
                        (t.OPTIONALSPACE = '(?:\\s|\\n)*'),
                        (t.ATTRIBUTE =
                            t.ATTNAME +
                            '(?:' +
                            t.OPTIONALSPACE +
                            '=' +
                            t.OPTIONALSPACE +
                            t.VALUE +
                            ')?'),
                        (t.ATTRIBUTESPLIT =
                            '(' +
                            t.ATTNAME +
                            ')(?:' +
                            t.OPTIONALSPACE +
                            '=' +
                            t.OPTIONALSPACE +
                            t.VALUESPLIT +
                            ')?'),
                        (t.TAG =
                            '(<(?:' +
                            t.TAGNAME +
                            '(?:' +
                            t.SPACE +
                            t.ATTRIBUTE +
                            ')*' +
                            t.OPTIONALSPACE +
                            '/?|/' +
                            t.TAGNAME +
                            '|!--[^]*?--|![^]*?)(?:>|$))'),
                        (t.tag = new RegExp(t.TAG, 'i')),
                        (t.attr = new RegExp(t.ATTRIBUTE, 'i')),
                        (t.attrsplit = new RegExp(t.ATTRIBUTESPLIT, 'i'));
                })((u = e.PATTERNS || (e.PATTERNS = {})));
                var f = (function () {
                    function t() {}
                    return (
                        (t.prototype.parseFromString = function (t, e, n) {
                            void 0 === e && (e = 'text/html'), void 0 === n && (n = null);
                            for (
                                var r = n.createDocument(),
                                    o = n.body(r),
                                    i = t.replace(/<\?.*?\?>/g, '').split(u.tag);
                                i.length;

                            ) {
                                var a = i.shift(),
                                    l = i.shift();
                                a && this.addText(n, o, a),
                                    l &&
                                        '>' === l.charAt(l.length - 1) &&
                                        ('!' === l.charAt(1)
                                            ? this.addComment(n, o, l)
                                            : (o =
                                                  '/' === l.charAt(1)
                                                      ? this.closeTag(n, o, l)
                                                      : this.openTag(n, o, l, i)));
                            }
                            return this.checkDocument(n, r), r;
                        }),
                        (t.prototype.addText = function (t, e, n) {
                            return (n = s.translate(n)), t.append(e, t.text(n));
                        }),
                        (t.prototype.addComment = function (t, e, n) {
                            return t.append(e, new p.LiteComment(n));
                        }),
                        (t.prototype.closeTag = function (t, e, n) {
                            for (
                                var r = n.slice(2, n.length - 1).toLowerCase();
                                t.parent(e) && t.kind(e) !== r;

                            )
                                e = t.parent(e);
                            return t.parent(e);
                        }),
                        (t.prototype.openTag = function (t, e, n, r) {
                            var o = this.constructor.PCDATA,
                                i = this.constructor.SELF_CLOSING,
                                a = n.match(/<(.*?)[\s\n>\/]/)[1].toLowerCase(),
                                l = t.node(a),
                                s = n.replace(/^<.*?[\s\n>]/, '').split(u.attrsplit);
                            return (
                                (s.pop().match(/>$/) || s.length < 5) &&
                                    (this.addAttributes(t, l, s),
                                    t.append(e, l),
                                    i[a] ||
                                        n.match(/\/>$/) ||
                                        (o[a] ? this.handlePCDATA(t, l, a, r) : (e = l))),
                                e
                            );
                        }),
                        (t.prototype.addAttributes = function (t, e, n) {
                            for (var r = this.constructor.CDATA_ATTR; n.length; ) {
                                var o = a(n.splice(0, 5), 5),
                                    i = o[1],
                                    l = o[2],
                                    u = o[3],
                                    c = o[4],
                                    p = l || u || c || '';
                                r[i] || (p = s.translate(p)), t.setAttribute(e, i, p);
                            }
                        }),
                        (t.prototype.handlePCDATA = function (t, e, n, r) {
                            for (var o = [], i = '</' + n + '>', a = ''; r.length && a !== i; )
                                o.push(a), o.push(r.shift()), (a = r.shift());
                            t.append(e, t.text(o.join('')));
                        }),
                        (t.prototype.checkDocument = function (t, e) {
                            var n,
                                r,
                                o,
                                i,
                                a = this.getOnlyChild(t, t.body(e));
                            if (a) {
                                try {
                                    for (
                                        var u = l(t.childNodes(t.body(e))), s = u.next();
                                        !s.done;
                                        s = u.next()
                                    ) {
                                        if ((h = s.value) === a) break;
                                        h instanceof p.LiteComment &&
                                            h.value.match(/^<!DOCTYPE/) &&
                                            (e.type = h.value);
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        s && !s.done && (r = u.return) && r.call(u);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                                switch (t.kind(a)) {
                                    case 'html':
                                        try {
                                            for (
                                                var c = l(a.children), f = c.next();
                                                !f.done;
                                                f = c.next()
                                            ) {
                                                var h = f.value;
                                                switch (t.kind(h)) {
                                                    case 'head':
                                                        e.head = h;
                                                        break;
                                                    case 'body':
                                                        e.body = h;
                                                }
                                            }
                                        } catch (t) {
                                            o = { error: t };
                                        } finally {
                                            try {
                                                f && !f.done && (i = c.return) && i.call(c);
                                            } finally {
                                                if (o) throw o.error;
                                            }
                                        }
                                        (e.root = a),
                                            t.remove(a),
                                            t.parent(e.body) !== a && t.append(a, e.body),
                                            t.parent(e.head) !== a && t.insert(e.head, e.body);
                                        break;
                                    case 'head':
                                        e.head = t.replace(a, e.head);
                                        break;
                                    case 'body':
                                        e.body = t.replace(a, e.body);
                                }
                            }
                        }),
                        (t.prototype.getOnlyChild = function (t, e) {
                            var n,
                                r,
                                o = null;
                            try {
                                for (
                                    var i = l(t.childNodes(e)), a = i.next();
                                    !a.done;
                                    a = i.next()
                                ) {
                                    var u = a.value;
                                    if (u instanceof c.LiteElement) {
                                        if (o) return null;
                                        o = u;
                                    }
                                }
                            } catch (t) {
                                n = { error: t };
                            } finally {
                                try {
                                    a && !a.done && (r = i.return) && r.call(i);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return o;
                        }),
                        (t.prototype.serialize = function (t, e, n) {
                            var r = this;
                            void 0 === n && (n = !1);
                            var o = this.constructor.SELF_CLOSING,
                                i = this.constructor.CDATA_ATTR,
                                a = t.kind(e),
                                l = t
                                    .allAttributes(e)
                                    .map(function (t) {
                                        return (
                                            t.name +
                                            '="' +
                                            (i[t.name] ? t.value : r.protectAttribute(t.value)) +
                                            '"'
                                        );
                                    })
                                    .join(' '),
                                u = this.serializeInner(t, e, n);
                            return (
                                '<' +
                                a +
                                (l ? ' ' + l : '') +
                                ((n && !u) || o[a]
                                    ? n
                                        ? '/>'
                                        : '>'
                                    : '>'.concat(u, '</').concat(a, '>'))
                            );
                        }),
                        (t.prototype.serializeInner = function (t, e, n) {
                            var r = this;
                            return (
                                void 0 === n && (n = !1),
                                this.constructor.PCDATA.hasOwnProperty(e.kind)
                                    ? t
                                          .childNodes(e)
                                          .map(function (e) {
                                              return t.value(e);
                                          })
                                          .join('')
                                    : t
                                          .childNodes(e)
                                          .map(function (e) {
                                              var o = t.kind(e);
                                              return '#text' === o
                                                  ? r.protectHTML(t.value(e))
                                                  : '#comment' === o
                                                    ? e.value
                                                    : r.serialize(t, e, n);
                                          })
                                          .join('')
                            );
                        }),
                        (t.prototype.protectAttribute = function (t) {
                            return (
                                'string' != typeof t && (t = String(t)), t.replace(/"/g, '&quot;')
                            );
                        }),
                        (t.prototype.protectHTML = function (t) {
                            return t
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;');
                        }),
                        (t.SELF_CLOSING = {
                            area: !0,
                            base: !0,
                            br: !0,
                            col: !0,
                            command: !0,
                            embed: !0,
                            hr: !0,
                            img: !0,
                            input: !0,
                            keygen: !0,
                            link: !0,
                            menuitem: !0,
                            meta: !0,
                            param: !0,
                            source: !0,
                            track: !0,
                            wbr: !0,
                        }),
                        (t.PCDATA = {
                            option: !0,
                            textarea: !0,
                            fieldset: !0,
                            title: !0,
                            style: !0,
                            script: !0,
                        }),
                        (t.CDATA_ATTR = {
                            style: !0,
                            datafld: !0,
                            datasrc: !0,
                            href: !0,
                            src: !0,
                            longdesc: !0,
                            usemap: !0,
                            cite: !0,
                            datetime: !0,
                            action: !0,
                            axis: !0,
                            profile: !0,
                            content: !0,
                            scheme: !0,
                        }),
                        t
                    );
                })();
                e.LiteParser = f;
            },
            735: function (t, e) {
                var n,
                    r =
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
                                        for (var n in e)
                                            Object.prototype.hasOwnProperty.call(e, n) &&
                                                (t[n] = e[n]);
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
                    (e.LiteComment = e.LiteText = void 0);
                var o = (function () {
                    function t(t) {
                        void 0 === t && (t = ''), (this.value = t);
                    }
                    return (
                        Object.defineProperty(t.prototype, 'kind', {
                            get: function () {
                                return '#text';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        t
                    );
                })();
                e.LiteText = o;
                var i = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return (
                        r(e, t),
                        Object.defineProperty(e.prototype, 'kind', {
                            get: function () {
                                return '#comment';
                            },
                            enumerable: !1,
                            configurable: !0,
                        }),
                        e
                    );
                })(o);
                e.LiteComment = i;
            },
            492: function (t, e, n) {
                Object.defineProperty(e, '__esModule', { value: !0 }), (e.LiteWindow = void 0);
                var r = n(946),
                    o = n(877),
                    i = n(6),
                    a = n(246),
                    l = function () {
                        (this.DOMParser = a.LiteParser),
                            (this.NodeList = i.LiteList),
                            (this.HTMLCollection = i.LiteList),
                            (this.HTMLElement = r.LiteElement),
                            (this.DocumentFragment = i.LiteList),
                            (this.Document = o.LiteDocument),
                            (this.document = new o.LiteDocument());
                    };
                e.LiteWindow = l;
            },
            250: function (t, e, n) {
                var r,
                    o =
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
                                        for (var n in e)
                                            Object.prototype.hasOwnProperty.call(e, n) &&
                                                (t[n] = e[n]);
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
                    i =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e, n = 1, r = arguments.length; n < r; n++)
                                            for (var o in (e = arguments[n]))
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
                                n = e && t[e],
                                r = 0;
                            if (n) return n.call(t);
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
                    l =
                        (this && this.__read) ||
                        function (t, e) {
                            var n = 'function' == typeof Symbol && t[Symbol.iterator];
                            if (!n) return t;
                            var r,
                                o,
                                i = n.call(t),
                                a = [];
                            try {
                                for (; (void 0 === e || e-- > 0) && !(r = i.next()).done; )
                                    a.push(r.value);
                            } catch (t) {
                                o = { error: t };
                            } finally {
                                try {
                                    r && !r.done && (n = i.return) && n.call(i);
                                } finally {
                                    if (o) throw o.error;
                                }
                            }
                            return a;
                        },
                    u =
                        (this && this.__spreadArray) ||
                        function (t, e, n) {
                            if (n || 2 === arguments.length)
                                for (var r, o = 0, i = e.length; o < i; o++)
                                    (!r && o in e) ||
                                        (r || (r = Array.prototype.slice.call(e, 0, o)),
                                        (r[o] = e[o]));
                            return t.concat(r || Array.prototype.slice.call(e));
                        };
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.liteAdaptor = e.LiteAdaptor = e.LiteBase = void 0);
                var s = n(857),
                    c = n(244),
                    p = n(877),
                    f = n(946),
                    h = n(735),
                    d = n(492),
                    y = n(246),
                    v = n(878),
                    b = (function (t) {
                        function e() {
                            var e = t.call(this) || this;
                            return (
                                (e.parser = new y.LiteParser()), (e.window = new d.LiteWindow()), e
                            );
                        }
                        return (
                            o(e, t),
                            (e.prototype.parse = function (t, e) {
                                return this.parser.parseFromString(t, e, this);
                            }),
                            (e.prototype.create = function (t, e) {
                                return void 0 === e && (e = null), new f.LiteElement(t);
                            }),
                            (e.prototype.text = function (t) {
                                return new h.LiteText(t);
                            }),
                            (e.prototype.comment = function (t) {
                                return new h.LiteComment(t);
                            }),
                            (e.prototype.createDocument = function () {
                                return new p.LiteDocument();
                            }),
                            (e.prototype.head = function (t) {
                                return t.head;
                            }),
                            (e.prototype.body = function (t) {
                                return t.body;
                            }),
                            (e.prototype.root = function (t) {
                                return t.root;
                            }),
                            (e.prototype.doctype = function (t) {
                                return t.type;
                            }),
                            (e.prototype.tags = function (t, e, n) {
                                void 0 === n && (n = null);
                                var r = [],
                                    o = [];
                                if (n) return o;
                                for (var i = t; i; ) {
                                    var a = i.kind;
                                    '#text' !== a &&
                                        '#comment' !== a &&
                                        ((i = i),
                                        a === e && o.push(i),
                                        i.children.length && (r = i.children.concat(r))),
                                        (i = r.shift());
                                }
                                return o;
                            }),
                            (e.prototype.elementById = function (t, e) {
                                for (var n = [], r = t; r; ) {
                                    if ('#text' !== r.kind && '#comment' !== r.kind) {
                                        if ((r = r).attributes.id === e) return r;
                                        r.children.length && (n = r.children.concat(n));
                                    }
                                    r = n.shift();
                                }
                                return null;
                            }),
                            (e.prototype.elementsByClass = function (t, e) {
                                for (var n = [], r = [], o = t; o; ) {
                                    if ('#text' !== o.kind && '#comment' !== o.kind)
                                        ((o = o).attributes.class || '')
                                            .trim()
                                            .split(/ +/)
                                            .includes(e) && r.push(o),
                                            o.children.length && (n = o.children.concat(n));
                                    o = n.shift();
                                }
                                return r;
                            }),
                            (e.prototype.getElements = function (t, e) {
                                var n,
                                    r,
                                    o = [],
                                    i = this.body(e);
                                try {
                                    for (var l = a(t), u = l.next(); !u.done; u = l.next()) {
                                        var s = u.value;
                                        if ('string' == typeof s)
                                            if ('#' === s.charAt(0)) {
                                                var c = this.elementById(i, s.slice(1));
                                                c && o.push(c);
                                            } else
                                                '.' === s.charAt(0)
                                                    ? (o = o.concat(
                                                          this.elementsByClass(i, s.slice(1)),
                                                      ))
                                                    : s.match(/^[-a-z][-a-z0-9]*$/i) &&
                                                      (o = o.concat(this.tags(i, s)));
                                        else
                                            Array.isArray(s)
                                                ? (o = o.concat(s))
                                                : s instanceof this.window.NodeList ||
                                                    s instanceof this.window.HTMLCollection
                                                  ? (o = o.concat(s.nodes))
                                                  : o.push(s);
                                    }
                                } catch (t) {
                                    n = { error: t };
                                } finally {
                                    try {
                                        u && !u.done && (r = l.return) && r.call(l);
                                    } finally {
                                        if (n) throw n.error;
                                    }
                                }
                                return o;
                            }),
                            (e.prototype.contains = function (t, e) {
                                for (; e && e !== t; ) e = this.parent(e);
                                return !!e;
                            }),
                            (e.prototype.parent = function (t) {
                                return t.parent;
                            }),
                            (e.prototype.childIndex = function (t) {
                                return t.parent
                                    ? t.parent.children.findIndex(function (e) {
                                          return e === t;
                                      })
                                    : -1;
                            }),
                            (e.prototype.append = function (t, e) {
                                return (
                                    e.parent && this.remove(e),
                                    t.children.push(e),
                                    (e.parent = t),
                                    e
                                );
                            }),
                            (e.prototype.insert = function (t, e) {
                                if ((t.parent && this.remove(t), e && e.parent)) {
                                    var n = this.childIndex(e);
                                    e.parent.children.splice(n, 0, t), (t.parent = e.parent);
                                }
                            }),
                            (e.prototype.remove = function (t) {
                                var e = this.childIndex(t);
                                return (
                                    e >= 0 && t.parent.children.splice(e, 1), (t.parent = null), t
                                );
                            }),
                            (e.prototype.replace = function (t, e) {
                                var n = this.childIndex(e);
                                return (
                                    n >= 0 &&
                                        ((e.parent.children[n] = t),
                                        (t.parent = e.parent),
                                        (e.parent = null)),
                                    e
                                );
                            }),
                            (e.prototype.clone = function (t) {
                                var e = this,
                                    n = new f.LiteElement(t.kind);
                                return (
                                    (n.attributes = i({}, t.attributes)),
                                    (n.children = t.children.map(function (t) {
                                        if ('#text' === t.kind) return new h.LiteText(t.value);
                                        if ('#comment' === t.kind)
                                            return new h.LiteComment(t.value);
                                        var r = e.clone(t);
                                        return (r.parent = n), r;
                                    })),
                                    n
                                );
                            }),
                            (e.prototype.split = function (t, e) {
                                var n = new h.LiteText(t.value.slice(e));
                                return (
                                    (t.value = t.value.slice(0, e)),
                                    t.parent.children.splice(this.childIndex(t) + 1, 0, n),
                                    (n.parent = t.parent),
                                    n
                                );
                            }),
                            (e.prototype.next = function (t) {
                                var e = t.parent;
                                if (!e) return null;
                                var n = this.childIndex(t) + 1;
                                return n >= 0 && n < e.children.length ? e.children[n] : null;
                            }),
                            (e.prototype.previous = function (t) {
                                var e = t.parent;
                                if (!e) return null;
                                var n = this.childIndex(t) - 1;
                                return n >= 0 ? e.children[n] : null;
                            }),
                            (e.prototype.firstChild = function (t) {
                                return t.children[0];
                            }),
                            (e.prototype.lastChild = function (t) {
                                return t.children[t.children.length - 1];
                            }),
                            (e.prototype.childNodes = function (t) {
                                return u([], l(t.children), !1);
                            }),
                            (e.prototype.childNode = function (t, e) {
                                return t.children[e];
                            }),
                            (e.prototype.kind = function (t) {
                                return t.kind;
                            }),
                            (e.prototype.value = function (t) {
                                return '#text' === t.kind
                                    ? t.value
                                    : '#comment' === t.kind
                                      ? t.value.replace(/^<!(--)?((?:.|\n)*)\1>$/, '$2')
                                      : '';
                            }),
                            (e.prototype.textContent = function (t) {
                                var e = this;
                                return t.children.reduce(function (t, n) {
                                    return (
                                        t +
                                        ('#text' === n.kind
                                            ? n.value
                                            : '#comment' === n.kind
                                              ? ''
                                              : e.textContent(n))
                                    );
                                }, '');
                            }),
                            (e.prototype.innerHTML = function (t) {
                                return this.parser.serializeInner(this, t);
                            }),
                            (e.prototype.outerHTML = function (t) {
                                return this.parser.serialize(this, t);
                            }),
                            (e.prototype.serializeXML = function (t) {
                                return this.parser.serialize(this, t, !0);
                            }),
                            (e.prototype.setAttribute = function (t, e, n, r) {
                                void 0 === r && (r = null),
                                    'string' != typeof n && (n = String(n)),
                                    r && (e = r.replace(/.*\//, '') + ':' + e.replace(/^.*:/, '')),
                                    (t.attributes[e] = n),
                                    'style' === e && (t.styles = null);
                            }),
                            (e.prototype.getAttribute = function (t, e) {
                                return t.attributes[e];
                            }),
                            (e.prototype.removeAttribute = function (t, e) {
                                delete t.attributes[e];
                            }),
                            (e.prototype.hasAttribute = function (t, e) {
                                return t.attributes.hasOwnProperty(e);
                            }),
                            (e.prototype.allAttributes = function (t) {
                                var e,
                                    n,
                                    r = t.attributes,
                                    o = [];
                                try {
                                    for (
                                        var i = a(Object.keys(r)), l = i.next();
                                        !l.done;
                                        l = i.next()
                                    ) {
                                        var u = l.value;
                                        o.push({ name: u, value: r[u] });
                                    }
                                } catch (t) {
                                    e = { error: t };
                                } finally {
                                    try {
                                        l && !l.done && (n = i.return) && n.call(i);
                                    } finally {
                                        if (e) throw e.error;
                                    }
                                }
                                return o;
                            }),
                            (e.prototype.addClass = function (t, e) {
                                var n = (t.attributes.class || '').split(/ /);
                                n.find(function (t) {
                                    return t === e;
                                }) || (n.push(e), (t.attributes.class = n.join(' ')));
                            }),
                            (e.prototype.removeClass = function (t, e) {
                                var n = (t.attributes.class || '').split(/ /),
                                    r = n.findIndex(function (t) {
                                        return t === e;
                                    });
                                r >= 0 && (n.splice(r, 1), (t.attributes.class = n.join(' ')));
                            }),
                            (e.prototype.hasClass = function (t, e) {
                                return !!(t.attributes.class || '').split(/ /).find(function (t) {
                                    return t === e;
                                });
                            }),
                            (e.prototype.setStyle = function (t, e, n) {
                                t.styles ||
                                    (t.styles = new v.Styles(this.getAttribute(t, 'style'))),
                                    t.styles.set(e, n),
                                    (t.attributes.style = t.styles.cssText);
                            }),
                            (e.prototype.getStyle = function (t, e) {
                                if (!t.styles) {
                                    var n = this.getAttribute(t, 'style');
                                    if (!n) return '';
                                    t.styles = new v.Styles(n);
                                }
                                return t.styles.get(e);
                            }),
                            (e.prototype.allStyles = function (t) {
                                return this.getAttribute(t, 'style');
                            }),
                            (e.prototype.insertRules = function (t, e) {
                                t.children = [
                                    this.text(e.join('\n\n') + '\n\n' + this.textContent(t)),
                                ];
                            }),
                            (e.prototype.fontSize = function (t) {
                                return 0;
                            }),
                            (e.prototype.fontFamily = function (t) {
                                return '';
                            }),
                            (e.prototype.nodeSize = function (t, e, n) {
                                return void 0 === e && (e = 1), void 0 === n && (n = null), [0, 0];
                            }),
                            (e.prototype.nodeBBox = function (t) {
                                return { left: 0, right: 0, top: 0, bottom: 0 };
                            }),
                            e
                        );
                    })(s.AbstractDOMAdaptor);
                e.LiteBase = b;
                var m = (function (t) {
                    function e() {
                        return (null !== t && t.apply(this, arguments)) || this;
                    }
                    return o(e, t), e;
                })((0, c.NodeMixin)(b));
                (e.LiteAdaptor = m),
                    (e.liteAdaptor = function (t) {
                        return void 0 === t && (t = null), new m(null, t);
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
            857: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.AbstractDOMAdaptor = MathJax._.core.DOMAdaptor.AbstractDOMAdaptor);
            },
            29: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.options = MathJax._.util.Entities.options),
                    (e.entities = MathJax._.util.Entities.entities),
                    (e.add = MathJax._.util.Entities.add),
                    (e.remove = MathJax._.util.Entities.remove),
                    (e.translate = MathJax._.util.Entities.translate),
                    (e.numeric = MathJax._.util.Entities.numeric);
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
            878: function (t, e) {
                Object.defineProperty(e, '__esModule', { value: !0 }),
                    (e.Styles = MathJax._.util.Styles.Styles);
            },
        },
        c = {};
    function p(t) {
        var e = c[t];
        if (void 0 !== e) return e.exports;
        var n = (c[t] = { exports: {} });
        return s[t].call(n.exports, n, n.exports, p), n.exports;
    }
    (t = p(723)),
        (e = p(306)),
        (n = p(250)),
        (r = p(877)),
        (o = p(946)),
        (i = p(6)),
        (a = p(246)),
        (l = p(735)),
        (u = p(492)),
        MathJax.loader && MathJax.loader.checkVersion('adaptors/liteDOM', e.q, 'adaptors'),
        (0, t.r8)({
            _: {
                adaptors: {
                    liteAdaptor: n,
                    lite: { Document: r, Element: o, List: i, Parser: a, Text: l, Window: u },
                },
            },
        }),
        MathJax.startup &&
            (MathJax.startup.registerConstructor('liteAdaptor', n.liteAdaptor),
            MathJax.startup.useAdaptor('liteAdaptor', !0));
})();
