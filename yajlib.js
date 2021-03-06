/**
 * @Author: Lori Lee
 * @Email:  leejqy@163.com
 *
 * @WARNING: NEVER change below codes unless you are clear what you are doing.
 *
 * All rights reserved.
 *
 **/
var YajLib = YajLib || {author: 'Lori Lee', email: 'leejqy@163.com', version: '1.2'};
(function(window) {
    'use strict';
    var propertySetting = {writable: false, configurable: false};
    //
    const _isCallableFn = (fn)    => ('function' === typeof(fn));
    const _isArrayFn    = (input) => (Array.isArray(input));
    const _isObjectFn   = (input) => ('object' === typeof(input));
    const _isEmptyObjectFn = (input) => {
        return (_isObjectFn(input) && (!input || !Object.keys(input).length))
                || (_isArrayFn(input) && !input.length);
    };
    const _cloneFn = (source, deep) => {
        if(!source || !_isObjectFn(source)) {
            return source;
        } else {
            if(!!deep) {
                var _cloneId = 1;
                const __cloneFn = (source, clonedMap) => {
                    if(!source || !_isObjectFn(source)) {
                        return source;
                    }
                    clonedMap = clonedMap || {};
                    if(!source.__cloneId) {//here we assume it is an extensible object
                        source.__cloneId = _cloneId++;
                        let cloned = _isArrayFn(source) || (_isObjectFn(source) && source.length) ? [] : {};
                        clonedMap[source.__cloneId] = cloned;
                        for(let k in source) {
                            cloned[k] = __cloneFn(source[k], clonedMap);
                        }
                    }
                    return clonedMap[source.__cloneId];
                };
                const _cleanAttrOfObjFn = (target, attr) => {
                    if(!!target && (_isObjectFn(target) || _isCallableFn(target))) {
                        delete target[attr];
                        for(let k in target) {
                            _cleanAttrOfObjFn(target[k], attr);
                        }
                    }
                };
                let clonedMap = {};
                let cloned    = __cloneFn(source, clonedMap);
                _cleanAttrOfObjFn(source, '__cloneId');
                _cleanAttrOfObjFn(cloned, '__cloneId');
                return cloned;
            } else {
                let cloned = _isArrayFn(source) || (_isObjectFn(source) && source.length) ? [] : {};
                for(let k in source) {
                    cloned[k] = source[k];
                }
                return cloned;
            }
        }
    };
    ((YajLib) => {
        let sprintf = function(format) {//JS version of linux "man 3 sprintf"
            if(this instanceof sprintf) {
                return console.log('[Error]: sprintf is a pure function, and cannot new an instance');
            }
            let result = '';
            let flag          = '([#0\\- +\'I])';
            let minWidth      = '((\\*)?([0-9]*\\$)?)|([0-9]+)';
            let precision     = '\\.((\\*)?([0-9]+\\$)?|(-?[0-9]+))?';
            let lengthModifier= 'hh|h|l|ll|L|q|j|z|t';
            let conversion    = 'b|d|i|o|u|x|X|e|E|f|F|g|G|a|A|c|s';
            let formatPattern = '^%({flag}*)({minWidth})?({precision})?({lengthModifier})?({conversion})?';
            let args = _cloneFn(arguments, true);
            formatPattern = formatPattern.replace('{flag}', flag)
                                         .replace('{minWidth}', minWidth)
                                         .replace('{precision}', precision)
                                         .replace('{lengthModifier}', lengthModifier)
                                         .replace('{conversion}', conversion);
            let formatPatternRE     = new RegExp(formatPattern);
            let dualPercentageSymRE = new RegExp('^%%');
            let match;
            const _IntType   = 0x0;
            const _BinType   = 0x2;
            const _OctType   = 0x4;
            const _HexType   = 0x6;
            const _HexType2  = 0x8;
            const _FloatType = 0x10;
            const _ExpType   = 0x12;
            const _ExpType2  = 0x14;
            //
            const _CharType  = 0x20;
            const _StrType   = 0x21;
            const _typeMap = {
                d: _IntType, i: _IntType, u: _IntType,
                b: _BinType, o: _OctType, x: _HexType, X: _HexType2,
                f: _FloatType, F: _FloatType,
                e: _ExpType, E: _ExpType2, g: _ExpType, G: _ExpType2,
                c: _CharType, s: _StrType
            };
            if(format) {
                let _converterFn = function(paddingOnce, padding, width, precision, type, prefixPlus, value) {
                    padding   = padding.toString();
                    padding   = !padding ? ' ' : padding;
                    precision = Math.max(0, Number.parseInt(precision));
                    precision = Number.isNaN(precision) ? 0 : precision;
                    width = Number.parseInt(width);
                    width = Number.isNaN(width) ? 0 : width;
                    prefixPlus = !!prefixPlus;
                    if(_FloatType <= type && type <= _ExpType2) {
                        value = Number.parseFloat(value);
                        if(!Number.isNaN(value)) {
                            let _radix = 0;
                            let _prefixMinus = '';
                            if(type >= _ExpType) {
                                _prefixMinus = value < 0 ? '-' : '';
                                value  = Math.abs(value);
                                _radix = Math.floor(Math.log10(value));
                                value /= Math.pow(10, _radix);
                            }
                            let _pow10n = Math.pow(10, precision);
                            value = (Math.round(value * _pow10n) / _pow10n) + '';
                            if(precision > 0) {
                                let parts = value.split('.');
                                value = parts[0] + '.' + ((parts.length > 1) ? parts[1] : '').padEnd(precision, '0');
                            }
                            if(type >= _ExpType) {
                                value = _prefixMinus + value + 'e' + _radix;
                            }
                        } else {
                            value = value.toString();
                        }
                    } else if(type < _FloatType) {
                        value = Number.parseInt(value);
                        if(!Number.isNaN(value)) {
                            switch(type) {
                            case _BinType : value = (value).toString( 2); break;
                            case _OctType : value = (value).toString( 8); break;
                            case _HexType : 
                            case _HexType2: value = (value).toString(16); break;
                            }
                            value = ('-' == value[0]) ? ('-' + paddingOnce + value.substr(1)) : (paddingOnce + value);
                        } else {
                            value = value.toString();
                        }
                    } else {
                        value = (value && value.toString) ? value.toString() : '' + value;
                        if(_CharType == type) {
                            value = value[0];
                        }
                    }
                    value = '' + value;
                    if(_HexType2 == type || _ExpType2 == type) {
                        value = value.toUpperCase();
                    }
                    if(type <= _ExpType2 && (prefixPlus && '-' != value[0])) {
                        value = '+' + value;
                    }
                    if(value.length < Math.abs(width)) {
                        let absWidth = Math.abs(width);
                        if(width > 0) {
                            if(type <= _ExpType2
                                && ('+' == value[0] || '-' == value[0])
                                && !padding.match(/\s+/g)) {
                                value = value[0] + value.substr(1).padStart(absWidth - 1, padding);
                            } else {
                                value = value.padStart(absWidth, padding);
                            }
                        } else {
                            value = value.padEnd(absWidth, padding);
                        }
                    }
                    return value;
                };
                let nextArgIndex = 0;
                for(let i = 0, l = format.length; i < l;) {
                    if('%' != format[i]) {
                        result = result + format[i++];
                    } else if(dualPercentageSymRE.exec(format.substr(i))) {
                        (i += 2) && (result = result + '%');
                    } else if(match = formatPatternRE.exec(format.substr(i))) {
                        let _flags          = match[ 1] ? match[ 1] : '';
                        let _minWidth       = match[ 3] ? match[ 3] : '';
                        let _precision      = match[ 8] ? match[ 8] : '';
                        let _lengthModifier = match[13] ? match[13] : '';
                        let _conversion     = match[14] ? match[14] : '';
                        let _paddingOnce  = '';
                        let _paddingChar  = '';
                        let _width        = 0;
                        let _precisions   = 0;
                        let _paddingLeft  = false;
                        let _prefixPlusSym= false;
                        let _value = args[++nextArgIndex];
                        if(_flags.indexOf('#') >= 0 && _conversion.match(/[oxX]/)) {
                            _paddingOnce = ('o' == _conversion ? '0' : ('0' + _conversion));
                        } else {
                            _paddingChar = _flags.indexOf('0') >= 0
                                         ? '0' : (_flags.indexOf(' ') >= 0
                                               ? ' ' : '');
                        }
                        _paddingLeft   = (_flags.indexOf('-') >= 0);
                        _prefixPlusSym = (_flags.indexOf('+') >= 0);
                        if(_minWidth) {
                            if(match[7]) {
                                _width = Number.parseInt(match[7]);
                            } else if(match[4]) {
                                if(match[5]) {//*
                                    if(match[6]) {
                                        let _i = Number.parseInt(match[6]);
                                        _width = Number.parseInt(Number.isNaN(_i) ? NaN : args[_i]);
                                    } else {
                                        _width = Number.parseInt(args[nextArgIndex]);
                                    }
                                } else if(match[6]) {
                                    let _i = Number.parseInt(match[6]);
                                    _value = (Number.isNaN(_i) ? NaN : args[_i]);
                                    --nextArgIndex;
                                }
                            }
                        }
                        if(_paddingLeft) {
                            _width = -_width;
                        }
                        if(_precision) {
                            if(match[12]) {
                                _precisions = Number.parseInt(match[12]);
                            } else {
                                if(match[10]) {//*
                                    if(match[11]) {
                                        let _i = Number.parseInt(match[11]);
                                        _precisions = Number.parseInt(Number.isNaN(_i) ? NaN : args[_i]);
                                    } else {
                                        _precisions = Number.parseInt(args[nextArgIndex]);
                                    }
                                } else if(match[11]) {
                                    let _i = Number.parseInt(match[11]);
                                    _precisions = Number.parseInt(Number.isNaN(_i) ? NaN : args[_i]);
                                }
                            }
                        } else if(_conversion) {
                            _precisions = 'fFgG'.indexOf(_conversion) >= 0 ? 6 : 0;
                            if(_lengthModifier && 'lL'.indexOf(_lengthModifier) >= 0) {
                                _precisions += 6;
                            }
                        }
                        if(_lengthModifier && !_conversion) {
                            _conversion = 'd';
                        }
                        if(_conversion && 'undefined' != typeof _typeMap[_conversion]) {
                            let _type = _typeMap[_conversion];
                            result = result + _converterFn(_paddingOnce, _paddingChar, _width, _precisions, _type, _prefixPlusSym, _value);
                            i += match[0].length;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
            return result;
        };
        YajLib.sprintf || (YajLib.sprintf = sprintf);
        Object.defineProperties(YajLib, {
            sprintf: propertySetting
        });
    })(YajLib);
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
    var getBytesArray = (input, encode, littleEdian) => {//@TODO: add parameter encoding, and unicode converted accordingly
        var bytes = [];
        if(Number.isInteger(input)) {
            bytes.push(input & 0xFF);
            (input & 0xFFFFFF00) && (bytes.push((input >>  8) & 0xFF));
            (input & 0xFFFF0000) && (bytes.push((input >> 16) & 0xFF));
            (input & 0xFF000000) && (bytes.push((input >> 24) & 0xFF));
        } else if(Array.isArray(input)) {
            bytes = input.map((v) => {
                return getBytesArray(v, encode, littleEdian);
            }).flat();
        } else {
            input = '' + input;
            for(let i = 0, len = input.length; i < len; ++i) {
                //let code = input.charCodeAt(i);//UTF-16, at most 4 bytes, most time only 2 bytes
                let code = input.codePointAt(i);//Unicode, for BMP(Basic Multi-lingual Plane), same as charCodeAt
                bytes    = bytes.concat(getBytesArray(code, encode, littleEdian));
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
                pairs: prevRow.length && prevRow[m] > 0 ? prevMaxMatchingPos[m] : []
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
        var _isBlank = (char) => {
            return !!char.match(/^\s+$/);
        };
        var _isTagAttrName = (char) => {
            return _isAlphaNum(char) || ['_', '.', '-', ':'].indexOf(char) >= 0;
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
            var attrName      = '';
            var attrValue     = '';
            var attrNameValues= [];
            var storeTagInfo  = function() {
                if(!!tagName + !!tagContent) {
                    tokens.push({
                        tag    : tagName,
                        prefix : prefixTagHtml,
                        suffix : suffixTagHtml,
                        content: tagContent,
                        attrSet: attrNameValues
                    });
                    tagName       =
                    prefixTagHtml =
                    suffixTagHtml =
                    tagContent    =
                    quoteSymbal   = '';
                    attrNameValues= [];
                }
            };
            var storeAttrValue = function() {
                if(attrName || attrValue) {
                    if(attrName || attrValue) {
                        attrNameValues.push({
                            attr : attrName,
                            value: attrValue
                        });
                    }
                    attrName  =
                    attrValue = '';
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
                    if(_isTagAttrName(string[i])) {
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
                    if(_isTagAttrName(string[i])) {
                        attrName = attrName + string[i];
                        prefixTagHtml = prefixTagHtml + string[i++];
                    } else if('/' == string[i] && '>' == string[i + 1]) {
                        prefixTagHtml = prefixTagHtml + string[i++] + string[i++];
                        storeAttrValue();
                        storeTagInfo();
                        status = 0;
                    } else if('>' == string[i]) {
                        prefixTagHtml = prefixTagHtml + string[i++];
                        storeAttrValue();
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
                            status = 3;
                        } else {
                            storeAttrValue();
                        }
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
                            storeAttrValue();
                            status = 2;
                        } else {
                            attrValue     = attrValue + string[i];
                            prefixTagHtml = prefixTagHtml + string[i++];
                        }
                    } else {
                        while('\\' == string[i] && '\\' == string[i + 1]) {
                            prefixTagHtml = prefixTagHtml + '\\\\';
                            attrValue     = attrValue + '\\\\';
                            i += 2;
                        }
                        if(!_isQuote(string[i])) {
                            if(!quoteSymbal
                               && ('>' == string[i]
                                   || ('/' == string[i] && '>' == string[i + 1]))) {
                                status = 2;
                            } else {
                                if('\\' != string[i] || !_isQuote(string[i + 1])) {//\' | \"
                                    attrValue = attrValue + string[i];
                                }
                                prefixTagHtml = prefixTagHtml + string[i++];
                            }
                        }
                    }
                } else if(4 == status) {
                    if(_isTagAttrName(string[i])) {
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
            storeAttrValue();
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
            [[1,  1], [ 2,  0], [ 8,  0], [9,  1], [8,  2], [2,  2]],//A
            [[9,  1], [10,  2], [10,  8], [9,  9], [8,  8], [8,  2]],//B
            [[9,  9], [10, 10], [10, 16], [9, 17], [8, 16], [8, 10]],//C
            [[9, 17], [ 8, 18], [ 2, 18], [1, 17], [2, 16], [8, 16]],//D
            [[1, 17], [ 0, 16], [ 0, 10], [1,  9], [2, 10], [2, 16]],//E
            [[1,  9], [ 0,  8], [ 0,  2], [1,  1], [2,  2], [2,  8]],//F
            [[1,  9], [ 2,  8], [ 8,  8], [9,  9], [8, 10], [2, 10]]//G
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
                return String.fromCodePoint(v);
            }).join('');
        };
        YajLib.base64Encode || (YajLib.base64Encode = Base64Encode);
        YajLib.base64Decode || (YajLib.base64Decode = Base64Decode);
        Object.defineProperties(YajLib, {
            base64Encode: propertySetting,
            base64Decode: propertySetting
        });
    })(YajLib);
    //@See: https://academic.csuohio.edu/yuc/security/Chapter_06_Data_Encription_Standard.pdf
    var DES;
    var TriDES;
    ((YajLib) => {
        var IP = [
            57, 49, 41, 33, 25, 17,  9,  1,
            59, 51, 43, 35, 27, 19, 11,  3,
            61, 53, 45, 37, 29, 21, 13,  5,
            63, 55, 47, 39, 31, 23, 15,  7,
            56, 48, 40, 32, 24, 16,  8,  0,
            58, 50, 42, 34, 26, 18, 10,  2,
            60, 52, 44, 36, 28, 20, 12,  4,
            62, 54, 46, 38, 30, 22, 14,  6
        ];
        var RIP = ((IP) => {
            let rip = new Array(64);
            for(let i = 0; i < 64; ++i) {
                rip[IP[i]] = i;
            }
            return rip;
        })(IP);
        var doPerm = (uint8Array8, PermMap) => {
            let r = (new Array(8)).fill(0);
            let t = new Array(64);
            for(let i = 0; i < 64; ++i) {
                let byteIndex = PermMap[i] >> 3;
                let byteOffset= PermMap[i] & 0x7;
                t[i] = (uint8Array8[byteIndex] >> byteOffset) & 0x1;
            }
            for(let i = 0; i < 64; ++i) {
                let byteIndex = i >> 3;
                let byteOffset= i & 0x7;
                r[byteIndex] |= t[i] << byteOffset;
            }
            return r;
        };
        var exDBox = (uint8Array4) => {
            let Bit48 = (new Array(48)).fill(0);
            for(let i = 0; i < 48; i += 6) {
                let offset= i % 6;
                let group = (i - offset) / 6;
                let byte  = group >> 1;
                let value = (uint8Array4[byte] >> ((group & 1) ? 4 : 0)) & 0xF;
                let prev  = ((group & 1) ? uint8Array4[byte] : (uint8Array4[(byte + 3) & 3] >> 4)) & 0xF;
                let next  = ((group & 1) ? uint8Array4[(byte + 1) & 3] : (uint8Array4[byte] >> 4)) & 0xF;
                Bit48[i]      = (prev  >> 3) & 0x1;
                Bit48[i + 1]  = (value     ) & 0x1;
                Bit48[i + 2]  = (value >> 1) & 0x1;
                Bit48[i + 3]  = (value >> 2) & 0x1;
                Bit48[i + 4]  = (value >> 3) & 0x1;
                Bit48[i + 5]  = (next      ) & 0x1;
            }
            return Bit48;
        };
        var straightDBoxPerm = [
            15,  6, 19, 20, 28, 11, 27, 16,
             0, 14, 24, 25,  4, 17, 30,  9,
             1,  7, 23, 13, 31, 26,  2,  8,
            18, 12, 29,  5, 21, 10,  3, 24
        ];
        var straightDBox = (uinit8Array4) => {
            var r = (new Array(4)).fill(0);
            for(let i = 0; i < 4; i++) {
                for(let j = 0; j < 8; ++j) {
                    let bit    = straightDBoxPerm[(i << 3) + j];
                    let byte   = bit >> 3;
                    let offset = bit & 0x7;
                    r[i] |= ((uinit8Array4[byte] >> offset) & 0x1) << j;
                }
            }
            return r;
        };
        var keyParityDropTable = [
            56, 48, 40, 32, 24, 16,  8,  0,
            57, 49, 41, 33, 25, 17,  9,  1,
            58, 50, 42, 34, 26, 18, 10,  2,
            59, 51, 43, 35, 62, 54, 46, 38,
            30, 22, 14,  6, 61, 53, 45, 37,
            29, 21, 13,  5, 60, 52, 44, 36,
            28, 20, 12,  4, 27, 19, 11,  3
        ];
        var get56Key = (uint8Array8) => {
            var r = (new Array(56)).fill(0);
            for(let i = 0; i < 56; ++i) {
                let bit   = keyParityDropTable[i];
                let byte  = bit >> 3;
                let offset= bit & 0x7;
                r[i] = (uint8Array8[byte] >> offset) & 0x1;
            }
            return r;
        };
        var keyCompressTable = [
            13, 16, 10, 23,  0,  4,  2, 27,
            14,  5, 20,  9, 22, 18, 11,  3,
            25,  7, 15,  6, 26, 19, 12,  1,
            40, 51, 30, 36, 46, 54, 29, 39,
            50, 44, 32, 47, 43, 48, 38, 55,
            33, 52, 45, 41, 49, 35, 28, 31
        ];
        var Compress56Key48 = (BitKey56) => {
            var r = (new Array(48)).fill(0);
            for(let i = 0; i < 48; ++i) {
                r[i] = BitKey56[keyCompressTable[i]];
            }
            return r;
        };
        var SBox1 = [
            14,  4, 13,  1,  2, 15, 11,  8,  3, 10,  6, 12,  5,  9,  0,  7,
             0, 15,  7,  4, 14,  2, 13, 10,  3,  6, 12, 11,  9,  5,  3,  8,
             4,  1, 14,  8, 13,  6,  2, 11, 15, 12,  9,  7,  3, 10,  5,  0,
            15, 12,  8,  2,  4,  9,  1,  7,  5, 11,  3, 14, 10,  0,  6, 13
        ];
        var SBox2 = [
            15,  1,  8, 14,  6, 11,  3,  4,  9,  7,  2, 13, 12,  0,  5, 10,
             3, 13,  4,  7, 15,  2,  8, 14, 12,  0,  1, 10,  6,  9, 11,  5,
             0, 14,  7, 11, 10,  4, 13,  1,  5,  8, 12,  6,  9,  3,  2, 15,
            13,  8, 10,  1,  3, 15,  4,  2, 11,  6,  7, 12,  0,  5, 14,  9
        ];
        var SBox3 = [
            10,  0,  9, 14,  6,  3, 15,  5,  1, 13, 12,  7, 11,  4,  2,  8,
            13,  7,  0,  9,  3,  4,  6, 10,  2,  8,  5, 14, 12, 11, 15,  1,
            13,  6,  4,  9,  8, 15,  3,  0, 11,  1,  2, 12,  5, 10, 14,  7,
             1, 10, 13,  0,  6,  9,  8,  7,  4, 15, 14,  3, 11,  5,  2, 12
        ];
        var SBox4 = [
             7, 13, 14,  3,  0,  6,  9, 10,  1,  2,  8,  5, 11, 12,  4, 15,
            13,  8, 11,  5,  6, 15,  0,  3,  4,  7,  2, 12,  1, 10, 14,  9,
            10,  6,  9,  0, 12, 11,  7, 13, 15,  1,  3, 14,  5,  2,  8,  4,
             3, 15,  0,  6, 10,  1, 13,  8,  9,  4,  5, 11, 12,  7,  2, 14
        ];
        var SBox5 = [
             2, 12,  4,  1,  7, 10, 11,  6,  8,  5,  3, 15, 13,  0, 14,  9,
            14, 11,  2, 12,  4,  7, 13,  1,  5,  0, 15, 10,  3,  9,  8,  6,
             4,  2,  1, 11, 10, 13,  7,  8, 15,  9, 12,  5,  6,  3,  0, 14,
            11,  8, 12,  7,  1, 14,  2, 13,  6, 15,  0,  9, 10,  4,  5,  3
        ];
        var SBox6 = [
            12,  1, 10, 15,  9,  2,  6,  8,  0, 13,  3,  4, 14,  7,  5, 11,
            10, 15,  4,  2,  7, 12,  9,  5,  6,  1, 13, 14,  0, 11,  3,  8,
             9, 14, 15,  5,  2,  8, 12,  3,  7,  0,  4, 10,  1, 13, 11,  6,
             4,  3,  2, 12,  9,  5, 15, 10, 11, 14,  1,  7, 10,  0,  8, 13
        ];
        var SBox7 = [
             4, 11,  2, 14, 15,  0,  8, 13,  3, 12,  9,  7,  5, 10,  6,  1,
            13,  0, 11,  7,  4,  9,  1, 10, 14,  3,  5, 12,  2, 15,  8,  6,
             1,  4, 11, 13, 12,  3,  7, 14, 10, 15,  6,  8,  0,  5,  9,  2,
             6, 11, 13,  8,  1,  4, 10,  7,  9,  5,  0, 15, 14,  2,  3, 12
        ];
        var SBox8 = [
            13,  2,  8,  4,  6, 15, 11,  1, 10,  9,  3, 14,  5,  0, 12,  7,
             1, 15, 13,  8, 10,  3,  7,  4, 12,  5,  6, 11, 10, 14,  9,  2,
             7, 11,  4,  1,  9, 12, 14,  2,  0,  6, 10, 10, 15,  3,  5,  8,
             2,  1, 14,  7,  4, 10,  8, 13, 15, 12,  9,  9,  3,  5,  6, 11,
        ];
        var SSTransform = (BitArray6, SBox) => {
            var row = (BitArray6[0] << 1) | (BitArray6[5]);
            var col = (BitArray6[1] << 3) | (BitArray6[2] << 2) | (BitArray6[3] << 1) | BitArray6[4];
            return SBox[(row << 4) + col];
        };
        var SBoxSet = [
            SBox1, SBox2, SBox3, SBox4, SBox5, SBox6, SBox7, SBox8
        ];
        var STransform = (BitArray48) => {
            var uint8Array4 = (new Array(8)).fill(0);
            for(var i = 0, j = 0; j < 8; j += 2, i += 12) {
                uint8Array4[j] = SSTransform(BitArray48.slice(i    , i +  6), SBoxSet[j]);
                uint8Array4[j]|= SSTransform(BitArray48.slice(i + 6, i + 12), SBoxSet[j + 1]) << 4;
            }
            return uint8Array4;
        };
        var F = (R, K) => {
            var expandedRXORK = exDBox(R).map((v, i) => {
                return v ^ K[i];
            });
            return straightDBox(STransform(expandedRXORK));
        };
        var padding64 = (uint8Array) => {
            uint8Array.push(0);
            var bytes = uint8Array.length & 0x7;
            uint8Array= uint8Array.concat((new Array(7 - bytes)).fill(0));
            uint8Array.push(9 - bytes);
            return uint8Array;
        };
        var rotateLeftShift = (origBits, bits) => {
            var r = origBits.slice(bits, origBits.length);
            for(let i = 0; i < bits; ++i) {
                r.push(origBits[i]);
            }
            return r;
        };
        //
        DES = function(key) {
            if(this instanceof DES) {
                key = getBytesArray(key);
                if(key.length < 8) {
                    key = key.concat((new Array(8 - key.length).fill(0)));
                }
                this.key = get56Key(key.slice(0, 8));
                //
                this.low28 = this.key.slice(0, 28);
                this.high28= this.key.slice(28, 56);
                this.roundKeys = [];//1: Round[1/2/9/16], 2: others
                for(let i = 0; i < 16; ++i) {
                    let shiftBits = [0, 1, 8, 15].indexOf(i) >= 0 ? 1 : 2;
                    let left = rotateLeftShift(this.low28, shiftBits);
                    let right= rotateLeftShift(this.high28, shiftBits);
                    this.roundKeys.push(Compress56Key48(left.concat(right)));
                }
                Object.freeze(this.key);
                Object.freeze(this.low28);
                Object.freeze(this.high28);
                Object.freeze(this.roundKeys);
            } else {
                return new DES(key);
            }
        };
        //Feistel encryption workflow
        DES.prototype = {
            encrypt: function(plaintext) {
                var uint8Array = getBytesArray(plaintext);
                uint8Array = padding64(uint8Array);
                var len    = uint8Array.length;
                var cipher = [];
                for(let i = 0; i < len; i += 8) {
                    let plaintxt8Uint8Array = uint8Array.slice(i, i + 8);
                    let uint8Array8 = doPerm(plaintxt8Uint8Array, IP);
                    let L = uint8Array8.slice(0, 4);
                    let R = uint8Array8.slice(4, 8);
                    for(let j = 0; j < 16; ++j) {
                        //L XOR F(R, K);
                        L = F(R, this.roundKeys[j]).map((v, i) => {
                            return L[i] ^ v;
                        });
                        [L, R] = [R, L];
                    }
                    uint8Array8 = doPerm(L.concat(R), RIP);
                    cipher = cipher.concat(uint8Array8);
                }
                return YajLib.base64Encode(cipher);
            },
            decrypt: function(cipher) {
                var uint8Array = getBytesArray(YajLib.base64Decode(cipher));
                var len = uint8Array.length;
                var plaintxt = [];
                if(!len || len & 0x7) {
                    return false;
                }
                for(let i = 0; i < len; i += 8) {
                    let cipher8Uint8Array = uint8Array.slice(i, i + 8);
                    let uint8Array8 = doPerm(cipher8Uint8Array, IP);
                    let L = uint8Array8.slice(0, 4);
                    let R = uint8Array8.slice(4, 8);
                    for(let j = 15; j >= 0; --j) {
                        //L XOR F(R, K);
                        R = F(L, this.roundKeys[j]).map((v, i) => {
                            return R[i] ^ v;
                        });
                        [L, R] = [R, L];
                    }
                    uint8Array8 = doPerm(L.concat(R), RIP);
                    plaintxt    = plaintxt.concat(uint8Array8);
                }
                var paddingLen = plaintxt.pop();
                plaintxt = plaintxt.slice(0, plaintxt.length - paddingLen + 1);
                return plaintxt.map((v) => {
                    return String.fromCodePoint(v);
                }).join('');
            }
        };
        //3DES
        TriDES = function(keywords) {
            if(this instanceof TriDES) {
                keywords = getBytesArray(keywords);
                this.keywords = [
                    keywords.slice( 0,  8),
                    keywords.slice( 8, 16),
                    keywords.slice(16, 24)
                ];
                this.desSet = [
                    new DES(this.keywords[0]),
                    new DES(this.keywords[1]),
                    new DES(this.keywords[2])
                ];
                Object.freeze(this.keywords);
                Object.freeze(this.desSet);
                for(let i = 0; i < 3; ++i) {
                    Object.freeze(this.keywords[i]);
                    Object.freeze(this.desSet[i]);
                }
            } else {
                return new TriDES(keywords);
            }
        };
        //
        TriDES.prototype = {
            encrypt: function(plaintxt) {
                var cipher = plaintxt;
                for(let i = 0; i < 3; ++i) {
                    cipher = this.desSet[i].encrypt(cipher);
                }
                return cipher;
            },
            decrypt: function(cipher) {
                var plaintxt = cipher;
                for(let i = 2; i >= 0; --i) {
                    if(false === plaintxt) {
                        break;
                    }
                    plaintxt = this.desSet[i].decrypt(plaintxt);
                }
                return plaintxt;
            }
        };
        YajLib.DES    || (YajLib.DES    = DES);
        YajLib.triDES || (YajLib.triDES = TriDES);
        Object.defineProperties(YajLib, {
            DES   : propertySetting,
            triDES: propertySetting
        });
    })(YajLib);
    var AES;
    ((YajLib) => {
        AES = function(keywords) {
        };
        AES.prototype = {
            encrypt: function(plaintxt) {
            },
            decrypt: function(cipher) {
            }
        };
    })(YajLib);
    var FFT;
    var RFFT;
    ((YajLib) => {
        var Complex = function(real, virtual) {
            if(this instanceof Complex) {
                var _real    = parseFloat(real);
                var _virtual = parseFloat(virtual);
                if(isNaN(_real) || isNaN(_virtual)) {
                    throw 'Invalid parameter real / virtual passed. Complex(' + real + ', ' + virtual + ')';
                }
                [this.real, this.virtual] = [real, virtual];
            } else {
                return new Complex(real, virtual);
            }
        };
        Complex.prototype = {
            getReal: function() {
                return this.real;
            },
            getVirtual: function() {
                return this.virtual;
            },
            add: function(complex, noCopy) {
                var a, b, c, d, e, f, r;
                if(!(complex instanceof Complex)) {
                    throw 'Complex expected but ' + typeof(complex) + ' given';
                }
                [a, b] = [this.getReal(),    this.getVirtual()];
                [c, d] = [complex.getReal(), complex.getVirtual()];
                e = a + c;
                f = b + d;
                if(noCopy) {
                    this.real    = e;
                    this.virtual = f;
                    r = this;
                } else {
                    r = new Complex(e, f);
                }
                return r;
            },
            minus: function(complex, noCopy) {
                var a, b, c, d, e, f, r;
                if(!(complex instanceof Complex)) {
                    throw 'Complex expected but ' + typeof(complex) + ' given';
                }
                [a, b] = [this.getReal(),    this.getVirtual()];
                [c, d] = [complex.getReal(), complex.getVirtual()];
                e = a - c;
                f = b - d;
                if(noCopy) {
                    this.real    = e;
                    this.virtual = f;
                    r = this;
                } else {
                    r = new Complex(e, f);
                }
                return r;
            },
            multiply: function(complex, noCopy) {
                var a, b, c, d, e, f, r;
                if(!(complex instanceof Complex)) {
                    throw 'Complex expected but ' + typeof(complex) + ' given';
                }
                [a, b] = [this.getReal(),    this.getVirtual()];
                [c, d] = [complex.getReal(), complex.getVirtual()];
                e = a * c - b * d;
                f = a * d + b * c;
                if(noCopy) {
                    this.real    = e;
                    this.virtual = f;
                    r = this;
                } else {
                    r = new Complex(e, f);
                }
                return r;
            },
            divide: function(complex, noCopy) {
                var a, b, c, d, e, f, r;
                if(!(complex instanceof Complex)) {
                    throw 'Complex expected but ' + typeof(complex) + ' given';
                }
                [a, b] = [this.getReal(),    this.getVirtual()];
                [c, d] = [complex.getReal(), complex.getVirtual()];
                if(c == 0 && d == 0) {
                    throw 'Divided by ZERO: [' + [a, b] + 'i] / [0, 0i]';
                }
                let g = Math.pow(c, 2) + Math.pow(d, 2);
                e =  a * c + b * d;
                f = -a * d + b * c;
                e /= g;
                f /= g;
                if(noCopy) {
                    this.real    = e;
                    this.virtual = f;
                    r = this;
                } else {
                    r = new Complex(e, f);
                }
                return r;
            }
        };
        //
        FFT = (vector) => {
        };
        YajLib.FFT  || (YajLib.FFT  = FFT);
        YajLib.RFFT || (YajLib.RFFT = RFFT);
        Object.defineProperties(YajLib, {
            FFT : propertySetting,
            RFFT: propertySetting
        });
    })(YajLib);
    window.YY || (window.YY = YajLib);
}(window));
