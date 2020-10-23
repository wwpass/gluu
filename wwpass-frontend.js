(function () {
  'use strict';

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
  	f: f
  };

  var dP$1 = _objectDp.f;
  var FProto = Function.prototype;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // 19.2.4.2 name
  NAME in FProto || _descriptors && dP$1(FProto, NAME, {
    configurable: true,
    get: function () {
      try {
        return ('' + this).match(nameRE)[1];
      } catch (e) {
        return '';
      }
    }
  });

  var _core = createCommonjsModule(function (module) {
  var core = module.exports = { version: '2.5.7' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');
  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];
  var TPL = ('' + $toString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return $toString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    }
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || $toString.call(this);
  });
  });

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      // export native or passed
      out = (own ? target : source)[key];
      // bind timers to global for call from export context
      exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // extend global
      if (target) _redefine(target, key, out, type & $export.U);
      // export
      if (exports[key] != out) _hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };
  _global.core = _core;
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var _library = false;

  var _shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode: 'global',
    copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
  });
  });

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var f$1 = Object.getOwnPropertySymbols;

  var _objectGops = {
  	f: f$1
  };

  var f$2 = {}.propertyIsEnumerable;

  var _objectPie = {
  	f: f$2
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  // 19.1.2.1 Object.assign(target, source, ...)





  var $assign = Object.assign;

  // should work with symbols and should have deterministic property order (V8 bug)
  var _objectAssign = !$assign || _fails(function () {
    var A = {};
    var B = {};
    // eslint-disable-next-line no-undef
    var S = Symbol();
    var K = 'abcdefghijklmnopqrst';
    A[S] = 7;
    K.split('').forEach(function (k) { B[k] = k; });
    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
  }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
    var T = _toObject(target);
    var aLen = arguments.length;
    var index = 1;
    var getSymbols = _objectGops.f;
    var isEnum = _objectPie.f;
    while (aLen > index) {
      var S = _iobject(arguments[index++]);
      var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
    } return T;
  } : $assign;

  // 19.1.3.1 Object.assign(target, source)


  _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  var TYPED = _uid('typed_array');
  var VIEW = _uid('view');
  var ABV = !!(_global.ArrayBuffer && _global.DataView);
  var CONSTR = ABV;
  var i = 0;
  var l = 9;
  var Typed;

  var TypedArrayConstructors = (
    'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
  ).split(',');

  while (i < l) {
    if (Typed = _global[TypedArrayConstructors[i++]]) {
      _hide(Typed.prototype, TYPED, true);
      _hide(Typed.prototype, VIEW, true);
    } else CONSTR = false;
  }

  var _typed = {
    ABV: ABV,
    CONSTR: CONSTR,
    TYPED: TYPED,
    VIEW: VIEW
  };

  var _redefineAll = function (target, src, safe) {
    for (var key in src) _redefine(target, key, src[key], safe);
    return target;
  };

  var _anInstance = function (it, Constructor, name, forbiddenField) {
    if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
      throw TypeError(name + ': incorrect invocation!');
    } return it;
  };

  // https://tc39.github.io/ecma262/#sec-toindex


  var _toIndex = function (it) {
    if (it === undefined) return 0;
    var number = _toInteger(it);
    var length = _toLength(number);
    if (number !== length) throw RangeError('Wrong length!');
    return length;
  };

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

  var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return _objectKeysInternal(O, hiddenKeys);
  };

  var _objectGopn = {
  	f: f$3
  };

  var _arrayFill = function fill(value /* , start = 0, end = @length */) {
    var O = _toObject(this);
    var length = _toLength(O.length);
    var aLen = arguments.length;
    var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
    while (endPos > index) O[index++] = value;
    return O;
  };

  var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');

  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
  });

  var def = _objectDp.f;

  var TAG = _wks('toStringTag');

  var _setToStringTag = function (it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
  };

  var _typedBuffer = createCommonjsModule(function (module, exports) {











  var gOPN = _objectGopn.f;
  var dP = _objectDp.f;


  var ARRAY_BUFFER = 'ArrayBuffer';
  var DATA_VIEW = 'DataView';
  var PROTOTYPE = 'prototype';
  var WRONG_LENGTH = 'Wrong length!';
  var WRONG_INDEX = 'Wrong index!';
  var $ArrayBuffer = _global[ARRAY_BUFFER];
  var $DataView = _global[DATA_VIEW];
  var Math = _global.Math;
  var RangeError = _global.RangeError;
  // eslint-disable-next-line no-shadow-restricted-names
  var Infinity = _global.Infinity;
  var BaseBuffer = $ArrayBuffer;
  var abs = Math.abs;
  var pow = Math.pow;
  var floor = Math.floor;
  var log = Math.log;
  var LN2 = Math.LN2;
  var BUFFER = 'buffer';
  var BYTE_LENGTH = 'byteLength';
  var BYTE_OFFSET = 'byteOffset';
  var $BUFFER = _descriptors ? '_b' : BUFFER;
  var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
  var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

  // IEEE754 conversions based on https://github.com/feross/ieee754
  function packIEEE754(value, mLen, nBytes) {
    var buffer = new Array(nBytes);
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
    var i = 0;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    var e, m, c;
    value = abs(value);
    // eslint-disable-next-line no-self-compare
    if (value != value || value === Infinity) {
      // eslint-disable-next-line no-self-compare
      m = value != value ? 1 : 0;
      e = eMax;
    } else {
      e = floor(log(value) / LN2);
      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
    buffer[--i] |= s * 128;
    return buffer;
  }
  function unpackIEEE754(buffer, mLen, nBytes) {
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = eLen - 7;
    var i = nBytes - 1;
    var s = buffer[i--];
    var e = s & 127;
    var m;
    s >>= 7;
    for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    } return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function unpackI32(bytes) {
    return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  }
  function packI8(it) {
    return [it & 0xff];
  }
  function packI16(it) {
    return [it & 0xff, it >> 8 & 0xff];
  }
  function packI32(it) {
    return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
  }
  function packF64(it) {
    return packIEEE754(it, 52, 8);
  }
  function packF32(it) {
    return packIEEE754(it, 23, 4);
  }

  function addGetter(C, key, internal) {
    dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
  }

  function get(view, bytes, index, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = store.slice(start, start + bytes);
    return isLittleEndian ? pack : pack.reverse();
  }
  function set(view, bytes, index, conversion, value, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = conversion(+value);
    for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
  }

  if (!_typed.ABV) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
      var byteLength = _toIndex(length);
      this._b = _arrayFill.call(new Array(byteLength), 0);
      this[$LENGTH] = byteLength;
    };

    $DataView = function DataView(buffer, byteOffset, byteLength) {
      _anInstance(this, $DataView, DATA_VIEW);
      _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
      var bufferLength = buffer[$LENGTH];
      var offset = _toInteger(byteOffset);
      if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
      byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
      if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
      this[$BUFFER] = buffer;
      this[$OFFSET] = offset;
      this[$LENGTH] = byteLength;
    };

    if (_descriptors) {
      addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
      addGetter($DataView, BUFFER, '_b');
      addGetter($DataView, BYTE_LENGTH, '_l');
      addGetter($DataView, BYTE_OFFSET, '_o');
    }

    _redefineAll($DataView[PROTOTYPE], {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset)[0] << 24 >> 24;
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset)[0];
      },
      getInt16: function getInt16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
      },
      getUint16: function getUint16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return bytes[1] << 8 | bytes[0];
      },
      getInt32: function getInt32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1]));
      },
      getUint32: function getUint32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
      },
      getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
      },
      getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
      },
      setInt8: function setInt8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packF32, value, arguments[2]);
      },
      setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
        set(this, 8, byteOffset, packF64, value, arguments[2]);
      }
    });
  } else {
    if (!_fails(function () {
      $ArrayBuffer(1);
    }) || !_fails(function () {
      new $ArrayBuffer(-1); // eslint-disable-line no-new
    }) || _fails(function () {
      new $ArrayBuffer(); // eslint-disable-line no-new
      new $ArrayBuffer(1.5); // eslint-disable-line no-new
      new $ArrayBuffer(NaN); // eslint-disable-line no-new
      return $ArrayBuffer.name != ARRAY_BUFFER;
    })) {
      $ArrayBuffer = function ArrayBuffer(length) {
        _anInstance(this, $ArrayBuffer);
        return new BaseBuffer(_toIndex(length));
      };
      var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
      for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
        if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
      }
      ArrayBufferProto.constructor = $ArrayBuffer;
    }
    // iOS Safari 7.x bug
    var view = new $DataView(new $ArrayBuffer(2));
    var $setInt8 = $DataView[PROTOTYPE].setInt8;
    view.setInt8(0, 2147483648);
    view.setInt8(1, 2147483649);
    if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
      setInt8: function setInt8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      },
      setUint8: function setUint8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      }
    }, true);
  }
  _setToStringTag($ArrayBuffer, ARRAY_BUFFER);
  _setToStringTag($DataView, DATA_VIEW);
  _hide($DataView[PROTOTYPE], _typed.VIEW, true);
  exports[ARRAY_BUFFER] = $ArrayBuffer;
  exports[DATA_VIEW] = $DataView;
  });

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG$1 = _wks('toStringTag');
  // ES3 wrong here
  var ARG = _cof(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
      // builtinTag case
      : ARG ? _cof(O)
      // ES3 arguments fallback
      : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var _iterators = {};

  // check on default Array iterator

  var ITERATOR = _wks('iterator');
  var ArrayProto = Array.prototype;

  var _isArrayIter = function (it) {
    return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR] === it);
  };

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');
  var ObjectProto = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };

  var ITERATOR$1 = _wks('iterator');

  var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$1]
      || it['@@iterator']
      || _iterators[_classof(it)];
  };

  // 7.2.2 IsArray(argument)

  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  };

  var SPECIES = _wks('species');

  var _arraySpeciesConstructor = function (original) {
    var C;
    if (_isArray(original)) {
      C = original.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
      if (_isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    } return C === undefined ? Array : C;
  };

  // 9.4.2.3 ArraySpeciesCreate(originalArray, length)


  var _arraySpeciesCreate = function (original, length) {
    return new (_arraySpeciesConstructor(original))(length);
  };

  // 0 -> Array#forEach
  // 1 -> Array#map
  // 2 -> Array#filter
  // 3 -> Array#some
  // 4 -> Array#every
  // 5 -> Array#find
  // 6 -> Array#findIndex





  var _arrayMethods = function (TYPE, $create) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    var create = $create || _arraySpeciesCreate;
    return function ($this, callbackfn, that) {
      var O = _toObject($this);
      var self = _iobject(O);
      var f = _ctx(callbackfn, that, 3);
      var length = _toLength(self.length);
      var index = 0;
      var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var val, res;
      for (;length > index; index++) if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (TYPE) {
          if (IS_MAP) result[index] = res;   // map
          else if (res) switch (TYPE) {
            case 3: return true;             // some
            case 5: return val;              // find
            case 6: return index;            // findIndex
            case 2: result.push(val);        // filter
          } else if (IS_EVERY) return false; // every
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
    };
  };

  // 7.3.20 SpeciesConstructor(O, defaultConstructor)


  var SPECIES$1 = _wks('species');
  var _speciesConstructor = function (O, D) {
    var C = _anObject(O).constructor;
    var S;
    return C === undefined || (S = _anObject(C)[SPECIES$1]) == undefined ? D : _aFunction(S);
  };

  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = _wks('unscopables');
  var ArrayProto$1 = Array.prototype;
  if (ArrayProto$1[UNSCOPABLES] == undefined) _hide(ArrayProto$1, UNSCOPABLES, {});
  var _addToUnscopables = function (key) {
    ArrayProto$1[UNSCOPABLES][key] = true;
  };

  var _iterStep = function (done, value) {
    return { value: value, done: !!done };
  };

  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

  var _iterCreate = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  var ITERATOR$2 = _wks('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function () { return this; };

  var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR$2] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true);
        // fix for some old engines
        if (typeof IteratorPrototype[ITERATOR$2] != 'function') _hide(IteratorPrototype, ITERATOR$2, returnThis);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if (BUGGY || VALUES_BUG || !proto[ITERATOR$2]) {
      _hide(proto, ITERATOR$2, $default);
    }
    // Plug for library
    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep(1);
    }
    if (kind == 'keys') return _iterStep(0, index);
    if (kind == 'values') return _iterStep(0, O[index]);
    return _iterStep(0, [index, O[index]]);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  _iterators.Arguments = _iterators.Array;

  _addToUnscopables('keys');
  _addToUnscopables('values');
  _addToUnscopables('entries');

  var ITERATOR$3 = _wks('iterator');
  var SAFE_CLOSING = false;

  try {
    var riter = [7][ITERATOR$3]();
    riter['return'] = function () { SAFE_CLOSING = true; };
  } catch (e) { /* empty */ }

  var _iterDetect = function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;
    try {
      var arr = [7];
      var iter = arr[ITERATOR$3]();
      iter.next = function () { return { done: safe = true }; };
      arr[ITERATOR$3] = function () { return iter; };
      exec(arr);
    } catch (e) { /* empty */ }
    return safe;
  };

  var SPECIES$2 = _wks('species');

  var _setSpecies = function (KEY) {
    var C = _global[KEY];
    if (_descriptors && C && !C[SPECIES$2]) _objectDp.f(C, SPECIES$2, {
      configurable: true,
      get: function () { return this; }
    });
  };

  var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
    var O = _toObject(this);
    var len = _toLength(O.length);
    var to = _toAbsoluteIndex(target, len);
    var from = _toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;
    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }
    while (count-- > 0) {
      if (from in O) O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  };

  var gOPD = Object.getOwnPropertyDescriptor;

  var f$4 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = _toIobject(O);
    P = _toPrimitive(P, true);
    if (_ie8DomDefine) try {
      return gOPD(O, P);
    } catch (e) { /* empty */ }
    if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
  };

  var _objectGopd = {
  	f: f$4
  };

  var _typedArray = createCommonjsModule(function (module) {
  if (_descriptors) {
    var LIBRARY = _library;
    var global = _global;
    var fails = _fails;
    var $export = _export;
    var $typed = _typed;
    var $buffer = _typedBuffer;
    var ctx = _ctx;
    var anInstance = _anInstance;
    var propertyDesc = _propertyDesc;
    var hide = _hide;
    var redefineAll = _redefineAll;
    var toInteger = _toInteger;
    var toLength = _toLength;
    var toIndex = _toIndex;
    var toAbsoluteIndex = _toAbsoluteIndex;
    var toPrimitive = _toPrimitive;
    var has = _has;
    var classof = _classof;
    var isObject = _isObject;
    var toObject = _toObject;
    var isArrayIter = _isArrayIter;
    var create = _objectCreate;
    var getPrototypeOf = _objectGpo;
    var gOPN = _objectGopn.f;
    var getIterFn = core_getIteratorMethod;
    var uid = _uid;
    var wks = _wks;
    var createArrayMethod = _arrayMethods;
    var createArrayIncludes = _arrayIncludes;
    var speciesConstructor = _speciesConstructor;
    var ArrayIterators = es6_array_iterator;
    var Iterators = _iterators;
    var $iterDetect = _iterDetect;
    var setSpecies = _setSpecies;
    var arrayFill = _arrayFill;
    var arrayCopyWithin = _arrayCopyWithin;
    var $DP = _objectDp;
    var $GOPD = _objectGopd;
    var dP = $DP.f;
    var gOPD = $GOPD.f;
    var RangeError = global.RangeError;
    var TypeError = global.TypeError;
    var Uint8Array = global.Uint8Array;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
    var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
    var PROTOTYPE = 'prototype';
    var ArrayProto = Array[PROTOTYPE];
    var $ArrayBuffer = $buffer.ArrayBuffer;
    var $DataView = $buffer.DataView;
    var arrayForEach = createArrayMethod(0);
    var arrayFilter = createArrayMethod(2);
    var arraySome = createArrayMethod(3);
    var arrayEvery = createArrayMethod(4);
    var arrayFind = createArrayMethod(5);
    var arrayFindIndex = createArrayMethod(6);
    var arrayIncludes = createArrayIncludes(true);
    var arrayIndexOf = createArrayIncludes(false);
    var arrayValues = ArrayIterators.values;
    var arrayKeys = ArrayIterators.keys;
    var arrayEntries = ArrayIterators.entries;
    var arrayLastIndexOf = ArrayProto.lastIndexOf;
    var arrayReduce = ArrayProto.reduce;
    var arrayReduceRight = ArrayProto.reduceRight;
    var arrayJoin = ArrayProto.join;
    var arraySort = ArrayProto.sort;
    var arraySlice = ArrayProto.slice;
    var arrayToString = ArrayProto.toString;
    var arrayToLocaleString = ArrayProto.toLocaleString;
    var ITERATOR = wks('iterator');
    var TAG = wks('toStringTag');
    var TYPED_CONSTRUCTOR = uid('typed_constructor');
    var DEF_CONSTRUCTOR = uid('def_constructor');
    var ALL_CONSTRUCTORS = $typed.CONSTR;
    var TYPED_ARRAY = $typed.TYPED;
    var VIEW = $typed.VIEW;
    var WRONG_LENGTH = 'Wrong length!';

    var $map = createArrayMethod(1, function (O, length) {
      return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
    });

    var LITTLE_ENDIAN = fails(function () {
      // eslint-disable-next-line no-undef
      return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
    });

    var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
      new Uint8Array(1).set({});
    });

    var toOffset = function (it, BYTES) {
      var offset = toInteger(it);
      if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
      return offset;
    };

    var validate = function (it) {
      if (isObject(it) && TYPED_ARRAY in it) return it;
      throw TypeError(it + ' is not a typed array!');
    };

    var allocate = function (C, length) {
      if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
        throw TypeError('It is not a typed array constructor!');
      } return new C(length);
    };

    var speciesFromList = function (O, list) {
      return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
    };

    var fromList = function (C, list) {
      var index = 0;
      var length = list.length;
      var result = allocate(C, length);
      while (length > index) result[index] = list[index++];
      return result;
    };

    var addGetter = function (it, key, internal) {
      dP(it, key, { get: function () { return this._d[internal]; } });
    };

    var $from = function from(source /* , mapfn, thisArg */) {
      var O = toObject(source);
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iterFn = getIterFn(O);
      var i, length, values, result, step, iterator;
      if (iterFn != undefined && !isArrayIter(iterFn)) {
        for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
          values.push(step.value);
        } O = values;
      }
      if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
      for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
        result[i] = mapping ? mapfn(O[i], i) : O[i];
      }
      return result;
    };

    var $of = function of(/* ...items */) {
      var index = 0;
      var length = arguments.length;
      var result = allocate(this, length);
      while (length > index) result[index] = arguments[index++];
      return result;
    };

    // iOS Safari 6.x fails here
    var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

    var $toLocaleString = function toLocaleString() {
      return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
    };

    var proto = {
      copyWithin: function copyWithin(target, start /* , end */) {
        return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
      },
      every: function every(callbackfn /* , thisArg */) {
        return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
        return arrayFill.apply(validate(this), arguments);
      },
      filter: function filter(callbackfn /* , thisArg */) {
        return speciesFromList(this, arrayFilter(validate(this), callbackfn,
          arguments.length > 1 ? arguments[1] : undefined));
      },
      find: function find(predicate /* , thisArg */) {
        return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      findIndex: function findIndex(predicate /* , thisArg */) {
        return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      forEach: function forEach(callbackfn /* , thisArg */) {
        arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      indexOf: function indexOf(searchElement /* , fromIndex */) {
        return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      includes: function includes(searchElement /* , fromIndex */) {
        return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      join: function join(separator) { // eslint-disable-line no-unused-vars
        return arrayJoin.apply(validate(this), arguments);
      },
      lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
        return arrayLastIndexOf.apply(validate(this), arguments);
      },
      map: function map(mapfn /* , thisArg */) {
        return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduce.apply(validate(this), arguments);
      },
      reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduceRight.apply(validate(this), arguments);
      },
      reverse: function reverse() {
        var that = this;
        var length = validate(that).length;
        var middle = Math.floor(length / 2);
        var index = 0;
        var value;
        while (index < middle) {
          value = that[index];
          that[index++] = that[--length];
          that[length] = value;
        } return that;
      },
      some: function some(callbackfn /* , thisArg */) {
        return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      sort: function sort(comparefn) {
        return arraySort.call(validate(this), comparefn);
      },
      subarray: function subarray(begin, end) {
        var O = validate(this);
        var length = O.length;
        var $begin = toAbsoluteIndex(begin, length);
        return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
          O.buffer,
          O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
          toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
        );
      }
    };

    var $slice = function slice(start, end) {
      return speciesFromList(this, arraySlice.call(validate(this), start, end));
    };

    var $set = function set(arrayLike /* , offset */) {
      validate(this);
      var offset = toOffset(arguments[1], 1);
      var length = this.length;
      var src = toObject(arrayLike);
      var len = toLength(src.length);
      var index = 0;
      if (len + offset > length) throw RangeError(WRONG_LENGTH);
      while (index < len) this[offset + index] = src[index++];
    };

    var $iterators = {
      entries: function entries() {
        return arrayEntries.call(validate(this));
      },
      keys: function keys() {
        return arrayKeys.call(validate(this));
      },
      values: function values() {
        return arrayValues.call(validate(this));
      }
    };

    var isTAIndex = function (target, key) {
      return isObject(target)
        && target[TYPED_ARRAY]
        && typeof key != 'symbol'
        && key in target
        && String(+key) == String(key);
    };
    var $getDesc = function getOwnPropertyDescriptor(target, key) {
      return isTAIndex(target, key = toPrimitive(key, true))
        ? propertyDesc(2, target[key])
        : gOPD(target, key);
    };
    var $setDesc = function defineProperty(target, key, desc) {
      if (isTAIndex(target, key = toPrimitive(key, true))
        && isObject(desc)
        && has(desc, 'value')
        && !has(desc, 'get')
        && !has(desc, 'set')
        // TODO: add validation descriptor w/o calling accessors
        && !desc.configurable
        && (!has(desc, 'writable') || desc.writable)
        && (!has(desc, 'enumerable') || desc.enumerable)
      ) {
        target[key] = desc.value;
        return target;
      } return dP(target, key, desc);
    };

    if (!ALL_CONSTRUCTORS) {
      $GOPD.f = $getDesc;
      $DP.f = $setDesc;
    }

    $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
      getOwnPropertyDescriptor: $getDesc,
      defineProperty: $setDesc
    });

    if (fails(function () { arrayToString.call({}); })) {
      arrayToString = arrayToLocaleString = function toString() {
        return arrayJoin.call(this);
      };
    }

    var $TypedArrayPrototype$ = redefineAll({}, proto);
    redefineAll($TypedArrayPrototype$, $iterators);
    hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
    redefineAll($TypedArrayPrototype$, {
      slice: $slice,
      set: $set,
      constructor: function () { /* noop */ },
      toString: arrayToString,
      toLocaleString: $toLocaleString
    });
    addGetter($TypedArrayPrototype$, 'buffer', 'b');
    addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
    addGetter($TypedArrayPrototype$, 'byteLength', 'l');
    addGetter($TypedArrayPrototype$, 'length', 'e');
    dP($TypedArrayPrototype$, TAG, {
      get: function () { return this[TYPED_ARRAY]; }
    });

    // eslint-disable-next-line max-statements
    module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
      CLAMPED = !!CLAMPED;
      var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + KEY;
      var SETTER = 'set' + KEY;
      var TypedArray = global[NAME];
      var Base = TypedArray || {};
      var TAC = TypedArray && getPrototypeOf(TypedArray);
      var FORCED = !TypedArray || !$typed.ABV;
      var O = {};
      var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
      var getter = function (that, index) {
        var data = that._d;
        return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
      };
      var setter = function (that, index, value) {
        var data = that._d;
        if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
        data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
      };
      var addElement = function (that, index) {
        dP(that, index, {
          get: function () {
            return getter(this, index);
          },
          set: function (value) {
            return setter(this, index, value);
          },
          enumerable: true
        });
      };
      if (FORCED) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME, '_d');
          var index = 0;
          var offset = 0;
          var buffer, byteLength, length, klass;
          if (!isObject(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new $ArrayBuffer(byteLength);
          } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            buffer = data;
            offset = toOffset($offset, BYTES);
            var $len = data.byteLength;
            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - offset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
            }
            length = byteLength / BYTES;
          } else if (TYPED_ARRAY in data) {
            return fromList(TypedArray, data);
          } else {
            return $from.call(TypedArray, data);
          }
          hide(that, '_d', {
            b: buffer,
            o: offset,
            l: byteLength,
            e: length,
            v: new $DataView(buffer)
          });
          while (index < length) addElement(that, index++);
        });
        TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
        hide(TypedArrayPrototype, 'constructor', TypedArray);
      } else if (!fails(function () {
        TypedArray(1);
      }) || !fails(function () {
        new TypedArray(-1); // eslint-disable-line no-new
      }) || !$iterDetect(function (iter) {
        new TypedArray(); // eslint-disable-line no-new
        new TypedArray(null); // eslint-disable-line no-new
        new TypedArray(1.5); // eslint-disable-line no-new
        new TypedArray(iter); // eslint-disable-line no-new
      }, true)) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME);
          var klass;
          // `ws` module bug, temporarily remove validation length for Uint8Array
          // https://github.com/websockets/ws/pull/645
          if (!isObject(data)) return new Base(toIndex(data));
          if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            return $length !== undefined
              ? new Base(data, toOffset($offset, BYTES), $length)
              : $offset !== undefined
                ? new Base(data, toOffset($offset, BYTES))
                : new Base(data);
          }
          if (TYPED_ARRAY in data) return fromList(TypedArray, data);
          return $from.call(TypedArray, data);
        });
        arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
          if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
        });
        TypedArray[PROTOTYPE] = TypedArrayPrototype;
        if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
      }
      var $nativeIterator = TypedArrayPrototype[ITERATOR];
      var CORRECT_ITER_NAME = !!$nativeIterator
        && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
      var $iterator = $iterators.values;
      hide(TypedArray, TYPED_CONSTRUCTOR, true);
      hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
      hide(TypedArrayPrototype, VIEW, true);
      hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

      if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
        dP(TypedArrayPrototype, TAG, {
          get: function () { return NAME; }
        });
      }

      O[NAME] = TypedArray;

      $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

      $export($export.S, NAME, {
        BYTES_PER_ELEMENT: BYTES
      });

      $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
        from: $from,
        of: $of
      });

      if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

      $export($export.P, NAME, proto);

      setSpecies(NAME);

      $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

      $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

      if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

      $export($export.P + $export.F * fails(function () {
        new TypedArray(1).slice();
      }), NAME, { slice: $slice });

      $export($export.P + $export.F * (fails(function () {
        return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
      }) || !fails(function () {
        TypedArrayPrototype.toLocaleString.call([1, 2]);
      })), NAME, { toLocaleString: $toLocaleString });

      Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
      if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
    };
  } else module.exports = function () { /* empty */ };
  });

  _typedArray('Uint8', 1, function (init) {
    return function Uint8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  // call something on iterator step with safe closing on error

  var _iterCall = function (iterator, fn, value, entries) {
    try {
      return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined) _anObject(ret.call(iterator));
      throw e;
    }
  };

  var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};
  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
    // fast case for arrays with default iterator
    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };
  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
  });

  // fast apply, http://jsperf.lnkit.com/fast-apply/5
  var _invoke = function (fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0: return un ? fn()
                        : fn.call(that);
      case 1: return un ? fn(args[0])
                        : fn.call(that, args[0]);
      case 2: return un ? fn(args[0], args[1])
                        : fn.call(that, args[0], args[1]);
      case 3: return un ? fn(args[0], args[1], args[2])
                        : fn.call(that, args[0], args[1], args[2]);
      case 4: return un ? fn(args[0], args[1], args[2], args[3])
                        : fn.call(that, args[0], args[1], args[2], args[3]);
    } return fn.apply(that, args);
  };

  var process = _global.process;
  var setTask = _global.setImmediate;
  var clearTask = _global.clearImmediate;
  var MessageChannel = _global.MessageChannel;
  var Dispatch = _global.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;
  var run = function () {
    var id = +this;
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };
  var listener = function (event) {
    run.call(event.data);
  };
  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!setTask || !clearTask) {
    setTask = function setImmediate(fn) {
      var args = [];
      var i = 1;
      while (arguments.length > i) args.push(arguments[i++]);
      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        _invoke(typeof fn == 'function' ? fn : Function(fn), args);
      };
      defer(counter);
      return counter;
    };
    clearTask = function clearImmediate(id) {
      delete queue[id];
    };
    // Node.js 0.8-
    if (_cof(process) == 'process') {
      defer = function (id) {
        process.nextTick(_ctx(run, id, 1));
      };
    // Sphere (JS game engine) Dispatch API
    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(_ctx(run, id, 1));
      };
    // Browsers with MessageChannel, includes WebWorkers
    } else if (MessageChannel) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = _ctx(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
      defer = function (id) {
        _global.postMessage(id + '', '*');
      };
      _global.addEventListener('message', listener, false);
    // IE8-
    } else if (ONREADYSTATECHANGE in _domCreate('script')) {
      defer = function (id) {
        _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
          _html.removeChild(this);
          run.call(id);
        };
      };
    // Rest old browsers
    } else {
      defer = function (id) {
        setTimeout(_ctx(run, id, 1), 0);
      };
    }
  }
  var _task = {
    set: setTask,
    clear: clearTask
  };

  var macrotask = _task.set;
  var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
  var process$1 = _global.process;
  var Promise$1 = _global.Promise;
  var isNode = _cof(process$1) == 'process';

  var _microtask = function () {
    var head, last, notify;

    var flush = function () {
      var parent, fn;
      if (isNode && (parent = process$1.domain)) parent.exit();
      while (head) {
        fn = head.fn;
        head = head.next;
        try {
          fn();
        } catch (e) {
          if (head) notify();
          else last = undefined;
          throw e;
        }
      } last = undefined;
      if (parent) parent.enter();
    };

    // Node.js
    if (isNode) {
      notify = function () {
        process$1.nextTick(flush);
      };
    // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
    } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
      var toggle = true;
      var node = document.createTextNode('');
      new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
      notify = function () {
        node.data = toggle = !toggle;
      };
    // environments with maybe non-completely correct, but existent Promise
    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      var promise = Promise$1.resolve(undefined);
      notify = function () {
        promise.then(flush);
      };
    // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout
    } else {
      notify = function () {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(_global, flush);
      };
    }

    return function (fn) {
      var task = { fn: fn, next: undefined };
      if (last) last.next = task;
      if (!head) {
        head = task;
        notify();
      } last = task;
    };
  };

  // 25.4.1.5 NewPromiseCapability(C)


  function PromiseCapability(C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = _aFunction(resolve);
    this.reject = _aFunction(reject);
  }

  var f$5 = function (C) {
    return new PromiseCapability(C);
  };

  var _newPromiseCapability = {
  	f: f$5
  };

  var _perform = function (exec) {
    try {
      return { e: false, v: exec() };
    } catch (e) {
      return { e: true, v: e };
    }
  };

  var navigator$1 = _global.navigator;

  var _userAgent = navigator$1 && navigator$1.userAgent || '';

  var _promiseResolve = function (C, x) {
    _anObject(C);
    if (_isObject(x) && x.constructor === C) return x;
    var promiseCapability = _newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var task = _task.set;
  var microtask = _microtask();




  var PROMISE = 'Promise';
  var TypeError$1 = _global.TypeError;
  var process$2 = _global.process;
  var versions = process$2 && process$2.versions;
  var v8 = versions && versions.v8 || '';
  var $Promise = _global[PROMISE];
  var isNode$1 = _classof(process$2) == 'process';
  var empty = function () { /* empty */ };
  var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
  var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

  var USE_NATIVE = !!function () {
    try {
      // correct subclassing with @@species support
      var promise = $Promise.resolve(1);
      var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
        exec(empty, empty);
      };
      // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      return (isNode$1 || typeof PromiseRejectionEvent == 'function')
        && promise.then(empty) instanceof FakePromise
        // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // we can't detect it synchronously, so just check versions
        && v8.indexOf('6.6') !== 0
        && _userAgent.indexOf('Chrome/66') === -1;
    } catch (e) { /* empty */ }
  }();

  // helpers
  var isThenable = function (it) {
    var then;
    return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };
  var notify = function (promise, isReject) {
    if (promise._n) return;
    promise._n = true;
    var chain = promise._c;
    microtask(function () {
      var value = promise._v;
      var ok = promise._s == 1;
      var i = 0;
      var run = function (reaction) {
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;
        try {
          if (handler) {
            if (!ok) {
              if (promise._h == 2) onHandleUnhandled(promise);
              promise._h = 1;
            }
            if (handler === true) result = value;
            else {
              if (domain) domain.enter();
              result = handler(value); // may throw
              if (domain) {
                domain.exit();
                exited = true;
              }
            }
            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (e) {
          if (domain && !exited) domain.exit();
          reject(e);
        }
      };
      while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
      promise._c = [];
      promise._n = false;
      if (isReject && !promise._h) onUnhandled(promise);
    });
  };
  var onUnhandled = function (promise) {
    task.call(_global, function () {
      var value = promise._v;
      var unhandled = isUnhandled(promise);
      var result, handler, console;
      if (unhandled) {
        result = _perform(function () {
          if (isNode$1) {
            process$2.emit('unhandledRejection', value, promise);
          } else if (handler = _global.onunhandledrejection) {
            handler({ promise: promise, reason: value });
          } else if ((console = _global.console) && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        });
        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
        promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
      } promise._a = undefined;
      if (unhandled && result.e) throw result.v;
    });
  };
  var isUnhandled = function (promise) {
    return promise._h !== 1 && (promise._a || promise._c).length === 0;
  };
  var onHandleUnhandled = function (promise) {
    task.call(_global, function () {
      var handler;
      if (isNode$1) {
        process$2.emit('rejectionHandled', promise);
      } else if (handler = _global.onrejectionhandled) {
        handler({ promise: promise, reason: promise._v });
      }
    });
  };
  var $reject = function (value) {
    var promise = this;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    promise._v = value;
    promise._s = 2;
    if (!promise._a) promise._a = promise._c.slice();
    notify(promise, true);
  };
  var $resolve = function (value) {
    var promise = this;
    var then;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    try {
      if (promise === value) throw TypeError$1("Promise can't be resolved itself");
      if (then = isThenable(value)) {
        microtask(function () {
          var wrapper = { _w: promise, _d: false }; // wrap
          try {
            then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        promise._v = value;
        promise._s = 1;
        notify(promise, false);
      }
    } catch (e) {
      $reject.call({ _w: promise, _d: false }, e); // wrap
    }
  };

  // constructor polyfill
  if (!USE_NATIVE) {
    // 25.4.3.1 Promise(executor)
    $Promise = function Promise(executor) {
      _anInstance(this, $Promise, PROMISE, '_h');
      _aFunction(executor);
      Internal.call(this);
      try {
        executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
      } catch (err) {
        $reject.call(this, err);
      }
    };
    // eslint-disable-next-line no-unused-vars
    Internal = function Promise(executor) {
      this._c = [];             // <- awaiting reactions
      this._a = undefined;      // <- checked in isUnhandled reactions
      this._s = 0;              // <- state
      this._d = false;          // <- done
      this._v = undefined;      // <- value
      this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
      this._n = false;          // <- notify
    };
    Internal.prototype = _redefineAll($Promise.prototype, {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function then(onFulfilled, onRejected) {
        var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = isNode$1 ? process$2.domain : undefined;
        this._c.push(reaction);
        if (this._a) this._a.push(reaction);
        if (this._s) notify(this, false);
        return reaction.promise;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function (onRejected) {
        return this.then(undefined, onRejected);
      }
    });
    OwnPromiseCapability = function () {
      var promise = new Internal();
      this.promise = promise;
      this.resolve = _ctx($resolve, promise, 1);
      this.reject = _ctx($reject, promise, 1);
    };
    _newPromiseCapability.f = newPromiseCapability = function (C) {
      return C === $Promise || C === Wrapper
        ? new OwnPromiseCapability(C)
        : newGenericPromiseCapability(C);
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
  _setToStringTag($Promise, PROMISE);
  _setSpecies(PROMISE);
  Wrapper = _core[PROMISE];

  // statics
  _export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
    // 25.4.4.5 Promise.reject(r)
    reject: function reject(r) {
      var capability = newPromiseCapability(this);
      var $$reject = capability.reject;
      $$reject(r);
      return capability.promise;
    }
  });
  _export(_export.S + _export.F * (_library || !USE_NATIVE), PROMISE, {
    // 25.4.4.6 Promise.resolve(x)
    resolve: function resolve(x) {
      return _promiseResolve(_library && this === Wrapper ? $Promise : this, x);
    }
  });
  _export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
    $Promise.all(iter)['catch'](empty);
  })), PROMISE, {
    // 25.4.4.1 Promise.all(iterable)
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = _perform(function () {
        var values = [];
        var index = 0;
        var remaining = 1;
        _forOf(iterable, false, function (promise) {
          var $index = index++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          C.resolve(promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[$index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.e) reject(result.v);
      return capability.promise;
    },
    // 25.4.4.4 Promise.race(iterable)
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var reject = capability.reject;
      var result = _perform(function () {
        _forOf(iterable, false, function (promise) {
          C.resolve(promise).then(capability.resolve, reject);
        });
      });
      if (result.e) reject(result.v);
      return capability.promise;
    }
  });

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defineProperty = _defineProperty;

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(Object(source));

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var objectSpread = _objectSpread;

  /* Constants */

  /* Status codes */
  var WWPASS_OK_MSG = 'OK';
  var WWPASS_STATUS = {
    CONTINUE: 100,
    OK: 200,
    INTERNAL_ERROR: 400,
    ALREADY_PERSONALIZED: 401,
    PASSWORD_MISMATCH: 402,
    PASSWORD_LOCKOUT: 403,
    WRONG_KEY: 404,
    WRONG_KEY_SECOND: 405,
    NOT_A_KEY: 406,
    NOT_A_KEY_SECOND: 407,
    KEY_DISABLED: 408,
    NOT_ALLOWED: 409,
    BLANK_TOKEN: 410,
    BLANK_SECOND_TOKEN: 411,
    ACTIVITY_PROFILE_LOCKED: 412,
    SSL_REQUIRED: 413,
    BLANK_NORMAL_TOKEN: 414,
    BLANK_SECOND_NORMAL_TOKEN: 415,
    BLANK_MASTER_TOKEN: 416,
    BLANK_SECOND_MASTER_TOKEN: 417,
    NOT_ACTIVATED_TOKEN: 418,
    NOT_ACTIVATED_SECOND_TOKEN: 419,
    WRONG_KEY_SET: 420,
    NO_VERIFIER: 421,
    INCOMPLETE_KEYSET: 422,
    INVALID_TICKET: 423,
    SAME_TOKEN: 424,
    NO_RECOVERY_INFO: 425,
    BAD_RECOVERY_REQUEST: 426,
    RECOVERY_FAILED: 427,
    TERMINAL_ERROR: 500,
    TERMINAL_NOT_FOUND: 501,
    TERMINAL_BAD_REQUEST: 502,
    NO_CONNECTION: 503,
    NETWORK_ERROR: 504,
    PROTOCOL_ERROR: 505,
    UNKNOWN_HANDLER: 506,
    TERMINAL_CANCELED: 590,
    TIMEOUT: 600,
    TICKET_TIMEOUT: 601,
    USER_REJECT: 603,
    NO_AUTH_INTERFACES_FOUND: 604,
    TERMINAL_TIMEOUT: 605,
    UNSUPPORTED_PLATFORM: 606
  };
  var WWPASS_NO_AUTH_INTERFACES_FOUND_MSG = 'No WWPass SecurityPack is found on your computer or WWPass Browser Plugin is disabled';
  var WWPASS_UNSUPPORTED_PLATFORM_MSG_TMPL = 'WWPass authentication is not supported on';
  var WWPASS_KEY_TYPE_PASSKEY = 'passkey';
  var WWPASS_KEY_TYPE_DEFAULT = WWPASS_KEY_TYPE_PASSKEY;

  var WebSocketPool =
  /*#__PURE__*/
  function () {
    function WebSocketPool(options) {
      var _this = this;

      classCallCheck(this, WebSocketPool);

      this.connectionPool = [];
      var defaultOptions = {
        spfewsAddress: 'wss://spfews.wwpass.com',
        clientKeyOnly: false,
        log: function log() {}
      };
      this.options = objectSpread({}, defaultOptions, options);
      this.promise = new Promise(function (resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
      });
    }

    createClass(WebSocketPool, [{
      key: "onError",
      value: function onError(status, reason, ticket) {
        this.reject({
          status: status,
          reason: reason,
          ticket: ticket
        });
        this.close();
      }
    }, {
      key: "close",
      value: function close() {
        while (this.connectionPool.length) {
          var connection = this.connectionPool.shift();

          if (connection.readyState === WebSocket.OPEN) {
            connection.close();
          }
        }
      }
    }, {
      key: "watchTicket",
      value: function watchTicket(ticket) {
        var _this2 = this;

        if (!('WebSocket' in window)) {
          this.onError(WWPASS_STATUS.INTERNAL_ERROR, 'WebSocket is not supported.', ticket);
          return;
        }

        var socket = new WebSocket(this.options.spfewsAddress);
        this.connectionPool.push(socket);
        var log = this.options.log;
        var clientKey;
        var originalTicket = null;
        var ttl;

        socket.onopen = function () {
          try {
            log("Connected: ".concat(_this2.options.spfewsAddress));
            var message = JSON.stringify({
              ticket: ticket
            });
            log("Sent message to server: ".concat(message));
            socket.send(message);
          } catch (error) {
            log(error);

            _this2.onError(WWPASS_STATUS.INTERNAL_ERROR, 'WebSocket error', ticket);
          }
        };

        socket.onclose = function () {
          try {
            var index = _this2.connectionPool.indexOf(socket);

            if (index !== -1) {
              _this2.connectionPool.splice(index, 1);
            }

            log('Disconnected');
          } catch (error) {
            log(error);

            _this2.onError(WWPASS_STATUS.INTERNAL_ERROR, 'WebSocket error', ticket);
          }
        };

        socket.onmessage = function (message) {
          try {
            log("Message received from server: ".concat(message.data));
            var response = JSON.parse(message.data);
            var status = response.code;

            if ('clientKey' in response && !clientKey) {
              clientKey = response.clientKey;

              if (response.originalTicket !== undefined) {
                originalTicket = response.originalTicket;
                ttl = response.ttl;
              }
            }

            if (status === 200 || clientKey && _this2.options.clientKeyOnly) {
              _this2.resolve({
                status: status,
                reason: WWPASS_OK_MSG,
                clientKey: clientKey,
                ticket: ticket,
                ttl: ttl,
                originalTicket: originalTicket !== null ? originalTicket : ticket
              });

              _this2.close();
            } // Skip all errors. Nothing to do about them

          } catch (error) {
            log(error);

            _this2.onError(WWPASS_STATUS.INTERNAL_ERROR, 'WebSocket error');
          }
        };
      }
    }]);

    return WebSocketPool;
  }();

  _typedArray('Uint16', 2, function (init) {
    return function Uint16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  var abToB64 = function abToB64(data) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
  };

  var b64ToAb = function b64ToAb(base64) {
    var s = atob(base64);
    var bytes = new Uint8Array(s.length);

    for (var i = 0; i < s.length; i += 1) {
      bytes[i] = s.charCodeAt(i);
    }

    return bytes.buffer;
  };

  var ab2str = function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  };

  var str2ab = function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char

    var bufView = new Uint16Array(buf);

    for (var i = 0, strLen = str.length; i < strLen; i += 1) {
      bufView[i] = str.charCodeAt(i);
    }

    return buf;
  };

  var _fixReWks = function (KEY, length, exec) {
    var SYMBOL = _wks(KEY);
    var fns = exec(_defined, SYMBOL, ''[KEY]);
    var strfn = fns[0];
    var rxfn = fns[1];
    if (_fails(function () {
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    })) {
      _redefine(String.prototype, KEY, strfn);
      _hide(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return rxfn.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return rxfn.call(string, this); }
      );
    }
  };

  // @@replace logic
  _fixReWks('replace', 2, function (defined, REPLACE, $replace) {
    // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
    return [function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    }, $replace];
  });

  var crypto = window.crypto || window.msCrypto;
  var subtle = crypto ? crypto.webkitSubtle || crypto.subtle : null;

  var encodeClientKey = function encodeClientKey(key) {
    return abToB64(key).replace(/\+/g, '-').replace(/[/]/g, '.').replace(/=/g, '_');
  };

  var encrypt = function encrypt(options, key, data) {
    return subtle.encrypt(options, key, data);
  };

  var decrypt = function decrypt(options, key, data) {
    return subtle.decrypt(options, key, data);
  };

  var importKey = function importKey(format, key, algoritm, extractable, operations) {
    return subtle.importKey(format, key, algoritm, extractable, operations);
  }; // eslint-disable-line max-len


  var getRandomData = function getRandomData(buffer) {
    return crypto.getRandomValues(buffer);
  };

  var concatBuffers = function concatBuffers() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var totalLen = args.reduce(function (accumulator, curentAB) {
      return accumulator + curentAB.byteLength;
    }, 0);
    var i = 0;
    var result = new Uint8Array(totalLen);

    while (args.length > 0) {
      result.set(new Uint8Array(args[0]), i);
      i += args[0].byteLength;
      args.shift();
    }

    return result.buffer;
  };

  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

  var $find = _arrayMethods(5);
  var KEY = 'find';
  var forced = true;
  // Shouldn't skip holes
  if (KEY in []) Array(1)[KEY](function () { forced = false; });
  _export(_export.P + _export.F * forced, 'Array', {
    find: function find(callbackfn /* , that = undefined */) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });
  _addToUnscopables(KEY);

  // 21.2.5.3 get RegExp.prototype.flags

  var _flags = function () {
    var that = _anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  // 21.2.5.3 get RegExp.prototype.flags()
  if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: _flags
  });

  var TO_STRING = 'toString';
  var $toString = /./[TO_STRING];

  var define = function (fn) {
    _redefine(RegExp.prototype, TO_STRING, fn, true);
  };

  // 21.2.5.14 RegExp.prototype.toString()
  if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
    define(function toString() {
      var R = _anObject(this);
      return '/'.concat(R.source, '/',
        'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
    });
  // FF44- RegExp#toString has a wrong name
  } else if ($toString.name != TO_STRING) {
    define(function toString() {
      return $toString.call(this);
    });
  }

  // 7.2.8 IsRegExp(argument)


  var MATCH = _wks('match');
  var _isRegexp = function (it) {
    var isRegExp;
    return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
  };

  // @@split logic
  _fixReWks('split', 2, function (defined, SPLIT, $split) {
    var isRegExp = _isRegexp;
    var _split = $split;
    var $push = [].push;
    var $SPLIT = 'split';
    var LENGTH = 'length';
    var LAST_INDEX = 'lastIndex';
    if (
      'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
      'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
      'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
      '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
      '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
      ''[$SPLIT](/.?/)[LENGTH]
    ) {
      var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
      // based on es5-shim implementation, need to rework it
      $split = function (separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return [];
        // If `separator` is not a regex, use native split
        if (!isRegExp(separator)) return _split.call(string, separator, limit);
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var separator2, match, lastIndex, lastLength, i;
        // Doesn't need flags gy, but they don't hurt
        if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
        while (match = separatorCopy.exec(string)) {
          // `separatorCopy.lastIndex` is not reliable cross-browser
          lastIndex = match.index + match[0][LENGTH];
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
            // eslint-disable-next-line no-loop-func
            if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
              for (i = 1; i < arguments[LENGTH] - 2; i++) if (arguments[i] === undefined) match[i] = undefined;
            });
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }
          if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
        }
        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      };
    // Chakra, V8
    } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
      $split = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
      };
    }
    // 21.1.3.17 String.prototype.split(separator, limit)
    return [function split(separator, limit) {
      var O = defined(this);
      var fn = separator == undefined ? undefined : separator[SPLIT];
      return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
    }, $split];
  });

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

  var isClientKeyTicket = function isClientKeyTicket(ticket) {
    var _ticket$split = ticket.split('@'),
        _ticket$split2 = slicedToArray(_ticket$split, 1),
        info = _ticket$split2[0];

    var spnameFlagsOTP = info.split(':');

    if (spnameFlagsOTP.length < 3) {
      return false;
    }

    var FLAGS_INDEX = 1; // second element of ticket — flags

    var flags = spnameFlagsOTP[FLAGS_INDEX];
    return flags.split('').some(function (element) {
      return element === 'c';
    });
  };

  var ticketAdapter = function ticketAdapter(response) {
    if (response && response.data) {
      var ticket = {
        ticket: response.data,
        ttl: response.ttl || 120
      };
      delete ticket.data;
      return ticket;
    }

    return response;
  };

  var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  });

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var assertThisInitialized = _assertThisInitialized;

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
      return call;
    }

    return assertThisInitialized(self);
  }

  var possibleConstructorReturn = _possibleConstructorReturn;

  var getPrototypeOf = createCommonjsModule(function (module) {
  function _getPrototypeOf(o) {
    module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  module.exports = _getPrototypeOf;
  });

  var setPrototypeOf = createCommonjsModule(function (module) {
  function _setPrototypeOf(o, p) {
    module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  module.exports = _setPrototypeOf;
  });

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) setPrototypeOf(subClass, superClass);
  }

  var inherits = _inherits;

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  var isNativeFunction = _isNativeFunction;

  var construct = createCommonjsModule(function (module) {
  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      module.exports = _construct = Reflect.construct;
    } else {
      module.exports = _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  module.exports = _construct;
  });

  var wrapNativeSuper = createCommonjsModule(function (module) {
  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return construct(Class, arguments, getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  module.exports = _wrapNativeSuper;
  });

  var WWPassError =
  /*#__PURE__*/
  function (_Error) {
    inherits(WWPassError, _Error);

    function WWPassError(code) {
      var _this;

      classCallCheck(this, WWPassError);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      _this = possibleConstructorReturn(this, getPrototypeOf(WWPassError).call(this, args, WWPassError));
      Error.captureStackTrace(assertThisInitialized(_this), WWPassError);
      _this.code = code;
      return _this;
    }

    createClass(WWPassError, [{
      key: "toString",
      value: function toString() {
        return "".concat(this.name, "(").concat(this.code, "): ").concat(this.message);
      }
    }]);

    return WWPassError;
  }(wrapNativeSuper(Error));

  var exportKey = function exportKey(type, key) {
    return subtle.exportKey(type, key);
  }; // generate digest from string


  var hex = function hex(buffer) {
    var hexCodes = [];
    var view = new DataView(buffer);

    for (var i = 0; i < view.byteLength; i += 4) {
      // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
      var value = view.getUint32(i); // toString(16) will give the hex representation of the number without padding

      var stringValue = value.toString(16); // We use concatenation and slice for padding

      var padding = '00000000';
      var paddedValue = (padding + stringValue).slice(-padding.length);
      hexCodes.push(paddedValue);
    } // Join all the hex strings into one


    return hexCodes.join('');
  }; // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest


  var sha256 = function sha256(str) {
    // We transform the string into an arraybuffer.
    var buffer = str2ab(str);
    return subtle.digest({
      name: 'SHA-256'
    }, buffer).then(function (hash) {
      return hex(hash);
    });
  };

  var clean = function clean(items) {
    var currentDate = window.Date.now();
    return items.filter(function (item) {
      return item.deadline > currentDate;
    });
  };

  var loadNonces = function loadNonces() {
    var wwpassNonce = window.localStorage.getItem('wwpassNonce');

    if (!wwpassNonce) {
      return [];
    }

    try {
      return clean(JSON.parse(wwpassNonce));
    } catch (error) {
      window.localStorage.removeItem('wwpassNonce');
      throw error;
    }
  };

  var saveNonces = function saveNonces(nonces) {
    window.localStorage.setItem('wwpassNonce', JSON.stringify(nonces));
  }; // get from localStorage Client Nonce


  var getClientNonce = function getClientNonce(ticket) {
    var newTTL = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (!subtle) {
      throw new WWPassError(WWPASS_STATUS.SSL_REQUIRED, 'Client-side encryption requires https.');
    }

    var nonces = loadNonces();
    return sha256(ticket).then(function (hash) {
      var nonce = nonces.find(function (it) {
        return hash === it.hash;
      });
      var key = nonce && nonce.key ? b64ToAb(nonce.key) : undefined;

      if (newTTL && key) {
        nonce.deadline = window.Date.now() + newTTL * 1000;
        saveNonces(nonces);
      }

      return key;
    });
  }; // generate Client Nonce and set it to localStorage


  var generateClientNonce = function generateClientNonce(ticket) {
    var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 120;

    if (!subtle) {
      throw new WWPassError(WWPASS_STATUS.SSL_REQUIRED, 'Client-side encryption requires https.');
    }

    return getClientNonce(ticket).then(function (loadedKey) {
      if (loadedKey) {
        return loadedKey;
      }

      return subtle.generateKey({
        name: 'AES-CBC',
        length: 256
      }, true, // is extractable
      ['encrypt', 'decrypt']).then(function (key) {
        return exportKey('raw', key);
      }).then(function (rawKey) {
        return sha256(ticket).then(function (digest) {
          var nonce = {
            hash: digest,
            key: abToB64(rawKey),
            deadline: window.Date.now() + ttl * 1000
          };
          var nonces = loadNonces();
          nonces.push(nonce);
          saveNonces(nonces); // hack for return key

          return rawKey;
        });
      });
    });
  };

  var getClientNonceWrapper = function getClientNonceWrapper(ticket) {
    var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 120;

    if (!isClientKeyTicket(ticket)) {
      return new Promise(function (resolve) {
        resolve(undefined);
      });
    }

    return generateClientNonce(ticket, ttl);
  };

  var copyClientNonce = function copyClientNonce(oldTicket, newTicket, ttl) {
    return getClientNonce(oldTicket).then(function (nonceKey) {
      return sha256(newTicket) // eslint-disable-line max-len
      .then(function (digest) {
        var nonces = loadNonces();
        nonces.push({
          hash: digest,
          key: abToB64(nonceKey),
          deadline: window.Date.now() + ttl * 1000
        });
        saveNonces(nonces);
      });
    });
  };

  var clientKeyIV = new Uint8Array([176, 178, 97, 142, 156, 31, 45, 30, 81, 210, 85, 14, 202, 203, 86, 240]);

  var WWPassCryptoPromise =
  /*#__PURE__*/
  function () {
    createClass(WWPassCryptoPromise, [{
      key: "encryptArrayBuffer",
      value: function encryptArrayBuffer(arrayBuffer) {
        var iv = new Uint8Array(this.ivLen);
        getRandomData(iv);
        var algorithm = this.algorithm;
        Object.assign(algorithm, {
          iv: iv
        });
        return encrypt(algorithm, this.clientKey, arrayBuffer).then(function (encryptedAB) {
          return concatBuffers(iv.buffer, encryptedAB);
        });
      }
    }, {
      key: "encryptString",
      value: function encryptString(string) {
        return this.encryptArrayBuffer(str2ab(string)).then(abToB64);
      }
    }, {
      key: "decryptArrayBuffer",
      value: function decryptArrayBuffer(encryptedArrayBuffer) {
        var algorithm = this.algorithm;
        Object.assign(algorithm, {
          iv: encryptedArrayBuffer.slice(0, this.ivLen)
        });
        return decrypt(algorithm, this.clientKey, encryptedArrayBuffer.slice(this.ivLen));
      }
    }, {
      key: "decryptString",
      value: function decryptString(encryptedString) {
        return this.decryptArrayBuffer(b64ToAb(encryptedString)).then(ab2str);
      } // Private

    }], [{
      key: "getWWPassCrypto",

      /* Return Promise that will be resloved to catual crypto object
      with encrypt/decrypt String/ArrayBuffer methods and cleintKey member.
      Ticket must be authenticated with 'c' auth factor.
      Only supported values for algorithm are 'AES-GCM' and 'AES-CBC'.
      */
      value: function getWWPassCrypto(ticket) {
        var algorithmName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'AES-GCM';
        var encryptedClientKey = null;
        var algorithm = {
          name: algorithmName,
          length: 256
        };
        var websocketPool = new WebSocketPool({
          clientKeyOnly: true
        });
        websocketPool.watchTicket(ticket);
        return websocketPool.promise.then(function (result) {
          if (!result.clientKey) {
            throw Error("No client key associated with the ticket ".concat(ticket));
          }

          encryptedClientKey = result.clientKey;
          return getClientNonce(result.originalTicket ? result.originalTicket : ticket, result.ttl);
        }).then(function (key) {
          if (!key) {
            throw new Error('No client key nonce associated with the ticket in this browser');
          }

          return importKey('raw', key, {
            name: 'AES-CBC'
          }, false, ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']);
        }).then(function (clientKeyNonce) {
          return decrypt({
            name: 'AES-CBC',
            iv: clientKeyIV
          }, clientKeyNonce, b64ToAb(encryptedClientKey));
        }).then(function (arrayBuffer) {
          return importKey('raw', arrayBuffer, algorithm, false, ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']);
        }).then(function (key) {
          return new WWPassCryptoPromise(key, algorithm);
        }).catch(function (error) {
          if (error.reason !== undefined) {
            throw new Error(error.reason);
          }

          throw error;
        });
      }
    }]);

    function WWPassCryptoPromise(key, algorithm) {
      classCallCheck(this, WWPassCryptoPromise);

      this.ivLen = algorithm.name === 'AES-GCM' ? 12 : 16;
      this.algorithm = algorithm;

      if (algorithm.name === 'AES-GCM') {
        Object.assign(this.algorithm, {
          tagLength: 128
        });
      }

      this.clientKey = key;
    }

    return WWPassCryptoPromise;
  }();

  var ITERATOR$4 = _wks('iterator');
  var TO_STRING_TAG = _wks('toStringTag');
  var ArrayValues = _iterators.Array;

  var DOMIterables = {
    CSSRuleList: true, // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true, // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true, // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = _objectKeys(DOMIterables), i$1 = 0; i$1 < collections.length; i$1++) {
    var NAME$1 = collections[i$1];
    var explicit = DOMIterables[NAME$1];
    var Collection = _global[NAME$1];
    var proto = Collection && Collection.prototype;
    var key;
    if (proto) {
      if (!proto[ITERATOR$4]) _hide(proto, ITERATOR$4, ArrayValues);
      if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME$1);
      _iterators[NAME$1] = ArrayValues;
      if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
    }
  }

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));
      var i = _toInteger(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var $at = _stringAt(true);

  // 21.1.3.27 String.prototype[@@iterator]()
  _iterDefine(String, 'String', function (iterated) {
    this._t = String(iterated); // target
    this._i = 0;                // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return { value: undefined, done: true };
    point = $at(O, index);
    this._i += point.length;
    return { value: point, done: false };
  });

  _export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
    var C = _speciesConstructor(this, _core.Promise || _global.Promise);
    var isFunction = typeof onFinally == 'function';
    return this.then(
      isFunction ? function (x) {
        return _promiseResolve(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return _promiseResolve(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  } });

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  var runtime = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  !(function(global) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
      {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      }
      // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.
      return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = module.exports;

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    runtime.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    runtime.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    runtime.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return runtime.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          if (delegate.iterator.return) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    runtime.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };
  })(
    // In sloppy mode, unbound `this` refers to the global object, fallback to
    // Function constructor if we're in global strict mode. That is sadly a form
    // of indirect eval which violates Content Security Policy.
    (function() { return this })() || Function("return this")()
  );
  });

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var asyncToGenerator = _asyncToGenerator;

  var noCacheHeaders = {
    pragma: 'no-cache',
    'cache-control': 'no-cache'
  };

  var getTicket = function getTicket(url) {
    return fetch(url, {
      cache: 'no-store',
      headers: noCacheHeaders
    }).then(function (response) {
      if (!response.ok) {
        throw Error("Error fetching ticket from \"".concat(url, "\": ").concat(response.statusText));
      }

      return response.json();
    });
  };
  /* updateTicket should be called when the client wants to extend the session beyond
    ticket's TTL. The URL handler on the server should use putTicket to get new ticket
    whith the same credentials as the old one. The URL should return JSON object:
    {"oldTicket": "<previous_ticket>", "newTicket": "<new_ticket>", "ttl": <new_ticket_ttl>}
    The functions ultimately resolves to:
    {"ticket": "<new_ticket>", "ttl": <new_ticket_ttl>}
  */


  var updateTicket = function updateTicket(url) {
    return fetch(url, {
      cache: 'no-store',
      headers: noCacheHeaders
    }).then(function (response) {
      if (!response.ok) {
        throw Error("Error updating ticket from \"".concat(url, "\": ").concat(response.statusText));
      }

      return response.json();
    }).then(function (response) {
      if (!response.newTicket || !response.oldTicket || !response.ttl) {
        throw Error("Invalid response ot updateTicket: ".concat(response));
      }

      var result = {
        ticket: response.newTicket,
        ttl: response.ttl
      };

      if (!isClientKeyTicket(response.newTicket)) {
        return result;
      }

      var websocketPool = new WebSocketPool({
        clientKeyOnly: true
      });
      websocketPool.watchTicket(response.newTicket); // We have to call getWebSocketResult and getClientNonce to check for Nonce and update
      // TTL on original ticket

      return websocketPool.promise.then(function (wsResult) {
        if (!wsResult.clientKey) {
          throw Error("No client key associated with the ticket ".concat(response.newTicket));
        }

        return getClientNonce(wsResult.originalTicket ? wsResult.originalTicket : response.newTicket, wsResult.ttl);
      }).then(function () {
        return result;
      });
    });
  };

  // Works with __proto__ only. Old v8 can't work with null proto objects.
  /* eslint-disable no-proto */


  var check = function (O, proto) {
    _anObject(O);
    if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
  };
  var _setProto = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
      function (test, buggy, set) {
        try {
          set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
          set(test, []);
          buggy = !(test instanceof Array);
        } catch (e) { buggy = true; }
        return function setPrototypeOf(O, proto) {
          check(O, proto);
          if (buggy) O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }({}, false) : undefined),
    check: check
  };

  var setPrototypeOf$1 = _setProto.set;
  var _inheritIfRequired = function (that, target, C) {
    var S = target.constructor;
    var P;
    if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf$1) {
      setPrototypeOf$1(that, P);
    } return that;
  };

  var dP$2 = _objectDp.f;
  var gOPN = _objectGopn.f;


  var $RegExp = _global.RegExp;
  var Base = $RegExp;
  var proto$1 = $RegExp.prototype;
  var re1 = /a/g;
  var re2 = /a/g;
  // "new" creates a new object, old webkit buggy here
  var CORRECT_NEW = new $RegExp(re1) !== re1;

  if (_descriptors && (!CORRECT_NEW || _fails(function () {
    re2[_wks('match')] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
  }))) {
    $RegExp = function RegExp(p, f) {
      var tiRE = this instanceof $RegExp;
      var piRE = _isRegexp(p);
      var fiU = f === undefined;
      return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
        : _inheritIfRequired(CORRECT_NEW
          ? new Base(piRE && !fiU ? p.source : p, f)
          : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f)
        , tiRE ? this : proto$1, $RegExp);
    };
    var proxy = function (key) {
      key in $RegExp || dP$2($RegExp, key, {
        configurable: true,
        get: function () { return Base[key]; },
        set: function (it) { Base[key] = it; }
      });
    };
    for (var keys = gOPN(Base), i$2 = 0; keys.length > i$2;) proxy(keys[i$2++]);
    proto$1.constructor = $RegExp;
    $RegExp.prototype = proto$1;
    _redefine(_global, 'RegExp', $RegExp);
  }

  _setSpecies('RegExp');

  // @@search logic
  _fixReWks('search', 1, function (defined, SEARCH, $search) {
    // 21.1.3.15 String.prototype.search(regexp)
    return [function search(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[SEARCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    }, $search];
  });

  var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var space = '[' + _stringWs + ']';
  var non = '\u200b\u0085';
  var ltrim = RegExp('^' + space + space + '*');
  var rtrim = RegExp(space + space + '*$');

  var exporter = function (KEY, exec, ALIAS) {
    var exp = {};
    var FORCE = _fails(function () {
      return !!_stringWs[KEY]() || non[KEY]() != non;
    });
    var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
    if (ALIAS) exp[ALIAS] = fn;
    _export(_export.P + _export.F * FORCE, 'String', exp);
  };

  // 1 -> String#trimLeft
  // 2 -> String#trimRight
  // 3 -> String#trim
  var trim = exporter.trim = function (string, TYPE) {
    string = String(_defined(string));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };

  var _stringTrim = exporter;

  var gOPN$1 = _objectGopn.f;
  var gOPD$1 = _objectGopd.f;
  var dP$3 = _objectDp.f;
  var $trim = _stringTrim.trim;
  var NUMBER = 'Number';
  var $Number = _global[NUMBER];
  var Base$1 = $Number;
  var proto$2 = $Number.prototype;
  // Opera ~12 has broken Object#toString
  var BROKEN_COF = _cof(_objectCreate(proto$2)) == NUMBER;
  var TRIM = 'trim' in String.prototype;

  // 7.1.3 ToNumber(argument)
  var toNumber = function (argument) {
    var it = _toPrimitive(argument, false);
    if (typeof it == 'string' && it.length > 2) {
      it = TRIM ? it.trim() : $trim(it, 3);
      var first = it.charCodeAt(0);
      var third, radix, maxCode;
      if (first === 43 || first === 45) {
        third = it.charCodeAt(2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (it.charCodeAt(1)) {
          case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
          case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
          default: return +it;
        }
        for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
          code = digits.charCodeAt(i);
          // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols
          if (code < 48 || code > maxCode) return NaN;
        } return parseInt(digits, radix);
      }
    } return +it;
  };

  if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
    $Number = function Number(value) {
      var it = arguments.length < 1 ? 0 : value;
      var that = this;
      return that instanceof $Number
        // check on 1..constructor(foo) case
        && (BROKEN_COF ? _fails(function () { proto$2.valueOf.call(that); }) : _cof(that) != NUMBER)
          ? _inheritIfRequired(new Base$1(toNumber(it)), that, $Number) : toNumber(it);
    };
    for (var keys$1 = _descriptors ? gOPN$1(Base$1) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), j = 0, key$1; keys$1.length > j; j++) {
      if (_has(Base$1, key$1 = keys$1[j]) && !_has($Number, key$1)) {
        dP$3($Number, key$1, gOPD$1(Base$1, key$1));
      }
    }
    $Number.prototype = proto$2;
    proto$2.constructor = $Number;
    _redefine(_global, NUMBER, $Number);
  }

  // @@match logic
  _fixReWks('match', 1, function (defined, MATCH, $match) {
    // 21.1.3.11 String.prototype.match(regexp)
    return [function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    }, $match];
  });

  var prefix = window.location.protocol === 'https:' ? 'https:' : 'http:';
  var CSS = "".concat(prefix, "//cdn.wwpass.com/packages/wwpass.js/2.4/wwpass.js.css");

  var isNativeMessaging = function isNativeMessaging() {
    var _navigator = navigator,
        userAgent = _navigator.userAgent;
    var re = /Firefox\/([0-9]+)\./;
    var match = userAgent.match(re);

    if (match && match.length > 1) {
      var version = match[1];

      if (Number(version) >= 51) {
        return 'Firefox';
      }
    }

    re = /Chrome\/([0-9]+)\./;
    match = userAgent.match(re);

    if (match && match.length > 1) {
      var _version = match[1];

      if (Number(_version) >= 45) {
        return 'Chrome';
      }
    }

    return false;
  };

  var wwpassPlatformName = function wwpassPlatformName() {
    var _navigator2 = navigator,
        userAgent = _navigator2.userAgent;
    var knownPlatforms = ['Android', 'iPhone', 'iPad'];

    for (var i = 0; i < knownPlatforms.length; i += 1) {
      if (userAgent.search(new RegExp(knownPlatforms[i], 'i')) !== -1) {
        return knownPlatforms[i];
      }
    }

    return null;
  };

  var wwpassMessageForPlatform = function wwpassMessageForPlatform(platformName) {
    return "".concat(WWPASS_UNSUPPORTED_PLATFORM_MSG_TMPL, " ").concat(platformName);
  };

  var wwpassShowError = function wwpassShowError(message, title, onCloseCallback) {
    if (!document.getElementById('_wwpass_css')) {
      var l = document.createElement('link');
      l.id = '_wwpass_css';
      l.rel = 'stylesheet';
      l.href = CSS;
      document.head.appendChild(l);
    }

    var dlg = document.createElement('div');
    dlg.id = '_wwpass_err_dlg';
    var dlgClose = document.createElement('span');
    dlgClose.innerHTML = 'Close';
    dlgClose.id = '_wwpass_err_close';
    var header = document.createElement('h1');
    header.innerHTML = title;
    var text = document.createElement('div');
    text.innerHTML = message;
    dlg.appendChild(header);
    dlg.appendChild(text);
    dlg.appendChild(dlgClose);
    document.body.appendChild(dlg);
    document.getElementById('_wwpass_err_close').addEventListener('click', function () {
      var elem = document.getElementById('_wwpass_err_dlg');
      elem.parentNode.removeChild(elem);
      onCloseCallback();
      return false;
    });
    return true;
  };

  var wwpassNoSoftware = function wwpassNoSoftware(code, onclose) {
    if (code === WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND) {
      var client = isNativeMessaging();
      var message = '';

      if (client) {
        if (client === 'Chrome') {
          var returnURL = encodeURIComponent(window.location.href);
          message = '<p>The WWPass Authentication extension for Chrome is not installed or is disabled in browser settings.';
          message += '<p>Click the link below to install and enable the WWPass Authentication extension.';
          message += "<p><a href=\"https://chrome.wwpass.com/?callbackURL=".concat(returnURL, "\">Install WWPass Authentication Extension</a>");
        } else if (client === 'Firefox') {
          // Firefox
          var _returnURL = encodeURIComponent(window.location.href);

          message = '<p>The WWPass Authentication extension for Firefox is not installed or is disabled in browser settings.';
          message += '<p>Click the link below to install and enable the WWPass Authentication extension.';
          message += "<p><a href=\"https://firefox.wwpass.com/?callbackURL=".concat(_returnURL, "\">Install WWPass Authentication Extension</a>");
        }
      } else {
        message = '<p>No Security Pack is found on your computer or WWPass&nbsp;Browser&nbsp;Plugin is disabled.</p><p>To install Security Pack visit <a href="https://ks.wwpass.com/download/">Key Services</a> or check plugin settings of your browser to activate WWPass&nbsp;Browser&nbsp;Plugin.</p><p><a href="https://support.wwpass.com/?topic=604">Learn more...</a></p>';
      }

      wwpassShowError(message, 'WWPass &mdash; No Software Found', onclose);
    } else if (code === WWPASS_STATUS.UNSUPPORTED_PLATFORM) {
      wwpassShowError(wwpassMessageForPlatform(wwpassPlatformName()), 'WWPass &mdash; Unsupported Platform', onclose);
    }
  };

  var PLUGIN_OBJECT_ID = '_wwpass_plugin';
  var PLUGIN_MIME_TYPE = 'application/x-wwauth';
  var PLUGIN_TIMEOUT = 10000;
  var REDUCED_PLUGIN_TIMEOUT = 1000;
  var PLUGIN_AUTH_KEYTYPE_REVISION = 9701;
  var PluginInfo = {};
  var savedPluginInstance;
  var pendingReqests = [];

  var havePlugin = function havePlugin() {
    return navigator.mimeTypes[PLUGIN_MIME_TYPE] !== undefined;
  };

  var wwpassPluginShowsErrors = function wwpassPluginShowsErrors(pluginVersionString) {
    if (typeof pluginVersionString === 'string') {
      var pluginVersion = pluginVersionString.split('.');

      for (var i = 0; i < pluginVersion.length; i += 1) {
        pluginVersion[i] = parseInt(pluginVersion[i], 10);
      }

      if (pluginVersion.length === 3) {
        if (pluginVersion[0] > 2 || pluginVersion[0] === 2 && pluginVersion[1] > 4 || pluginVersion[0] === 2 && pluginVersion[1] === 4 && pluginVersion[2] >= 1305) {
          return true;
        }
      }
    }

    return false;
  };

  var getPluginInstance = function getPluginInstance(log) {
    return new Promise(function (resolve, reject) {
      if (savedPluginInstance) {
        if (window._wwpass_plugin_loaded !== undefined) {
          // eslint-disable-line no-underscore-dangle
          pendingReqests.push([resolve, reject]);
        } else {
          log('%s: plugin is already initialized', 'getPluginInstance');
          resolve(savedPluginInstance);
        }
      } else {
        var junkBrowser = navigator.mimeTypes.length === 0;
        var pluginInstalled = havePlugin();
        var timeout = junkBrowser ? REDUCED_PLUGIN_TIMEOUT : PLUGIN_TIMEOUT;

        if (pluginInstalled || junkBrowser) {
          log('%s: trying to create plugin instance(junkBrowser=%s, timeout=%d)', 'getPluginInstance', junkBrowser, timeout);
          var pluginHtml = "<object id='".concat(PLUGIN_OBJECT_ID, "' width=0 height=0 type='").concat(PLUGIN_MIME_TYPE, "'><param name='onload' value='_wwpass_plugin_loaded'/></object>");
          var pluginDiv = document.createElement('div');
          pluginDiv.setAttribute('style', 'position: fixed; left: 0; top:0; width: 1px; height: 1px; z-index: -1; opacity: 0.01');
          document.body.appendChild(pluginDiv);
          pluginDiv.innerHTML += pluginHtml;
          savedPluginInstance = document.getElementById(PLUGIN_OBJECT_ID);
          var timer = setTimeout(function () {
            delete window._wwpass_plugin_loaded; // eslint-disable-line no-underscore-dangle

            savedPluginInstance = null;
            log('%s: WWPass plugin loading timeout', 'getPluginInstance');
            reject({
              code: WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND,
              message: WWPASS_NO_AUTH_INTERFACES_FOUND_MSG
            });

            for (var i = 0; i < pendingReqests.length; i += 1) {
              var pendingReject = pendingReqests[i][1];
              pendingReject({
                code: WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND,
                message: WWPASS_NO_AUTH_INTERFACES_FOUND_MSG
              });
            }
          }, PLUGIN_TIMEOUT);

          window._wwpass_plugin_loaded = function () {
            // eslint-disable-line no-underscore-dangle
            log('%s: plugin loaded', 'getPluginInstance');
            delete window._wwpass_plugin_loaded; // eslint-disable-line no-underscore-dangle

            clearTimeout(timer);

            try {
              PluginInfo.versionString = savedPluginInstance.version;
              PluginInfo.revision = parseInt(savedPluginInstance.version.split('.')[2], 10);
              PluginInfo.showsErrors = wwpassPluginShowsErrors(PluginInfo.versionString);
            } catch (err) {
              log('%s: error parsing plugin version: %s', 'getPluginInstance', err);
            }

            resolve(savedPluginInstance);

            for (var i = 0; i < pendingReqests.length; i += 1) {
              var pendingResolve = pendingReqests[i][0];
              pendingResolve(savedPluginInstance);
            }
          };
        } else {
          log('%s: no suitable plugins installed', 'getPluginInstance');
          reject({
            code: WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND,
            message: WWPASS_NO_AUTH_INTERFACES_FOUND_MSG
          });
        }
      }
    });
  };

  var wrapCallback = function wrapCallback(callback) {
    if (!PluginInfo.showsErrors) {
      return function (code, ticketOrMessage) {
        if (code !== WWPASS_STATUS.OK && code !== WWPASS_STATUS.USER_REJECT) {
          var message = "<p><b>A error has occured:</b> ".concat(ticketOrMessage, "</p>") + "<p><a href=\"https://support.wwpass.com/?topic=".concat(code, "\">Learn more</a></p>");
          wwpassShowError(message, 'WWPass Error', function () {
            callback(code, ticketOrMessage);
          });
        } else {
          callback(code, ticketOrMessage);
        }
      };
    }

    return callback;
  };

  var wwpassPluginExecute = function wwpassPluginExecute(inputRequest) {
    return new Promise(function (resolve, reject) {
      var defaultOptions = {
        log: function log() {}
      };

      var request = objectSpread({}, defaultOptions, inputRequest);

      request.log('%s: called, operation name is "%s"', 'wwpassPluginExecute', request.operation || null);
      getPluginInstance(request.log).then(function (plugin) {
        var wrappedCallback = wrapCallback(function (code, ticketOrMessage) {
          if (code === WWPASS_STATUS.OK) {
            resolve(ticketOrMessage);
          } else {
            reject({
              code: code,
              message: ticketOrMessage
            });
          }
        });

        if (plugin.execute !== undefined) {
          request.callback = wrappedCallback;
          plugin.execute(request);
        } else if (request.operation === 'auth') {
          if (PluginInfo.revision < PLUGIN_AUTH_KEYTYPE_REVISION) {
            plugin.authenticate(request.ticket, wrappedCallback);
          } else {
            plugin.authenticate(request.ticket, wrappedCallback, request.firstKeyType || WWPASS_KEY_TYPE_DEFAULT);
          }
        } else {
          plugin.do_operation(request.operation, wrappedCallback);
        }
      }).catch(reject);
    });
  };

  var pluginWaitForRemoval = function pluginWaitForRemoval() {
    var log = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    return new Promise(function (resolve, reject) {
      getPluginInstance(log).then(function (plugin) {
        plugin.on_key_removed(resolve);
      }).catch(reject);
    });
  };

  var EXTENSION_POLL_TIMEOUT = 200;
  var EXTENSION_POLL_ATTEMPTS = 15;
  var extensionNotInstalled = false;

  var timedPoll = function timedPoll(args) {
    var condition = args.condition;

    if (typeof condition === 'function') {
      condition = condition();
    }

    if (condition) {
      args.onCondition();
    } else {
      var attempts = args.attempts || 0;

      if (attempts--) {
        // eslint-disable-line no-plusplus
        var timeout = args.timeout || 100;
        setTimeout(function (p) {
          return function () {
            timedPoll(p);
          };
        }({
          timeout: timeout,
          attempts: attempts,
          condition: args.condition,
          onCondition: args.onCondition,
          onTimeout: args.onTimeout
        }), timeout);
      } else {
        args.onTimeout();
      }
    }
  };

  var isNativeMessagingExtensionReady = function isNativeMessagingExtensionReady() {
    return (document.querySelector('meta[property="wwpass:extension:version"]') || document.getElementById('_WWAuth_Chrome_Installed_')) !== null;
  };

  var randomID = function randomID() {
    return ((1 + Math.random()) * 0x100000000 | 0).toString(16).substring(1);
  }; // eslint-disable-line no-bitwise,max-len


  var wwpassNMCall = function wwpassNMCall(func, args) {
    var log = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
    return new Promise(function (resolve, reject) {
      if (extensionNotInstalled) {
        log('%s: chrome native messaging extension is not installed', 'wwpassNMExecute');
        reject({
          code: WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND,
          message: WWPASS_NO_AUTH_INTERFACES_FOUND_MSG
        });
        return;
      }

      timedPoll({
        timeout: EXTENSION_POLL_TIMEOUT,
        attempts: EXTENSION_POLL_ATTEMPTS,
        condition: isNativeMessagingExtensionReady,
        onCondition: function onCondition() {
          var id = randomID();
          window.postMessage({
            type: '_WWAuth_Message',
            src: 'client',
            id: id,
            func: func,
            args: args ? JSON.parse(JSON.stringify(args)) : args
          }, '*');
          window.addEventListener('message', function onMessageCallee(event) {
            if (event.data.type === '_WWAuth_Message' && event.data.src === 'plugin' && event.data.id === id) {
              window.removeEventListener('message', onMessageCallee, false);

              if (event.data.code === WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND) {
                var message = '<p>No Security Pack is found on your computer or WWPass&nbsp;native&nbsp;host is not responding.</p><p>To install Security Pack visit <a href="https://ks.wwpass.com/download/">Key Services</a> </p><p><a href="https://support.wwpass.com/?topic=604">Learn more...</a></p>';
                wwpassShowError(message, 'WWPass Error', function () {
                  reject({
                    code: event.data.code,
                    message: event.data.ticketOrMessage
                  });
                });
              } else if (event.data.code === WWPASS_STATUS.OK) {
                resolve(event.data.ticketOrMessage);
              } else {
                reject({
                  code: event.data.code,
                  message: event.data.ticketOrMessage
                });
              }
            }
          }, false);
        },
        onTimeout: function onTimeout() {
          extensionNotInstalled = true;
          log('%s: chrome native messaging extension is not installed', 'wwpassNMExecute');
          reject({
            code: WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND,
            message: WWPASS_NO_AUTH_INTERFACES_FOUND_MSG
          });
        }
      });
    });
  };

  var wwpassNMExecute = function wwpassNMExecute(inputRequest) {
    var defaultOptions = {
      log: function log() {}
    };

    var request = objectSpread({}, defaultOptions, inputRequest);

    var log = request.log;
    delete request.log;
    log('%s: called', 'wwpassNMExecute');
    request.uri = {
      domain: window.location.hostname,
      protocol: window.location.protocol
    };
    return wwpassNMCall('exec', [request], log);
  };

  var nmWaitForRemoval = function nmWaitForRemoval() {
    var log = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    return wwpassNMCall('on_key_rm', undefined, log);
  };

  var pluginPresent = function pluginPresent() {
    return havePlugin() || isNativeMessagingExtensionReady();
  };

  var wwpassPlatformName$1 = function wwpassPlatformName() {
    var _navigator = navigator,
        userAgent = _navigator.userAgent;
    var knownPlatforms = ['Android', 'iPhone', 'iPad'];

    for (var i = 0; i < knownPlatforms.length; i += 1) {
      if (userAgent.search(new RegExp(knownPlatforms[i], 'i')) !== -1) {
        return knownPlatforms[i];
      }
    }

    return null;
  }; // N.B. it call functions in REVERSE order


  var chainedCall = function chainedCall(functions, request, resolve, reject) {
    functions.pop()(request).then(resolve, function (e) {
      if (e.code === WWPASS_STATUS.NO_AUTH_INTERFACES_FOUND) {
        if (functions.length > 0) {
          chainedCall(functions, request, resolve, reject);
        } else {
          wwpassNoSoftware(e.code, function () {});
          reject(e);
        }
      } else {
        reject(e);
      }
    });
  };

  var wwpassCall = function wwpassCall(nmFunc, pluginFunc, request) {
    return new Promise(function (resolve, reject) {
      var platformName = wwpassPlatformName$1();

      if (platformName !== null) {
        wwpassNoSoftware(WWPASS_STATUS.UNSUPPORTED_PLATFORM, function () {
          reject({
            code: WWPASS_STATUS.UNSUPPORTED_PLATFORM,
            message: wwpassMessageForPlatform(platformName)
          });
        });
        return;
      }

      if (havePlugin()) {
        chainedCall([nmFunc, pluginFunc], request, resolve, reject);
      } else {
        chainedCall([pluginFunc, nmFunc], request, resolve, reject);
      }
    });
  };

  var wwpassAuth = function wwpassAuth(request) {
    return wwpassCall(wwpassNMExecute, wwpassPluginExecute, objectSpread({}, request, {
      operation: 'auth'
    }));
  };

  var waitForRemoval = function waitForRemoval() {
    return wwpassCall(nmWaitForRemoval, pluginWaitForRemoval);
  };

  var getCallbackURL = function getCallbackURL() {
    var initialOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaultOptions = {
      ppx: 'wwp_',
      version: 2,
      status: 200,
      reason: 'OK',
      ticket: undefined,
      callbackURL: undefined,
      hw: false // hardware legacy

    };

    var options = objectSpread({}, defaultOptions, initialOptions);

    var url = '';

    if (typeof options.callbackURL === 'string') {
      url = options.callbackURL;
    }

    var firstDelimiter = url.indexOf('?') === -1 ? '?' : '&';
    url += "".concat(firstDelimiter + encodeURIComponent(options.ppx), "version=").concat(options.version);
    url += "&".concat(encodeURIComponent(options.ppx), "ticket=").concat(encodeURIComponent(options.ticket));
    url += "&".concat(encodeURIComponent(options.ppx), "status=").concat(encodeURIComponent(options.status));
    url += "&".concat(encodeURIComponent(options.ppx), "reason=").concat(encodeURIComponent(options.reason));

    if (options.hw) {
      url += "&".concat(encodeURIComponent(options.ppx), "hw=1");
    }

    return url;
  };

  var getUniversalURL = function getUniversalURL() {
    var initialOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var allowCallbackURL = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var defaultOptions = {
      universal: false,
      operation: 'auth',
      ppx: 'wwp_',
      version: 2,
      ticket: undefined,
      callbackURL: undefined,
      clientKey: undefined
    };

    var options = objectSpread({}, defaultOptions, initialOptions);

    var url = options.universal ? 'https://get.wwpass.com/' : 'wwpass://';

    if (options.operation === 'auth') {
      url += 'auth';
      url += "?v=".concat(options.version);
      url += "&t=".concat(encodeURIComponent(options.ticket));
      url += "&ppx=".concat(encodeURIComponent(options.ppx));

      if (options.clientKey) {
        url += "&ck=".concat(options.clientKey);
      }

      if (options.callbackURL && allowCallbackURL) {
        url += "&c=".concat(encodeURIComponent(options.callbackURL));
      }
    } else {
      url += "".concat(encodeURIComponent(options.operation), "?t=").concat(encodeURIComponent(options.ticket));
    }

    return url;
  };

  var navigateToCallback = function navigateToCallback(options) {
    if (typeof options.callbackURL === 'function') {
      options.callbackURL(getCallbackURL(options));
    } else {
      // URL string
      window.location.href = getCallbackURL(options);
    }
  };

  var doWWPassPasskeyAuth = function doWWPassPasskeyAuth(options) {
    return getTicket(options.ticketURL).then(function (json) {
      var response = ticketAdapter(json);
      var ticket = response.ticket;
      return getClientNonceWrapper(ticket, response.ttl).then(function (key) {
        return wwpassAuth({
          ticket: ticket,
          clientKeyNonce: key !== undefined ? abToB64(key) : undefined,
          log: options.log
        });
      }).then(function () {
        return ticket;
      });
      /* We may receive new ticket here but we need
       * to keep the original one to find nonce */
    });
  };

  var PASSKEY_BUTTON_TIMEOUT = 1000;
  var recentlyClicked = false;

  var onButtonClick = function onButtonClick(options) {
    if (recentlyClicked === false) {
      recentlyClicked = true;
      var enableButtonTimer = setTimeout(function () {
        recentlyClicked = false;
        enableButtonTimer = false;
      }, PASSKEY_BUTTON_TIMEOUT);
      return new Promise(function (resolve, reject) {
        doWWPassPasskeyAuth(options).then(function (newTicket) {
          resolve({
            ppx: options.ppx,
            version: options.version,
            code: WWPASS_STATUS.OK,
            message: WWPASS_OK_MSG,
            ticket: newTicket,
            callbackURL: options.callbackURL,
            hw: true
          });
        }).catch(function (err) {
          if (!err.code) {
            options.log('passKey error', err);
          } else if (err.code === WWPASS_STATUS.INTERNAL_ERROR || options.returnErrors) {
            reject({
              ppx: options.ppx,
              version: options.version,
              code: err.code,
              message: err.message,
              callbackURL: options.callbackURL
            });
          }
        }).finally(function () {
          if (enableButtonTimer !== false) {
            clearTimeout(enableButtonTimer);
            enableButtonTimer = false;
            recentlyClicked = false;
          }
        });
      });
    }

    return false;
  };

  // helper for String#{startsWith, endsWith, includes}



  var _stringContext = function (that, searchString, NAME) {
    if (_isRegexp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
    return String(_defined(that));
  };

  var MATCH$1 = _wks('match');
  var _failsIsRegexp = function (KEY) {
    var re = /./;
    try {
      '/./'[KEY](re);
    } catch (e) {
      try {
        re[MATCH$1] = false;
        return !'/./'[KEY](re);
      } catch (f) { /* empty */ }
    } return true;
  };

  var ENDS_WITH = 'endsWith';
  var $endsWith = ''[ENDS_WITH];

  _export(_export.P + _export.F * _failsIsRegexp(ENDS_WITH), 'String', {
    endsWith: function endsWith(searchString /* , endPosition = @length */) {
      var that = _stringContext(this, searchString, ENDS_WITH);
      var endPosition = arguments.length > 1 ? arguments[1] : undefined;
      var len = _toLength(that.length);
      var end = endPosition === undefined ? len : Math.min(_toLength(endPosition), len);
      var search = String(searchString);
      return $endsWith
        ? $endsWith.call(that, search, end)
        : that.slice(end - search.length, end) === search;
    }
  });

  var toString$1 = {}.toString;

  var isarray = Array.isArray || function (arr) {
    return toString$1.call(arr) == '[object Array]';
  };

  var K_MAX_LENGTH = 0x7fffffff;

  function Buffer (arg, offset, length) {
    if (typeof arg === 'number') {
      return allocUnsafe(arg)
    }

    return from(arg, offset, length)
  }

  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;

  // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    });
  }

  function checked (length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
    }
    return length | 0
  }

  function isnan (val) {
    return val !== val // eslint-disable-line no-self-compare
  }

  function createBuffer (length) {
    var buf = new Uint8Array(length);
    buf.__proto__ = Buffer.prototype;
    return buf
  }

  function allocUnsafe (size) {
    return createBuffer(size < 0 ? 0 : checked(size) | 0)
  }

  function fromString (string) {
    var length = byteLength(string) | 0;
    var buf = createBuffer(length);

    var actual = buf.write(string);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      buf = buf.slice(0, actual);
    }

    return buf
  }

  function fromArrayLike (array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    var buf = createBuffer(length);
    for (var i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255;
    }
    return buf
  }

  function fromArrayBuffer (array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('\'offset\' is out of bounds')
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('\'length\' is out of bounds')
    }

    var buf;
    if (byteOffset === undefined && length === undefined) {
      buf = new Uint8Array(array);
    } else if (length === undefined) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }

    // Return an augmented `Uint8Array` instance
    buf.__proto__ = Buffer.prototype;
    return buf
  }

  function fromObject (obj) {
    if (Buffer.isBuffer(obj)) {
      var len = checked(obj.length) | 0;
      var buf = createBuffer(len);

      if (buf.length === 0) {
        return buf
      }

      obj.copy(buf, 0, 0, len);
      return buf
    }

    if (obj) {
      if ((typeof ArrayBuffer !== 'undefined' &&
          obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
        if (typeof obj.length !== 'number' || isnan(obj.length)) {
          return createBuffer(0)
        }
        return fromArrayLike(obj)
      }

      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data)
      }
    }

    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          }

          // valid lead
          leadSurrogate = codePoint;

          continue
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes
  }

  function byteLength (string) {
    if (Buffer.isBuffer(string)) {
      return string.length
    }
    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      string = '' + string;
    }

    var len = string.length;
    if (len === 0) return 0

    return utf8ToBytes(string).length
  }

  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i];
    }
    return i
  }

  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }

  function from (value, offset, length) {
    if (typeof value === 'number') {
      throw new TypeError('"value" argument must not be a number')
    }

    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return fromArrayBuffer(value, offset, length)
    }

    if (typeof value === 'string') {
      return fromString(value, offset)
    }

    return fromObject(value)
  }

  Buffer.prototype.write = function write (string, offset, length) {
    // Buffer#write(string)
    if (offset === undefined) {
      length = this.length;
      offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      length = this.length;
      offset = 0;
    // Buffer#write(string, offset[, length])
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
      } else {
        length = undefined;
      }
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }

    return utf8Write(this, string, offset, length)
  };

  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf = this.subarray(start, end);
    // Return an augmented `Uint8Array` instance
    newBuf.__proto__ = Buffer.prototype;
    return newBuf
  };

  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;
    var i;

    if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000) {
      // ascending copy from start
      for (i = 0; i < len; ++i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, start + len),
        targetStart
      );
    }

    return len
  };

  Buffer.prototype.fill = function fill (val, start, end) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        end = this.length;
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if (code < 256) {
          val = code;
        }
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= start) {
      return this
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = Buffer.isBuffer(val)
        ? val
        : new Buffer(val);
      var len = bytes.length;
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this
  };

  Buffer.concat = function concat (list, length) {
    if (!isarray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }

    if (list.length === 0) {
      return createBuffer(null, 0)
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer
  };

  Buffer.byteLength = byteLength;

  Buffer.prototype._isBuffer = true;
  Buffer.isBuffer = function isBuffer (b) {
    return !!(b != null && b._isBuffer)
  };

  var typedarrayBuffer = Buffer;

  var toSJISFunction;
  var CODEWORDS_COUNT = [
    0, // Not used
    26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
    404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
    1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
    2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
  ];

  /**
   * Returns the QR Code size for the specified version
   *
   * @param  {Number} version QR Code version
   * @return {Number}         size of QR code
   */
  var getSymbolSize = function getSymbolSize (version) {
    if (!version) throw new Error('"version" cannot be null or undefined')
    if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40')
    return version * 4 + 17
  };

  /**
   * Returns the total number of codewords used to store data and EC information.
   *
   * @param  {Number} version QR Code version
   * @return {Number}         Data length in bits
   */
  var getSymbolTotalCodewords = function getSymbolTotalCodewords (version) {
    return CODEWORDS_COUNT[version]
  };

  /**
   * Encode data with Bose-Chaudhuri-Hocquenghem
   *
   * @param  {Number} data Value to encode
   * @return {Number}      Encoded value
   */
  var getBCHDigit = function (data) {
    var digit = 0;

    while (data !== 0) {
      digit++;
      data >>>= 1;
    }

    return digit
  };

  var setToSJISFunction = function setToSJISFunction (f) {
    if (typeof f !== 'function') {
      throw new Error('"toSJISFunc" is not a valid function.')
    }

    toSJISFunction = f;
  };

  var isKanjiModeEnabled = function () {
    return typeof toSJISFunction !== 'undefined'
  };

  var toSJIS = function toSJIS (kanji) {
    return toSJISFunction(kanji)
  };

  var utils = {
  	getSymbolSize: getSymbolSize,
  	getSymbolTotalCodewords: getSymbolTotalCodewords,
  	getBCHDigit: getBCHDigit,
  	setToSJISFunction: setToSJISFunction,
  	isKanjiModeEnabled: isKanjiModeEnabled,
  	toSJIS: toSJIS
  };

  var errorCorrectionLevel = createCommonjsModule(function (module, exports) {
  exports.L = { bit: 1 };
  exports.M = { bit: 0 };
  exports.Q = { bit: 3 };
  exports.H = { bit: 2 };

  function fromString (string) {
    if (typeof string !== 'string') {
      throw new Error('Param is not a string')
    }

    var lcStr = string.toLowerCase();

    switch (lcStr) {
      case 'l':
      case 'low':
        return exports.L

      case 'm':
      case 'medium':
        return exports.M

      case 'q':
      case 'quartile':
        return exports.Q

      case 'h':
      case 'high':
        return exports.H

      default:
        throw new Error('Unknown EC Level: ' + string)
    }
  }

  exports.isValid = function isValid (level) {
    return level && typeof level.bit !== 'undefined' &&
      level.bit >= 0 && level.bit < 4
  };

  exports.from = function from (value, defaultValue) {
    if (exports.isValid(value)) {
      return value
    }

    try {
      return fromString(value)
    } catch (e) {
      return defaultValue
    }
  };
  });
  var errorCorrectionLevel_1 = errorCorrectionLevel.L;
  var errorCorrectionLevel_2 = errorCorrectionLevel.M;
  var errorCorrectionLevel_3 = errorCorrectionLevel.Q;
  var errorCorrectionLevel_4 = errorCorrectionLevel.H;
  var errorCorrectionLevel_5 = errorCorrectionLevel.isValid;

  function BitBuffer () {
    this.buffer = [];
    this.length = 0;
  }

  BitBuffer.prototype = {

    get: function (index) {
      var bufIndex = Math.floor(index / 8);
      return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1
    },

    put: function (num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    },

    getLengthInBits: function () {
      return this.length
    },

    putBit: function (bit) {
      var bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }

      if (bit) {
        this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      }

      this.length++;
    }
  };

  var bitBuffer = BitBuffer;

  /**
   * Helper class to handle QR Code symbol modules
   *
   * @param {Number} size Symbol size
   */
  function BitMatrix (size) {
    if (!size || size < 1) {
      throw new Error('BitMatrix size must be defined and greater than 0')
    }

    this.size = size;
    this.data = new typedarrayBuffer(size * size);
    this.data.fill(0);
    this.reservedBit = new typedarrayBuffer(size * size);
    this.reservedBit.fill(0);
  }

  /**
   * Set bit value at specified location
   * If reserved flag is set, this bit will be ignored during masking process
   *
   * @param {Number}  row
   * @param {Number}  col
   * @param {Boolean} value
   * @param {Boolean} reserved
   */
  BitMatrix.prototype.set = function (row, col, value, reserved) {
    var index = row * this.size + col;
    this.data[index] = value;
    if (reserved) this.reservedBit[index] = true;
  };

  /**
   * Returns bit value at specified location
   *
   * @param  {Number}  row
   * @param  {Number}  col
   * @return {Boolean}
   */
  BitMatrix.prototype.get = function (row, col) {
    return this.data[row * this.size + col]
  };

  /**
   * Applies xor operator at specified location
   * (used during masking process)
   *
   * @param {Number}  row
   * @param {Number}  col
   * @param {Boolean} value
   */
  BitMatrix.prototype.xor = function (row, col, value) {
    this.data[row * this.size + col] ^= value;
  };

  /**
   * Check if bit at specified location is reserved
   *
   * @param {Number}   row
   * @param {Number}   col
   * @return {Boolean}
   */
  BitMatrix.prototype.isReserved = function (row, col) {
    return this.reservedBit[row * this.size + col]
  };

  var bitMatrix = BitMatrix;

  var alignmentPattern = createCommonjsModule(function (module, exports) {
  /**
   * Alignment pattern are fixed reference pattern in defined positions
   * in a matrix symbology, which enables the decode software to re-synchronise
   * the coordinate mapping of the image modules in the event of moderate amounts
   * of distortion of the image.
   *
   * Alignment patterns are present only in QR Code symbols of version 2 or larger
   * and their number depends on the symbol version.
   */

  var getSymbolSize = utils.getSymbolSize;

  /**
   * Calculate the row/column coordinates of the center module of each alignment pattern
   * for the specified QR Code version.
   *
   * The alignment patterns are positioned symmetrically on either side of the diagonal
   * running from the top left corner of the symbol to the bottom right corner.
   *
   * Since positions are simmetrical only half of the coordinates are returned.
   * Each item of the array will represent in turn the x and y coordinate.
   * @see {@link getPositions}
   *
   * @param  {Number} version QR Code version
   * @return {Array}          Array of coordinate
   */
  exports.getRowColCoords = function getRowColCoords (version) {
    if (version === 1) return []

    var posCount = Math.floor(version / 7) + 2;
    var size = getSymbolSize(version);
    var intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
    var positions = [size - 7]; // Last coord is always (size - 7)

    for (var i = 1; i < posCount - 1; i++) {
      positions[i] = positions[i - 1] - intervals;
    }

    positions.push(6); // First coord is always 6

    return positions.reverse()
  };

  /**
   * Returns an array containing the positions of each alignment pattern.
   * Each array's element represent the center point of the pattern as (x, y) coordinates
   *
   * Coordinates are calculated expanding the row/column coordinates returned by {@link getRowColCoords}
   * and filtering out the items that overlaps with finder pattern
   *
   * @example
   * For a Version 7 symbol {@link getRowColCoords} returns values 6, 22 and 38.
   * The alignment patterns, therefore, are to be centered on (row, column)
   * positions (6,22), (22,6), (22,22), (22,38), (38,22), (38,38).
   * Note that the coordinates (6,6), (6,38), (38,6) are occupied by finder patterns
   * and are not therefore used for alignment patterns.
   *
   * var pos = getPositions(7)
   * // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
   *
   * @param  {Number} version QR Code version
   * @return {Array}          Array of coordinates
   */
  exports.getPositions = function getPositions (version) {
    var coords = [];
    var pos = exports.getRowColCoords(version);
    var posLength = pos.length;

    for (var i = 0; i < posLength; i++) {
      for (var j = 0; j < posLength; j++) {
        // Skip if position is occupied by finder patterns
        if ((i === 0 && j === 0) ||             // top-left
            (i === 0 && j === posLength - 1) || // bottom-left
            (i === posLength - 1 && j === 0)) { // top-right
          continue
        }

        coords.push([pos[i], pos[j]]);
      }
    }

    return coords
  };
  });
  var alignmentPattern_1 = alignmentPattern.getRowColCoords;
  var alignmentPattern_2 = alignmentPattern.getPositions;

  var getSymbolSize$1 = utils.getSymbolSize;
  var FINDER_PATTERN_SIZE = 7;

  /**
   * Returns an array containing the positions of each finder pattern.
   * Each array's element represent the top-left point of the pattern as (x, y) coordinates
   *
   * @param  {Number} version QR Code version
   * @return {Array}          Array of coordinates
   */
  var getPositions = function getPositions (version) {
    var size = getSymbolSize$1(version);

    return [
      // top-left
      [0, 0],
      // top-right
      [size - FINDER_PATTERN_SIZE, 0],
      // bottom-left
      [0, size - FINDER_PATTERN_SIZE]
    ]
  };

  var finderPattern = {
  	getPositions: getPositions
  };

  var maskPattern = createCommonjsModule(function (module, exports) {
  /**
   * Data mask pattern reference
   * @type {Object}
   */
  exports.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };

  /**
   * Weighted penalty scores for the undesirable features
   * @type {Object}
   */
  var PenaltyScores = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };

  /**
  * Find adjacent modules in row/column with the same color
  * and assign a penalty value.
  *
  * Points: N1 + i
  * i is the amount by which the number of adjacent modules of the same color exceeds 5
  */
  exports.getPenaltyN1 = function getPenaltyN1 (data) {
    var size = data.size;
    var points = 0;
    var sameCountCol = 0;
    var sameCountRow = 0;
    var lastCol = null;
    var lastRow = null;

    for (var row = 0; row < size; row++) {
      sameCountCol = sameCountRow = 0;
      lastCol = lastRow = null;

      for (var col = 0; col < size; col++) {
        var module = data.get(row, col);
        if (module === lastCol) {
          sameCountCol++;
        } else {
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          lastCol = module;
          sameCountCol = 1;
        }

        module = data.get(col, row);
        if (module === lastRow) {
          sameCountRow++;
        } else {
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
          lastRow = module;
          sameCountRow = 1;
        }
      }

      if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
      if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
    }

    return points
  };

  /**
   * Find 2x2 blocks with the same color and assign a penalty value
   *
   * Points: N2 * (m - 1) * (n - 1)
   */
  exports.getPenaltyN2 = function getPenaltyN2 (data) {
    var size = data.size;
    var points = 0;

    for (var row = 0; row < size - 1; row++) {
      for (var col = 0; col < size - 1; col++) {
        var last = data.get(row, col) +
          data.get(row, col + 1) +
          data.get(row + 1, col) +
          data.get(row + 1, col + 1);

        if (last === 4 || last === 0) points++;
      }
    }

    return points * PenaltyScores.N2
  };

  /**
   * Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
   * preceded or followed by light area 4 modules wide
   *
   * Points: N3 * number of pattern found
   */
  exports.getPenaltyN3 = function getPenaltyN3 (data) {
    var size = data.size;
    var points = 0;
    var bitsCol = 0;
    var bitsRow = 0;

    for (var row = 0; row < size; row++) {
      bitsCol = bitsRow = 0;
      for (var col = 0; col < size; col++) {
        bitsCol = ((bitsCol << 1) & 0x7FF) | data.get(row, col);
        if (col >= 10 && (bitsCol === 0x5D0 || bitsCol === 0x05D)) points++;

        bitsRow = ((bitsRow << 1) & 0x7FF) | data.get(col, row);
        if (col >= 10 && (bitsRow === 0x5D0 || bitsRow === 0x05D)) points++;
      }
    }

    return points * PenaltyScores.N3
  };

  /**
   * Calculate proportion of dark modules in entire symbol
   *
   * Points: N4 * k
   *
   * k is the rating of the deviation of the proportion of dark modules
   * in the symbol from 50% in steps of 5%
   */
  exports.getPenaltyN4 = function getPenaltyN4 (data) {
    var darkCount = 0;
    var modulesCount = data.data.length;

    for (var i = 0; i < modulesCount; i++) darkCount += data.data[i];

    var k = Math.abs(Math.ceil((darkCount * 100 / modulesCount) / 5) - 10);

    return k * PenaltyScores.N4
  };

  /**
   * Return mask value at given position
   *
   * @param  {Number} maskPattern Pattern reference value
   * @param  {Number} i           Row
   * @param  {Number} j           Column
   * @return {Boolean}            Mask value
   */
  function getMaskAt (maskPattern, i, j) {
    switch (maskPattern) {
      case exports.Patterns.PATTERN000: return (i + j) % 2 === 0
      case exports.Patterns.PATTERN001: return i % 2 === 0
      case exports.Patterns.PATTERN010: return j % 3 === 0
      case exports.Patterns.PATTERN011: return (i + j) % 3 === 0
      case exports.Patterns.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
      case exports.Patterns.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0
      case exports.Patterns.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0
      case exports.Patterns.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 === 0

      default: throw new Error('bad maskPattern:' + maskPattern)
    }
  }

  /**
   * Apply a mask pattern to a BitMatrix
   *
   * @param  {Number}    pattern Pattern reference number
   * @param  {BitMatrix} data    BitMatrix data
   */
  exports.applyMask = function applyMask (pattern, data) {
    var size = data.size;

    for (var col = 0; col < size; col++) {
      for (var row = 0; row < size; row++) {
        if (data.isReserved(row, col)) continue
        data.xor(row, col, getMaskAt(pattern, row, col));
      }
    }
  };

  /**
   * Returns the best mask pattern for data
   *
   * @param  {BitMatrix} data
   * @return {Number} Mask pattern reference number
   */
  exports.getBestMask = function getBestMask (data, setupFormatFunc) {
    var numPatterns = Object.keys(exports.Patterns).length;
    var bestPattern = 0;
    var lowerPenalty = Infinity;

    for (var p = 0; p < numPatterns; p++) {
      setupFormatFunc(p);
      exports.applyMask(p, data);

      // Calculate penalty
      var penalty =
        exports.getPenaltyN1(data) +
        exports.getPenaltyN2(data) +
        exports.getPenaltyN3(data) +
        exports.getPenaltyN4(data);

      // Undo previously applied mask
      exports.applyMask(p, data);

      if (penalty < lowerPenalty) {
        lowerPenalty = penalty;
        bestPattern = p;
      }
    }

    return bestPattern
  };
  });
  var maskPattern_1 = maskPattern.Patterns;
  var maskPattern_2 = maskPattern.getPenaltyN1;
  var maskPattern_3 = maskPattern.getPenaltyN2;
  var maskPattern_4 = maskPattern.getPenaltyN3;
  var maskPattern_5 = maskPattern.getPenaltyN4;
  var maskPattern_6 = maskPattern.applyMask;
  var maskPattern_7 = maskPattern.getBestMask;

  var EC_BLOCKS_TABLE = [
  // L  M  Q  H
    1, 1, 1, 1,
    1, 1, 1, 1,
    1, 1, 2, 2,
    1, 2, 2, 4,
    1, 2, 4, 4,
    2, 4, 4, 4,
    2, 4, 6, 5,
    2, 4, 6, 6,
    2, 5, 8, 8,
    4, 5, 8, 8,
    4, 5, 8, 11,
    4, 8, 10, 11,
    4, 9, 12, 16,
    4, 9, 16, 16,
    6, 10, 12, 18,
    6, 10, 17, 16,
    6, 11, 16, 19,
    6, 13, 18, 21,
    7, 14, 21, 25,
    8, 16, 20, 25,
    8, 17, 23, 25,
    9, 17, 23, 34,
    9, 18, 25, 30,
    10, 20, 27, 32,
    12, 21, 29, 35,
    12, 23, 34, 37,
    12, 25, 34, 40,
    13, 26, 35, 42,
    14, 28, 38, 45,
    15, 29, 40, 48,
    16, 31, 43, 51,
    17, 33, 45, 54,
    18, 35, 48, 57,
    19, 37, 51, 60,
    19, 38, 53, 63,
    20, 40, 56, 66,
    21, 43, 59, 70,
    22, 45, 62, 74,
    24, 47, 65, 77,
    25, 49, 68, 81
  ];

  var EC_CODEWORDS_TABLE = [
  // L  M  Q  H
    7, 10, 13, 17,
    10, 16, 22, 28,
    15, 26, 36, 44,
    20, 36, 52, 64,
    26, 48, 72, 88,
    36, 64, 96, 112,
    40, 72, 108, 130,
    48, 88, 132, 156,
    60, 110, 160, 192,
    72, 130, 192, 224,
    80, 150, 224, 264,
    96, 176, 260, 308,
    104, 198, 288, 352,
    120, 216, 320, 384,
    132, 240, 360, 432,
    144, 280, 408, 480,
    168, 308, 448, 532,
    180, 338, 504, 588,
    196, 364, 546, 650,
    224, 416, 600, 700,
    224, 442, 644, 750,
    252, 476, 690, 816,
    270, 504, 750, 900,
    300, 560, 810, 960,
    312, 588, 870, 1050,
    336, 644, 952, 1110,
    360, 700, 1020, 1200,
    390, 728, 1050, 1260,
    420, 784, 1140, 1350,
    450, 812, 1200, 1440,
    480, 868, 1290, 1530,
    510, 924, 1350, 1620,
    540, 980, 1440, 1710,
    570, 1036, 1530, 1800,
    570, 1064, 1590, 1890,
    600, 1120, 1680, 1980,
    630, 1204, 1770, 2100,
    660, 1260, 1860, 2220,
    720, 1316, 1950, 2310,
    750, 1372, 2040, 2430
  ];

  /**
   * Returns the number of error correction block that the QR Code should contain
   * for the specified version and error correction level.
   *
   * @param  {Number} version              QR Code version
   * @param  {Number} errorCorrectionLevel Error correction level
   * @return {Number}                      Number of error correction blocks
   */
  var getBlocksCount = function getBlocksCount (version, errorCorrectionLevel$1) {
    switch (errorCorrectionLevel$1) {
      case errorCorrectionLevel.L:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 0]
      case errorCorrectionLevel.M:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 1]
      case errorCorrectionLevel.Q:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 2]
      case errorCorrectionLevel.H:
        return EC_BLOCKS_TABLE[(version - 1) * 4 + 3]
      default:
        return undefined
    }
  };

  /**
   * Returns the number of error correction codewords to use for the specified
   * version and error correction level.
   *
   * @param  {Number} version              QR Code version
   * @param  {Number} errorCorrectionLevel Error correction level
   * @return {Number}                      Number of error correction codewords
   */
  var getTotalCodewordsCount = function getTotalCodewordsCount (version, errorCorrectionLevel$1) {
    switch (errorCorrectionLevel$1) {
      case errorCorrectionLevel.L:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0]
      case errorCorrectionLevel.M:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1]
      case errorCorrectionLevel.Q:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2]
      case errorCorrectionLevel.H:
        return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3]
      default:
        return undefined
    }
  };

  var errorCorrectionCode = {
  	getBlocksCount: getBlocksCount,
  	getTotalCodewordsCount: getTotalCodewordsCount
  };

  var EXP_TABLE = new typedarrayBuffer(512);
  var LOG_TABLE = new typedarrayBuffer(256)

  /**
   * Precompute the log and anti-log tables for faster computation later
   *
   * For each possible value in the galois field 2^8, we will pre-compute
   * the logarithm and anti-logarithm (exponential) of this value
   *
   * ref {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Introduction_to_mathematical_fields}
   */
  ;(function initTables () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP_TABLE[i] = x;
      LOG_TABLE[x] = i;

      x <<= 1; // multiply by 2

      // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
      // This means that when a number is 256 or larger, it should be XORed with 0x11D.
      if (x & 0x100) { // similar to x >= 256, but a lot faster (because 0x100 == 256)
        x ^= 0x11D;
      }
    }

    // Optimization: double the size of the anti-log table so that we don't need to mod 255 to
    // stay inside the bounds (because we will mainly use this table for the multiplication of
    // two GF numbers, no more).
    // @see {@link mul}
    for (i = 255; i < 512; i++) {
      EXP_TABLE[i] = EXP_TABLE[i - 255];
    }
  }());

  /**
   * Returns log value of n inside Galois Field
   *
   * @param  {Number} n
   * @return {Number}
   */
  var log = function log (n) {
    if (n < 1) throw new Error('log(' + n + ')')
    return LOG_TABLE[n]
  };

  /**
   * Returns anti-log value of n inside Galois Field
   *
   * @param  {Number} n
   * @return {Number}
   */
  var exp = function exp (n) {
    return EXP_TABLE[n]
  };

  /**
   * Multiplies two number inside Galois Field
   *
   * @param  {Number} x
   * @param  {Number} y
   * @return {Number}
   */
  var mul = function mul (x, y) {
    if (x === 0 || y === 0) return 0

    // should be EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255] if EXP_TABLE wasn't oversized
    // @see {@link initTables}
    return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
  };

  var galoisField = {
  	log: log,
  	exp: exp,
  	mul: mul
  };

  var polynomial = createCommonjsModule(function (module, exports) {
  /**
   * Multiplies two polynomials inside Galois Field
   *
   * @param  {Buffer} p1 Polynomial
   * @param  {Buffer} p2 Polynomial
   * @return {Buffer}    Product of p1 and p2
   */
  exports.mul = function mul (p1, p2) {
    var coeff = new typedarrayBuffer(p1.length + p2.length - 1);
    coeff.fill(0);

    for (var i = 0; i < p1.length; i++) {
      for (var j = 0; j < p2.length; j++) {
        coeff[i + j] ^= galoisField.mul(p1[i], p2[j]);
      }
    }

    return coeff
  };

  /**
   * Calculate the remainder of polynomials division
   *
   * @param  {Buffer} divident Polynomial
   * @param  {Buffer} divisor  Polynomial
   * @return {Buffer}          Remainder
   */
  exports.mod = function mod (divident, divisor) {
    var result = new typedarrayBuffer(divident);

    while ((result.length - divisor.length) >= 0) {
      var coeff = result[0];

      for (var i = 0; i < divisor.length; i++) {
        result[i] ^= galoisField.mul(divisor[i], coeff);
      }

      // remove all zeros from buffer head
      var offset = 0;
      while (offset < result.length && result[offset] === 0) offset++;
      result = result.slice(offset);
    }

    return result
  };

  /**
   * Generate an irreducible generator polynomial of specified degree
   * (used by Reed-Solomon encoder)
   *
   * @param  {Number} degree Degree of the generator polynomial
   * @return {Buffer}        Buffer containing polynomial coefficients
   */
  exports.generateECPolynomial = function generateECPolynomial (degree) {
    var poly = new typedarrayBuffer([1]);
    for (var i = 0; i < degree; i++) {
      poly = exports.mul(poly, [1, galoisField.exp(i)]);
    }

    return poly
  };
  });
  var polynomial_1 = polynomial.mul;
  var polynomial_2 = polynomial.mod;
  var polynomial_3 = polynomial.generateECPolynomial;

  function ReedSolomonEncoder (degree) {
    this.genPoly = undefined;
    this.degree = degree;

    if (this.degree) this.initialize(this.degree);
  }

  /**
   * Initialize the encoder.
   * The input param should correspond to the number of error correction codewords.
   *
   * @param  {Number} degree
   */
  ReedSolomonEncoder.prototype.initialize = function initialize (degree) {
    // create an irreducible generator polynomial
    this.degree = degree;
    this.genPoly = polynomial.generateECPolynomial(this.degree);
  };

  /**
   * Encodes a chunk of data
   *
   * @param  {Buffer} data Buffer containing input data
   * @return {Buffer}      Buffer containing encoded data
   */
  ReedSolomonEncoder.prototype.encode = function encode (data) {
    if (!this.genPoly) {
      throw new Error('Encoder not initialized')
    }

    // Calculate EC for this data block
    // extends data size to data+genPoly size
    var pad = new typedarrayBuffer(this.degree);
    pad.fill(0);
    var paddedData = typedarrayBuffer.concat([data, pad], data.length + this.degree);

    // The error correction codewords are the remainder after dividing the data codewords
    // by a generator polynomial
    var remainder = polynomial.mod(paddedData, this.genPoly);

    // return EC data blocks (last n byte, where n is the degree of genPoly)
    // If coefficients number in remainder are less than genPoly degree,
    // pad with 0s to the left to reach the needed number of coefficients
    var start = this.degree - remainder.length;
    if (start > 0) {
      var buff = new typedarrayBuffer(this.degree);
      buff.fill(0);
      remainder.copy(buff, start);

      return buff
    }

    return remainder
  };

  var reedSolomonEncoder = ReedSolomonEncoder;

  var numeric = '[0-9]+';
  var alphanumeric = '[A-Z $%*+-./:]+';
  var kanji = '(?:[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|' +
    '[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B|' +
    '[\u2010\u2015\u2018\u2019\u2025\u2026\u201C\u201D\u2225\u2260]|' +
    '[\u0391-\u0451]|[\u00A7\u00A8\u00B1\u00B4\u00D7\u00F7])+';
  var byte = '(?:(?![A-Z0-9 $%*+-./:]|' + kanji + ').)+';

  var KANJI = new RegExp(kanji, 'g');
  var BYTE_KANJI = new RegExp('[^A-Z0-9 $%*+-./:]+', 'g');
  var BYTE = new RegExp(byte, 'g');
  var NUMERIC = new RegExp(numeric, 'g');
  var ALPHANUMERIC = new RegExp(alphanumeric, 'g');

  var TEST_KANJI = new RegExp('^' + kanji + '$');
  var TEST_NUMERIC = new RegExp('^' + numeric + '$');
  var TEST_ALPHANUMERIC = new RegExp('^[A-Z0-9 $%*+-./:]+$');

  var testKanji = function testKanji (str) {
    return TEST_KANJI.test(str)
  };

  var testNumeric = function testNumeric (str) {
    return TEST_NUMERIC.test(str)
  };

  var testAlphanumeric = function testAlphanumeric (str) {
    return TEST_ALPHANUMERIC.test(str)
  };

  var regex = {
  	KANJI: KANJI,
  	BYTE_KANJI: BYTE_KANJI,
  	BYTE: BYTE,
  	NUMERIC: NUMERIC,
  	ALPHANUMERIC: ALPHANUMERIC,
  	testKanji: testKanji,
  	testNumeric: testNumeric,
  	testAlphanumeric: testAlphanumeric
  };

  var mode = createCommonjsModule(function (module, exports) {
  /**
   * Numeric mode encodes data from the decimal digit set (0 - 9)
   * (byte values 30HEX to 39HEX).
   * Normally, 3 data characters are represented by 10 bits.
   *
   * @type {Object}
   */
  exports.NUMERIC = {
    id: 'Numeric',
    bit: 1 << 0,
    ccBits: [10, 12, 14]
  };

  /**
   * Alphanumeric mode encodes data from a set of 45 characters,
   * i.e. 10 numeric digits (0 - 9),
   *      26 alphabetic characters (A - Z),
   *   and 9 symbols (SP, $, %, *, +, -, ., /, :).
   * Normally, two input characters are represented by 11 bits.
   *
   * @type {Object}
   */
  exports.ALPHANUMERIC = {
    id: 'Alphanumeric',
    bit: 1 << 1,
    ccBits: [9, 11, 13]
  };

  /**
   * In byte mode, data is encoded at 8 bits per character.
   *
   * @type {Object}
   */
  exports.BYTE = {
    id: 'Byte',
    bit: 1 << 2,
    ccBits: [8, 16, 16]
  };

  /**
   * The Kanji mode efficiently encodes Kanji characters in accordance with
   * the Shift JIS system based on JIS X 0208.
   * The Shift JIS values are shifted from the JIS X 0208 values.
   * JIS X 0208 gives details of the shift coded representation.
   * Each two-byte character value is compacted to a 13-bit binary codeword.
   *
   * @type {Object}
   */
  exports.KANJI = {
    id: 'Kanji',
    bit: 1 << 3,
    ccBits: [8, 10, 12]
  };

  /**
   * Mixed mode will contain a sequences of data in a combination of any of
   * the modes described above
   *
   * @type {Object}
   */
  exports.MIXED = {
    bit: -1
  };

  /**
   * Returns the number of bits needed to store the data length
   * according to QR Code specifications.
   *
   * @param  {Mode}   mode    Data mode
   * @param  {Number} version QR Code version
   * @return {Number}         Number of bits
   */
  exports.getCharCountIndicator = function getCharCountIndicator (mode, version$1) {
    if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

    if (!version.isValid(version$1)) {
      throw new Error('Invalid version: ' + version$1)
    }

    if (version$1 >= 1 && version$1 < 10) return mode.ccBits[0]
    else if (version$1 < 27) return mode.ccBits[1]
    return mode.ccBits[2]
  };

  /**
   * Returns the most efficient mode to store the specified data
   *
   * @param  {String} dataStr Input data string
   * @return {Mode}           Best mode
   */
  exports.getBestModeForData = function getBestModeForData (dataStr) {
    if (regex.testNumeric(dataStr)) return exports.NUMERIC
    else if (regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC
    else if (regex.testKanji(dataStr)) return exports.KANJI
    else return exports.BYTE
  };

  /**
   * Return mode name as string
   *
   * @param {Mode} mode Mode object
   * @returns {String}  Mode name
   */
  exports.toString = function toString (mode) {
    if (mode && mode.id) return mode.id
    throw new Error('Invalid mode')
  };

  /**
   * Check if input param is a valid mode object
   *
   * @param   {Mode}    mode Mode object
   * @returns {Boolean} True if valid mode, false otherwise
   */
  exports.isValid = function isValid (mode) {
    return mode && mode.bit && mode.ccBits
  };

  /**
   * Get mode object from its name
   *
   * @param   {String} string Mode name
   * @returns {Mode}          Mode object
   */
  function fromString (string) {
    if (typeof string !== 'string') {
      throw new Error('Param is not a string')
    }

    var lcStr = string.toLowerCase();

    switch (lcStr) {
      case 'numeric':
        return exports.NUMERIC
      case 'alphanumeric':
        return exports.ALPHANUMERIC
      case 'kanji':
        return exports.KANJI
      case 'byte':
        return exports.BYTE
      default:
        throw new Error('Unknown mode: ' + string)
    }
  }

  /**
   * Returns mode from a value.
   * If value is not a valid mode, returns defaultValue
   *
   * @param  {Mode|String} value        Encoding mode
   * @param  {Mode}        defaultValue Fallback value
   * @return {Mode}                     Encoding mode
   */
  exports.from = function from (value, defaultValue) {
    if (exports.isValid(value)) {
      return value
    }

    try {
      return fromString(value)
    } catch (e) {
      return defaultValue
    }
  };
  });
  var mode_1 = mode.NUMERIC;
  var mode_2 = mode.ALPHANUMERIC;
  var mode_3 = mode.BYTE;
  var mode_4 = mode.KANJI;
  var mode_5 = mode.MIXED;
  var mode_6 = mode.getCharCountIndicator;
  var mode_7 = mode.getBestModeForData;
  var mode_8 = mode.isValid;

  var version = createCommonjsModule(function (module, exports) {
  // Generator polynomial used to encode version information
  var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
  var G18_BCH = utils.getBCHDigit(G18);

  function getBestVersionForDataLength (mode, length, errorCorrectionLevel) {
    for (var currentVersion = 1; currentVersion <= 40; currentVersion++) {
      if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
        return currentVersion
      }
    }

    return undefined
  }

  function getReservedBitsCount (mode$1, version) {
    // Character count indicator + mode indicator bits
    return mode.getCharCountIndicator(mode$1, version) + 4
  }

  function getTotalBitsFromDataArray (segments, version) {
    var totalBits = 0;

    segments.forEach(function (data) {
      var reservedBits = getReservedBitsCount(data.mode, version);
      totalBits += reservedBits + data.getBitsLength();
    });

    return totalBits
  }

  function getBestVersionForMixedData (segments, errorCorrectionLevel) {
    for (var currentVersion = 1; currentVersion <= 40; currentVersion++) {
      var length = getTotalBitsFromDataArray(segments, currentVersion);
      if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode.MIXED)) {
        return currentVersion
      }
    }

    return undefined
  }

  /**
   * Check if QR Code version is valid
   *
   * @param  {Number}  version QR Code version
   * @return {Boolean}         true if valid version, false otherwise
   */
  exports.isValid = function isValid (version) {
    return !isNaN(version) && version >= 1 && version <= 40
  };

  /**
   * Returns version number from a value.
   * If value is not a valid version, returns defaultValue
   *
   * @param  {Number|String} value        QR Code version
   * @param  {Number}        defaultValue Fallback value
   * @return {Number}                     QR Code version number
   */
  exports.from = function from (value, defaultValue) {
    if (exports.isValid(value)) {
      return parseInt(value, 10)
    }

    return defaultValue
  };

  /**
   * Returns how much data can be stored with the specified QR code version
   * and error correction level
   *
   * @param  {Number} version              QR Code version (1-40)
   * @param  {Number} errorCorrectionLevel Error correction level
   * @param  {Mode}   mode                 Data mode
   * @return {Number}                      Quantity of storable data
   */
  exports.getCapacity = function getCapacity (version, errorCorrectionLevel, mode$1) {
    if (!exports.isValid(version)) {
      throw new Error('Invalid QR Code version')
    }

    // Use Byte mode as default
    if (typeof mode$1 === 'undefined') mode$1 = mode.BYTE;

    // Total codewords for this QR code version (Data + Error correction)
    var totalCodewords = utils.getSymbolTotalCodewords(version);

    // Total number of error correction codewords
    var ecTotalCodewords = errorCorrectionCode.getTotalCodewordsCount(version, errorCorrectionLevel);

    // Total number of data codewords
    var dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

    if (mode$1 === mode.MIXED) return dataTotalCodewordsBits

    var usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode$1, version);

    // Return max number of storable codewords
    switch (mode$1) {
      case mode.NUMERIC:
        return Math.floor((usableBits / 10) * 3)

      case mode.ALPHANUMERIC:
        return Math.floor((usableBits / 11) * 2)

      case mode.KANJI:
        return Math.floor(usableBits / 13)

      case mode.BYTE:
      default:
        return Math.floor(usableBits / 8)
    }
  };

  /**
   * Returns the minimum version needed to contain the amount of data
   *
   * @param  {Segment} data                    Segment of data
   * @param  {Number} [errorCorrectionLevel=H] Error correction level
   * @param  {Mode} mode                       Data mode
   * @return {Number}                          QR Code version
   */
  exports.getBestVersionForData = function getBestVersionForData (data, errorCorrectionLevel$1) {
    var seg;

    var ecl = errorCorrectionLevel.from(errorCorrectionLevel$1, errorCorrectionLevel.M);

    if (isarray(data)) {
      if (data.length > 1) {
        return getBestVersionForMixedData(data, ecl)
      }

      if (data.length === 0) {
        return 1
      }

      seg = data[0];
    } else {
      seg = data;
    }

    return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl)
  };

  /**
   * Returns version information with relative error correction bits
   *
   * The version information is included in QR Code symbols of version 7 or larger.
   * It consists of an 18-bit sequence containing 6 data bits,
   * with 12 error correction bits calculated using the (18, 6) Golay code.
   *
   * @param  {Number} version QR Code version
   * @return {Number}         Encoded version info bits
   */
  exports.getEncodedBits = function getEncodedBits (version) {
    if (!exports.isValid(version) || version < 7) {
      throw new Error('Invalid QR Code version')
    }

    var d = version << 12;

    while (utils.getBCHDigit(d) - G18_BCH >= 0) {
      d ^= (G18 << (utils.getBCHDigit(d) - G18_BCH));
    }

    return (version << 12) | d
  };
  });
  var version_1 = version.isValid;
  var version_2 = version.getCapacity;
  var version_3 = version.getBestVersionForData;
  var version_4 = version.getEncodedBits;

  var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
  var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
  var G15_BCH = utils.getBCHDigit(G15);

  /**
   * Returns format information with relative error correction bits
   *
   * The format information is a 15-bit sequence containing 5 data bits,
   * with 10 error correction bits calculated using the (15, 5) BCH code.
   *
   * @param  {Number} errorCorrectionLevel Error correction level
   * @param  {Number} mask                 Mask pattern
   * @return {Number}                      Encoded format information bits
   */
  var getEncodedBits = function getEncodedBits (errorCorrectionLevel, mask) {
    var data = ((errorCorrectionLevel.bit << 3) | mask);
    var d = data << 10;

    while (utils.getBCHDigit(d) - G15_BCH >= 0) {
      d ^= (G15 << (utils.getBCHDigit(d) - G15_BCH));
    }

    // xor final data with mask pattern in order to ensure that
    // no combination of Error Correction Level and data mask pattern
    // will result in an all-zero data string
    return ((data << 10) | d) ^ G15_MASK
  };

  var formatInfo = {
  	getEncodedBits: getEncodedBits
  };

  function NumericData (data) {
    this.mode = mode.NUMERIC;
    this.data = data.toString();
  }

  NumericData.getBitsLength = function getBitsLength (length) {
    return 10 * Math.floor(length / 3) + ((length % 3) ? ((length % 3) * 3 + 1) : 0)
  };

  NumericData.prototype.getLength = function getLength () {
    return this.data.length
  };

  NumericData.prototype.getBitsLength = function getBitsLength () {
    return NumericData.getBitsLength(this.data.length)
  };

  NumericData.prototype.write = function write (bitBuffer) {
    var i, group, value;

    // The input data string is divided into groups of three digits,
    // and each group is converted to its 10-bit binary equivalent.
    for (i = 0; i + 3 <= this.data.length; i += 3) {
      group = this.data.substr(i, 3);
      value = parseInt(group, 10);

      bitBuffer.put(value, 10);
    }

    // If the number of input digits is not an exact multiple of three,
    // the final one or two digits are converted to 4 or 7 bits respectively.
    var remainingNum = this.data.length - i;
    if (remainingNum > 0) {
      group = this.data.substr(i);
      value = parseInt(group, 10);

      bitBuffer.put(value, remainingNum * 3 + 1);
    }
  };

  var numericData = NumericData;

  /**
   * Array of characters available in alphanumeric mode
   *
   * As per QR Code specification, to each character
   * is assigned a value from 0 to 44 which in this case coincides
   * with the array index
   *
   * @type {Array}
   */
  var ALPHA_NUM_CHARS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ' ', '$', '%', '*', '+', '-', '.', '/', ':'
  ];

  function AlphanumericData (data) {
    this.mode = mode.ALPHANUMERIC;
    this.data = data;
  }

  AlphanumericData.getBitsLength = function getBitsLength (length) {
    return 11 * Math.floor(length / 2) + 6 * (length % 2)
  };

  AlphanumericData.prototype.getLength = function getLength () {
    return this.data.length
  };

  AlphanumericData.prototype.getBitsLength = function getBitsLength () {
    return AlphanumericData.getBitsLength(this.data.length)
  };

  AlphanumericData.prototype.write = function write (bitBuffer) {
    var i;

    // Input data characters are divided into groups of two characters
    // and encoded as 11-bit binary codes.
    for (i = 0; i + 2 <= this.data.length; i += 2) {
      // The character value of the first character is multiplied by 45
      var value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;

      // The character value of the second digit is added to the product
      value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);

      // The sum is then stored as 11-bit binary number
      bitBuffer.put(value, 11);
    }

    // If the number of input data characters is not a multiple of two,
    // the character value of the final character is encoded as a 6-bit binary number.
    if (this.data.length % 2) {
      bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
    }
  };

  var alphanumericData = AlphanumericData;

  function ByteData (data) {
    this.mode = mode.BYTE;
    this.data = new typedarrayBuffer(data);
  }

  ByteData.getBitsLength = function getBitsLength (length) {
    return length * 8
  };

  ByteData.prototype.getLength = function getLength () {
    return this.data.length
  };

  ByteData.prototype.getBitsLength = function getBitsLength () {
    return ByteData.getBitsLength(this.data.length)
  };

  ByteData.prototype.write = function (bitBuffer) {
    for (var i = 0, l = this.data.length; i < l; i++) {
      bitBuffer.put(this.data[i], 8);
    }
  };

  var byteData = ByteData;

  function KanjiData (data) {
    this.mode = mode.KANJI;
    this.data = data;
  }

  KanjiData.getBitsLength = function getBitsLength (length) {
    return length * 13
  };

  KanjiData.prototype.getLength = function getLength () {
    return this.data.length
  };

  KanjiData.prototype.getBitsLength = function getBitsLength () {
    return KanjiData.getBitsLength(this.data.length)
  };

  KanjiData.prototype.write = function (bitBuffer) {
    var i;

    // In the Shift JIS system, Kanji characters are represented by a two byte combination.
    // These byte values are shifted from the JIS X 0208 values.
    // JIS X 0208 gives details of the shift coded representation.
    for (i = 0; i < this.data.length; i++) {
      var value = utils.toSJIS(this.data[i]);

      // For characters with Shift JIS values from 0x8140 to 0x9FFC:
      if (value >= 0x8140 && value <= 0x9FFC) {
        // Subtract 0x8140 from Shift JIS value
        value -= 0x8140;

      // For characters with Shift JIS values from 0xE040 to 0xEBBF
      } else if (value >= 0xE040 && value <= 0xEBBF) {
        // Subtract 0xC140 from Shift JIS value
        value -= 0xC140;
      } else {
        throw new Error(
          'Invalid SJIS character: ' + this.data[i] + '\n' +
          'Make sure your charset is UTF-8')
      }

      // Multiply most significant byte of result by 0xC0
      // and add least significant byte to product
      value = (((value >>> 8) & 0xff) * 0xC0) + (value & 0xff);

      // Convert result to a 13-bit binary string
      bitBuffer.put(value, 13);
    }
  };

  var kanjiData = KanjiData;

  var dijkstra_1 = createCommonjsModule(function (module) {

  /******************************************************************************
   * Created 2008-08-19.
   *
   * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
   *
   * Copyright (C) 2008
   *   Wyatt Baldwin <self@wyattbaldwin.com>
   *   All rights reserved
   *
   * Licensed under the MIT license.
   *
   *   http://www.opensource.org/licenses/mit-license.php
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *****************************************************************************/
  var dijkstra = {
    single_source_shortest_paths: function(graph, s, d) {
      // Predecessor map for each node that has been encountered.
      // node ID => predecessor node ID
      var predecessors = {};

      // Costs of shortest paths from s to all nodes encountered.
      // node ID => cost
      var costs = {};
      costs[s] = 0;

      // Costs of shortest paths from s to all nodes encountered; differs from
      // `costs` in that it provides easy access to the node that currently has
      // the known shortest path from s.
      // XXX: Do we actually need both `costs` and `open`?
      var open = dijkstra.PriorityQueue.make();
      open.push(s, 0);

      var closest,
          u, v,
          cost_of_s_to_u,
          adjacent_nodes,
          cost_of_e,
          cost_of_s_to_u_plus_cost_of_e,
          cost_of_s_to_v,
          first_visit;
      while (!open.empty()) {
        // In the nodes remaining in graph that have a known cost from s,
        // find the node, u, that currently has the shortest path from s.
        closest = open.pop();
        u = closest.value;
        cost_of_s_to_u = closest.cost;

        // Get nodes adjacent to u...
        adjacent_nodes = graph[u] || {};

        // ...and explore the edges that connect u to those nodes, updating
        // the cost of the shortest paths to any or all of those nodes as
        // necessary. v is the node across the current edge from u.
        for (v in adjacent_nodes) {
          if (adjacent_nodes.hasOwnProperty(v)) {
            // Get the cost of the edge running from u to v.
            cost_of_e = adjacent_nodes[v];

            // Cost of s to u plus the cost of u to v across e--this is *a*
            // cost from s to v that may or may not be less than the current
            // known cost to v.
            cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

            // If we haven't visited v yet OR if the current known cost from s to
            // v is greater than the new cost we just found (cost of s to u plus
            // cost of u to v across e), update v's cost in the cost list and
            // update v's predecessor in the predecessor list (it's now u).
            cost_of_s_to_v = costs[v];
            first_visit = (typeof costs[v] === 'undefined');
            if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
              costs[v] = cost_of_s_to_u_plus_cost_of_e;
              open.push(v, cost_of_s_to_u_plus_cost_of_e);
              predecessors[v] = u;
            }
          }
        }
      }

      if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
        var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
        throw new Error(msg);
      }

      return predecessors;
    },

    extract_shortest_path_from_predecessor_list: function(predecessors, d) {
      var nodes = [];
      var u = d;
      var predecessor;
      while (u) {
        nodes.push(u);
        predecessor = predecessors[u];
        u = predecessors[u];
      }
      nodes.reverse();
      return nodes;
    },

    find_path: function(graph, s, d) {
      var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
      return dijkstra.extract_shortest_path_from_predecessor_list(
        predecessors, d);
    },

    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function (opts) {
        var T = dijkstra.PriorityQueue,
            t = {},
            key;
        opts = opts || {};
        for (key in T) {
          if (T.hasOwnProperty(key)) {
            t[key] = T[key];
          }
        }
        t.queue = [];
        t.sorter = opts.sorter || T.default_sorter;
        return t;
      },

      default_sorter: function (a, b) {
        return a.cost - b.cost;
      },

      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function (value, cost) {
        var item = {value: value, cost: cost};
        this.queue.push(item);
        this.queue.sort(this.sorter);
      },

      /**
       * Return the highest priority element in the queue.
       */
      pop: function () {
        return this.queue.shift();
      },

      empty: function () {
        return this.queue.length === 0;
      }
    }
  };


  // node.js module exports
  {
    module.exports = dijkstra;
  }
  });

  var segments = createCommonjsModule(function (module, exports) {
  /**
   * Returns UTF8 byte length
   *
   * @param  {String} str Input string
   * @return {Number}     Number of byte
   */
  function getStringByteLength (str) {
    return unescape(encodeURIComponent(str)).length
  }

  /**
   * Get a list of segments of the specified mode
   * from a string
   *
   * @param  {Mode}   mode Segment mode
   * @param  {String} str  String to process
   * @return {Array}       Array of object with segments data
   */
  function getSegments (regex, mode, str) {
    var segments = [];
    var result;

    while ((result = regex.exec(str)) !== null) {
      segments.push({
        data: result[0],
        index: result.index,
        mode: mode,
        length: result[0].length
      });
    }

    return segments
  }

  /**
   * Extracts a series of segments with the appropriate
   * modes from a string
   *
   * @param  {String} dataStr Input string
   * @return {Array}          Array of object with segments data
   */
  function getSegmentsFromString (dataStr) {
    var numSegs = getSegments(regex.NUMERIC, mode.NUMERIC, dataStr);
    var alphaNumSegs = getSegments(regex.ALPHANUMERIC, mode.ALPHANUMERIC, dataStr);
    var byteSegs;
    var kanjiSegs;

    if (utils.isKanjiModeEnabled()) {
      byteSegs = getSegments(regex.BYTE, mode.BYTE, dataStr);
      kanjiSegs = getSegments(regex.KANJI, mode.KANJI, dataStr);
    } else {
      byteSegs = getSegments(regex.BYTE_KANJI, mode.BYTE, dataStr);
      kanjiSegs = [];
    }

    var segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);

    return segs
      .sort(function (s1, s2) {
        return s1.index - s2.index
      })
      .map(function (obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        }
      })
  }

  /**
   * Returns how many bits are needed to encode a string of
   * specified length with the specified mode
   *
   * @param  {Number} length String length
   * @param  {Mode} mode     Segment mode
   * @return {Number}        Bit length
   */
  function getSegmentBitsLength (length, mode$1) {
    switch (mode$1) {
      case mode.NUMERIC:
        return numericData.getBitsLength(length)
      case mode.ALPHANUMERIC:
        return alphanumericData.getBitsLength(length)
      case mode.KANJI:
        return kanjiData.getBitsLength(length)
      case mode.BYTE:
        return byteData.getBitsLength(length)
    }
  }

  /**
   * Merges adjacent segments which have the same mode
   *
   * @param  {Array} segs Array of object with segments data
   * @return {Array}      Array of object with segments data
   */
  function mergeSegments (segs) {
    return segs.reduce(function (acc, curr) {
      var prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
      if (prevSeg && prevSeg.mode === curr.mode) {
        acc[acc.length - 1].data += curr.data;
        return acc
      }

      acc.push(curr);
      return acc
    }, [])
  }

  /**
   * Generates a list of all possible nodes combination which
   * will be used to build a segments graph.
   *
   * Nodes are divided by groups. Each group will contain a list of all the modes
   * in which is possible to encode the given text.
   *
   * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
   * The group for '12345' will contain then 3 objects, one for each
   * possible encoding mode.
   *
   * Each node represents a possible segment.
   *
   * @param  {Array} segs Array of object with segments data
   * @return {Array}      Array of object with segments data
   */
  function buildNodes (segs) {
    var nodes = [];
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];

      switch (seg.mode) {
        case mode.NUMERIC:
          nodes.push([seg,
            { data: seg.data, mode: mode.ALPHANUMERIC, length: seg.length },
            { data: seg.data, mode: mode.BYTE, length: seg.length }
          ]);
          break
        case mode.ALPHANUMERIC:
          nodes.push([seg,
            { data: seg.data, mode: mode.BYTE, length: seg.length }
          ]);
          break
        case mode.KANJI:
          nodes.push([seg,
            { data: seg.data, mode: mode.BYTE, length: getStringByteLength(seg.data) }
          ]);
          break
        case mode.BYTE:
          nodes.push([
            { data: seg.data, mode: mode.BYTE, length: getStringByteLength(seg.data) }
          ]);
      }
    }

    return nodes
  }

  /**
   * Builds a graph from a list of nodes.
   * All segments in each node group will be connected with all the segments of
   * the next group and so on.
   *
   * At each connection will be assigned a weight depending on the
   * segment's byte length.
   *
   * @param  {Array} nodes    Array of object with segments data
   * @param  {Number} version QR Code version
   * @return {Object}         Graph of all possible segments
   */
  function buildGraph (nodes, version) {
    var table = {};
    var graph = {'start': {}};
    var prevNodeIds = ['start'];

    for (var i = 0; i < nodes.length; i++) {
      var nodeGroup = nodes[i];
      var currentNodeIds = [];

      for (var j = 0; j < nodeGroup.length; j++) {
        var node = nodeGroup[j];
        var key = '' + i + j;

        currentNodeIds.push(key);
        table[key] = { node: node, lastCount: 0 };
        graph[key] = {};

        for (var n = 0; n < prevNodeIds.length; n++) {
          var prevNodeId = prevNodeIds[n];

          if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
            graph[prevNodeId][key] =
              getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
              getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);

            table[prevNodeId].lastCount += node.length;
          } else {
            if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;

            graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) +
              4 + mode.getCharCountIndicator(node.mode, version); // switch cost
          }
        }
      }

      prevNodeIds = currentNodeIds;
    }

    for (n = 0; n < prevNodeIds.length; n++) {
      graph[prevNodeIds[n]]['end'] = 0;
    }

    return { map: graph, table: table }
  }

  /**
   * Builds a segment from a specified data and mode.
   * If a mode is not specified, the more suitable will be used.
   *
   * @param  {String} data             Input data
   * @param  {Mode | String} modesHint Data mode
   * @return {Segment}                 Segment
   */
  function buildSingleSegment (data, modesHint) {
    var mode$1;
    var bestMode = mode.getBestModeForData(data);

    mode$1 = mode.from(modesHint, bestMode);

    // Make sure data can be encoded
    if (mode$1 !== mode.BYTE && mode$1.bit < bestMode.bit) {
      throw new Error('"' + data + '"' +
        ' cannot be encoded with mode ' + mode.toString(mode$1) +
        '.\n Suggested mode is: ' + mode.toString(bestMode))
    }

    // Use Mode.BYTE if Kanji support is disabled
    if (mode$1 === mode.KANJI && !utils.isKanjiModeEnabled()) {
      mode$1 = mode.BYTE;
    }

    switch (mode$1) {
      case mode.NUMERIC:
        return new numericData(data)

      case mode.ALPHANUMERIC:
        return new alphanumericData(data)

      case mode.KANJI:
        return new kanjiData(data)

      case mode.BYTE:
        return new byteData(data)
    }
  }

  /**
   * Builds a list of segments from an array.
   * Array can contain Strings or Objects with segment's info.
   *
   * For each item which is a string, will be generated a segment with the given
   * string and the more appropriate encoding mode.
   *
   * For each item which is an object, will be generated a segment with the given
   * data and mode.
   * Objects must contain at least the property "data".
   * If property "mode" is not present, the more suitable mode will be used.
   *
   * @param  {Array} array Array of objects with segments data
   * @return {Array}       Array of Segments
   */
  exports.fromArray = function fromArray (array) {
    return array.reduce(function (acc, seg) {
      if (typeof seg === 'string') {
        acc.push(buildSingleSegment(seg, null));
      } else if (seg.data) {
        acc.push(buildSingleSegment(seg.data, seg.mode));
      }

      return acc
    }, [])
  };

  /**
   * Builds an optimized sequence of segments from a string,
   * which will produce the shortest possible bitstream.
   *
   * @param  {String} data    Input string
   * @param  {Number} version QR Code version
   * @return {Array}          Array of segments
   */
  exports.fromString = function fromString (data, version) {
    var segs = getSegmentsFromString(data, utils.isKanjiModeEnabled());

    var nodes = buildNodes(segs);
    var graph = buildGraph(nodes, version);
    var path = dijkstra_1.find_path(graph.map, 'start', 'end');

    var optimizedSegs = [];
    for (var i = 1; i < path.length - 1; i++) {
      optimizedSegs.push(graph.table[path[i]].node);
    }

    return exports.fromArray(mergeSegments(optimizedSegs))
  };

  /**
   * Splits a string in various segments with the modes which
   * best represent their content.
   * The produced segments are far from being optimized.
   * The output of this function is only used to estimate a QR Code version
   * which may contain the data.
   *
   * @param  {string} data Input string
   * @return {Array}       Array of segments
   */
  exports.rawSplit = function rawSplit (data) {
    return exports.fromArray(
      getSegmentsFromString(data, utils.isKanjiModeEnabled())
    )
  };
  });
  var segments_1 = segments.fromArray;
  var segments_2 = segments.fromString;
  var segments_3 = segments.rawSplit;

  /**
   * QRCode for JavaScript
   *
   * modified by Ryan Day for nodejs support
   * Copyright (c) 2011 Ryan Day
   *
   * Licensed under the MIT license:
   *   http://www.opensource.org/licenses/mit-license.php
   *
  //---------------------------------------------------------------------
  // QRCode for JavaScript
  //
  // Copyright (c) 2009 Kazuhiko Arase
  //
  // URL: http://www.d-project.com/
  //
  // Licensed under the MIT license:
  //   http://www.opensource.org/licenses/mit-license.php
  //
  // The word "QR Code" is registered trademark of
  // DENSO WAVE INCORPORATED
  //   http://www.denso-wave.com/qrcode/faqpatent-e.html
  //
  //---------------------------------------------------------------------
  */

  /**
   * Add finder patterns bits to matrix
   *
   * @param  {BitMatrix} matrix  Modules matrix
   * @param  {Number}    version QR Code version
   */
  function setupFinderPattern (matrix, version) {
    var size = matrix.size;
    var pos = finderPattern.getPositions(version);

    for (var i = 0; i < pos.length; i++) {
      var row = pos[i][0];
      var col = pos[i][1];

      for (var r = -1; r <= 7; r++) {
        if (row + r <= -1 || size <= row + r) continue

        for (var c = -1; c <= 7; c++) {
          if (col + c <= -1 || size <= col + c) continue

          if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix.set(row + r, col + c, true, true);
          } else {
            matrix.set(row + r, col + c, false, true);
          }
        }
      }
    }
  }

  /**
   * Add timing pattern bits to matrix
   *
   * Note: this function must be called before {@link setupAlignmentPattern}
   *
   * @param  {BitMatrix} matrix Modules matrix
   */
  function setupTimingPattern (matrix) {
    var size = matrix.size;

    for (var r = 8; r < size - 8; r++) {
      var value = r % 2 === 0;
      matrix.set(r, 6, value, true);
      matrix.set(6, r, value, true);
    }
  }

  /**
   * Add alignment patterns bits to matrix
   *
   * Note: this function must be called after {@link setupTimingPattern}
   *
   * @param  {BitMatrix} matrix  Modules matrix
   * @param  {Number}    version QR Code version
   */
  function setupAlignmentPattern (matrix, version) {
    var pos = alignmentPattern.getPositions(version);

    for (var i = 0; i < pos.length; i++) {
      var row = pos[i][0];
      var col = pos[i][1];

      for (var r = -2; r <= 2; r++) {
        for (var c = -2; c <= 2; c++) {
          if (r === -2 || r === 2 || c === -2 || c === 2 ||
            (r === 0 && c === 0)) {
            matrix.set(row + r, col + c, true, true);
          } else {
            matrix.set(row + r, col + c, false, true);
          }
        }
      }
    }
  }

  /**
   * Add version info bits to matrix
   *
   * @param  {BitMatrix} matrix  Modules matrix
   * @param  {Number}    version QR Code version
   */
  function setupVersionInfo (matrix, version$1) {
    var size = matrix.size;
    var bits = version.getEncodedBits(version$1);
    var row, col, mod;

    for (var i = 0; i < 18; i++) {
      row = Math.floor(i / 3);
      col = i % 3 + size - 8 - 3;
      mod = ((bits >> i) & 1) === 1;

      matrix.set(row, col, mod, true);
      matrix.set(col, row, mod, true);
    }
  }

  /**
   * Add format info bits to matrix
   *
   * @param  {BitMatrix} matrix               Modules matrix
   * @param  {ErrorCorrectionLevel}    errorCorrectionLevel Error correction level
   * @param  {Number}    maskPattern          Mask pattern reference value
   */
  function setupFormatInfo (matrix, errorCorrectionLevel, maskPattern) {
    var size = matrix.size;
    var bits = formatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
    var i, mod;

    for (i = 0; i < 15; i++) {
      mod = ((bits >> i) & 1) === 1;

      // vertical
      if (i < 6) {
        matrix.set(i, 8, mod, true);
      } else if (i < 8) {
        matrix.set(i + 1, 8, mod, true);
      } else {
        matrix.set(size - 15 + i, 8, mod, true);
      }

      // horizontal
      if (i < 8) {
        matrix.set(8, size - i - 1, mod, true);
      } else if (i < 9) {
        matrix.set(8, 15 - i - 1 + 1, mod, true);
      } else {
        matrix.set(8, 15 - i - 1, mod, true);
      }
    }

    // fixed module
    matrix.set(size - 8, 8, 1, true);
  }

  /**
   * Add encoded data bits to matrix
   *
   * @param  {BitMatrix} matrix Modules matrix
   * @param  {Buffer}    data   Data codewords
   */
  function setupData (matrix, data) {
    var size = matrix.size;
    var inc = -1;
    var row = size - 1;
    var bitIndex = 7;
    var byteIndex = 0;

    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      while (true) {
        for (var c = 0; c < 2; c++) {
          if (!matrix.isReserved(row, col - c)) {
            var dark = false;

            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
            }

            matrix.set(row, col - c, dark);
            bitIndex--;

            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || size <= row) {
          row -= inc;
          inc = -inc;
          break
        }
      }
    }
  }

  /**
   * Create encoded codewords from data input
   *
   * @param  {Number}   version              QR Code version
   * @param  {ErrorCorrectionLevel}   errorCorrectionLevel Error correction level
   * @param  {ByteData} data                 Data input
   * @return {Buffer}                        Buffer containing encoded codewords
   */
  function createData (version, errorCorrectionLevel, segments) {
    // Prepare data buffer
    var buffer = new bitBuffer();

    segments.forEach(function (data) {
      // prefix data with mode indicator (4 bits)
      buffer.put(data.mode.bit, 4);

      // Prefix data with character count indicator.
      // The character count indicator is a string of bits that represents the
      // number of characters that are being encoded.
      // The character count indicator must be placed after the mode indicator
      // and must be a certain number of bits long, depending on the QR version
      // and data mode
      // @see {@link Mode.getCharCountIndicator}.
      buffer.put(data.getLength(), mode.getCharCountIndicator(data.mode, version));

      // add binary data sequence to buffer
      data.write(buffer);
    });

    // Calculate required number of bits
    var totalCodewords = utils.getSymbolTotalCodewords(version);
    var ecTotalCodewords = errorCorrectionCode.getTotalCodewordsCount(version, errorCorrectionLevel);
    var dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

    // Add a terminator.
    // If the bit string is shorter than the total number of required bits,
    // a terminator of up to four 0s must be added to the right side of the string.
    // If the bit string is more than four bits shorter than the required number of bits,
    // add four 0s to the end.
    if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
      buffer.put(0, 4);
    }

    // If the bit string is fewer than four bits shorter, add only the number of 0s that
    // are needed to reach the required number of bits.

    // After adding the terminator, if the number of bits in the string is not a multiple of 8,
    // pad the string on the right with 0s to make the string's length a multiple of 8.
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(0);
    }

    // Add pad bytes if the string is still shorter than the total number of required bits.
    // Extend the buffer to fill the data capacity of the symbol corresponding to
    // the Version and Error Correction Level by adding the Pad Codewords 11101100 (0xEC)
    // and 00010001 (0x11) alternately.
    var remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
    for (var i = 0; i < remainingByte; i++) {
      buffer.put(i % 2 ? 0x11 : 0xEC, 8);
    }

    return createCodewords(buffer, version, errorCorrectionLevel)
  }

  /**
   * Encode input data with Reed-Solomon and return codewords with
   * relative error correction bits
   *
   * @param  {BitBuffer} bitBuffer            Data to encode
   * @param  {Number}    version              QR Code version
   * @param  {ErrorCorrectionLevel} errorCorrectionLevel Error correction level
   * @return {Buffer}                         Buffer containing encoded codewords
   */
  function createCodewords (bitBuffer, version, errorCorrectionLevel) {
    // Total codewords for this QR code version (Data + Error correction)
    var totalCodewords = utils.getSymbolTotalCodewords(version);

    // Total number of error correction codewords
    var ecTotalCodewords = errorCorrectionCode.getTotalCodewordsCount(version, errorCorrectionLevel);

    // Total number of data codewords
    var dataTotalCodewords = totalCodewords - ecTotalCodewords;

    // Total number of blocks
    var ecTotalBlocks = errorCorrectionCode.getBlocksCount(version, errorCorrectionLevel);

    // Calculate how many blocks each group should contain
    var blocksInGroup2 = totalCodewords % ecTotalBlocks;
    var blocksInGroup1 = ecTotalBlocks - blocksInGroup2;

    var totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);

    var dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
    var dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;

    // Number of EC codewords is the same for both groups
    var ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;

    // Initialize a Reed-Solomon encoder with a generator polynomial of degree ecCount
    var rs = new reedSolomonEncoder(ecCount);

    var offset = 0;
    var dcData = new Array(ecTotalBlocks);
    var ecData = new Array(ecTotalBlocks);
    var maxDataSize = 0;
    var buffer = new typedarrayBuffer(bitBuffer.buffer);

    // Divide the buffer into the required number of blocks
    for (var b = 0; b < ecTotalBlocks; b++) {
      var dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;

      // extract a block of data from buffer
      dcData[b] = buffer.slice(offset, offset + dataSize);

      // Calculate EC codewords for this data block
      ecData[b] = rs.encode(dcData[b]);

      offset += dataSize;
      maxDataSize = Math.max(maxDataSize, dataSize);
    }

    // Create final data
    // Interleave the data and error correction codewords from each block
    var data = new typedarrayBuffer(totalCodewords);
    var index = 0;
    var i, r;

    // Add data codewords
    for (i = 0; i < maxDataSize; i++) {
      for (r = 0; r < ecTotalBlocks; r++) {
        if (i < dcData[r].length) {
          data[index++] = dcData[r][i];
        }
      }
    }

    // Apped EC codewords
    for (i = 0; i < ecCount; i++) {
      for (r = 0; r < ecTotalBlocks; r++) {
        data[index++] = ecData[r][i];
      }
    }

    return data
  }

  /**
   * Build QR Code symbol
   *
   * @param  {String} data                 Input string
   * @param  {Number} version              QR Code version
   * @param  {ErrorCorretionLevel} errorCorrectionLevel Error level
   * @return {Object}                      Object containing symbol data
   */
  function createSymbol (data, version$1, errorCorrectionLevel) {
    var segments$1;

    if (isarray(data)) {
      segments$1 = segments.fromArray(data);
    } else if (typeof data === 'string') {
      var estimatedVersion = version$1;

      if (!estimatedVersion) {
        var rawSegments = segments.rawSplit(data);

        // Estimate best version that can contain raw splitted segments
        estimatedVersion = version.getBestVersionForData(rawSegments,
          errorCorrectionLevel);
      }

      // Build optimized segments
      // If estimated version is undefined, try with the highest version
      segments$1 = segments.fromString(data, estimatedVersion);
    } else {
      throw new Error('Invalid data')
    }

    // Get the min version that can contain data
    var bestVersion = version.getBestVersionForData(segments$1,
        errorCorrectionLevel);

    // If no version is found, data cannot be stored
    if (!bestVersion) {
      throw new Error('The amount of data is too big to be stored in a QR Code')
    }

    // If not specified, use min version as default
    if (!version$1) {
      version$1 = bestVersion;

    // Check if the specified version can contain the data
    } else if (version$1 < bestVersion) {
      throw new Error('\n' +
        'The chosen QR Code version cannot contain this amount of data.\n' +
        'Minimum version required to store current data is: ' + bestVersion + '.\n'
      )
    }

    var dataBits = createData(version$1, errorCorrectionLevel, segments$1);

    // Allocate matrix buffer
    var moduleCount = utils.getSymbolSize(version$1);
    var modules = new bitMatrix(moduleCount);

    // Add function modules
    setupFinderPattern(modules, version$1);
    setupTimingPattern(modules);
    setupAlignmentPattern(modules, version$1);

    // Add temporary dummy bits for format info just to set them as reserved.
    // This is needed to prevent these bits from being masked by {@link MaskPattern.applyMask}
    // since the masking operation must be performed only on the encoding region.
    // These blocks will be replaced with correct values later in code.
    setupFormatInfo(modules, errorCorrectionLevel, 0);

    if (version$1 >= 7) {
      setupVersionInfo(modules, version$1);
    }

    // Add data codewords
    setupData(modules, dataBits);

    // Find best mask pattern
    var maskPattern$1 = maskPattern.getBestMask(modules,
      setupFormatInfo.bind(null, modules, errorCorrectionLevel));

    // Apply mask pattern
    maskPattern.applyMask(maskPattern$1, modules);

    // Replace format info bits with correct values
    setupFormatInfo(modules, errorCorrectionLevel, maskPattern$1);

    return {
      modules: modules,
      version: version$1,
      errorCorrectionLevel: errorCorrectionLevel,
      maskPattern: maskPattern$1,
      segments: segments$1
    }
  }

  /**
   * QR Code
   *
   * @param {String | Array} data                 Input data
   * @param {Object} options                      Optional configurations
   * @param {Number} options.version              QR Code version
   * @param {String} options.errorCorrectionLevel Error correction level
   * @param {Function} options.toSJISFunc         Helper func to convert utf8 to sjis
   */
  var create = function create (data, options) {
    if (typeof data === 'undefined' || data === '') {
      throw new Error('No input text')
    }

    var errorCorrectionLevel$1 = errorCorrectionLevel.M;
    var version$1;

    if (typeof options !== 'undefined') {
      // Use higher error correction level as default
      errorCorrectionLevel$1 = errorCorrectionLevel.from(options.errorCorrectionLevel, errorCorrectionLevel.M);
      version$1 = version.from(options.version);

      if (options.toSJISFunc) {
        utils.setToSJISFunction(options.toSJISFunc);
      }
    }

    return createSymbol(data, version$1, errorCorrectionLevel$1)
  };

  var qrcode = {
  	create: create
  };

  function hex2rgba (hex) {
    if (typeof hex !== 'string') {
      throw new Error('Color should be defined as hex string')
    }

    var hexCode = hex.slice().replace('#', '').split('');
    if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
      throw new Error('Invalid hex color: ' + hex)
    }

    // Convert from short to long form (fff -> ffffff)
    if (hexCode.length === 3 || hexCode.length === 4) {
      hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
        return [c, c]
      }));
    }

    // Add default alpha value
    if (hexCode.length === 6) hexCode.push('F', 'F');

    var hexValue = parseInt(hexCode.join(''), 16);

    return {
      r: (hexValue >> 24) & 255,
      g: (hexValue >> 16) & 255,
      b: (hexValue >> 8) & 255,
      a: hexValue & 255
    }
  }

  var getOptions = function getOptions (options) {
    if (!options) options = {};
    if (!options.color) options.color = {};

    var margin = typeof options.margin === 'undefined' ||
      options.margin === null ||
      options.margin < 0 ? 4 : options.margin;

    return {
      scale: options.scale || 4,
      margin: margin,
      color: {
        dark: hex2rgba(options.color.dark || '#000000ff'),
        light: hex2rgba(options.color.light || '#ffffffff')
      },
      type: options.type,
      rendererOpts: options.rendererOpts || {}
    }
  };

  var qrToImageData = function qrToImageData (imgData, qr, margin, scale, color) {
    var size = qr.modules.size;
    var data = qr.modules.data;
    var scaledMargin = margin * scale;
    var symbolSize = size * scale + scaledMargin * 2;
    var palette = [color.light, color.dark];

    for (var i = 0; i < symbolSize; i++) {
      for (var j = 0; j < symbolSize; j++) {
        var posDst = (i * symbolSize + j) * 4;
        var pxColor = color.light;

        if (i >= scaledMargin && j >= scaledMargin &&
          i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
          var iSrc = Math.floor((i - scaledMargin) / scale);
          var jSrc = Math.floor((j - scaledMargin) / scale);
          pxColor = palette[data[iSrc * size + jSrc]];
        }

        imgData[posDst++] = pxColor.r;
        imgData[posDst++] = pxColor.g;
        imgData[posDst++] = pxColor.b;
        imgData[posDst] = pxColor.a;
      }
    }
  };

  var utils$1 = {
  	getOptions: getOptions,
  	qrToImageData: qrToImageData
  };

  var canvas = createCommonjsModule(function (module, exports) {
  function clearCanvas (ctx, canvas, size) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!canvas.style) canvas.style = {};
    canvas.height = size;
    canvas.width = size;
    canvas.style.height = size + 'px';
    canvas.style.width = size + 'px';
  }

  function getCanvasElement () {
    try {
      return document.createElement('canvas')
    } catch (e) {
      throw new Error('You need to specify a canvas element')
    }
  }

  exports.render = function render (qrData, canvas, options) {
    var opts = options;
    var canvasEl = canvas;

    if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
      opts = canvas;
      canvas = undefined;
    }

    if (!canvas) {
      canvasEl = getCanvasElement();
    }

    opts = utils$1.getOptions(opts);
    var size = (qrData.modules.size + opts.margin * 2) * opts.scale;

    var ctx = canvasEl.getContext('2d');
    var image = ctx.createImageData(size, size);
    utils$1.qrToImageData(image.data, qrData, opts.margin, opts.scale, opts.color);

    clearCanvas(ctx, canvasEl, size);
    ctx.putImageData(image, 0, 0);

    return canvasEl
  };

  exports.renderToDataURL = function renderToDataURL (qrData, canvas, options) {
    var opts = options;

    if (typeof opts === 'undefined' && (!canvas || !canvas.getContext)) {
      opts = canvas;
      canvas = undefined;
    }

    if (!opts) opts = {};

    var canvasEl = exports.render(qrData, canvas, opts);

    var type = opts.type || 'image/png';
    var rendererOpts = opts.rendererOpts || {};

    return canvasEl.toDataURL(type, rendererOpts.quality)
  };
  });
  var canvas_1 = canvas.render;
  var canvas_2 = canvas.renderToDataURL;

  function getColorAttrib (color) {
    return 'fill="rgb(' + [color.r, color.g, color.b].join(',') + ')" ' +
      'fill-opacity="' + (color.a / 255).toFixed(2) + '"'
  }

  var render = function render (qrData, options) {
    var opts = utils$1.getOptions(options);
    var size = qrData.modules.size;
    var data = qrData.modules.data;
    var qrcodesize = (size + opts.margin * 2) * opts.scale;

    var xmlStr = '<?xml version="1.0" encoding="utf-8"?>\n';
    xmlStr += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';

    xmlStr += '<svg version="1.1" baseProfile="full"';
    xmlStr += ' width="' + qrcodesize + '" height="' + qrcodesize + '"';
    xmlStr += ' viewBox="0 0 ' + qrcodesize + ' ' + qrcodesize + '"';
    xmlStr += ' xmlns="http://www.w3.org/2000/svg"';
    xmlStr += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    xmlStr += ' xmlns:ev="http://www.w3.org/2001/xml-events">\n';

    xmlStr += '<rect x="0" y="0" width="' + qrcodesize + '" height="' + qrcodesize + '" ' + getColorAttrib(opts.color.light) + ' />\n';
    xmlStr += '<defs><rect id="p" width="' + opts.scale + '" height="' + opts.scale + '" /></defs>\n';
    xmlStr += '<g ' + getColorAttrib(opts.color.dark) + '>\n';

    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        if (!data[i * size + j]) continue

        var x = (opts.margin + j) * opts.scale;
        var y = (opts.margin + i) * opts.scale;
        xmlStr += '<use x="' + x + '" y="' + y + '" xlink:href="#p" />\n';
      }
    }

    xmlStr += '</g>\n';
    xmlStr += '</svg>';

    return xmlStr
  };

  var svgRender = {
  	render: render
  };

  var browser = createCommonjsModule(function (module, exports) {
  function renderCanvas (renderFunc, canvas, text, opts, cb) {
    var argsNum = arguments.length - 1;
    if (argsNum < 2) {
      throw new Error('Too few arguments provided')
    }

    if (argsNum === 2) {
      cb = text;
      text = canvas;
      canvas = opts = undefined;
    } else if (argsNum === 3) {
      if (canvas.getContext && typeof cb === 'undefined') {
        cb = opts;
        opts = undefined;
      } else {
        cb = opts;
        opts = text;
        text = canvas;
        canvas = undefined;
      }
    }

    if (typeof cb !== 'function') {
      throw new Error('Callback required as last argument')
    }

    try {
      var data = qrcode.create(text, opts);
      cb(null, renderFunc(data, canvas, opts));
    } catch (e) {
      cb(e);
    }
  }

  exports.create = qrcode.create;
  exports.toCanvas = renderCanvas.bind(null, canvas.render);
  exports.toDataURL = renderCanvas.bind(null, canvas.renderToDataURL);

  // only svg for now.
  exports.toString = renderCanvas.bind(null, function (data, _, opts) {
    return svgRender.render(data, opts)
  });

  /**
   * Legacy API
   */
  exports.qrcodedraw = function () {
    return {
      draw: exports.toCanvas
    }
  };
  });
  var browser_1 = browser.create;
  var browser_2 = browser.toCanvas;
  var browser_3 = browser.toDataURL;
  var browser_4 = browser.qrcodedraw;

  var qrCodeLogoSVG = '<defs><linearGradient id="a" x1="36" y1="50" x2="64" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4200ff"/><stop offset="0.16" stop-color="#007fff"/><stop offset="0.27" stop-color="#00d1c5"/><stop offset="0.38" stop-color="#00ff29"/><stop offset="0.5" stop-color="#dbff00"/><stop offset="0.62" stop-color="#00ff29"/><stop offset="0.73" stop-color="#00d1c5"/><stop offset="0.84" stop-color="#007fff"/><stop offset="1" stop-color="#4200ff"/></linearGradient><linearGradient id="b" x1="32.75" x2="67.25" xlink:href="#a"/><linearGradient id="c" x1="28" x2="72" xlink:href="#a"/><linearGradient id="d" x1="23.25" x2="76.75" xlink:href="#a"/><linearGradient id="e" x1="18.5" x2="81.5" xlink:href="#a"/><linearGradient id="f" x1="15" y1="50" x2="85" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0.05" stop-color="#007fff"/><stop offset="0.2" stop-color="#00d1c5"/><stop offset="0.34" stop-color="#00ff29"/><stop offset="0.5" stop-color="#dbff00"/><stop offset="0.66" stop-color="#00ff29"/><stop offset="0.8" stop-color="#00d1c5"/><stop offset="0.95" stop-color="#007fff"/></linearGradient></defs><path d="M100,0H0V100H100Z" fill="#fff"/><rect x="5.59" y="5.59" width="88.82" height="88.82" rx="4.61" fill="#000f2c"/><rect x="36" y="37.5" width="28" height="25" fill="url(#a)"/><path d="M65.83,65.83H67V67H65.83Zm0-17.59H64.66V47.07h1.17v1.17H67v2.35H65.83ZM63.48,62.31h1.18V60h1.17V58.79H64.66V55.27H63.48v3.52h1.18V60H63.48v1.18H62.31v3.51h1.17Zm-2.34-27h3.52v3.52H61.14Zm4.69-1.17H60V40h5.86ZM60,49.41h1.17v1.17H60ZM58.79,33H67v8.21H58.79Zm0,25.79H60V60H58.79Zm0-7H57.62v1.17h1.17Zm2.35,5.86H57.62v3.52h3.52Zm-3.52,4.69H56.45v1.17h1.17ZM56.45,34.17H55.28v1.17h1.17Zm4.69,16.41h1.17V47.07H61.14v1.17H60v1.17H58.79V48.24H56.45V47.07H55.28V45.9h1.17V42.38H55.28V41.21H54.1V40H52.93v1.18H51.76V37.69h1.17v1.17H54.1V37.69H52.93V36.52H51.76v1.17H50.59v3.52h1.17v1.17h1.17V41.21H54.1v3.51H52.93V45.9H51.76v1.17h1.17v2.34H54.1V48.24h2.35v1.17h1.17v1.18H60v1.17h1.17Zm-9.38,2.35H49.41V54.1h1.18v1.17h1.17Zm-1.17,7H49.41v1.17h1.18Zm-1.18-21.1H48.24v2.35h1.17ZM45.9,54.1H44.72v1.17H45.9ZM44.72,35.34H43.55V33h1.17v1.17H45.9V33h1.17v1.17H45.9v2.35H44.72Zm0,4.69H43.55v1.18h1.17Zm0,5.87H43.55v1.17h1.17Zm2.35,17.58h1.17V60H45.9v1.18h1.17v1.17H44.72v1.17H43.55v1.17h1.17v1.18h2.35Zm-4.69-27h1.17v1.17H42.38ZM41.21,48.83v-.59h1.17V47.07H41.21v1.17H40v1.17h1.18Zm8.2,8.79h2.35V56.45H49.41V55.27H48.24v1.18h1.17v1.17H47.07V56.45H45.9v1.17H44.72V56.45H43.55V55.27H42.38V54.1H41.21v1.17H40v1.18h1.18V55.27h1.17v1.18h1.17v1.17h1.17v1.17h4.69ZM35.35,35.34h3.51v3.52H35.35Zm0,25.8h3.51v3.51H35.35Zm4.68-27H34.17V40H40ZM40,60H34.17v5.87H40Zm3.52,5.87H42.38V63.48h1.17V60h1.17V58.79H42.38V57.62H37.69V56.45h1.17V55.27H36.52v2.35H35.35V56.45H33V55.27h2.35V52.93H34.17V54.1H33V51.76h2.35v1.17h1.17V54.1h1.17V52.93h1.17V54.1h2.35V52.93H40V51.76H36.52V50.59H40V49.41H36.52V48.24H35.35v1.17H33V45.9h1.17v1.17h7V45.9H40V44.72H37.69V45.9H36.52V44.72H34.17V42.38h2.35v2.34h1.17V43.55H40V42.38h1.18v1.17H40v1.17h1.18V45.9h1.17V43.55h1.17V42.38H42.38V38.86h2.34V40H45.9v1.18H44.72v1.17H45.9v7H43.55V48.24H42.38v1.17H41.21v1.18H40v1.17h1.18v1.17h1.17V54.1h2.34V52.93H43.55V51.76H42.38V50.59h2.34v2.34H45.9V50.59h1.17v2.34h1.17V49.41h1.17V48.24h1.18v1.17H49.41v1.18h1.18v1.17H54.1V50.59H52.93V49.41H51.76V47.07H50.59V45.9h1.17V44.72h1.17V43.55H51.76V42.38H50.59v2.34H49.41V43.55H48.24v1.17H47.07V43.55h1.17V42.38H47.07V38.86H45.9V37.69h1.17v1.17h1.17V34.17h1.17v2.35h2.35V35.34H50.59V33h2.34v1.17H51.76v1.17H54.1V34.17h1.18V33h2.34v3.52H55.28V35.34H54.1v2.35h1.18v3.52h1.17V40h1.17V45.9H60V44.72H58.79V42.38h2.35V45.9h2.34V44.72H62.31V42.38h1.17v2.34h1.18V43.55H67V45.9H65.83V44.72H64.66V45.9H63.48v3.51h1.18v1.18H63.48v1.17H61.14v1.17H60V54.1H57.62V52.93H56.45V51.76H55.28V54.1h1.17v1.17H60v1.18h2.34V55.27H61.14V54.1h1.17V52.93h1.17V54.1h1.18v1.17h1.17V52.93H64.66V51.76H67v3.51H65.83v2.35H67V60H65.83v3.52H67v1.17H63.48V67H60V65.83h2.34V64.65H60V62.31H58.79v2.34H57.62v1.18h1.17V67H56.45V63.48H55.28v2.35H54.1V64.65H52.93V60H54.1v3.52h1.18V60h1.17V57.62H55.28V56.45H54.1V55.27h1.18V54.1H54.1V52.93H52.93v4.69H54.1v1.17H51.76v2.35H50.59v2.34h1.17v1.17H50.59v1.18h2.34V67H50.59V65.83H49.41V64.65H48.24V67H43.55ZM33,33h8.21v8.21H33Zm0,25.79h8.21V67H33Z" fill="none" stroke-width="0.5" stroke="url(#b)"/><path d="M70.25,70.25h1.5v1.5h-1.5Zm0-22.5h-1.5v-1.5h1.5v1.5h1.5v3h-1.5Zm-3,18h1.5v-3h1.5v-1.5h-1.5v-4.5h-1.5v4.5h1.5v1.5h-1.5v1.5h-1.5v4.5h1.5Zm-3-34.5h4.5v4.5h-4.5Zm6-1.5h-7.5v7.5h7.5Zm-7.5,19.5h1.5v1.5h-1.5Zm-1.5-21h10.5v10.5H61.25Zm0,33h1.5v1.5h-1.5Zm0-9h-1.5v1.5h1.5Zm3,7.5h-4.5v4.5h4.5Zm-4.5,6h-1.5v1.5h1.5Zm-1.5-36h-1.5v1.5h1.5Zm6,21h1.5v-4.5h-1.5v1.5h-1.5v1.5h-1.5v-1.5h-3v-1.5h-1.5v-1.5h1.5v-4.5h-1.5v-1.5h-1.5v-1.5h-1.5v1.5h-1.5v-4.5h1.5v1.5h1.5v-1.5h-1.5v-1.5h-1.5v1.5h-1.5v4.5h1.5v1.5h1.5v-1.5h1.5v4.5h-1.5v1.5h-1.5v1.5h1.5v3h1.5v-1.5h3v1.5h1.5v1.5h3v1.5h1.5Zm-12,3h-3v1.5h1.5v1.5h1.5Zm-1.5,9h-1.5v1.5h1.5Zm-1.5-27h-1.5v3h1.5Zm-4.5,19.5h-1.5v1.5h1.5Zm-1.5-24h-1.5v-3h1.5v1.5h1.5v-1.5h1.5v1.5h-1.5v3h-1.5Zm0,6h-1.5v1.5h1.5Zm0,7.5h-1.5v1.5h1.5Zm3,22.5h1.5v-4.5h-3v1.5h1.5v1.5h-3v1.5h-1.5v1.5h1.5v1.5h3Zm-6-34.5h1.5v1.5h-1.5ZM38.75,48.5v-.75h1.5v-1.5h-1.5v1.5h-1.5v1.5h1.5Zm10.5,11.25h3v-1.5h-3v-1.5h-1.5v1.5h1.5v1.5h-3v-1.5h-1.5v1.5h-1.5v-1.5h-1.5v-1.5h-1.5v-1.5h-1.5v1.5h-1.5v1.5h1.5v-1.5h1.5v1.5h1.5v1.5h1.5v1.5h6Zm-18-28.5h4.5v4.5h-4.5Zm0,33h4.5v4.5h-4.5Zm6-34.5h-7.5v7.5h7.5Zm0,33h-7.5v7.5h7.5Zm4.5,7.5h-1.5v-3h1.5v-4.5h1.5v-1.5h-3v-1.5h-6v-1.5h1.5v-1.5h-3v3h-1.5v-1.5h-3v-1.5h3v-3h-1.5v1.5h-1.5v-3h3v1.5h1.5v1.5h1.5v-1.5h1.5v1.5h3v-1.5h-1.5v-1.5h-4.5v-1.5h4.5v-1.5h-4.5v-1.5h-1.5v1.5h-3v-4.5h1.5v1.5h9v-1.5h-1.5v-1.5h-3v1.5h-1.5v-1.5h-3v-3h3v3h1.5v-1.5h3v-1.5h1.5v1.5h-1.5v1.5h1.5v1.5h1.5v-3h1.5v-1.5h-1.5v-4.5h3v1.5h1.5v1.5h-1.5v1.5h1.5v9h-3v-1.5h-1.5v1.5h-1.5v1.5h-1.5v1.5h1.5v1.5h1.5v1.5h3v-1.5h-1.5v-1.5h-1.5v-1.5h3v3h1.5v-3h1.5v3h1.5v-4.5h1.5v-1.5h1.5v1.5h-1.5v1.5h1.5v1.5h4.5v-1.5h-1.5v-1.5h-1.5v-3h-1.5v-1.5h1.5v-1.5h1.5v-1.5h-1.5v-1.5h-1.5v3h-1.5v-1.5h-1.5v1.5h-1.5v-1.5h1.5v-1.5h-1.5v-4.5h-1.5v-1.5h1.5v1.5h1.5v-6h1.5v3h3v-1.5h-1.5v-3h3v1.5h-1.5v1.5h3v-1.5h1.5v-1.5h3v4.5h-3v-1.5h-1.5v3h1.5v4.5h1.5v-1.5h1.5v7.5h3v-1.5h-1.5v-3h3v4.5h3v-1.5h-1.5v-3h1.5v3h1.5v-1.5h3v3h-1.5v-1.5h-1.5v1.5h-1.5v4.5h1.5v1.5h-1.5v1.5h-3v1.5h-1.5v1.5h-3v-1.5h-1.5v-1.5h-1.5v3h1.5v1.5h4.5v1.5h3v-1.5h-1.5v-1.5h1.5v-1.5h1.5v1.5h1.5v1.5h1.5v-3h-1.5v-1.5h3v4.5h-1.5v3h1.5v3h-1.5v4.5h1.5v1.5h-4.5v3h-4.5v-1.5h3v-1.5h-3v-3h-1.5v3h-1.5v1.5h1.5v1.5h-3v-4.5h-1.5v3h-1.5v-1.5h-1.5v-6h1.5v4.5h1.5v-4.5h1.5v-3h-1.5v-1.5h-1.5v-1.5h1.5v-1.5h-1.5v-1.5h-1.5v6h1.5v1.5h-3v3h-1.5v3h1.5v1.5h-1.5v1.5h3v1.5h-3v-1.5h-1.5v-1.5h-1.5v3h-6Zm-13.5-42h10.5v10.5H28.25Zm0,33h10.5v10.5H28.25Z" fill="none" stroke-width="0.5" stroke="url(#c)"/><path d="M74.67,74.67H76.5V76.5H74.67Zm0-27.41H72.84V45.43h1.83v1.83H76.5v3.65H74.67ZM71,69.19h1.82V65.53h1.83V63.7H72.84V58.22H71V63.7h1.82v1.83H71v1.83H69.19v5.48H71Zm-3.66-42h5.48v5.48H67.36Zm7.31-1.83H65.53v9.13h9.14ZM65.53,49.08h1.83v1.83H65.53ZM63.71,23.5H76.5V36.29H63.71Zm0,40.2h1.82v1.83H63.71Zm0-11H61.88v1.83h1.83Zm3.65,9.14H61.88v5.48h5.48Zm-5.48,7.31H60.05V71h1.83ZM60.05,25.32H58.22v1.84h1.83Zm7.31,25.59h1.83V45.43H67.36v1.83H65.53v1.83H63.71V47.26H60.05V45.43H58.22V43.6h1.83V38.12H58.22V36.29H56.4V34.46H54.57v1.83H52.74V30.81h1.83v1.83H56.4V30.81H54.57V29H52.74v1.83H50.91v5.48h1.83v1.83h1.83V36.29H56.4v5.48H54.57V43.6H52.74v1.83h1.83v3.66H56.4V47.26h3.65v1.83h1.83v1.82h3.65v1.83h1.83ZM52.74,54.57H49.09v1.82h1.82v1.83h1.83Zm-1.83,11H49.09v1.83h1.82ZM49.09,32.64H47.26v3.65h1.83ZM43.6,56.39H41.78v1.83H43.6ZM41.78,27.16H40V23.5h1.83v1.83H43.6V23.5h1.83v1.83H43.6V29H41.78Zm0,7.3H40v1.83h1.83Zm0,9.14H40v1.83h1.83ZM45.43,71h1.83V65.53H43.6v1.83h1.83v1.83H41.78V71H40v1.83h1.83v1.83h3.65ZM38.12,29H40v1.83H38.12ZM36.29,48.17v-.91h1.83V45.43H36.29v1.83H34.47v1.83h1.82Zm12.8,13.71h3.65V60.05H49.09V58.22H47.26v1.83h1.83v1.83H45.43V60.05H43.6v1.83H41.78V60.05H40V58.22H38.12V56.39H36.29v1.83H34.47v1.83h1.82V58.22h1.83v1.83H40v1.83h1.83V63.7h7.31ZM27.16,27.16h5.48v5.48H27.16Zm0,40.2h5.48v5.48H27.16Zm7.31-42H25.33v9.13h9.14Zm0,40.2H25.33v9.14h9.14ZM40,74.67H38.12V71H40V65.53h1.83V63.7H38.12V61.88H30.81V60.05h1.83V58.22H29v3.66H27.16V60.05H23.5V58.22h3.66V54.57H25.33v1.82H23.5V52.74h3.66v1.83H29v1.82h1.83V54.57h1.83v1.82h3.65V54.57H34.47V52.74H29V50.91h5.49V49.09H29V47.26H27.16v1.83H23.5V43.6h1.83v1.83h11V43.6H34.47V41.77H30.81V43.6H29V41.77H25.33V38.12H29v3.65h1.83V40h3.66V38.12h1.82V40H34.47v1.82h1.82V43.6h1.83V40H40V38.12H38.12V32.64h3.66v1.82H43.6v1.83H41.78v1.83H43.6v11H40V47.26H38.12v1.83H36.29v1.82H34.47v1.83h1.82v1.83h1.83v1.82h3.66V54.57H40V52.74H38.12V50.91h3.66v3.66H43.6V50.91h1.83v3.66h1.83V49.09h1.83V47.26h1.82v1.83H49.09v1.82h1.82v1.83H56.4V50.91H54.57V49.09H52.74V45.43H50.91V43.6h1.83V41.77h1.83V40H52.74V38.12H50.91v3.65H49.09V40H47.26v1.82H45.43V40h1.83V38.12H45.43V32.64H43.6V30.81h1.83v1.83h1.83V25.33h1.83V29h3.65V27.16H50.91V23.5h3.66v1.83H52.74v1.83H56.4V25.33h1.82V23.5h3.66V29H58.22V27.16H56.4v3.65h1.82v5.48h1.83V34.46h1.83V43.6h3.65V41.77H63.71V38.12h3.65V43.6H71V41.77H69.19V38.12H71v3.65h1.82V40H76.5V43.6H74.67V41.77H72.84V43.6H71v5.49h1.82v1.82H71v1.83H67.36v1.83H65.53v1.82H61.88V54.57H60.05V52.74H58.22v3.65h1.83v1.83h5.48v1.83h3.66V58.22H67.36V56.39h1.83V54.57H71v1.82h1.82v1.83h1.83V54.57H72.84V52.74H76.5v5.48H74.67v3.66H76.5v3.65H74.67V71H76.5v1.83H71V76.5H65.53V74.67h3.66V72.84H65.53V69.19H63.71v3.65H61.88v1.83h1.83V76.5H60.05V71H58.22v3.66H56.4V72.84H54.57V65.53H56.4V71h1.82V65.53h1.83V61.88H58.22V60.05H56.4V58.22h1.82V56.39H56.4V54.57H54.57v7.31H56.4V63.7H52.74v3.66H50.91V71h1.83v1.83H50.91v1.83h3.66V76.5H50.91V74.67H49.09V72.84H47.26V76.5H40ZM23.5,23.5H36.29V36.29H23.5Zm0,40.21H36.29V76.5H23.5Z" fill="none" stroke-width="0.5" stroke="url(#d)"/><path d="M79.09,79.09h2.16v2.16H79.09Zm0-32.32H76.94V44.61h2.15v2.16h2.16v4.31H79.09ZM74.78,72.63h2.16V68.32h2.15V66.16H76.94V59.7H74.78v6.46h2.16v2.16H74.78v2.15H72.63v6.47h2.15ZM70.47,23.06h6.47v6.47H70.47Zm8.62-2.15H68.32V31.68H79.09Zm-10.77,28h2.15v2.15H68.32ZM66.16,18.75H81.25V33.84H66.16Zm0,47.41h2.16v2.16H66.16Zm0-12.93H64v2.16h2.15ZM70.47,64H64v6.46h6.46ZM64,72.63H61.85v2.15H64ZM61.85,20.9H59.7v2.16h2.15Zm8.62,30.17h2.16V44.61H70.47v2.16H68.32v2.15H66.16V46.77H61.85V44.61H59.7V42.46h2.15V36H59.7V33.84H57.54V31.68H55.39v2.16H53.23V27.37h2.16v2.16h2.15V27.37H55.39V25.22H53.23v2.15H51.08v6.47h2.15V36h2.16V33.84h2.15V40.3H55.39v2.16H53.23v2.15h2.16v4.31h2.15V46.77h4.31v2.15H64v2.16h4.31v2.15h2.15ZM53.23,55.39H48.92v2.15h2.16V59.7h2.15ZM51.08,68.31H48.92v2.16h2.16ZM48.92,29.53H46.77v4.31h2.15Zm-6.46,28H40.3v2.15h2.16ZM40.3,23.06H38.15V18.75H40.3v2.16h2.16V18.75h2.15v2.16H42.46v4.31H40.3Zm0,8.62H38.15v2.16H40.3Zm0,10.78H38.15v2.15H40.3Zm4.31,32.32h2.16V68.32H42.46v2.15h2.15v2.16H40.3v2.15H38.15v2.16H40.3v2.15h4.31ZM36,25.22h2.16v2.15H36ZM33.84,47.84V46.77H36V44.61H33.84v2.16H31.68v2.15h2.16ZM48.92,64h4.31V61.85H48.92V59.7H46.77v2.15h2.15V64H44.61V61.85H42.46V64H40.3V61.85H38.15V59.7H36V57.54H33.84V59.7H31.68v2.15h2.16V59.7H36v2.15h2.16V64H40.3v2.15h8.62ZM23.06,23.06h6.47v6.47H23.06Zm0,47.41h6.47v6.47H23.06Zm8.62-49.56H20.91V31.68H31.68Zm0,47.41H20.91V79.09H31.68Zm6.47,10.77H36V74.78h2.16V68.32H40.3V66.16H36V64H27.37V61.85h2.16V59.7H25.22V64H23.06V61.85H18.75V59.7h4.31V55.39H20.91v2.15H18.75V53.23h4.31v2.16h2.16v2.15h2.15V55.39h2.16v2.15h4.31V55.39H31.68V53.23H25.22V51.08h6.46V48.92H25.22V46.77H23.06v2.15H18.75V42.46h2.16v2.15H33.84V42.46H31.68V40.3H27.37v2.16H25.22V40.3H20.91V36h4.31V40.3h2.15V38.15h4.31V36h2.16v2.16H31.68V40.3h2.16v2.16H36V38.15h2.16V36H36V29.53H40.3v2.15h2.16v2.16H40.3V36h2.16V48.92H38.15V46.77H36v2.15H33.84v2.16H31.68v2.15h2.16v2.16H36v2.15H40.3V55.39H38.15V53.23H36V51.08H40.3v4.31h2.16V51.08h2.15v4.31h2.16V48.92h2.15V46.77h2.16v2.15H48.92v2.16h2.16v2.15h6.46V51.08H55.39V48.92H53.23V44.61H51.08V42.46h2.15V40.3h2.16V38.15H53.23V36H51.08V40.3H48.92V38.15H46.77V40.3H44.61V38.15h2.16V36H44.61V29.53H42.46V27.37h2.15v2.16h2.16V20.91h2.15v4.31h4.31V23.06H51.08V18.75h4.31v2.16H53.23v2.15h4.31V20.91H59.7V18.75H64v6.47H59.7V23.06H57.54v4.31H59.7v6.47h2.15V31.68H64V42.46h4.31V40.3H66.16V36h4.31v6.47h4.31V40.3H72.63V36h2.15V40.3h2.16V38.15h4.31v4.31H79.09V40.3H76.94v2.16H74.78v6.46h2.16v2.16H74.78v2.15H70.47v2.16H68.32v2.15H64V55.39H61.85V53.23H59.7v4.31h2.15V59.7h6.47v2.15h4.31V59.7H70.47V57.54h2.16V55.39h2.15v2.15h2.16V59.7h2.15V55.39H76.94V53.23h4.31V59.7H79.09V64h2.16v4.31H79.09v6.46h2.16v2.16H74.78v4.31H68.32V79.09h4.31V76.94H68.32V72.63H66.16v4.31H64v2.15h2.15v2.16H61.85V74.78H59.7v4.31H57.54V76.94H55.39V68.32h2.15v6.46H59.7V68.32h2.15V64H59.7V61.85H57.54V59.7H59.7V57.54H57.54V55.39H55.39V64h2.15v2.15H53.23v4.31H51.08v4.31h2.15v2.16H51.08v2.15h4.31v2.16H51.08V79.09H48.92V76.94H46.77v4.31H38.15ZM18.75,18.75H33.84V33.84H18.75Zm0,47.41H33.84V81.25H18.75Z" fill="none" stroke-width="0.5" stroke="url(#e)"/><path d="M84,16V30.9H69.1V16H84M69.52,30.48H83.59V16.41H69.52V30.48M64.69,16v5.24H61.86v-.41h2.42V16.41H61.86V16h2.83M55,16v.41H52.62v2.42h-.41V16H55M43,16v.41h-.42V16H43m-4.83,0v2.41h2.41v2.83h-.41V18.83H37.72V16h.42M30.9,16V30.9H16V16H30.9M16.41,30.48H30.48V16.41H16.41V30.48M59.86,18.41v.42h-.41v-.42h.41m-12.07,0v4.83h4.83v.42H50.21V32.9h2.41v.41H50.21v4.83h-.42V35.72H47.38V33.31H45V28.07h.41V32.9h4.41V26.07H47.38V18.41h.41m31.38,2.42v5.24H73.93V20.83h5.24m-21.72,0v2.83H57V21.24H54.62v-.41h2.83m-31.38,0v5.24H20.83V20.83h5.24m9.65,2.41v.42h-.41v-.42h.41m24.14,2.42V30.9h-.41V28.48H55V30.9h-.41V25.66H55v2.41h4.42V25.66h.41M43,25.66v.41h-.42v-.41H43m-4.83,2.41v.41H35.72V32.9h2.42v2.41h2.41V47.79H37.72V45.38H35.31V43H32.9v-.41h2.41V37.72h2.41V33.31H35.31V28.07h2.83M35.72,45h4.42V40.55H35.72V45m29-14.48V42.55h6.83V38.14H69.1V35.31h2.83v7.24h4.83v7.24h2.41v.41H76.76v2.42H73.93V52.2h2.41V43H71.93v2.42H69.52v2.41H69.1V45.38H64.28V43H61.86v-.41h2.42V33.31H61.86V32.9h2.42V30.48h.41m-24.14,0v.42h-.41v-.42h.41m16.9,2.42v5.24H57V35.72H54.62v-.41H57V32.9h.42m19.31,2.41v2.83h-.42V35.31h.42m-45.86,0v.41h-.42v-.41h.42m-9.66,0v2.83H18.41V35.31h2.83M84,37.72v2.83h-.41V38.14H81.17v-.42H84m-38.62,0v.42H45v-.42h.41m-16.9,0v.42H25.66v-.42h2.82m50.69,2.42v.41h-.41v-.41h.41M55,40.14v.41h-.41v-.41H55m-24.13,0v.41h-.42v-.41h.42m-7.24,0v.41h-.42v-.41h.42m29,2.41V43h-.41v-.41h.41m-36.21,0V45H30.9v.42H28.48v2.41H23.24V45.38H18.83v2.41H16V42.55h.41M81.59,45v.42h-.42V45h.42M55,45v2.83h-.41V45H55m29,2.42V50.2h-.41V47.38H84m-21.72,0v2.41h2.41V52.2h4.83v2.42h2.41V55H69.52v2.42H66.69V57H69.1V52.62H64.69V55h-.41V52.62H59.86v4.83h-.41V55H55V66.69h2.42v.41H52.62v4.83h-.41V69.51H47.79v4.41h2.42v4.83h2.41v.42H50.21v2.41h-.42V79.17H45.38V84H37.72V81.58H35.31V78.75h.41v2.42h2.42v2.41H45V78.75h2.41V69.51H40.55v4.42H43v.41H38.14v2.41h-.42V71.51h2.42V69.1h9.65V66.69h4.83V62.27H49.79V59.86H45.38v4.41h2.41v.42H45V62.27H40.55v2.42h-.41V62.27H37.72V59.86H35.31v-.41h2.83v2.41h4.41V57.44H40.14V57h2.41V52.2H43V57h4.41V49.79h.41V52.2h2.42v2.42h9.24V50.2H57v-.41h2.42V47.38h2.83M47.79,59.45h2.42v2.41h4.41V55H47.79v4.42m2.42-12.07v.41h-.42v-.41h.42m-16.9,0v.41H32.9v-.41h.41m38.62,2.41v.41h-.41v-.41h.41m-41,0v.41h-.42v-.41h.42m7.24,2.41V55h-.42V52.62H35.31V52.2h2.83m-9.66,0v.42H23.24V52.2h5.24M84,54.62v5.24h-.41V55H81.17v-.41H84m-53.1,0V55h-.42v-.41h.42m-12.07,0V55H16.41v2.42H16V54.62h2.83M76.76,57v2.42h2.41v.41H76.76V69.1h2.41v.41H76.76v2.42H74.34v7.24H71.52V74.34H67.1v4.83H64.69v4.41H67.1V84H64.28V78.75h2.41V74.34H62.28v2.41h-.42V71.51h2.42V64.69H61.86V62.27H59.45v-.41h2.41V59.45h.42v2.41h7.24v2.41h6.82V59.86H73.93v-.41h2.41V57h.42M64.69,73.93h9.24V64.69H64.69v9.24M33.31,57v.42H32.9V57h.41m-7.24,0v2.42H30.9v.41H28.48v4.41H32.9V61.86h.41v2.41h2.41v2.42h2.42v.41H35.31V64.69H25.66v-.42h2.41V59.86H21.24v4.83h-.41V62.27H16v-.41h4.83V57h.41v2.42h4.42V57h.41m55.52,4.83v4.83H84v2.82h-.41V67.1H81.17V61.86h.42M69.52,69.1v.41H69.1V69.1h.42m-38.62,0V84H16V69.1H30.9M16.41,83.58H30.48V69.51H16.41V83.58M81.59,71.51v7.24H84v.42H78.76V76.34h2.41V71.51h.42m-24.14,0v7.24h2.41v2.83h-.41V79.17H57V71.51h.42M26.07,73.93v5.24H20.83V73.93h5.24m50.69,7.24V84H71.52v-.42h4.82V81.17h.42M84,83.58V84h-.41v-.42H84m-29,0V84H52.21v-.42H55M85,15H68.1V31.9H85V15ZM70.52,29.48V17.41H82.59V29.48ZM65.69,15H60.86v2.41H58.45v2.42H53.62V17.41H56V15H51.21v4.83h2.41v2.41H48.79V17.41H46.38v9.66H44V24.66H41.55v2.41H44v7.24h2.41v2.41H44v2.42h2.41V36.72h2.41v2.42h2.42V34.31h2.41v2.41H56v2.42H53.62v2.41H51.21V44h2.41v4.83H56V51.2h2.42v2.42H51.21V51.2H48.79V48.79h2.42V46.38H48.79v2.41H46.38V56H44V51.2H41.55V56H39.14V51.2H34.31v2.42h2.41V56h2.42v2.42H34.31v2.41h2.41v2.41h2.42v2.42h2.41V63.27H44v2.42h4.82V63.27H46.38V60.86h2.41v2.41h4.83v2.42H48.79V68.1H39.14V65.69H36.72V63.27H34.31V60.86H31.9v2.41H29.48V60.86H31.9V58.45h2.41V56H31.9V53.62H29.48V51.2H31.9V48.79h2.41V46.38h2.41v2.41h4.83V34.31H39.14V31.9h2.41V29.48H39.14V31.9H36.72V29.48h2.42V27.07H34.31v7.24h2.41v2.41H34.31v4.83H31.9V39.14H29.48V36.72H31.9V34.31H29.48v2.41H24.66v2.42H22.24V34.31H17.41v4.83h4.83v2.41h2.42V39.14h4.82v2.41H31.9V44H17.41V41.55H15v7.24h4.83V46.38h2.41v2.41h7.24V51.2H22.24v2.42h7.24V56H31.9v2.42H27.07V56H24.66v2.42H22.24V56H19.83V53.62H15v4.83h2.41V56h2.42v4.83H15v2.41h4.83v2.42h2.41V60.86h4.83v2.41H24.66v2.42h9.65V68.1h4.83v2.41H36.72v7.24H34.31v4.83h2.41V85h9.66V80.17h2.41v2.41h2.42V80.17h2.41V77.75H51.21V72.93h2.41V68.1h4.83V65.69H56V56h2.42v2.42h2.41V53.62h2.42V56h2.41v2.42h4.83V56h2.41V53.62h4.83V51.2h2.41V48.79H77.76V41.55h2.41V39.14h2.42v2.41H85V36.72H80.17v2.42H77.76V34.31H75.34v4.83h2.42v2.41H72.93V34.31H68.1v4.83h2.42v2.41H65.69V29.48H63.28V31.9H60.86v2.41h2.42v7.24H60.86V44h2.42v2.42H68.1v2.41h2.42V46.38h2.41V44h2.41V51.2H72.93v2.42H70.52V51.2H65.69V48.79H63.28V46.38H58.45v2.41H56V44H53.62V41.55H56V39.14h2.42V31.9H56v2.41H53.62V31.9H51.21V24.66h2.41V22.24H56v2.42h2.42V19.83h2.41v2.41h4.83V15Zm-4.83,4.83V17.41h2.42v2.42ZM46.38,31.9V27.07h2.41V31.9ZM36.72,44V41.55h2.42V44Zm-7.24,4.83V46.38H31.9V44h2.41v2.42H31.9v2.41ZM65.69,56V53.62H68.1V56Zm-16.9,2.42V56h4.83v4.83H51.21V58.45Zm-9.65,2.41V58.44h2.41v2.42Zm9.65,12.06V70.51h2.42v2.41Zm-7.24,0V70.51h4.83v7.24H44v4.83H39.14V80.17H36.72V77.75h2.42V75.34H44V72.93ZM44,15H41.55v2.41H39.14V15H36.72v4.83h2.42v2.41h2.41V17.41H44V15ZM31.9,15H15V31.9H31.9V15ZM17.41,29.48V17.41H29.48V29.48Zm62.76-9.65H72.93v7.24h7.24V19.83Zm-53.1,0H19.83v7.24h7.24V19.83Zm9.65,2.41H34.31v2.42h2.41V22.24Zm24.14,2.42H58.45v2.41H56V24.66H53.62V31.9H56V29.48h2.42V31.9h2.41V24.66ZM82.59,44H80.17v2.42h2.42V44ZM85,46.38H82.59V51.2H85V46.38ZM72.93,48.79H70.52V51.2h2.41V48.79ZM85,53.62H80.17V56h2.42v4.83H80.17V68.1h2.42v2.41H80.17v4.83H77.76v4.83H75.34V72.93h2.42V70.51h2.41V68.1H77.76V60.86h2.41V58.45H77.76V56H75.34v2.42H72.93v2.41h2.41v2.41H70.52V60.86H63.28V58.45H60.86v2.41H58.45v2.41h2.41v2.42h2.42v4.82H60.86v7.24H58.45V70.51H56v9.66h2.42v2.41h2.41V77.75h2.42V85H68.1V82.58H65.69V80.17H68.1V75.34h2.42v4.83h4.82v2.41H70.52V85h7.24V80.17H85V77.75H82.59V70.51H85V65.69H82.59V60.86H85V53.62ZM65.69,72.93V65.69h7.24v7.24Zm-2.41,4.82V75.34h2.41v2.41Zm7.24-9.65H68.1v2.41h2.42V68.1Zm-38.62,0H15V85H31.9V68.1ZM17.41,82.58V70.51H29.48V82.58Zm9.66-9.65H19.83v7.24h7.24V72.93ZM85,82.58H82.59V85H85V82.58Zm-29,0H51.21V85H56V82.58Z" fill="url(#f)"/>';

  var qrCodeLogoSVG$1 = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\">\n<defs>\n  <linearGradient id=\"gra\">\n    <stop offset=\"0.05\" stop-color=\"#007fff\"/>\n    <stop offset=\"0.2\" stop-color=\"#00d1c5\"/>\n    <stop offset=\"0.34\" stop-color=\"#00ff29\"/>\n    <stop offset=\"0.5\" stop-color=\"#dbff00\"/>\n    <stop offset=\"0.66\" stop-color=\"#00ff29\"/>\n    <stop offset=\"0.8\" stop-color=\"#00d1c5\"/>\n    <stop offset=\"0.95\" stop-color=\"#007fff\"/>\n  </linearGradient>\n</defs>\n<path d=\"M100,0H0V100H100Z\" fill=\"#fff\"/>\n<rect x=\"9\" y=\"9\" width=\"82\" height=\"82\" rx=\"4\" fill=\"url(#gra)\" />\n</svg>";

  function qrToElements(qr, size) {
    var height = 0.9;
    var dy = (1 - height) / 2;
    var rx = 0.5;

    function isSpecial(x, y) {
      // for a "pixel" of a QR-code, returns if it is in a reference squaire
      // (reference squaires are not rendered with our special round-cornered style)
      return x < 8 && y < 8 || x < 8 && y > size - 9 || x > size - 9 && y < 8;
    }

    function drawRefSquaire(x, y) {
      // creates elements of SVG for big reference squaire
      var path = "<path d=\"M ".concat(x, " ").concat(y, " h 7 v 7 h -7 Z M ").concat(x + 1, " ").concat(y + 1, " v 5 h 5 v -5 Z\"/>");
      var rect = "<rect x=\"".concat(x + 2, "\" y=\"").concat(y + 2, "\" width=\"3\" height=\"3\"/>");
      return path + rect;
    }

    function drawRef() {
      // creates three big reference squaires in the corners of QR-code
      return drawRefSquaire(0, 0) + drawRefSquaire(0, size - 7) + drawRefSquaire(size - 7, 0);
    }

    function drawRect(x, y, length) {
      // creates one rounded-cornered rectangle as an element of QR-code
      return "<rect height=\"".concat(height, "\" rx=\"").concat(rx, "\" x=\"").concat(x + dy, "\" y=\"").concat(y + dy, "\" width=\"").concat(length - 2 * dy, "\"/>");
    }

    function drawRects() {
      // creates the main part of QR-code, made of round-cornered rectangles
      var i;
      var j;
      var paint;
      var startj;
      var res = '';

      for (i = 0; i < size; i += 1) {
        paint = false;
        startj = 0;

        for (j = 0; j <= size; j += 1) {
          var index = i * size + j;

          if (paint && (isSpecial(j, i) || j === size || qr[index] === 0)) {
            res += drawRect(startj, i, j - startj);
            paint = false;
          } else if (!paint && j < size && !isSpecial(j, i) && qr[index] === 1) {
            startj = j;
            paint = true;
          }
        }
      }

      return res;
    }

    return "".concat(drawRects()).concat(drawRef());
  }

  function renderQR(text, opts) {
    var qrData = browser.create(text, opts);
    var color = '#000F2C';
    var qrMargin = 4;
    var qrcodesize = qrData.modules.size + qrMargin * 2;
    var g = "<g fill=\"".concat(color, "\"> ").concat(qrToElements(qrData.modules.data, qrData.modules.size), " </g>");
    var viewBox = "viewBox=\"".concat(-qrMargin, " ").concat(-qrMargin, " ").concat(qrcodesize, " ").concat(qrcodesize, "\"");
    var svgTag = "<svg xmlns=\"http://www.w3.org/2000/svg\" ".concat(viewBox, "> ").concat(g, "\n  </svg>");
    return {
      svgTag: svgTag,
      qrcodesize: qrcodesize,
      qrMargin: qrMargin
    };
  }

  function createInnerSvg(isBig, innerOffset, innerSize) {
    var innerText;
    var viewBoxSize = 100;

    if (isBig) {
      innerText = qrCodeLogoSVG;
    } else {
      innerText = qrCodeLogoSVG$1;
    }

    var viewBox = "\"0 0 ".concat(viewBoxSize, " ").concat(viewBoxSize, "\"");
    return "<svg x=\"".concat(innerOffset, "\" y=\"").concat(innerOffset, "\" width=\"").concat(innerSize, "\" height=\"").concat(innerSize, "\" viewBox=").concat(viewBox, ">\n  ").concat(innerText, "\n  </svg>");
  }

  function insertInnerSvg(QRCodeElement, qrcodesize, qrMargin) {
    var outerSvg = QRCodeElement.getElementsByTagName('svg')[0];
    /* Size of inner logo SVG. 24% rounded to match odd number of untis
     * + 0.1 to cover the gap between units */

    var innerSize = Math.floor(qrcodesize * 0.12) * 2 + 1.1; // Center the inner logo

    var innerOffset = (qrcodesize - innerSize) / 2 - qrMargin;
    var clientInnerSize = outerSvg.clientHeight * (innerSize / qrcodesize);
    var isBig = clientInnerSize > 50;
    outerSvg.innerHTML += createInnerSvg(isBig, innerOffset, innerSize);
  }

  var isMobile = function isMobile() {
    return navigator && ('userAgent' in navigator && navigator.userAgent.match(/iPhone|iPod|iPad|Android/i) || navigator.maxTouchPoints > 1 && navigator.platform === 'MacIntel');
  };

  var removeLoader = function removeLoader(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  var haveStyleSheet = false;

  var setLoader = function setLoader(element, styles) {
    var loaderClass = "".concat(styles.prefix || 'wwp_', "qrcode_loader");
    var loader = document.createElement('div');
    loader.innerHTML = "<div style=\"width: 100%; height: 0; padding-block-end: 100%; position: relative;\">\n  <div class=\"".concat(loaderClass, "\">\n    <div class=\"").concat(loaderClass, "_blk\"></div>\n    <div class=\"").concat(loaderClass, "_blk ").concat(loaderClass, "_delay\"></div>\n    <div class=\"").concat(loaderClass, "_blk ").concat(loaderClass, "_delay\"></div>\n    <div class=\"").concat(loaderClass, "_blk\"></div>\n  </div>\n</div>");

    if (!haveStyleSheet) {
      var style = document.createElement('style');
      style.innerHTML = "@keyframes ".concat(styles.prefix || 'wwp_', "pulse {\n      0%   { opacity: 1; }\n      100% { opacity: 0; }\n    }\n    .").concat(loaderClass, " {\n      display: flex;\n      flex-direction: row;\n      flex-wrap: wrap;\n      justify-content: space-around;\n      align-items: center;\n      width: 30%;\n      height: 30%;\n      margin-left: 35%;\n      padding-top: 35%;\n      position: absolute;\n    }\n    .").concat(loaderClass, "_blk {\n      height: 35%;\n      width: 35%;\n      animation: ").concat(styles.prefix || 'wwp_', "pulse 0.75s ease-in infinite alternate;\n      background-color: #cccccc;\n    }\n    .").concat(loaderClass, "_delay {\n      animation-delay: 0.75s;\n    }");
      document.getElementsByTagName('head')[0].appendChild(style);
      haveStyleSheet = true;
    }

    removeLoader(element);
    element.appendChild(loader);
  };

  var setRefersh = function setRefersh(element, error) {
    var httpsRequired = error instanceof WWPassError && error.code === WWPASS_STATUS.SSL_REQUIRED;
    var offline = window.navigator.onLine !== undefined && !window.navigator.onLine;
    var wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';
    var refreshNote = document.createElement('div');
    refreshNote.style.margin = '0 10%';
    refreshNote.style.width = '80%';
    refreshNote.style.textAlign = 'center';
    refreshNote.style.overflow = 'hidden';
    var text = 'Error occured';

    if (httpsRequired) {
      text = 'Please use HTTPS';
    } else if (offline) {
      text = 'No internet connection';
    }

    refreshNote.innerHTML = "<p style=\"margin:0; font-size: 1.2em; color: black;\">".concat(text, "</p>");
    var refreshButton = null;

    if (!httpsRequired) {
      refreshButton = document.createElement('a');
      refreshButton.textContent = 'Retry';
      refreshButton.style.fontWeight = '400';
      refreshButton.style.fontFamily = '"Arial", sans-serif';
      refreshButton.style.fontSize = '1.2em';
      refreshButton.style.lineHeight = '1.7em';
      refreshButton.style.cursor = 'pointer';
      refreshButton.href = '#';
      refreshNote.appendChild(refreshButton);
    }

    wrapper.appendChild(refreshNote); // eslint-disable-next-line no-console

    console.error("Error in WWPass Library: ".concat(error));
    removeLoader(element);
    element.appendChild(wrapper);
    return httpsRequired ? Promise.reject(error.message) : new Promise(function (resolve) {
      // Refresh after 1 minute or on click
      setTimeout(function () {
        resolve({
          refresh: true
        });
      }, 60000);
      refreshButton.addEventListener('click', function (event) {
        resolve({
          refresh: true
        });
        event.preventDefault();
      });

      if (offline) {
        window.addEventListener('online', function () {
          return resolve({
            refresh: true
          });
        });
      }
    });
  };

  var debouncePageVisibilityFactory = function debouncePageVisibilityFactory() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'visible';
    var debounce = null;
    return function (fn) {
      debounce = fn;

      var onDebounce = function onDebounce() {
        if (document.visibilityState === state) {
          debounce();
          document.removeEventListener('visibilitychange', onDebounce);
        }
      };

      if (document.visibilityState === state) {
        debounce();
      } else {
        document.addEventListener('visibilitychange', onDebounce);
      }
    };
  };

  var debouncePageVisible = debouncePageVisibilityFactory();

  var QRCodeLogin = function QRCodeLogin(parentElement, wwpassURLoptions, ttl, qrcodeStyle) {
    return new Promise(function (resolve) {
      var QRCodeElement = document.createElement('div');

      var _renderQR = renderQR(getUniversalURL(wwpassURLoptions, false), qrcodeStyle || {}),
          svgTag = _renderQR.svgTag,
          qrcodesize = _renderQR.qrcodesize,
          qrMargin = _renderQR.qrMargin;

      QRCodeElement.innerHTML = svgTag;
      var svgDiv = QRCodeElement;

      if (qrcodeStyle) {
        QRCodeElement.className = "".concat(qrcodeStyle.prefix, "qrcode_div");
        QRCodeElement.style.max_width = "".concat(qrcodeStyle.width, "px");
        QRCodeElement.style.max_height = "".concat(qrcodeStyle.width, "px");
      }

      QRCodeElement.style.width = '100%';
      var qrCodeSwitchLink = document.createElement('a');
      qrCodeSwitchLink.href = '#';
      qrCodeSwitchLink.style.background = '#FFFFFF';
      qrCodeSwitchLink.style.color = '#000F2C';
      qrCodeSwitchLink.style.textAlign = 'center';
      qrCodeSwitchLink.style.padding = '.3em 0';
      qrCodeSwitchLink.style.width = '100%';
      qrCodeSwitchLink.style.display = 'inline-block';
      qrCodeSwitchLink.style.textDecorationLine = 'underline';
      qrCodeSwitchLink.style.cursor = 'pointer';
      qrCodeSwitchLink.innerText = 'or use WWPass Key on this device';
      qrCodeSwitchLink.addEventListener('click', function () {
        resolve({
          button: true
        });
      });
      removeLoader(parentElement);
      QRCodeElement.style.position = 'relative';
      parentElement.appendChild(QRCodeElement);
      parentElement.appendChild(qrCodeSwitchLink);
      insertInnerSvg(svgDiv, qrcodesize, qrMargin);

      if (ttl) {
        setTimeout(function () {
          debouncePageVisible(function () {
            resolve({
              refresh: true
            });
          });
        }, ttl);
      }
    });
  };

  var addButtonStyleSheet = function addButtonStyleSheet() {
    {
      var style = document.createElement('style');
      style.innerHTML = "\n      @font-face {\n        font-family: \"Roboto\";\n        font-style: normal;\n        font-weight: 300;\n        src: local('Roboto Light'), local('Roboto-Light'), url('https://fonts.gstatic.com/s/roboto/v18/Hgo13k-tfSpn0qi1SFdUfVtXRa8TVwTICgirnJhmVJw.woff2') format('woff2');\n        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;\n        font-display: swap;\n      }\n\n      .wwpassButtonContainer {\n        min-width: 270px;\n        margin: 20px 10px;\n        display: flex;\n        justify-content: center;\n      }\n      .wwpassLoginButton {\n        min-width: 202px;\n        max-width: 260px;\n        width: 100%;\n        height: 48px;\n        text-align: left;\n        font-size: 18px;\n        line-height: 24px;\n        font-family: Roboto, Arial, Helvetica, sans-serif;\n        color: #FFFFFF;\n        padding-inline-start: 16px;\n        text-decoration: none;\n        border: none;\n        background-color: #000F2C;\n        background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"110\" height=\"48\" viewBox=\"0 0 110 48\"><defs><style>.a{fill:url(%23a);}.b{fill:url(%23b);}.c{fill:url(%23c);}.d{fill:url(%23d);}.e{fill:url(%23e);}%3C%2Fstyle%3E<linearGradient id=\"a\" x1=\"33.07\" y1=\"53.98\" x2=\"103.63\" y2=\"13.24\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"%2300a3ff\"/><stop offset=\"0.66\" stop-color=\"%23007fff\"/><stop offset=\"1\" stop-color=\"%234200ff\"/></linearGradient><linearGradient id=\"b\" x1=\"31.75\" y1=\"45.12\" x2=\"109.11\" y2=\"0.46\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"%2300ff29\"/><stop offset=\"0.39\" stop-color=\"%2300a3ff\"/><stop offset=\"0.65\" stop-color=\"%23007fff\"/><stop offset=\"1\" stop-color=\"%234200ff\"/></linearGradient><linearGradient id=\"c\" x1=\"21.24\" y1=\"35.3\" x2=\"61.59\" y2=\"12\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"%2300ff29\"/><stop offset=\"1\" stop-color=\"%2300a3ff\"/></linearGradient><linearGradient id=\"d\" x1=\"26.02\" y1=\"28.76\" x2=\"58.35\" y2=\"10.09\" xlink:href=\"%23c\"/><linearGradient id=\"e\" x1=\"32.49\" y1=\"47.89\" x2=\"97.86\" y2=\"10.15\" gradientUnits=\"userSpaceOnUse\"><stop offset=\"0\" stop-color=\"%2300ff29\"/><stop offset=\"0.36\" stop-color=\"%2300a3ff\"/><stop offset=\"0.61\" stop-color=\"%23007fff\"/><stop offset=\"1\" stop-color=\"%234200ff\"/></linearGradient></defs><polygon class=\"a\" points=\"60 0 110 0 110 48 43 48 60 0\"/><path class=\"b\" d=\"M45.68,48h-.74l17-48h.9ZM60.8,0H60L42.91,48h.82ZM59.65,0h-.82L41.75,48h.83ZM58,0h-.71L40.21,48H41ZM55,0h-.82L37.13,48H38ZM76.85,0h-.7L59.08,48h.69ZM64,0h-.93l-17,48h.85Zm10.4,0h-.83L56.51,48h.82ZM72.23,0h-.7L54.46,48h.69Zm3.2,0h-.82L57.54,48h.82ZM71.07,0h-.69L53.3,48H54Zm-3,0h-.91l-17,48h.74Zm1.07,0h-.72L51.38,48h.8ZM66.45,0H65L47.91,48h1.47ZM53.87,0h-.82L36,48h.82ZM35,0h-.83L17.11,48h.83Zm2.05,0h-.82L19.16,48H20Zm1.13,0h-.9l-17,48H21Zm2.47,0H39.19L22.12,48h1.46ZM32.44,0h-.82L14.54,48h.83Zm1.41,0H33L16,48h.82ZM11.34,48h.82L29.23,0h-.82ZM44,0h-.82L26.09,48h.83Zm2.57,0h-.83L28.66,48h.83ZM42.22,0H41.5L24.43,48h.8Zm8.83,0h-.7L33.28,48H34ZM49.13,0H47.66L30.59,48h1.46Zm3.2,0h-.8l-17,48h.72ZM45.4,0h-.82L27.51,48h.82ZM57.08,0h-.82L39.18,48H40ZM110,3.2V1.15L93.31,48H94Zm0,3.25V4.39L94.47,48h.73ZM109.09,0h-1.38L90.62,48H92ZM110,12V10.15L96.52,48h.71ZM102.7,0H102L84.87,48h.81ZM78.13,0H77.3L60.23,48h.83Zm28.42,0h-1.4L88.08,48h1.45ZM110,29.87V26.2L102.27,48h1.27Zm0,9V36.81L106,48h.73Zm0,4.24v-2L107.56,48h.71Zm0-7.48V33.57L104.86,48h.73Zm0-14.41V17.36L99.09,48h1.37ZM100.87,0H100L83,48h.83ZM110,15.09V13.17L97.65,48h.63ZM104,0h-.85L86,48h.83ZM89.73,0H89L71.91,48h.81Zm-3.1,0h-.85L68.7,48h.83Zm2,0h-.86l-17,48h.83ZM85.47,0h-.85L67.55,48h.83ZM80.75,0h-1L62.67,48h1.06Zm3.18,0H83.1l-17,48h.73ZM82.16,0h-.75L64.34,48h.81ZM92.4,0h-.85L74.48,48h.83ZM97,0h-.85L79.1,48h.83Zm1.16,0h-.85L80.25,48h.83Zm-7,0H90.4L73.32,48h.81Zm3.72,0h-.65L77.07,48h.78Zm4.75,0h-.86l-17,48h.83ZM93.71,0h-.64L75.91,48h.79Z\"/><path class=\"c\" d=\"M16.13,48H15.6L32.67,0h.54ZM37,0h-.54L19.35,48h.53Zm2.83,0h-.62l-17,48h.54ZM39,0h-.62l-17,48h.45ZM34,0h-.54L16.35,48h.53Zm1.92,0h-.46L18.35,48h.53Zm-.59,0h-.53L17.68,48h.54Zm2.42,0h-.54L20.1,48h.53Zm3.66,0h-.95L23.35,48h.95Zm5.17,0H46L28.93,48h.54Zm.67,0h-.54L29.6,48h.53ZM45.12,0h-.45L27.6,48h.45ZM42.46,0h-.62l-17,48h.45Zm1.91,0h-.45L26.85,48h.45ZM43.13,0h-.46L25.6,48h.53ZM0,48H.54L17.61,0h-.54ZM22.29,0h-.53L4.68,48h.54ZM23,0h-.62l-17,48h.45ZM21,0h-.54L3.35,48h.53Zm3.66,0h-.95L6.6,48h1ZM20.21,0h-.54L2.6,48h.53Zm-.92,0h-.53L1.68,48h.54ZM48.12,0h-.45L30.6,48h.45ZM28.46,0h-.54L10.85,48h.53Zm1.66,0h-.95L12.1,48h1ZM25.63,0h-.46L8.1,48h.53Zm5.74,0h-.45L13.85,48h.45Zm.84,0h-.54l-17,48h.45ZM26.79,0h-.53L9.18,48h.54Zm.92,0h-.54L10.1,48h.53ZM74.56,0h-.89L56.57,48h.9ZM70.4,0h-.48L52.82,48h.48ZM69.06,0h-.89L51.07,48H52Zm2.09,0h-.48L53.57,48h.48ZM65.73,0h-.56L48.1,48h.53ZM64.9,0h-.48L47.35,48h.53ZM63.73,0h-.56L46.1,48h.53ZM67.4,0h-.89L49.43,48h1Zm5,0H72L54.91,48h.47Zm6.25,0h-.48L61.07,48h.48Zm.92,0h-.4L62.07,48h.48Zm2.08,0h-.48L64.07,48h.48Zm-8.5,0h-.48l-17,48h.39ZM49,0h-.54L31.35,48h.53Zm27.6,0h-.89l-17,48h.81ZM77.9,0h-.48L60.32,48h.48ZM54.48,0h-.56L36.85,48h.53Zm1.25,0h-.56l-17,48h.54Zm-2,0h-.56L36.1,48h.53ZM51.57,0h-.48L34,48h.54Zm-.92,0H50L32.93,48h.7Zm5.83,0H56L38.93,48h.54ZM52.73,0h-.56l-17,48h.45ZM62.9,0h-.56l-17,48h.53ZM61.23,0h-.56L43.6,48h.53ZM59.82,0h-.4L42.27,48h.53ZM62,0h-.56L44.35,48h.53ZM57.4,0h-.48L39.85,48h.53Zm.83,0h-.56L40.6,48h.53Zm.84,0h-.4L41.52,48h.53Z\"/><path class=\"d\" d=\"M22.5,48H21.35L38.43,0h1.14ZM35.57,0h-.64L17.85,48h.65Zm1.1,0H36L19,48h.65Zm7.5,0h-.64L26.45,48h.65Zm-10,0h-.55L16.55,48h.64Zm9.09,0h-.64L25.55,48h.65Zm-1.2,0h-.63l-17,48H25Zm-1,0h-.54L23.45,48H24ZM6.35,48H7L24.07,0h-.64ZM27.67,0H27L10,48h.65Zm-1.1,0h-.64L8.85,48H9.5Zm4.49,0h-.72l-17,48h.56ZM33,0H31.83L14.75,48H15.9Zm-2.8,0h-.64L12.45,48h.65Zm-1.6,0h-.64L10.85,48h.65Zm9,0h-.64L19.85,48h.65Zm20,0H57L40,48h.55Zm1.7,0h-.64L41.55,48h.65Zm-2.6,0h-.54L39.05,48h.55ZM55.18,0h-.55L37.55,48h.64ZM45.77,0h-.64L28.05,48h.65Zm15.4,0h-.54L43.55,48h.55Zm-1.1,0h-.64L42.35,48H43Zm2.1,0h-.64L44.45,48h.65ZM47.77,0h-.64L30.05,48h.65Zm6.59,0h-.72l-17,48h.56ZM46.48,0h-.55L28.85,48h.64Zm2.19,0H48L31,48h.65Zm4.4,0H51.93L34.85,48H36Zm-1.9,0h-.73l-17,48h.66Zm-.91,0h-.72l-17,48h.56Z\"/><path class=\"e\" d=\"M58.19,48h-.63L74.72,0h.49ZM74.31,0h-.49L56.66,48h.63Zm-1,0h-.67L55.55,48h.65Zm4.49,0h-.66L60.05,48h.65ZM76.9,0h-.67L59.15,48h.65Zm2,0h-.67l-17,48h.65Zm-11,0h-.67L50.15,48h.65ZM46.35,48h.84l17-48h-.78ZM71.21,0h-.58L53.55,48h.64Zm-5.9,0h-.58L47.65,48h.64ZM66.7,0H66L49,48h.56Zm3.61,0h-.67l-17,48h.65ZM68.8,0h-.67L51.05,48h.65ZM79.9,0h-.67L62.15,48h.65ZM72.31,0h-.58L54.65,48h.64Zm9,0h-.58L63.65,48h.64ZM92.9,0H91.82L74.73,48H75.8Zm4,0h-.58L79.23,48h.57Zm.9,0h-.58L80.13,48h.57ZM91.2,0h-.57l-17,48h.48Zm10.2,0h-.58L83.73,48h.57ZM98.91,0h-.49L81.33,48h.56ZM95.3,0H94.23l-17,48h1Zm-11,0H83.23L66.15,48h1.14Zm6,0h-.49L72.73,48h.56Zm-4,0H85.22L68.13,48H69.2Zm-4,0h-.66L64.55,48h.65ZM88.8,0h-.58L71.13,48h.57Zm-.9,0h-.58L70.23,48h.57Z\"/></svg>');\n        background-position: 180px;\n        background-repeat: no-repeat;\n        display: flex;\n        align-items: center;\n    }\n\n    .wwpassLoginButton:hover, .wwpassLoginButton:focus  {\n        opacity: .9;\n        color: #FFFFFF;\n    }\n\n    .wwpassQRButton {\n      width: 48px;\n      height: 48px;\n      background-color: #000F2C;\n      background-image: url('data:image/svg+xml;utf8,<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M14 17V25H18\" stroke=\"white\" stroke-width=\"2\"/><rect x=\"3\" y=\"22\" width=\"7\" height=\"7\" stroke=\"white\" stroke-width=\"2\"/><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" stroke=\"white\" stroke-width=\"2\"/><rect x=\"22\" y=\"3\" width=\"7\" height=\"7\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M19 7H14V14H10V18H2\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M2 14H7\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M29 17V25H25V18H18V10\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M13 3H19\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M13 29H18\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M24 29H30\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M21 14H30\" stroke=\"white\" stroke-width=\"2\"/><path d=\"M21 30V22H17\" stroke=\"white\" stroke-width=\"2\"/></svg>');\n      background-repeat: no-repeat;\n      background-position: center;\n      border: none;\n      font-size: 18px;\n      line-height: 24px;\n      content: \"\";\n      color: transparent;\n      margin-inline-start: 4px;\n      flex-shrink: 0;\n    }\n\n    .wwpassQRButton:hover,\n    .wwpassQRButton:focus {\n      opacity: .9;\n    }\n\n    .wwpassQRButton:active {\n      opacity: .7;\n    }";
      document.getElementsByTagName('head')[0].appendChild(style);
      haveStyleSheet = true;
    }
  };

  var sameDeviceLogin = function sameDeviceLogin(parentElement, wwpassURLoptions, ttl) {
    return new Promise(function (resolve) {
      addButtonStyleSheet();
      var universalLinkElement = document.createElement('a');
      universalLinkElement.className = 'wwpassLoginButton';
      universalLinkElement.innerText = wwpassURLoptions && wwpassURLoptions.buttonText || 'Log in with WWPass';
      if (wwpassURLoptions) universalLinkElement.href = getUniversalURL(wwpassURLoptions, false);else universalLinkElement.href = '#';
      var qrCodeSwitchLink = document.createElement('a');
      qrCodeSwitchLink.href = '#';
      qrCodeSwitchLink.className = 'wwpassQRButton';
      universalLinkElement.addEventListener('click', function (e) {
        if (!universalLinkElement.href.endsWith('#')) return;
        resolve({
          away: true,
          linkElement: universalLinkElement
        });
        e.preventDefault();
      });
      qrCodeSwitchLink.addEventListener('click', function (e) {
        resolve({
          qrcode: true
        });
        e.preventDefault();
      });
      var buttonContainer = document.createElement('div');
      buttonContainer.appendChild(universalLinkElement);
      buttonContainer.appendChild(qrCodeSwitchLink);
      buttonContainer.className = 'wwpassButtonContainer';
      removeLoader(parentElement);
      parentElement.appendChild(buttonContainer);

      if (ttl) {
        setTimeout(function () {
          debouncePageVisible(function () {
            resolve({
              refresh: true
            });
          });
        }, ttl);
      }
    });
  };

  var clearQRCode = function clearQRCode(parentElement, style) {
    return setLoader(parentElement, style);
  };

  var downloadDialog = "<style type=\"text/css\" scoped>\n    .wwpass-store {\n    min-width: 125px;\n    padding: 0;\n    background-size: 100% 100%;\n    background-repeat: no-repeat;\n    background-position: center;\n    color: #0055cc;\n    -webkit-transition-property: all;\n    transition-property: all;\n    -webkit-transition-duration: 0.2s;\n    transition-duration: 0.2s;\n    display: flex;\n    min-width: 200px;\n    height: 40px;\n    margin: 0 auto;\n    line-height: 34px;\n    font-weight: 400;\n    text-decoration: none;\n    text-align: center;\n    border: 1px solid #0055cc;\n    border-radius: 4px;\n    -webkit-padding-start: 15px;\n            padding-inline-start: 15px;\n    -webkit-padding-end: 15px;\n            padding-inline-end: 15px;\n    display: inline-block;\n    -webkit-margin-before: 20px;\n            margin-block-start: 20px;\n    -webkit-margin-after: 30px;\n            margin-block-end: 30px;\n    cursor: pointer;\n    -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n                         }\n\n  .wwpass-store:nth-of-type(2) {\n    -webkit-margin-start: 6px;\n            margin-inline-start: 6px; }\n  .wwpass-store:hover,\n  .wwpass-store:focus,\n  .wwpass-store:active {\n    color: #0077ff;\n    border-color: #0077ff; }\n  .wwpass-store-google {\n    background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"125\" height=\"40\" viewBox=\"0 0 125 40\"><path fill=\"%2305c\" d=\"M22.94,19.49l3-3c-1.62-1-12-6.67-12.67-7-.1-.1-.29-.1-.38-.19ZM12.08,9.3a1.28,1.28,0,0,0-.47,1.14v19a1.27,1.27,0,0,0,.47,1.14L22.46,19.87ZM22.94,20.44l-10,10.19c.1,0,.19-.1.29-.1.66-.38,7.61-4.29,12.57-7Zm7.81-1.34c-.29-.19-2-1.14-4.19-2.38L23.42,20l3,3.14c2.38-1.33,4.1-2.29,4.29-2.38.48-.28,1.05-1,0-1.62Zm14.16-7.74a2.43,2.43,0,0,1-.63,1.8,2.78,2.78,0,0,1-3.92,0,2.6,2.6,0,0,1-.8-2,2.75,2.75,0,0,1,2.76-2.79,4.89,4.89,0,0,1,1.07.18,2,2,0,0,1,.8.63l-.45.45A1.63,1.63,0,0,0,42.32,9a1.77,1.77,0,0,0-1.43.63,1.85,1.85,0,0,0-.63,1.53,1.86,1.86,0,0,0,.64,1.53,2.29,2.29,0,0,0,1.42.63,2,2,0,0,0,1.52-.63,1.5,1.5,0,0,0,.45-1.08h-2v-.72h2.59ZM49,9.11H46.61v1.71h2.23v.63H46.61v1.71H49v.63H45.9V8.39H49ZM52,13.79h-.71V9.11H49.73V8.48H53.4v.63H51.87v4.68Zm4.11,0V8.39h.71v5.4Zm3.75,0h-.71V9.11H57.59V8.48h3.66v.63H59.73v4.68Zm8.48-.72a2.79,2.79,0,0,1-3.93,0,2.68,2.68,0,0,1-.8-2,2.68,2.68,0,0,1,.8-2,2.79,2.79,0,0,1,3.93,0,2.68,2.68,0,0,1,.8,2,2.68,2.68,0,0,1-.8,2Zm-3.39-.45a2.09,2.09,0,0,0,1.43.63,1.79,1.79,0,0,0,1.43-.63,2.2,2.2,0,0,0,.63-1.53,1.85,1.85,0,0,0-.63-1.53,2.09,2.09,0,0,0-1.43-.63,1.79,1.79,0,0,0-1.43.63,2.19,2.19,0,0,0,0,3.06Zm5.18,1.17V8.39h.8l2.59,4.14h0v-4h.72v5.4h-.72L70.71,9.47h0v4.32Zm-6.61,7.83a3.78,3.78,0,1,0,3.84,3.78,3.86,3.86,0,0,0-3.84-3.78Zm0,6.12a2.22,2.22,0,0,1-2.14-2.31v0a2.23,2.23,0,0,1,2.11-2.34h0a2.18,2.18,0,0,1,2.15,2.2.71.71,0,0,1,0,.14,2.28,2.28,0,0,1-2.14,2.34Zm-8.39-6.12a3.78,3.78,0,1,0,.12,0Zm0,6.12a2.23,2.23,0,0,1-2.15-2.31v0a2.22,2.22,0,0,1,2.1-2.34h0a2.18,2.18,0,0,1,2.15,2.2.71.71,0,0,1,0,.14,2.23,2.23,0,0,1-2.11,2.34Zm-9.91-4.95v1.62H49a3.7,3.7,0,0,1-.9,2.07,3.9,3.9,0,0,1-2.94,1.17A4.18,4.18,0,0,1,41,23.5a1,1,0,0,1,0-.17A4.22,4.22,0,0,1,45.11,19h.07a4.4,4.4,0,0,1,2.94,1.17L49.28,19a5.67,5.67,0,0,0-4-1.62,5.94,5.94,0,1,0-.09,11.88,5.22,5.22,0,0,0,5.53-5.4,3.3,3.3,0,0,0-.09-1H45.18Zm40.53,1.26a3.53,3.53,0,0,0-6.87,1.35,3.68,3.68,0,0,0,3.57,3.78h.18a3.83,3.83,0,0,0,3.21-1.71l-1.34-.9a2.15,2.15,0,0,1-1.87,1.08,2,2,0,0,1-1.88-1.17l5.09-2.07Zm-5.18,1.26a2.18,2.18,0,0,1,2-2.25,1.55,1.55,0,0,1,1.42.81ZM76.43,29h1.7V17.84h-1.7Zm-2.77-6.57h0a2.9,2.9,0,0,0-2-.81A3.83,3.83,0,0,0,68,25.4a3.77,3.77,0,0,0,3.66,3.78,2.27,2.27,0,0,0,2-.9h.09v.54a2,2,0,0,1-3.93.9l-1.43.63a3.7,3.7,0,0,0,3.4,2.25c2,0,3.66-1.17,3.66-4V21.89H73.75v.54Zm-1.88,5.31a2.2,2.2,0,0,1-2.14-2.25,2.23,2.23,0,0,1,2.11-2.34h0a2.14,2.14,0,0,1,2.06,2.25v.09A2.25,2.25,0,0,1,71.78,27.74Zm21.79-9.9h-4V29h1.7V24.77h2.32A3.47,3.47,0,1,0,94,17.84a2.41,2.41,0,0,0-.38,0Zm.09,5.4H91.25V19.37h2.41a1.9,1.9,0,0,1,2,1.86v0A2,2,0,0,1,93.66,23.24Zm10.27-1.62a3,3,0,0,0-3,1.71l1.52.63a1.58,1.58,0,0,1,1.52-.81,1.62,1.62,0,0,1,1.78,1.44v.09a3.57,3.57,0,0,0-1.78-.45c-1.61,0-3.22.9-3.22,2.52a2.57,2.57,0,0,0,2.67,2.44h.1a2.37,2.37,0,0,0,2.14-1.08h.09V29h1.61V24.68C107.32,22.7,105.9,21.62,103.93,21.62Zm-.18,6.12c-.54,0-1.34-.27-1.34-1,0-.9,1-1.17,1.79-1.17a3.46,3.46,0,0,1,1.51.36,2,2,0,0,1-2,1.8Zm9.46-5.85-1.87,4.86h-.09l-2-4.86H107.5l2.94,6.75-1.7,3.78h1.79l4.55-10.53ZM98.21,29h1.7V17.84h-1.7Z\"/></svg>');\n    margin-left: 0;\n    font-size: 0; }\n  .wwpass-store-ios {\n    background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"125\" height=\"40\" viewBox=\"0 0 125 40\"><path fill=\"%2305c\" d=\"M28.87,19.8a5.21,5.21,0,0,1,2.47-4.37,5.31,5.31,0,0,0-4.18-2.28c-1.75-.18-3.46,1.06-4.35,1.06s-2.29-1-3.78-1a5.57,5.57,0,0,0-4.68,2.88c-2,3.53-.51,8.72,1.43,11.57,1,1.4,2.1,3,3.58,2.9s2-.93,3.75-.93,2.24.93,3.75.9,2.54-1.4,3.48-2.82a11.75,11.75,0,0,0,1.59-3.26,5,5,0,0,1-3.06-4.64ZM26,11.28A5.18,5.18,0,0,0,27.18,7.6a5.13,5.13,0,0,0-3.35,1.75,4.83,4.83,0,0,0-1.2,3.54A4.25,4.25,0,0,0,26,11.28ZM49.87,30.35h-2l-1.11-3.51H42.87l-1.06,3.51h-2l3.82-12H46l3.84,12Zm-3.47-5-1-3.13q-.16-.48-.6-2.25h0c-.18.75-.37,1.5-.56,2.25l-1,3.13Zm13.31.57a5,5,0,0,1-1.18,3.48,3.46,3.46,0,0,1-2.63,1.14,2.62,2.62,0,0,1-2.43-1.23h0v4.55h-1.9V24.56c0-.92,0-1.87-.07-2.84h1.67l.1,1.37h0a3.37,3.37,0,0,1,4.66-1,3.24,3.24,0,0,1,.76.67,4.8,4.8,0,0,1,1,3.18ZM57.77,26a3.58,3.58,0,0,0-.57-2.08,1.92,1.92,0,0,0-1.65-.85,2,2,0,0,0-1.28.47,2.17,2.17,0,0,0-.75,1.23,3,3,0,0,0-.09.59V26.8A2.32,2.32,0,0,0,54,28.39a1.9,1.9,0,0,0,1.49.65,2,2,0,0,0,1.68-.84A3.79,3.79,0,0,0,57.77,26Zm11.79-.07a4.91,4.91,0,0,1-1.18,3.48,3.46,3.46,0,0,1-2.63,1.14,2.61,2.61,0,0,1-2.43-1.23h0v4.55h-1.9V24.56c0-.92,0-1.87-.08-2.84H63l.1,1.37h0a3.37,3.37,0,0,1,4.66-1,3.45,3.45,0,0,1,.76.67,4.74,4.74,0,0,1,1,3.18ZM67.62,26a3.64,3.64,0,0,0-.56-2.08,1.93,1.93,0,0,0-1.66-.85,2,2,0,0,0-1.28.47,2.23,2.23,0,0,0-.75,1.23,2.39,2.39,0,0,0-.08.59V26.8a2.28,2.28,0,0,0,.57,1.59,1.88,1.88,0,0,0,1.49.65A2,2,0,0,0,67,28.2a3.65,3.65,0,0,0,.6-2.2Zm13,1a3.19,3.19,0,0,1-1.06,2.49,4.66,4.66,0,0,1-3.23,1.05,5.62,5.62,0,0,1-3.08-.75l.44-1.6A5.14,5.14,0,0,0,76.4,29a2.54,2.54,0,0,0,1.68-.49,1.6,1.6,0,0,0,.6-1.3,1.67,1.67,0,0,0-.5-1.23A4.45,4.45,0,0,0,76.54,25q-3.12-1.17-3.12-3.43a3.06,3.06,0,0,1,1.1-2.42,4.26,4.26,0,0,1,2.91-.95,5.74,5.74,0,0,1,2.7.57l-.48,1.56a4.73,4.73,0,0,0-2.27-.55,2.33,2.33,0,0,0-1.57.5,1.45,1.45,0,0,0-.48,1.09,1.49,1.49,0,0,0,.55,1.17,6,6,0,0,0,1.73.92,5.92,5.92,0,0,1,2.25,1.46A3.1,3.1,0,0,1,80.59,27Zm6.29-3.84h-2.1v4.19c0,1.07.37,1.6,1.11,1.6a3,3,0,0,0,.85-.09l0,1.46a4.35,4.35,0,0,1-1.48.21,2.28,2.28,0,0,1-1.76-.69,3.41,3.41,0,0,1-.63-2.33V23.15H81.66V21.71h1.25V20.13l1.87-.57v2.15h2.1v1.45ZM96.34,26a4.77,4.77,0,0,1-1.13,3.27,4,4,0,0,1-3.14,1.31,3.8,3.8,0,0,1-3-1.26A4.61,4.61,0,0,1,88,26.11a4.73,4.73,0,0,1,1.16-3.29,4,4,0,0,1,3.11-1.28,3.92,3.92,0,0,1,3,1.26A4.53,4.53,0,0,1,96.34,26Zm-2,.06A3.89,3.89,0,0,0,93.85,24a1.87,1.87,0,0,0-1.7-1,1.9,1.9,0,0,0-1.75,1,3.93,3.93,0,0,0-.51,2.09,3.85,3.85,0,0,0,.51,2,2,2,0,0,0,2.62.82,2,2,0,0,0,.82-.83A4,4,0,0,0,94.37,26Zm8.16-2.63a3,3,0,0,0-.6,0,1.78,1.78,0,0,0-1.55.76,2.88,2.88,0,0,0-.48,1.71v4.53H98l0-5.92c0-1,0-1.9-.07-2.72H99.6l.07,1.65h.06a3,3,0,0,1,1-1.36,2.3,2.3,0,0,1,1.38-.47,2.49,2.49,0,0,1,.47,0ZM111,25.62a4.26,4.26,0,0,1-.07.87h-5.71a2.52,2.52,0,0,0,.83,2,2.8,2.8,0,0,0,1.87.6,6.29,6.29,0,0,0,2.31-.41l.3,1.33a6.9,6.9,0,0,1-2.87.53,4.09,4.09,0,0,1-3.13-1.18,4.34,4.34,0,0,1-1.14-3.16,5,5,0,0,1,1.06-3.25,3.64,3.64,0,0,1,3-1.39,3.19,3.19,0,0,1,2.8,1.39,4.76,4.76,0,0,1,.75,2.72Zm-1.81-.5a2.69,2.69,0,0,0-.37-1.47,1.66,1.66,0,0,0-1.52-.8,1.81,1.81,0,0,0-1.52.78,2.86,2.86,0,0,0-.56,1.49ZM45.77,11a3,3,0,0,1-1,2.39,3.68,3.68,0,0,1-2.48.74A10.39,10.39,0,0,1,41,14.07V8.28a10.81,10.81,0,0,1,1.61-.12,3.46,3.46,0,0,1,2.31.67A2.73,2.73,0,0,1,45.77,11Zm-1,0a2.2,2.2,0,0,0-.54-1.58,2.13,2.13,0,0,0-1.58-.55A4.77,4.77,0,0,0,41.9,9v4.4a3.39,3.39,0,0,0,.64,0,2.19,2.19,0,0,0,1.65-.6A2.45,2.45,0,0,0,44.78,11Zm6.22.9a2.36,2.36,0,0,1-.56,1.61,2,2,0,0,1-1.54.65,1.93,1.93,0,0,1-1.48-.62A2.25,2.25,0,0,1,46.88,12a2.27,2.27,0,0,1,.56-1.61A2,2,0,0,1,49,9.76a2,2,0,0,1,1.49.62A2.26,2.26,0,0,1,51,11.93Zm-1,0a1.93,1.93,0,0,0-.25-1,.92.92,0,0,0-.84-.51.94.94,0,0,0-.86.51,1.91,1.91,0,0,0-.25,1,1.9,1.9,0,0,0,.25,1,1,1,0,0,0,1.69,0A1.92,1.92,0,0,0,50,12Zm8-2.12-1.32,4.25h-.85l-.55-1.85c-.13-.45-.25-.9-.34-1.37h0a10.16,10.16,0,0,1-.34,1.37L54,14.09h-.87L51.91,9.84h1l.47,2c.12.48.21.93.29,1.36h0A13.25,13.25,0,0,1,54,11.87l.6-2h.77l.57,2a13.39,13.39,0,0,1,.33,1.4h0a13.37,13.37,0,0,1,.29-1.4l.51-2Zm4.85,4.25h-.93V11.66c0-.75-.29-1.13-.85-1.13a.89.89,0,0,0-.68.31,1.14,1.14,0,0,0-.26.73v2.52h-.93v-3c0-.37,0-.78,0-1.22H60l0,.67h0a1.33,1.33,0,0,1,.49-.51,1.5,1.5,0,0,1,.85-.24,1.31,1.31,0,0,1,1,.38,1.87,1.87,0,0,1,.49,1.41v2.54Zm2.58,0h-.93V7.9h.93v6.19ZM71,11.93a2.31,2.31,0,0,1-.55,1.61,2,2,0,0,1-1.54.64,1.85,1.85,0,0,1-1.48-.62A2.28,2.28,0,0,1,66.83,12a2.3,2.3,0,0,1,.56-1.61,2.14,2.14,0,0,1,3,0A2.26,2.26,0,0,1,71,11.93Zm-1,0a2,2,0,0,0-.25-1A1,1,0,0,0,68,11a2,2,0,0,0-.25,1A1.93,1.93,0,0,0,68,13a.94.94,0,0,0,.85.51.93.93,0,0,0,.84-.52A1.88,1.88,0,0,0,70,12Zm5.5,2.13h-.84l-.07-.49h0a1.42,1.42,0,0,1-1.23.58,1.24,1.24,0,0,1-1-.38,1.19,1.19,0,0,1-.33-.86,1.33,1.33,0,0,1,.64-1.19,3.4,3.4,0,0,1,1.82-.4v-.08c0-.56-.29-.84-.88-.84a1.89,1.89,0,0,0-1.1.32l-.19-.62a2.64,2.64,0,0,1,1.45-.37c1.1,0,1.65.59,1.65,1.76v1.56a5.71,5.71,0,0,0,.06,1Zm-1-1.46V12c-1,0-1.55.26-1.55.85a.65.65,0,0,0,.18.5.71.71,0,0,0,.46.17,1,1,0,0,0,.57-.2.82.82,0,0,0,.34-.67Zm6.29,1.46H80l0-.68h0a1.39,1.39,0,0,1-1.35.77,1.57,1.57,0,0,1-1.27-.6,2.36,2.36,0,0,1-.5-1.56,2.49,2.49,0,0,1,.55-1.67,1.66,1.66,0,0,1,1.3-.59,1.24,1.24,0,0,1,1.18.58h0V7.9h.94v5c0,.42,0,.8,0,1.15Zm-1-1.79v-.71a1.08,1.08,0,0,0-.37-.87.93.93,0,0,0-.62-.23,1,1,0,0,0-.82.42,1.74,1.74,0,0,0-.3,1.08A1.68,1.68,0,0,0,78,13a1,1,0,0,0,.82.42,1,1,0,0,0,.74-.35,1.18,1.18,0,0,0,.27-.78Zm9-.37a2.36,2.36,0,0,1-.55,1.61,2,2,0,0,1-1.55.64,1.83,1.83,0,0,1-1.47-.62A2.23,2.23,0,0,1,84.68,12a2.26,2.26,0,0,1,.57-1.61,2.12,2.12,0,0,1,3,0,2.26,2.26,0,0,1,.54,1.55Zm-1,0a1.93,1.93,0,0,0-.25-1,.92.92,0,0,0-.84-.51,1,1,0,0,0-.86.51,2.19,2.19,0,0,0,0,2,1,1,0,0,0,1.29.39,1,1,0,0,0,.4-.4A1.92,1.92,0,0,0,87.83,12Zm6,2.13h-.94V11.66c0-.75-.28-1.12-.85-1.12a.82.82,0,0,0-.67.3,1.11,1.11,0,0,0-.26.73v2.52h-.94v-3c0-.37,0-.78,0-1.22H91l0,.67h0a1.31,1.31,0,0,1,.48-.51,1.52,1.52,0,0,1,.85-.24,1.32,1.32,0,0,1,1,.38,1.87,1.87,0,0,1,.49,1.41v2.54Zm6.3-3.54h-1v2.06c0,.53.18.79.55.79a1.84,1.84,0,0,0,.41,0l0,.71a2,2,0,0,1-.73.11,1.11,1.11,0,0,1-.86-.34,1.64,1.64,0,0,1-.32-1.15V10.55h-.61V9.84h.61V9.07l.92-.28V9.84h1v.71Zm5,3.54h-.93V11.68c0-.76-.29-1.14-.85-1.14a.88.88,0,0,0-.89.66,1.27,1.27,0,0,0,0,.34v2.55h-.93V7.9h.93v2.56h0a1.41,1.41,0,0,1,1.27-.7,1.29,1.29,0,0,1,1,.38,2,2,0,0,1,.47,1.42v2.53Zm5.11-2.32a2,2,0,0,1,0,.42h-2.81a1.23,1.23,0,0,0,.41,1,1.34,1.34,0,0,0,.92.3,2.9,2.9,0,0,0,1.13-.2l.15.66a3.6,3.6,0,0,1-1.41.26,2,2,0,0,1-1.54-.58,2.12,2.12,0,0,1-.56-1.56,2.46,2.46,0,0,1,.52-1.6,1.78,1.78,0,0,1,1.47-.68,1.57,1.57,0,0,1,1.38.68,2.29,2.29,0,0,1,.37,1.34Zm-.89-.25a1.31,1.31,0,0,0-.18-.72.83.83,0,0,0-.74-.4.9.9,0,0,0-.75.39,1.4,1.4,0,0,0-.28.73Z\"/></svg>');\n    margin-right: 0;\n    font-size: 0; }\n    </style>\n<a class=\"wwpass-store wwpass-store-ios\" href=\"https://itunes.apple.com/us/app/wwpass-passkey-lite/id984532938\">AppStore</a>\n<a class=\"wwpass-store wwpass-store-google\" href=\"https://play.google.com/store/apps/details?id=com.wwpass.android.passkey\">Google Play</a>\n";

  var METHOD_KEY_NAME = 'wwpass.auth.method';
  var METHOD_QRCODE = 'qrcode';
  var METHOD_SAME_DEVICE = 'appRedirect';
  var PROTOCOL_VERSION = 2;
  var WAIT_ON_ERROR = 500;
  var ERROR_DIALOG_TIMEOUT = 4000;

  function wait(ms) {
    if (ms) return new Promise(function (r) {
      return setTimeout(r, ms);
    });
    return null;
  }

  var popupTimerSet = false;

  var appAuth =
  /*#__PURE__*/
  function () {
    var _ref = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee(initialOptions) {
      var defaultOptions, options, result, json, response, ticket, ttl, key, showDownloadsPopup;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              defaultOptions = {
                universal: false,
                ticketURL: undefined,
                callbackURL: undefined,
                version: 2,
                ppx: 'wwp_',
                log: function log() {}
              };
              options = objectSpread({}, defaultOptions, initialOptions);
              _context.next = 4;
              return sameDeviceLogin(options.qrcode);

            case 4:
              result = _context.sent;

              if (!result.away) {
                _context.next = 24;
                break;
              }

              _context.next = 8;
              return getTicket(options.ticketURL);

            case 8:
              json = _context.sent;
              response = ticketAdapter(json);
              ticket = response.ticket;
              ttl = response.ttl;
              _context.next = 14;
              return getClientNonceWrapper(ticket, ttl);

            case 14:
              key = _context.sent;

              if (!pluginPresent()) {
                _context.next = 19;
                break;
              }

              window.localStorage.setItem(METHOD_KEY_NAME, METHOD_SAME_DEVICE);
              onButtonClick(options).then(navigateToCallback, navigateToCallback);
              return _context.abrupt("return", {
                refresh: true
              });

            case 19:
              result.linkElement.href = getUniversalURL({
                ticket: ticket,
                callbackURL: options.callbackURL,
                clientKey: key ? encodeClientKey(key) : undefined,
                ppx: options.ppx,
                version: PROTOCOL_VERSION
              });
              result.linkElement.click();
              showDownloadsPopup = true;
              document.addEventListener('visibilitychange', function (state) {
                if (state !== 'visible') showDownloadsPopup = false;
              });

              if (!popupTimerSet) {
                popupTimerSet = true;
                setTimeout(function () {
                  popupTimerSet = false;

                  if (showDownloadsPopup && document.visibilityState === 'visible') {
                    wwpassShowError(downloadDialog, 'Download WWPass<sup>TM</sup>&nbsp;Key&nbsp;app from', function () {});
                  } else {
                    window.localStorage.setItem(METHOD_KEY_NAME, METHOD_SAME_DEVICE);
                  }
                }, ERROR_DIALOG_TIMEOUT);
              }

            case 24:
              return _context.abrupt("return", result);

            case 25:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function appAuth(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var qrCodeAuth =
  /*#__PURE__*/
  function () {
    var _ref2 = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee2(options, websocketPool) {
      var json, response, ticket, ttl, key, wwpassURLoptions, result;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              clearQRCode(options.qrcode, options.qrcodeStyle); // eslint-disable-next-line no-await-in-loop

              _context2.next = 4;
              return getTicket(options.ticketURL);

            case 4:
              json = _context2.sent;
              response = ticketAdapter(json);
              ticket = response.ticket;
              ttl = response.ttl; // eslint-disable-next-line no-await-in-loop

              _context2.next = 10;
              return getClientNonceWrapper(ticket, ttl);

            case 10:
              key = _context2.sent;
              wwpassURLoptions = {
                ticket: ticket,
                callbackURL: options.callbackURL,
                ppx: options.ppx,
                version: PROTOCOL_VERSION,
                clientKey: key ? encodeClientKey(key) : undefined
              };
              websocketPool.watchTicket(ticket); // eslint-disable-next-line no-await-in-loop

              _context2.next = 15;
              return QRCodeLogin(options.qrcode, wwpassURLoptions, ttl * 900, options.qrcodeStyle);

            case 15:
              result = _context2.sent;

              if (result.refresh) {
                _context2.next = 18;
                break;
              }

              return _context2.abrupt("return", result);

            case 18:
              _context2.next = 34;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t0 = _context2["catch"](0);

              if (_context2.t0.status) {
                _context2.next = 29;
                break;
              }

              options.log('QRCode auth error', _context2.t0); // eslint-disable-next-line no-await-in-loop

              _context2.next = 26;
              return setRefersh(options.qrcode, _context2.t0);

            case 26:
              clearQRCode(options.qrcode, options.qrcodeStyle);
              _context2.next = 32;
              break;

            case 29:
              clearQRCode(options.qrcode, options.qrcodeStyle);

              if (!(_context2.t0.status === WWPASS_STATUS.INTERNAL_ERROR || options.returnErrors)) {
                _context2.next = 32;
                break;
              }

              return _context2.abrupt("return", _context2.t0);

            case 32:
              _context2.next = 34;
              return wait(WAIT_ON_ERROR);

            case 34:
              if (document.documentElement.contains(options.qrcode)) {
                _context2.next = 0;
                break;
              }

            case 35:
              return _context2.abrupt("return", {
                status: WWPASS_STATUS.TERMINAL_ERROR,
                reason: 'QRCode element is not in DOM'
              });

            case 36:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 20]]);
    }));

    return function qrCodeAuth(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  var qrCodeAuthWrapper = function qrCodeAuthWrapper(options) {
    var websocketPool = new WebSocketPool(options);
    var promises = [websocketPool.promise.then(function (result) {
      if (result.clientKey && options.catchClientKey) {
        options.catchClientKey(result.clientKey);
      }

      window.localStorage.setItem(METHOD_KEY_NAME, METHOD_QRCODE);
      return {
        ticket: result.ticket,
        callbackURL: options.callbackURL,
        ppx: options.ppx,
        version: PROTOCOL_VERSION
      };
    }).catch(function (err) {
      options.log(err);
      if (err.status) return err;
      return {
        status: WWPASS_STATUS.INTERNAL_ERROR,
        reason: err
      };
    }), qrCodeAuth(options, websocketPool)];
    return Promise.race(promises).finally(function () {
      websocketPool.close();
    });
  };
  /*
   * WWPass auth with mobile PassKey
   *
  options = {
      'ticketURL': undefined, // string
      'callbackURL': undefined, // string
      'development': false, // work with dev server
      'log': function (message) || console.log, // another log handler
  }
   */


  var wwpassMobileAuth =
  /*#__PURE__*/
  function () {
    var _ref3 = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee3(initialOptions) {
      var defaultOptions, options, executor, result;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              defaultOptions = {
                ticketURL: undefined,
                callbackURL: undefined,
                version: 2,
                ppx: 'wwp_',
                spfewsAddress: 'wss://spfews.wwpass.com',
                qrcodeStyle: {
                  width: 256,
                  prefix: 'wwp_'
                },
                log: function log() {}
              };
              options = objectSpread({}, defaultOptions, initialOptions);
              options.qrcodeStyle = objectSpread({}, defaultOptions.qrcodeStyle, initialOptions.qrcodeStyle);

              if (options.ticketURL) {
                _context3.next = 5;
                break;
              }

              throw Error('ticketURL not found');

            case 5:
              if (options.callbackURL) {
                _context3.next = 7;
                break;
              }

              throw Error('callbackURL not found');

            case 7:
              if (options.qrcode) {
                _context3.next = 9;
                break;
              }

              throw Error('Element not found');

            case 9:
              // Always hide the button for backward compatibility, this auth will be handled by appAuth
              if (options.passkeyButton) {
                options.passkeyButton.style.display = 'none';
              }

              _context3.t0 = window.localStorage.getItem(METHOD_KEY_NAME);
              _context3.next = _context3.t0 === METHOD_QRCODE ? 13 : _context3.t0 === METHOD_SAME_DEVICE ? 15 : 17;
              break;

            case 13:
              executor = qrCodeAuthWrapper;
              return _context3.abrupt("break", 18);

            case 15:
              executor = appAuth;
              return _context3.abrupt("break", 18);

            case 17:
              executor = isMobile() ? appAuth : qrCodeAuthWrapper;

            case 18:
              if (options.uiCallback) {
                options.uiCallback(executor === appAuth ? {
                  button: true
                } : {
                  qrcode: true
                });
              } // Continue until an exception is thrown or qrcode element is removed from DOM


            case 19:
              _context3.next = 21;
              return executor(options);

            case 21:
              result = _context3.sent;
              if (options.uiCallback) options.uiCallback(result);

              if (result.button) {
                executor = appAuth;
              } else if (result.qrcode) {
                executor = qrCodeAuthWrapper;
              }

              if (result.ticket) {
                navigateToCallback(result);
              }

              if (result.refresh) {
                _context3.next = 28;
                break;
              }

              if (!(options.once || result.status === WWPASS_STATUS.TERMINAL_ERROR)) {
                _context3.next = 28;
                break;
              }

              return _context3.abrupt("return", result);

            case 28:
              if (document.documentElement.contains(options.qrcode)) {
                _context3.next = 19;
                break;
              }

            case 29:
              return _context3.abrupt("return", {
                status: WWPASS_STATUS.TERMINAL_ERROR,
                reason: 'QRCode element is not in DOM'
              });

            case 30:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function wwpassMobileAuth(_x4) {
      return _ref3.apply(this, arguments);
    };
  }();

  var openWithTicket = function openWithTicket(initialOptions) {
    return new Promise(function (resolve) {
      var defaultOptions = {
        ticket: '',
        ttl: 120,
        callbackURL: '',
        ppx: 'wwp_',
        away: true
      };

      var options = objectSpread({}, defaultOptions, initialOptions);

      if (isClientKeyTicket(options.ticket)) {
        generateClientNonce(options.ticket, options.ttl).then(function (key) {
          options = objectSpread({}, options, {
            clientKey: encodeClientKey(key)
          });
          var url = getUniversalURL(options);

          if (options.away) {
            window.location.href = url;
          } else {
            resolve(url);
          }
        });
      } else {
        var url = getUniversalURL(options);

        if (options.away) {
          window.location.href = url;
        } else {
          resolve(url);
        }
      }
    });
  };

  var absolutePath = function absolutePath(href) {
    var link = document.createElement('a');
    link.href = href;
    return link.href;
  };

  var authInit = function authInit(initialOptions) {
    var defaultOptions = {
      ticketURL: '',
      callbackURL: '',
      hw: false,
      ppx: 'wwp_',
      version: 2,
      log: function log() {}
    };

    var options = objectSpread({}, defaultOptions, initialOptions);

    if (typeof options.callbackURL === 'string') {
      options.callbackURL = absolutePath(options.callbackURL);
    }

    options.passkeyButton = typeof options.passkey === 'string' ? document.querySelector(options.passkey) : options.passkey;
    options.qrcode = typeof options.qrcode === 'string' ? document.querySelector(options.qrcode) : options.qrcode;
    return wwpassMobileAuth(options);
  };

  var version$1 = "3.0.7";

  if ('console' in window && window.console.log) {
    window.console.log("WWPass frontend library version ".concat(version$1));
  }

  window.WWPass = {
    authInit: authInit,
    openWithTicket: openWithTicket,
    isClientKeyTicket: isClientKeyTicket,
    cryptoPromise: WWPassCryptoPromise,
    copyClientNonce: copyClientNonce,
    updateTicket: updateTicket,
    pluginPresent: pluginPresent,
    waitForRemoval: waitForRemoval,
    STATUS: WWPASS_STATUS
  };

}());
//# sourceMappingURL=wwpass-frontend.js.map
