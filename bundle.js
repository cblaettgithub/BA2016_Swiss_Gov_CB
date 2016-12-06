(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],4:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":2,"./encode":3}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":6,"punycode":1,"querystring":4}],6:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],7:[function(require,module,exports){
/**
 * Created by chris on 24.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    setCurrentUrl: setCurrentUrl,
    setParam:      setParam,
    _currentURL:   _currentURL,
    _queryOutput:  _queryOutput,
    createLink:createLink
}

var _year;
var _dept;
var _supplier;
var _category;
var _total_EDI;
var _total_EDA;
var _width;
var _height;
var _currentURL="Supplier_2016_chord.html";
var _ArrayParams;
var _queryOutput="";
var _ArrayCounter=0;
var myurl="http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_01.html";

var params =
{   year:      "data.csv",dept: "data.csv",     supplier: "data.csv",
    total_EDI: "data.csv",total_EDA: "data.csv",width: "data.csv",
    height:    "data.csv",currentURL: "data.csv"
};
var depts=
{
};
function setCurrentUrl(startUrl){
    _currentURL=startUrl
};


function setParam(dept, supplier, category, year)
{
    console.log("setparam");
    var name="";
    for (var i=0;i<dept.length;i++){
        name="de";
        name+=i;
        depts[name]=dept[i];
        console.log("dept:"+depts[i]);
        name="";
        _ArrayCounter++;
    }

    console.log("l:"+_ArrayCounter);
    if (supplier=0){
        _supplier=0;
       _category=category;
    }
    else{
        _supplier=supplier;
        _category=0;
    }
    _year=year;
}
    /*
    _year=year;
    _supplier=supplier;
    _total_EDI=total_EDI;
    _total_EDA=total_EDA;
    _width=width;
    _height=height;

    params[0]=_year;//params für dept und supplier
    params[1]=_dept;
    params[2]=_supplier;
    params[3]=_total_EDI;
    params[4]=_total_EDA;
    params[5]=_width;
    params[6]=_height;
}
*/
function createLink(){
    console.log("createLink");

    var startappend="?";
    var seperator="=";
    var appender="&";
    var name="";

    _queryOutput=myurl;
    _queryOutput+=startappend;

    for(var i=0;i<_ArrayCounter;i++){
        name="de";
        name+=i;
        _queryOutput+="depts"+seperator+depts[name]+appender;
        console.log("query:"+_queryOutput);
        name="";
    }

    _queryOutput+="supplier="+_supplier;
    _queryOutput+=appender+"cat="+_category;
    _queryOutput+=appender+"year="+_year;

    modul._http_query=_queryOutput;
    console.log(_queryOutput);
}

},{"./Modul":9}],8:[function(require,module,exports){
/**
 * Created by chris on 29.11.2016.
 */

modul =   require('./Modul');

module.exports={
    getDummy_BK:getDummy_BK,
    getDummy_EDA:getDummy_EDA,
    getDummy_EDI:getDummy_EDI,
    getDummy_EFD:getDummy_EFD,
    getDummy_EJPD:getDummy_EJPD,
    getDummy_UVEK:getDummy_EJPD,
    getDummy_VBS:getDummy_VBS,
    getDummy_WBF:getDummy_WBF,
    getSupplier:getSupplier
};

function getDummy_BK(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumBundeskanzelt: d3.sum(v, function(d){return d["Bundeskanzlei"]})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EDA(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDA: d3.sum(v, function(d){return d["1005 EDA"]})
        };})
        .entries(csv);
    return nested_data;
}

function getDummy_EDI(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDI: d3.sum(v, function(d){return d["BAG"]})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EFD(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumEFD: d3.sum(v, function(d) { return d["EZF"]+ d["BIT"]+ d["BBL"]; })
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EJPD(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumBFM: d3.sum(v, function(d) { return d["BFM"]; })
        };})
        .entries(csv);
    return nested_data;
}

function getDummy_UVEK(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumUVEK: d3.sum(v, function(d) { return d["ASTRA"]; })
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_VBS(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumVBS: d3.sum(v, function(d) { return d["ar Beschaffung"]+d["ar Rüstung"]; })
        };})
        .entries(csv);
    return nested_data;
}

function getDummy_WBF(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumWBF: d3.sum(v, function(d) { return d["GS-WBF"]+d["BLW"]+d["Agroscope"]; })
        };})
        .entries(csv);
    return nested_data;
}

function getSupplier(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
        .key(function(d) { return d.dept; })
        .rollup(function(v) { return d3.sum(v, function(d) { return d["1006 EDA"]; }); })
        .entries(csv);
    console.log("getSupplier");
    return nested_data;
}


},{"./Modul":9}],9:[function(require,module,exports){
    /**
     * Created by chris on 24.10.2016.
     */
    var _currentcsv="CSV/BK - 2011.csv";
    var _currentcsv_B="CSV/EDA - 2011.csv";
    var _currentcsv_C="CSV/EDI - 2012.csv";
    var _currentcsv_D="CSV/EFD - 2011.csv";
    var _currentcsv_E="CSV/EJPD - 2011.csv";
    var _currentcsv_F="CSV/UVEK - 2011.csv";
    var _currentcsv_G="CSV/VBS - 2011.csv";
    var _currentcsv_H="CSV/WBF - 2011.csv";
    var _currentjson="CSV/matrix.json";
    var _currentcolor="CSV/Color.csv";
    var _svg;// = d3.select("svg");
    var _width;
    var _height;
    var _outerRadius;
    var _innerRadius;
    var _layout;
    var _path;
    var _arc;
    var _groupPath;
    var _group;
    var _groupText;
    var _chord;
    var _formatPercent;
    var _transform_width;
    var _transform_height;
    var _group_x;
    var _group_dy;
    var _matrix;
    var _supplier;
    var _color;
    var _dept;
    var _ds_supplier;
    var _ds_dept;
    var _ds_cost;
    var _ds_supplier_EDI;
    var _ds_supplier_EDA;
    var _ds_supplier_BK;
    var _ds_supplier_EJPD;
    var _ds_supplier_EFD;
    var _ds_supplier_UVEK;
    var _ds_supplier_VBS;
    var _ds_supplier_WBF;
    var _v_choice="EDA_EDI_2011";//default
    var _vhttp="http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord.html";
    var _http_query="";
    var _vmodus="default";
    var _error_counter=0;
    var _countDep=1;
    /*creatinglinks*/

    module.exports ={
        _currentcsv:_currentcsv,
        _currentcsv_B:_currentcsv_B,
        _currentcsv_C:_currentcsv_C,
        _currentcsv_D:_currentcsv_D,
        _currentcsv_E:_currentcsv_E,
        _currentcsv_F:_currentcsv_F,
        _currentcsv_G:_currentcsv_G,
        _currentcsv_H:_currentcsv_H,
        _currentjson:_currentjson,
        _currentcolor:_currentcolor,
        _svg:_svg,
        _width:_width,
        _width:_width,
        _height:_height,
        _outerRadius:_outerRadius,
        _innerRadius:_innerRadius,
        _layout:_layout,
        _path:_path,
        _arc:_arc,
        _groupPath:_groupPath,
        _group:_group,
        _groupText:_groupText,
        _chord:_chord,
        _formatPercent:_formatPercent,
        _transform_width:_transform_width,
        _transform_height:_transform_height,
        _group_x:_group_x,
        _group_dy:_group_dy,
        _matrix:_matrix,
        _supplier:_supplier,
        _color:_color,
        _dept:_dept,
        _ds_supplier:_ds_supplier,
        _ds_dept:_ds_dept,
        _ds_cost:_ds_cost,
        _ds_supplier_EDI    :_ds_supplier_EDI,
        _ds_supplier_EDA    :_ds_supplier_EDA,
        _ds_supplier_BK     :_ds_supplier_BK,
        _ds_supplier_EJPD   :_ds_supplier_EJPD,
        _ds_supplier_EFD    :_ds_supplier_EFD,
        _ds_supplier_UVEK   :_ds_supplier_UVEK,
        _ds_supplier_VBS    :_ds_supplier_VBS,
        _ds_supplier_WBF    :_ds_supplier_WBF,
        _v_choice:_v_choice,
        _vhttp:_vhttp,
        _vmodus:_vmodus,
        _error_counter:_error_counter,
        _countDep:_countDep,
        _http_query:_http_query
    };
},{}],10:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
//7
modul =   require('./Modul');

/*var SettingData = require('./SettingDatas.js');
_maindata = new SettingData();*/

module.exports = {
    selectchords:selectchords
}

function selectchords() {
    modul._chord = modul._svg.selectAll(".chord")
        .attr("class", "chord")
        .data(modul._layout.chords)
        .enter().append("path")
        .attr("d",  modul._path, function(d){return d.supplier})
        .style("fill", function (d) {
            //return modul._supplier[d.source.index].color;
            return modul._color[d.source.index].color;
        })
        .style("opacity", 1);
}
},{"./Modul":9}],11:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');

/*var SettingData = require('./SettingDatas.js');
var _maindata = new SettingData();*/

module.exports ={
    neighborhood:neighborhood,
    groupPath:groupPath,
    groupText:groupText,
    grouptextFilter:grouptextFilter,
    mouseover:mouseover

}
function neighborhood() {//Länderbogen
    console.log("neighbor");
    modul._group = modul._svg.selectAll("g.group")
        .data(modul._layout.groups)
        .enter().append("svg:g")
        .attr("class", "group")
        .on("mouseover", mouseover)     //darüber fahren
        .on("mouseout", mouseout) ;    //darüber fahren

}
function groupPath() {//in länderbogen einsetzen
    modul._groupPath =  modul._group.append("path")
        .attr("id", function (d, i) {
            return "group" + i;
        })
        .attr("d", modul._arc)
        .style("fill", function (d, i) {//Farbe um Bogen
            return modul._color[i].color;
        });
}
function groupText() {//den länderbogen beschriften
    modul._groupText = modul._group.append("svg:text")
        .attr("x", modul._group_x)//6
        .attr("class", "supplier")
        .attr("dy", modul._group_dy);//bro15

    /*if (modul._EDA_csv_ = "csv/" + "Dummy_EDA.csv") {*/
        modul._groupText.append("svg:textPath")
            .attr("xlink:href", function (d, i) {
                return "#group" + d.index;
            })
            .text(function (d, i) {
                console.log(modul._supplier[i].key);
                return modul._supplier[i].key;
            })

            //return modul._ds_supplier[i].key;//Spaltenüberschriften
         // modul._ds_supplier[i].values[0].key ="EDA"
            // modul._ds_supplier[i].values[0].values = 20000(summe)

    function groupTicks(d) {
        var k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, 1000000).map(function (v, i) {
            return {
                angle: v * k + d.startAngle,
                label: i % modul._countDep != 0 ? null : v / 1000000 + "m"
            };//3//
        });
    }
    var g = modul._svg.selectAll("g.group")
    var ticks =g.selectAll("g")
        .data(groupTicks)
        .enter().append("g")
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + modul._outerRadius + ",0)";
        });

    ticks.append("line")
        .attr("x1", 1)
        .attr("y1", 0)
        .attr("x2", 5)
        .attr("y2", 0)
        .style("stroke", "#000");

    ticks.append("text")
        .attr("x", 6)
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return d.angle > Math.PI ?
                "rotate(180)translate(-16)" : null;
        })
        .style("text-anchor", function(d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .text(function(d) { return d.label; });
}

function grouptextFilter() {
    modul._groupText.filter(function (d, i) {
            return modul._groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength();
        })
        .remove();
}

function mouseover(d, i) {
    modul._chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
    })
    .transition()
    .style("opacity", 0.1);
}
function mouseout(d, i) {
    modul._chord.classed("fade", function(p) {
            return p.source.index != i
                && p.target.index != i;
        })
        .transition()
        .style("opacity", 1);
}




},{"./Modul":9}],12:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */

modul =   require('./Modul');
DataManager = require('./DataManager');

module.exports={
    readcsv:readcsv
}

function readcsv(data, data_B,data_C,data_D,data_E, data_F,data_G,data_H ,matrix)  {
    console.log(modul._error_counter+" readcsv");
    modul._error_counter++;
    var supplier;
    var csvall;
    var filtercontent;
    console.log(modul._error_counter+" " +modul._v_choice);
    //compareCSV(data, data_B,data_C,data_D, "fullCategory");
    switch (modul._v_choice){
        case "EDA_EDI_2011"://EDA 2011, EDI 2011
        case "EDA_EDI_2012"://EDA 2012, EDI 2011
        case "EDA_EDI_2013"://EDA 2013, EDI 2011
        case "EDA_EDI_2014"://EDA 2014, EDI 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA,modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
            break;
        case "BK_EDI_2011"://BK EDA 2011,
        case "BK_EDI_2012"://BK EDA 2012,
        case "BK_EDI_2013"://BK EDA 2013,
        case "BK_EDI_2014"://BK EDA 2014,
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumEDA","sumBundeskanzelt"]);
            break;
        case "BK_EDA_EDI_2011"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Tri"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Trivadis AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Hardware","SW-Pflege und HW Wartung",
            "Informatik-DL exkl. Personalverleih im Bereich IKT"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat_2"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
                "Beratungs-DL für Management und Organisation sowie Coaching",
                "SW-Pflege und HW Wartung"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat_3"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Postdienste","Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
                "Hardware"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_EJPD_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Informationsarbeit","Informatik-DL exkl. Personalverleih im Bereich IKT",
                "Hardware","Postdienste"]; //jedes data ein departement, mindesten 4 pro dept
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            data_D =filter(data_D,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_D, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI,modul._ds_supplier_EJPD]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI", "sumBFM"]);
            break;
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
                "Universal-Job AG","Dell SA","DHL Express (Schweiz) AG","Allianz Suisse Versicherungs-Gesellschaft"
            ];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            data_D =filter(data_D,filtercontent, "supplier");
            data_E =filter(data_E, filtercontent, "supplier");
            data_F=filter(data_F,filtercontent, "supplier");
            data_G =filter(data_G,filtercontent, "supplier");
            data_H =filter(data_H,filtercontent, "supplier");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            modul._ds_supplier_EFD= DataManager.getDummy_EFD(data_D, "supplier");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_E, "supplier");
            modul._ds_supplier_UVEK= DataManager.getDummy_UVEK(data_F, "supplier");
            modul._ds_supplier_VBS= DataManager.getDummy_VBS(data_G, "supplier");
            modul._ds_supplier_WBF= DataManager.getDummy_WBF(data_H, "supplier");
            checkCountRowsSupplier();//check if exist 8 rows per departement(matrix)
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI, modul._ds_supplier_EFD,
                modul._ds_supplier_EJPD, modul._ds_supplier_UVEK, modul._ds_supplier_VBS, modul._ds_supplier_WBF,
            ]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumBundeskanzelt", "sumEDA",
                ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                    "sumBFM", "sumUVEK", "sumVBS", "sumWBF"]);
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= DataManager.getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            modul._supplier= modul._ds_supplier_EDA;
            break;
        case "Dummy":
            var dummyEDA=DataManager.getDummy_EDA(data, "supplier");
            var dummyEDI=DataManager.getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([dummyEDA, dummyEDI]);
            //modul._ds_supplier = matrix_dummay_All(csvall);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
            break;
        default:
            console.log("readcsv:default");
            modul._ds_supplier    = DataManager.getSupplier(modul._supplier, "supplier");//nest
            supplier = matrix_Supplier(data);
            modul._ds_dept        = DataManager.getDep(modul._supplier, "dept");
            modul._ds_cost        = DataManager.getCost(modul._supplier, "EDA_1006");
            modul._matrix = matrix;
    }
    console.log("setmatrix");
}
function filter(data, param, filtername){
    console.log(modul._error_counter+" filter");
    modul._error_counter++;
   /* if (param.length==2){
        return data.filter(function(row) {
            if (row[filtername] == param[0]
                ||  row[filtername] == param[1]
               )
            {  return row;  }
        });
    }
    else  if (param.length==3){
        return data.filter(function(row) {
            if (row[filtername] == param[0]
                ||  row[filtername] == param[1]
                ||  row[filtername] == param[2])
            {  return row;    }
        });*/
    return data.filter(function(row) {
        for (var i=0;i< param.length;i++) {
            if (row[filtername]== param[i])
                return row;
        }
        });
}
function matrix_Supplier(data) {
        var matrix = [];
        var counter=0;
        //modul._ds_supplier[i].values[0].key ="EDA"
        var supplier = d3.keys(data[0]).slice(1);
        //Spaltenüberschriften
        data.forEach(function (row) {
            if (counter < 2) {
                var mrow = [];
                supplier.forEach(function (c) {
                    if (c == "1005 EDA")
                        mrow.push(Number(row[c]));
                    if (c == "1006 EDA")
                        mrow.push(Number(row[c]))
                });
                counter++;
                matrix.push(mrow);
                console.log("push");
            }
        });
        modul._matrix = matrix;
        return supplier;
    }

function checkCountRowsSupplier( ){
    console.log("method:checkCountRowsSupplier");
    var diff=0;
    var countdept=8;

    var supplierarray=[modul._ds_supplier_BK,
    modul._ds_supplier_EDA,
    modul._ds_supplier_EDI,
    modul._ds_supplier_EFD,
    modul._ds_supplier_EJPD,
    modul._ds_supplier_UVEK,
    modul._ds_supplier_VBS,
    modul._ds_supplier_WBF];

    supplierarray.forEach(function(rows) {
        var keyzahl=100;
        var nodeName ="nodename";
        var newGroup = 100;

        if (rows.length   < countdept){
          diff=countdept-(rows.length);
          for (var i=0;i<diff;i++){
              keyzahl+=i;
              //rows.push({key:keyzahl, values:["null"]});
              //rows.push( {"values":{"name":nodeName,"group":newGroup}});
              rows.push({key:keyzahl, values:[{key:"null"}]});//objekt mit einem array wo ein objekt ist
          }
      }
    });
}

function matrix_Supplier_EDI(data, end) {
    //Fill Matrix EDA
    var matrix = [];
    var counter=0;
    var supplier = d3.keys(data[0]);
    //Spaltenüberschriften
    data.forEach(function (row) {
        if (counter < end) {
            var mrow = [];
            mrow.push(row.values["sumGSEDI"]);
            mrow.push(row.values["sumEBG"]);
            mrow.push(row.values["sumBAR"]);
            mrow.push(row.values["sumBAK"]);
            mrow.push(row.values["sumMeteoCH"]);
            mrow.push(row.values["sumBAG"]);
            mrow.push(row.values["sumBFS"]);
            mrow.push(row.values["sumBSV"]);
            mrow.push(row.values["sumSBF"]);
            mrow.push(row.values["sumNB"]);
            counter++;
            matrix.push(mrow);
            console.log("push");
        }
    });
    console.log("matrix_Supplier_EDA");
    modul._matrix = matrix;
    return supplier;
}

function compareCSV(dataA, dataB, dataC,dataD, field) {
    var mrow = [];
    for (var i = 0; i < dataA.length; i++) {
        for (var j = 0; j < dataB.length; j++) {
            if (dataA[i][field] == dataB[j][field]) {
                for (var k = 0; k < dataC.length; k++) {
                    if (dataA[i][field] == dataC[k][field])
                        for (var l = 0; l < dataD.length; l++) {
                            if (dataA[i][field] == dataD[l][field]){
                                if (mrow.length < 4){
                                    mrow.push(dataA[i][field]);
                                }
                                else{
                                    if (checkexistRow(mrow, dataA[i][field]))
                                        mrow.push(dataA[i][field]);
                                }
                            }
                        }
                }
            }
        }
    }
    console.log("***********Result:compare CSV");
    console.log("***********"+field);
    for (var i = 0; i < mrow.length; i++)
        console.log(mrow[i]);
}
function checkexistRow(mrow, onerow){
    /*if (mrow.length>2)
     if (checkexistRow(mrow, dataC[k][field]))
     mrow.push(dataA[i][field]);*/
    var check=true;
   if (mrow.length > 1){
       for(var i=0;i<mrow.length;i++){
           if (mrow[i]==onerow){
               check=false;
           }
       }
   }
    return check;
}

function matrix_EDI_EDA(DataEDI_EDA, Name_sumEDA, Name_sumEDI, Names_sumsEDA_EDI_BK){
    console.log(modul._error_counter+" matrix_EDI_EDA files");
    modul._error_counter++;
    var matrix = [];
    var supplier="";
    var minus=4000000;
    var length = DataEDI_EDA.length;
    var totallength = (length/(Names_sumsEDA_EDI_BK.length))*2;
    var middle= d3.round(length/Names_sumsEDA_EDI_BK.length);
    var vobjectid=0;
    if (Names_sumsEDA_EDI_BK.length==8){
        totallength=16;
        middle=totallength/2;
    };

    //Array filtern
    for (var i=0;i<totallength;i++ ){
        var mrow=[];
        if (i==middle)
            vobjectid=0;
        if (i < middle){
            for(var j=0;j<middle;j++)
                mrow.push(0);
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid ));
                vobjectid++;
            }
        }
        else{
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid));
                vobjectid++;
            }
            for(var j=0;j<middle;j++)
                mrow.push(0);
        }
        matrix.push(mrow);
    }
    modul._matrix = matrix;
    while(modul._supplier.length > 0)
         modul._supplier.pop();
    createSupplierList(DataEDI_EDA,Names_sumsEDA_EDI_BK );

    console.log(modul._error_counter+" matrix_EDI_EDA");
    modul._error_counter++;
    return supplier;
}

function createSupplierList(dataRows, supplier_field){
    console.log(modul._error_counter+" createSupplierList");
    modul._error_counter++;
    var v_Supplier=supplier_field.length;
    var i=0;
    var end;
    if (v_Supplier==4){
        end=v_Supplier*3;
    }
    else{
        end=v_Supplier*2;
    }
    console.log("createSupplierList:"+end);

    //first dept
    if (end==4){
        while( i<end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;//+4
        }
        //second supplier
        for (var i=0;i<v_Supplier; i++){
            modul._supplier.push(dataRows[i]);
        }
    }
    else if (end==6 || end==12){
        while( i<=end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
        //second supplier
        for (var i=0;i<v_Supplier; i++){
            modul._supplier.push(dataRows[i]);
        }
    }
    else{//test
        supplierlabel();
    }

    //8 depte
    console.log(modul._error_counter+" createSupplierList "+"supplier");
    modul._error_counter++;
}
function supplierlabel(){

     var filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
        "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
        "Universal-Job AG","Dell SA","DHL Express (Schweiz) AG","Allianz Suisse Versicherungs-Gesellschaft"
    ];
    var dept=["BK", "EDI","EDA","EFD","EJPD","UVEK","VBS", "WBK"];

   //dept
    for (var i=0;i<8;i++){
        elements={"key":dept[i], "values":[dept[i], 20]};
        modul._supplier.push(elements);
    };

    //supplier
    for (var i=0;i<8;i++){
        modul._supplier.push(filtercontent[i]);
    }
}
function getMatrixValue(row,nameValue, counter){
    var depName;    //get Fieldname sum of each Department
    var result=0;
    if (nameValue.length==2) {
        switch (counter) {//2 Supplier
            case 0:
            case 1:
                depName = nameValue[0];
                break;
            case 2:
            case 3:
                depName = nameValue[1];
                break;
            default:
        }
    }
      else if (nameValue.length==3){
            switch(counter){//3 Supplier
                case 0:
                case 1:
                case 2:
                    depName=nameValue[0];
                    break;
                case 3:
                case 4:
                case 5:
                    depName=nameValue[1];
                    break;
                case 6:
                case 7:
                case 8:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
        else if(nameValue.length==4)        {
            switch(counter){//4 Supplier
                case 0:
                case 1:
                case 2:
                case 3:
                    depName=nameValue[0];
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                    depName=nameValue[1];
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    depName=nameValue[2];
                    break;
                case 12:
                case 13:
                case 14:
                case 15:
                    depName=nameValue[3];
                    break;
                default:
            }
        }
        else if (nameValue.length==8){
          if (counter <8){
              depName=nameValue[0];
          }
          else if (counter < 16){
              depName=nameValue[1];
          }
          else if (counter < 24){
              depName=nameValue[2];
          }
          else if (counter < 32){
              depName=nameValue[3];
          }
          else if (counter < 40){
              depName=nameValue[4];
          }
          else if (counter < 48){
              depName=nameValue[5];
          }
          else if (counter < 56){
              depName=nameValue[6];
          }
          else{
              depName=nameValue[7];
          }
    }
       if (row.values[0].key!="null"){
            result=d3.round(row.values[0].value[depName]);
        }
     return result;
}
function matrix_Supplier_EDA(data, end) {
    //Fill Matrix EDA
    var matrix = [];
    var counter=0;
    var supplier = d3.keys(data[0]);

    //Spaltenüberschriften
    data.forEach(function (row) {
        if (counter < end) {
            var mrow = [];
            mrow.push(row.values["sumEDA1005"]);
            mrow.push(row.values["sumEDA1006"]);
            mrow.push(row.values["sum1097"]);
            mrow.push(row.values["sum1112"]);
            counter++;
            matrix.push(mrow);
            console.log("push");
        }
    });
    modul._matrix = matrix;
    console.log("matrix_Supplier_EDI");
    return supplier;
}

function mergingFiles(csvFiles) {
    console.log(modul._error_counter  +" merging files");
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    modul._error_counter++;
    return output;
}


},{"./DataManager":8,"./Modul":9}],13:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    createArc:createArc,
    layout:layout,
    path:path,
    setSVG:setSVG,
    appendCircle:appendCircle,
    movesvg:movesvg,
    startqueue:startqueue
}

function createArc(){
    modul._arc = d3.svg.arc()
        .innerRadius(modul._innerRadius)
        .outerRadius(modul._outerRadius)
    console.log("createArc");
}
//3
function layout(){//padding 0.04 abstand 4%
    modul._layout = d3.layout.chord()
        .padding(.04)
        .sortSubgroups(d3.descending)
        .sortChords(d3.ascending);
    console.log("layout");
}
//4
function path(){
    modul._path = d3.svg.chord()
        .radius(modul._innerRadius);
    console.log("path");
}
//5
function setSVG(){
    modul._svg = d3.select("body").append("svg")
        .attr("width", modul._width)
        .attr("height",modul._height)
        .append("g")
        .attr("id", "circle")
        .attr("transform", "translate(" + modul._width / 2 + "," + modul._height / 2 + ")");
}


//6
function appendCircle(){
    modul._svg.append("circle")
        .attr("r",modul._outerRadius);
    console.log("appendCircle");
}
//14
function movesvg(){
    modul._svg = d3.select("body").append("svg")
        .attr("width", modul._width)
        .attr("height", modul._height)
        .append("g")
        .attr("transform", "translate("+modul._width+","+modul._height+")");
    console.log("movesvg");
}
function startqueue(csv_name, json_name){
    queue()
        .defer(d3.csv, csv_name)
        .defer(d3.json, json_name)
        .await(keepData);//only function name is needed
}
},{"./Modul":9}],14:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');
module.exports={
    createTitle:createTitle
}
 function createTitle() {
     modul._chord.append("title").text(function (d) {
        return modul._supplier[d.source.index].supplier
            + " → " + modul._supplier[d.target.index].supplier
            + ": " + modul._formatPercent(d.source.value)
            + "\n" + modul._supplier[d.target.index].supplier
            + " → " + modul._supplier[d.source.index].supplier
            + ": " +modul._formatPercent(d.target.value);
    });
}
},{"./Modul":9}],15:[function(require,module,exports){
(function (global){
/**
 * Created by chris on 25.10.2016.
 */
//start file//
"use strict";
    var modul =   require('./Javascripts/Modul');
//var SettingData = require('./Javascripts/SettingData');
    var SettingLayout = require('./Javascripts/SettingLayout');
    var SettingChords = require('./Javascripts/SettingChords');
    var SettingInput  = require('./Javascripts/SettingInput');
    var SettingGroups = require('./Javascripts/SettingGroups');
    var SettingTitle = require('./Javascripts/SettingTitle');
    var CreatingLinks = require('./Javascripts/CreatingLinks');
    var DataManager = require('./Javascripts/DataManager');
    var q;
    var url = require('url') ;
    var parse = require('url-parse');
    //var myquerystring = require('querystring');

global.startwithLink=function(choice, content, choice_C, loc){
    console.log("svg.remove()");
    d3.select("svg").remove();
    console.log("*****************************************************************************************");
    console.log("");
    modul._error_counter=0;
    console.log(modul._error_counter+" start with Link:"+choice+" "+content+" "+choice_C);
    modul._error_counter++;
    if (content !=null)
        modul._v_choice=content;
    startingwithQuery(modul._v_choice);
};
/*global.starturlmodus=function(loc){
    var parsed =parse(loc);
    var parts=url.parse("'"+loc+"'", true);
    parsed.set('hostname', 'yahoo.com');

    console.log("Location "+loc);
    console.log("Parsed "+parsed);
    console.log("Url formats"+url.format(parts));

    var queryObject = url.parse("'"+loc+"'",true).query;//get querystring
    console.log(queryObject);
    create_choicevariable(queryObject);
    //erstellt den vchoice string
};*/
function create_choicevariable(queryobjects){
    //'EDA_EDI_2011':
    var temp;

    //modul._vchoice="";
}
    // CreateLink
global.startcreatinglink=function(dept, supplier, category, year){
    console.log(modul._error_counter+" start creatinglink");
    CreatingLinks.setCurrentUrl("hostname");
    CreatingLinks.setParam(dept,supplier, category, year);
    CreatingLinks.createLink();

    //return modul._http_query;
    //return modul._vhttp+"?choice="+modul._v_choice;
};

//starting with choiced csv-fils
global.startprocessglobal = function(choice,content, content_B,content_C,content_D) {
    console.log(modul._error_counter+" startprocessglobal");
    modul._currentcsv="";
    modul._v_choice=choice;
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);
    process(content, content_B,content_C,content_D);
};

//changing width, height, outer radius per html
global.startprocessDesign=function(content, name, width, height, radius_i, radius_o){
    console.log(modul._error_counter+" startprocessDesign");
    modul._error_counter++;
    modul._currentcsv="";
    console.log("process:design"+content);
    console.log(width +" "+ height +" " +radius_o);
    settingParam(0, 0, width, height, 6, 15, 0, radius_o);
    process(content);
};
function hasFile(filename, filename_B, filename_C, filename_D,filename_E, filename_F, filename_G, filename_H){
    if (filename_C!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_C="csv/"+filename_C;
        modul._countDep=2;
    }
    if (filename_D!=0){
        modul._currentcsv_D="csv/"+filename_D;
        modul._countDep=3;
    }
    if (filename_E!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_E="csv/"+filename_E;
        modul._countDep=8;
    }
    if (filename_F!=0){
        modul._currentcsv_F="csv/"+filename_F;
        modul._countDep=8;
    }
    if (filename_G!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_G="csv/"+filename_G;
        modul._countDep=8;
    }
    if (filename_H!=0){
        modul._currentcsv_H="csv/"+filename_H;
        modul._countDep=8;
    }
}
function process(filename, filename_B, filename_C, filename_D) {
    modul._svg=d3.select("svg").remove();
    modul._svg = d3.select("svg");
    console.log(modul._error_counter+" process:main");
    modul._error_counter++;
    //default
    modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;

    hasFile(filename, filename_B, filename_C, filename_D, 0, 0, 0, 0);
    console.log(" process "+filename+" "+ filename_B+" "+ filename_C+" "+ filename_D);
    SettingLayout.createArc();
    SettingLayout.layout();
    SettingLayout.path();
    SettingLayout.setSVG();
    //SettingLayout.movesvg();
    SettingLayout.appendCircle();
    console.log("process:defer:"+modul._currentcsv);
    var test=0; //0 normal, 1 kummulation
    console.log("choice modus:"+modul._vmodus);
    if (modul._vmodus=="default"){//each year
        q= d3.queue()
        q
            .defer(d3.csv, modul._currentcsv)
            .defer(d3.csv, modul._currentcsv_B)
            .defer(d3.csv, modul._currentcsv_C)
            .defer(d3.csv, modul._currentcsv_D)
            .defer(d3.csv, modul._currentcsv_E)
            .defer(d3.csv, modul._currentcsv_F)
            .defer(d3.csv, modul._currentcsv_G)
            .defer(d3.csv, modul._currentcsv_H)
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .await(SettingsB)
    }
    else{ //2011 - 2014//kummulation
        var csv="csv/";
        var supplierA=[csv+"BK - 2011.csv",csv+"BK - 2012.csv",csv+"BK - 2013.csv",csv+"BK - 2014.csv"];
        var supplierB=[csv+"EDI - 2011.csv",csv+"EDI - 2012.csv",csv+"EDI - 2013.csv",csv+"EDI - 2014.csv"];
        //var supplierC=[csv+"EDA - 2011.csv",csv+"EDA - 2012.csv",csv+"EDA - 2013.csv",csv+"EDA - 2014.csv"];
        q= d3.queue()
        q
            .defer(d3.csv, supplierA[0])
            .defer(d3.csv, supplierA[1])
            .defer(d3.csv, supplierA[2])
            .defer(d3.csv, supplierA[3])
            .defer(d3.csv, supplierB[0])
            .defer(d3.csv, supplierB[1])
            .defer(d3.csv, supplierB[2])
            .defer(d3.csv, supplierB[3])
            /*.defer(d3.csv, supplierC[0])
            .defer(d3.csv, supplierC[1])
            .defer(d3.csv, supplierC[2])
            .defer(d3.csv, supplierC[3])*/
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .await(settingsC)
    }
}
function SettingsB(error, m_supplier,  m_supplier_B, m_supplier_C,m_supplier_D,
                   m_supplier_E,  m_supplier_F, m_supplier_G,m_supplier_H,
                   matrix, color)
{
    console.log(modul._error_counter+" SettingsB");
    modul._error_counter++;
    modul._supplier=m_supplier;//Länderbogennamenn setzen
    SettingInput.readcsv(m_supplier, m_supplier_B, m_supplier_C,m_supplier_D,
    m_supplier_E,  m_supplier_F, m_supplier_G,m_supplier_H,matrix);//Fill DS-Supplier + DS-Dept, Matrix
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);
    Setting_theMethods();
}

function settingsC(error, m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014,
                m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014,
                matrix, color){
    console.log(modul._error_counter+" SettingsC");
    modul._error_counter++;
    modul._supplier=m_supplier_2011;//Länderbogennamenn setzen
    //Merging 2011 - 2014

    //test only 2012/2013
    SettingInput.readcsv(mergingFiles([m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014]),
    mergingFiles([m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014]),
        mergingFiles([m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014])
    ,matrix);
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);
    Setting_theMethods();
}
function Setting_theMethods()
{
    SettingGroups.neighborhood();
    SettingGroups.groupPath();
    SettingGroups.groupText();
    SettingGroups.grouptextFilter();
    SettingChords.selectchords();
    SettingTitle.createTitle();
}
//Setting Params
function settingParam(trans_width, trans_height, width, height,
                      group_x, group_dy,radius_i, radius_o) {
    modul._transform_width = trans_width;
    modul._transform_height = trans_height;
    modul._width = width;
    modul._height = height;
    //Radius
    if (radius_o==0){
        modul._outerRadius = Math.min(modul._width, modul._height) / 2 - 10;
        modul._innerRadius = modul._outerRadius - 24;
    }
    else{
        modul._outerRadius = Math.min(modul._width, modul._height) / 2 - 10;
        modul._innerRadius = radius_o - 24;
    }
    //percentrage
    modul._formatPercent = d3.format(".1%");
    //seeting inpu
    modul._group_x = group_x;
    modul._group_dy = group_dy;
}
function get_requestParam(csvfile,  dep){

}
function startingwithQuery(content){
    console.log(modul._error_counter+" starting with Query");
    modul._error_counter++;
    if (content=="BK_EDI_All")
        modul._vmodus="BK_EDI_cumulation";
    else
        modul._vmodus="default";

    switch(content) {//EDA-EDI 2011- 2014
        case 'EDA_EDI_2011':
            startprocessglobal("EDA_EDI_2011","EDA - 2011.csv","EDI - 2011.csv", 0,0);
            break;
        case 'EDA_EDI_2012':
            startprocessglobal("EDA_EDI_2012","EDA - 2012.csv","EDI - 2012.csv", 0,0);
            break;
        case 'EDA_EDI_2013':
            startprocessglobal("EDA_EDI_2013","EDA - 2013.csv","EDI - 2013.csv",0, 0);
            break;
        case 'EDA_EDI_2014':
            startprocessglobal("EDA_EDI_2014","EDA - 2014.csv","EDA - 2014.csv",0,0);
            break;

            //BK EDI 2011 - 2014
        case 'BK_EDI_2011':
            startprocessglobal("BK_EDI_2011","BK - 2011.csv","EDA - 2011.csv",0,0);
            break;
        case 'BK_EDI_2012':
            startprocessglobal("BK_EDI_2012","BK - 2012.csv","EDA - 2012.csv",0,0);
            break;
        case 'BK_EDI_2013':
            startprocessglobal("BK_EDI_2013","BK - 2013.csv","EDA - 2013.csv",0,0);
            break;
        case 'BK_EDI_2014':
            startprocessglobal("BK_EDI_2014","BK - 2014.csv","EDA - 2014.csv",0,0);
            break;
        case 'BK_EDI_All':
            startprocessglobal("BK_EDI_2014","BK - 2014.csv","EDA - 2014.csv",0,0);
            break;

            //BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011":
            startprocessglobal("BK_EDA_EDI_2011","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", 0);
            break;
        case  "BK_EDA_EDI_2012":
            startprocessglobal("BK_EDA_EDI_2012","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013":
            startprocessglobal("BK_EDA_EDI_2013","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014":
            startprocessglobal("BK_EDA_EDI_2014","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //BK EDA EDI 2011 - 2014 Tri
        case  "BK_EDA_EDI_2011_Tri":
            startprocessglobal("BK_EDA_EDI_2011_Tri","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Tri":
            startprocessglobal("BK_EDA_EDI_2012_Tri","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Tri":
            startprocessglobal("BK_EDA_EDI_2013_Tri","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Tri":
            startprocessglobal("BK_EDA_EDI_2014_Tri","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

            //Cat BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011_Cat":
            startprocessglobal("BK_EDA_EDI_2011_Cat","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat":
            startprocessglobal("BK_EDA_EDI_2012_Cat","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat":
            startprocessglobal("BK_EDA_EDI_2013_Cat","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat":
            startprocessglobal("BK_EDA_EDI_2014_Cat","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //Cat BK EDA EDI 2011 - 2014 2
        case  "BK_EDA_EDI_2011_Cat_2":
            startprocessglobal("BK_EDA_EDI_2011_Cat_2","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat_2":
            startprocessglobal("BK_EDA_EDI_2012_Cat_2","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat_2":
            startprocessglobal("BK_EDA_EDI_2013_Cat_2","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat_2":
            startprocessglobal("BK_EDA_EDI_2014_Cat_2","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //Cat BK EDA EDI 2011 - 2014 3
        case  "BK_EDA_EDI_2011_Cat_3":
            startprocessglobal("BK_EDA_EDI_2011_Cat_3","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat_3":
            startprocessglobal("BK_EDA_EDI_2012_Cat_3","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat_3":
            startprocessglobal("BK_EDA_EDI_2013_Cat_3","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat_3":
            startprocessglobal("BK_EDA_EDI_2014_Cat_3","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

            //dummy
        case  "Dummy":
            startprocessglobal("Dummy","Dummy_EDA.csv","Dummy_EDI.csv",0,0);
            break;

        //Cat BK EDA EDI EJPD 2011 - 2014
        case  "BK_EDA_EDI_EJPD_2011_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2011_Cat","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "EJPD - 2011.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2012_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2012_Cat","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "EJPD - 2012.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2013_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2013_Cat","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "EJPD - 2013.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2014_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2014_Cat","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "EJPD - 2014.csv");
            break;
        default:

        //BK EDA EDI EFD EJPD UVEK VBS WBF 2011
        case  "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
             "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
            );
            break;
    }
}
function mergingFiles(csvFiles) {
    console.log(modul._error_counter + " merging files");
    modul._error_counter++;
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    return output;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Javascripts/CreatingLinks":7,"./Javascripts/DataManager":8,"./Javascripts/Modul":9,"./Javascripts/SettingChords":10,"./Javascripts/SettingGroups":11,"./Javascripts/SettingInput":12,"./Javascripts/SettingLayout":13,"./Javascripts/SettingTitle":14,"url":5,"url-parse":18}],16:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?&]+)=?([^&]*)/g
    , result = {}
    , part;

  //
  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
  // the lastIndex property so we can continue executing this loop until we've
  // parsed all results.
  //
  for (;
    part = parser.exec(query);
    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
  );

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = [];

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (var key in obj) {
    if (has.call(obj, key)) {
      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;

},{}],17:[function(require,module,exports){
'use strict';

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
module.exports = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

},{}],18:[function(require,module,exports){
'use strict';

var required = require('requires-port')
  , lolcation = require('./lolcation')
  , qs = require('querystringify')
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @return {ProtocolExtract} Extracted information.
 * @api private
 */
function extractProtocol(address) {
  var match = protocolre.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: !!match[2],
    rest: match[3]
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @api private
 */
function resolve(relative, base) {
  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} location Location defaults for relative paths.
 * @param {Boolean|Function} parser Parser for the query string.
 * @api public
 */
function URL(address, location, parser) {
  if (!(this instanceof URL)) {
    return new URL(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (!extracted.slashes) instructions[2] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];
    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if (index = parse.exec(address)) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL}
 * @api public
 */
URL.prototype.set = function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
      url.pathname = value.length && value.charAt(0) !== '/' ? '/' + value : value;

      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
};

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String}
 * @api public
 */
URL.prototype.toString = function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
};

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
URL.extractProtocol = extractProtocol;
URL.location = lolcation;
URL.qs = qs;

module.exports = URL;

},{"./lolcation":19,"querystringify":16,"requires-port":17}],19:[function(require,module,exports){
(function (global){
'use strict';

var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 }
  , URL;

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @api public
 */
module.exports = function lolcation(loc) {
  loc = loc || global.location || {};
  URL = URL || require('./');

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new URL(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new URL(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./":18}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwiLi4vLi4vLi4vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2RlY29kZS5qcyIsIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9lbmNvZGUuanMiLCIuLi8uLi8uLi9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCIuLi8uLi8uLi9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwiLi4vLi4vLi4vQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXJsL3V0aWwuanMiLCJKYXZhc2NyaXB0cy9DcmVhdGluZ0xpbmtzLmpzIiwiSmF2YXNjcmlwdHMvRGF0YU1hbmFnZXIuanMiLCJKYXZhc2NyaXB0cy9Nb2R1bC5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdDaG9yZHMuanMiLCJKYXZhc2NyaXB0cy9TZXR0aW5nR3JvdXBzLmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0lucHV0LmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0xheW91dC5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdUaXRsZS5qcyIsImFwcC5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZ2lmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZXF1aXJlcy1wb3J0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3VybC1wYXJzZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy91cmwtcGFyc2UvbG9sY2F0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXRCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMSBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjQuMScsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gSWYgb2JqLmhhc093blByb3BlcnR5IGhhcyBiZWVuIG92ZXJyaWRkZW4sIHRoZW4gY2FsbGluZ1xuLy8gb2JqLmhhc093blByb3BlcnR5KHByb3ApIHdpbGwgYnJlYWsuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvMTcwN1xuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihxcywgc2VwLCBlcSwgb3B0aW9ucykge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgdmFyIG9iaiA9IHt9O1xuXG4gIGlmICh0eXBlb2YgcXMgIT09ICdzdHJpbmcnIHx8IHFzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgcmVnZXhwID0gL1xcKy9nO1xuICBxcyA9IHFzLnNwbGl0KHNlcCk7XG5cbiAgdmFyIG1heEtleXMgPSAxMDAwO1xuICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5tYXhLZXlzID09PSAnbnVtYmVyJykge1xuICAgIG1heEtleXMgPSBvcHRpb25zLm1heEtleXM7XG4gIH1cblxuICB2YXIgbGVuID0gcXMubGVuZ3RoO1xuICAvLyBtYXhLZXlzIDw9IDAgbWVhbnMgdGhhdCB3ZSBzaG91bGQgbm90IGxpbWl0IGtleXMgY291bnRcbiAgaWYgKG1heEtleXMgPiAwICYmIGxlbiA+IG1heEtleXMpIHtcbiAgICBsZW4gPSBtYXhLZXlzO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciB4ID0gcXNbaV0ucmVwbGFjZShyZWdleHAsICclMjAnKSxcbiAgICAgICAgaWR4ID0geC5pbmRleE9mKGVxKSxcbiAgICAgICAga3N0ciwgdnN0ciwgaywgdjtcblxuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAga3N0ciA9IHguc3Vic3RyKDAsIGlkeCk7XG4gICAgICB2c3RyID0geC5zdWJzdHIoaWR4ICsgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtzdHIgPSB4O1xuICAgICAgdnN0ciA9ICcnO1xuICAgIH1cblxuICAgIGsgPSBkZWNvZGVVUklDb21wb25lbnQoa3N0cik7XG4gICAgdiA9IGRlY29kZVVSSUNvbXBvbmVudCh2c3RyKTtcblxuICAgIGlmICghaGFzT3duUHJvcGVydHkob2JqLCBrKSkge1xuICAgICAgb2JqW2tdID0gdjtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgb2JqW2tdLnB1c2godik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9ialtrXSA9IFtvYmpba10sIHZdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHJpbmdpZnlQcmltaXRpdmUgPSBmdW5jdGlvbih2KSB7XG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHY7XG5cbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB2ID8gJ3RydWUnIDogJ2ZhbHNlJztcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaXNGaW5pdGUodikgPyB2IDogJyc7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgc2VwLCBlcSwgbmFtZSkge1xuICBzZXAgPSBzZXAgfHwgJyYnO1xuICBlcSA9IGVxIHx8ICc9JztcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIG9iaiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBtYXAob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbihrKSB7XG4gICAgICB2YXIga3MgPSBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKGspKSArIGVxO1xuICAgICAgaWYgKGlzQXJyYXkob2JqW2tdKSkge1xuICAgICAgICByZXR1cm4gbWFwKG9ialtrXSwgZnVuY3Rpb24odikge1xuICAgICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUodikpO1xuICAgICAgICB9KS5qb2luKHNlcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9ialtrXSkpO1xuICAgICAgfVxuICAgIH0pLmpvaW4oc2VwKTtcblxuICB9XG5cbiAgaWYgKCFuYW1lKSByZXR1cm4gJyc7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG5hbWUpKSArIGVxICtcbiAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqKSk7XG59O1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHhzKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeHMpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSByZXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLmRlY29kZSA9IGV4cG9ydHMucGFyc2UgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuZXhwb3J0cy5lbmNvZGUgPSBleHBvcnRzLnN0cmluZ2lmeSA9IHJlcXVpcmUoJy4vZW5jb2RlJyk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU3RyaW5nOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdzdHJpbmcnO1xuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT0gbnVsbDtcbiAgfVxufTtcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDI0LjEwLjIwMTYuXHJcbiAqL1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzZXRDdXJyZW50VXJsOiBzZXRDdXJyZW50VXJsLFxyXG4gICAgc2V0UGFyYW06ICAgICAgc2V0UGFyYW0sXHJcbiAgICBfY3VycmVudFVSTDogICBfY3VycmVudFVSTCxcclxuICAgIF9xdWVyeU91dHB1dDogIF9xdWVyeU91dHB1dCxcclxuICAgIGNyZWF0ZUxpbms6Y3JlYXRlTGlua1xyXG59XHJcblxyXG52YXIgX3llYXI7XHJcbnZhciBfZGVwdDtcclxudmFyIF9zdXBwbGllcjtcclxudmFyIF9jYXRlZ29yeTtcclxudmFyIF90b3RhbF9FREk7XHJcbnZhciBfdG90YWxfRURBO1xyXG52YXIgX3dpZHRoO1xyXG52YXIgX2hlaWdodDtcclxudmFyIF9jdXJyZW50VVJMPVwiU3VwcGxpZXJfMjAxNl9jaG9yZC5odG1sXCI7XHJcbnZhciBfQXJyYXlQYXJhbXM7XHJcbnZhciBfcXVlcnlPdXRwdXQ9XCJcIjtcclxudmFyIF9BcnJheUNvdW50ZXI9MDtcclxudmFyIG15dXJsPVwiaHR0cDovL2xvY2FsaG9zdDo2MzM0Mi9CQTIwMTZfU3dpc3NfR292L2Nob3Jkc19iYTIwMTYvU3VwcGxpZXJfMjAxNl9jaG9yZF8wMS5odG1sXCI7XHJcblxyXG52YXIgcGFyYW1zID1cclxueyAgIHllYXI6ICAgICAgXCJkYXRhLmNzdlwiLGRlcHQ6IFwiZGF0YS5jc3ZcIiwgICAgIHN1cHBsaWVyOiBcImRhdGEuY3N2XCIsXHJcbiAgICB0b3RhbF9FREk6IFwiZGF0YS5jc3ZcIix0b3RhbF9FREE6IFwiZGF0YS5jc3ZcIix3aWR0aDogXCJkYXRhLmNzdlwiLFxyXG4gICAgaGVpZ2h0OiAgICBcImRhdGEuY3N2XCIsY3VycmVudFVSTDogXCJkYXRhLmNzdlwiXHJcbn07XHJcbnZhciBkZXB0cz1cclxue1xyXG59O1xyXG5mdW5jdGlvbiBzZXRDdXJyZW50VXJsKHN0YXJ0VXJsKXtcclxuICAgIF9jdXJyZW50VVJMPXN0YXJ0VXJsXHJcbn07XHJcblxyXG5cclxuZnVuY3Rpb24gc2V0UGFyYW0oZGVwdCwgc3VwcGxpZXIsIGNhdGVnb3J5LCB5ZWFyKVxyXG57XHJcbiAgICBjb25zb2xlLmxvZyhcInNldHBhcmFtXCIpO1xyXG4gICAgdmFyIG5hbWU9XCJcIjtcclxuICAgIGZvciAodmFyIGk9MDtpPGRlcHQubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgbmFtZT1cImRlXCI7XHJcbiAgICAgICAgbmFtZSs9aTtcclxuICAgICAgICBkZXB0c1tuYW1lXT1kZXB0W2ldO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGVwdDpcIitkZXB0c1tpXSk7XHJcbiAgICAgICAgbmFtZT1cIlwiO1xyXG4gICAgICAgIF9BcnJheUNvdW50ZXIrKztcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhcImw6XCIrX0FycmF5Q291bnRlcik7XHJcbiAgICBpZiAoc3VwcGxpZXI9MCl7XHJcbiAgICAgICAgX3N1cHBsaWVyPTA7XHJcbiAgICAgICBfY2F0ZWdvcnk9Y2F0ZWdvcnk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIF9zdXBwbGllcj1zdXBwbGllcjtcclxuICAgICAgICBfY2F0ZWdvcnk9MDtcclxuICAgIH1cclxuICAgIF95ZWFyPXllYXI7XHJcbn1cclxuICAgIC8qXHJcbiAgICBfeWVhcj15ZWFyO1xyXG4gICAgX3N1cHBsaWVyPXN1cHBsaWVyO1xyXG4gICAgX3RvdGFsX0VEST10b3RhbF9FREk7XHJcbiAgICBfdG90YWxfRURBPXRvdGFsX0VEQTtcclxuICAgIF93aWR0aD13aWR0aDtcclxuICAgIF9oZWlnaHQ9aGVpZ2h0O1xyXG5cclxuICAgIHBhcmFtc1swXT1feWVhcjsvL3BhcmFtcyBmw7xyIGRlcHQgdW5kIHN1cHBsaWVyXHJcbiAgICBwYXJhbXNbMV09X2RlcHQ7XHJcbiAgICBwYXJhbXNbMl09X3N1cHBsaWVyO1xyXG4gICAgcGFyYW1zWzNdPV90b3RhbF9FREk7XHJcbiAgICBwYXJhbXNbNF09X3RvdGFsX0VEQTtcclxuICAgIHBhcmFtc1s1XT1fd2lkdGg7XHJcbiAgICBwYXJhbXNbNl09X2hlaWdodDtcclxufVxyXG4qL1xyXG5mdW5jdGlvbiBjcmVhdGVMaW5rKCl7XHJcbiAgICBjb25zb2xlLmxvZyhcImNyZWF0ZUxpbmtcIik7XHJcblxyXG4gICAgdmFyIHN0YXJ0YXBwZW5kPVwiP1wiO1xyXG4gICAgdmFyIHNlcGVyYXRvcj1cIj1cIjtcclxuICAgIHZhciBhcHBlbmRlcj1cIiZcIjtcclxuICAgIHZhciBuYW1lPVwiXCI7XHJcblxyXG4gICAgX3F1ZXJ5T3V0cHV0PW15dXJsO1xyXG4gICAgX3F1ZXJ5T3V0cHV0Kz1zdGFydGFwcGVuZDtcclxuXHJcbiAgICBmb3IodmFyIGk9MDtpPF9BcnJheUNvdW50ZXI7aSsrKXtcclxuICAgICAgICBuYW1lPVwiZGVcIjtcclxuICAgICAgICBuYW1lKz1pO1xyXG4gICAgICAgIF9xdWVyeU91dHB1dCs9XCJkZXB0c1wiK3NlcGVyYXRvcitkZXB0c1tuYW1lXSthcHBlbmRlcjtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInF1ZXJ5OlwiK19xdWVyeU91dHB1dCk7XHJcbiAgICAgICAgbmFtZT1cIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIF9xdWVyeU91dHB1dCs9XCJzdXBwbGllcj1cIitfc3VwcGxpZXI7XHJcbiAgICBfcXVlcnlPdXRwdXQrPWFwcGVuZGVyK1wiY2F0PVwiK19jYXRlZ29yeTtcclxuICAgIF9xdWVyeU91dHB1dCs9YXBwZW5kZXIrXCJ5ZWFyPVwiK195ZWFyO1xyXG5cclxuICAgIG1vZHVsLl9odHRwX3F1ZXJ5PV9xdWVyeU91dHB1dDtcclxuICAgIGNvbnNvbGUubG9nKF9xdWVyeU91dHB1dCk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjkuMTEuMjAxNi5cclxuICovXHJcblxyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgZ2V0RHVtbXlfQks6Z2V0RHVtbXlfQkssXHJcbiAgICBnZXREdW1teV9FREE6Z2V0RHVtbXlfRURBLFxyXG4gICAgZ2V0RHVtbXlfRURJOmdldER1bW15X0VESSxcclxuICAgIGdldER1bW15X0VGRDpnZXREdW1teV9FRkQsXHJcbiAgICBnZXREdW1teV9FSlBEOmdldER1bW15X0VKUEQsXHJcbiAgICBnZXREdW1teV9VVkVLOmdldER1bW15X0VKUEQsXHJcbiAgICBnZXREdW1teV9WQlM6Z2V0RHVtbXlfVkJTLFxyXG4gICAgZ2V0RHVtbXlfV0JGOmdldER1bW15X1dCRixcclxuICAgIGdldFN1cHBsaWVyOmdldFN1cHBsaWVyXHJcbn07XHJcblxyXG5mdW5jdGlvbiBnZXREdW1teV9CSyhjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGRbbmFtZV19KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KXtyZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUJ1bmRlc2thbnplbHQ6IGQzLnN1bSh2LCBmdW5jdGlvbihkKXtyZXR1cm4gZFtcIkJ1bmRlc2thbnpsZWlcIl19KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcbmZ1bmN0aW9uIGdldER1bW15X0VEQShjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGRbbmFtZV19KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KXtyZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUVEQTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpe3JldHVybiBkW1wiMTAwNSBFREFcIl19KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREdW1teV9FREkoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkW25hbWVdfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odil7cmV0dXJue1xyXG4gICAgICAgICAgICBzdW1FREk6IGQzLnN1bSh2LCBmdW5jdGlvbihkKXtyZXR1cm4gZFtcIkJBR1wiXX0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuZnVuY3Rpb24gZ2V0RHVtbXlfRUZEKGNzdiwgbmFtZSl7XHJcbiAgICB2YXIgbmVzdGVkX2RhdGE9ZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZFtuYW1lXX0pXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZC5kZXB0fSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJue1xyXG4gICAgICAgICAgICBzdW1FRkQ6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiRVpGXCJdKyBkW1wiQklUXCJdKyBkW1wiQkJMXCJdOyB9KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcbmZ1bmN0aW9uIGdldER1bW15X0VKUEQoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkW25hbWVdfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUJGTTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJCRk1cIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldER1bW15X1VWRUsoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkW25hbWVdfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm57XHJcbiAgICAgICAgICAgIHN1bVVWRUs6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiQVNUUkFcIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuZnVuY3Rpb24gZ2V0RHVtbXlfVkJTKGNzdiwgbmFtZSl7XHJcbiAgICB2YXIgbmVzdGVkX2RhdGE9ZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZFtuYW1lXX0pXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZC5kZXB0fSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJue1xyXG4gICAgICAgICAgICBzdW1WQlM6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiYXIgQmVzY2hhZmZ1bmdcIl0rZFtcImFyIFLDvHN0dW5nXCJdOyB9KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREdW1teV9XQkYoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkW25hbWVdfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm57XHJcbiAgICAgICAgICAgIHN1bVdCRjogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJHUy1XQkZcIl0rZFtcIkJMV1wiXStkW1wiQWdyb3Njb3BlXCJdOyB9KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTdXBwbGllcihjc3YsIG5hbWUpIHtcclxuICAgIHZhciBuZXN0ZWRfZGF0YSA9IGQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zdXBwbGllcjsgfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuZGVwdDsgfSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiMTAwNiBFREFcIl07IH0pOyB9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICBjb25zb2xlLmxvZyhcImdldFN1cHBsaWVyXCIpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcblxyXG4iLCIgICAgLyoqXHJcbiAgICAgKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDI0LjEwLjIwMTYuXHJcbiAgICAgKi9cclxuICAgIHZhciBfY3VycmVudGNzdj1cIkNTVi9CSyAtIDIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjc3ZfQj1cIkNTVi9FREEgLSAyMDExLmNzdlwiO1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2X0M9XCJDU1YvRURJIC0gMjAxMi5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGNzdl9EPVwiQ1NWL0VGRCAtIDIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjc3ZfRT1cIkNTVi9FSlBEIC0gMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGNzdl9GPVwiQ1NWL1VWRUsgLSAyMDExLmNzdlwiO1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2X0c9XCJDU1YvVkJTIC0gMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGNzdl9IPVwiQ1NWL1dCRiAtIDIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRqc29uPVwiQ1NWL21hdHJpeC5qc29uXCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjb2xvcj1cIkNTVi9Db2xvci5jc3ZcIjtcclxuICAgIHZhciBfc3ZnOy8vID0gZDMuc2VsZWN0KFwic3ZnXCIpO1xyXG4gICAgdmFyIF93aWR0aDtcclxuICAgIHZhciBfaGVpZ2h0O1xyXG4gICAgdmFyIF9vdXRlclJhZGl1cztcclxuICAgIHZhciBfaW5uZXJSYWRpdXM7XHJcbiAgICB2YXIgX2xheW91dDtcclxuICAgIHZhciBfcGF0aDtcclxuICAgIHZhciBfYXJjO1xyXG4gICAgdmFyIF9ncm91cFBhdGg7XHJcbiAgICB2YXIgX2dyb3VwO1xyXG4gICAgdmFyIF9ncm91cFRleHQ7XHJcbiAgICB2YXIgX2Nob3JkO1xyXG4gICAgdmFyIF9mb3JtYXRQZXJjZW50O1xyXG4gICAgdmFyIF90cmFuc2Zvcm1fd2lkdGg7XHJcbiAgICB2YXIgX3RyYW5zZm9ybV9oZWlnaHQ7XHJcbiAgICB2YXIgX2dyb3VwX3g7XHJcbiAgICB2YXIgX2dyb3VwX2R5O1xyXG4gICAgdmFyIF9tYXRyaXg7XHJcbiAgICB2YXIgX3N1cHBsaWVyO1xyXG4gICAgdmFyIF9jb2xvcjtcclxuICAgIHZhciBfZGVwdDtcclxuICAgIHZhciBfZHNfc3VwcGxpZXI7XHJcbiAgICB2YXIgX2RzX2RlcHQ7XHJcbiAgICB2YXIgX2RzX2Nvc3Q7XHJcbiAgICB2YXIgX2RzX3N1cHBsaWVyX0VESTtcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfRURBO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9CSztcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfRUpQRDtcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfRUZEO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9VVkVLO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9WQlM7XHJcbiAgICB2YXIgX2RzX3N1cHBsaWVyX1dCRjtcclxuICAgIHZhciBfdl9jaG9pY2U9XCJFREFfRURJXzIwMTFcIjsvL2RlZmF1bHRcclxuICAgIHZhciBfdmh0dHA9XCJodHRwOi8vbG9jYWxob3N0OjYzMzQyL0JBMjAxNl9Td2lzc19Hb3YvY2hvcmRzX2JhMjAxNi9TdXBwbGllcl8yMDE2X2Nob3JkLmh0bWxcIjtcclxuICAgIHZhciBfaHR0cF9xdWVyeT1cIlwiO1xyXG4gICAgdmFyIF92bW9kdXM9XCJkZWZhdWx0XCI7XHJcbiAgICB2YXIgX2Vycm9yX2NvdW50ZXI9MDtcclxuICAgIHZhciBfY291bnREZXA9MTtcclxuICAgIC8qY3JlYXRpbmdsaW5rcyovXHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPXtcclxuICAgICAgICBfY3VycmVudGNzdjpfY3VycmVudGNzdixcclxuICAgICAgICBfY3VycmVudGNzdl9COl9jdXJyZW50Y3N2X0IsXHJcbiAgICAgICAgX2N1cnJlbnRjc3ZfQzpfY3VycmVudGNzdl9DLFxyXG4gICAgICAgIF9jdXJyZW50Y3N2X0Q6X2N1cnJlbnRjc3ZfRCxcclxuICAgICAgICBfY3VycmVudGNzdl9FOl9jdXJyZW50Y3N2X0UsXHJcbiAgICAgICAgX2N1cnJlbnRjc3ZfRjpfY3VycmVudGNzdl9GLFxyXG4gICAgICAgIF9jdXJyZW50Y3N2X0c6X2N1cnJlbnRjc3ZfRyxcclxuICAgICAgICBfY3VycmVudGNzdl9IOl9jdXJyZW50Y3N2X0gsXHJcbiAgICAgICAgX2N1cnJlbnRqc29uOl9jdXJyZW50anNvbixcclxuICAgICAgICBfY3VycmVudGNvbG9yOl9jdXJyZW50Y29sb3IsXHJcbiAgICAgICAgX3N2Zzpfc3ZnLFxyXG4gICAgICAgIF93aWR0aDpfd2lkdGgsXHJcbiAgICAgICAgX3dpZHRoOl93aWR0aCxcclxuICAgICAgICBfaGVpZ2h0Ol9oZWlnaHQsXHJcbiAgICAgICAgX291dGVyUmFkaXVzOl9vdXRlclJhZGl1cyxcclxuICAgICAgICBfaW5uZXJSYWRpdXM6X2lubmVyUmFkaXVzLFxyXG4gICAgICAgIF9sYXlvdXQ6X2xheW91dCxcclxuICAgICAgICBfcGF0aDpfcGF0aCxcclxuICAgICAgICBfYXJjOl9hcmMsXHJcbiAgICAgICAgX2dyb3VwUGF0aDpfZ3JvdXBQYXRoLFxyXG4gICAgICAgIF9ncm91cDpfZ3JvdXAsXHJcbiAgICAgICAgX2dyb3VwVGV4dDpfZ3JvdXBUZXh0LFxyXG4gICAgICAgIF9jaG9yZDpfY2hvcmQsXHJcbiAgICAgICAgX2Zvcm1hdFBlcmNlbnQ6X2Zvcm1hdFBlcmNlbnQsXHJcbiAgICAgICAgX3RyYW5zZm9ybV93aWR0aDpfdHJhbnNmb3JtX3dpZHRoLFxyXG4gICAgICAgIF90cmFuc2Zvcm1faGVpZ2h0Ol90cmFuc2Zvcm1faGVpZ2h0LFxyXG4gICAgICAgIF9ncm91cF94Ol9ncm91cF94LFxyXG4gICAgICAgIF9ncm91cF9keTpfZ3JvdXBfZHksXHJcbiAgICAgICAgX21hdHJpeDpfbWF0cml4LFxyXG4gICAgICAgIF9zdXBwbGllcjpfc3VwcGxpZXIsXHJcbiAgICAgICAgX2NvbG9yOl9jb2xvcixcclxuICAgICAgICBfZGVwdDpfZGVwdCxcclxuICAgICAgICBfZHNfc3VwcGxpZXI6X2RzX3N1cHBsaWVyLFxyXG4gICAgICAgIF9kc19kZXB0Ol9kc19kZXB0LFxyXG4gICAgICAgIF9kc19jb3N0Ol9kc19jb3N0LFxyXG4gICAgICAgIF9kc19zdXBwbGllcl9FREkgICAgOl9kc19zdXBwbGllcl9FREksXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VEQSAgICA6X2RzX3N1cHBsaWVyX0VEQSxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfQksgICAgIDpfZHNfc3VwcGxpZXJfQkssXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VKUEQgICA6X2RzX3N1cHBsaWVyX0VKUEQsXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VGRCAgICA6X2RzX3N1cHBsaWVyX0VGRCxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfVVZFSyAgIDpfZHNfc3VwcGxpZXJfVVZFSyxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfVkJTICAgIDpfZHNfc3VwcGxpZXJfVkJTLFxyXG4gICAgICAgIF9kc19zdXBwbGllcl9XQkYgICAgOl9kc19zdXBwbGllcl9XQkYsXHJcbiAgICAgICAgX3ZfY2hvaWNlOl92X2Nob2ljZSxcclxuICAgICAgICBfdmh0dHA6X3ZodHRwLFxyXG4gICAgICAgIF92bW9kdXM6X3Ztb2R1cyxcclxuICAgICAgICBfZXJyb3JfY291bnRlcjpfZXJyb3JfY291bnRlcixcclxuICAgICAgICBfY291bnREZXA6X2NvdW50RGVwLFxyXG4gICAgICAgIF9odHRwX3F1ZXJ5Ol9odHRwX3F1ZXJ5XHJcbiAgICB9OyIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDIxLjEwLjIwMTYuXHJcbiAqL1xyXG4vLzdcclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbi8qdmFyIFNldHRpbmdEYXRhID0gcmVxdWlyZSgnLi9TZXR0aW5nRGF0YXMuanMnKTtcclxuX21haW5kYXRhID0gbmV3IFNldHRpbmdEYXRhKCk7Ki9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2VsZWN0Y2hvcmRzOnNlbGVjdGNob3Jkc1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWxlY3RjaG9yZHMoKSB7XHJcbiAgICBtb2R1bC5fY2hvcmQgPSBtb2R1bC5fc3ZnLnNlbGVjdEFsbChcIi5jaG9yZFwiKVxyXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjaG9yZFwiKVxyXG4gICAgICAgIC5kYXRhKG1vZHVsLl9sYXlvdXQuY2hvcmRzKVxyXG4gICAgICAgIC5lbnRlcigpLmFwcGVuZChcInBhdGhcIilcclxuICAgICAgICAuYXR0cihcImRcIiwgIG1vZHVsLl9wYXRoLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5zdXBwbGllcn0pXHJcbiAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAvL3JldHVybiBtb2R1bC5fc3VwcGxpZXJbZC5zb3VyY2UuaW5kZXhdLmNvbG9yO1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kdWwuX2NvbG9yW2Quc291cmNlLmluZGV4XS5jb2xvcjtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbi8qdmFyIFNldHRpbmdEYXRhID0gcmVxdWlyZSgnLi9TZXR0aW5nRGF0YXMuanMnKTtcclxudmFyIF9tYWluZGF0YSA9IG5ldyBTZXR0aW5nRGF0YSgpOyovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9e1xyXG4gICAgbmVpZ2hib3Job29kOm5laWdoYm9yaG9vZCxcclxuICAgIGdyb3VwUGF0aDpncm91cFBhdGgsXHJcbiAgICBncm91cFRleHQ6Z3JvdXBUZXh0LFxyXG4gICAgZ3JvdXB0ZXh0RmlsdGVyOmdyb3VwdGV4dEZpbHRlcixcclxuICAgIG1vdXNlb3Zlcjptb3VzZW92ZXJcclxuXHJcbn1cclxuZnVuY3Rpb24gbmVpZ2hib3Job29kKCkgey8vTMOkbmRlcmJvZ2VuXHJcbiAgICBjb25zb2xlLmxvZyhcIm5laWdoYm9yXCIpO1xyXG4gICAgbW9kdWwuX2dyb3VwID0gbW9kdWwuX3N2Zy5zZWxlY3RBbGwoXCJnLmdyb3VwXCIpXHJcbiAgICAgICAgLmRhdGEobW9kdWwuX2xheW91dC5ncm91cHMpXHJcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIilcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZ3JvdXBcIilcclxuICAgICAgICAub24oXCJtb3VzZW92ZXJcIiwgbW91c2VvdmVyKSAgICAgLy9kYXLDvGJlciBmYWhyZW5cclxuICAgICAgICAub24oXCJtb3VzZW91dFwiLCBtb3VzZW91dCkgOyAgICAvL2RhcsO8YmVyIGZhaHJlblxyXG5cclxufVxyXG5mdW5jdGlvbiBncm91cFBhdGgoKSB7Ly9pbiBsw6RuZGVyYm9nZW4gZWluc2V0emVuXHJcbiAgICBtb2R1bC5fZ3JvdXBQYXRoID0gIG1vZHVsLl9ncm91cC5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgLmF0dHIoXCJpZFwiLCBmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJncm91cFwiICsgaTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwiZFwiLCBtb2R1bC5fYXJjKVxyXG4gICAgICAgIC5zdHlsZShcImZpbGxcIiwgZnVuY3Rpb24gKGQsIGkpIHsvL0ZhcmJlIHVtIEJvZ2VuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2R1bC5fY29sb3JbaV0uY29sb3I7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gZ3JvdXBUZXh0KCkgey8vZGVuIGzDpG5kZXJib2dlbiBiZXNjaHJpZnRlblxyXG4gICAgbW9kdWwuX2dyb3VwVGV4dCA9IG1vZHVsLl9ncm91cC5hcHBlbmQoXCJzdmc6dGV4dFwiKVxyXG4gICAgICAgIC5hdHRyKFwieFwiLCBtb2R1bC5fZ3JvdXBfeCkvLzZcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic3VwcGxpZXJcIilcclxuICAgICAgICAuYXR0cihcImR5XCIsIG1vZHVsLl9ncm91cF9keSk7Ly9icm8xNVxyXG5cclxuICAgIC8qaWYgKG1vZHVsLl9FREFfY3N2XyA9IFwiY3N2L1wiICsgXCJEdW1teV9FREEuY3N2XCIpIHsqL1xyXG4gICAgICAgIG1vZHVsLl9ncm91cFRleHQuYXBwZW5kKFwic3ZnOnRleHRQYXRoXCIpXHJcbiAgICAgICAgICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCBmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiI2dyb3VwXCIgKyBkLmluZGV4O1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGV4dChmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobW9kdWwuX3N1cHBsaWVyW2ldLmtleSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kdWwuX3N1cHBsaWVyW2ldLmtleTtcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vcmV0dXJuIG1vZHVsLl9kc19zdXBwbGllcltpXS5rZXk7Ly9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgICAgICAgLy8gbW9kdWwuX2RzX3N1cHBsaWVyW2ldLnZhbHVlc1swXS5rZXkgPVwiRURBXCJcclxuICAgICAgICAgICAgLy8gbW9kdWwuX2RzX3N1cHBsaWVyW2ldLnZhbHVlc1swXS52YWx1ZXMgPSAyMDAwMChzdW1tZSlcclxuXHJcbiAgICBmdW5jdGlvbiBncm91cFRpY2tzKGQpIHtcclxuICAgICAgICB2YXIgayA9IChkLmVuZEFuZ2xlIC0gZC5zdGFydEFuZ2xlKSAvIGQudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIGQzLnJhbmdlKDAsIGQudmFsdWUsIDEwMDAwMDApLm1hcChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYW5nbGU6IHYgKiBrICsgZC5zdGFydEFuZ2xlLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGkgJSBtb2R1bC5fY291bnREZXAgIT0gMCA/IG51bGwgOiB2IC8gMTAwMDAwMCArIFwibVwiXHJcbiAgICAgICAgICAgIH07Ly8zLy9cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHZhciBnID0gbW9kdWwuX3N2Zy5zZWxlY3RBbGwoXCJnLmdyb3VwXCIpXHJcbiAgICB2YXIgdGlja3MgPWcuc2VsZWN0QWxsKFwiZ1wiKVxyXG4gICAgICAgIC5kYXRhKGdyb3VwVGlja3MpXHJcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInJvdGF0ZShcIiArIChkLmFuZ2xlICogMTgwIC8gTWF0aC5QSSAtIDkwKSArIFwiKVwiXHJcbiAgICAgICAgICAgICAgICArIFwidHJhbnNsYXRlKFwiICsgbW9kdWwuX291dGVyUmFkaXVzICsgXCIsMClcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB0aWNrcy5hcHBlbmQoXCJsaW5lXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4MVwiLCAxKVxyXG4gICAgICAgIC5hdHRyKFwieTFcIiwgMClcclxuICAgICAgICAuYXR0cihcIngyXCIsIDUpXHJcbiAgICAgICAgLmF0dHIoXCJ5MlwiLCAwKVxyXG4gICAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBcIiMwMDBcIik7XHJcblxyXG4gICAgdGlja3MuYXBwZW5kKFwidGV4dFwiKVxyXG4gICAgICAgIC5hdHRyKFwieFwiLCA2KVxyXG4gICAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQuYW5nbGUgPiBNYXRoLlBJID9cclxuICAgICAgICAgICAgICAgIFwicm90YXRlKDE4MCl0cmFuc2xhdGUoLTE2KVwiIDogbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQuYW5nbGUgPiBNYXRoLlBJID8gXCJlbmRcIiA6IG51bGw7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBkLmxhYmVsOyB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ3JvdXB0ZXh0RmlsdGVyKCkge1xyXG4gICAgbW9kdWwuX2dyb3VwVGV4dC5maWx0ZXIoZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZHVsLl9ncm91cFBhdGhbMF1baV0uZ2V0VG90YWxMZW5ndGgoKSAvIDIgLSAxNiA8IHRoaXMuZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdXNlb3ZlcihkLCBpKSB7XHJcbiAgICBtb2R1bC5fY2hvcmQuY2xhc3NlZChcImZhZGVcIiwgZnVuY3Rpb24ocCkge1xyXG4gICAgICAgIHJldHVybiBwLnNvdXJjZS5pbmRleCAhPSBpXHJcbiAgICAgICAgICAgICYmIHAudGFyZ2V0LmluZGV4ICE9IGk7XHJcbiAgICB9KVxyXG4gICAgLnRyYW5zaXRpb24oKVxyXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwLjEpO1xyXG59XHJcbmZ1bmN0aW9uIG1vdXNlb3V0KGQsIGkpIHtcclxuICAgIG1vZHVsLl9jaG9yZC5jbGFzc2VkKFwiZmFkZVwiLCBmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwLnNvdXJjZS5pbmRleCAhPSBpXHJcbiAgICAgICAgICAgICAgICAmJiBwLnRhcmdldC5pbmRleCAhPSBpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRyYW5zaXRpb24oKVxyXG4gICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XHJcbn1cclxuXHJcblxyXG5cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjEuMTAuMjAxNi5cclxuICovXHJcblxyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5EYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vRGF0YU1hbmFnZXInKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzPXtcclxuICAgIHJlYWRjc3Y6cmVhZGNzdlxyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkY3N2KGRhdGEsIGRhdGFfQixkYXRhX0MsZGF0YV9ELGRhdGFfRSwgZGF0YV9GLGRhdGFfRyxkYXRhX0ggLG1hdHJpeCkgIHtcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIHJlYWRjc3ZcIik7XHJcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xyXG4gICAgdmFyIHN1cHBsaWVyO1xyXG4gICAgdmFyIGNzdmFsbDtcclxuICAgIHZhciBmaWx0ZXJjb250ZW50O1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgXCIgK21vZHVsLl92X2Nob2ljZSk7XHJcbiAgICAvL2NvbXBhcmVDU1YoZGF0YSwgZGF0YV9CLGRhdGFfQyxkYXRhX0QsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgc3dpdGNoIChtb2R1bC5fdl9jaG9pY2Upe1xyXG4gICAgICAgIGNhc2UgXCJFREFfRURJXzIwMTFcIjovL0VEQSAyMDExLCBFREkgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJFREFfRURJXzIwMTJcIjovL0VEQSAyMDEyLCBFREkgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJFREFfRURJXzIwMTNcIjovL0VEQSAyMDEzLCBFREkgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJFREFfRURJXzIwMTRcIjovL0VEQSAyMDE0LCBFREkgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIkFpclBsdXMgSW50ZXJuYXRpb25hbCBBR1wiLFwiU2Nod2VpemVyaXNjaGUgQnVuZGVzYmFobmVuIFNCQlwiXTtcclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREE9IERhdGFNYW5hZ2VyLmdldER1bW15X0VEQShkYXRhLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURJPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREkoZGF0YV9CLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFttb2R1bC5fZHNfc3VwcGxpZXJfRURBLG1vZHVsLl9kc19zdXBwbGllcl9FREldKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCxcInN1bUVEQVwiLCBcInN1bUVESVwiLCBbXCJzdW1FREFcIixcInN1bUVESVwiXSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJCS19FRElfMjAxMVwiOi8vQksgRURBIDIwMTEsXHJcbiAgICAgICAgY2FzZSBcIkJLX0VESV8yMDEyXCI6Ly9CSyBFREEgMjAxMixcclxuICAgICAgICBjYXNlIFwiQktfRURJXzIwMTNcIjovL0JLIEVEQSAyMDEzLFxyXG4gICAgICAgIGNhc2UgXCJCS19FRElfMjAxNFwiOi8vQksgRURBIDIwMTQsXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiQWlyUGx1cyBJbnRlcm5hdGlvbmFsIEFHXCIsXCJTY2h3ZWl6ZXJpc2NoZSBCdW5kZXNiYWhuZW4gU0JCXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSxmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfQksoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VESV0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLCBcInN1bUVEQVwiLCBcInN1bUJ1bmRlc2thbnplbHRcIiwgW1wic3VtRURBXCIsXCJzdW1CdW5kZXNrYW56ZWx0XCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMVwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMlwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxM1wiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxNFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiQWlyUGx1cyBJbnRlcm5hdGlvbmFsIEFHXCIsXCJTY2h3ZWl6ZXJpc2NoZSBCdW5kZXNiYWhuZW4gU0JCXCIsXHJcbiAgICAgICAgICAgICAgICBcIkRpZSBTY2h3ZWl6ZXJpc2NoZSBQb3N0IFNlcnZpY2UgQ2VudGVyIEZpbmFuemVuIE1pdHRlXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSwgZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlciBjcmVhdGVkXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREE9IERhdGFNYW5hZ2VyLmdldER1bW15X0VEQShkYXRhX0IsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0MsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREldKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCwgXCJzdW1FREFcIiwgXCJzdW1CdW5kZXNrYW56ZWx0XCIsIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMV9UcmlcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTJfVHJpXCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDEzX1RyaVwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxNF9UcmlcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIlRyaXZhZGlzIEFHXCIsXCJTY2h3ZWl6ZXJpc2NoZSBCdW5kZXNiYWhuZW4gU0JCXCIsXHJcbiAgICAgICAgICAgICAgICBcIkRpZSBTY2h3ZWl6ZXJpc2NoZSBQb3N0IFNlcnZpY2UgQ2VudGVyIEZpbmFuemVuIE1pdHRlXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSwgZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlciBjcmVhdGVkXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREE9IERhdGFNYW5hZ2VyLmdldER1bW15X0VEQShkYXRhX0IsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0MsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREldKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCwgXCJzdW1FREFcIiwgXCJzdW1CdW5kZXNrYW56ZWx0XCIsIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMV9DYXRcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTJfQ2F0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDEzX0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxNF9DYXRcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIkhhcmR3YXJlXCIsXCJTVy1QZmxlZ2UgdW5kIEhXIFdhcnR1bmdcIixcclxuICAgICAgICAgICAgXCJJbmZvcm1hdGlrLURMIGV4a2wuIFBlcnNvbmFsdmVybGVpaCBpbSBCZXJlaWNoIElLVFwiXTtcclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsIGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaWx0ZXIgY3JlYXRlZFwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0JLPSBEYXRhTWFuYWdlci5nZXREdW1teV9CSyhkYXRhLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0MsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFsgbW9kdWwuX2RzX3N1cHBsaWVyX0JLLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURBLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURJXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsIFwic3VtRURBXCIsIFwic3VtQnVuZGVza2FuemVsdFwiLCBbXCJzdW1CdW5kZXNrYW56ZWx0XCIsXCJzdW1FREFcIixcInN1bUVESVwiXSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTFfQ2F0XzJcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTJfQ2F0XzJcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTNfQ2F0XzJcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTRfQ2F0XzJcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIkFsbGcuIEJlcmF0dW5ncy1ETCBpbSBGYWNoYmVyZWljaCBlaW5lcyBBbXRlcyB1bmQgSG9ub3JhcmVcIixcclxuICAgICAgICAgICAgICAgIFwiQmVyYXR1bmdzLURMIGbDvHIgTWFuYWdlbWVudCB1bmQgT3JnYW5pc2F0aW9uIHNvd2llIENvYWNoaW5nXCIsXHJcbiAgICAgICAgICAgICAgICBcIlNXLVBmbGVnZSB1bmQgSFcgV2FydHVuZ1wiXTtcclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsIGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaWx0ZXIgY3JlYXRlZFwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0JLPSBEYXRhTWFuYWdlci5nZXREdW1teV9CSyhkYXRhLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0MsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFsgbW9kdWwuX2RzX3N1cHBsaWVyX0JLLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURBLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURJXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsIFwic3VtRURBXCIsIFwic3VtQnVuZGVza2FuemVsdFwiLCBbXCJzdW1CdW5kZXNrYW56ZWx0XCIsXCJzdW1FREFcIixcInN1bUVESVwiXSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTFfQ2F0XzNcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTJfQ2F0XzNcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTNfQ2F0XzNcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTRfQ2F0XzNcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIlBvc3RkaWVuc3RlXCIsXCJBbGxnLiBCZXJhdHVuZ3MtREwgaW0gRmFjaGJlcmVpY2ggZWluZXMgQW10ZXMgdW5kIEhvbm9yYXJlXCIsXHJcbiAgICAgICAgICAgICAgICBcIkhhcmR3YXJlXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSwgZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQiA9ZmlsdGVyKGRhdGFfQixmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgZGF0YV9DID1maWx0ZXIoZGF0YV9DLGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlciBjcmVhdGVkXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREEoZGF0YV9CLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREldKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCwgXCJzdW1FREFcIiwgXCJzdW1CdW5kZXNrYW56ZWx0XCIsIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfRUpQRF8yMDExX0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfRUpQRF8yMDEyX0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfRUpQRF8yMDEzX0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfRUpQRF8yMDE0X0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiSW5mb3JtYXRpb25zYXJiZWl0XCIsXCJJbmZvcm1hdGlrLURMIGV4a2wuIFBlcnNvbmFsdmVybGVpaCBpbSBCZXJlaWNoIElLVFwiLFxyXG4gICAgICAgICAgICAgICAgXCJIYXJkd2FyZVwiLFwiUG9zdGRpZW5zdGVcIl07IC8vamVkZXMgZGF0YSBlaW4gZGVwYXJ0ZW1lbnQsIG1pbmRlc3RlbiA0IHBybyBkZXB0XHJcbiAgICAgICAgICAgIGRhdGEgPWZpbHRlcihkYXRhLCBmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBkYXRhX0MgPWZpbHRlcihkYXRhX0MsZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfRCA9ZmlsdGVyKGRhdGFfRCxmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaWx0ZXIgY3JlYXRlZFwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0JLPSBEYXRhTWFuYWdlci5nZXREdW1teV9CSyhkYXRhLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0MsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRUpQRD0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRUpQRChkYXRhX0QsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFsgbW9kdWwuX2RzX3N1cHBsaWVyX0JLLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURBLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURJLG1vZHVsLl9kc19zdXBwbGllcl9FSlBEXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsIFwic3VtRURBXCIsIFwic3VtQnVuZGVza2FuemVsdFwiLCBbXCJzdW1CdW5kZXNrYW56ZWx0XCIsXCJzdW1FREFcIixcInN1bUVESVwiLCBcInN1bUJGTVwiXSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJX0VGRF9FSlBEX1VWRUtfVkJTX1dCRl8yMDExXCI6XHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiQWlyUGx1cyBJbnRlcm5hdGlvbmFsIEFHXCIsXCJTY2h3ZWl6ZXJpc2NoZSBCdW5kZXNiYWhuZW4gU0JCXCIsXHJcbiAgICAgICAgICAgICAgICBcIkRpZSBTY2h3ZWl6ZXJpc2NoZSBQb3N0IFNlcnZpY2UgQ2VudGVyIEZpbmFuemVuIE1pdHRlXCIsXCJTUkcgU1NSIGlkw6llIHN1aXNzZSBNZWRpYSBTZXJ2aWNlc1wiLFxyXG4gICAgICAgICAgICAgICAgXCJVbml2ZXJzYWwtSm9iIEFHXCIsXCJEZWxsIFNBXCIsXCJESEwgRXhwcmVzcyAoU2Nod2VpeikgQUdcIixcIkFsbGlhbnogU3Vpc3NlIFZlcnNpY2hlcnVuZ3MtR2VzZWxsc2NoYWZ0XCJcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsIGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQiA9ZmlsdGVyKGRhdGFfQixmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0MgPWZpbHRlcihkYXRhX0MsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9EID1maWx0ZXIoZGF0YV9ELGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfRSA9ZmlsdGVyKGRhdGFfRSwgZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9GPWZpbHRlcihkYXRhX0YsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9HID1maWx0ZXIoZGF0YV9HLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfSCA9ZmlsdGVyKGRhdGFfSCxmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREE9IERhdGFNYW5hZ2VyLmdldER1bW15X0VEQShkYXRhX0IsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0MsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FRkQ9IERhdGFNYW5hZ2VyLmdldER1bW15X0VGRChkYXRhX0QsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FSlBEPSBEYXRhTWFuYWdlci5nZXREdW1teV9FSlBEKGRhdGFfRSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX1VWRUs9IERhdGFNYW5hZ2VyLmdldER1bW15X1VWRUsoZGF0YV9GLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfVkJTPSBEYXRhTWFuYWdlci5nZXREdW1teV9WQlMoZGF0YV9HLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfV0JGPSBEYXRhTWFuYWdlci5nZXREdW1teV9XQkYoZGF0YV9ILCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjaGVja0NvdW50Um93c1N1cHBsaWVyKCk7Ly9jaGVjayBpZiBleGlzdCA4IHJvd3MgcGVyIGRlcGFydGVtZW50KG1hdHJpeClcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbIG1vZHVsLl9kc19zdXBwbGllcl9CSywgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VESSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VGRCxcclxuICAgICAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FSlBELCBtb2R1bC5fZHNfc3VwcGxpZXJfVVZFSywgbW9kdWwuX2RzX3N1cHBsaWVyX1ZCUywgbW9kdWwuX2RzX3N1cHBsaWVyX1dCRixcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsIFwic3VtQnVuZGVza2FuemVsdFwiLCBcInN1bUVEQVwiLFxyXG4gICAgICAgICAgICAgICAgW1wic3VtQnVuZGVza2FuemVsdFwiLFwic3VtRURBXCIsXCJzdW1FRElcIiwgXCJzdW1FRkRcIixcclxuICAgICAgICAgICAgICAgICAgICBcInN1bUJGTVwiLCBcInN1bVVWRUtcIiwgXCJzdW1WQlNcIiwgXCJzdW1XQkZcIl0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiY3N2L0VEQSAtIDIwMTEuY3N2XCI6XHJcbiAgICAgICAgY2FzZSBcImNzdi9FREEgLSAyMDEzLmNzdlwiOlxyXG4gICAgICAgIGNhc2UgXCJjc3YvRURBIC0gMjAxNC5jc3ZcIjpcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0U3VwcGxpZXJfRURBKG1vZHVsLl9zdXBwbGllciwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgc3VwcGxpZXIgPSBtYXRyaXhfU3VwcGxpZXJfRURBKG1vZHVsLl9kc19zdXBwbGllcl9FREEsIDQpO1xyXG4gICAgICAgICAgICBtb2R1bC5fc3VwcGxpZXI9IG1vZHVsLl9kc19zdXBwbGllcl9FREE7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJEdW1teVwiOlxyXG4gICAgICAgICAgICB2YXIgZHVtbXlFREE9RGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGEsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIHZhciBkdW1teUVEST1EYXRhTWFuYWdlci5nZXREdW1teV9FREkoZGF0YV9CLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFtkdW1teUVEQSwgZHVtbXlFREldKTtcclxuICAgICAgICAgICAgLy9tb2R1bC5fZHNfc3VwcGxpZXIgPSBtYXRyaXhfZHVtbWF5X0FsbChjc3ZhbGwpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLFwic3VtRURBXCIsIFwic3VtRURJXCIsIFtcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWFkY3N2OmRlZmF1bHRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllciAgICA9IERhdGFNYW5hZ2VyLmdldFN1cHBsaWVyKG1vZHVsLl9zdXBwbGllciwgXCJzdXBwbGllclwiKTsvL25lc3RcclxuICAgICAgICAgICAgc3VwcGxpZXIgPSBtYXRyaXhfU3VwcGxpZXIoZGF0YSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19kZXB0ICAgICAgICA9IERhdGFNYW5hZ2VyLmdldERlcChtb2R1bC5fc3VwcGxpZXIsIFwiZGVwdFwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX2Nvc3QgICAgICAgID0gRGF0YU1hbmFnZXIuZ2V0Q29zdChtb2R1bC5fc3VwcGxpZXIsIFwiRURBXzEwMDZcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcInNldG1hdHJpeFwiKTtcclxufVxyXG5mdW5jdGlvbiBmaWx0ZXIoZGF0YSwgcGFyYW0sIGZpbHRlcm5hbWUpe1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgZmlsdGVyXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgLyogaWYgKHBhcmFtLmxlbmd0aD09Mil7XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgICAgICBpZiAocm93W2ZpbHRlcm5hbWVdID09IHBhcmFtWzBdXHJcbiAgICAgICAgICAgICAgICB8fCAgcm93W2ZpbHRlcm5hbWVdID09IHBhcmFtWzFdXHJcbiAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgeyAgcmV0dXJuIHJvdzsgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGVsc2UgIGlmIChwYXJhbS5sZW5ndGg9PTMpe1xyXG4gICAgICAgIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgaWYgKHJvd1tmaWx0ZXJuYW1lXSA9PSBwYXJhbVswXVxyXG4gICAgICAgICAgICAgICAgfHwgIHJvd1tmaWx0ZXJuYW1lXSA9PSBwYXJhbVsxXVxyXG4gICAgICAgICAgICAgICAgfHwgIHJvd1tmaWx0ZXJuYW1lXSA9PSBwYXJhbVsyXSlcclxuICAgICAgICAgICAgeyAgcmV0dXJuIHJvdzsgICAgfVxyXG4gICAgICAgIH0pOyovXHJcbiAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgZm9yICh2YXIgaT0wO2k8IHBhcmFtLmxlbmd0aDtpKyspIHtcclxuICAgICAgICAgICAgaWYgKHJvd1tmaWx0ZXJuYW1lXT09IHBhcmFtW2ldKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdztcclxuICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyKGRhdGEpIHtcclxuICAgICAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICAgICAgdmFyIGNvdW50ZXI9MDtcclxuICAgICAgICAvL21vZHVsLl9kc19zdXBwbGllcltpXS52YWx1ZXNbMF0ua2V5ID1cIkVEQVwiXHJcbiAgICAgICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKS5zbGljZSgxKTtcclxuICAgICAgICAvL1NwYWx0ZW7DvGJlcnNjaHJpZnRlblxyXG4gICAgICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XHJcbiAgICAgICAgICAgIGlmIChjb3VudGVyIDwgMikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1yb3cgPSBbXTtcclxuICAgICAgICAgICAgICAgIHN1cHBsaWVyLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYyA9PSBcIjEwMDUgRURBXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1yb3cucHVzaChOdW1iZXIocm93W2NdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT0gXCIxMDA2IEVEQVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtcm93LnB1c2goTnVtYmVyKHJvd1tjXSkpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcclxuICAgICAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbW9kdWwuX21hdHJpeCA9IG1hdHJpeDtcclxuICAgICAgICByZXR1cm4gc3VwcGxpZXI7XHJcbiAgICB9XHJcblxyXG5mdW5jdGlvbiBjaGVja0NvdW50Um93c1N1cHBsaWVyKCApe1xyXG4gICAgY29uc29sZS5sb2coXCJtZXRob2Q6Y2hlY2tDb3VudFJvd3NTdXBwbGllclwiKTtcclxuICAgIHZhciBkaWZmPTA7XHJcbiAgICB2YXIgY291bnRkZXB0PTg7XHJcblxyXG4gICAgdmFyIHN1cHBsaWVyYXJyYXk9W21vZHVsLl9kc19zdXBwbGllcl9CSyxcclxuICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREEsXHJcbiAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURJLFxyXG4gICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VGRCxcclxuICAgIG1vZHVsLl9kc19zdXBwbGllcl9FSlBELFxyXG4gICAgbW9kdWwuX2RzX3N1cHBsaWVyX1VWRUssXHJcbiAgICBtb2R1bC5fZHNfc3VwcGxpZXJfVkJTLFxyXG4gICAgbW9kdWwuX2RzX3N1cHBsaWVyX1dCRl07XHJcblxyXG4gICAgc3VwcGxpZXJhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHJvd3MpIHtcclxuICAgICAgICB2YXIga2V5emFobD0xMDA7XHJcbiAgICAgICAgdmFyIG5vZGVOYW1lID1cIm5vZGVuYW1lXCI7XHJcbiAgICAgICAgdmFyIG5ld0dyb3VwID0gMTAwO1xyXG5cclxuICAgICAgICBpZiAocm93cy5sZW5ndGggICA8IGNvdW50ZGVwdCl7XHJcbiAgICAgICAgICBkaWZmPWNvdW50ZGVwdC0ocm93cy5sZW5ndGgpO1xyXG4gICAgICAgICAgZm9yICh2YXIgaT0wO2k8ZGlmZjtpKyspe1xyXG4gICAgICAgICAgICAgIGtleXphaGwrPWk7XHJcbiAgICAgICAgICAgICAgLy9yb3dzLnB1c2goe2tleTprZXl6YWhsLCB2YWx1ZXM6W1wibnVsbFwiXX0pO1xyXG4gICAgICAgICAgICAgIC8vcm93cy5wdXNoKCB7XCJ2YWx1ZXNcIjp7XCJuYW1lXCI6bm9kZU5hbWUsXCJncm91cFwiOm5ld0dyb3VwfX0pO1xyXG4gICAgICAgICAgICAgIHJvd3MucHVzaCh7a2V5OmtleXphaGwsIHZhbHVlczpbe2tleTpcIm51bGxcIn1dfSk7Ly9vYmpla3QgbWl0IGVpbmVtIGFycmF5IHdvIGVpbiBvYmpla3QgaXN0XHJcbiAgICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRyaXhfU3VwcGxpZXJfRURJKGRhdGEsIGVuZCkge1xyXG4gICAgLy9GaWxsIE1hdHJpeCBFREFcclxuICAgIHZhciBtYXRyaXggPSBbXTtcclxuICAgIHZhciBjb3VudGVyPTA7XHJcbiAgICB2YXIgc3VwcGxpZXIgPSBkMy5rZXlzKGRhdGFbMF0pO1xyXG4gICAgLy9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPCBlbmQpIHtcclxuICAgICAgICAgICAgdmFyIG1yb3cgPSBbXTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1HU0VESVwiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtRUJHXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CQVJcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUJBS1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtTWV0ZW9DSFwiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkFHXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CRlNcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUJTVlwiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtU0JGXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1OQlwiXSk7XHJcbiAgICAgICAgICAgIGNvdW50ZXIrKztcclxuICAgICAgICAgICAgbWF0cml4LnB1c2gobXJvdyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGNvbnNvbGUubG9nKFwibWF0cml4X1N1cHBsaWVyX0VEQVwiKTtcclxuICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICByZXR1cm4gc3VwcGxpZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXBhcmVDU1YoZGF0YUEsIGRhdGFCLCBkYXRhQyxkYXRhRCwgZmllbGQpIHtcclxuICAgIHZhciBtcm93ID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFBLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkYXRhQi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoZGF0YUFbaV1bZmllbGRdID09IGRhdGFCW2pdW2ZpZWxkXSkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBkYXRhQy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhQVtpXVtmaWVsZF0gPT0gZGF0YUNba11bZmllbGRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBsID0gMDsgbCA8IGRhdGFELmxlbmd0aDsgbCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUFbaV1bZmllbGRdID09IGRhdGFEW2xdW2ZpZWxkXSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1yb3cubGVuZ3RoIDwgNCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1yb3cucHVzaChkYXRhQVtpXVtmaWVsZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tleGlzdFJvdyhtcm93LCBkYXRhQVtpXVtmaWVsZF0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXJvdy5wdXNoKGRhdGFBW2ldW2ZpZWxkXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcIioqKioqKioqKioqUmVzdWx0OmNvbXBhcmUgQ1NWXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCIqKioqKioqKioqKlwiK2ZpZWxkKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXJvdy5sZW5ndGg7IGkrKylcclxuICAgICAgICBjb25zb2xlLmxvZyhtcm93W2ldKTtcclxufVxyXG5mdW5jdGlvbiBjaGVja2V4aXN0Um93KG1yb3csIG9uZXJvdyl7XHJcbiAgICAvKmlmIChtcm93Lmxlbmd0aD4yKVxyXG4gICAgIGlmIChjaGVja2V4aXN0Um93KG1yb3csIGRhdGFDW2tdW2ZpZWxkXSkpXHJcbiAgICAgbXJvdy5wdXNoKGRhdGFBW2ldW2ZpZWxkXSk7Ki9cclxuICAgIHZhciBjaGVjaz10cnVlO1xyXG4gICBpZiAobXJvdy5sZW5ndGggPiAxKXtcclxuICAgICAgIGZvcih2YXIgaT0wO2k8bXJvdy5sZW5ndGg7aSsrKXtcclxuICAgICAgICAgICBpZiAobXJvd1tpXT09b25lcm93KXtcclxuICAgICAgICAgICAgICAgY2hlY2s9ZmFsc2U7XHJcbiAgICAgICAgICAgfVxyXG4gICAgICAgfVxyXG4gICB9XHJcbiAgICByZXR1cm4gY2hlY2s7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1hdHJpeF9FRElfRURBKERhdGFFRElfRURBLCBOYW1lX3N1bUVEQSwgTmFtZV9zdW1FREksIE5hbWVzX3N1bXNFREFfRURJX0JLKXtcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIG1hdHJpeF9FRElfRURBIGZpbGVzXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIHZhciBtYXRyaXggPSBbXTtcclxuICAgIHZhciBzdXBwbGllcj1cIlwiO1xyXG4gICAgdmFyIG1pbnVzPTQwMDAwMDA7XHJcbiAgICB2YXIgbGVuZ3RoID0gRGF0YUVESV9FREEubGVuZ3RoO1xyXG4gICAgdmFyIHRvdGFsbGVuZ3RoID0gKGxlbmd0aC8oTmFtZXNfc3Vtc0VEQV9FRElfQksubGVuZ3RoKSkqMjtcclxuICAgIHZhciBtaWRkbGU9IGQzLnJvdW5kKGxlbmd0aC9OYW1lc19zdW1zRURBX0VESV9CSy5sZW5ndGgpO1xyXG4gICAgdmFyIHZvYmplY3RpZD0wO1xyXG4gICAgaWYgKE5hbWVzX3N1bXNFREFfRURJX0JLLmxlbmd0aD09OCl7XHJcbiAgICAgICAgdG90YWxsZW5ndGg9MTY7XHJcbiAgICAgICAgbWlkZGxlPXRvdGFsbGVuZ3RoLzI7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vQXJyYXkgZmlsdGVyblxyXG4gICAgZm9yICh2YXIgaT0wO2k8dG90YWxsZW5ndGg7aSsrICl7XHJcbiAgICAgICAgdmFyIG1yb3c9W107XHJcbiAgICAgICAgaWYgKGk9PW1pZGRsZSlcclxuICAgICAgICAgICAgdm9iamVjdGlkPTA7XHJcbiAgICAgICAgaWYgKGkgPCBtaWRkbGUpe1xyXG4gICAgICAgICAgICBmb3IodmFyIGo9MDtqPG1pZGRsZTtqKyspXHJcbiAgICAgICAgICAgICAgICBtcm93LnB1c2goMCk7XHJcbiAgICAgICAgICAgIGZvcih2YXIgaj0wO2o8bWlkZGxlO2orKyl7XHJcbiAgICAgICAgICAgICAgICBtcm93LnB1c2goZ2V0TWF0cml4VmFsdWUoRGF0YUVESV9FREFbdm9iamVjdGlkXSxOYW1lc19zdW1zRURBX0VESV9CSyx2b2JqZWN0aWQgKSk7XHJcbiAgICAgICAgICAgICAgICB2b2JqZWN0aWQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBmb3IodmFyIGo9MDtqPG1pZGRsZTtqKyspe1xyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKGdldE1hdHJpeFZhbHVlKERhdGFFRElfRURBW3ZvYmplY3RpZF0sTmFtZXNfc3Vtc0VEQV9FRElfQkssdm9iamVjdGlkKSk7XHJcbiAgICAgICAgICAgICAgICB2b2JqZWN0aWQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IodmFyIGo9MDtqPG1pZGRsZTtqKyspXHJcbiAgICAgICAgICAgICAgICBtcm93LnB1c2goMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgfVxyXG4gICAgbW9kdWwuX21hdHJpeCA9IG1hdHJpeDtcclxuICAgIHdoaWxlKG1vZHVsLl9zdXBwbGllci5sZW5ndGggPiAwKVxyXG4gICAgICAgICBtb2R1bC5fc3VwcGxpZXIucG9wKCk7XHJcbiAgICBjcmVhdGVTdXBwbGllckxpc3QoRGF0YUVESV9FREEsTmFtZXNfc3Vtc0VEQV9FRElfQksgKTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBtYXRyaXhfRURJX0VEQVwiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgICByZXR1cm4gc3VwcGxpZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN1cHBsaWVyTGlzdChkYXRhUm93cywgc3VwcGxpZXJfZmllbGQpe1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgY3JlYXRlU3VwcGxpZXJMaXN0XCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIHZhciB2X1N1cHBsaWVyPXN1cHBsaWVyX2ZpZWxkLmxlbmd0aDtcclxuICAgIHZhciBpPTA7XHJcbiAgICB2YXIgZW5kO1xyXG4gICAgaWYgKHZfU3VwcGxpZXI9PTQpe1xyXG4gICAgICAgIGVuZD12X1N1cHBsaWVyKjM7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIGVuZD12X1N1cHBsaWVyKjI7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcImNyZWF0ZVN1cHBsaWVyTGlzdDpcIitlbmQpO1xyXG5cclxuICAgIC8vZmlyc3QgZGVwdFxyXG4gICAgaWYgKGVuZD09NCl7XHJcbiAgICAgICAgd2hpbGUoIGk8ZW5kKXtcclxuICAgICAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnB1c2goZGF0YVJvd3NbaV0udmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgaT1pK3ZfU3VwcGxpZXI7Ly8rNFxyXG4gICAgICAgIH1cclxuICAgICAgICAvL3NlY29uZCBzdXBwbGllclxyXG4gICAgICAgIGZvciAodmFyIGk9MDtpPHZfU3VwcGxpZXI7IGkrKyl7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChlbmQ9PTYgfHwgZW5kPT0xMil7XHJcbiAgICAgICAgd2hpbGUoIGk8PWVuZCl7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgIGk9aSt2X1N1cHBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3NlY29uZCBzdXBwbGllclxyXG4gICAgICAgIGZvciAodmFyIGk9MDtpPHZfU3VwcGxpZXI7IGkrKyl7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNley8vdGVzdFxyXG4gICAgICAgIHN1cHBsaWVybGFiZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLzggZGVwdGVcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIGNyZWF0ZVN1cHBsaWVyTGlzdCBcIitcInN1cHBsaWVyXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxufVxyXG5mdW5jdGlvbiBzdXBwbGllcmxhYmVsKCl7XHJcblxyXG4gICAgIHZhciBmaWx0ZXJjb250ZW50PVtcIkFpclBsdXMgSW50ZXJuYXRpb25hbCBBR1wiLFwiU2Nod2VpemVyaXNjaGUgQnVuZGVzYmFobmVuIFNCQlwiLFxyXG4gICAgICAgIFwiRGllIFNjaHdlaXplcmlzY2hlIFBvc3QgU2VydmljZSBDZW50ZXIgRmluYW56ZW4gTWl0dGVcIixcIlNSRyBTU1IgaWTDqWUgc3Vpc3NlIE1lZGlhIFNlcnZpY2VzXCIsXHJcbiAgICAgICAgXCJVbml2ZXJzYWwtSm9iIEFHXCIsXCJEZWxsIFNBXCIsXCJESEwgRXhwcmVzcyAoU2Nod2VpeikgQUdcIixcIkFsbGlhbnogU3Vpc3NlIFZlcnNpY2hlcnVuZ3MtR2VzZWxsc2NoYWZ0XCJcclxuICAgIF07XHJcbiAgICB2YXIgZGVwdD1bXCJCS1wiLCBcIkVESVwiLFwiRURBXCIsXCJFRkRcIixcIkVKUERcIixcIlVWRUtcIixcIlZCU1wiLCBcIldCS1wiXTtcclxuXHJcbiAgIC8vZGVwdFxyXG4gICAgZm9yICh2YXIgaT0wO2k8ODtpKyspe1xyXG4gICAgICAgIGVsZW1lbnRzPXtcImtleVwiOmRlcHRbaV0sIFwidmFsdWVzXCI6W2RlcHRbaV0sIDIwXX07XHJcbiAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnB1c2goZWxlbWVudHMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvL3N1cHBsaWVyXHJcbiAgICBmb3IgKHZhciBpPTA7aTw4O2krKyl7XHJcbiAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnB1c2goZmlsdGVyY29udGVudFtpXSk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gZ2V0TWF0cml4VmFsdWUocm93LG5hbWVWYWx1ZSwgY291bnRlcil7XHJcbiAgICB2YXIgZGVwTmFtZTsgICAgLy9nZXQgRmllbGRuYW1lIHN1bSBvZiBlYWNoIERlcGFydG1lbnRcclxuICAgIHZhciByZXN1bHQ9MDtcclxuICAgIGlmIChuYW1lVmFsdWUubGVuZ3RoPT0yKSB7XHJcbiAgICAgICAgc3dpdGNoIChjb3VudGVyKSB7Ly8yIFN1cHBsaWVyXHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgZGVwTmFtZSA9IG5hbWVWYWx1ZVswXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGRlcE5hbWUgPSBuYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAgIGVsc2UgaWYgKG5hbWVWYWx1ZS5sZW5ndGg9PTMpe1xyXG4gICAgICAgICAgICBzd2l0Y2goY291bnRlcil7Ly8zIFN1cHBsaWVyXHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobmFtZVZhbHVlLmxlbmd0aD09NCkgICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoKGNvdW50ZXIpey8vNCBTdXBwbGllclxyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA4OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxMDpcclxuICAgICAgICAgICAgICAgIGNhc2UgMTE6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgMTQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE1OlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzNdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuYW1lVmFsdWUubGVuZ3RoPT04KXtcclxuICAgICAgICAgIGlmIChjb3VudGVyIDw4KXtcclxuICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVswXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGNvdW50ZXIgPCAxNil7XHJcbiAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChjb3VudGVyIDwgMjQpe1xyXG4gICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzJdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoY291bnRlciA8IDMyKXtcclxuICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVszXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGNvdW50ZXIgPCA0MCl7XHJcbiAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbNF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChjb3VudGVyIDwgNDgpe1xyXG4gICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzVdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoY291bnRlciA8IDU2KXtcclxuICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVs2XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbN107XHJcbiAgICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAgICBpZiAocm93LnZhbHVlc1swXS5rZXkhPVwibnVsbFwiKXtcclxuICAgICAgICAgICAgcmVzdWx0PWQzLnJvdW5kKHJvdy52YWx1ZXNbMF0udmFsdWVbZGVwTmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmZ1bmN0aW9uIG1hdHJpeF9TdXBwbGllcl9FREEoZGF0YSwgZW5kKSB7XHJcbiAgICAvL0ZpbGwgTWF0cml4IEVEQVxyXG4gICAgdmFyIG1hdHJpeCA9IFtdO1xyXG4gICAgdmFyIGNvdW50ZXI9MDtcclxuICAgIHZhciBzdXBwbGllciA9IGQzLmtleXMoZGF0YVswXSk7XHJcblxyXG4gICAgLy9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgIGRhdGEuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPCBlbmQpIHtcclxuICAgICAgICAgICAgdmFyIG1yb3cgPSBbXTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1FREExMDA1XCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1FREExMDA2XCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW0xMDk3XCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW0xMTEyXCJdKTtcclxuICAgICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJwdXNoXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgbW9kdWwuX21hdHJpeCA9IG1hdHJpeDtcclxuICAgIGNvbnNvbGUubG9nKFwibWF0cml4X1N1cHBsaWVyX0VESVwiKTtcclxuICAgIHJldHVybiBzdXBwbGllcjtcclxufVxyXG5cclxuZnVuY3Rpb24gbWVyZ2luZ0ZpbGVzKGNzdkZpbGVzKSB7XHJcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlciAgK1wiIG1lcmdpbmcgZmlsZXNcIik7XHJcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgdmFyIG91dHB1dDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3N2RmlsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICByZXN1bHRzLnB1c2goY3N2RmlsZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgb3V0cHV0ID0gZDMubWVyZ2UocmVzdWx0cyk7XHJcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufVxyXG5cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjEuMTAuMjAxNi5cclxuICovXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGNyZWF0ZUFyYzpjcmVhdGVBcmMsXHJcbiAgICBsYXlvdXQ6bGF5b3V0LFxyXG4gICAgcGF0aDpwYXRoLFxyXG4gICAgc2V0U1ZHOnNldFNWRyxcclxuICAgIGFwcGVuZENpcmNsZTphcHBlbmRDaXJjbGUsXHJcbiAgICBtb3Zlc3ZnOm1vdmVzdmcsXHJcbiAgICBzdGFydHF1ZXVlOnN0YXJ0cXVldWVcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQXJjKCl7XHJcbiAgICBtb2R1bC5fYXJjID0gZDMuc3ZnLmFyYygpXHJcbiAgICAgICAgLmlubmVyUmFkaXVzKG1vZHVsLl9pbm5lclJhZGl1cylcclxuICAgICAgICAub3V0ZXJSYWRpdXMobW9kdWwuX291dGVyUmFkaXVzKVxyXG4gICAgY29uc29sZS5sb2coXCJjcmVhdGVBcmNcIik7XHJcbn1cclxuLy8zXHJcbmZ1bmN0aW9uIGxheW91dCgpey8vcGFkZGluZyAwLjA0IGFic3RhbmQgNCVcclxuICAgIG1vZHVsLl9sYXlvdXQgPSBkMy5sYXlvdXQuY2hvcmQoKVxyXG4gICAgICAgIC5wYWRkaW5nKC4wNClcclxuICAgICAgICAuc29ydFN1Ymdyb3VwcyhkMy5kZXNjZW5kaW5nKVxyXG4gICAgICAgIC5zb3J0Q2hvcmRzKGQzLmFzY2VuZGluZyk7XHJcbiAgICBjb25zb2xlLmxvZyhcImxheW91dFwiKTtcclxufVxyXG4vLzRcclxuZnVuY3Rpb24gcGF0aCgpe1xyXG4gICAgbW9kdWwuX3BhdGggPSBkMy5zdmcuY2hvcmQoKVxyXG4gICAgICAgIC5yYWRpdXMobW9kdWwuX2lubmVyUmFkaXVzKTtcclxuICAgIGNvbnNvbGUubG9nKFwicGF0aFwiKTtcclxufVxyXG4vLzVcclxuZnVuY3Rpb24gc2V0U1ZHKCl7XHJcbiAgICBtb2R1bC5fc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIilcclxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIG1vZHVsLl93aWR0aClcclxuICAgICAgICAuYXR0cihcImhlaWdodFwiLG1vZHVsLl9oZWlnaHQpXHJcbiAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAuYXR0cihcImlkXCIsIFwiY2lyY2xlXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtb2R1bC5fd2lkdGggLyAyICsgXCIsXCIgKyBtb2R1bC5faGVpZ2h0IC8gMiArIFwiKVwiKTtcclxufVxyXG5cclxuXHJcbi8vNlxyXG5mdW5jdGlvbiBhcHBlbmRDaXJjbGUoKXtcclxuICAgIG1vZHVsLl9zdmcuYXBwZW5kKFwiY2lyY2xlXCIpXHJcbiAgICAgICAgLmF0dHIoXCJyXCIsbW9kdWwuX291dGVyUmFkaXVzKTtcclxuICAgIGNvbnNvbGUubG9nKFwiYXBwZW5kQ2lyY2xlXCIpO1xyXG59XHJcbi8vMTRcclxuZnVuY3Rpb24gbW92ZXN2Zygpe1xyXG4gICAgbW9kdWwuX3N2ZyA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwic3ZnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBtb2R1bC5fd2lkdGgpXHJcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgbW9kdWwuX2hlaWdodClcclxuICAgICAgICAuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiK21vZHVsLl93aWR0aCtcIixcIittb2R1bC5faGVpZ2h0K1wiKVwiKTtcclxuICAgIGNvbnNvbGUubG9nKFwibW92ZXN2Z1wiKTtcclxufVxyXG5mdW5jdGlvbiBzdGFydHF1ZXVlKGNzdl9uYW1lLCBqc29uX25hbWUpe1xyXG4gICAgcXVldWUoKVxyXG4gICAgICAgIC5kZWZlcihkMy5jc3YsIGNzdl9uYW1lKVxyXG4gICAgICAgIC5kZWZlcihkMy5qc29uLCBqc29uX25hbWUpXHJcbiAgICAgICAgLmF3YWl0KGtlZXBEYXRhKTsvL29ubHkgZnVuY3Rpb24gbmFtZSBpcyBuZWVkZWRcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDIxLjEwLjIwMTYuXHJcbiAqL1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5tb2R1bGUuZXhwb3J0cz17XHJcbiAgICBjcmVhdGVUaXRsZTpjcmVhdGVUaXRsZVxyXG59XHJcbiBmdW5jdGlvbiBjcmVhdGVUaXRsZSgpIHtcclxuICAgICBtb2R1bC5fY2hvcmQuYXBwZW5kKFwidGl0bGVcIikudGV4dChmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIHJldHVybiBtb2R1bC5fc3VwcGxpZXJbZC5zb3VyY2UuaW5kZXhdLnN1cHBsaWVyXHJcbiAgICAgICAgICAgICsgXCIg4oaSIFwiICsgbW9kdWwuX3N1cHBsaWVyW2QudGFyZ2V0LmluZGV4XS5zdXBwbGllclxyXG4gICAgICAgICAgICArIFwiOiBcIiArIG1vZHVsLl9mb3JtYXRQZXJjZW50KGQuc291cmNlLnZhbHVlKVxyXG4gICAgICAgICAgICArIFwiXFxuXCIgKyBtb2R1bC5fc3VwcGxpZXJbZC50YXJnZXQuaW5kZXhdLnN1cHBsaWVyXHJcbiAgICAgICAgICAgICsgXCIg4oaSIFwiICsgbW9kdWwuX3N1cHBsaWVyW2Quc291cmNlLmluZGV4XS5zdXBwbGllclxyXG4gICAgICAgICAgICArIFwiOiBcIiArbW9kdWwuX2Zvcm1hdFBlcmNlbnQoZC50YXJnZXQudmFsdWUpO1xyXG4gICAgfSk7XHJcbn0iLCIvKipcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjUuMTAuMjAxNi5cbiAqL1xuLy9zdGFydCBmaWxlLy9cblwidXNlIHN0cmljdFwiO1xuICAgIHZhciBtb2R1bCA9ICAgcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9Nb2R1bCcpO1xuLy92YXIgU2V0dGluZ0RhdGEgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdEYXRhJyk7XG4gICAgdmFyIFNldHRpbmdMYXlvdXQgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdMYXlvdXQnKTtcbiAgICB2YXIgU2V0dGluZ0Nob3JkcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0Nob3JkcycpO1xuICAgIHZhciBTZXR0aW5nSW5wdXQgID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9TZXR0aW5nSW5wdXQnKTtcbiAgICB2YXIgU2V0dGluZ0dyb3VwcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0dyb3VwcycpO1xuICAgIHZhciBTZXR0aW5nVGl0bGUgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdUaXRsZScpO1xuICAgIHZhciBDcmVhdGluZ0xpbmtzID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9DcmVhdGluZ0xpbmtzJyk7XG4gICAgdmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9EYXRhTWFuYWdlcicpO1xuICAgIHZhciBxO1xuICAgIHZhciB1cmwgPSByZXF1aXJlKCd1cmwnKSA7XG4gICAgdmFyIHBhcnNlID0gcmVxdWlyZSgndXJsLXBhcnNlJyk7XG4gICAgLy92YXIgbXlxdWVyeXN0cmluZyA9IHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJyk7XG5cbmdsb2JhbC5zdGFydHdpdGhMaW5rPWZ1bmN0aW9uKGNob2ljZSwgY29udGVudCwgY2hvaWNlX0MsIGxvYyl7XG4gICAgY29uc29sZS5sb2coXCJzdmcucmVtb3ZlKClcIik7XG4gICAgZDMuc2VsZWN0KFwic3ZnXCIpLnJlbW92ZSgpO1xuICAgIGNvbnNvbGUubG9nKFwiKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcIik7XG4gICAgY29uc29sZS5sb2coXCJcIik7XG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXI9MDtcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBzdGFydCB3aXRoIExpbms6XCIrY2hvaWNlK1wiIFwiK2NvbnRlbnQrXCIgXCIrY2hvaWNlX0MpO1xuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XG4gICAgaWYgKGNvbnRlbnQgIT1udWxsKVxuICAgICAgICBtb2R1bC5fdl9jaG9pY2U9Y29udGVudDtcbiAgICBzdGFydGluZ3dpdGhRdWVyeShtb2R1bC5fdl9jaG9pY2UpO1xufTtcbi8qZ2xvYmFsLnN0YXJ0dXJsbW9kdXM9ZnVuY3Rpb24obG9jKXtcbiAgICB2YXIgcGFyc2VkID1wYXJzZShsb2MpO1xuICAgIHZhciBwYXJ0cz11cmwucGFyc2UoXCInXCIrbG9jK1wiJ1wiLCB0cnVlKTtcbiAgICBwYXJzZWQuc2V0KCdob3N0bmFtZScsICd5YWhvby5jb20nKTtcblxuICAgIGNvbnNvbGUubG9nKFwiTG9jYXRpb24gXCIrbG9jKTtcbiAgICBjb25zb2xlLmxvZyhcIlBhcnNlZCBcIitwYXJzZWQpO1xuICAgIGNvbnNvbGUubG9nKFwiVXJsIGZvcm1hdHNcIit1cmwuZm9ybWF0KHBhcnRzKSk7XG5cbiAgICB2YXIgcXVlcnlPYmplY3QgPSB1cmwucGFyc2UoXCInXCIrbG9jK1wiJ1wiLHRydWUpLnF1ZXJ5Oy8vZ2V0IHF1ZXJ5c3RyaW5nXG4gICAgY29uc29sZS5sb2cocXVlcnlPYmplY3QpO1xuICAgIGNyZWF0ZV9jaG9pY2V2YXJpYWJsZShxdWVyeU9iamVjdCk7XG4gICAgLy9lcnN0ZWxsdCBkZW4gdmNob2ljZSBzdHJpbmdcbn07Ki9cbmZ1bmN0aW9uIGNyZWF0ZV9jaG9pY2V2YXJpYWJsZShxdWVyeW9iamVjdHMpe1xuICAgIC8vJ0VEQV9FRElfMjAxMSc6XG4gICAgdmFyIHRlbXA7XG5cbiAgICAvL21vZHVsLl92Y2hvaWNlPVwiXCI7XG59XG4gICAgLy8gQ3JlYXRlTGlua1xuZ2xvYmFsLnN0YXJ0Y3JlYXRpbmdsaW5rPWZ1bmN0aW9uKGRlcHQsIHN1cHBsaWVyLCBjYXRlZ29yeSwgeWVhcil7XG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgc3RhcnQgY3JlYXRpbmdsaW5rXCIpO1xuICAgIENyZWF0aW5nTGlua3Muc2V0Q3VycmVudFVybChcImhvc3RuYW1lXCIpO1xuICAgIENyZWF0aW5nTGlua3Muc2V0UGFyYW0oZGVwdCxzdXBwbGllciwgY2F0ZWdvcnksIHllYXIpO1xuICAgIENyZWF0aW5nTGlua3MuY3JlYXRlTGluaygpO1xuXG4gICAgLy9yZXR1cm4gbW9kdWwuX2h0dHBfcXVlcnk7XG4gICAgLy9yZXR1cm4gbW9kdWwuX3ZodHRwK1wiP2Nob2ljZT1cIittb2R1bC5fdl9jaG9pY2U7XG59O1xuXG4vL3N0YXJ0aW5nIHdpdGggY2hvaWNlZCBjc3YtZmlsc1xuZ2xvYmFsLnN0YXJ0cHJvY2Vzc2dsb2JhbCA9IGZ1bmN0aW9uKGNob2ljZSxjb250ZW50LCBjb250ZW50X0IsY29udGVudF9DLGNvbnRlbnRfRCkge1xuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIHN0YXJ0cHJvY2Vzc2dsb2JhbFwiKTtcbiAgICBtb2R1bC5fY3VycmVudGNzdj1cIlwiO1xuICAgIG1vZHVsLl92X2Nob2ljZT1jaG9pY2U7XG4gICAgc2V0dGluZ1BhcmFtKDAsIDAsIDcyMCwgNzIwLCA2LCAxNSwgMCwgMCk7XG4gICAgcHJvY2Vzcyhjb250ZW50LCBjb250ZW50X0IsY29udGVudF9DLGNvbnRlbnRfRCk7XG59O1xuXG4vL2NoYW5naW5nIHdpZHRoLCBoZWlnaHQsIG91dGVyIHJhZGl1cyBwZXIgaHRtbFxuZ2xvYmFsLnN0YXJ0cHJvY2Vzc0Rlc2lnbj1mdW5jdGlvbihjb250ZW50LCBuYW1lLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXNfaSwgcmFkaXVzX28pe1xuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIHN0YXJ0cHJvY2Vzc0Rlc2lnblwiKTtcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xuICAgIG1vZHVsLl9jdXJyZW50Y3N2PVwiXCI7XG4gICAgY29uc29sZS5sb2coXCJwcm9jZXNzOmRlc2lnblwiK2NvbnRlbnQpO1xuICAgIGNvbnNvbGUubG9nKHdpZHRoICtcIiBcIisgaGVpZ2h0ICtcIiBcIiArcmFkaXVzX28pO1xuICAgIHNldHRpbmdQYXJhbSgwLCAwLCB3aWR0aCwgaGVpZ2h0LCA2LCAxNSwgMCwgcmFkaXVzX28pO1xuICAgIHByb2Nlc3MoY29udGVudCk7XG59O1xuZnVuY3Rpb24gaGFzRmlsZShmaWxlbmFtZSwgZmlsZW5hbWVfQiwgZmlsZW5hbWVfQywgZmlsZW5hbWVfRCxmaWxlbmFtZV9FLCBmaWxlbmFtZV9GLCBmaWxlbmFtZV9HLCBmaWxlbmFtZV9IKXtcbiAgICBpZiAoZmlsZW5hbWVfQyE9MCl7ICAgICAvL2zDtnN1bmcgaW1tZXIgNCBmaWxlcyBtaXRnZWJlbiovXG4gICAgICAgIG1vZHVsLl9jdXJyZW50Y3N2X0M9XCJjc3YvXCIrZmlsZW5hbWVfQztcbiAgICAgICAgbW9kdWwuX2NvdW50RGVwPTI7XG4gICAgfVxuICAgIGlmIChmaWxlbmFtZV9EIT0wKXtcbiAgICAgICAgbW9kdWwuX2N1cnJlbnRjc3ZfRD1cImNzdi9cIitmaWxlbmFtZV9EO1xuICAgICAgICBtb2R1bC5fY291bnREZXA9MztcbiAgICB9XG4gICAgaWYgKGZpbGVuYW1lX0UhPTApeyAgICAgLy9sw7ZzdW5nIGltbWVyIDQgZmlsZXMgbWl0Z2ViZW4qL1xuICAgICAgICBtb2R1bC5fY3VycmVudGNzdl9FPVwiY3N2L1wiK2ZpbGVuYW1lX0U7XG4gICAgICAgIG1vZHVsLl9jb3VudERlcD04O1xuICAgIH1cbiAgICBpZiAoZmlsZW5hbWVfRiE9MCl7XG4gICAgICAgIG1vZHVsLl9jdXJyZW50Y3N2X0Y9XCJjc3YvXCIrZmlsZW5hbWVfRjtcbiAgICAgICAgbW9kdWwuX2NvdW50RGVwPTg7XG4gICAgfVxuICAgIGlmIChmaWxlbmFtZV9HIT0wKXsgICAgIC8vbMO2c3VuZyBpbW1lciA0IGZpbGVzIG1pdGdlYmVuKi9cbiAgICAgICAgbW9kdWwuX2N1cnJlbnRjc3ZfRz1cImNzdi9cIitmaWxlbmFtZV9HO1xuICAgICAgICBtb2R1bC5fY291bnREZXA9ODtcbiAgICB9XG4gICAgaWYgKGZpbGVuYW1lX0ghPTApe1xuICAgICAgICBtb2R1bC5fY3VycmVudGNzdl9IPVwiY3N2L1wiK2ZpbGVuYW1lX0g7XG4gICAgICAgIG1vZHVsLl9jb3VudERlcD04O1xuICAgIH1cbn1cbmZ1bmN0aW9uIHByb2Nlc3MoZmlsZW5hbWUsIGZpbGVuYW1lX0IsIGZpbGVuYW1lX0MsIGZpbGVuYW1lX0QpIHtcbiAgICBtb2R1bC5fc3ZnPWQzLnNlbGVjdChcInN2Z1wiKS5yZW1vdmUoKTtcbiAgICBtb2R1bC5fc3ZnID0gZDMuc2VsZWN0KFwic3ZnXCIpO1xuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIHByb2Nlc3M6bWFpblwiKTtcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xuICAgIC8vZGVmYXVsdFxuICAgIG1vZHVsLl9jdXJyZW50Y3N2PVwiY3N2L1wiK2ZpbGVuYW1lO1xuICAgIG1vZHVsLl9jdXJyZW50Y3N2X0I9XCJjc3YvXCIrZmlsZW5hbWVfQjtcblxuICAgIGhhc0ZpbGUoZmlsZW5hbWUsIGZpbGVuYW1lX0IsIGZpbGVuYW1lX0MsIGZpbGVuYW1lX0QsIDAsIDAsIDAsIDApO1xuICAgIGNvbnNvbGUubG9nKFwiIHByb2Nlc3MgXCIrZmlsZW5hbWUrXCIgXCIrIGZpbGVuYW1lX0IrXCIgXCIrIGZpbGVuYW1lX0MrXCIgXCIrIGZpbGVuYW1lX0QpO1xuICAgIFNldHRpbmdMYXlvdXQuY3JlYXRlQXJjKCk7XG4gICAgU2V0dGluZ0xheW91dC5sYXlvdXQoKTtcbiAgICBTZXR0aW5nTGF5b3V0LnBhdGgoKTtcbiAgICBTZXR0aW5nTGF5b3V0LnNldFNWRygpO1xuICAgIC8vU2V0dGluZ0xheW91dC5tb3Zlc3ZnKCk7XG4gICAgU2V0dGluZ0xheW91dC5hcHBlbmRDaXJjbGUoKTtcbiAgICBjb25zb2xlLmxvZyhcInByb2Nlc3M6ZGVmZXI6XCIrbW9kdWwuX2N1cnJlbnRjc3YpO1xuICAgIHZhciB0ZXN0PTA7IC8vMCBub3JtYWwsIDEga3VtbXVsYXRpb25cbiAgICBjb25zb2xlLmxvZyhcImNob2ljZSBtb2R1czpcIittb2R1bC5fdm1vZHVzKTtcbiAgICBpZiAobW9kdWwuX3Ztb2R1cz09XCJkZWZhdWx0XCIpey8vZWFjaCB5ZWFyXG4gICAgICAgIHE9IGQzLnF1ZXVlKClcbiAgICAgICAgcVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjc3YpXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNzdl9CKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjc3ZfQylcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0QpXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNzdl9FKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjc3ZfRilcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0cpXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNzdl9IKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmpzb24sbW9kdWwuX2N1cnJlbnRqc29uKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjb2xvcilcbiAgICAgICAgICAgIC5hd2FpdChTZXR0aW5nc0IpXG4gICAgfVxuICAgIGVsc2V7IC8vMjAxMSAtIDIwMTQvL2t1bW11bGF0aW9uXG4gICAgICAgIHZhciBjc3Y9XCJjc3YvXCI7XG4gICAgICAgIHZhciBzdXBwbGllckE9W2NzditcIkJLIC0gMjAxMS5jc3ZcIixjc3YrXCJCSyAtIDIwMTIuY3N2XCIsY3N2K1wiQksgLSAyMDEzLmNzdlwiLGNzditcIkJLIC0gMjAxNC5jc3ZcIl07XG4gICAgICAgIHZhciBzdXBwbGllckI9W2NzditcIkVESSAtIDIwMTEuY3N2XCIsY3N2K1wiRURJIC0gMjAxMi5jc3ZcIixjc3YrXCJFREkgLSAyMDEzLmNzdlwiLGNzditcIkVESSAtIDIwMTQuY3N2XCJdO1xuICAgICAgICAvL3ZhciBzdXBwbGllckM9W2NzditcIkVEQSAtIDIwMTEuY3N2XCIsY3N2K1wiRURBIC0gMjAxMi5jc3ZcIixjc3YrXCJFREEgLSAyMDEzLmNzdlwiLGNzditcIkVEQSAtIDIwMTQuY3N2XCJdO1xuICAgICAgICBxPSBkMy5xdWV1ZSgpXG4gICAgICAgIHFcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQVswXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQVsxXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQVsyXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQVszXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQlswXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQlsxXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQlsyXSlcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQlszXSlcbiAgICAgICAgICAgIC8qLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJDWzBdKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJDWzFdKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJDWzJdKVxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJDWzNdKSovXG4gICAgICAgICAgICAuZGVmZXIoZDMuanNvbixtb2R1bC5fY3VycmVudGpzb24pXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNvbG9yKVxuICAgICAgICAgICAgLmF3YWl0KHNldHRpbmdzQylcbiAgICB9XG59XG5mdW5jdGlvbiBTZXR0aW5nc0IoZXJyb3IsIG1fc3VwcGxpZXIsICBtX3N1cHBsaWVyX0IsIG1fc3VwcGxpZXJfQyxtX3N1cHBsaWVyX0QsXG4gICAgICAgICAgICAgICAgICAgbV9zdXBwbGllcl9FLCAgbV9zdXBwbGllcl9GLCBtX3N1cHBsaWVyX0csbV9zdXBwbGllcl9ILFxuICAgICAgICAgICAgICAgICAgIG1hdHJpeCwgY29sb3IpXG57XG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgU2V0dGluZ3NCXCIpO1xuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XG4gICAgbW9kdWwuX3N1cHBsaWVyPW1fc3VwcGxpZXI7Ly9Mw6RuZGVyYm9nZW5uYW1lbm4gc2V0emVuXG4gICAgU2V0dGluZ0lucHV0LnJlYWRjc3YobV9zdXBwbGllciwgbV9zdXBwbGllcl9CLCBtX3N1cHBsaWVyX0MsbV9zdXBwbGllcl9ELFxuICAgIG1fc3VwcGxpZXJfRSwgIG1fc3VwcGxpZXJfRiwgbV9zdXBwbGllcl9HLG1fc3VwcGxpZXJfSCxtYXRyaXgpOy8vRmlsbCBEUy1TdXBwbGllciArIERTLURlcHQsIE1hdHJpeFxuICAgIG1vZHVsLl9sYXlvdXQubWF0cml4KG1vZHVsLl9tYXRyaXgpO1xuICAgIG1vZHVsLl9jb2xvcj1jb2xvcjtcbiAgICAvL2NvbnNvbGUubG9nKFwiMjpTZXR0aW5nc0I6IEFuemFoOl9zdXBwbGllcjpcIittb2R1bC5fc3VwcGxpZXIubGVuZ3RoKTtcbiAgICBTZXR0aW5nX3RoZU1ldGhvZHMoKTtcbn1cblxuZnVuY3Rpb24gc2V0dGluZ3NDKGVycm9yLCBtX3N1cHBsaWVyXzIwMTEsIG1fc3VwcGxpZXJfMjAxMiwgbV9zdXBwbGllcl8yMDEzLG1fc3VwcGxpZXJfMjAxNCxcbiAgICAgICAgICAgICAgICBtX3N1cHBsaWVyX0JfMjAxMSwgbV9zdXBwbGllcl9CXzIwMTIsIG1fc3VwcGxpZXJfQl8yMDEzLCBtX3N1cHBsaWVyX0JfMjAxNCxcbiAgICAgICAgICAgICAgICBtYXRyaXgsIGNvbG9yKXtcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBTZXR0aW5nc0NcIik7XG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcbiAgICBtb2R1bC5fc3VwcGxpZXI9bV9zdXBwbGllcl8yMDExOy8vTMOkbmRlcmJvZ2VubmFtZW5uIHNldHplblxuICAgIC8vTWVyZ2luZyAyMDExIC0gMjAxNFxuXG4gICAgLy90ZXN0IG9ubHkgMjAxMi8yMDEzXG4gICAgU2V0dGluZ0lucHV0LnJlYWRjc3YobWVyZ2luZ0ZpbGVzKFttX3N1cHBsaWVyXzIwMTEsIG1fc3VwcGxpZXJfMjAxMiwgbV9zdXBwbGllcl8yMDEzLG1fc3VwcGxpZXJfMjAxNF0pLFxuICAgIG1lcmdpbmdGaWxlcyhbbV9zdXBwbGllcl9CXzIwMTEsIG1fc3VwcGxpZXJfQl8yMDEyLCBtX3N1cHBsaWVyX0JfMjAxMywgbV9zdXBwbGllcl9CXzIwMTRdKSxcbiAgICAgICAgbWVyZ2luZ0ZpbGVzKFttX3N1cHBsaWVyX0JfMjAxMSwgbV9zdXBwbGllcl9CXzIwMTIsIG1fc3VwcGxpZXJfQl8yMDEzLCBtX3N1cHBsaWVyX0JfMjAxNF0pXG4gICAgLG1hdHJpeCk7XG4gICAgbW9kdWwuX2xheW91dC5tYXRyaXgobW9kdWwuX21hdHJpeCk7XG4gICAgbW9kdWwuX2NvbG9yPWNvbG9yO1xuICAgIC8vY29uc29sZS5sb2coXCIyOlNldHRpbmdzQjogQW56YWg6X3N1cHBsaWVyOlwiK21vZHVsLl9zdXBwbGllci5sZW5ndGgpO1xuICAgIFNldHRpbmdfdGhlTWV0aG9kcygpO1xufVxuZnVuY3Rpb24gU2V0dGluZ190aGVNZXRob2RzKClcbntcbiAgICBTZXR0aW5nR3JvdXBzLm5laWdoYm9yaG9vZCgpO1xuICAgIFNldHRpbmdHcm91cHMuZ3JvdXBQYXRoKCk7XG4gICAgU2V0dGluZ0dyb3Vwcy5ncm91cFRleHQoKTtcbiAgICBTZXR0aW5nR3JvdXBzLmdyb3VwdGV4dEZpbHRlcigpO1xuICAgIFNldHRpbmdDaG9yZHMuc2VsZWN0Y2hvcmRzKCk7XG4gICAgU2V0dGluZ1RpdGxlLmNyZWF0ZVRpdGxlKCk7XG59XG4vL1NldHRpbmcgUGFyYW1zXG5mdW5jdGlvbiBzZXR0aW5nUGFyYW0odHJhbnNfd2lkdGgsIHRyYW5zX2hlaWdodCwgd2lkdGgsIGhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICBncm91cF94LCBncm91cF9keSxyYWRpdXNfaSwgcmFkaXVzX28pIHtcbiAgICBtb2R1bC5fdHJhbnNmb3JtX3dpZHRoID0gdHJhbnNfd2lkdGg7XG4gICAgbW9kdWwuX3RyYW5zZm9ybV9oZWlnaHQgPSB0cmFuc19oZWlnaHQ7XG4gICAgbW9kdWwuX3dpZHRoID0gd2lkdGg7XG4gICAgbW9kdWwuX2hlaWdodCA9IGhlaWdodDtcbiAgICAvL1JhZGl1c1xuICAgIGlmIChyYWRpdXNfbz09MCl7XG4gICAgICAgIG1vZHVsLl9vdXRlclJhZGl1cyA9IE1hdGgubWluKG1vZHVsLl93aWR0aCwgbW9kdWwuX2hlaWdodCkgLyAyIC0gMTA7XG4gICAgICAgIG1vZHVsLl9pbm5lclJhZGl1cyA9IG1vZHVsLl9vdXRlclJhZGl1cyAtIDI0O1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgICBtb2R1bC5fb3V0ZXJSYWRpdXMgPSBNYXRoLm1pbihtb2R1bC5fd2lkdGgsIG1vZHVsLl9oZWlnaHQpIC8gMiAtIDEwO1xuICAgICAgICBtb2R1bC5faW5uZXJSYWRpdXMgPSByYWRpdXNfbyAtIDI0O1xuICAgIH1cbiAgICAvL3BlcmNlbnRyYWdlXG4gICAgbW9kdWwuX2Zvcm1hdFBlcmNlbnQgPSBkMy5mb3JtYXQoXCIuMSVcIik7XG4gICAgLy9zZWV0aW5nIGlucHVcbiAgICBtb2R1bC5fZ3JvdXBfeCA9IGdyb3VwX3g7XG4gICAgbW9kdWwuX2dyb3VwX2R5ID0gZ3JvdXBfZHk7XG59XG5mdW5jdGlvbiBnZXRfcmVxdWVzdFBhcmFtKGNzdmZpbGUsICBkZXApe1xuXG59XG5mdW5jdGlvbiBzdGFydGluZ3dpdGhRdWVyeShjb250ZW50KXtcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBzdGFydGluZyB3aXRoIFF1ZXJ5XCIpO1xuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XG4gICAgaWYgKGNvbnRlbnQ9PVwiQktfRURJX0FsbFwiKVxuICAgICAgICBtb2R1bC5fdm1vZHVzPVwiQktfRURJX2N1bXVsYXRpb25cIjtcbiAgICBlbHNlXG4gICAgICAgIG1vZHVsLl92bW9kdXM9XCJkZWZhdWx0XCI7XG5cbiAgICBzd2l0Y2goY29udGVudCkgey8vRURBLUVESSAyMDExLSAyMDE0XG4gICAgICAgIGNhc2UgJ0VEQV9FRElfMjAxMSc6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTFcIixcIkVEQSAtIDIwMTEuY3N2XCIsXCJFREkgLSAyMDExLmNzdlwiLCAwLDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VEQV9FRElfMjAxMic6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTJcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLCAwLDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VEQV9FRElfMjAxMyc6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTNcIixcIkVEQSAtIDIwMTMuY3N2XCIsXCJFREkgLSAyMDEzLmNzdlwiLDAsIDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0VEQV9FRElfMjAxNCc6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTRcIixcIkVEQSAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLDAsMCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgLy9CSyBFREkgMjAxMSAtIDIwMTRcbiAgICAgICAgY2FzZSAnQktfRURJXzIwMTEnOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURJXzIwMTFcIixcIkJLIC0gMjAxMS5jc3ZcIixcIkVEQSAtIDIwMTEuY3N2XCIsMCwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdCS19FRElfMjAxMic6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FRElfMjAxMlwiLFwiQksgLSAyMDEyLmNzdlwiLFwiRURBIC0gMjAxMi5jc3ZcIiwwLDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0JLX0VESV8yMDEzJzpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VESV8yMDEzXCIsXCJCSyAtIDIwMTMuY3N2XCIsXCJFREEgLSAyMDEzLmNzdlwiLDAsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQktfRURJXzIwMTQnOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURJXzIwMTRcIixcIkJLIC0gMjAxNC5jc3ZcIixcIkVEQSAtIDIwMTQuY3N2XCIsMCwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdCS19FRElfQWxsJzpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VESV8yMDE0XCIsXCJCSyAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLDAsMCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgLy9CSyBFREEgRURJIDIwMTEgLSAyMDE0XG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDExXCI6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTFcIixcIkJLIC0gMjAxMS5jc3ZcIixcIkVEQSAtIDIwMTEuY3N2XCIsXCJFREkgLSAyMDExLmNzdlwiLCAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxMlwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEyXCIsXCJCSyAtIDIwMTIuY3N2XCIsXCJFREEgLSAyMDEyLmNzdlwiLFwiRURJIC0gMjAxMi5jc3ZcIiwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxM1wiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEzXCIsXCJCSyAtIDIwMTMuY3N2XCIsXCJFREEgLSAyMDEzLmNzdlwiLFwiRURJIC0gMjAxMy5jc3ZcIiwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxNFwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDE0XCIsXCJCSyAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLFwiRURJIC0gMjAxNC5jc3ZcIiwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vQksgRURBIEVESSAyMDExIC0gMjAxNCBUcmlcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTFfVHJpXCI6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTFfVHJpXCIsXCJCSyAtIDIwMTEuY3N2XCIsXCJFREEgLSAyMDExLmNzdlwiLFwiRURJIC0gMjAxMS5jc3ZcIiwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxMl9UcmlcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMl9UcmlcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDEzX1RyaVwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEzX1RyaVwiLFwiQksgLSAyMDEzLmNzdlwiLFwiRURBIC0gMjAxMy5jc3ZcIixcIkVESSAtIDIwMTMuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTRfVHJpXCI6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTRfVHJpXCIsXCJCSyAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLFwiRURJIC0gMjAxNC5jc3ZcIiwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAvL0NhdCBCSyBFREEgRURJIDIwMTEgLSAyMDE0XG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDExX0NhdFwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDExX0NhdFwiLFwiQksgLSAyMDExLmNzdlwiLFwiRURBIC0gMjAxMS5jc3ZcIixcIkVESSAtIDIwMTEuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTJfQ2F0XCI6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTJfQ2F0XCIsXCJCSyAtIDIwMTIuY3N2XCIsXCJFREEgLSAyMDEyLmNzdlwiLFwiRURJIC0gMjAxMi5jc3ZcIiwwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxM19DYXRcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxM19DYXRcIixcIkJLIC0gMjAxMy5jc3ZcIixcIkVEQSAtIDIwMTMuY3N2XCIsXCJFREkgLSAyMDEzLmNzdlwiLDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDE0X0NhdFwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDE0X0NhdFwiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIixcIkVESSAtIDIwMTQuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAvL0NhdCBCSyBFREEgRURJIDIwMTEgLSAyMDE0IDJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTFfQ2F0XzJcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMV9DYXRfMlwiLFwiQksgLSAyMDExLmNzdlwiLFwiRURBIC0gMjAxMS5jc3ZcIixcIkVESSAtIDIwMTEuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTJfQ2F0XzJcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMl9DYXRfMlwiLFwiQksgLSAyMDEyLmNzdlwiLFwiRURBIC0gMjAxMi5jc3ZcIixcIkVESSAtIDIwMTIuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTNfQ2F0XzJcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxM19DYXRfMlwiLFwiQksgLSAyMDEzLmNzdlwiLFwiRURBIC0gMjAxMy5jc3ZcIixcIkVESSAtIDIwMTMuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTRfQ2F0XzJcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxNF9DYXRfMlwiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIixcIkVESSAtIDIwMTQuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAvL0NhdCBCSyBFREEgRURJIDIwMTEgLSAyMDE0IDNcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTFfQ2F0XzNcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMV9DYXRfM1wiLFwiQksgLSAyMDExLmNzdlwiLFwiRURBIC0gMjAxMS5jc3ZcIixcIkVESSAtIDIwMTEuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTJfQ2F0XzNcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMl9DYXRfM1wiLFwiQksgLSAyMDEyLmNzdlwiLFwiRURBIC0gMjAxMi5jc3ZcIixcIkVESSAtIDIwMTIuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTNfQ2F0XzNcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxM19DYXRfM1wiLFwiQksgLSAyMDEzLmNzdlwiLFwiRURBIC0gMjAxMy5jc3ZcIixcIkVESSAtIDIwMTMuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTRfQ2F0XzNcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxNF9DYXRfM1wiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIixcIkVESSAtIDIwMTQuY3N2XCIsMCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgLy9kdW1teVxuICAgICAgICBjYXNlICBcIkR1bW15XCI6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJEdW1teVwiLFwiRHVtbXlfRURBLmNzdlwiLFwiRHVtbXlfRURJLmNzdlwiLDAsMCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAvL0NhdCBCSyBFREEgRURJIEVKUEQgMjAxMSAtIDIwMTRcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJX0VKUERfMjAxMV9DYXRcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfRUpQRF8yMDExX0NhdFwiLFwiQksgLSAyMDExLmNzdlwiLFwiRURBIC0gMjAxMS5jc3ZcIixcIkVESSAtIDIwMTEuY3N2XCIsIFwiRUpQRCAtIDIwMTEuY3N2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV9FSlBEXzIwMTJfQ2F0XCI6XG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJX0VKUERfMjAxMl9DYXRcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLCBcIkVKUEQgLSAyMDEyLmNzdlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfRUpQRF8yMDEzX0NhdFwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV9FSlBEXzIwMTNfQ2F0XCIsXCJCSyAtIDIwMTMuY3N2XCIsXCJFREEgLSAyMDEzLmNzdlwiLFwiRURJIC0gMjAxMy5jc3ZcIiwgXCJFSlBEIC0gMjAxMy5jc3ZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJX0VKUERfMjAxNF9DYXRcIjpcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfRUpQRF8yMDE0X0NhdFwiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIixcIkVESSAtIDIwMTQuY3N2XCIsIFwiRUpQRCAtIDIwMTQuY3N2XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgLy9CSyBFREEgRURJIEVGRCBFSlBEIFVWRUsgVkJTIFdCRiAyMDExXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV9FRkRfRUpQRF9VVkVLX1ZCU19XQkZfMjAxMVwiOlxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsXG4gICAgICAgICAgICAoXCJCS19FREFfRURJX0VGRF9FSlBEX1VWRUtfVkJTX1dCRl8yMDExXCIsXCJCSyAtIDIwMTEuY3N2XCIsICAgXCJFREEgLSAyMDExLmNzdlwiLFwiRURJIC0gMjAxMS5jc3ZcIiwgXCJFRkQgLSAyMDExLmNzdlwiLFxuICAgICAgICAgICAgIFwiRUpQRCAtIDIwMTEuY3N2XCIsIFwiVVZFSyAtIDIwMTEuY3N2XCIsIFwiVkJTIC0gMjAxMS5jc3ZcIixcIldCRiAtIDIwMTEuY3N2XCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5mdW5jdGlvbiBtZXJnaW5nRmlsZXMoY3N2RmlsZXMpIHtcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlciArIFwiIG1lcmdpbmcgZmlsZXNcIik7XG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHZhciBvdXRwdXQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjc3ZGaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHRzLnB1c2goY3N2RmlsZXNbaV0pO1xuICAgIH1cbiAgICBvdXRwdXQgPSBkMy5tZXJnZShyZXN1bHRzKTtcbiAgICByZXR1cm4gb3V0cHV0O1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogU2ltcGxlIHF1ZXJ5IHN0cmluZyBwYXJzZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IFRoZSBxdWVyeSBzdHJpbmcgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gcXVlcnlzdHJpbmcocXVlcnkpIHtcbiAgdmFyIHBhcnNlciA9IC8oW149PyZdKyk9PyhbXiZdKikvZ1xuICAgICwgcmVzdWx0ID0ge31cbiAgICAsIHBhcnQ7XG5cbiAgLy9cbiAgLy8gTGl0dGxlIG5pZnR5IHBhcnNpbmcgaGFjaywgbGV2ZXJhZ2UgdGhlIGZhY3QgdGhhdCBSZWdFeHAuZXhlYyBpbmNyZW1lbnRzXG4gIC8vIHRoZSBsYXN0SW5kZXggcHJvcGVydHkgc28gd2UgY2FuIGNvbnRpbnVlIGV4ZWN1dGluZyB0aGlzIGxvb3AgdW50aWwgd2UndmVcbiAgLy8gcGFyc2VkIGFsbCByZXN1bHRzLlxuICAvL1xuICBmb3IgKDtcbiAgICBwYXJ0ID0gcGFyc2VyLmV4ZWMocXVlcnkpO1xuICAgIHJlc3VsdFtkZWNvZGVVUklDb21wb25lbnQocGFydFsxXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRbMl0pXG4gICk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gYSBxdWVyeSBzdHJpbmcgdG8gYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogT2JqZWN0IHRoYXQgc2hvdWxkIGJlIHRyYW5zZm9ybWVkLlxuICogQHBhcmFtIHtTdHJpbmd9IHByZWZpeCBPcHRpb25hbCBwcmVmaXguXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gcXVlcnlzdHJpbmdpZnkob2JqLCBwcmVmaXgpIHtcbiAgcHJlZml4ID0gcHJlZml4IHx8ICcnO1xuXG4gIHZhciBwYWlycyA9IFtdO1xuXG4gIC8vXG4gIC8vIE9wdGlvbmFsbHkgcHJlZml4IHdpdGggYSAnPycgaWYgbmVlZGVkXG4gIC8vXG4gIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIHByZWZpeCkgcHJlZml4ID0gJz8nO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsnPScrIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYWlycy5sZW5ndGggPyBwcmVmaXggKyBwYWlycy5qb2luKCcmJykgOiAnJztcbn1cblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmV4cG9ydHMuc3RyaW5naWZ5ID0gcXVlcnlzdHJpbmdpZnk7XG5leHBvcnRzLnBhcnNlID0gcXVlcnlzdHJpbmc7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ2hlY2sgaWYgd2UncmUgcmVxdWlyZWQgdG8gYWRkIGEgcG9ydCBudW1iZXIuXG4gKlxuICogQHNlZSBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RlZmF1bHQtcG9ydFxuICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBwb3J0IFBvcnQgbnVtYmVyIHdlIG5lZWQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm90b2NvbCBQcm90b2NvbCB3ZSBuZWVkIHRvIGNoZWNrIGFnYWluc3QuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSXMgaXQgYSBkZWZhdWx0IHBvcnQgZm9yIHRoZSBnaXZlbiBwcm90b2NvbFxuICogQGFwaSBwcml2YXRlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVxdWlyZWQocG9ydCwgcHJvdG9jb2wpIHtcbiAgcHJvdG9jb2wgPSBwcm90b2NvbC5zcGxpdCgnOicpWzBdO1xuICBwb3J0ID0gK3BvcnQ7XG5cbiAgaWYgKCFwb3J0KSByZXR1cm4gZmFsc2U7XG5cbiAgc3dpdGNoIChwcm90b2NvbCkge1xuICAgIGNhc2UgJ2h0dHAnOlxuICAgIGNhc2UgJ3dzJzpcbiAgICByZXR1cm4gcG9ydCAhPT0gODA7XG5cbiAgICBjYXNlICdodHRwcyc6XG4gICAgY2FzZSAnd3NzJzpcbiAgICByZXR1cm4gcG9ydCAhPT0gNDQzO1xuXG4gICAgY2FzZSAnZnRwJzpcbiAgICByZXR1cm4gcG9ydCAhPT0gMjE7XG5cbiAgICBjYXNlICdnb3BoZXInOlxuICAgIHJldHVybiBwb3J0ICE9PSA3MDtcblxuICAgIGNhc2UgJ2ZpbGUnOlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBwb3J0ICE9PSAwO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVpcmVkID0gcmVxdWlyZSgncmVxdWlyZXMtcG9ydCcpXG4gICwgbG9sY2F0aW9uID0gcmVxdWlyZSgnLi9sb2xjYXRpb24nKVxuICAsIHFzID0gcmVxdWlyZSgncXVlcnlzdHJpbmdpZnknKVxuICAsIHByb3RvY29scmUgPSAvXihbYS16XVthLXowLTkuKy1dKjopPyhcXC9cXC8pPyhbXFxTXFxzXSopL2k7XG5cbi8qKlxuICogVGhlc2UgYXJlIHRoZSBwYXJzZSBydWxlcyBmb3IgdGhlIFVSTCBwYXJzZXIsIGl0IGluZm9ybXMgdGhlIHBhcnNlclxuICogYWJvdXQ6XG4gKlxuICogMC4gVGhlIGNoYXIgaXQgTmVlZHMgdG8gcGFyc2UsIGlmIGl0J3MgYSBzdHJpbmcgaXQgc2hvdWxkIGJlIGRvbmUgdXNpbmdcbiAqICAgIGluZGV4T2YsIFJlZ0V4cCB1c2luZyBleGVjIGFuZCBOYU4gbWVhbnMgc2V0IGFzIGN1cnJlbnQgdmFsdWUuXG4gKiAxLiBUaGUgcHJvcGVydHkgd2Ugc2hvdWxkIHNldCB3aGVuIHBhcnNpbmcgdGhpcyB2YWx1ZS5cbiAqIDIuIEluZGljYXRpb24gaWYgaXQncyBiYWNrd2FyZHMgb3IgZm9yd2FyZCBwYXJzaW5nLCB3aGVuIHNldCBhcyBudW1iZXIgaXQnc1xuICogICAgdGhlIHZhbHVlIG9mIGV4dHJhIGNoYXJzIHRoYXQgc2hvdWxkIGJlIHNwbGl0IG9mZi5cbiAqIDMuIEluaGVyaXQgZnJvbSBsb2NhdGlvbiBpZiBub24gZXhpc3RpbmcgaW4gdGhlIHBhcnNlci5cbiAqIDQuIGB0b0xvd2VyQ2FzZWAgdGhlIHJlc3VsdGluZyB2YWx1ZS5cbiAqL1xudmFyIHJ1bGVzID0gW1xuICBbJyMnLCAnaGFzaCddLCAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgYmFjay5cbiAgWyc/JywgJ3F1ZXJ5J10sICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGZyb20gdGhlIGJhY2suXG4gIFsnLycsICdwYXRobmFtZSddLCAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBiYWNrLlxuICBbJ0AnLCAnYXV0aCcsIDFdLCAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgZnJvbnQuXG4gIFtOYU4sICdob3N0JywgdW5kZWZpbmVkLCAxLCAxXSwgICAgICAgLy8gU2V0IGxlZnQgb3ZlciB2YWx1ZS5cbiAgWy86KFxcZCspJC8sICdwb3J0JywgdW5kZWZpbmVkLCAxXSwgICAgLy8gUmVnRXhwIHRoZSBiYWNrLlxuICBbTmFOLCAnaG9zdG5hbWUnLCB1bmRlZmluZWQsIDEsIDFdICAgIC8vIFNldCBsZWZ0IG92ZXIuXG5dO1xuXG4vKipcbiAqIEB0eXBlZGVmIFByb3RvY29sRXh0cmFjdFxuICogQHR5cGUgT2JqZWN0XG4gKiBAcHJvcGVydHkge1N0cmluZ30gcHJvdG9jb2wgUHJvdG9jb2wgbWF0Y2hlZCBpbiB0aGUgVVJMLCBpbiBsb3dlcmNhc2UuXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IHNsYXNoZXMgYHRydWVgIGlmIHByb3RvY29sIGlzIGZvbGxvd2VkIGJ5IFwiLy9cIiwgZWxzZSBgZmFsc2VgLlxuICogQHByb3BlcnR5IHtTdHJpbmd9IHJlc3QgUmVzdCBvZiB0aGUgVVJMIHRoYXQgaXMgbm90IHBhcnQgb2YgdGhlIHByb3RvY29sLlxuICovXG5cbi8qKlxuICogRXh0cmFjdCBwcm90b2NvbCBpbmZvcm1hdGlvbiBmcm9tIGEgVVJMIHdpdGgvd2l0aG91dCBkb3VibGUgc2xhc2ggKFwiLy9cIikuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFkZHJlc3MgVVJMIHdlIHdhbnQgdG8gZXh0cmFjdCBmcm9tLlxuICogQHJldHVybiB7UHJvdG9jb2xFeHRyYWN0fSBFeHRyYWN0ZWQgaW5mb3JtYXRpb24uXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFByb3RvY29sKGFkZHJlc3MpIHtcbiAgdmFyIG1hdGNoID0gcHJvdG9jb2xyZS5leGVjKGFkZHJlc3MpO1xuXG4gIHJldHVybiB7XG4gICAgcHJvdG9jb2w6IG1hdGNoWzFdID8gbWF0Y2hbMV0udG9Mb3dlckNhc2UoKSA6ICcnLFxuICAgIHNsYXNoZXM6ICEhbWF0Y2hbMl0sXG4gICAgcmVzdDogbWF0Y2hbM11cbiAgfTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlIGEgcmVsYXRpdmUgVVJMIHBhdGhuYW1lIGFnYWluc3QgYSBiYXNlIFVSTCBwYXRobmFtZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcmVsYXRpdmUgUGF0aG5hbWUgb2YgdGhlIHJlbGF0aXZlIFVSTC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlIFBhdGhuYW1lIG9mIHRoZSBiYXNlIFVSTC5cbiAqIEByZXR1cm4ge1N0cmluZ30gUmVzb2x2ZWQgcGF0aG5hbWUuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZShyZWxhdGl2ZSwgYmFzZSkge1xuICB2YXIgcGF0aCA9IChiYXNlIHx8ICcvJykuc3BsaXQoJy8nKS5zbGljZSgwLCAtMSkuY29uY2F0KHJlbGF0aXZlLnNwbGl0KCcvJykpXG4gICAgLCBpID0gcGF0aC5sZW5ndGhcbiAgICAsIGxhc3QgPSBwYXRoW2kgLSAxXVxuICAgICwgdW5zaGlmdCA9IGZhbHNlXG4gICAgLCB1cCA9IDA7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIGlmIChwYXRoW2ldID09PSAnLicpIHtcbiAgICAgIHBhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAocGF0aFtpXSA9PT0gJy4uJykge1xuICAgICAgcGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIGlmIChpID09PSAwKSB1bnNoaWZ0ID0gdHJ1ZTtcbiAgICAgIHBhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICBpZiAodW5zaGlmdCkgcGF0aC51bnNoaWZ0KCcnKTtcbiAgaWYgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSBwYXRoLnB1c2goJycpO1xuXG4gIHJldHVybiBwYXRoLmpvaW4oJy8nKTtcbn1cblxuLyoqXG4gKiBUaGUgYWN0dWFsIFVSTCBpbnN0YW5jZS4gSW5zdGVhZCBvZiByZXR1cm5pbmcgYW4gb2JqZWN0IHdlJ3ZlIG9wdGVkLWluIHRvXG4gKiBjcmVhdGUgYW4gYWN0dWFsIGNvbnN0cnVjdG9yIGFzIGl0J3MgbXVjaCBtb3JlIG1lbW9yeSBlZmZpY2llbnQgYW5kXG4gKiBmYXN0ZXIgYW5kIGl0IHBsZWFzZXMgbXkgT0NELlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtTdHJpbmd9IGFkZHJlc3MgVVJMIHdlIHdhbnQgdG8gcGFyc2UuXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGxvY2F0aW9uIExvY2F0aW9uIGRlZmF1bHRzIGZvciByZWxhdGl2ZSBwYXRocy5cbiAqIEBwYXJhbSB7Qm9vbGVhbnxGdW5jdGlvbn0gcGFyc2VyIFBhcnNlciBmb3IgdGhlIHF1ZXJ5IHN0cmluZy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIFVSTChhZGRyZXNzLCBsb2NhdGlvbiwgcGFyc2VyKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBVUkwpKSB7XG4gICAgcmV0dXJuIG5ldyBVUkwoYWRkcmVzcywgbG9jYXRpb24sIHBhcnNlcik7XG4gIH1cblxuICB2YXIgcmVsYXRpdmUsIGV4dHJhY3RlZCwgcGFyc2UsIGluc3RydWN0aW9uLCBpbmRleCwga2V5XG4gICAgLCBpbnN0cnVjdGlvbnMgPSBydWxlcy5zbGljZSgpXG4gICAgLCB0eXBlID0gdHlwZW9mIGxvY2F0aW9uXG4gICAgLCB1cmwgPSB0aGlzXG4gICAgLCBpID0gMDtcblxuICAvL1xuICAvLyBUaGUgZm9sbG93aW5nIGlmIHN0YXRlbWVudHMgYWxsb3dzIHRoaXMgbW9kdWxlIHR3byBoYXZlIGNvbXBhdGliaWxpdHkgd2l0aFxuICAvLyAyIGRpZmZlcmVudCBBUEk6XG4gIC8vXG4gIC8vIDEuIE5vZGUuanMncyBgdXJsLnBhcnNlYCBhcGkgd2hpY2ggYWNjZXB0cyBhIFVSTCwgYm9vbGVhbiBhcyBhcmd1bWVudHNcbiAgLy8gICAgd2hlcmUgdGhlIGJvb2xlYW4gaW5kaWNhdGVzIHRoYXQgdGhlIHF1ZXJ5IHN0cmluZyBzaG91bGQgYWxzbyBiZSBwYXJzZWQuXG4gIC8vXG4gIC8vIDIuIFRoZSBgVVJMYCBpbnRlcmZhY2Ugb2YgdGhlIGJyb3dzZXIgd2hpY2ggYWNjZXB0cyBhIFVSTCwgb2JqZWN0IGFzXG4gIC8vICAgIGFyZ3VtZW50cy4gVGhlIHN1cHBsaWVkIG9iamVjdCB3aWxsIGJlIHVzZWQgYXMgZGVmYXVsdCB2YWx1ZXMgLyBmYWxsLWJhY2tcbiAgLy8gICAgZm9yIHJlbGF0aXZlIHBhdGhzLlxuICAvL1xuICBpZiAoJ29iamVjdCcgIT09IHR5cGUgJiYgJ3N0cmluZycgIT09IHR5cGUpIHtcbiAgICBwYXJzZXIgPSBsb2NhdGlvbjtcbiAgICBsb2NhdGlvbiA9IG51bGw7XG4gIH1cblxuICBpZiAocGFyc2VyICYmICdmdW5jdGlvbicgIT09IHR5cGVvZiBwYXJzZXIpIHBhcnNlciA9IHFzLnBhcnNlO1xuXG4gIGxvY2F0aW9uID0gbG9sY2F0aW9uKGxvY2F0aW9uKTtcblxuICAvL1xuICAvLyBFeHRyYWN0IHByb3RvY29sIGluZm9ybWF0aW9uIGJlZm9yZSBydW5uaW5nIHRoZSBpbnN0cnVjdGlvbnMuXG4gIC8vXG4gIGV4dHJhY3RlZCA9IGV4dHJhY3RQcm90b2NvbChhZGRyZXNzIHx8ICcnKTtcbiAgcmVsYXRpdmUgPSAhZXh0cmFjdGVkLnByb3RvY29sICYmICFleHRyYWN0ZWQuc2xhc2hlcztcbiAgdXJsLnNsYXNoZXMgPSBleHRyYWN0ZWQuc2xhc2hlcyB8fCByZWxhdGl2ZSAmJiBsb2NhdGlvbi5zbGFzaGVzO1xuICB1cmwucHJvdG9jb2wgPSBleHRyYWN0ZWQucHJvdG9jb2wgfHwgbG9jYXRpb24ucHJvdG9jb2wgfHwgJyc7XG4gIGFkZHJlc3MgPSBleHRyYWN0ZWQucmVzdDtcblxuICAvL1xuICAvLyBXaGVuIHRoZSBhdXRob3JpdHkgY29tcG9uZW50IGlzIGFic2VudCB0aGUgVVJMIHN0YXJ0cyB3aXRoIGEgcGF0aFxuICAvLyBjb21wb25lbnQuXG4gIC8vXG4gIGlmICghZXh0cmFjdGVkLnNsYXNoZXMpIGluc3RydWN0aW9uc1syXSA9IFsvKC4qKS8sICdwYXRobmFtZSddO1xuXG4gIGZvciAoOyBpIDwgaW5zdHJ1Y3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgaW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbnNbaV07XG4gICAgcGFyc2UgPSBpbnN0cnVjdGlvblswXTtcbiAgICBrZXkgPSBpbnN0cnVjdGlvblsxXTtcblxuICAgIGlmIChwYXJzZSAhPT0gcGFyc2UpIHtcbiAgICAgIHVybFtrZXldID0gYWRkcmVzcztcbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgcGFyc2UpIHtcbiAgICAgIGlmICh+KGluZGV4ID0gYWRkcmVzcy5pbmRleE9mKHBhcnNlKSkpIHtcbiAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlb2YgaW5zdHJ1Y3Rpb25bMl0pIHtcbiAgICAgICAgICB1cmxba2V5XSA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLnNsaWNlKGluZGV4ICsgaW5zdHJ1Y3Rpb25bMl0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVybFtrZXldID0gYWRkcmVzcy5zbGljZShpbmRleCk7XG4gICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRleCA9IHBhcnNlLmV4ZWMoYWRkcmVzcykpIHtcbiAgICAgIHVybFtrZXldID0gaW5kZXhbMV07XG4gICAgICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZSgwLCBpbmRleC5pbmRleCk7XG4gICAgfVxuXG4gICAgdXJsW2tleV0gPSB1cmxba2V5XSB8fCAoXG4gICAgICByZWxhdGl2ZSAmJiBpbnN0cnVjdGlvblszXSA/IGxvY2F0aW9uW2tleV0gfHwgJycgOiAnJ1xuICAgICk7XG5cbiAgICAvL1xuICAgIC8vIEhvc3RuYW1lLCBob3N0IGFuZCBwcm90b2NvbCBzaG91bGQgYmUgbG93ZXJjYXNlZCBzbyB0aGV5IGNhbiBiZSB1c2VkIHRvXG4gICAgLy8gY3JlYXRlIGEgcHJvcGVyIGBvcmlnaW5gLlxuICAgIC8vXG4gICAgaWYgKGluc3RydWN0aW9uWzRdKSB1cmxba2V5XSA9IHVybFtrZXldLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICAvL1xuICAvLyBBbHNvIHBhcnNlIHRoZSBzdXBwbGllZCBxdWVyeSBzdHJpbmcgaW4gdG8gYW4gb2JqZWN0LiBJZiB3ZSdyZSBzdXBwbGllZFxuICAvLyB3aXRoIGEgY3VzdG9tIHBhcnNlciBhcyBmdW5jdGlvbiB1c2UgdGhhdCBpbnN0ZWFkIG9mIHRoZSBkZWZhdWx0IGJ1aWxkLWluXG4gIC8vIHBhcnNlci5cbiAgLy9cbiAgaWYgKHBhcnNlcikgdXJsLnF1ZXJ5ID0gcGFyc2VyKHVybC5xdWVyeSk7XG5cbiAgLy9cbiAgLy8gSWYgdGhlIFVSTCBpcyByZWxhdGl2ZSwgcmVzb2x2ZSB0aGUgcGF0aG5hbWUgYWdhaW5zdCB0aGUgYmFzZSBVUkwuXG4gIC8vXG4gIGlmIChcbiAgICAgIHJlbGF0aXZlXG4gICAgJiYgbG9jYXRpb24uc2xhc2hlc1xuICAgICYmIHVybC5wYXRobmFtZS5jaGFyQXQoMCkgIT09ICcvJ1xuICAgICYmICh1cmwucGF0aG5hbWUgIT09ICcnIHx8IGxvY2F0aW9uLnBhdGhuYW1lICE9PSAnJylcbiAgKSB7XG4gICAgdXJsLnBhdGhuYW1lID0gcmVzb2x2ZSh1cmwucGF0aG5hbWUsIGxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgfVxuXG4gIC8vXG4gIC8vIFdlIHNob3VsZCBub3QgYWRkIHBvcnQgbnVtYmVycyBpZiB0aGV5IGFyZSBhbHJlYWR5IHRoZSBkZWZhdWx0IHBvcnQgbnVtYmVyXG4gIC8vIGZvciBhIGdpdmVuIHByb3RvY29sLiBBcyB0aGUgaG9zdCBhbHNvIGNvbnRhaW5zIHRoZSBwb3J0IG51bWJlciB3ZSdyZSBnb2luZ1xuICAvLyBvdmVycmlkZSBpdCB3aXRoIHRoZSBob3N0bmFtZSB3aGljaCBjb250YWlucyBubyBwb3J0IG51bWJlci5cbiAgLy9cbiAgaWYgKCFyZXF1aXJlZCh1cmwucG9ydCwgdXJsLnByb3RvY29sKSkge1xuICAgIHVybC5ob3N0ID0gdXJsLmhvc3RuYW1lO1xuICAgIHVybC5wb3J0ID0gJyc7XG4gIH1cblxuICAvL1xuICAvLyBQYXJzZSBkb3duIHRoZSBgYXV0aGAgZm9yIHRoZSB1c2VybmFtZSBhbmQgcGFzc3dvcmQuXG4gIC8vXG4gIHVybC51c2VybmFtZSA9IHVybC5wYXNzd29yZCA9ICcnO1xuICBpZiAodXJsLmF1dGgpIHtcbiAgICBpbnN0cnVjdGlvbiA9IHVybC5hdXRoLnNwbGl0KCc6Jyk7XG4gICAgdXJsLnVzZXJuYW1lID0gaW5zdHJ1Y3Rpb25bMF0gfHwgJyc7XG4gICAgdXJsLnBhc3N3b3JkID0gaW5zdHJ1Y3Rpb25bMV0gfHwgJyc7XG4gIH1cblxuICB1cmwub3JpZ2luID0gdXJsLnByb3RvY29sICYmIHVybC5ob3N0ICYmIHVybC5wcm90b2NvbCAhPT0gJ2ZpbGU6J1xuICAgID8gdXJsLnByb3RvY29sICsnLy8nKyB1cmwuaG9zdFxuICAgIDogJ251bGwnO1xuXG4gIC8vXG4gIC8vIFRoZSBocmVmIGlzIGp1c3QgdGhlIGNvbXBpbGVkIHJlc3VsdC5cbiAgLy9cbiAgdXJsLmhyZWYgPSB1cmwudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBUaGlzIGlzIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY2hhbmdpbmcgcHJvcGVydGllcyBpbiB0aGUgVVJMIGluc3RhbmNlIHRvXG4gKiBpbnN1cmUgdGhhdCB0aGV5IGFsbCBwcm9wYWdhdGUgY29ycmVjdGx5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXJ0ICAgICAgICAgIFByb3BlcnR5IHdlIG5lZWQgdG8gYWRqdXN0LlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWUgICAgICAgICAgVGhlIG5ld2x5IGFzc2lnbmVkIHZhbHVlLlxuICogQHBhcmFtIHtCb29sZWFufEZ1bmN0aW9ufSBmbiAgV2hlbiBzZXR0aW5nIHRoZSBxdWVyeSwgaXQgd2lsbCBiZSB0aGUgZnVuY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQgdG8gcGFyc2UgdGhlIHF1ZXJ5LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV2hlbiBzZXR0aW5nIHRoZSBwcm90b2NvbCwgZG91YmxlIHNsYXNoIHdpbGwgYmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgZnJvbSB0aGUgZmluYWwgdXJsIGlmIGl0IGlzIHRydWUuXG4gKiBAcmV0dXJucyB7VVJMfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVVJMLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQocGFydCwgdmFsdWUsIGZuKSB7XG4gIHZhciB1cmwgPSB0aGlzO1xuXG4gIHN3aXRjaCAocGFydCkge1xuICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgICAgICB2YWx1ZSA9IChmbiB8fCBxcy5wYXJzZSkodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncG9ydCc6XG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcblxuICAgICAgaWYgKCFyZXF1aXJlZCh2YWx1ZSwgdXJsLnByb3RvY29sKSkge1xuICAgICAgICB1cmwuaG9zdCA9IHVybC5ob3N0bmFtZTtcbiAgICAgICAgdXJsW3BhcnRdID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlKSB7XG4gICAgICAgIHVybC5ob3N0ID0gdXJsLmhvc3RuYW1lICsnOicrIHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuXG4gICAgICBpZiAodXJsLnBvcnQpIHZhbHVlICs9ICc6JysgdXJsLnBvcnQ7XG4gICAgICB1cmwuaG9zdCA9IHZhbHVlO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdob3N0JzpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuXG4gICAgICBpZiAoLzpcXGQrJC8udGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdCgnOicpO1xuICAgICAgICB1cmwucG9ydCA9IHZhbHVlLnBvcCgpO1xuICAgICAgICB1cmwuaG9zdG5hbWUgPSB2YWx1ZS5qb2luKCc6Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cmwuaG9zdG5hbWUgPSB2YWx1ZTtcbiAgICAgICAgdXJsLnBvcnQgPSAnJztcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwcm90b2NvbCc6XG4gICAgICB1cmwucHJvdG9jb2wgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdXJsLnNsYXNoZXMgPSAhZm47XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BhdGhuYW1lJzpcbiAgICAgIHVybC5wYXRobmFtZSA9IHZhbHVlLmxlbmd0aCAmJiB2YWx1ZS5jaGFyQXQoMCkgIT09ICcvJyA/ICcvJyArIHZhbHVlIDogdmFsdWU7XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpbnMgPSBydWxlc1tpXTtcblxuICAgIGlmIChpbnNbNF0pIHVybFtpbnNbMV1dID0gdXJsW2luc1sxXV0udG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHVybC5vcmlnaW4gPSB1cmwucHJvdG9jb2wgJiYgdXJsLmhvc3QgJiYgdXJsLnByb3RvY29sICE9PSAnZmlsZTonXG4gICAgPyB1cmwucHJvdG9jb2wgKycvLycrIHVybC5ob3N0XG4gICAgOiAnbnVsbCc7XG5cbiAgdXJsLmhyZWYgPSB1cmwudG9TdHJpbmcoKTtcblxuICByZXR1cm4gdXJsO1xufTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIHByb3BlcnRpZXMgYmFjayBpbiB0byBhIHZhbGlkIGFuZCBmdWxsIFVSTCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5naWZ5IE9wdGlvbmFsIHF1ZXJ5IHN0cmluZ2lmeSBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5VUkwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoc3RyaW5naWZ5KSB7XG4gIGlmICghc3RyaW5naWZ5IHx8ICdmdW5jdGlvbicgIT09IHR5cGVvZiBzdHJpbmdpZnkpIHN0cmluZ2lmeSA9IHFzLnN0cmluZ2lmeTtcblxuICB2YXIgcXVlcnlcbiAgICAsIHVybCA9IHRoaXNcbiAgICAsIHByb3RvY29sID0gdXJsLnByb3RvY29sO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5jaGFyQXQocHJvdG9jb2wubGVuZ3RoIC0gMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIHZhciByZXN1bHQgPSBwcm90b2NvbCArICh1cmwuc2xhc2hlcyA/ICcvLycgOiAnJyk7XG5cbiAgaWYgKHVybC51c2VybmFtZSkge1xuICAgIHJlc3VsdCArPSB1cmwudXNlcm5hbWU7XG4gICAgaWYgKHVybC5wYXNzd29yZCkgcmVzdWx0ICs9ICc6JysgdXJsLnBhc3N3b3JkO1xuICAgIHJlc3VsdCArPSAnQCc7XG4gIH1cblxuICByZXN1bHQgKz0gdXJsLmhvc3QgKyB1cmwucGF0aG5hbWU7XG5cbiAgcXVlcnkgPSAnb2JqZWN0JyA9PT0gdHlwZW9mIHVybC5xdWVyeSA/IHN0cmluZ2lmeSh1cmwucXVlcnkpIDogdXJsLnF1ZXJ5O1xuICBpZiAocXVlcnkpIHJlc3VsdCArPSAnPycgIT09IHF1ZXJ5LmNoYXJBdCgwKSA/ICc/JysgcXVlcnkgOiBxdWVyeTtcblxuICBpZiAodXJsLmhhc2gpIHJlc3VsdCArPSB1cmwuaGFzaDtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgVVJMIHBhcnNlciBhbmQgc29tZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMgdGhhdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4vLyBvdGhlcnMgb3IgdGVzdGluZy5cbi8vXG5VUkwuZXh0cmFjdFByb3RvY29sID0gZXh0cmFjdFByb3RvY29sO1xuVVJMLmxvY2F0aW9uID0gbG9sY2F0aW9uO1xuVVJMLnFzID0gcXM7XG5cbm1vZHVsZS5leHBvcnRzID0gVVJMO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2xhc2hlcyA9IC9eW0EtWmEtel1bQS1aYS16MC05Ky0uXSo6XFwvXFwvLztcblxuLyoqXG4gKiBUaGVzZSBwcm9wZXJ0aWVzIHNob3VsZCBub3QgYmUgY29waWVkIG9yIGluaGVyaXRlZCBmcm9tLiBUaGlzIGlzIG9ubHkgbmVlZGVkXG4gKiBmb3IgYWxsIG5vbiBibG9iIFVSTCdzIGFzIGEgYmxvYiBVUkwgZG9lcyBub3QgaW5jbHVkZSBhIGhhc2gsIG9ubHkgdGhlXG4gKiBvcmlnaW4uXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbnZhciBpZ25vcmUgPSB7IGhhc2g6IDEsIHF1ZXJ5OiAxIH1cbiAgLCBVUkw7XG5cbi8qKlxuICogVGhlIGxvY2F0aW9uIG9iamVjdCBkaWZmZXJzIHdoZW4geW91ciBjb2RlIGlzIGxvYWRlZCB0aHJvdWdoIGEgbm9ybWFsIHBhZ2UsXG4gKiBXb3JrZXIgb3IgdGhyb3VnaCBhIHdvcmtlciB1c2luZyBhIGJsb2IuIEFuZCB3aXRoIHRoZSBibG9iYmxlIGJlZ2lucyB0aGVcbiAqIHRyb3VibGUgYXMgdGhlIGxvY2F0aW9uIG9iamVjdCB3aWxsIGNvbnRhaW4gdGhlIFVSTCBvZiB0aGUgYmxvYiwgbm90IHRoZVxuICogbG9jYXRpb24gb2YgdGhlIHBhZ2Ugd2hlcmUgb3VyIGNvZGUgaXMgbG9hZGVkIGluLiBUaGUgYWN0dWFsIG9yaWdpbiBpc1xuICogZW5jb2RlZCBpbiB0aGUgYHBhdGhuYW1lYCBzbyB3ZSBjYW4gdGhhbmtmdWxseSBnZW5lcmF0ZSBhIGdvb2QgXCJkZWZhdWx0XCJcbiAqIGxvY2F0aW9uIGZyb20gaXQgc28gd2UgY2FuIGdlbmVyYXRlIHByb3BlciByZWxhdGl2ZSBVUkwncyBhZ2Fpbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGxvYyBPcHRpb25hbCBkZWZhdWx0IGxvY2F0aW9uIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IGxvbGNhdGlvbiBvYmplY3QuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvbGNhdGlvbihsb2MpIHtcbiAgbG9jID0gbG9jIHx8IGdsb2JhbC5sb2NhdGlvbiB8fCB7fTtcbiAgVVJMID0gVVJMIHx8IHJlcXVpcmUoJy4vJyk7XG5cbiAgdmFyIGZpbmFsZGVzdGluYXRpb24gPSB7fVxuICAgICwgdHlwZSA9IHR5cGVvZiBsb2NcbiAgICAsIGtleTtcblxuICBpZiAoJ2Jsb2I6JyA9PT0gbG9jLnByb3RvY29sKSB7XG4gICAgZmluYWxkZXN0aW5hdGlvbiA9IG5ldyBVUkwodW5lc2NhcGUobG9jLnBhdGhuYW1lKSwge30pO1xuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlKSB7XG4gICAgZmluYWxkZXN0aW5hdGlvbiA9IG5ldyBVUkwobG9jLCB7fSk7XG4gICAgZm9yIChrZXkgaW4gaWdub3JlKSBkZWxldGUgZmluYWxkZXN0aW5hdGlvbltrZXldO1xuICB9IGVsc2UgaWYgKCdvYmplY3QnID09PSB0eXBlKSB7XG4gICAgZm9yIChrZXkgaW4gbG9jKSB7XG4gICAgICBpZiAoa2V5IGluIGlnbm9yZSkgY29udGludWU7XG4gICAgICBmaW5hbGRlc3RpbmF0aW9uW2tleV0gPSBsb2Nba2V5XTtcbiAgICB9XG5cbiAgICBpZiAoZmluYWxkZXN0aW5hdGlvbi5zbGFzaGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZpbmFsZGVzdGluYXRpb24uc2xhc2hlcyA9IHNsYXNoZXMudGVzdChsb2MuaHJlZik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZpbmFsZGVzdGluYXRpb247XG59O1xuIl19
