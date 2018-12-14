/**
 * @Author: Lori Lee
 * @Email:  leejqy@163.com
 *
 * @WARNING: NEVER change below codes unless you are clear what you are doing.
 *
 * All rights reserved.
 *
 **/
var YajLib = YajLib || {author: 'Lori Lee', email: 'leejqy@163.com', version: '1.1'};
(function(window) {
    'use strict';
    var propertySetting = {writable: false, configurable: false};
    //
    ((YajLib) => {
        var isLittleEndian = (() => {
            var buff = new ArrayBuffer(2);
            (new DataView(buff)).setInt16(0, 1, true);
            return 1 == (new Int16Array(buff))[0];
        })();
        YajLib.isLittleEndian || (YajLib.isLittleEndian = isLittleEndian);
        Object.defineProperties(YajLib, {
            isLittleEndian: propertySetting
        });
    })(YajLib);
    //
    var getBytesArray = (input) => {//@TODO: add parameter encoding, and unicode converted accordingly
        var bytes = [];
        if(Number.isInteger(input)) {
            bytes = [input & 0xFF, (input >> 8) & 0xFF, (input >> 16) & 0xFF,
                (input >> 24) & 0xFF].filter((v) => {
                    return !!v;
            });
        } else if(Array.isArray(input)) {
            return input = input.map((v) => {
                return getBytesArray(v).flat();
            });
        } else {
            input = '' + input;
            for(let i = 0, len = input.length; i < len; ++i) {
                //let code = input.charCodeAt(i);//UTF-16, at most 4 bytes, most time only 2 bytes
                let code = input.codePointAt(i);//Unicode, for BMP(Basic Multi-lingual Plane), same as charCodeAt
                bytes.push(code & 0xFF);
                (code & 0xFFFFFF00) && (bytes.push((code >>  8) & 0xFF));
                (code & 0xFFFF0000) && (bytes.push((code >> 16) & 0xFF));
                (code & 0xFF000000) && (bytes.push((code >> 24) & 0xFF));
            }
        }
        return bytes;
    };
    // 
    var isNotBlank = (char) => {
        return !isBlank(char);
    };
    //
    var isBlank = (char) => {
        return !!('' + char).match(/^\s+$/);
    };
    //
    var isPunctuation = (char) => {
        if(!!char && char.length) {
            let _code = char.charCodeAt(0);
            return (0x21 <= _code && _code <= 0x2F)
                || (0x3A <= _code && _code <= 0x40)
                || (0x5B <= _code && _code <= 0x60)
                || (0x7B <= _code && _code <= 0x7E);
        }
        return false;
    };
    //JS encodes in UTF-16, same as Unicode BMP for U+0000 to U+D7FF and U+E000 to U+FFFF
    //https://en.wikipedia.org/wiki/UTF-16
    var isCJKC = (char) => {
        if(!!char && char.length) {
            let _code = char.charCodeAt(0);
            return 0x4E00 <= _code && _code <= 0x9FFF;
        }
        return false;
    };
    //
    var DiffNg;
    (function(YajLib) {
        var _validOptions = {
            tokenizer: 'function', marker:        'function', wrapper:     'function',
            equal:     'function', casesensitive: 'boolean',  blankignore: 'boolean',
            slmarker: 'function', tabwidth: 'number'
        };
        //
        DiffNg = function(options) {
            if(this instanceof DiffNg) {
                this.options = {
                    tokenizer: _defaultTokenizer,
                    marker   : _defaultMarkFunc,
                    slmarker : _defaultSmLnMarker,
                    tabwidth : 4,  
                    wrapper  : _defaultWrapper,
                    equal    : _defaultEqualFunc,
                    casesensitive: true,
                    blankignore  : false,
                };
                options = options || {};
                for(let k in options) {
                    if(_validOptions[k]) {
                        if('boolean' === _validOptions[k]) {
                            this.options[k] = !!options[k];
                        } else if(typeof options[k] !== _validOptions[k]){
                            throw 'Invalid option: ' + k + ', ' + _validOptions[k] + ' expected';
                        }
                    }
                }
                Object.freeze(this.options);
            } else {
                return new DiffNg(options);
            }
        };
        //
        DiffNg.prototype = {
            diff: function(strA, strB, reverse) {
                console && console.log && console.log('NEVER use diff but mdiff instead for paragraphs');
                var options = this.options;
                var tokensA = options['tokenizer'](strA);
                var tokensB = options['tokenizer'](strB);
                var diffResult = _worker.call(this, tokensA, tokensB);
                var marker = options['marker'].bind(this);
                var indexA = diffResult['pos'].map(_map(0));
                var indexB = diffResult['pos'].map(_map(1));
                var left = _composer.call(this, tokensA, indexA, reverse);
                var right= _composer.call(this, tokensB, indexB, reverse);
                return {
                    max   : diffResult['len'],
                    wmax  : indexA.filter(function(k) {return !isBlank(tokensA[k]);}).length,
                    left  : left,
                    right : right
                };
            },
            mdiff: function(mstrA, mstrB, reverse) {
                var linesA = mstrA.split(_CRRegex);
                var linesB = mstrB.split(_CRRegex);
                var diffResult = _worker.call(this, linesA, linesB);
                var linesALenW = Math.ceil(Math.log10(linesA.length + 1));
                var linesBLenW = Math.ceil(Math.log10(linesB.length + 1));
                var linesLenMax= Math.max(linesALenW, linesBLenW);
                var wrapper  = this.options['wrapper'];
                var slmarker = this.options['slmarker'].bind(this);
                var wrapAlignmentBlank = wrapper.bind(this, 0, linesLenMax, -1);
                var composer = function(linesA, linesB, index) {
                    let left = [], right = [];
                    let i = 0, j = 0;
                    let linesTokensA, linesTokensB;
                    let tokensANonBlankLen, tokensBNonBlankLen;
                    let tokenizer = this.options['tokenizer'];
                    let calcSimilarities = function(linesA, linesB) {
                        let r = (new Array(linesA.length)).fill('');
                        r.forEach(function(v, i, arr) {
                             arr[i] = (new Array(linesB.length)).fill([]);
                        });
                        linesTokensA = linesA.map(tokenizer);
                        linesTokensB = linesB.map(tokenizer);
                        tokensANonBlankLen = [];
                        tokensBNonBlankLen = [];
                        for(let i = 0, la = linesA.length; i < la; ++i) {
                            let tokensA = linesTokensA[i];
                            tokensANonBlankLen[i] = tokensA.filter(isNotBlank).length;
                            for(let j = 0, lb = linesB.length; j < lb; ++j) {
                                let tokensB = linesTokensB[j];
                                let diff = _worker.call(this, tokensA, tokensB);
                                if(tokensBNonBlankLen.length <= j) {
                                    tokensBNonBlankLen[j] = tokensB.filter(isNotBlank).length;
                                }
                                if(!diff['len']) {
                                    r[i][j] = [0, []];
                                } else {
                                    let s = diff['pos'].map(_map(0))
                                                       .reduce(function(s, v) {
                                                           return s + isNotBlank(tokensA[v]);
                                                       }, 0);
                                    let s1 = (s << 1) / Math.max(1, tokensANonBlankLen[i] + tokensBNonBlankLen[j]);
                                    let s2 = (diff['len'] << 1) / (tokensA.length + tokensB.length);
                                    //
                                    r[i][j] = [Math.max(s1, s2), diff['pos']];
                                }
                            }
                        }
                        return r;
                    };
                    let composer = function(linesA, linesB, offsetA, offsetB, indexALenW, indexBLenW) {
                       let s = calcSimilarities.call(this, linesA, linesB);
                       let similarities = s.map(__map(0));
                       let p = _maxMatchingPairs(similarities, linesA.length, linesB.length);
                       let ps= p['pairs'];
                       let i = 0, j = 0;
                       let __htmlEncode = _htmlEncode.bind(this);
                       while(ps && ps.length) {
                           if(i < ps[0][0]) {
                               for(let start = i, end = ps[0][0] - 1; start <= end; ++start) {
                                   left.push(wrapper.call(this, offsetA + start, indexALenW, 1, linesA[start]));
                               }
                               right.push((new Array(ps[0][0] - i)).fill('').map(wrapAlignmentBlank).join(''));
                           }
                           if(j < ps[0][1]) {
                               left.push((new Array(ps[0][1] - j)).fill('').map(wrapAlignmentBlank).join(''));
                               for(let start = j, end = ps[0][1] - 1; start <= end; ++start) {
                                   right.push(wrapper.call(this, offsetB + start, indexBLenW, 1, linesB[start]));
                               }
                           }
                           left.push(
                               wrapper.call(this,
                                   offsetA + ps[0][0], indexALenW, 0,
                                   _composer.call(
                                       this, linesTokensA[ps[0][0]].map(__htmlEncode),
                                       s[ps[0][0]][ps[0][1]][1].map(_map(0)), reverse
                                   )
                               )
                           );
                           right.push(
                               wrapper.call(this,
                                   offsetB + ps[0][1], indexBLenW, 0,
                                   _composer.call(
                                       this, linesTokensB[ps[0][1]].map(__htmlEncode),
                                       s[ps[0][0]][ps[0][1]][1].map(_map(1)), reverse
                                   )
                               )
                           );
                           [[i, j]] = ps.splice(0, 1);
                           ++i; ++j;
                       }
                       if(i < linesA.length) {
                           for(let start = i, end = linesA.length - 1; start <= end; ++start) {
                               left.push(wrapper.call(this, offsetA + start, indexALenW, 1, linesA[start]));
                           }
                           right.push((new Array(linesA.length - i)).fill('').map(wrapAlignmentBlank).join(''));
                       }
                       if(j < linesB.length) {
                           left.push((new Array(linesB.length - j)).fill('').map(wrapAlignmentBlank).join(''));
                           for(let start = j, end = linesB.length - 1; start <= end; ++start) {
                               right.push(wrapper.call(this, offsetB + start, indexBLenW, 1, linesB[start]));
                           }
                       }
                    };
                    while(index.length) {
                        let l = linesA.slice(i, index[0][0]);
                        let r = linesB.slice(j, index[0][1]);
                        composer.call(this, l, r, i, j, linesLenMax, linesLenMax);
                        [[i, j]] = index.splice(0, 1);
                        left.push(wrapper.call(this, i, linesLenMax, 0, slmarker(i, linesLenMax, linesA[i])));
                        right.push(wrapper.call(this, j, linesLenMax, 0, slmarker(j, linesLenMax, linesB[j])));
                        ++i; ++j;
                    }
                    if(i < linesA.length || j < linesB.length) {
                        composer.call(this,
                          linesA.slice(i, linesA.length), linesB.slice(j, linesB.length),
                          i, j, linesLenMax, linesLenMax
                        );
                    }
                    return {left: left.join(''), right: right.join('')};
                };
                return composer.call(this, linesA, linesB, diffResult['pos']);
            }
        };
        //
        var _defaultTokenizer = function(str) {
            var tokens = [];
            var addPrevWord = (token, str, s, i) => {
                if(null !== s) {
                    token.push(str.substr(s, i - s));
                }
            };
            var s = null;
            for(var i = 0, len = str.length; i < len; ++i) {
                var _c = str[i];
                if('\r' === _c && '\n' === str[i + 1]) {
                    tokens.push('\r\n');
                    ++i;
                } else if(isCJKC(_c)) {
                    addPrevWord(tokens, str, s, i);
                    s = null;
                    tokens.push(_c);
                } else if(isBlank(_c) || isPunctuation(_c)) {
                    addPrevWord(tokens, str, s, i);
                    s = null;
                    tokens.push(_c);
                } else if(null === s){
                    s = i;
                }
            }
            addPrevWord(tokens, str, s, i);
            return tokens;
        };
        //
        var _fgRedTag = '<span style="display:inline-block;color:red;">{text}</span>';
        var _bgRedTag = '<span style="display:inline-block;background-color:red;color:red;">{blank}</span>';
        var _CRRegex = /\r\n|\n|\r/;
        var _isCR = (char) => {
            return !!('' + char).match(_CRRegex);
        };
        //
        var _defaultMarkFunc = function(prev, string, next) {
            var _ = isBlank(string) || string.match(/^(&nbsp;|\s)+$/);
            string = _htmlEncode.call(this, string);
            if(_) {
                string = _bgRedTag.replace('{blank}', string);
            } else {
                string = _fgRedTag.replace('{text}', string);
            }
            return string;
        };
        //
        var _defaultSmLnMarker = function(i, w, string) {
            return _htmlEncode.call(this, string);
        };
        //
        var _htmlEncode = function(string) {
            var options = this.options;
            return string.replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')
                         .replace(/\t/g, ' '.repeat(options['tabwidth']))
                         .replace(/\s/g, ' ');
        };
        //
        var _redLine = '<div style="background-color:red;white-space:pre;"><div style="display:inline-block;background:#CCC;width:{width}em;padding:0 5px;">{index}</div><code>{line}</code></div>';
        var _diffLine= '<div style="white-space:pre;"><div style="display:inline-block;background:#CCC;width:{width}em;padding:0 5px;">{index}</div><code>{line}</code></div>';
        var _alignmentBlankLine = '<div style="white-space:pre;"><div style="display:inline-block;background:#CCC;width:{width}em;padding:0 5px;color:#CCC;">{index}</div></div>';
        var _defaultWrapper = function(lineNo, lineNoLen, flag, line) {
            //flag:0  -- existed before and left / right lines are associated
            //    -1  -- not existed before but added for line alignment purpose
            //    +1  -- existed before and not associated with the other side
            if(flag < 0) {
                return _alignmentBlankLine.replace('{width}', lineNoLen * 0.5)
                                          .replace('{index}', '&nbsp;'.repeat(lineNoLen));
            }
            var lineNoTxt = '' + lineNo;
            if(lineNoTxt.length < lineNoLen) {
                lineNoTxt = '0'.repeat(lineNoLen - lineNoTxt.length) + lineNoTxt;
            }
            var lineTxt = line;
            if(flag) {
                lineTxt = _htmlEncode.call(this, lineTxt);
            }
            return (flag ? _redLine : _diffLine).replace('{width}', lineNoLen * 0.5)
                                                .replace('{index}', lineNoTxt)
                                                .replace('{line}', lineTxt);
        };
        //
        var _defaultEqualFunc = (a, b) => {
            return a == b;
        };
        //
        var _map = (index) => {
            return (v) => {
                return v[index];
            };
        };
        //
        var __map = (index) => {
            return (v) => {
                return v.map(_map(index));
            };
        };
        //
        var _composer = function(tokens, index, reverse) {
            let r = [];
            let options = this.options;
            let marker  = options['marker'].bind(this);
            for(let i = 0, l = tokens.length; i < l; ++i) {
                if(!index.length || i < index[0]) {
                    r.push(!reverse ? marker(tokens[i - 1], tokens[i], tokens[i + 1]) : tokens[i]);
                } else if(index.length) {
                    r.push(!!reverse ? marker(tokens[i - 1], tokens[i], tokens[i + 1]) : tokens[i]);
                    index.splice(0, 1);
                }
            }
            return r.join('');
        };
        //
        var _worker = function(tokensA, tokensB) {
            var lenA = tokensA.length;
            var lenB = tokensB.length;
            var prevRow = (new Array(lenB + 1)).fill(0);
            var currRow = (new Array(lenB + 1)).fill(0);
            var prevRowMaxPos = (new Array(lenB + 1)).fill([]);
            var currRowMaxPos = (new Array(lenB + 1)).fill([]);
            var options = this.options;
            for(var i = 1; i <= lenA; ++i) {
                for(var j = 1; j <= lenB; ++j) {
                    let _strA = tokensA[i - 1];
                    let _strB = tokensB[j - 1];
                    if(!options['casesensitive']) {
                        _strA = _strA.toLowerCase();
                        _strB = _strB.toLowerCase();
                    }
                    if(options['blankignore']) {
                        _strA = _strA.replace(/\s+/g, '');
                        _strB = _strB.replace(/\s+/g, '');
                    }
                    var _isEqual = this.options['equal'](_strA, _strB);
                    if(_isEqual) {
                        currRow[j] = 1 + prevRow[j - 1];
                        (currRowMaxPos[j] = Array.from(prevRowMaxPos[j - 1])).push([i - 1, j - 1]);
                    } else {
                        if(prevRow[j] > currRow[j - 1]) {
                            currRow[j] = prevRow[j];
                            currRowMaxPos[j] = prevRowMaxPos[j];
                        } else {
                            currRow[j] = currRow[j - 1];
                            currRowMaxPos[j] = currRowMaxPos[j - 1];
                        }
                    }
                }
                [prevRow, currRow] = [currRow, prevRow];
                [prevRowMaxPos, currRowMaxPos] = [currRowMaxPos, prevRowMaxPos];
            }
            return {
                len: prevRow[lenB],
                pos: prevRowMaxPos[lenB]
            };
        };
        //
        var _maxMatchingPairs = (similarities, n, m) => {
            var maxMatchingScore = 0;
            var prevRow = (new Array(m + 1)).fill(0);
            var currRow = (new Array(m + 1)).fill(0);
            var prevMaxMatchingPos = (new Array(m + 1)).fill([]);
            var currMaxMatchingPos = (new Array(m + 1)).fill([]);
            for(var i = 1; i <= n; ++i) {
                for(var j = 1; j <= m; ++j) {
                    let a = prevRow[j - 1] + similarities[i - 1][j - 1];
                    if(a >= prevRow[j] && a >= currRow[j - 1]) {
                        currRow[j] = a;
                        (currMaxMatchingPos[j] = Array.from(prevMaxMatchingPos[j - 1])).push([i - 1, j - 1]);
                    } else if(prevRow[j] > currRow[j - 1]) {
                        currRow[j] = prevRow[j];
                        currMaxMatchingPos[j] = prevMaxMatchingPos[j];
                    } else {
                        currRow[j] = currRow[j - 1];
                        currMaxMatchingPos[j] = currMaxMatchingPos[j - 1];
                    }
                }
                [prevRow, currRow] = [currRow, prevRow];
                [prevMaxMatchingPos, currMaxMatchingPos] = [currMaxMatchingPos, prevMaxMatchingPos];
            }
            return {
                score: prevRow.length ? prevRow[m] : 0,
                pairs: prevMaxMatchingPos.length ? prevMaxMatchingPos[m] : []
            };
        };
        //
        YajLib.tokenizer || (YajLib.tokenizer = _defaultTokenizer);
        YajLib.diffNg    || (YajLib.diffNg = DiffNg);
        Object.defineProperties(YajLib, {
            tokenizer : propertySetting,
            diffNg    : propertySetting,
        });
    }(YajLib));
    //
    var HTMLTokenizer;
    var StripTag;
    (function(YajLib) {
        //
        var _isLowercase = (char) => {
            return 'a' <= char && char <= 'z';
        };
        //
        var _isUppercase = (char) => {
            return 'A' <= char && char <= 'Z';
        };
        //
        var _isAlphabet = (char) => {
            return _isLowercase(char) || _isUppercase(char);
        };
        //
        var _isDigit = (char) => {
            return '0' <= char && char <= '9';
        };
        //
        var _isAlphaNum = (char) => {
            return _isAlphabet(char) || _isDigit(char);
        };
        //
        var _isQuote = (char) => {
            return '"' == char || "'" == char;
        };
        //
        HTMLTokenizer = (string) => {
            var tokens = [];
            var status = 0;
            var tagName= '';
            var prefixTagHtml = '';
            var suffixTagHtml = '';
            var tagContent    = '';
            var quoteSymbal   = '';
            var storeTagInfo  = function() {
                if(!!tagName + !!tagContent) {
                    tokens.push({
                        tag    : tagName,
                        prefix : prefixTagHtml,
                        suffix : suffixTagHtml,
                        content: tagContent
                    });
                    tagName       =
                    prefixTagHtml =
                    suffixTagHtml =
                    tagContent    =
                    quoteSymbal   = '';
                }
            };
            for(let i = 0, len = string.length; i < len;) {
                if(!status) {
                    if('<' == string[i]) {
                        if(_isAlphabet(string[i + 1])) {
                            storeTagInfo();
                            status = 1;
                            prefixTagHtml = string[i++];
                        } else if('/' == string[i + 1]
                                  && _isAlphabet(string[i + 2])) {
                            storeTagInfo();
                            status = 4;
                            suffixTagHtml = string[i++] + string[i++];
                        } else {
                            tagContent = tagContent + string[i++];
                        }
                    } else {
                        tagContent = tagContent + string[i++];
                    }
                } else if(1 == status) {
                    if(_isAlphaNum(string[i])) {
                        tagName = tagName + string[i];
                        prefixTagHtml = prefixTagHtml + string[i++];
                    } else {
                        if('/' == string[i] && '>' == string[i + 1]) {
                            prefixTagHtml = prefixTagHtml + string[i++] + string[i++];
                            storeTagInfo();
                            status = 0;
                        } else if('>' == string[i]) {
                            prefixTagHtml = prefixTagHtml + string[i++];
                            storeTagInfo();
                            status = 0;
                        } else if(_isQuote(string[i])) {
                            prefixTagHtml = prefixTagHtml + (quoteSymbal = string[i++]);
                            status = 3;
                        } else {
                            while(isBlank(string[i])) {
                                prefixTagHtml = prefixTagHtml + string[i++];
                            }
                            status = 2;
                        }
                    }
                } else if(2 == status) {
                    if(_isAlphaNum(string[i]) || '-' == string[i] || '_' == string[i]) {
                        prefixTagHtml = prefixTagHtml + string[i++];
                    } else if('/' == string[i] && '>' == string[i + 1]) {
                        prefixTagHtml = prefixTagHtml + string[i++] + string[i++];
                        storeTagInfo();
                        status = 0;
                    } else if('>' == string[i]) {
                        prefixTagHtml = prefixTagHtml + string[i++];
                        storeTagInfo();
                        status = 0;
                    } else {
                        while(isBlank(string[i])) {
                            prefixTagHtml = prefixTagHtml + string[i++];
                        }
                        if('=' == string[i]) {
                            prefixTagHtml = prefixTagHtml + string[i++];
                            while(isBlank(string[i])) {
                                prefixTagHtml = prefixTagHtml + string[i++];
                            }
                        }
                        status = 3;
                    }
                } else if(3 == status) {
                    if(_isQuote(string[i])) {
                        if(!quoteSymbal) {
                            prefixTagHtml = prefixTagHtml + (quoteSymbal = string[i++]);
                        } else if(quoteSymbal == string[i] && '\\' != string[i - 1]) {
                            prefixTagHtml = prefixTagHtml + string[i++];
                            quoteSymbal   = '';
                            while(isBlank(string[i])) {
                                prefixTagHtml = prefixTagHtml + string[i++];
                            }
                            status = 2;
                        } else {
                            prefixTagHtml = prefixTagHtml + string[i++];
                        }
                    } else {
                        while('\\' == string[i] && '\\' == string[i + 1]) {
                            prefixTagHtml = prefixTagHtml + '\\\\';
                        }
                        if(!_isQuote(string[i])) {
                            prefixTagHtml = prefixTagHtml + string[i++];
                        }
                    }
                } else if(4 == status) {
                    if(_isAlphaNum(string[i])) {
                        tagName = tagName + string[i];
                        suffixTagHtml = suffixTagHtml + string[i++];
                    } else if('>' == string[i]){
                        suffixTagHtml = suffixTagHtml + string[i++];
                        storeTagInfo();
                        status = 0;
                    } else {
                        if(i < len && !string.substr(i).match(/^\s+>/)) {
                            tagContent   = suffixTagHtml + string[i++];
                            tagName      =
                            suffixTagHtml= '';
                            storeTagInfo();
                            status = 0;
                        } else if(i < len) {
                            suffixTagHtml = suffixTagHtml + string[i++];
                        }
                    }
                }
            }
            storeTagInfo();
            return tokens;
        };
        //
        StripTag = (string, tagsReserved) => {
            var tokens = HTMLTokenizer(string);
            tagsReserved = !!tagsReserved && Array.isArray(tagsReserved) ? tagsReserved : [];
            tagsReserved = tagsReserved.map((v) => {
                return v.replace(/\s+/, '')
                        .toUpperCase();
            });
            return tokens.map((v) => {
                return !v.tag ? v.content
                              : (tagsReserved.indexOf(v.tag.toUpperCase()) >= 0
                                  ? v.prefix || v.suffix
                                  : '');
            }).join('');
        };
        //
        YajLib.htmlTokenizer || (YajLib.htmlTokenizer = HTMLTokenizer);
        YajLib.stripTag      || (YajLib.stripTag = StripTag);
        Object.defineProperties(YajLib, {
            htmlTokenizer: propertySetting,
            stripTag     : propertySetting
        });
    }(YajLib));
    //
    var LCDClock;
    (function(YajLib) {
        var gDotDelimiter = [
            [3, 3,  4, 4],
            [3, 11, 4, 4]
        ];
        //12/20
        var gSegPolygons = [
            [[1, 1],  [2, 0],  [8, 0],   [9, 1],  [8, 2],  [2, 2]],//A
            [[9, 1],  [10, 2], [10, 8],  [9, 9],  [8, 8],  [8, 2]],//B
            [[9, 9],  [10,10], [10, 16], [9, 17], [8,16],  [8,10]],//C
            [[9, 17], [8, 18], [2, 18],  [1, 17], [2, 16], [8,16]],//D
            [[1, 17], [0, 16], [0, 10],  [1, 9],  [2,10],  [2,16]],//E
            [[1, 9],  [0, 8],  [0, 2],   [1, 1],  [2, 2],  [2, 8]],//F
            [[1, 9],  [2, 8],  [8, 8],   [9, 9],  [8, 10], [2, 10]]//G
        ];
        var gLcdDigits = [
            [0, 1, 2, 3, 4, 5],
            [1, 2],
            [0, 1, 6, 4, 3],
            [0, 1, 6, 2, 3],
            [5, 6, 1, 2],
            [0, 5, 6, 2, 3],
            [0, 5, 4, 3, 2, 6],
            [0, 1, 2],
            [0, 1, 2, 3, 4, 5, 6],
            [6, 5, 0, 1, 2, 3],
        ];
        LCDClock = function(targetDOM, style, h, m, s) {
            if(!(targetDOM instanceof Element)) {
                throw 'Invalid parameter 1';
            }
            if(this instanceof LCDClock) {
                this.targetDOM = targetDOM;
                this.updateByDelta = false;
                if('undefined' != typeof h 
                   || 'undefined' != typeof m
                   || 'undefined' != typeof s) {
                   this.updateByDelta = true;
                }
                this.hour = isNaN(parseInt(h)) ? 0 : parseInt(h);
                this.min  = isNaN(parseInt(m)) ? 0 : parseInt(m);;
                this.sec  = isNaN(parseInt(s)) ? 0 : parseInt(s);;
                if('undefined' == typeof style) {
                    style = LCDClock.HOUR | LCDClock.MIN | LCDClock.SEC;
                } else {
                    style = style & 0x7;
                }
                this.style = style;
                this.highlight = '#F00';
                this.greyed    = '#EEE';
                this.use24HourMode = true;
                this.running   = false;
                this.updateRid = null;
                this.countdown = false;
                this.ticksNum  = 0;
            } else {
                return new LCDClock(targetDOM, style, h, m, s);
            }
        };
        //
        var UNIT_ROWS = 20;
        var UNIT_COLS = 12;
        LCDClock.HOUR = 0x4;
        LCDClock.MIN  = 0x2;
        LCDClock.SEC  = 0x1;
        //
        var SVG_G_HOUR_ID_0 = 'svg_hour_0';
        var SVG_G_HOUR_ID_1 = 'svg_hour_1';
        //
        var SVG_G_HMD_ID    = 'svg_hour_min_d';
        //
        var SVG_G_MIN_ID_0  = 'svg_min_0';
        var SVG_G_MIN_ID_1  = 'svg_min_1';
        //
        var SVG_G_MSD_ID    = 'svg_min_sec_d';
        //
        var SVG_G_SEC_ID_0  = 'svg_sec_0';
        var SVG_G_SEC_ID_1  = 'svg_sec_1';

        LCDClock.prototype = {
            set24HourMode: function(use24HourMode) {
                this.use24HourMode = !!use24HourMode;
                return this;
            },
            setCountdown: function(flag) {
                this.countdown = !!flag;
                return this;
            },
            setHighlightColor: function(highlightColor) {
                this.highlight = highlightColor;
                return this;
            },
            getHighlightColor: function() {
                return this.highlight;
            },
            setGreyedColor: function(greyedColor) {
                this.greyed = greyedColor;
                return this;
            },
            getGreyedColor: function() {
                return this.greyed;
            },
            run: function() {
                if(!this.running) {
                    this.running = true;
                    var updateCallback = function(event) {
                        _eraseDotDelimiter.call(this, event);
                        if(!(this.ticksNum++ % this.periodNum)) {
                            if(this.countdown) {
                                this.hour = Math.max(0, this.hour) % 100;
                                this.min  = Math.max(0, this.min) % 100;
                                this.sec  = Math.max(0, this.sec) % 100;
                                if(_isAllZero.call(this)) {
                                    return this;
                                }
                                if(--this.sec < 0) {
                                    this.sec = 59;
                                    if(--this.min < 0) {
                                        this.min = 59;
                                        --this.hour;
                                    }
                                }
                            } else {
                                if(this.updateByDelta) {
                                    if(60 == ++this.sec) {
                                        ++this.min;
                                        this.sec = 0;
                                        if(60 == ++this.min) {
                                            ++this.hour;
                                            this.min = 0;
                                            if(this.use24HourMode) {
                                                this.hour %= 24;
                                            } else {
                                                this.hour %= 12;
                                            }
                                        }
                                    }
                                } else {
                                    var currentDate = new Date;
                                    this.hour = currentDate.getHours();
                                    this.min  = currentDate.getMinutes();
                                    this.sec  = currentDate.getSeconds();
                                }
                            }
                            _updateUI.call(this);
                        }
                        return this;
                    };
                    updateCallback = updateCallback.bind(this);
                    updateCallback();
                    if(!(this.style & LCDClock.SEC)) {
                        this.periodNum = 2;
                    } else {
                        this.periodNum = 1;
                    }
                    this.updateRid = setInterval(updateCallback, 1000 / this.periodNum);
                }
                return this;
            },
            stop: function() {
                if(this.running) {
                    if(null !== this.updateRid) {
                        clearInterval(this.updateRid);
                        this.updateRid = null;
                    }
                    this.running = false;
                }
                return this;
            }
        };
        //
        var _getPolygonPointsOfSegs = function(segIndexSet, offsetX, offsetY) {
            var points = [];
            for(var i = 0; i < segIndexSet.length; ++i) {
                var segIndex = segIndexSet[i];
                var segPoints= [];
                for(var j = 0; j < gSegPolygons[segIndex].length; ++j) {
                    var point = gSegPolygons[segIndex][j];
                    var x = offsetX + point[0];
                    var y = offsetY + point[1];
                    segPoints.push(x + ',' + y);
                }
                points.push(segPoints);
            }
            return points;
        };
        //
        var _getPolygonPointsOfDigit = function(digit, offsetX, offsetY) {
            var highlightPoints = _getPolygonPointsOfSegs.call(this, gLcdDigits[digit], offsetX, offsetY);
            var greyedPoints    = [];
            var greyedSegIndex  = [0, 1, 2, 3, 4, 5, 6];
            for(var i = 0; i < gLcdDigits[digit].length; ++i) {
                var segIndex = gLcdDigits[digit][i];
                var j = greyedSegIndex.indexOf(segIndex);
                greyedSegIndex.splice(j, 1);
            }
            greyedPoints = _getPolygonPointsOfSegs.call(this, greyedSegIndex, offsetX, offsetY);
            return [highlightPoints, greyedPoints];
        };
        //
        var _isAllZero = function() {
            return !this.hour && !this.min && !this.sec;
        };
        //
        var _eraseDotDelimiter = function(event) {
            if(!(this.style & LCDClock.SEC) && _getLCDColumnsNum.call(this) > 3) {
                _updateDotDelimiter.call(
                    this, SVG_G_HMD_ID, UNIT_COLS << 1, this.greyed
                );
            }
            return this;
        };
        //
        var _updateUI = function() {
            var offset = 0;
            var step;
            if(this.style & LCDClock.HOUR) {
                step = UNIT_COLS;
                _updateDigit.call(
                    this, SVG_G_HOUR_ID_0,
                    offset, parseInt(this.hour / 10),
                    this.highlight, this.greyed
                );
                offset += step;
                _updateDigit.call(
                    this, SVG_G_HOUR_ID_1,
                    offset, this.hour % 10,
                    this.highlight, this.greyed
                );
                offset += step;
            }
            if(offset > 0
               && ((this.style & LCDClock.MIN)
                    || (this.style & LCDClock.SEC))) {
                _updateDotDelimiter.call(
                    this, SVG_G_HMD_ID,
                    offset, this.highlight
                );
                offset += UNIT_COLS;
            }
            if(this.style & LCDClock.MIN) {
                step = UNIT_COLS;
                _updateDigit.call(
                    this, SVG_G_MIN_ID_0,
                    offset, parseInt(this.min / 10),
                    this.highlight, this.greyed
                );
                offset += step;
                _updateDigit.call(
                    this, SVG_G_MIN_ID_1,
                    offset, this.min % 10,
                    this.highlight, this.greyed
                );
                offset += step;
            }
            if(offset > 0
                && (this.style & LCDClock.SEC)) {
                _updateDotDelimiter.call(
                    this, SVG_G_MSD_ID,
                    offset, this.highlight
                );
                offset += UNIT_COLS;
            }
            if(this.style & LCDClock.SEC) {
                step = UNIT_COLS;
                _updateDigit.call(
                    this, SVG_G_SEC_ID_0,
                    offset, parseInt(this.sec / 10),
                    this.highlight, this.greyed
                );
                offset += step;
                _updateDigit.call(
                    this, SVG_G_SEC_ID_1,
                    offset, this.sec % 10,
                    this.highlight, this.greyed
                );
            }
            return this;
        };
        //
        var _getDotDelimterSVGHtml = function(offset, highlight) {
            var points = [];
            var dotDelimterHtml = [];
            for(var i = 0; i < gDotDelimiter.length; ++i) {
                var xywh = gDotDelimiter[i];
                var x = offset + xywh[0];
                var rectHtml = '<rect id="" x="' + x + '" y="' + xywh[1] + '" width="' + xywh[2] + '" height="' + xywh[3] + '" fill="' + highlight + '"/>';
                dotDelimterHtml.push(rectHtml); 
            }
            return dotDelimterHtml.join('');
        };
        //
        var _updateDotDelimiter = function(groupId, offset, highlight) {
            var SVGGroupDOM = _getSVGGroup.call(this, groupId);
            var dotDelimterHtml = _getDotDelimterSVGHtml.call(this, offset, highlight);
            SVGGroupDOM.innerHTML = dotDelimterHtml;
            return this;
        };
        //
        var _getDigitSVGHtml = function(offset, digit, highlight, greyed) {
            var points = _getPolygonPointsOfDigit.call(this, digit, offset, 0);
            var digitSVGHtml = [];
            var colors = [highlight, greyed];
            for(var i = 0; i < points.length; ++i) {
                for(var j = 0; j < points[i].length; ++j) {
                    var polygonHtml = '<polygon xmlns="http://www.w3.org/2000/svg" id="" points="' + points[i][j].join(' ') + '" fill="' + colors[i] + '"/>';
                    digitSVGHtml.push(polygonHtml);
                }
            }
            return digitSVGHtml.join('');
        };
        //
        var _updateDigit = function(groupId, offset, digit, highlight, greyed) {
            digit &= 0xF;
            if(isNaN(digit) || digit > 9 || digit < 0) {
                throw 'Invalid digit: ' + digit + ', expect 0 ~ 9';
            }
            var SVGGroupDOM = _getSVGGroup.call(this, groupId);
            var digitSVGHtml= _getDigitSVGHtml.call(this, offset, digit, highlight, greyed);
            SVGGroupDOM.innerHTML = digitSVGHtml;
            return this;
        };
        //
        var _getLCDColumnsNum = function() {
            var columns = 0;
            if(this.style & LCDClock.HOUR) {
                columns += 2;
            }
            if(this.style & LCDClock.MIN) {
                if(columns) {
                    ++columns;
                }
                columns += 2;
            }
            if(this.style & LCDClock.SEC) {
                if(columns) {
                    ++columns;
                }
                columns += 2;
            }
            return columns;
        };
        //
        var _getSVGContainer = function() {
            var columnNum = _getLCDColumnsNum.call(this);
            var SVGDOM    = this.targetDOM.querySelector('svg');
            if(!SVGDOM) {
                var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ' + (UNIT_COLS * columnNum) + ' ' + UNIT_ROWS + '"></svg>';
                this.targetDOM.innerHTML = svgHtml;
                SVGDOM = this.targetDOM.querySelector('svg');
            }
            return SVGDOM;
        };
        //
        var _getSVGGroup = function(groupId) {
            var SVGDOM  = _getSVGContainer.call(this);
            var selector= 'g[id="' + groupId + '"]';
            var groupDOM = SVGDOM.querySelector(selector);
            if(!groupDOM) {
                var svgGroupHtml = '<g xmlns="http://www.w3.org/2000/svg" id="' + groupId + '" style="fill-rule:evenodd;stroke:#FFFFFF;stroke-width:0.2;stroke-opacity:1;stroke-linecap:butt;stroke-linejoin:miter;"></g>';
                SVGDOM.innerHTML += svgGroupHtml;
                groupDOM = SVGDOM.querySelector(selector);
            }
            groupDOM.innerHTML = '';
            return groupDOM;
        };
        YajLib.lcdClock || (YajLib.lcdClock = LCDClock);
        Object.defineProperties(YajLib, {
            lcdClock: propertySetting
        });
    }(YajLib));
    /**
     * @See: https://www.ietf.org/rfc/rfc1321.txt
     *
     **/
    var MD5;
    ((YajLib) => {
        var F = (X, Y, Z) => {
            return (X & Y) | (~X & Z);
        };
        var G = (X, Y, Z) => {
            return (X & Z) | (Y & ~Z);
        };
        var H = (X, Y, Z) => {
            return X ^ Y ^ Z;
        };
        var I = (X, Y, Z) => {
            return Y ^ (X | ~Z);
        };
        var rotateLeftShift = (uint32, n) => {
            if(n &= 0x1F) {
                return (uint32 << n) | (uint32 >>> (32 - n));
            };
            return uint32;
        };
        var round = (A, B, C, D, k, s, i, f) => {
            return B + rotateLeftShift(A + f(B, C, D) + k + magics[i], s);
        };
        var magics = [
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
            0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
            0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
            0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
            0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
            0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ];
        //
        var convert16Words = (uint8Array) => {
            var t = [];
            for(var i = 0; i < 64; i += 4) {
                t.push(uint8Array[i]
                    | (uint8Array[i + 1] <<  8)
                    | (uint8Array[i + 2] << 16)
                    | (uint8Array[i + 3] << 24)
                );
            }
            return t;
        };
        //
        MD5 = (input) => {
            var uint8Array = getBytesArray(input);
            var olen = uint8Array.length;
            var paddingLen;
            uint8Array.push(0x80);
            if((olen & 0x3F) < 56) {
                paddingLen = 55 - (olen & 0x3F);
            } else {
                paddingLen = 119 - (olen & 0x3F);
            }
            uint8Array = uint8Array.concat((new Array(paddingLen)).fill(0));
            uint8Array = uint8Array.concat(
                [(olen << 3) & 0xFF, (olen >> 5) & 0xFF, (olen >> 13) & 0xFF, (olen >> 21) & 0xFF],
                [olen >>> 29, 0, 0, 0]
            );
            var A = 0x67452301, B = 0xefcdab89, C = 0x98badcfe, D = 0x10325476;
            for(let i = 0, len = uint8Array.length; i < len; i += 64) {
                let AA = A, BB = B, CC = C, DD = D;
                let T = convert16Words(uint8Array.slice(i, i + 64));
                //Round 1
                A = round(A, B, C, D, T[ 0],  7,  0, F);
                D = round(D, A, B, C, T[ 1], 12,  1, F);
                C = round(C, D, A, B, T[ 2], 17,  2, F);
                B = round(B, C, D, A, T[ 3], 22,  3, F);
                A = round(A, B, C, D, T[ 4],  7,  4, F);
                D = round(D, A, B, C, T[ 5], 12,  5, F);
                C = round(C, D, A, B, T[ 6], 17,  6, F);
                B = round(B, C, D, A, T[ 7], 22,  7, F);
                A = round(A, B, C, D, T[ 8],  7,  8, F);
                D = round(D, A, B, C, T[ 9], 12,  9, F);
                C = round(C, D, A, B, T[10], 17, 10, F);
                B = round(B, C, D, A, T[11], 22, 11, F);
                A = round(A, B, C, D, T[12],  7, 12, F);
                D = round(D, A, B, C, T[13], 12, 13, F);
                C = round(C, D, A, B, T[14], 17, 14, F);
                B = round(B, C, D, A, T[15], 22, 15, F);
                //Round 2
                A = round(A, B, C, D, T[ 1],  5, 16, G);
                D = round(D, A, B, C, T[ 6],  9, 17, G);
                C = round(C, D, A, B, T[11], 14, 18, G);
                B = round(B, C, D, A, T[ 0], 20, 19, G);
                A = round(A, B, C, D, T[ 5],  5, 20, G);
                D = round(D, A, B, C, T[10],  9, 21, G);
                C = round(C, D, A, B, T[15], 14, 22, G);
                B = round(B, C, D, A, T[ 4], 20, 23, G);
                A = round(A, B, C, D, T[ 9],  5, 24, G);
                D = round(D, A, B, C, T[14],  9, 25, G);
                C = round(C, D, A, B, T[ 3], 14, 26, G);
                B = round(B, C, D, A, T[ 8], 20, 27, G);
                A = round(A, B, C, D, T[13],  5, 28, G);
                D = round(D, A, B, C, T[ 2],  9, 29, G);
                C = round(C, D, A, B, T[ 7], 14, 30, G);
                B = round(B, C, D, A, T[12], 20, 31, G);
                //Round 3
                A = round(A, B, C, D, T[ 5],  4, 32, H);
                D = round(D, A, B, C, T[ 8], 11, 33, H);
                C = round(C, D, A, B, T[11], 16, 34, H);
                B = round(B, C, D, A, T[14], 23, 35, H);
                A = round(A, B, C, D, T[ 1],  4, 36, H);
                D = round(D, A, B, C, T[ 4], 11, 37, H);
                C = round(C, D, A, B, T[ 7], 16, 38, H);
                B = round(B, C, D, A, T[10], 23, 39, H);
                A = round(A, B, C, D, T[13],  4, 40, H);
                D = round(D, A, B, C, T[ 0], 11, 41, H);
                C = round(C, D, A, B, T[ 3], 16, 42, H);
                B = round(B, C, D, A, T[ 6], 23, 43, H);
                A = round(A, B, C, D, T[ 9],  4, 44, H);
                D = round(D, A, B, C, T[12], 11, 45, H);
                C = round(C, D, A, B, T[15], 16, 46, H);
                B = round(B, C, D, A, T[ 2], 23, 47, H);
                //Round 4
                A = round(A, B, C, D, T[ 0],  6, 48, I);
                D = round(D, A, B, C, T[ 7], 10, 49, I);
                C = round(C, D, A, B, T[14], 15, 50, I);
                B = round(B, C, D, A, T[ 5], 21, 51, I);
                A = round(A, B, C, D, T[12],  6, 52, I);
                D = round(D, A, B, C, T[ 3], 10, 53, I);
                C = round(C, D, A, B, T[10], 15, 54, I);
                B = round(B, C, D, A, T[ 1], 21, 55, I);
                A = round(A, B, C, D, T[ 8],  6, 56, I);
                D = round(D, A, B, C, T[15], 10, 57, I);
                C = round(C, D, A, B, T[ 6], 15, 58, I);
                B = round(B, C, D, A, T[13], 21, 59, I);
                A = round(A, B, C, D, T[ 4],  6, 60, I);
                D = round(D, A, B, C, T[11], 10, 61, I);
                C = round(C, D, A, B, T[ 2], 15, 62, I);
                B = round(B, C, D, A, T[ 9], 21, 63, I);
                A += AA;
                B += BB;
                C += CC;
                D += DD;
            }
            uint8Array.length = 0;
            return [A, B, C, D].map((n) => {
                return (n         & 0xFF).toString(16).padStart(2, '0')
                     + ((n >>  8) & 0xFF).toString(16).padStart(2, '0')
                     + ((n >> 16) & 0xFF).toString(16).padStart(2, '0')
                     + ((n >> 24) & 0xFF).toString(16).padStart(2, '0');
            }).join('');
        };
        YajLib.md5 || (YajLib.md5 = MD5);
        Object.defineProperties(YajLib, {
            md5: propertySetting
        });
    })(YajLib);
    var Base64Encode;
    var Base64Decode;
    ((YajLib) => {
        var base64CharTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';//=
        var base64CharReTable = (() => {
            var rMap = {};
            for(let i = 0; i < 64; ++i) {
                rMap[base64CharTable[i]] = i;
            }
            return rMap;
        })();
        Base64Encode = (input) => {
            var uint8Array = getBytesArray(input);
            var len = uint8Array.length;
            var encoded = '';
            for(var i = 0, j = len - 3; i <=j ; i += 3) {
                let indexes = [
                    (uint8Array[i] >> 2) & 0x3F,
                    (((uint8Array[i] & 0x3) << 4) | (uint8Array[i + 1] >> 4)) & 0x3F,
                    (((uint8Array[i + 1] & 0xF) << 2) | (uint8Array[i + 2] >> 6)) & 0x3F,
                    uint8Array[i + 2] & 0x3F
                ];
                encoded = encoded + indexes.map((v) => {
                    return base64CharTable[v];
                }).join('');
            }
            if(len - 1 == i) {
                let singlebyte = uint8Array[i];
                encoded = encoded
                        + base64CharTable[(singlebyte >> 2) & 0x3F]
                        + base64CharTable[(singlebyte & 0x3) << 4]
                        + '==';
            } else if(len - 2 == i) {
                var doubleByte = uint8Array[i] | ((uint8Array[i + 1] << 8) << 2);
                encoded = encoded
                        + base64CharTable[(uint8Array[i] >> 2) & 0x3F]
                        + base64CharTable[(((uint8Array[i] & 0x3) << 4) | (uint8Array[i + 1] >> 4)) & 0x3F]
                        + base64CharTable[(uint8Array[i + 1] << 2) & 0x3F]
                        + '=';
            }
            return encoded;
        };
        Base64Decode = (string) => {
            string = '' + string;
            var len = string.length;
            if(len & 0x3) {
                return false;
            }
            var decodedUint8Array = [];
            for(var i = 0, j = len - 4; i < j; i += 4) {
                let a = base64CharReTable[string[i]];
                let b = base64CharReTable[string[i + 1]];
                let c = base64CharReTable[string[i + 2]];
                let d = base64CharReTable[string[i + 3]];
                if('undefined' === typeof a || 'undefined' === typeof b
                    || 'undefined' === typeof c || 'undefined' === typeof d) {
                    return false;
                }
                decodedUint8Array = decodedUint8Array.concat([
                    (a << 2) | (b >> 4),
                    ((b & 0xF) << 4) | (c >> 2),
                    ((c & 0x3) << 6) | d
                ]);
            }
            let a = base64CharReTable[string[i]];
            let b = base64CharReTable[string[i + 1]];
            let c = base64CharReTable[string[i + 2]];
            let d = base64CharReTable[string[i + 3]];
            if('undefined' === typeof a || 'undefined' === typeof b) {
                return false;
            }
            if('=' == string[i + 2] && '=' == string[i + 3]) {
                decodedUint8Array.push((a << 2) | (b >> 4));
            } else if('=' == string[i + 3] && 'undefined' != typeof c) {
                decodedUint8Array.push((a << 2) | (b >> 4));
                decodedUint8Array.push(((b & 0xF) << 4) | (c >> 2));
            } else if('undefined' != typeof c && 'undefined' != typeof d) {
                decodedUint8Array.push((a << 2) | (b >> 4));
                decodedUint8Array.push(((b & 0xF) << 4) | (c >> 2));
                decodedUint8Array.push(((c & 0x3) << 6) | d);
            } else {
                return false;
            }
            return decodedUint8Array.map((v) => {
                return String.fromCharCode(v);
            }).join('');
        };
        YajLib.base64Encode || (YajLib.base64Encode = Base64Encode);
        YajLib.base64Decode || (YajLib.base64Decode = Base64Decode);
        Object.defineProperties(YajLib, {
            base64Encode: propertySetting,
            base64Decode: propertySetting
        });
    })(YajLib);
}(window));
