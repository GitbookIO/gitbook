(function () {
    'use strict';
    var __webpack_modules__ = {
            667: function (e, t) {
                (t.q = void 0), (t.q = '3.2.2');
            },
            63: function (__unused_webpack_module, exports) {
                function createTransform() {
                    var nodeRequire = eval('require'),
                        dirname = eval('__dirname');
                    try {
                        nodeRequire.resolve('saxon-js');
                    } catch (e) {
                        throw Error(
                            'Saxon-js not found.  Run the command:\n    npm install saxon-js\nand try again.',
                        );
                    }
                    var Saxon = nodeRequire('saxon-js'),
                        path = nodeRequire('path'),
                        fs = nodeRequire('fs'),
                        xsltFile = path.resolve(dirname, 'mml3.sef.json'),
                        xslt = JSON.parse(fs.readFileSync(xsltFile));
                    return function (e, t) {
                        var l,
                            s = t.adaptor,
                            n = s.outerHTML(e);
                        n.match(/ xmlns[=:]/) ||
                            (n = n.replace(
                                /<(?:(\w+)(:))?math/,
                                '<$1$2math xmlns$2$1="http://www.w3.org/1998/Math/MathML"',
                            ));
                        try {
                            l = s.firstChild(
                                s.body(
                                    s.parse(
                                        Saxon.transform({
                                            stylesheetInternal: xslt,
                                            sourceText: n,
                                            destination: 'serialized',
                                        }).principalResult,
                                    ),
                                ),
                            );
                        } catch (t) {
                            l = e;
                        }
                        return l;
                    };
                }
                Object.defineProperty(exports, '__esModule', { value: !0 }),
                    (exports.createTransform = void 0),
                    (exports.createTransform = createTransform);
            },
            514: function (e, t, l) {
                var s,
                    n =
                        (this && this.__extends) ||
                        ((s = function (e, t) {
                            return (
                                (s =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var l in t)
                                            Object.prototype.hasOwnProperty.call(t, l) &&
                                                (e[l] = t[l]);
                                    }),
                                s(e, t)
                            );
                        }),
                        function (e, t) {
                            if ('function' != typeof t && null !== t)
                                throw new TypeError(
                                    'Class extends value ' +
                                        String(t) +
                                        ' is not a constructor or null',
                                );
                            function l() {
                                this.constructor = e;
                            }
                            s(e, t),
                                (e.prototype =
                                    null === t
                                        ? Object.create(t)
                                        : ((l.prototype = t.prototype), new l()));
                        }),
                    m =
                        (this && this.__assign) ||
                        function () {
                            return (
                                (m =
                                    Object.assign ||
                                    function (e) {
                                        for (var t, l = 1, s = arguments.length; l < s; l++)
                                            for (var n in (t = arguments[l]))
                                                Object.prototype.hasOwnProperty.call(t, n) &&
                                                    (e[n] = t[n]);
                                        return e;
                                    }),
                                m.apply(this, arguments)
                            );
                        },
                    o =
                        (this && this.__read) ||
                        function (e, t) {
                            var l = 'function' == typeof Symbol && e[Symbol.iterator];
                            if (!l) return e;
                            var s,
                                n,
                                m = l.call(e),
                                o = [];
                            try {
                                for (; (void 0 === t || t-- > 0) && !(s = m.next()).done; )
                                    o.push(s.value);
                            } catch (e) {
                                n = { error: e };
                            } finally {
                                try {
                                    s && !s.done && (l = m.return) && l.call(m);
                                } finally {
                                    if (n) throw n.error;
                                }
                            }
                            return o;
                        },
                    a =
                        (this && this.__spreadArray) ||
                        function (e, t, l) {
                            if (l || 2 === arguments.length)
                                for (var s, n = 0, m = t.length; n < m; n++)
                                    (!s && n in t) ||
                                        (s || (s = Array.prototype.slice.call(t, 0, n)),
                                        (s[n] = t[n]));
                            return e.concat(s || Array.prototype.slice.call(t));
                        },
                    r =
                        (this && this.__values) ||
                        function (e) {
                            var t = 'function' == typeof Symbol && Symbol.iterator,
                                l = t && e[t],
                                s = 0;
                            if (l) return l.call(e);
                            if (e && 'number' == typeof e.length)
                                return {
                                    next: function () {
                                        return (
                                            e && s >= e.length && (e = void 0),
                                            { value: e && e[s++], done: !e }
                                        );
                                    },
                                };
                            throw new TypeError(
                                t ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
                            );
                        };
                Object.defineProperty(t, '__esModule', { value: !0 }),
                    (t.Mml3Handler = t.Mml3 = void 0);
                var c = l(63),
                    i = (function () {
                        function e(t) {
                            if ('undefined' == typeof XSLTProcessor)
                                this.transform = (0, c.createTransform)();
                            else {
                                var l = new XSLTProcessor(),
                                    s = t.adaptor.parse(e.XSLT, 'text/xml');
                                l.importStylesheet(s),
                                    (this.transform = function (e) {
                                        var s = t.adaptor,
                                            n = s.node('div', {}, [s.clone(e)]),
                                            m = l.transformToDocument(n);
                                        return s.tags(m, 'math')[0];
                                    });
                            }
                        }
                        return (
                            (e.prototype.mmlFilter = function (e) {
                                e.document.options.enableMml3 &&
                                    (e.data = this.transform(e.data, e.document));
                            }),
                            e
                        );
                    })();
                (t.Mml3 = i),
                    (t.Mml3Handler = function (e) {
                        var t;
                        return (
                            (e.documentClass =
                                ((t = (function (e) {
                                    function t() {
                                        for (var t, l, s = [], n = 0; n < arguments.length; n++)
                                            s[n] = arguments[n];
                                        var m = e.apply(this, a([], o(s), !1)) || this;
                                        try {
                                            for (
                                                var c = r(m.inputJax || []), p = c.next();
                                                !p.done;
                                                p = c.next()
                                            ) {
                                                var x = p.value;
                                                if ('MathML' === x.name) {
                                                    if (!x.options._mml3) {
                                                        var d = new i(m);
                                                        x.mmlFilters.add(d.mmlFilter.bind(d)),
                                                            (x.options._mml3 = !0);
                                                    }
                                                    break;
                                                }
                                            }
                                        } catch (e) {
                                            t = { error: e };
                                        } finally {
                                            try {
                                                p && !p.done && (l = c.return) && l.call(c);
                                            } finally {
                                                if (t) throw t.error;
                                            }
                                        }
                                        return m;
                                    }
                                    return n(t, e), t;
                                })(e.documentClass)),
                                (t.OPTIONS = m(m({}, e.documentClass.OPTIONS), { enableMml3: !0 })),
                                t)),
                            e
                        );
                    }),
                    (i.XSLT =
                        '\n<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"\n\t\txmlns:m="http://www.w3.org/1998/Math/MathML"\n\t\txmlns:c="http://exslt.org/common"\n\t\texclude-result-prefixes="m c">\n<xsl:output indent="yes" omit-xml-declaration="yes"/>\n<xsl:output indent="yes" omit-xml-declaration="yes"/>\n<xsl:template match="*">\n <xsl:copy>\n  <xsl:copy-of select="@*"/>\n  <xsl:apply-templates/>\n </xsl:copy>\n</xsl:template>\n<xsl:template match="m:*[@dir=\'rtl\']"  priority="10">\n <xsl:apply-templates mode="rtl" select="."/>\n</xsl:template>\n<xsl:template match="@*" mode="rtl">\n <xsl:copy-of select="."/>\n <xsl:attribute name="dir">ltr</xsl:attribute>\n</xsl:template>\n<xsl:template match="*" mode="rtl">\n <xsl:copy>\n  <xsl:apply-templates select="@*" mode="rtl"/>\n  <xsl:for-each select="node()">\n   <xsl:sort data-type="number" order="descending" select="position()"/>\n   <xsl:text> </xsl:text>\n   <xsl:apply-templates mode="rtl" select="."/>\n  </xsl:for-each>\n </xsl:copy>\n</xsl:template>\n<xsl:template match="@open" mode="rtl">\n <xsl:attribute name="close"><xsl:value-of select="."/></xsl:attribute>\n</xsl:template>\n<xsl:template match="@open[.=\'(\']" mode="rtl">\n <xsl:attribute name="close">)</xsl:attribute>\n</xsl:template>\n<xsl:template match="@open[.=\')\']" mode="rtl">\n <xsl:attribute name="close">(</xsl:attribute>\n</xsl:template>\n<xsl:template match="@open[.=\'[\']" mode="rtl">\n <xsl:attribute name="close">]</xsl:attribute>\n</xsl:template>\n<xsl:template match="@open[.=\']\']" mode="rtl">\n <xsl:attribute name="close">[</xsl:attribute>\n</xsl:template>\n<xsl:template match="@open[.=\'{\']" mode="rtl">\n <xsl:attribute name="close">}</xsl:attribute>\n</xsl:template>\n<xsl:template match="@open[.=\'}\']" mode="rtl">\n <xsl:attribute name="close">{</xsl:attribute>\n</xsl:template>\n<xsl:template match="@close" mode="rtl">\n <xsl:attribute name="open"><xsl:value-of select="."/></xsl:attribute>\n</xsl:template>\n<xsl:template match="@close[.=\'(\']" mode="rtl">\n <xsl:attribute name="open">)</xsl:attribute>\n</xsl:template>\n<xsl:template match="@close[.=\')\']" mode="rtl">\n <xsl:attribute name="open">(</xsl:attribute>\n</xsl:template>\n<xsl:template match="@close[.=\'[\']" mode="rtl">\n <xsl:attribute name="open">]</xsl:attribute>\n</xsl:template>\n<xsl:template match="@close[.=\']\']" mode="rtl">\n <xsl:attribute name="open">[</xsl:attribute>\n</xsl:template>\n<xsl:template match="@close[.=\'{\']" mode="rtl">\n <xsl:attribute name="open">}</xsl:attribute>\n</xsl:template>\n<xsl:template match="@close[.=\'}\']" mode="rtl">\n <xsl:attribute name="open">{</xsl:attribute>\n</xsl:template>\n<xsl:template match="m:mfrac[@bevelled=\'true\']" mode="rtl">\n <m:mrow>\n  <m:msub><m:mi></m:mi><xsl:apply-templates select="*[2]" mode="rtl"/></m:msub>\n  <m:mo>&#x5c;</m:mo>\n  <m:msup><m:mi></m:mi><xsl:apply-templates select="*[1]" mode="rtl"/></m:msup>\n </m:mrow>\n</xsl:template>\n<xsl:template match="m:mfrac" mode="rtl">\n <xsl:copy>\n  <xsl:apply-templates mode="rtl" select="@*|*"/>\n </xsl:copy>\n</xsl:template>\n<xsl:template match="m:mroot" mode="rtl">\n <m:msup>\n  <m:menclose notation="top right">\n   <xsl:apply-templates mode="rtl" select="@*|*[1]"/>\n  </m:menclose>\n  <xsl:apply-templates mode="rtl" select="*[2]"/>\n </m:msup>\n</xsl:template>\n<xsl:template match="m:msqrt" mode="rtl">\n <m:menclose notation="top right">\n  <xsl:apply-templates mode="rtl" select="@*|*[1]"/>\n </m:menclose>\n</xsl:template>\n<xsl:template match="m:mtable|m:munder|m:mover|m:munderover" mode="rtl" priority="2">\n <xsl:copy>\n  <xsl:apply-templates select="@*" mode="rtl"/>\n  <xsl:apply-templates mode="rtl">\n  </xsl:apply-templates>\n </xsl:copy>\n</xsl:template>\n<xsl:template match="m:msup" mode="rtl" priority="2">\n <m:mmultiscripts>\n  <xsl:apply-templates select="*[1]" mode="rtl"/>\n  <m:mprescripts/>\n  <m:none/>\n  <xsl:apply-templates select="*[2]" mode="rtl"/>\n </m:mmultiscripts>\n</xsl:template>\n<xsl:template match="m:msub" mode="rtl" priority="2">\n <m:mmultiscripts>\n  <xsl:apply-templates select="*[1]" mode="rtl"/>\n  <m:mprescripts/>\n  <xsl:apply-templates select="*[2]" mode="rtl"/>\n  <m:none/>\n </m:mmultiscripts>\n</xsl:template>\n<xsl:template match="m:msubsup" mode="rtl" priority="2">\n <m:mmultiscripts>\n  <xsl:apply-templates select="*[1]" mode="rtl"/>\n  <m:mprescripts/>\n  <xsl:apply-templates select="*[2]" mode="rtl"/>\n  <xsl:apply-templates select="*[3]" mode="rtl"/>\n </m:mmultiscripts>\n</xsl:template>\n<xsl:template match="m:mmultiscripts" mode="rtl" priority="2">\n <m:mmultiscripts>\n  <xsl:apply-templates select="*[1]" mode="rtl"/>\n  <xsl:for-each  select="m:mprescripts/following-sibling::*[position() mod 2 = 1]">\n   <xsl:sort data-type="number" order="descending" select="position()"/>\n   <xsl:apply-templates select="."  mode="rtl"/>\n   <xsl:apply-templates select="following-sibling::*[1]"  mode="rtl"/>\n  </xsl:for-each>\n  <m:mprescripts/>\n  <xsl:for-each  select="m:mprescripts/preceding-sibling::*[position()!=last()][position() mod 2 = 0]">\n   <xsl:sort data-type="number" order="descending" select="position()"/>\n   <xsl:apply-templates select="."  mode="rtl"/>\n   <xsl:apply-templates select="following-sibling::*[1]"  mode="rtl"/>\n  </xsl:for-each>\n </m:mmultiscripts>\n</xsl:template>\n<xsl:template match="m:mmultiscripts[not(m:mprescripts)]" mode="rtl" priority="3">\n <m:mmultiscripts>\n  <xsl:apply-templates select="*[1]" mode="rtl"/>\n  <m:mprescripts/>\n  <xsl:for-each  select="*[position() mod 2 = 0]">\n   <xsl:sort data-type="number" order="descending" select="position()"/>\n   <xsl:apply-templates select="."  mode="rtl"/>\n   <xsl:apply-templates select="following-sibling::*[1]"  mode="rtl"/>\n  </xsl:for-each>\n </m:mmultiscripts>\n</xsl:template>\n<xsl:template match="text()[.=\'(\']" mode="rtl">)</xsl:template>\n<xsl:template match="text()[.=\')\']" mode="rtl">(</xsl:template>\n<xsl:template match="text()[.=\'{\']" mode="rtl">}</xsl:template>\n<xsl:template match="text()[.=\'}\']" mode="rtl">{</xsl:template>\n<xsl:template match="text()[.=\'&lt;\']" mode="rtl">&gt;</xsl:template>\n<xsl:template match="text()[.=\'&gt;\']" mode="rtl">&lt;</xsl:template>\n<xsl:template match="text()[.=\'&#x2208;\']" mode="rtl">&#x220b;</xsl:template>\n<xsl:template match="text()[.=\'&#x220b;\']" mode="rtl">&#x2208;</xsl:template>\n<xsl:template match="@notation[.=\'radical\']" mode="rtl">\n <xsl:attribute name="notation">top right</xsl:attribute>\n</xsl:template>\n<xsl:template match="m:mlongdiv|m:mstack" mode="rtl">\n <m:mrow dir="ltr">\n <xsl:apply-templates select="."/>\n </m:mrow>\n</xsl:template>\n<xsl:template match="m:mstack" priority="11">\n <xsl:variable name="m">\n  <m:mtable columnspacing="0em" rowspacing="0em">\n   <xsl:copy-of select="@align"/>\n  <xsl:variable name="t">\n   <xsl:apply-templates select="*" mode="mstack1">\n    <xsl:with-param name="p" select="0"/>\n   </xsl:apply-templates>\n  </xsl:variable>\n  <xsl:variable name="maxl">\n   <xsl:for-each select="c:node-set($t)/*/@l">\n    <xsl:sort data-type="number" order="descending"/>\n    <xsl:if test="position()=1">\n     <xsl:value-of select="."/>\n    </xsl:if>\n   </xsl:for-each>\n  </xsl:variable>\n  <xsl:for-each select="c:node-set($t)/*[not(@class=\'mscarries\') or following-sibling::*[1]/@class=\'mscarries\']">\n<xsl:variable name="c" select="preceding-sibling::*[1][@class=\'mscarries\']"/>\n   <xsl:text>&#10;</xsl:text>\n   <m:mtr>\n    <xsl:copy-of select="@class[.=\'msline\']"/>\n    <xsl:variable name="offset" select="$maxl - @l"/>\n    <xsl:choose>\n     <xsl:when test="@class=\'msline\' and @l=\'*\'">\n      <xsl:variable name="msl" select="*[1]"/>\n      <xsl:for-each select="(//node())[position()&lt;=$maxl]">\n       <xsl:copy-of select="$msl"/>\n      </xsl:for-each>\n     </xsl:when>\n     <xsl:when test="$c">\n      <xsl:variable name="ldiff" select="$c/@l - @l"/>\n      <xsl:variable name="loffset" select="$maxl - $c/@l"/>\n      <xsl:for-each select="(//*)[position()&lt;= $offset]">\n       <xsl:variable name="pn" select="position()"/>\n       <xsl:variable name="cy" select="$c/*[position()=$pn - $loffset]"/>\n\t <m:mtd>\n\t  <xsl:if test="$cy/*">\n\t  <m:mover><m:mphantom><m:mn>0</m:mn></m:mphantom><m:mpadded width="0em" lspace="-0.5width">\n\t  <xsl:copy-of select="$cy/*"/></m:mpadded></m:mover>\n\t  </xsl:if>\n\t </m:mtd>\n      </xsl:for-each>\n      <xsl:for-each select="*">\n       <xsl:variable name="pn" select="position()"/>\n       <xsl:variable name="cy" select="$c/*[position()=$pn + $ldiff]"/>\n       <xsl:copy>\n\t<xsl:copy-of select="@*"/>\n\t<xsl:variable name="b">\n\t <xsl:choose>\n\t  <xsl:when test="not(string($cy/@crossout) or $cy/@crossout=\'none\')"><xsl:copy-of select="*"/></xsl:when>\n\t  <xsl:otherwise>\n\t   <m:menclose notation="{$cy/@crossout}"><xsl:copy-of select="*"/></m:menclose>\n\t  </xsl:otherwise>\n\t </xsl:choose>\n\t</xsl:variable>\n\t<xsl:choose>\n\t <xsl:when test="$cy/m:none or not($cy/*)"><xsl:copy-of select="$b"/></xsl:when>\n\t <xsl:when test="not(string($cy/@location)) or $cy/@location=\'n\'">\n\t  <m:mover>\n\t   <xsl:copy-of select="$b"/><m:mpadded width="0em" lspace="-0.5width">\n\t   <xsl:copy-of select="$cy/*"/>\n\t  </m:mpadded>\n\t  </m:mover>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'nw\'">\n\t  <m:mmultiscripts><xsl:copy-of select="$b"/><m:mprescripts/><m:none/><m:mpadded lspace="-1width" width="0em"><xsl:copy-of select="$cy/*"/></m:mpadded></m:mmultiscripts>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'s\'">\n\t  <m:munder><xsl:copy-of select="$b"/><m:mpadded width="0em" lspace="-0.5width"><xsl:copy-of select="$cy/*"/></m:mpadded></m:munder>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'sw\'">\n\t  <m:mmultiscripts><xsl:copy-of select="$b"/><m:mprescripts/><m:mpadded lspace="-1width" width="0em"><xsl:copy-of select="$cy/*"/></m:mpadded><m:none/></m:mmultiscripts>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'ne\'">\n\t  <m:msup><xsl:copy-of select="$b"/><m:mpadded width="0em"><xsl:copy-of select="$cy/*"/></m:mpadded></m:msup>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'se\'">\n\t  <m:msub><xsl:copy-of select="$b"/><m:mpadded width="0em"><xsl:copy-of select="$cy/*"/></m:mpadded></m:msub>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'w\'">\n\t  <m:msup><m:mrow/><m:mpadded lspace="-1width" width="0em"><xsl:copy-of select="$cy/*"/></m:mpadded></m:msup>\n\t  <xsl:copy-of select="$b"/>\n\t </xsl:when>\n\t <xsl:when test="$cy/@location=\'e\'">\n\t  <xsl:copy-of select="$b"/>\n\t  <m:msup><m:mrow/><m:mpadded width="0em"><xsl:copy-of select="$cy/*"/></m:mpadded></m:msup>\n\t </xsl:when>\n\t <xsl:otherwise>\n\t  <xsl:copy-of select="$b"/>\n\t </xsl:otherwise>\n\t</xsl:choose>\n       </xsl:copy>\n      </xsl:for-each>\n     </xsl:when>\n     <xsl:otherwise>\n      <xsl:for-each select="(//*)[position()&lt;= $offset]"><m:mtd/></xsl:for-each>\n      <xsl:copy-of select="*"/>\n     </xsl:otherwise>\n    </xsl:choose>\n   </m:mtr>\n  </xsl:for-each>\n </m:mtable>\n</xsl:variable>\n<xsl:apply-templates mode="ml" select="c:node-set($m)"/>\n</xsl:template>\n<xsl:template match="m:none" mode="ml">\n<m:mrow/>\n</xsl:template>\n<xsl:template match="*" mode="ml">\n <xsl:copy>\n  <xsl:copy-of select="@*"/>\n  <xsl:apply-templates mode="ml"/>\n </xsl:copy>\n</xsl:template>\n<xsl:template mode="ml" match="m:mtr[following-sibling::*[1][@class=\'msline\']]">\n <m:mtr>\n  <xsl:copy-of select="@*"/>\n  <xsl:variable name="m" select="following-sibling::*[1]/m:mtd"/>\n  <xsl:for-each select="m:mtd">\n   <xsl:variable name="p" select="position()"/>\n   <m:mtd>\n    <xsl:copy-of select="@*"/>\n    <xsl:choose>\n     <xsl:when test="$m[$p]/m:mpadded">\n      <m:mpadded depth="+.2em">\n      <m:menclose notation="bottom">\n       <m:mpadded depth=".1em" height=".8em" width=".8em">\n        <m:mspace width=".15em"/>\n        <xsl:copy-of select="*"/>\n       </m:mpadded>\n      </m:menclose>\n      </m:mpadded>\n     </xsl:when>\n     <xsl:otherwise>\n      <xsl:copy-of select="*"/>\n     </xsl:otherwise>\n    </xsl:choose>\n   </m:mtd>\n  </xsl:for-each>\n </m:mtr>\n</xsl:template>\n<xsl:template mode="ml" match="m:mtr[not(preceding-sibling::*)][@class=\'msline\']" priority="3">\n <m:mtr>\n  <xsl:copy-of select="@*"/>\n  <xsl:for-each select="m:mtd">\n   <m:mtd>\n    <xsl:copy-of select="@*"/>\n    <xsl:if test="m:mpadded">\n     <m:menclose notation="bottom">\n      <m:mpadded depth=".1em" height="1em" width=".5em">\n       <m:mspace width=".2em"/>\n      </m:mpadded>\n     </m:menclose>\n    </xsl:if>\n   </m:mtd>\n  </xsl:for-each>\n </m:mtr>\n</xsl:template>\n<xsl:template mode="ml" match="m:mtr[@class=\'msline\']" priority="2"/>\n<xsl:template mode="mstack1" match="*">\n <xsl:param name="p"/>\n <xsl:param name="maxl" select="0"/>\n <m:mtr l="{1 + $p}">\n  <xsl:if test="ancestor::mstack[1]/@stackalign=\'left\'">\n   <xsl:attribute name="l"><xsl:value-of select="$p"/></xsl:attribute>\n  </xsl:if>\n  <m:mtd><xsl:apply-templates select="."/></m:mtd>\n </m:mtr>\n</xsl:template>\n<xsl:template mode="mstack1" match="m:msrow">\n <xsl:param name="p"/>\n <xsl:param name="maxl" select="0"/>\n <xsl:variable name="align1" select="ancestor::m:mstack[1]/@stackalign"/>\n <xsl:variable name="align">\n  <xsl:choose>\n   <xsl:when test="string($align1)=\'\'">decimalpoint</xsl:when>\n   <xsl:otherwise><xsl:value-of select="$align1"/></xsl:otherwise>\n  </xsl:choose>\n </xsl:variable>\n <xsl:variable name="row">\n  <xsl:apply-templates mode="mstack1" select="*">\n   <xsl:with-param name="p" select="0"/>\n  </xsl:apply-templates>\n </xsl:variable>\n <xsl:text>&#10;</xsl:text>\n <xsl:variable name="l1">\n  <xsl:choose>\n   <xsl:when test="$align=\'decimalpoint\' and m:mn">\n    <xsl:for-each select="c:node-set($row)/m:mtr[m:mtd/m:mn][1]">\n     <xsl:value-of select="number(sum(@l))+count(preceding-sibling::*/@l)"/>\n    </xsl:for-each>\n   </xsl:when>\n   <xsl:when test="$align=\'right\' or $align=\'decimalpoint\'">\n    <xsl:value-of select="count(c:node-set($row)/m:mtr/m:mtd)"/>\n   </xsl:when>\n   <xsl:otherwise>\n    <xsl:value-of select="0"/>\n   </xsl:otherwise>\n  </xsl:choose>\n </xsl:variable>\n <m:mtr class="msrow" l="{number($l1) + number(sum(@position)) +$p}">\n  <xsl:copy-of select="c:node-set($row)/m:mtr/*"/>\n </m:mtr>\n</xsl:template>\n<xsl:template mode="mstack1" match="m:mn">\n <xsl:param name="p"/>\n <xsl:variable name="align1" select="ancestor::m:mstack[1]/@stackalign"/>\n <xsl:variable name="dp1" select="ancestor::*[@decimalpoint][1]/@decimalpoint"/>\n <xsl:variable name="align">\n  <xsl:choose>\n   <xsl:when test="string($align1)=\'\'">decimalpoint</xsl:when>\n   <xsl:otherwise><xsl:value-of select="$align1"/></xsl:otherwise>\n  </xsl:choose>\n </xsl:variable>\n <xsl:variable name="dp">\n  <xsl:choose>\n   <xsl:when test="string($dp1)=\'\'">.</xsl:when>\n   <xsl:otherwise><xsl:value-of select="$dp1"/></xsl:otherwise>\n  </xsl:choose>\n </xsl:variable>\n <m:mtr l="$p">\n  <xsl:variable name="mn" select="normalize-space(.)"/>\n  <xsl:variable name="len" select="string-length($mn)"/>\n  <xsl:choose>\n   <xsl:when test="$align=\'right\' or ($align=\'decimalpoint\' and not(contains($mn,$dp)))">\n    <xsl:attribute name="l"><xsl:value-of select="$p + $len"/></xsl:attribute>\n   </xsl:when>\n   <xsl:when test="$align=\'center\'">\n    <xsl:attribute name="l"><xsl:value-of select="round(($p + $len) div 2)"/></xsl:attribute>\n   </xsl:when>\n   <xsl:when test="$align=\'decimalpoint\'">\n    <xsl:attribute name="l"><xsl:value-of select="$p + string-length(substring-before($mn,$dp))"/></xsl:attribute>\n   </xsl:when>\n  </xsl:choose>\n  <xsl:for-each select="(//node())[position() &lt;=$len]">\n   <xsl:variable name="pos" select="position()"/>\n   <xsl:variable name="digit" select="substring($mn,$pos,1)"/>\n   <m:mtd>\n    <xsl:if test="$digit=\'.\' or $digit=\',\'">\n     <m:mspace width=".15em"/>\n    </xsl:if>\n    <m:mn><xsl:value-of select="$digit"/></m:mn>\n   </m:mtd>\n  </xsl:for-each>\n </m:mtr>\n</xsl:template>\n<xsl:template match="m:msgroup" mode="mstack1">\n <xsl:param name="p"/>\n <xsl:variable name="s" select="number(sum(@shift))"/>\n <xsl:variable name="thisp" select="number(sum(@position))"/>\n <xsl:for-each select="*">\n  <xsl:apply-templates mode="mstack1" select=".">\n   <xsl:with-param name="p" select="number($p)+$thisp+(position()-1)*$s"/>\n  </xsl:apply-templates>\n </xsl:for-each>\n</xsl:template>\n<xsl:template match="m:msline" mode="mstack1">\n <xsl:param name="p"/>\n <xsl:variable  name="align1" select="ancestor::m:mstack[1]/@stackalign"/>\n <xsl:variable name="align">\n  <xsl:choose>\n   <xsl:when test="string($align1)=\'\'">decimalpoint</xsl:when>\n   <xsl:otherwise><xsl:value-of select="$align1"/></xsl:otherwise>\n  </xsl:choose>\n </xsl:variable>\n <m:mtr class="msline">\n  <xsl:attribute name="l">\n   <xsl:choose>\n    <xsl:when test="not(string(@length)) or @length=0">*</xsl:when>\n    <xsl:when test="string($align)=\'right\' or string($align)=\'decimalpoint\' "><xsl:value-of select="$p+ @length"/></xsl:when>\n    <xsl:otherwise><xsl:value-of select="$p"/></xsl:otherwise>\n   </xsl:choose>\n  </xsl:attribute>\n  <xsl:variable name="w">\n   <xsl:choose>\n    <xsl:when test="@mslinethickness=\'thin\'">0.1em</xsl:when>\n    <xsl:when test="@mslinethickness=\'medium\'">0.15em</xsl:when>\n    <xsl:when test="@mslinethickness=\'thick\'">0.2em</xsl:when>\n    <xsl:when test="@mslinethickness"><xsl:value-of select="@mslinethickness"/></xsl:when>\n    <xsl:otherwise>0.15em</xsl:otherwise>\n   </xsl:choose>\n  </xsl:variable>\n  <xsl:choose>\n   <xsl:when test="not(string(@length)) or @length=0">\n    <m:mtd class="mslinemax">\n     <m:mpadded lspace="-0.2em" width="0em" height="0em">\n      <m:mfrac linethickness="{$w}">\n       <m:mspace width=".5em"/>\n       <m:mrow/>\n      </m:mfrac>\n     </m:mpadded>\n    </m:mtd>\n   </xsl:when>\n   <xsl:otherwise>\n    <xsl:variable name="l" select="@length"/>\n    <xsl:for-each select="(//node())[position()&lt;=$l]">\n     <m:mtd class="msline">\n      <m:mpadded lspace="-0.2em" width="0em" height="0em">\n       <m:mfrac linethickness="{$w}">\n\t<m:mspace width=".5em"/>\n\t<m:mrow/>\n       </m:mfrac>\n      </m:mpadded>\n     </m:mtd>\n    </xsl:for-each>\n   </xsl:otherwise>\n  </xsl:choose>\n </m:mtr>\n</xsl:template>\n<xsl:template match="m:mscarries" mode="mstack1">\n <xsl:param name="p"/>\n <xsl:variable  name="align1" select="ancestor::m:mstack[1]/@stackalign"/>\n <xsl:variable name="l1">\n  <xsl:choose>\n   <xsl:when test="string($align1)=\'left\'">0</xsl:when>\n   <xsl:otherwise><xsl:value-of select="count(*)"/></xsl:otherwise>\n  </xsl:choose>\n </xsl:variable>\n <m:mtr class="mscarries" l="{$p + $l1 + sum(@position)}">\n  <xsl:apply-templates select="*" mode="msc"/>\n </m:mtr>\n</xsl:template>\n<xsl:template match="*" mode="msc">\n <m:mtd>\n  <xsl:copy-of select="../@location|../@crossout"/>\n  <xsl:choose>\n   <xsl:when test="../@scriptsizemultiplier">\n    <m:mstyle mathsize="{round(../@scriptsizemultiplier div .007)}%">\n     <xsl:apply-templates select="."/>\n    </m:mstyle>\n   </xsl:when>\n   <xsl:otherwise>\n    <xsl:apply-templates select="."/>\n   </xsl:otherwise>\n  </xsl:choose>\n </m:mtd>\n</xsl:template>\n<xsl:template match="m:mscarry" mode="msc">\n <m:mtd>\n <xsl:copy-of select="@location|@crossout"/>\n  <xsl:choose>\n   <xsl:when test="../@scriptsizemultiplier">\n    <m:mstyle mathsize="{round(../@scriptsizemultiplier div .007)}%">\n     <xsl:apply-templates/>\n    </m:mstyle>\n   </xsl:when>\n   <xsl:otherwise>\n    <xsl:apply-templates/>\n   </xsl:otherwise>\n  </xsl:choose>\n </m:mtd>\n</xsl:template>\n<xsl:template match="m:mlongdiv" priority="11">\n <xsl:variable name="ms">\n  <m:mstack>\n   <xsl:copy-of select="(ancestor-or-self::*/@decimalpoint)[last()]"/>\n   <xsl:choose>\n    <xsl:when test="@longdivstyle=\'left)(right\'">\n     <m:msrow>\n      <m:mrow><xsl:copy-of select="*[1]"/></m:mrow>\n      <m:mo>)</m:mo>\n      <xsl:copy-of select="*[3]"/>\n      <m:mo>(</m:mo>\n      <xsl:copy-of select="*[2]"/>\n     </m:msrow>\n    </xsl:when>\n    <xsl:when test="@longdivstyle=\'left/\right\'">\n     <m:msrow>\n      <m:mrow><xsl:copy-of select="*[1]"/></m:mrow>\n      <m:mo>/</m:mo>\n      <xsl:copy-of select="*[3]"/>\n      <m:mo></m:mo>\n      <xsl:copy-of select="*[2]"/>\n     </m:msrow>\n    </xsl:when>\n    <xsl:when test="@longdivstyle=\':right=right\'">\n     <m:msrow>\n      <xsl:copy-of select="*[3]"/>\n      <m:mo>:</m:mo>\n      <xsl:copy-of select="*[1]"/>\n      <m:mo>=</m:mo>\n      <xsl:copy-of select="*[2]"/>\n     </m:msrow>\n    </xsl:when>\n    <xsl:when test="@longdivstyle=\'stackedrightright\'\n\t\t    or @longdivstyle=\'mediumstackedrightright\'\n\t\t    or @longdivstyle=\'shortstackedrightright\'\n\t\t    or @longdivstyle=\'stackedleftleft\'\n\t\t    ">\n     <xsl:attribute name="align">top</xsl:attribute>\n     <xsl:copy-of select="*[3]"/>\n    </xsl:when>\n    <xsl:when test="@longdivstyle=\'stackedleftlinetop\'">\n     <xsl:copy-of select="*[2]"/>\n     <m:msline length="{string-length(*[3])}"/>\n     <m:msrow>\n      <m:mrow>\n     <m:menclose notation="bottom right">\n      <xsl:copy-of select="*[1]"/>\n     </m:menclose>\n      </m:mrow>\n      <xsl:copy-of select="*[3]"/>\n     </m:msrow>\n    </xsl:when>\n    <xsl:when test="@longdivstyle=\'righttop\'">\n     <xsl:copy-of select="*[2]"/>\n     <m:msline length="{string-length(*[3])}"/>\n     <m:msrow>\n      <xsl:copy-of select="*[3]"/>\n      <m:menclose notation="top left bottom">\n       <xsl:copy-of select="*[1]"/></m:menclose>\n     </m:msrow>\n    </xsl:when>\n    <xsl:otherwise>\n     <xsl:copy-of select="*[2]"/>\n     <m:msline length="{string-length(*[3])+1}"/>\n     <m:msrow>\n      <m:mrow><xsl:copy-of select="*[1]"/><m:mspace width=".2em"/></m:mrow>\n      <m:mpadded voffset=".1em" lspace="-.15em" depth="-.2em" height="-.2em">\n       <m:mo minsize="1.2em">)</m:mo>\n      </m:mpadded>\n      <xsl:copy-of select="*[3]"/>\n     </m:msrow>\n    </xsl:otherwise>\n   </xsl:choose>\n   <xsl:copy-of select="*[position()&gt;3]"/>\n  </m:mstack>\n </xsl:variable>\n <xsl:choose>\n  <xsl:when test="@longdivstyle=\'stackedrightright\'">\n   <m:menclose notation="right">\n    <xsl:apply-templates select="c:node-set($ms)"/>\n   </m:menclose>\n   <m:mtable align="top">\n    <m:mtr>\n     <m:menclose notation="bottom">\n      <xsl:copy-of select="*[1]"/>\n     </m:menclose>\n    </m:mtr>\n    <m:mtr>\n     <mtd><xsl:copy-of select="*[2]"/></mtd>\n    </m:mtr>\n   </m:mtable>\n  </xsl:when>\n    <xsl:when test="@longdivstyle=\'mediumstackedrightright\'">\n    <xsl:apply-templates select="c:node-set($ms)"/>\n   <m:menclose notation="left">\n   <m:mtable align="top">\n    <m:mtr>\n     <m:menclose notation="bottom">\n      <xsl:copy-of select="*[1]"/>\n     </m:menclose>\n    </m:mtr>\n    <m:mtr>\n     <mtd><xsl:copy-of select="*[2]"/></mtd>\n    </m:mtr>\n   </m:mtable>\n   </m:menclose>\n  </xsl:when>\n  <xsl:when test="@longdivstyle=\'shortstackedrightright\'">\n    <xsl:apply-templates select="c:node-set($ms)"/>\n   <m:mtable align="top">\n    <m:mtr>\n     <m:menclose notation="left bottom">\n      <xsl:copy-of select="*[1]"/>\n     </m:menclose>\n    </m:mtr>\n    <m:mtr>\n     <mtd><xsl:copy-of select="*[2]"/></mtd>\n    </m:mtr>\n   </m:mtable>\n  </xsl:when>\n  <xsl:when test="@longdivstyle=\'stackedleftleft\'">\n   <m:mtable align="top">\n    <m:mtr>\n     <m:menclose notation="bottom">\n      <xsl:copy-of select="*[1]"/>\n     </m:menclose>\n    </m:mtr>\n    <m:mtr>\n     <mtd><xsl:copy-of select="*[2]"/></mtd>\n    </m:mtr>\n   </m:mtable>\n   <m:menclose notation="left">\n    <xsl:apply-templates select="c:node-set($ms)"/>\n   </m:menclose>\n  </xsl:when>\n  <xsl:otherwise>\n   <xsl:apply-templates select="c:node-set($ms)"/>\n  </xsl:otherwise>\n </xsl:choose>\n</xsl:template>\n<xsl:template match="m:menclose[@notation=\'madruwb\']" mode="rtl">\n <m:menclose notation="bottom right">\n  <xsl:apply-templates mode="rtl"/>\n </m:menclose>\n</xsl:template>\n</xsl:stylesheet>\n');
            },
            955: function (e, t) {
                MathJax._.components.global.isObject,
                    MathJax._.components.global.combineConfig,
                    MathJax._.components.global.combineDefaults,
                    (t.r8 = MathJax._.components.global.combineWithMathJax),
                    MathJax._.components.global.MathJax;
            },
        },
        __webpack_module_cache__ = {};
    function __webpack_require__(e) {
        var t = __webpack_module_cache__[e];
        if (void 0 !== t) return t.exports;
        var l = (__webpack_module_cache__[e] = { exports: {} });
        return __webpack_modules__[e].call(l.exports, l, l.exports, __webpack_require__), l.exports;
    }
    var __webpack_exports__ = {},
        global,
        version,
        mml3_node,
        mml3;
    (global = __webpack_require__(955)),
        (version = __webpack_require__(667)),
        (mml3_node = __webpack_require__(63)),
        (mml3 = __webpack_require__(514)),
        MathJax.loader &&
            MathJax.loader.checkVersion('[mml]/mml3', version.q, 'input/mml/extensions'),
        (0, global.r8)({
            _: { input: { mathml: { mml3: { 'mml3-node': mml3_node, mml3: mml3 } } } },
        }),
        MathJax.startup &&
            MathJax.startup.extendHandler(function (e) {
                return (0, mml3.Mml3Handler)(e);
            });
})();
