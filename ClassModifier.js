const replaceAll = require('string.prototype.replaceall');
String.prototype.replaceAll = function (searchValue, replaceValue) {
  return replaceAll(this, searchValue, replaceValue);
}

String.prototype.pad = function (width, z) {
  z = z || '0';
  var n = this.valueOf() + '';
  return (n.length >= width ? n : (new Array(width - n.length + 1)
    .join(z) + n));
};
Number.prototype.pad = function (width, z) {
  z = z || '0';
  var n = this.valueOf() + '';
  return (n.length >= width ? n : (new Array(width - n.length + 1)
    .join(z) + n));
};
Number.prototype.round = function (decimal) {
  var dec = decimal || 0;
  var dec2 = Math.pow(10, dec);
  var num = this.valueOf();
  return Math.round(num * dec2) / dec2;
};
Number.prototype.ceil = function (decimal) {
  var dec = decimal || 0;
  var dec2 = Math.pow(10, dec);
  var num = this.valueOf();
  return Math.ceil(num * dec2) / dec2;
};
Number.prototype.floor = function (decimal) {
  var dec = decimal || 0;
  var dec2 = Math.pow(10, dec);
  var num = this.valueOf();
  return Math.floor(num * dec2) / dec2;
};

// object.watch
if (!Object.prototype.watch) {
  Object.defineProperty(Object.prototype, "watch", {
    enumerable: false,
    configurable: true,
    writable: false,
    value: function (prop, handler) {
      var oldval = this[prop],
        newval = oldval,
        getter = function () {
          return newval;
        },
        setter = function (val) {
          oldval = newval;
          newval = handler.call(this, prop, oldval, val);
          return newval;
        };
      if (delete this[prop]) { // can't watch constants
        Object.defineProperty(this, prop, {
          get: getter,
          set: setter,
          enumerable: true,
          configurable: true
        });
      }
    }
  });
}
// object.unwatch
if (!Object.prototype.unwatch) {
  Object.defineProperty(Object.prototype, "unwatch", {
    enumerable: false,
    configurable: true,
    writable: false,
    value: function (prop) {
      var val = this[prop];
      delete this[prop]; // remove accessors
      this[prop] = val;
    }
  });
}

Function.prototype.clone = function() {
  var that = this;
  var temp = function clonedFunction(...args) { 
    return that.apply(this, args); 
  }
  for (var key in this) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty(key)) {
      temp[key] = this[key];
    }
  }
  return temp;
}

/**
 * Get the type of arg
 *
 * @param   {any}    arg  arg
 *
 * @return  {string}      String/Number/Object/Array/Function/AsyncFunction/Null/Undefined/BigInt
 */
global.getType = function getType(arg) {
  return Object.prototype.toString.call(arg).slice(8, -1);
}

//Adding BigInt support in JSON (de)serialization
BigInt.prototype.toJSON = function () {
  return this.toString() + "n";
}
let ogStringify = JSON.stringify.clone();
JSON.stringify = function stringifyWithBigInt(obj, reviver, spaces) {
  function r(key, value) {
    if (global.getType(value) == "BigInt") {
      value = value.toString() + "n";
    }
    if (global.getType(reviver) == "Function") {
      value = reviver(key, value);
    }
    return value;
  }
  return ogStringify(obj, r, spaces);
}
let ogParse = JSON.parse.clone();
JSON.parse = function parseWithBigInt(jsonString, reviver) {
  function r(key, value) {
    if (global.getType(value) == "String" && (/^\d+n$/).test(value)) {
      value = BigInt(value.slice(0, -1));
    }
    if (global.getType(reviver) == "Function") {
      value = reviver(key, value);
    }
    return value;
  }
  return ogParse(jsonString, r);
}

//Add another way to replace string
String.prototype.objectReplace = function objectReplace(obj) {
  return Object.keys(obj).reduce((s, v) => s.replaceAll(String(v[0]), String(v[1])), this.valueOf());
}
String.prototype.fReplace = function fReplace(...args) {
  let str = this.valueOf();
  for (let i in args) {
    str = str.replaceAll(`{${i}}`, args[i]);
  }
  return str;
}
