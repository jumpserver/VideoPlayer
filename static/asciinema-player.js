var AsciinemaPlayer = (function (exports) {
  'use strict';

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

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
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

  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest();
  }

  var runtime = {exports: {}};

  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  (function (module) {
  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }

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
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });

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
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    define(Gp, "constructor", GeneratorFunctionPrototype);
    define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
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
        define(genFun, toStringTagSymbol, "GeneratorFunction");
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

    function AsyncIterator(generator, PromiseImpl) {
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
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
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
          return new PromiseImpl(function(resolve, reject) {
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
    define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    });
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
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

    define(Gp, toStringTagSymbol, "Generator");

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    define(Gp, iteratorSymbol, function() {
      return this;
    });

    define(Gp, "toString", function() {
      return "[object Generator]";
    });

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
    // in case runtime.js accidentally runs in strict mode, in modern engines
    // we can explicitly access globalThis. In older engines we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }
  }(runtime));

  var regenerator = runtime.exports;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

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
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  const sharedConfig = {};

  const equalFn = (a, b) => a === b;
  const $PROXY = Symbol("solid-proxy");
  const signalOptions = {
    equals: equalFn
  };
  let runEffects = runQueue;
  const NOTPENDING = {};
  const STALE = 1;
  const PENDING = 2;
  const UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  };
  var Owner = null;
  let Transition = null;
  let Listener = null;
  let Pending = null;
  let Updates = null;
  let Effects = null;
  let ExecCount = 0;
  function createRoot(fn, detachedOwner) {
    const listener = Listener,
          owner = Owner,
          root = fn.length === 0 && !false ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: null,
      owner: detachedOwner || owner
    };
    Owner = root;
    Listener = null;
    try {
      return runUpdates(() => fn(() => cleanNode(root)), true);
    } finally {
      Listener = listener;
      Owner = owner;
    }
  }
  function createSignal(value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const s = {
      value,
      observers: null,
      observerSlots: null,
      pending: NOTPENDING,
      comparator: options.equals || undefined
    };
    const setter = value => {
      if (typeof value === "function") {
        value = value(s.pending !== NOTPENDING ? s.pending : s.value);
      }
      return writeSignal(s, value);
    };
    return [readSignal.bind(s), setter];
  }
  function createRenderEffect(fn, value, options) {
    const c = createComputation(fn, value, false, STALE);
    updateComputation(c);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c = createComputation(fn, value, false, STALE);
    c.user = true;
    Effects ? Effects.push(c) : queueMicrotask(() => updateComputation(c));
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c = createComputation(fn, value, true, 0);
    c.pending = NOTPENDING;
    c.observers = null;
    c.observerSlots = null;
    c.comparator = options.equals || undefined;
    updateComputation(c);
    return readSignal.bind(c);
  }
  function batch(fn) {
    if (Pending) return fn();
    let result;
    const q = Pending = [];
    try {
      result = fn();
    } finally {
      Pending = null;
    }
    runUpdates(() => {
      for (let i = 0; i < q.length; i += 1) {
        const data = q[i];
        if (data.pending !== NOTPENDING) {
          const pending = data.pending;
          data.pending = NOTPENDING;
          writeSignal(data, pending);
        }
      }
    }, false);
    return result;
  }
  function untrack(fn) {
    let result,
        listener = Listener;
    Listener = null;
    result = fn();
    Listener = listener;
    return result;
  }
  function onMount(fn) {
    createEffect(() => untrack(fn));
  }
  function onCleanup(fn) {
    if (Owner === null) ;else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
    return fn;
  }
  function getListener() {
    return Listener;
  }
  function children(fn) {
    const children = createMemo(fn);
    return createMemo(() => resolveChildren(children()));
  }
  function readSignal() {
    const runningTransition = Transition ;
    if (this.sources && (this.state || runningTransition )) {
      const updates = Updates;
      Updates = null;
      this.state === STALE || runningTransition  ? updateComputation(this) : lookDownstream(this);
      Updates = updates;
    }
    if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        this.observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    if (node.comparator) {
      if (node.comparator(node.value, value)) return value;
    }
    if (Pending) {
      if (node.pending === NOTPENDING) Pending.push(node);
      node.pending = value;
      return value;
    }
    let TransitionRunning = false;
    node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          if (TransitionRunning && Transition.disposed.has(o)) ;
          if (TransitionRunning && !o.tState || !TransitionRunning && !o.state) {
            if (o.pure) Updates.push(o);else Effects.push(o);
            if (o.observers) markUpstream(o);
          }
          if (TransitionRunning) ;else o.state = STALE;
        }
        if (Updates.length > 10e5) {
          Updates = [];
          if (false) ;
          throw new Error();
        }
      }, false);
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn) return;
    cleanNode(node);
    const owner = Owner,
          listener = Listener,
          time = ExecCount;
    Listener = Owner = node;
    runComputation(node, node.value, time);
    Listener = listener;
    Owner = owner;
  }
  function runComputation(node, value, time) {
    let nextValue;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      handleError(err);
    }
    if (!node.updatedAt || node.updatedAt <= time) {
      if (node.observers && node.observers.length) {
        writeSignal(node, nextValue);
      } else node.value = nextValue;
      node.updatedAt = time;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c = {
      fn,
      state: state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: null,
      pure
    };
    if (Owner === null) ;else if (Owner !== UNOWNED) {
      {
        if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
      }
    }
    return c;
  }
  function runTop(node) {
    const runningTransition = Transition ;
    if (node.state === 0 || runningTransition ) return;
    if (node.state === PENDING || runningTransition ) return lookDownstream(node);
    if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
    const ancestors = [node];
    while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (node.state || runningTransition ) ancestors.push(node);
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
      node = ancestors[i];
      if (node.state === STALE || runningTransition ) {
        updateComputation(node);
      } else if (node.state === PENDING || runningTransition ) {
        const updates = Updates;
        Updates = null;
        lookDownstream(node, ancestors[0]);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates) return fn();
    let wait = false;
    if (!init) Updates = [];
    if (Effects) wait = true;else Effects = [];
    ExecCount++;
    try {
      return fn();
    } catch (err) {
      handleError(err);
    } finally {
      completeUpdates(wait);
    }
  }
  function completeUpdates(wait) {
    if (Updates) {
      runQueue(Updates);
      Updates = null;
    }
    if (wait) return;
    if (Effects.length) batch(() => {
      runEffects(Effects);
      Effects = null;
    });else {
      Effects = null;
    }
  }
  function runQueue(queue) {
    for (let i = 0; i < queue.length; i++) runTop(queue[i]);
  }
  function runUserEffects(queue) {
    let i,
        userLength = 0;
    for (i = 0; i < queue.length; i++) {
      const e = queue[i];
      if (!e.user) runTop(e);else queue[userLength++] = e;
    }
    const resume = queue.length;
    for (i = 0; i < userLength; i++) runTop(queue[i]);
    for (i = resume; i < queue.length; i++) runTop(queue[i]);
  }
  function lookDownstream(node, ignore) {
    const runningTransition = Transition ;
    node.state = 0;
    for (let i = 0; i < node.sources.length; i += 1) {
      const source = node.sources[i];
      if (source.sources) {
        if (source.state === STALE || runningTransition ) {
          if (source !== ignore) runTop(source);
        } else if (source.state === PENDING || runningTransition ) lookDownstream(source, ignore);
      }
    }
  }
  function markUpstream(node) {
    const runningTransition = Transition ;
    for (let i = 0; i < node.observers.length; i += 1) {
      const o = node.observers[i];
      if (!o.state || runningTransition ) {
        o.state = PENDING;
        if (o.pure) Updates.push(o);else Effects.push(o);
        o.observers && markUpstream(o);
      }
    }
  }
  function cleanNode(node) {
    let i;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(),
              index = node.sourceSlots.pop(),
              obs = source.observers;
        if (obs && obs.length) {
          const n = obs.pop(),
                s = source.observerSlots.pop();
          if (index < obs.length) {
            n.sourceSlots[s] = index;
            obs[index] = n;
            source.observerSlots[index] = s;
          }
        }
      }
    }
    if (node.owned) {
      for (i = 0; i < node.owned.length; i++) cleanNode(node.owned[i]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i = 0; i < node.cleanups.length; i++) node.cleanups[i]();
      node.cleanups = null;
    }
    node.state = 0;
    node.context = null;
  }
  function handleError(err) {
    throw err;
  }
  function resolveChildren(children) {
    if (typeof children === "function" && !children.length) return resolveChildren(children());
    if (Array.isArray(children)) {
      const results = [];
      for (let i = 0; i < children.length; i++) {
        const result = resolveChildren(children[i]);
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
    }
    return children;
  }

  const FALLBACK = Symbol("fallback");
  function dispose(d) {
    for (let i = 0; i < d.length; i++) d[i]();
  }
  function mapArray(list, mapFn, options = {}) {
    let items = [],
        mapped = [],
        disposers = [],
        len = 0,
        indexes = mapFn.length > 1 ? [] : null;
    onCleanup(() => dispose(disposers));
    return () => {
      let newItems = list() || [],
          i,
          j;
      return untrack(() => {
        let newLen = newItems.length,
            newIndices,
            newIndicesNext,
            temp,
            tempdisposers,
            tempIndexes,
            start,
            end,
            newEnd,
            item;
        if (newLen === 0) {
          if (len !== 0) {
            dispose(disposers);
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            indexes && (indexes = []);
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot(disposer => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
        }
        else if (len === 0) {
          mapped = new Array(newLen);
          for (j = 0; j < newLen; j++) {
            items[j] = newItems[j];
            mapped[j] = createRoot(mapper);
          }
          len = newLen;
        } else {
          temp = new Array(newLen);
          tempdisposers = new Array(newLen);
          indexes && (tempIndexes = new Array(newLen));
          for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
          for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
            temp[newEnd] = mapped[end];
            tempdisposers[newEnd] = disposers[end];
            indexes && (tempIndexes[newEnd] = indexes[end]);
          }
          newIndices = new Map();
          newIndicesNext = new Array(newEnd + 1);
          for (j = newEnd; j >= start; j--) {
            item = newItems[j];
            i = newIndices.get(item);
            newIndicesNext[j] = i === undefined ? -1 : i;
            newIndices.set(item, j);
          }
          for (i = start; i <= end; i++) {
            item = items[i];
            j = newIndices.get(item);
            if (j !== undefined && j !== -1) {
              temp[j] = mapped[i];
              tempdisposers[j] = disposers[i];
              indexes && (tempIndexes[j] = indexes[i]);
              j = newIndicesNext[j];
              newIndices.set(item, j);
            } else disposers[i]();
          }
          for (j = start; j < newLen; j++) {
            if (j in temp) {
              mapped[j] = temp[j];
              disposers[j] = tempdisposers[j];
              if (indexes) {
                indexes[j] = tempIndexes[j];
                indexes[j](j);
              }
            } else mapped[j] = createRoot(mapper);
          }
          mapped = mapped.slice(0, len = newLen);
          items = newItems.slice(0);
        }
        return mapped;
      });
      function mapper(disposer) {
        disposers[j] = disposer;
        if (indexes) {
          const [s, set] = createSignal(j);
          indexes[j] = set;
          return mapFn(newItems[j], s);
        }
        return mapFn(newItems[j]);
      }
    };
  }
  function indexArray(list, mapFn, options = {}) {
    let items = [],
        mapped = [],
        disposers = [],
        signals = [],
        len = 0,
        i;
    onCleanup(() => dispose(disposers));
    return () => {
      const newItems = list() || [];
      return untrack(() => {
        if (newItems.length === 0) {
          if (len !== 0) {
            dispose(disposers);
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            signals = [];
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot(disposer => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
          return mapped;
        }
        if (items[0] === FALLBACK) {
          disposers[0]();
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
        }
        for (i = 0; i < newItems.length; i++) {
          if (i < items.length && items[i] !== newItems[i]) {
            signals[i](() => newItems[i]);
          } else if (i >= items.length) {
            mapped[i] = createRoot(mapper);
          }
        }
        for (; i < items.length; i++) {
          disposers[i]();
        }
        len = signals.length = disposers.length = newItems.length;
        items = newItems.slice(0);
        return mapped = mapped.slice(0, len);
      });
      function mapper(disposer) {
        disposers[i] = disposer;
        const [s, set] = createSignal(newItems[i]);
        signals[i] = set;
        return mapFn(s, i);
      }
    };
  }
  function createComponent(Comp, props) {
    return untrack(() => Comp(props));
  }

  function For(props) {
    const fallback = "fallback" in props && {
      fallback: () => props.fallback
    };
    return createMemo(mapArray(() => props.each, props.children, fallback ? fallback : undefined));
  }
  function Index(props) {
    const fallback = "fallback" in props && {
      fallback: () => props.fallback
    };
    return createMemo(indexArray(() => props.each, props.children, fallback ? fallback : undefined));
  }
  function Show(props) {
    let strictEqual = false;
    const condition = createMemo(() => props.when, undefined, {
      equals: (a, b) => strictEqual ? a === b : !a === !b
    });
    return createMemo(() => {
      const c = condition();
      if (c) {
        const child = props.children;
        return (strictEqual = typeof child === "function" && child.length > 0) ? untrack(() => child(c)) : child;
      }
      return props.fallback;
    });
  }
  function Switch(props) {
    let strictEqual = false;
    const conditions = children(() => props.children),
          evalConditions = createMemo(() => {
      let conds = conditions();
      if (!Array.isArray(conds)) conds = [conds];
      for (let i = 0; i < conds.length; i++) {
        const c = conds[i].when;
        if (c) return [i, c, conds[i]];
      }
      return [-1];
    }, undefined, {
      equals: (a, b) => a[0] === b[0] && (strictEqual ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2]
    });
    return createMemo(() => {
      const [index, when, cond] = evalConditions();
      if (index < 0) return props.fallback;
      const c = cond.children;
      return (strictEqual = typeof c === "function" && c.length > 0) ? untrack(() => c(when)) : c;
    });
  }
  function Match(props) {
    return props;
  }

  function memo(fn, equals) {
    return createMemo(fn, undefined, !equals ? {
      equals
    } : undefined);
  }

  function reconcileArrays(parentNode, a, b) {
    let bLength = b.length,
        aEnd = a.length,
        bEnd = bLength,
        aStart = 0,
        bStart = 0,
        after = a[aEnd - 1].nextSibling,
        map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
        while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a[aStart])) a[aStart].remove();
          aStart++;
        }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node = a[--aEnd].nextSibling;
        parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
        parentNode.insertBefore(b[--bEnd], node);
        a[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = new Map();
          let i = bStart;
          while (i < bEnd) map.set(b[i], i++);
        }
        const index = map.get(a[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i = aStart,
                sequence = 1,
                t;
            while (++i < aEnd && i < bEnd) {
              if ((t = map.get(a[i])) == null || t !== index + sequence) break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a[aStart];
              while (bStart < index) parentNode.insertBefore(b[bStart++], node);
            } else parentNode.replaceChild(b[bStart++], a[aStart++]);
          } else aStart++;
        } else a[aStart++].remove();
      }
    }
  }

  const $$EVENTS = "_$DX_DELEGATE";
  function render(code, element, init) {
    let disposer;
    createRoot(dispose => {
      disposer = dispose;
      element === document ? code() : insert(element, code(), element.firstChild ? null : undefined, init);
    });
    return () => {
      disposer();
      element.textContent = "";
    };
  }
  function template(html, check, isSVG) {
    const t = document.createElement("template");
    t.innerHTML = html;
    let node = t.content.firstChild;
    if (isSVG) node = node.firstChild;
    return node;
  }
  function delegateEvents(eventNames, document = window.document) {
    const e = document[$$EVENTS] || (document[$$EVENTS] = new Set());
    for (let i = 0, l = eventNames.length; i < l; i++) {
      const name = eventNames[i];
      if (!e.has(name)) {
        e.add(name);
        document.addEventListener(name, eventHandler);
      }
    }
  }
  function addEventListener(node, name, handler, delegate) {
    if (delegate) {
      if (Array.isArray(handler)) {
        node[`$$${name}`] = handler[0];
        node[`$$${name}Data`] = handler[1];
      } else node[`$$${name}`] = handler;
    } else if (Array.isArray(handler)) {
      node.addEventListener(name, e => handler[0](handler[1], e));
    } else node.addEventListener(name, handler);
  }
  function classList$1(node, value, prev = {}) {
    const classKeys = Object.keys(value || {}),
          prevKeys = Object.keys(prev);
    let i, len;
    for (i = 0, len = prevKeys.length; i < len; i++) {
      const key = prevKeys[i];
      if (!key || key === "undefined" || value[key]) continue;
      toggleClassKey(node, key, false);
      delete prev[key];
    }
    for (i = 0, len = classKeys.length; i < len; i++) {
      const key = classKeys[i],
            classValue = !!value[key];
      if (!key || key === "undefined" || prev[key] === classValue || !classValue) continue;
      toggleClassKey(node, key, true);
      prev[key] = classValue;
    }
    return prev;
  }
  function style$1(node, value, prev = {}) {
    const nodeStyle = node.style;
    if (value == null || typeof value === "string") return nodeStyle.cssText = value;
    typeof prev === "string" && (prev = {});
    let v, s;
    for (s in prev) {
      value[s] == null && nodeStyle.removeProperty(s);
      delete prev[s];
    }
    for (s in value) {
      v = value[s];
      if (v !== prev[s]) {
        nodeStyle.setProperty(s, v);
        prev[s] = v;
      }
    }
    return prev;
  }
  function insert(parent, accessor, marker, initial) {
    if (marker !== undefined && !initial) initial = [];
    if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
    createRenderEffect(current => insertExpression(parent, accessor(), current, marker), initial);
  }
  function toggleClassKey(node, key, value) {
    const classNames = key.trim().split(/\s+/);
    for (let i = 0, nameLen = classNames.length; i < nameLen; i++) node.classList.toggle(classNames[i], value);
  }
  function eventHandler(e) {
    const key = `$$${e.type}`;
    let node = e.composedPath && e.composedPath()[0] || e.target;
    if (e.target !== node) {
      Object.defineProperty(e, "target", {
        configurable: true,
        value: node
      });
    }
    Object.defineProperty(e, "currentTarget", {
      configurable: true,
      get() {
        return node || document;
      }
    });
    while (node !== null) {
      const handler = node[key];
      if (handler && !node.disabled) {
        const data = node[`${key}Data`];
        data !== undefined ? handler(data, e) : handler(e);
        if (e.cancelBubble) return;
      }
      node = node.host && node.host !== node && node.host instanceof Node ? node.host : node.parentNode;
    }
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    if (sharedConfig.context && !current) current = [...parent.childNodes];
    while (typeof current === "function") current = current();
    if (value === current) return current;
    const t = typeof value,
          multi = marker !== undefined;
    parent = multi && current[0] && current[0].parentNode || parent;
    if (t === "string" || t === "number") {
      if (sharedConfig.context) return current;
      if (t === "number") value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && node.nodeType === 3) {
          node.data = value;
        } else node = document.createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          current = parent.firstChild.data = value;
        } else current = parent.textContent = value;
      }
    } else if (value == null || t === "boolean") {
      if (sharedConfig.context) return current;
      current = cleanChildren(parent, current, marker);
    } else if (t === "function") {
      createRenderEffect(() => {
        let v = value();
        while (typeof v === "function") v = v();
        current = insertExpression(parent, v, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      if (normalizeIncomingArray(array, value, unwrapArray)) {
        createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
        return () => current;
      }
      if (sharedConfig.context) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].parentNode) return current = array;
        }
      }
      if (array.length === 0) {
        current = cleanChildren(parent, current, marker);
        if (multi) return current;
      } else if (Array.isArray(current)) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else reconcileArrays(parent, current, array);
      } else {
        current && cleanChildren(parent);
        appendNodes(parent, array);
      }
      current = array;
    } else if (value instanceof Node) {
      if (sharedConfig.context && value.parentNode) return current = multi ? [value] : value;
      if (Array.isArray(current)) {
        if (multi) return current = cleanChildren(parent, current, marker, value);
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !parent.firstChild) {
        parent.appendChild(value);
      } else parent.replaceChild(value, parent.firstChild);
      current = value;
    } else ;
    return current;
  }
  function normalizeIncomingArray(normalized, array, unwrap) {
    let dynamic = false;
    for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i],
          t;
      if (item instanceof Node) {
        normalized.push(item);
      } else if (item == null || item === true || item === false) ; else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item) || dynamic;
      } else if ((t = typeof item) === "string") {
        normalized.push(document.createTextNode(item));
      } else if (t === "function") {
        if (unwrap) {
          while (typeof item === "function") item = item();
          dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else normalized.push(document.createTextNode(item.toString()));
    }
    return dynamic;
  }
  function appendNodes(parent, array, marker) {
    for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === undefined) return parent.textContent = "";
    const node = replacement || document.createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i = current.length - 1; i >= 0; i--) {
        const el = current[i];
        if (node !== el) {
          const isParent = el.parentNode === parent;
          if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);else isParent && el.remove();
        } else inserted = true;
      }
    } else parent.insertBefore(node, marker);
    return [node];
  }

  const $RAW = Symbol("store-raw"),
        $NODE = Symbol("store-node"),
        $NAME = Symbol("store-name");
  function wrap$1(value, name) {
    let p = value[$PROXY];
    if (!p) {
      Object.defineProperty(value, $PROXY, {
        value: p = new Proxy(value, proxyTraps$1)
      });
      const keys = Object.keys(value),
            desc = Object.getOwnPropertyDescriptors(value);
      for (let i = 0, l = keys.length; i < l; i++) {
        const prop = keys[i];
        if (desc[prop].get) {
          const get = desc[prop].get.bind(p);
          Object.defineProperty(value, prop, {
            get
          });
        }
      }
    }
    return p;
  }
  function isWrappable(obj) {
    return obj != null && typeof obj === "object" && (obj[$PROXY] || !obj.__proto__ || obj.__proto__ === Object.prototype || Array.isArray(obj));
  }
  function unwrap(item, set = new Set()) {
    let result, unwrapped, v, prop;
    if (result = item != null && item[$RAW]) return result;
    if (!isWrappable(item) || set.has(item)) return item;
    if (Array.isArray(item)) {
      if (Object.isFrozen(item)) item = item.slice(0);else set.add(item);
      for (let i = 0, l = item.length; i < l; i++) {
        v = item[i];
        if ((unwrapped = unwrap(v, set)) !== v) item[i] = unwrapped;
      }
    } else {
      if (Object.isFrozen(item)) item = Object.assign({}, item);else set.add(item);
      const keys = Object.keys(item),
            desc = Object.getOwnPropertyDescriptors(item);
      for (let i = 0, l = keys.length; i < l; i++) {
        prop = keys[i];
        if (desc[prop].get) continue;
        v = item[prop];
        if ((unwrapped = unwrap(v, set)) !== v) item[prop] = unwrapped;
      }
    }
    return item;
  }
  function getDataNodes(target) {
    let nodes = target[$NODE];
    if (!nodes) Object.defineProperty(target, $NODE, {
      value: nodes = {}
    });
    return nodes;
  }
  function proxyDescriptor(target, property) {
    const desc = Reflect.getOwnPropertyDescriptor(target, property);
    if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE || property === $NAME) return desc;
    delete desc.value;
    delete desc.writable;
    desc.get = () => target[$PROXY][property];
    return desc;
  }
  function ownKeys$1(target) {
    if (getListener()) {
      const nodes = getDataNodes(target);
      (nodes._ || (nodes._ = createDataNode()))();
    }
    return Reflect.ownKeys(target);
  }
  function createDataNode() {
    const [s, set] = createSignal(undefined, {
      equals: false,
      internal: true
    });
    s.$ = set;
    return s;
  }
  const proxyTraps$1 = {
    get(target, property, receiver) {
      if (property === $RAW) return target;
      if (property === $PROXY) return receiver;
      const value = target[property];
      if (property === $NODE || property === "__proto__") return value;
      const wrappable = isWrappable(value);
      if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property))) {
        let nodes, node;
        if (wrappable && (nodes = getDataNodes(value))) {
          node = nodes._ || (nodes._ = createDataNode());
          node();
        }
        nodes = getDataNodes(target);
        node = nodes[property] || (nodes[property] = createDataNode());
        node();
      }
      return wrappable ? wrap$1(value) : value;
    },
    set() {
      return true;
    },
    deleteProperty() {
      return true;
    },
    ownKeys: ownKeys$1,
    getOwnPropertyDescriptor: proxyDescriptor
  };
  function setProperty(state, property, value) {
    if (state[property] === value) return;
    const array = Array.isArray(state);
    const len = state.length;
    const isUndefined = value === undefined;
    const notify = array || isUndefined === property in state;
    if (isUndefined) {
      delete state[property];
    } else state[property] = value;
    let nodes = getDataNodes(state),
        node;
    (node = nodes[property]) && node.$();
    if (array && state.length !== len) (node = nodes.length) && node.$();
    notify && (node = nodes._) && node.$();
  }
  function mergeStoreNode(state, value) {
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      setProperty(state, key, value[key]);
    }
  }
  function updatePath(current, path, traversed = []) {
    let part,
        prev = current;
    if (path.length > 1) {
      part = path.shift();
      const partType = typeof part,
            isArray = Array.isArray(current);
      if (Array.isArray(part)) {
        for (let i = 0; i < part.length; i++) {
          updatePath(current, [part[i]].concat(path), traversed);
        }
        return;
      } else if (isArray && partType === "function") {
        for (let i = 0; i < current.length; i++) {
          if (part(current[i], i)) updatePath(current, [i].concat(path), traversed);
        }
        return;
      } else if (isArray && partType === "object") {
        const {
          from = 0,
          to = current.length - 1,
          by = 1
        } = part;
        for (let i = from; i <= to; i += by) {
          updatePath(current, [i].concat(path), traversed);
        }
        return;
      } else if (path.length > 1) {
        updatePath(current[part], path, [part].concat(traversed));
        return;
      }
      prev = current[part];
      traversed = [part].concat(traversed);
    }
    let value = path[0];
    if (typeof value === "function") {
      value = value(prev, traversed);
      if (value === prev) return;
    }
    if (part === undefined && value == undefined) return;
    value = unwrap(value);
    if (part === undefined || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
      mergeStoreNode(prev, value);
    } else setProperty(current, part, value);
  }
  function createStore(store, options) {
    const unwrappedStore = unwrap(store || {});
    const wrappedStore = wrap$1(unwrappedStore);
    function setStore(...args) {
      batch(() => updatePath(unwrappedStore, args));
    }
    return [wrappedStore, setStore];
  }

  function applyState(target, parent, property, merge, key) {
    const previous = parent[property];
    if (target === previous) return;
    if (!isWrappable(target) || !isWrappable(previous) || key && target[key] !== previous[key]) {
      target !== previous && setProperty(parent, property, target);
      return;
    }
    if (Array.isArray(target)) {
      if (target.length && previous.length && (!merge || key && target[0][key] != null)) {
        let i, j, start, end, newEnd, item, newIndicesNext, keyVal;
        for (start = 0, end = Math.min(previous.length, target.length); start < end && (previous[start] === target[start] || key && previous[start][key] === target[start][key]); start++) {
          applyState(target[start], previous, start, merge, key);
        }
        const temp = new Array(target.length),
              newIndices = new Map();
        for (end = previous.length - 1, newEnd = target.length - 1; end >= start && newEnd >= start && (previous[end] === target[newEnd] || key && previous[end][key] === target[newEnd][key]); end--, newEnd--) {
          temp[newEnd] = previous[end];
        }
        if (start > newEnd || start > end) {
          for (j = start; j <= newEnd; j++) setProperty(previous, j, target[j]);
          for (; j < target.length; j++) {
            setProperty(previous, j, temp[j]);
            applyState(target[j], previous, j, merge, key);
          }
          if (previous.length > target.length) setProperty(previous, "length", target.length);
          return;
        }
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = target[j];
          keyVal = key ? item[key] : item;
          i = newIndices.get(keyVal);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(keyVal, j);
        }
        for (i = start; i <= end; i++) {
          item = previous[i];
          keyVal = key ? item[key] : item;
          j = newIndices.get(keyVal);
          if (j !== undefined && j !== -1) {
            temp[j] = previous[i];
            j = newIndicesNext[j];
            newIndices.set(keyVal, j);
          }
        }
        for (j = start; j < target.length; j++) {
          if (j in temp) {
            setProperty(previous, j, temp[j]);
            applyState(target[j], previous, j, merge, key);
          } else setProperty(previous, j, target[j]);
        }
      } else {
        for (let i = 0, len = target.length; i < len; i++) {
          applyState(target[i], previous, i, merge, key);
        }
      }
      if (previous.length > target.length) setProperty(previous, "length", target.length);
      return;
    }
    const targetKeys = Object.keys(target);
    for (let i = 0, len = targetKeys.length; i < len; i++) {
      applyState(target[targetKeys[i]], previous, targetKeys[i], merge, key);
    }
    const previousKeys = Object.keys(previous);
    for (let i = 0, len = previousKeys.length; i < len; i++) {
      if (target[previousKeys[i]] === undefined) setProperty(previous, previousKeys[i], undefined);
    }
  }
  function reconcile(value, options = {}) {
    const {
      merge,
      key = "id"
    } = options,
          v = unwrap(value);
    return state => {
      if (!isWrappable(state) || !isWrappable(v)) return v;
      applyState(v, {
        state
      }, "state", merge, key);
      return state;
    };
  }

  var wasm;
  var heap = new Array(32).fill(undefined);
  heap.push(undefined, null, true, false);

  function getObject(idx) {
    return heap[idx];
  }

  var heap_next = heap.length;

  function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
  }

  function takeObject(idx) {
    var ret = getObject(idx);
    dropObject(idx);
    return ret;
  }

  function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    var idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
  }

  var cachedTextDecoder = new TextDecoder('utf-8', {
    ignoreBOM: true,
    fatal: true
  });
  cachedTextDecoder.decode();
  var cachegetUint8Memory0 = null;

  function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
      cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }

    return cachegetUint8Memory0;
  }

  function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
  }

  function debugString(val) {
    // primitive types
    var type = _typeof(val);

    if (type == 'number' || type == 'boolean' || val == null) {
      return "".concat(val);
    }

    if (type == 'string') {
      return "\"".concat(val, "\"");
    }

    if (type == 'symbol') {
      var description = val.description;

      if (description == null) {
        return 'Symbol';
      } else {
        return "Symbol(".concat(description, ")");
      }
    }

    if (type == 'function') {
      var name = val.name;

      if (typeof name == 'string' && name.length > 0) {
        return "Function(".concat(name, ")");
      } else {
        return 'Function';
      }
    } // objects


    if (Array.isArray(val)) {
      var length = val.length;
      var debug = '[';

      if (length > 0) {
        debug += debugString(val[0]);
      }

      for (var i = 1; i < length; i++) {
        debug += ', ' + debugString(val[i]);
      }

      debug += ']';
      return debug;
    } // Test for built-in


    var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    var className;

    if (builtInMatches.length > 1) {
      className = builtInMatches[1];
    } else {
      // Failed to match the standard '[object ClassName]'
      return toString.call(val);
    }

    if (className == 'Object') {
      // we're a user defined class or Object
      // JSON.stringify avoids problems with cycles, and is generally much
      // easier than looping through ownProperties of `val`.
      try {
        return 'Object(' + JSON.stringify(val) + ')';
      } catch (_) {
        return 'Object';
      }
    } // errors


    if (val instanceof Error) {
      return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
    } // TODO we could test for more things here, like `Set`s and `Map`s.


    return className;
  }

  var WASM_VECTOR_LEN = 0;
  var cachedTextEncoder = new TextEncoder('utf-8');
  var encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  } : function (arg, view) {
    var buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };

  function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
      var buf = cachedTextEncoder.encode(arg);

      var _ptr = malloc(buf.length);

      getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);
      WASM_VECTOR_LEN = buf.length;
      return _ptr;
    }

    var len = arg.length;
    var ptr = malloc(len);
    var mem = getUint8Memory0();
    var offset = 0;

    for (; offset < len; offset++) {
      var code = arg.charCodeAt(offset);
      if (code > 0x7F) break;
      mem[ptr + offset] = code;
    }

    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }

      ptr = realloc(ptr, len, len = offset + arg.length * 3);
      var view = getUint8Memory0().subarray(ptr + offset, ptr + len);
      var ret = encodeString(arg, view);
      offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  }

  var cachegetInt32Memory0 = null;

  function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
      cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }

    return cachegetInt32Memory0;
  }
  /**
  * @param {number} w
  * @param {number} h
  * @returns {VtWrapper}
  */


  function create$1(w, h) {
    var ret = wasm.create(w, h);
    return VtWrapper.__wrap(ret);
  }
  var cachegetUint32Memory0 = null;

  function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
      cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }

    return cachegetUint32Memory0;
  }

  function getArrayU32FromWasm0(ptr, len) {
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
  }
  /**
  */


  var VtWrapper = /*#__PURE__*/function () {
    function VtWrapper() {
      _classCallCheck(this, VtWrapper);
    }

    _createClass(VtWrapper, [{
      key: "__destroy_into_raw",
      value: function __destroy_into_raw() {
        var ptr = this.ptr;
        this.ptr = 0;
        return ptr;
      }
    }, {
      key: "free",
      value: function free() {
        var ptr = this.__destroy_into_raw();

        wasm.__wbg_vtwrapper_free(ptr);
      }
      /**
      * @param {string} s
      * @returns {Uint32Array}
      */

    }, {
      key: "feed",
      value: function feed(s) {
        try {
          var retptr = wasm.__wbindgen_add_to_stack_pointer(-16);

          var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
          var len0 = WASM_VECTOR_LEN;
          wasm.vtwrapper_feed(retptr, this.ptr, ptr0, len0);
          var r0 = getInt32Memory0()[retptr / 4 + 0];
          var r1 = getInt32Memory0()[retptr / 4 + 1];
          var v1 = getArrayU32FromWasm0(r0, r1).slice();

          wasm.__wbindgen_free(r0, r1 * 4);

          return v1;
        } finally {
          wasm.__wbindgen_add_to_stack_pointer(16);
        }
      }
      /**
      * @returns {string}
      */

    }, {
      key: "inspect",
      value: function inspect() {
        try {
          var retptr = wasm.__wbindgen_add_to_stack_pointer(-16);

          wasm.vtwrapper_inspect(retptr, this.ptr);
          var r0 = getInt32Memory0()[retptr / 4 + 0];
          var r1 = getInt32Memory0()[retptr / 4 + 1];
          return getStringFromWasm0(r0, r1);
        } finally {
          wasm.__wbindgen_add_to_stack_pointer(16);

          wasm.__wbindgen_free(r0, r1);
        }
      }
      /**
      * @param {number} l
      * @returns {any}
      */

    }, {
      key: "get_line",
      value: function get_line(l) {
        var ret = wasm.vtwrapper_get_line(this.ptr, l);
        return takeObject(ret);
      }
      /**
      * @returns {any}
      */

    }, {
      key: "get_cursor",
      value: function get_cursor() {
        var ret = wasm.vtwrapper_get_cursor(this.ptr);
        return takeObject(ret);
      }
    }], [{
      key: "__wrap",
      value: function __wrap(ptr) {
        var obj = Object.create(VtWrapper.prototype);
        obj.ptr = ptr;
        return obj;
      }
    }]);

    return VtWrapper;
  }();

  function load(_x, _x2) {
    return _load.apply(this, arguments);
  }

  function _load() {
    _load = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(module, imports) {
      var bytes, instance;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(typeof Response === 'function' && module instanceof Response)) {
                _context.next = 23;
                break;
              }

              if (!(typeof WebAssembly.instantiateStreaming === 'function')) {
                _context.next = 15;
                break;
              }

              _context.prev = 2;
              _context.next = 5;
              return WebAssembly.instantiateStreaming(module, imports);

            case 5:
              return _context.abrupt("return", _context.sent);

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);

              if (!(module.headers.get('Content-Type') != 'application/wasm')) {
                _context.next = 14;
                break;
              }

              console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", _context.t0);
              _context.next = 15;
              break;

            case 14:
              throw _context.t0;

            case 15:
              _context.next = 17;
              return module.arrayBuffer();

            case 17:
              bytes = _context.sent;
              _context.next = 20;
              return WebAssembly.instantiate(bytes, imports);

            case 20:
              return _context.abrupt("return", _context.sent);

            case 23:
              _context.next = 25;
              return WebAssembly.instantiate(module, imports);

            case 25:
              instance = _context.sent;

              if (!(instance instanceof WebAssembly.Instance)) {
                _context.next = 30;
                break;
              }

              return _context.abrupt("return", {
                instance: instance,
                module: module
              });

            case 30:
              return _context.abrupt("return", instance);

            case 31:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 8]]);
    }));
    return _load.apply(this, arguments);
  }

  function init(_x3) {
    return _init.apply(this, arguments);
  }

  function _init() {
    _init = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(input) {
      var imports, _yield$load, instance, module;

      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (typeof input === 'undefined') {
                input = new URL('index_bg.wasm', '');
              }

              imports = {};
              imports.wbg = {};

              imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
                takeObject(arg0);
              };

              imports.wbg.__wbindgen_number_new = function (arg0) {
                var ret = arg0;
                return addHeapObject(ret);
              };

              imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
                var ret = getStringFromWasm0(arg0, arg1);
                return addHeapObject(ret);
              };

              imports.wbg.__wbg_set_f1a4ac8f3a605b11 = function (arg0, arg1, arg2) {
                getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
              };

              imports.wbg.__wbg_new_949bbc1147195c4e = function () {
                var ret = new Array();
                return addHeapObject(ret);
              };

              imports.wbg.__wbg_new_ac32179a660db4bb = function () {
                var ret = new Map();
                return addHeapObject(ret);
              };

              imports.wbg.__wbg_new_0b83d3df67ecb33e = function () {
                var ret = new Object();
                return addHeapObject(ret);
              };

              imports.wbg.__wbindgen_is_string = function (arg0) {
                var ret = typeof getObject(arg0) === 'string';
                return ret;
              };

              imports.wbg.__wbg_push_284486ca27c6aa8b = function (arg0, arg1) {
                var ret = getObject(arg0).push(getObject(arg1));
                return ret;
              };

              imports.wbg.__wbg_new_342a24ca698edd87 = function (arg0, arg1) {
                var ret = new Error(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
              };

              imports.wbg.__wbg_set_a46091b120cc63e9 = function (arg0, arg1, arg2) {
                var ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
                return addHeapObject(ret);
              };

              imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
                var ret = debugString(getObject(arg1));
                var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
                var len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
              };

              imports.wbg.__wbindgen_throw = function (arg0, arg1) {
                throw new Error(getStringFromWasm0(arg0, arg1));
              };

              if (typeof input === 'string' || typeof Request === 'function' && input instanceof Request || typeof URL === 'function' && input instanceof URL) {
                input = fetch(input);
              }

              _context2.t0 = load;
              _context2.next = 20;
              return input;

            case 20:
              _context2.t1 = _context2.sent;
              _context2.t2 = imports;
              _context2.next = 24;
              return (0, _context2.t0)(_context2.t1, _context2.t2);

            case 24:
              _yield$load = _context2.sent;
              instance = _yield$load.instance;
              module = _yield$load.module;
              wasm = instance.exports;
              init.__wbindgen_wasm_module = module;
              return _context2.abrupt("return", wasm);

            case 30:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _init.apply(this, arguments);
  }

  var exports$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$1,
    VtWrapper: VtWrapper,
    'default': init
  });

  const base64codes = [62,0,0,0,63,52,53,54,55,56,57,58,59,60,61,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,0,0,0,0,0,0,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];

              function getBase64Code(charCode) {
                  return base64codes[charCode - 43];
              }

              function base64_decode(str) {
                  let missingOctets = str.endsWith("==") ? 2 : str.endsWith("=") ? 1 : 0;
                  let n = str.length;
                  let result = new Uint8Array(3 * (n / 4));
                  let buffer;

                  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
                      buffer =
                          getBase64Code(str.charCodeAt(i)) << 18 |
                          getBase64Code(str.charCodeAt(i + 1)) << 12 |
                          getBase64Code(str.charCodeAt(i + 2)) << 6 |
                          getBase64Code(str.charCodeAt(i + 3));
                      result[j] = buffer >> 16;
                      result[j + 1] = (buffer >> 8) & 0xFF;
                      result[j + 2] = buffer & 0xFF;
                  }

                  return result.subarray(0, result.length - missingOctets);
              }
          

                      const wasm_code = base64_decode("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AkAgAEEkaigCACIERQ0AIARBDGxFDQAgASgCABATCyABIAIpAwg3AgAgAUEIaiADKAIANgIAIABBLGoiARCxAQJAIABBMGooAgAiA0UNACADQQxsRQ0AIAEoAgAQEwsgASACKQMwNwIAIABBADoAkQEgAUEIaiACQThqKAIANgIAIAJBCGogACgCGBBuIABBQGshAQJAIABBxABqKAIAIgNFDQAgA0ECdEUNACABKAIAEBMLIAEgAikDCDcCACABQQhqIAJBCGoiBUEIaiIBKAIANgIAIABBAToAkgEgAEIANwI4IAJBD2oiA0EAOwAAIABBlwFqQQI6AAAgAEECOgCTASACQQA2AAsgAEGYAWogAikACDcAACAAQaABaiABLQAAOgAAIABBADsApQEgAEGAgIAINgChASAAQQA2AkwgACAAKAIcIgRBf2o2AlAgA0EAOwAAIAJBADYACyAAQeEAaiACKQAINwAAIABB6QBqIAEtAAA6AAAgAEHqAGpBgAI7AQAgAEHgAGpBAjoAACAAQdwAakECOgAAIABCADcCVCADQQA7AAAgAkEANgALIABB+QBqIAIpAAg3AAAgAEGBAWogAS0AADoAACAAQYIBakGAAjsBACAAQfgAakECOgAAIABB9ABqQQI6AAAgAEIANwJsIAIgBBCnASABQQA2AgAgAiACKQMANwMIIAUgBBCEASACQcgAaiABKAIANgIAIAIgAikDCDcDQCAAQYQBaiEBIABBiAFqKAIABEAgASgCABATCyABIAIpA0A3AgAgAUEIaiACQcgAaigCADYCAAwCCyADIAFB3IzAABCZAQALIAFBKEcNACAAQQA6AKEBCyACQdAAaiQAC68MAQh/IwBBIGsiAyQAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAEEUaigCAEUEQCABQUBqDjMcBxsKGhkYFwYWFRQTEh8fER8fEA8fHw4NHwwfHx8fHwsKCR8IBwYFBB8fHwMCHx8fHwEfCyAAKAIMIQICQAJAIAFBlH9qDgUBICAgHgALIAFB6ABGDR4MHwsgAigCAEE/Rw0eIAAoAgAhAiADQQhqIAAoAggiARCTASADKAIMIQcgAygCCCACIAFBAXQiCBAsIQIgAQRAIABB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BEAgAUEdai0AACACLQARRg0BDAILIAFBHWotAAAgAi0AEUcNASABQR5qLQAAIAItABJHDQEgAUEfai0AACACLQATRw0BCyABQSBqLQAARSACLQAUQQBHRg0AIAFBIWotAABFIAItABVBAEdGDQAgAUEiai0AAEUgAi0AFkEAR0YNACABQSNqLQAARSACLQAXQQBHRg0AIAFBJGotAABFIAItABhBAEdGDQAgAUElai0AAEUgAi0AGUEAR3MNAQsgAkEwaiIDQRhqIgYgAkEYaigCADYCACADQRBqIgsgAkEQaikDADcDACADQQhqIgwgAkEIaikDADcDACACIAIpAwA3AzAgAigCKCIDIAIoAiRGBEAgAkEgaiADEL8BIAIoAighAwsgAigCICADQRxsaiIEIAIpAzA3AgAgBEEIaiAMKQMANwIAIARBEGogCykDADcCACAEQRhqIAYoAgA2AgAgAiADQQFqNgIoQQRBBBCJAiIDRQ0IIAMgAUEUaigCADYCACACIAkpAgA3AzAgAiAJQQZqKQEANwE2IAggAikDMDcCACAIQQZqIAIpATY3AQAgAiADNgIAIAJCgYCAgBA3AgRBASEDDAELIAFBFGooAgAhASACKAIEIANGBEAgAiADELsBIAIoAgghAwsgAigCACADQQJ0aiABNgIAIAIgAigCCEEBaiIDNgIICyAKIAdBFGoiB0cNAAsMAQsMBAsgAigCJCEFIAIoAighASACQTBqIgNBGGogAkEYaigCADYCACADQRBqIAJBEGopAwA3AwAgA0EIaiACQQhqKQMANwMAIAIgAikDADcDMCABIAVHDQELIAJBIGogARC/ASACKAIoIQELIAIoAiAgAUEcbGoiAyACKQMwNwIAIANBCGogAkEwaiIFQQhqKQMANwIAIANBEGogBUEQaikDADcCACADQRhqIAVBGGooAgA2AgAgAkEoaiABQQFqIgE2AgAgAEEIaiABNgIAIAAgAikDIDcCAAsgAkHQAGokAA8LQQRBBEH4uMAAKAIAIgBB1AAgABsRAQAAC54JAgt/BH4jAEGQAWsiBiQAAkAgAkUNACAARQ0AA0ACQAJAAkAgACACakEYTwRAIAIgACAAIAJLG0ELSQ0DIAAgAkkNASACQXRsIQogAkEMbCEHA0AgASAKaiEFQQAhAyAHQSBPBEBBACEEA0AgBCAFaiIDKQAAIQ4gAykACCEPIAMpABAhECADQRhqIggpAAAhESAIIAEgBGoiCEEYaiIJKQAANwAAIANBEGogCEEQaiILKQAANwAAIANBCGogCEEIaiIMKQAANwAAIAMgCCkAADcAACAJIBE3AAAgCyAQNwAAIAwgDzcAACAIIA43AAAgBEFAayAEQSBqIgMhBCAHTQ0ACwsgByADSwRAIAZBEGoiCCADIAVqIgkgByADayIEECwaIAkgASADaiIBIAQQLBogASAIIAQQLBoLIAUhASAAIAJrIgAgAk8NAAsMAgsgBkEIaiIHQQAgAGsiCEEMbCABaiIDQQhqKAIANgIAIAYgAykCADcDACACQQxsIQogAiIBIQQDQCAEQQxsIANqIQUDQCAGQRhqIgkgBUEIaiILKAIANgIAIAYgBSkCADcDECAHKAIAIQwgBSAGKQMANwIAIAsgDDYCACAHIAkoAgA2AgAgBiAGKQMQNwMAIAQgAE9FBEAgBSAKaiEFIAIgBGohBAwBCwsgBCAIaiIEBEAgBCABIAQgAUkbIQEMAQUgBikDACEOIANBCGogBkEIaiIHKAIANgIAIAMgDjcCACABQQJJDQZBASEEA0AgBEEMbCADaiIIKQIAIQ4gByAIQQhqIgkoAgA2AgAgBiAONwMAIAIgBGohBQNAIAZBGGoiCyAFQQxsIANqIgpBCGoiDCgCADYCACAGIAopAgA3AxAgBygCACENIAogBikDADcCACAMIA02AgAgByALKAIANgIAIAYgBikDEDcDACAFIABJBEAgAiAFaiEFDAELIAUgAGsiBSAERw0ACyAGKQMAIQ4gCSAHKAIANgIAIAggDjcCACABIARBAWoiBEcNAAsMBgsACwALIABBdGwhCCAAQQxsIQdBACAAayEKA0BBACEDIAdBIE8EQCABIAhqIQlBACEEA0AgBCAJaiIFKQAAIQ4gBSkACCEPIAUpABAhECAFQRhqIgMpAAAhESADIAEgBGoiA0EYaiILKQAANwAAIAVBEGogA0EQaiIMKQAANwAAIAVBCGogA0EIaiINKQAANwAAIAUgAykAADcAACALIBE3AAAgDCAQNwAAIA0gDzcAACADIA43AAAgBEFAayAEQSBqIgMhBCAHTQ0ACwsgByADSwRAIAZBEGoiBSAKQQxsIAFqIANqIgkgByADayIEECwaIAkgASADaiIDIAQQLBogAyAFIAQQLBoLIAEgB2ohASACIABrIgIgAE8NAAsLIAJFDQIgAA0BDAILC0EAIABrQQxsIAFqIgQgAkEMbCIFaiEDIAAgAksEQCAGQRBqIgIgASAFECwaIAMgBCAAQQxsEBkgBCACIAUQLBoMAQsgBkEQaiICIAQgAEEMbCIAECwaIAQgASAFEBkgAyACIAAQLBoLIAZBkAFqJAAL2wgBAn8CQAJAAkACQAJAAkACQAJAAkACQAJAQcEAIAEgAUGfAUsbIgJBsH9qIgNBD01BAEEBIAN0QYH+A3EbDQACQAJAAkACQAJAAkACQAJAIAJB8H5qDhALAQEBAQEBAQUCAgwNBAUFAAsgAkFoag4EAQUBAgALIAJBkAFLDQAgAkFwcUGAAUcNBQsgAEEAOgCQAQwGCyAAQQE6AJABIAAQyAEPCyAAQQw6AJABDwsgAEENOgCQAQ8LIAAtAJABRQ0CDAELIAAtAJABDQAgAkEYSQ0BIAJBfHFBHEYNAQsCQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIAAtAJABDg0MCwoHBgUEAwIAFRUBFQsgAkFwcSIDQSBGDRIgA0EwRg0ZIAJBQGpBP08NFAwYCyACQQdHDRMMFgsgAkFwcUEgRg0KIAJBUGpBCkkNBQJAIAJBRmoOAhgGAAsCQCACQXxxQTxHDQAMGAsgAkFAakE+Sw0SDBYLIAJBcHFBIEYNCgJAAkAgAkFQakEKSQ0AIAJBRmoOAhgAAQsgAEEIOgCQAQwFCyACQXxxQTxGDQsgAkFAakE/Tw0RDBULIAJBGEkNDyACQRlGDQ8gAkF8cUEcRg0PIAJBQGpBPksNEAwTCyACQRhJDQ4gAkEZRg0OIAJBfHFBHEYNDiACQXBxIgNBMEYNFiADQSBGDQ0gAkFAakE/Tw0PDBULIAJBF00NDQJAIAJBRmoOAhYCAAsgAkEZRg0NIAJBfHEiA0EcRg0NIAJBcHFBIEYNCSACQVBqQQpJDQEgA0E8Rg0VIAJBQGpBPksNDgwUCyACQRdNDQwCQAJAIAJBRmoOAhYBAAsgAkEZRg0NIAJBfHEiA0EcRg0NIAJBcHFBIEYNCiACQVBqQQpPDQILIABBBDoAkAELIAAgARB5DwsgA0E8Rg0IIAJBQGpBP08NCwwRCyACQRhJDQkgAkEZRg0JIAJBfHFBHEYNCSACQXBxQSBGDQggAkFQakHPAE8NCgwSCyACQRdNDQgCQAJAAkACQAJAIAJBsH9qDhAPAQEBAQEBAQMWFhAWAgMDAAsgAkEZRg0MCyACQXxxQRxGDQsgAkFwcUEgRg0CIAJBUGpBIEkNFCACQa9/akEHSQ0UIAJBoH9qQR9PDQwMFAsgAEEMOgCQAQ8LIABBDToAkAEPCyAAQQI6AJABDAcLIAJBYGpB4ABPDQggACABECIPCyAAQQk6AJABDAULIABBCToAkAEMBAsgAEEIOgCQAQwDCyAAQQU6AJABDAILIABBBToAkAEMAQsgAEEEOgCQAQsgACABEMkBDwsgACABEC0LDwsgAEEHOgCQASAAEMgBDwsgAEEDOgCQASAAEMgBDwsgAEEAOgCQAQ8LIABBCjoAkAEPCyAAQQs6AJABDwsgAEEAOgCQASAAIAEQDw8LIABBBjoAkAEPCyAAQQA6AJABIAAgARAOC/4GAQV/IABBeGoiACgCBEF4cSEBIAAgAWohAgJAAkACQCAAKAIEQQFxDQAgACgCACEDAkAgAC0ABEEDcQRAIAEgA2ohASAAIANrIgBBpLzAACgCAEcNASACKAIEQQNxQQNHDQJBnLzAACABNgIAIAIgAigCBEF+cTYCBCAAIAFBAXI2AgQgACABaiABNgIADwsMAgsgA0GAAk8EQCAAEDgMAQsgAEEMaigCACIEIABBCGooAgAiBUcEQCAFIAQ2AgwgBCAFNgIIDAELQYy5wABBjLnAACgCAEF+IANBA3Z3cTYCAAsCQCACLQAEQQJxQQF2BEAgAiACKAIEQX5xNgIEIAAgAUEBcjYCBCAAIAFqIAE2AgAMAQsCQAJAAkBBqLzAACgCACACRwRAQaS8wAAoAgAgAkcNAUGkvMAAIAA2AgBBnLzAAEGcvMAAKAIAIAFqIgE2AgAgACABQQFyNgIEIAAgAWogATYCAA8LQai8wAAgADYCAEGgvMAAQaC8wAAoAgAgAWoiATYCACAAIAFBAXI2AgRBpLzAACgCACAARg0BDAILIAIoAgRBeHEiAyABaiEBAkAgA0GAAk8EQCACEDgMAQsgAkEMaigCACIEIAJBCGooAgAiAkcEQCACIAQ2AgwgBCACNgIIDAELQYy5wABBjLnAACgCAEF+IANBA3Z3cTYCAAsgACABQQFyNgIEIAAgAWogATYCAEGkvMAAKAIAIABHDQJBnLzAACABNgIADAMLQZy8wABBADYCAEGkvMAAQQA2AgALQcS8wAAoAgAgAU8NAUGovMAAKAIARQ0BQQAhAQJAQaC8wAAoAgBBKE0NAEGovMAAKAIAIQFBtLzAACEAAkADQCAAKAIAIAFNBEAgACgCACAAKAIEaiABSw0CCyAAKAIIIgANAAtBACEAC0EAIQEgACgCDEEBcQ0AIABBDGooAgAaC0EAEDtrDQFBoLzAACgCAEHEvMAAKAIATQ0BQcS8wABBfzYCAA8LIAFBgAJJDQEgACABEDZBzLzAAEHMvMAAKAIAQX9qIgA2AgAgAA0AEDsaDwsPCyABQQN2IgJBA3RBlLnAAGohAQJ/QYy5wAAoAgAiA0EBIAJ0IgJxBEAgASgCCAwBC0GMucAAIAIgA3I2AgAgAQshAiABIAA2AgggAiAANgIMIAAgATYCDCAAIAI2AggLvQgBA38jAEHwAGsiBSQAIAUgAzYCDCAFIAI2AgggBQJ/AkACfwJAAkAgAUGBAk8EQANAIAZBgAJqIAAgBmoiB0GAAmosAABBv39KDQQaIAZB/wFqIAdB/wFqLAAAQb9/Sg0EGiAHQf4BaiwAAEG/f0oNAyAHQf0BaiwAAEG/f0oNAiAGQXxqIgZBgH5HDQALQQAhBgwECyAFIAE2AhQgBSAANgIQIAVBzJ3AADYCGEEADAQLIAZB/QFqDAELIAZB/gFqCyIHIAFJBEAgByEGDAELIAEhBiABIAdGDQAgACABQQAgB0GQpMAAEBQACyAFIAY2AhQgBSAANgIQIAVBoKTAADYCGEEFCzYCHAJAAkACQAJAAkACQAJAIAIgAUsiBg0AIAMgAUsNACACIANLDQEgAkUNAgJAIAIgAU8EQCABIAJHDQEMBAsgACACaiwAAEG/f0oNAwsgBSACNgIgIAIhAwwDCyAFIAIgAyAGGzYCKCAFQTBqIgBBFGpBAzYCACAFQcgAaiIBQRRqQegANgIAIAVB1ABqQegANgIAIAVCAzcCNCAFQcikwAA2AjAgBUHhADYCTCAFIAE2AkAgBSAFQRhqNgJYIAUgBUEQajYCUCAFIAVBKGo2AkggACAEEOcBAAsgBUHkAGpB6AA2AgAgBUHIAGoiAEEUakHoADYCACAFQdQAakHhADYCACAFQTBqIgFBFGpBBDYCACAFQgQ3AjQgBUGEpcAANgIwIAVB4QA2AkwgBSAANgJAIAUgBUEYajYCYCAFIAVBEGo2AlggBSAFQQxqNgJQIAUgBUEIajYCSCABIAQQ5wEACyAFIAM2AiAgA0UNAQsDQAJAIAMgAU8EQCABIANGDQUMAQsgACADaiwAAEG/f0oNAwsgA0F/aiIDDQALC0EAIQMLIAEgA0YNACAAIANqIgAsAAAiAUH/AXEhBgJ/AkACQCABQX9MBEAgAC0AAUE/cSEHIAFBH3EhAiAGQd8BSw0BIAJBBnQgB3IhBgwCCyAFIAY2AiRBAQwCCyAALQACQT9xIAdBBnRyIQYgAUH/AXFB8AFJBEAgAkEMdCAGciEGDAELIAJBEnRBgIDwAHEgAC0AA0E/cSAGQQZ0cnIiBkGAgMQARg0CCyAFIAY2AiRBASAGQYABSQ0AGkECIAZBgBBJDQAaQQNBBCAGQYCABEkbCyEHIAUgAzYCKCAFIAMgB2o2AiwgBUEwaiIAQRRqQQU2AgAgBUHsAGpB6AA2AgAgBUHkAGpB6AA2AgAgBUHIAGoiAUEUakHpADYCACAFQdQAakHqADYCACAFQgU3AjQgBUHYpcAANgIwIAVB4QA2AkwgBSABNgJAIAUgBUEYajYCaCAFIAVBEGo2AmAgBSAFQShqNgJYIAUgBUEkajYCUCAFIAVBIGo2AkggACAEEOcBAAtB2J3AAEErIAQQzQEAC+IGAQZ/IAAoAhAhBAJAAkACQAJAIAAoAggiCEEBRwRAIARBAUYNASAAKAIYIAEgAiAAQRxqKAIAKAIMEQIAIQMMAwsgBEEBRw0BCyABIAJqIQcCQAJAIABBFGooAgAiBkUEQCABIQQMAQsgASEEA0AgBCAHRg0CAn8gBCIDLAAAIgRBf0oEQCADQQFqDAELIANBAmogBEH/AXEiBEHgAUkNABogA0EDaiAEQfABSQ0AGiAEQRJ0QYCA8ABxIAMtAANBP3EgAy0AAkE/cUEGdCADLQABQT9xQQx0cnJyQYCAxABGDQMgA0EEagsiBCAFIANraiEFIAZBf2oiBg0ACwsgBCAHRg0AIAQtAAAiA0HwAU8EQCADQRJ0QYCA8ABxIAQtAANBP3EgBC0AAkE/cUEGdCAELQABQT9xQQx0cnJyQYCAxABGDQELAkACQCAFRQRAQQAhBAwBCyAFIAJPBEBBACEDIAUgAiIERg0BDAILQQAhAyAFIgQgAWosAABBQEgNAQsgBCEFIAEhAwsgBSACIAMbIQIgAyABIAMbIQELIAhBAUYNAAwCCyAAQQxqKAIAIQcCQCACRQRAQQAhBAwBCyACQQNxIQUCQCACQX9qQQNJBEBBACEEIAEhAwwBC0EAIQRBACACQXxxayEGIAEhAwNAIAMsAABBv39KIARqIANBAWosAABBv39KaiADQQJqLAAAQb9/SmogA0EDaiwAAEG/f0pqIQQgA0EEaiEDIAZBBGoiBg0ACwsgBUUNAANAIAMsAABBv39KIARqIQQgA0EBaiEDIAVBf2oiBQ0ACwsgByAESwRAQQAhAyAHIARrIgQhBQJAAkACQEEAIAAtACAiBiAGQQNGG0EDcUEBaw4CAAECC0EAIQUgBCEDDAELIARBAXYhAyAEQQFqQQF2IQULIANBAWohAyAAQRxqKAIAIQQgACgCBCEGIAAoAhghAAJAA0AgA0F/aiIDRQ0BIAAgBiAEKAIQEQAARQ0AC0EBDwtBASEDIAZBgIDEAEYNASAAIAEgAiAEKAIMEQIADQFBACEDA0AgAyAFRgRAQQAPCyADQQFqIQMgACAGIAQoAhARAABFDQALIANBf2ogBUkPCwwBCyADDwsgACgCGCABIAIgAEEcaigCACgCDBECAAvsBgEHf0ErQYCAxAAgACgCACIJQQFxIgUbIQogBCAFaiEHAkAgCUEEcUUEQEEAIQEMAQsCQCACRQ0AIAJBA3EhBgJAIAJBf2pBA0kEQCABIQUMAQtBACACQXxxayELIAEhBQNAIAUsAABBv39KIAhqIAVBAWosAABBv39KaiAFQQJqLAAAQb9/SmogBUEDaiwAAEG/f0pqIQggBUEEaiEFIAtBBGoiCw0ACwsgBkUNAANAIAUsAABBv39KIAhqIQggBUEBaiEFIAZBf2oiBg0ACwsgByAIaiEHC0EBIQUCQAJAIAAoAghBAUcEQCAAIAogASACEMYBDQEMAgsCQAJAAkACQCAAQQxqKAIAIgYgB0sEQCAJQQhxDQRBACEFIAYgB2siCCEHQQEgAC0AICIJIAlBA0YbQQNxQQFrDgIBAgMLIAAgCiABIAIQxgENBAwFC0EAIQcgCCEFDAELIAhBAXYhBSAIQQFqQQF2IQcLIAVBAWohBSAAQRxqKAIAIQkgACgCBCEIIAAoAhghBgJAA0AgBUF/aiIFRQ0BIAYgCCAJKAIQEQAARQ0AC0EBDwtBASEFIAhBgIDEAEYNASAAIAogASACEMYBDQEgACgCGCADIAQgACgCHCgCDBECAA0BIAAoAhwhASAAKAIYIQJBACEFAn8DQCAHIgAgACAFRg0BGiAFQQFqIQUgAiAIIAEoAhARAABFDQALIAVBf2oLIAdJIQUMAQsgACgCBCEIIABBMDYCBCAALQAgIQkgAEEBOgAgIAAgCiABIAIQxgENAEEAIQUgBiAHayIBIQICQAJAAkBBASAALQAgIgcgB0EDRhtBA3FBAWsOAgABAgtBACECIAEhBQwBCyABQQF2IQUgAUEBakEBdiECCyAFQQFqIQUgAEEcaigCACEHIAAoAgQhASAAKAIYIQYCQANAIAVBf2oiBUUNASAGIAEgBygCEBEAAEUNAAtBAQ8LQQEhBSABQYCAxABGDQAgACgCGCADIAQgACgCHCgCDBECAA0AIAAoAhwhAyAAKAIYIQRBACEGAkADQCACIAZGDQEgBkEBaiEGIAQgASADKAIQEQAARQ0ACyAGQX9qIAJJDQELIAAgCToAICAAIAg2AgRBAA8LIAUPCyAAKAIYIAMgBCAAQRxqKAIAKAIMEQIAC68FAQZ/AkACQAJAIAJBCU8EQCADIAIQJCICDQFBAA8LQQAhAkHN/3sgA00NAUEQIANBBGpBCyADSxtBB2pBeHEhBSAAQXhqIgEoAgRBeHEhBiABIAZqIQQCQAJAAkACQAJAAkACQCABLQAEQQNxBEAgBiAFTw0BQai8wAAoAgAgBEYNAkGkvMAAKAIAIARGDQMgBC0ABEECcUEBdg0HIAQoAgRBeHEiByAGaiIIIAVJDQcgCCAFayEGIAdBgAJJDQQgBBA4DAULIAEoAgRBeHEhBCAFQYACSQ0GIAQgBUEEak9BACAEIAVrQYGACEkbDQUgASgCABoMBgsgBiAFayIEQRBJDQQgASAFEOYBIAEgBWoiBSAEEOYBIAUgBBAfDAQLQaC8wAAoAgAgBmoiBCAFTQ0EIAEgBRDmASABIAVqIgYgBCAFayIEQQFyNgIEQaC8wAAgBDYCAEGovMAAIAY2AgAMAwtBnLzAACgCACAGaiIGIAVJDQMCQCAGIAVrIgRBEEkEQCABIAYQ5gFBACEEQQAhBgwBCyABIAVqIgYgBGohByABIAUQ5gEgBiAEQQFyNgIEIAQgBmogBDYCACAHIAcoAgRBfnE2AgQLQaS8wAAgBjYCAEGcvMAAIAQ2AgAMAgsgBEEMaigCACIJIARBCGooAgAiBEcEQCAEIAk2AgwgCSAENgIIDAELQYy5wABBjLnAACgCAEF+IAdBA3Z3cTYCAAsgBkEQTwRAIAEgBRDmASABIAVqIgQgBhDmASAEIAYQHwwBCyABIAgQ5gELIAENAwsgAxANIgRFDQEgBCAAIAMgASgCBEF4cUF8QXggAS0ABEEDcRtqIgEgASADSxsQLCAAEBMPCyACIAAgAyABIAEgA0sbECwaIAAQEwsgAg8LIAEtAAQaIAFBCGoL5wUBCX8CQAJAIAIEQCAAKAIEIQcgACgCACEIIAAoAgghCgNAAkAgCi0AAEUNACAIQYSfwABBBCAHKAIMEQIARQ0AQQEPC0EAIQUgAiEEAkACQANAAkAgASAFaiEGAkACQAJAAkAgBEEITwRAIAZBA2pBfHEgBmsiAEUEQCAEQXhqIQNBACEADAMLIAQgACAAIARLGyEAQQAhAwNAIAMgBmotAABBCkYNBSAAIANBAWoiA0cNAAsMAQsgBEUNBEEAIQMgBi0AAEEKRg0DQQAhACAEQQFGDQZBASEDIAYtAAFBCkYNAyAEQQJGDQZBAiEDIAYtAAJBCkYNAyAEQQNGDQZBAyEDIAYtAANBCkYNAyAEQQRGDQZBBCEDIAYtAARBCkYNAyAEQQVGDQZBBSEDIAYtAAVBCkYNAyAEQQZGDQZBBiEDIAYtAAZBCkcNBgwDCyAAIARBeGoiA0sNAQsDQCAAIAZqIgkoAgAiC0F/cyALQYqUqNAAc0H//ft3anEgCUEEaigCACIJQX9zIAlBipSo0ABzQf/9+3dqcXJBgIGChHhxRQRAIABBCGoiACADTQ0BCwsgACAETQ0AIAAgBEGYosAAEJoBAAsgACAERg0BIAQgAGshBCAAIAVqIAFqIQZBACEDA0AgAyAGai0AAEEKRwRAIANBAWoiAyAERw0BDAMLCyAAIANqIQMLAkAgAyAFaiIAQQFqIgUgAEkNACACIAVJDQAgACABai0AAEEKRw0AQQEhAAwECyACIAVrIQQgAiAFTw0BCwtBACEACyACIQULIAogADoAAAJAIAIgBU0EQCACIAVHDQQgCCABIAUgBygCDBECAEUNAUEBDwsgASAFaiIALAAAQb9/TA0DIAggASAFIAcoAgwRAgAEQEEBDwsgACwAAEG/f0wNBAsgASAFaiEBIAIgBWsiAg0ACwtBAA8LIAEgAkEAIAVBqJ/AABAUAAsgASACIAUgAkG4n8AAEBQAC5QFAQZ/AkACfwJAIAAgAWsgAkkEQCAAIAJqIQMgASACaiIFIAJBD00NAhogA0F8cSEAQQAgA0EDcSIGayEHIAYEQCABIAJqQX9qIQQDQCADQX9qIgMgBC0AADoAACAEQX9qIQQgACADSQ0ACwsgACACIAZrIgZBfHEiAmshA0EAIAJrIQIgBSAHaiIFQQNxBEAgAkF/Sg0CIAVBA3QiAUEYcSEHQQAgAWtBGHEhCCAFQXxxIgRBfGohASAEKAIAIQQDQCAAQXxqIgAgBCAIdCABKAIAIgQgB3ZyNgIAIAFBfGohASAAIANLDQALDAILIAJBf0oNASABIAZqQXxqIQEDQCAAQXxqIgAgASgCADYCACABQXxqIQEgACADSw0ACwwBCwJAIAJBD00EQCAAIQMMAQtBACAAa0EDcSIFIABqIQQgBQRAIAAhAyABIQADQCADIAAtAAA6AAAgAEEBaiEAIANBAWoiAyAESQ0ACwsgAiAFayICQXxxIgYgBGohAwJAIAEgBWoiBUEDcQRAIAZBAUgNASAFQQN0IgBBGHEhB0EAIABrQRhxIQggBUF8cSIAQQRqIQEgACgCACEAA0AgBCAAIAd2IAEoAgAiACAIdHI2AgAgAUEEaiEBIARBBGoiBCADSQ0ACwwBCyAGQQFIDQAgBSEBA0AgBCABKAIANgIAIAFBBGohASAEQQRqIgQgA0kNAAsLIAJBA3EhAiAFIAZqIQELIAJBAUgNAiACIANqIQADQCADIAEtAAA6AAAgAUEBaiEBIANBAWoiAyAASQ0ACwwCCyAGQQNxIgBFDQEgAyAAayEAIAIgBWoLQX9qIQEDQCADQX9qIgMgAS0AADoAACABQX9qIQEgACADSQ0ACwsL1wYBCH8jAEEQayEFAkAgACgCCCIBRQ0AIABBmAFqIQYgACgCACEDIAVBCmoiB0EEaiEIA0ACfwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAy8BACICDhwAAQwCAwQMBQwGDAwMDAwMDAwMDAwHBwgJCgwLDAsgB0EANgAAIAhBADsAACAAQQI6AJcBIABBAjoAkwEgBiAFKQAHNwAAIAZBCGogBUEPai0AADoAAAwMCyAAQQE6AJsBDAsLIABBAToAnAEMCgsgAEEBOgCdAQwJCyAAQQE6AJ8BDAgLIABBAToAoAEMBwsgAEEBOgCeAQwGCyAAQQA6AJsBDAULIABBADoAnAEMBAsgAEEAOgCdAQwDCyAAQQA6AJ8BDAILIABBADoAoAEMAQsCQAJAAkACQAJAAkACQAJAAkAgAkFiaiIEQf//A3FBCE8EQCACQVpqDgIBAgMLIABBADoAkwEgACAEOgCUAQwJCyABQQFLDQIMCwsgAEECOgCTAQwHCwJAAkACQCACQfj/A3FBKEcEQCACQVBqDgIDAQILIABBADoAlwEgACACQVhqOgCYAQwJCyAAQQI6AJcBDAgLIAJBpn9qQf//A3FBCEkNAiACQZx/akH//wNxQQhPDQcgAEEAOgCXASAAIAJBpH9qOgCYAQwHCyABQQFNDQkCQAJAAkAgA0ECaiICLwEAQX5qDgQCAAABAAsgAUF/aiEBIAIMCQsgAUEDSQ0KIAAgAy0ABDoAmAEgAEEAOgCXAQwGCyABQQRLDQMMAgsCQAJAAkAgA0ECaiICLwEAQX5qDgQCAAABAAsgAUF/aiEBIAIMCAsgAUEDSQ0JIAAgAy0ABDoAlAEgAEEAOgCTAQwFCyABQQRNDQEgAy0ABCECIAMtAAYhBCAAIAMtAAg6AJYBIAAgBDoAlQEgACACOgCUASAAQQE6AJMBDAMLIABBADoAkwEgACACQa5/ajoAlAEMBAsgAUF+aiEBIANBBGoMBAsgAy0ABCECIAMtAAYhBCAAIAMtAAg6AJoBIAAgBDoAmQEgACACOgCYASAAQQE6AJcBCyABQXtqIQEgA0EKagwCCyABQX1qIQEgA0EGagwBCyABQX9qIQEgA0ECagshAyABDQALCwvMBQEJfyMAQYABayIDJAAgAS0AACIEQQJGIQUgA0HoAGogAiABLQANIgYgAS0ADCIHIAEtAAsiCCABLQAKIgkgAS0ACSIKIAEtAAgiCyAEQQJHQQFBAiAFGyABLQAEIgRBAkYbampqampqEMMBIAMoAmwhAgJ/AkACQAJ/AkACQAJAAkAgAygCaEEBRwRAIANB3ABqIANB+ABqKQMANwIAIAMgA0HwAGopAwA3AlQgAyACNgJQIAVFBEAgAyABKAAANgJoIANByABqIANB0ABqQc6BwAAgA0HoAGoQrAEgAygCSA0CCyAEQQJHBEAgAyABKAAENgJoIANBQGsgA0HQAGpB0IHAACADQegAahCsASADKAJADQMLIAsNAwwECwwFCyADKAJMDAMLIAMoAkQMAgsgA0E4aiADQdAAakHSgcAAQQQQqwEgAygCOEUNACADKAI8DAELAkAgCkUNACADQTBqIANB0ABqQdeBwABBBhCrASADKAIwRQ0AIAMoAjQMAQsCQCAJRQ0AIANBKGogA0HQAGpB3YHAAEEJEKsBIAMoAihFDQAgAygCLAwBCwJAIAhFDQAgA0EgaiADQdAAakHmgcAAQQ0QqwEgAygCIEUNACADKAIkDAELAkAgB0UNACADQRhqIANB0ABqQfOBwABBBRCrASADKAIYRQ0AIAMoAhwMAQsgBkUNAiADQRBqIANB0ABqQfiBwABBBxCrASADKAIQRQ0CIAMoAhQLIQIgA0HYAGooAgAiAUEkTwRAIAEQAAsgAygCXEUNACADQeAAaigCACIBQSRJDQAgARAAC0EBDAELIANB6ABqIgFBEGogA0HQAGoiAkEQaigCADYCACABQQhqIAJBCGopAwA3AwAgAyADKQNQNwNoIANBCGogARDSASADKAIMIQIgAygCCAshASAAIAI2AgQgACABNgIAIANBgAFqJAAL9gUBAX8jAEEQayICJAAgAiABrUKAgICAEEIAIAEoAhhBjJDAAEECIAFBHGooAgAoAgwRAgAbhDcDACACIABBkAFqNgIMIAJBjpDAAEEFIAJBDGoiAUGUkMAAECcgAiAANgIMIAJBpJDAAEEGIAFBrJDAABAnIAIgAEEMajYCDCACQbyQwABBDSABQaSPwAAQJyACIABBGGo2AgwgAkHJkMAAQQcgAUHYj8AAECcgAiAAQRxqNgIMIAJB0JDAAEEEIAFB2I/AABAnIAIgAEEgajYCDCACQdSQwABBBiABQdyQwAAQJyACIABBLGo2AgwgAkHskMAAQRAgAUHckMAAECcgAiAAQZEBajYCDCACQfyQwABBEiABQZCRwAAQJyACIABBOGo2AgwgAkHQj8AAQQggAUHYj8AAECcgAiAAQTxqNgIMIAJB6I/AAEEIIAFB2I/AABAnIAIgAEGSAWo2AgwgAkGgkcAAQQ4gAUHIjsAAECcgAiAAQZMBajYCDCACQfCPwABBAyABQZSPwAAQJyACIABBoQFqNgIMIAJBrpHAAEEHIAFBuJHAABAnIAIgAEFAazYCDCACQciRwABBBCABQcyRwAAQJyACIABBogFqNgIMIAJB3JHAAEELIAFByI7AABAnIAIgAEGjAWo2AgwgAkHzj8AAQQsgAUHIjsAAECcgAiAAQaQBajYCDCACQf6PwABBDiABQciOwAAQJyACIABBpQFqNgIMIAJB55HAAEENIAFByI7AABAnIAIgAEGmAWo2AgwgAkH0kcAAQRAgAUHIjsAAECcgAiAAQcwAajYCDCACQYSSwABBCiABQdiPwAAQJyACIABB0ABqNgIMIAJBjpLAAEENIAFB2I/AABAnIAIgAEHUAGo2AgwgAkGbksAAQQkgAUGkksAAECcgAiAAQewAajYCDCACQbSSwABBEyABQaSSwAAQJyACIABBhAFqNgIMIAJBx5LAAEEOIAFB2JLAABAnIAIQjgEgAkEQaiQAC/oEAQp/IwBBMGsiAyQAIANBJGogATYCACADQQM6ACggA0KAgICAgAQ3AwggAyAANgIgIANBADYCGCADQQA2AhACQAJAAkAgAigCCCIKRQRAIAJBFGooAgAiBEUNASACKAIAIQEgAigCECEAIARBA3RBeGpBA3ZBAWoiByEEA0AgAUEEaigCACIFBEAgAygCICABKAIAIAUgAygCJCgCDBECAA0ECyAAKAIAIANBCGogAEEEaigCABEAAA0DIABBCGohACABQQhqIQEgBEF/aiIEDQALDAELIAJBDGooAgAiAEUNACAAQQV0IgtBYGpBBXZBAWohByACKAIAIQEDQCABQQRqKAIAIgAEQCADKAIgIAEoAgAgACADKAIkKAIMEQIADQMLIAMgBCAKaiIFQRxqLQAAOgAoIAMgBUEEaikCAEIgiTcDCCAFQRhqKAIAIQYgAigCECEIQQAhCUEAIQACQAJAAkAgBUEUaigCAEEBaw4CAAIBCyAGQQN0IAhqIgwoAgRB5gBHDQEgDCgCACgCACEGC0EBIQALIAMgBjYCFCADIAA2AhAgBUEQaigCACEAAkACQAJAIAVBDGooAgBBAWsOAgACAQsgAEEDdCAIaiIGKAIEQeYARw0BIAYoAgAoAgAhAAtBASEJCyADIAA2AhwgAyAJNgIYIAUoAgBBA3QgCGoiACgCACADQQhqIAAoAgQRAAANAiABQQhqIQEgCyAEQSBqIgRHDQALC0EAIQAgByACKAIESSIBRQ0BIAMoAiAgAigCACAHQQN0akEAIAEbIgEoAgAgASgCBCADKAIkKAIMEQIARQ0BC0EBIQALIANBMGokACAAC/oEAQl/IwBBgAFrIgMkACADQQhqIgQgASACEEwgA0EYaiIHIAQQWCADQTBqIgggBEEIaigCADYCACADIAMpAwg3AyggA0E4aiIJIAEQbiADQccAaiIKQQdqQQA7AAAgA0EANgBKIANB8ABqIgZBB2oiBUEAOwAAIANB2ABqIgsgBkEIaiIELQAAOgAAIANBADYAcyADIAMpAHA3A1AgBUEAOwAAIANB6ABqIgUgBC0AADoAACADQQA2AHMgAyADKQBwNwNgIAMgAhCnASAEQQA2AgAgAyADKQMANwNwIAYgAhCEASAAQYwBaiAEKAIANgIAIAAgAykDcDcChAEgACACNgIcIAAgATYCGCAAQRBqQgA3AgAgAEHoksAAKAIANgIMIABCADcCBCAAQfCSwAAoAgA2AgAgAEGAgIQQNgKQASAAIAMpAyg3AiAgAEEoaiAIKAIANgIAIAAgAykDGDcCLCAAQTRqIAdBCGooAgA2AgAgAEGXAWpBAjoAACAAQgA3AjggAEEAOgChASAAQYCABDYBogEgAEEAOgCmASAAQQA2AkwgACACQX9qNgJQIABCADcCVCAAQeAAakECOgAAIABB3ABqQQI6AAAgAEGYAWogAykARzcAACAAQaABaiAKQQhqLQAAOgAAIAAgAykDODcCQCAAQcgAaiAJQQhqKAIANgIAIABB6QBqIAstAAA6AAAgAEHhAGogAykDUDcAACAAQfgAakECOgAAIABB9ABqQQI6AAAgAEIANwJsIABB6gBqQYACOwEAIABBgQFqIAUtAAA6AAAgAEH5AGogAykDYDcAACAAQYIBakGAAjsBACADQYABaiQAC6EFAQR/IAAgAWohAgJAAkACQCAAKAIEQQFxDQAgACgCACEDAkAgAC0ABEEDcQRAIAEgA2ohASAAIANrIgBBpLzAACgCAEcNASAC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ACgCACADaiABOgAADAELIAJBADYCDAJ/IAFBgBBPBEAgAUGAgARPBEAgAiABQT9xQYABcjoADyACIAFBEnZB8AFyOgAMIAIgAUEGdkE/cUGAAXI6AA4gAiABQQx2QT9xQYABcjoADUEEDAILIAIgAUE/cUGAAXI6AA4gAiABQQx2QeABcjoADCACIAFBBnZBP3FBgAFyOgANQQMMAQsgAiABQT9xQYABcjoADSACIAFBBnZBwAFyOgAMQQILIQEgAEEEaigCACAAQQhqIgQoAgAiA2sgAUkEQCAAIAMgARBWIAQoAgAhAwsgACgCACADaiACQQxqIAEQLBogBCABIANqNgIACyACQRBqJABBAAvSAgEFfyMAQUBqIgMkACADQRBqIAAoAhgiBBCNASADQQA2AiAgAyADKQMQNwMYIANBMmogAEGZAWopAAA3AQAgA0EgNgIoIAMgACkAkwE3AiwgA0EYaiAEIANBKGoQVQJAIAIgAU8EQCAAQShqKAIAIgQgAkkNASABIAJHBEAgAkEMbCABQQxsIgJrIQEgACgCICACaiECA0AgAygCGCEAIANBCGogAygCICIEEI0BIAMoAgwhBSADKAIIIAAgBEEUbBAsIQYCQCACIgBBBGoiBygCACICRQ0AIAJBFGxFDQAgACgCABATCyAAQQxqIQIgACAGNgIAIABBCGogBDYCACAHIAU2AgAgAUF0aiIBDQALCwJAIAMoAhwiAEUNACAAQRRsRQ0AIAMoAhgQEwsgA0FAayQADwsgASACQYiMwAAQnAEACyACIARBiIzAABCbAQALzwIBA38jAEEQayICJAACQCABQf8ATQRAIAAoAggiAyAAQQRqKAIARgRAIAAgAxBXIAAoAgghAwsgACADQQFqNgIIIAAoAgAgA2ogAToAAAwBCyACQQA2AgwCfyABQYAQTwRAIAFBgIAESQRAIAIgAUE/cUGAAXI6AA4gAiABQQx2QeABcjoADCACIAFBBnZBP3FBgAFyOgANQQMMAgsgAiABQT9xQYABcjoADyACIAFBEnZB8AFyOgAMIAIgAUEGdkE/cUGAAXI6AA4gAiABQQx2QT9xQYABcjoADUEEDAELIAIgAUE/cUGAAXI6AA0gAiABQQZ2QcABcjoADEECCyEBIABBBGooAgAgAEEIaiIEKAIAIgNrIAFJBEAgACAD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AkEIaiAFEOUBIAAgAikDCDcDACACQdAAaiQADwsQowIACxCkAgAL5QECBn8BfiMAQdAAayIDJAAgA0E/akEAOwAAIANBMGoiBiADQThqIgRBCGoiBS0AADoAACADQQA2ADsgAyADKQA4NwMoIANBEGogARCNASADQRhqIgdBCGoiCEEANgIAIAMgAykDEDcDGCAFQQI6AAAgA0HBAGogAykDKDcAACADQckAaiAGLQAAOgAAIANBAjoAPCADQSA2AjggByABIAQQVSADQQhqIAIQjAEgAykDCCEJIABBADYCCCAAIAk3AgAgBSAIKAIANgIAIAMgAykDGDcDOCAAIAIgBBBAIANB0ABqJAAL3AEBBX8jAEEgayIDJAACQCACQQFqIgQgAk8EQCABKAIEIgVBAXQiAiAEIAIgBEsbIgRBBCAEQQRLGyIEIARqIgYgBE9BAXQhBwJAIAUEQCADQRhqQQI2AgAgAyACNgIUIAMgASgCADYCEAwBCyADQQA2AhALIAMgBiAHIANBEGoQZEEBIQIgAygCAEEBRwRAIAMoAgQhAiABIAQ2AgQgASACNgIAQQAhAgwCCyAAIAMpAgQ3AgQMAQsgACAENgIEIABBCGpBADYCAEEBIQILIAAgAjYCACADQSBqJAAL6wEBBX8gACgCOCIBIAAoAhgiBE8EQCAAQQA6AKYBIAAgBEF/aiIBNgI4CwJAAkAgAEEoaigCACICIAAoAjwiA0sEQCAAKAIgIANBDGxqIgUoAggiAiABSQ0BIAUoAgAgAUEUbGogAiABayAEIAFrIgEgACgCAEGYjMAAIAAoAggbLwEAIgJBASACGyICIAEgAkkbIgEQ4wEgACAEIAFrIAQQWiAAQYwBaigCACIBIANNDQIgACgChAEgA2pBAToAAA8LIAMgAkG4i8AAEJkBAAsgASACQbiLwAAQmgEACyADIAFB3IzAABCZAQAL5QEBBn8jAEEwayICJAAgASgCACEDIAEoAgQhBAJAAkADQCADIARGDQEgASADQQFqIgU2AgAgASABKAIIIgZBAWo2AgggAy0AACAFIQNFDQALIAJBCGoQkQEgAigCDCEDIAIoAggiBSAGNgIAIAJBEGoiBEEIaiIGQQE2AgAgAiADNgIUIAIgBTYCECACQSBqIgNBCGogAUEIaigCADYCACACIAEpAgA3AyAgBCADEH4gAEEIaiAGKAIANgIAIAAgAikDEDcCAAwBCyAAQgA3AgQgAEGslMAAKAIANgIACyACQTBqJAAL+wEBBH8jAEEwayIDJAAgAigCACEEIAIoAgghBRAEIQYgA0EgaiICIAE2AgQgAkEANgIAIAJBCGogBjYCAAJ/AkACQCADKAIgQQFHBEAgAyADKQIkNwMYIAVBHGwhAgNAIAJFDQMgAkFkaiECIAMgBDYCICAEQRxqIQQgA0EQaiADQRhqIANBIGoQhQEgAygCEEUNAAsgAygCFCEEIAMoAhwiAUEkSQ0BIAEQAAwBCyADKAIkIQQLQQEMAQsgAygCGBogA0EIaiIBIAMoAhw2AgQgAUEANgIAIAMoAgwhBCADKAIICyEBIAAgBDYCBCAAIAE2AgAgA0EwaiQAC8wBAQF/IwBBMGsiBCQAAkAgAQRAIAEoAgANASABQX82AgAgBCADNgIoIAQgAzYCJCAEIAI2AiAgBEEIaiAEQSBqEOUBIARBEGogAUEEaiAEKAIIIgIgBCgCDCIDEDUgAwRAIAIQEwsgAUEANgIAIARBKGogBEEYaigCACIBNgIAIAQgBCkDEDcDICAEKAIkIAFLBEAgBEEgaiABEMIBIAQoAighAQsgBCgCICECIAAgATYCBCAAIAI2AgAgBEEwaiQADwsQowIACxCkAgALzwEBAn8jAEEgayIEJAACQCACIANqIgMgAk8EQCABKAIEIgJBAXQiBSADIAUgA0sbIgNBCCADQQhLGyEDAkAgAgRAIARBGGpBATYCACAEIAI2AhQgBCABKAIANgIQDAELIARBADYCEAtBASECIAQgA0EBIARBEGoQZCAEKAIAQQFHBEAgBCgCBCECIAEgAzYCBCABIAI2AgBBACECDAILIAAgBCkCBDcCBAwBCyAAIAM2AgQgAEEIakEANgIAQQEhAgsgACACNgIAIARBIGokAAuLAgEDfyMAQSBrIgQkAEEBIQVBiLnAAEGIucAAKAIAIgZBAWo2AgACQEHQvMAAKAIAQQFGBEBB1LzAACgCAEEBaiEFDAELQdC8wABBATYCAAtB1LzAACAFNgIAAkACQCAGQQBIDQAgBUECSw0AIAQgAzYCHCAEIAI2AhhB/LjAACgCACICQX9MDQBB/LjAACACQQFqIgI2AgBB/LjAAEGEucAAKAIAIgMEf0GAucAAKAIAIARBCGogACABKAIQEQEAIAQgBCkDCDcDECAEQRBqIAMoAhQRAQBB/LjAACgCAAUgAgtBf2o2AgAgBUEBTQ0BCwALIwBBEGsiAiQAIAIgATYCDCACIAA2AggAC9MBAQF/IwBBMGsiAyQAIANBIGogARD2AQJ/AkACQAJ/AkAgAygCIEEBRwRAIAMgAykCJDcDGCADQRBqIANBGGogAhCGASADKAIQRQ0BIAMoAhQMAgsgAygCJCECDAMLIANBCGogA0EYaiACQQRqEIYBIAMoAghFDQEgAygCDAshAiADKAIcIgFBJEkNASABEAAMAQsgAygCGBogAyADKAIcNgIEIANBADYCACADKAIEIQIgAygCAAwBC0EBCyEBIAAgAjYCBCAAIAE2AgAgA0EwaiQAC8YBAQN/IAAoAgQgACgCCCIDayABSQRAIAAgAyABELoBIAAoAgghAwsgACgCACADQRRsaiEEIAFBAk8EQCABQX9qIQUDQCAEIAIpAgA3AgAgBEEQaiACQRBqKAIANgIAIARBCGogAkEIaikCADcCACAEQRRqIQQgBUF/aiIFDQALIAEgA2pBf2ohAwsgACABBH8gBCACKQIANwIAIARBEGogAkEQaigCADYCACAEQQhqIAJBCGopAgA3AgAgA0EBagUgAws2AggLzQEBAn8jAEEgayIDJAACQCABIAJqIgIgAUkNACAAQQRqKAIAIgFBAXQiBCACIAQgAksbIgJBCCACQQhLGyECAkAgAQRAIANBGGpBATYCACADIAE2AhQgAyAAKAIANgIQDAELIANBADYCEAsgAyACIANBEGoQZyADKAIAQQFGBEAgA0EIaigCACIARQ0BIAMoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyADKAIEIQEgAEEEaiACNgIAIAAgATYCACADQSBqJAAPCxCQAgALzQEBA38jAEEgayICJAACQCABQQFqIgMgAUkNACAAQQRqKAIAIgFBAXQiBCADIAQgA0sbIgNBCCADQQhLGyEDAkAgAQRAIAJBGGpBATYCACACIAE2AhQgAiAAKAIANgIQDAELIAJBADYCEAsgAiADIAJBEGoQZyACKAIAQQFGBEAgAkEIaigCACIARQ0BIAIoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyACKAIEIQEgAEEEaiAD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QQhqIAE2AgALqQEBBH8CQAJAIAAoAjgiAgRAIABBKGooAgAiAyAAKAI8IgFNDQEgACgCICABQQxsaiIDKAIIIgQgAkF/aiIBTQ0CIAAoAgBBmIzAACAAKAIIGy8BACICQQEgAhshAiADKAIAIAFBFGxqKAIAIQNBACEBA0AgACADECIgAUEBaiIBQf//A3EgAkkNAAsLDwsgASADQciLwAAQmQEACyABIARByIvAABCZAQALoQEBAn8jAEEQayICJAAgAEEBaiEDAkAgAC0AAEEBRwRAIAIgAUGUjsAAQQcQ4gEgAiADNgIMIAIgAkEMakGEjsAAEDcMAQsgAiABQf+NwABBAxDiASACIAM2AgwgAiACQQxqIgFBhI7AABA3IAIgAEECajYCDCACIAFBhI7AABA3IAIgAEEDajYCDCACIAFBhI7AABA3CyACEHYgAkEQaiQAC5QBAQJ/AkACQAJAAkACf0EBIQMCQAJAIAFBAE4EQCACKAIAIgRFDQEgAigCBCICDQQgAQ0CQQEMAwtBACEBDAYLIAENAEEBDAELIAFBARCJAgsiAkUNAQwCCyAEIAJBASABEP0BIgINAQsgACABNgIEQQEhAQwBCyAAIAI2AgRBACEDCyAAIAM2AgAgAEEIaiABNgIAC5UBAQN/IwBBgAFrIgMkACAALwEAIQJBACEAA0AgACADakH/AGogAkEPcSIEQTBB1wAgBEEKSRtqOgAAIABBf2ohACACQf//A3EiBEEEdiECIARBD0sNAAsgAEGAAWoiAkGBAU8EQCACQYABQfifwAAQmgEACyABQYigwABBAiAAIANqQYABakEAIABrEBYgA0GAAWokAAuUAQEDfyMAQYABayIDJAAgAC0AACECQQAhAANAIAAgA2pB/wBqIAJBD3EiBEEwQdcAIARBCkkbajoAACAAQX9qIQAgAkH/AXEiBEEEdiECIARBD0sNAAsgAEGAAWoiAkGBAU8EQCACQYABQfifwAAQmgEACyABQYigwABBAiAAIANqQYABakEAIABrEBYgA0GAAWokAAuTAQEDfyMAQYABayIDJAAgAC0AACECQQAhAANAIAAgA2pB/wBqIAJBD3EiBEEwQTcgBEEKSRtqOgAAIABBf2ohACACQf8BcSIEQQR2IQIgBEEPSw0ACyAAQYABaiICQYEBTwRAIAJBgAFB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aiIAQQdqQXhxIABrIgJqIQBBoLzAACABIAJrIgE2AgBBqLzAACAANgIAIAAgAUEBcjYCBCAAIAFqQSg2AgRBxLzAAEGAgIABNgIAC28BBH8jAEEgayICJABBASEDAkAgACABEC8NACABQRxqKAIAIQQgASgCGCACQRxqQQA2AgAgAkHMncAANgIYIAJCATcCDCACQdCdwAA2AgggBCACQQhqEB0NACAAQQRqIAEQLyEDCyACQSBqJAAgAwtxAQJ/IAAoAhggACgCOCIBayECIAAgASABIAIgACgCAEGYjMAAIAAoAggbLwEAIgFBASABGyIBIAIgAUkbahBaIABBjAFqKAIAIgIgACgCPCIBTQRAIAEgAkHcjMAAEJkBAAsgACgChAEgAWpBAToAAAtyAQF/IwBBMGsiAiQAIAIgATYCBCACIAA2AgAgAkEcakECNgIAIAJBLGpB4QA2AgAgAkIDNwIMIAJB0JzAADYCCCACQeEANgIkIAIgAkEgajYCGCACIAJBBGo2AiggAiACNgIgIAJBCGpB6JzAABDnAQALcgEBfyMAQTBrIgIkACACIAE2AgQgAiAANgIAIAJBHGpBAjYCACACQSxqQeEANgIAIAJCAzcCDCACQYydwAA2AgggAkHhADYCJCACIAJBIGo2AhggAiACQQRqNgIoIAIgAjYCICACQQhqQeiLwAAQ5wEAC28BAX8jAEEwayIDJAAgAyABNgIEIAMgADYCACADQRxqQQI2AgAgA0EsakHhADYCACADQgI3AgwgA0HInsAANgIIIANB4QA2AiQgAyADQSBqNgIYIAMgAzYCKCADIANBBGo2AiAgA0EIaiACEOcBAAtvAQF/IwBBMGsiAyQAIAMgATYCBCADIAA2AgAgA0EcakECNgIAIANBLGpB4QA2AgAgA0ICNwIMIANB3KLAADYCCCADQeEANgIkIAMgA0EgajYCGCADIANBBGo2AiggAyADNgIgIANBCGogAhDnAQALbwEBfyMAQTBrIgMkACADIAE2AgQgAyAANgIAIANBHGpBAjYCACADQSxqQeEANgIAIANCAjcCDCADQfyiwAA2AgggA0HhADYCJCADIANBIGo2AhggAyADQQRqNgIoIAMgAzYCICADQQhqIAIQ5wEAC28BAX8jAEEwayIDJAAgAyABNgIEIAMgADYCACADQRxqQQI2AgAgA0EsakHhADYCACADQgI3AgwgA0Gwo8AANgIIIANB4QA2AiQgAyADQSBqNgIYIAMgA0EEajYCKCADIAM2AiAgA0EIaiACEOcBAAtYAQN/IwBBIGsiAiQAIAFBHGooAgAhAyABKAIYIAJBCGoiAUEQaiAAQRBqKQIANwMAIAFBCGogAEEIaikCADcDACACIAApAgA3AwggAyABEB0gAkEgaiQAC1gBA38jAEEgayICJAAgAEEcaigCACEDIAAoAhggAkEIaiIAQRBqIAFBEGopAgA3AwAgAEEIaiABQQhqKQIANwMAIAIgASkCADcDCCADIAAQHSACQSBqJAALWQECfyAAKAIIIgMgAU8EQCADIAAoAgRGBEAgACADELsBCyAAKAIAIAFBAnRqIgRBBGogBCADIAFrQQJ0EBkgACADQQFqNgIIIAQgAjYCAA8LIAEgAxCXAQALWwEBfyMAQSBrIgIkACACIAAoAgA2AgQgAkEIaiIAQRBqIAFBEGopAgA3AwAgAEEIaiABQQhqKQIANwMAIAIgASkCADcDCCACQQRqQeyYwAAgABAdIAJBIGokAAtbAQF/IwBBIGsiAiQAIAIgACgCADYCBCACQQhqIgBBEGogAUEQaikCADcDACAAQQhqIAFBCGopAgA3AwAgAiABKQIANwMIIAJBBGpBvJrAACAAEB0gAkEgaiQAC1sBAX8jAEEgayICJAAgAiAAKAIANgIEIAJBCGoiAEEQaiABQRBqKQIANwMAIABBCGogAUEIaikCADcDACACIAEpAgA3AwggAkEEakG0ncAAIAAQHSACQSBqJAALWwEBfyMAQSBrIgIkACACIAAoAgA2AgQgAkEIaiIAQRBqIAFBEGopAgA3AwAgAEEIaiABQQhqKQIANwMAIAIgASkCADcDCCACQQRqQdShwAAgABAdIAJBIGokAAtYAQF/IwBBIGsiAiQAIAIgADYCBCACQQhqIgBBEGogAUEQaikCADcDACAAQQhqIAFBCGopAgA3AwAgAiABKQIANwMIIAJBBGpB7JjAACAAEB0gAkEgaiQAC1gBAX8jAEEgayICJAAgAiAANgIEIAJBCGoiAEEQaiABQRBqKQIANwMAIABBCGogAUEIaikCADcDACACIAEpAgA3AwggAkEEakHUocAAIAAQHSACQSBqJAALnwEBAX8jAEEQayIDJAAgAyACrUKAgICAEEIAIAIoAhhB25/AAEEBIAJBHGooAgAoAgwRAgAbhDcDACABBEAgAUEUbCEBA0AgAyAANgIMIAMgA0EMakGIlsAAEJQCIABBFGohACABQWxqIgENAAsLIAMtAAQEf0EBBSADKAIAIgAoAhhB3J/AAEEBIABBHGooAgAoAgwRAgALIANBEGokAAtQAQF/AkACQCABQQBOBEAgAUUNASABQQEQiQIiAg0CIAFBAUH4uMAAKAIAIgBB1AAgABsRAQAACxCQAgALQQEhAgsgACABNgIEIAAgAjYCAAufAQEBfyMAQRBrIgMkACADIAKtQoCAgIAQQgAgAigCGEHbn8AAQQEgAkEcaigCACgCDBECABuENwMAIAEEQCABQQJ0IQEDQCADIAA2AgwgAyADQQxqQZiWwAAQlAIgAEEEaiEAIAFBfGoiAQ0ACwsgAy0ABAR/QQEFIAMoAgAiACgCGEHcn8AAQQEgAEEcaigCACgCDBECAAsgA0EQaiQAC58BAQF/IwBBEGsiAyQAIAMgAq1CgICAgBBCACACKAIYQdufwABBASACQRxqKAIAKAIMEQIAG4Q3AwAgAQRAIAFBAXQhAQNAIAMgADYCDCADIANBDGpBuJbAABCUAiAAQQJqIQAgAUF+aiIBDQALCyADLQAEBH9BAQUgAygCACIAKAIYQdyfwABBASAAQRxqKAIAKAIMEQIACyADQRBqJAALnwEBAX8jAEEQayIDJAAgAyACrUKAgICAEEIAIAIoAhhB25/AAEEBIAJBHGooAgAoAgwRAgAbhDcDACABBEAgAUECdCEBA0AgAyAANgIMIAMgA0EMakHolcAAEJQCIABBBGohACABQXxqIgENAAsLIAMtAAQEf0EBBSADKAIAIgAoAhhB3J/AAEEBIABBHGooAgAoAgwRAgALIANBEGokAAtXAQF/IwBBEGsiBCQAIARBCGogASACIAMQgAEgAAJ/IAQoAghFBEAgBCABEDIgBCgCACECIAQoAgQMAQtBASECIAQoAgwLNgIEIAAgAjYCACAEQRBqJAALWQEBfyMAQRBrIgQkACAEQQhqIAEgAkECEIABIAACfyAEKAIIRQRAIAQgASADEDMgBCgCACECIAQoAgQMAQtBASECIAQoAgwLNgIEIAAgAjYCACAEQRBqJAALWwEBfwJAIAIgAU8EQCAAQYwBaigCACIDIAJJDQEgASACRwRAIAAoAoQBIgAgAWoiAUEBIAAgAmogAWsQXAsPCyABIAJBzIzAABCcAQALIAIgA0HMjMAAEJsBAAudAQEBfyMAQRBrIgMkACADIAKtQoCAgIAQQgAgAigCGEHbn8AAQQEgAkEcaigCACgCDBECABuENwMAIAFBDGwiAQRAA0AgAyAANgIMIAMgA0EMakH4lcAAEJQCIABBDGohACABQXRqIgENAAsLIAMtAAQEf0EBBSADKAIAIgAoAhhB3J/AAEEBIABBHGooAgAoAgwRAgALIANBEGokAAt5AQN/IwBBIGsiASQAIAFBEGoiAiEDIAICf0EAIAAtAJIBRQ0AGiADIAApAjg3AgRBAQs2AgAgAUEIaiACEI8BIAEoAgwhACABKAIIBEAgASAANgIcQaCEwABBKyABQRxqQcyEwABBkITAABCKAQALIAFBIGokACAAC1oBAX8CQCAAKAI8IgEgACgCUEcEQCABIAAoAhxBf2pPDQEgAEEAOgCmASAAIAFBAWo2AjwgACAAKAIYQX9qIgEgACgCOCIAIAAgAUsbNgI4DwsgAEEBEIIBCwtOAQJ/IAAoAggiAQRAIAAoAgAhACABQQxsIQEDQAJAIABBBGooAgAiAkUNACACQRRsRQ0AIAAoAgAQEwsgAEEMaiEAIAFBdGoiAQ0ACwsLWQECfyAAQQA6AKYBIABBADYCOCAAIAAoAjwiAiAAKAIAQZiMwAAgACgCCBsvAQAiAUEBIAEbayIBQQAgAUEAShsgASAAKAJMIgAgASAAShsgAiAASRs2AjwLSQECfyAAKAIIIgIgAUsEQCAAKAIAIAFBAnRqIgMoAgAaIAMgA0EEaiABQX9zIAJqQQJ0EBkgACACQX9qNgIIDwsgASACEJgBAAtlAQF/IwBBEGsiAiQAAn8gAC0AAEECRgRAIAEoAhhBzJbAAEEEIAFBHGooAgAoAgwRAgAMAQsgAiABQciWwABBBBDiASACIAA2AgwgAiACQQxqQdCWwAAQNyACEHYLIAJBEGokAAuYAQEBfyMAQRBrIgMkACADIAKtQoCAgIAQQgAgAigCGEHbn8AAQQEgAkEcaigCACgCDBECABuENwMAIAEEQANAIAMgADYCDCADIANBDGpBqJbAABCUAiAAQQFqIQAgAUF/aiIBDQALCyADLQAEBH9BAQUgAygCACIAKAIYQdyfwABBASAAQRxqKAIAKAIMEQIACyADQRBqJAALTwEBfyMAQbABayICJAACQCABBEAgASgCAA0BIAFBADYCACAAIAIgAUGsARAsIgBBBHJBqAEQLBogARATIABBsAFqJAAPCxCjAgALEKQCAAtSAQF/IwBBEGsiAiQAIAIgAUGAj8AAQQQQ4gEgAiAANgIMIAIgAkEMaiIBQYSPwAAQNyACIABBBGo2AgwgAiABQZSPwAAQNyACEHYgAkEQaiQAC0gBA38jAEEQayICJAAgAiABNgIMQQEhAyACQQxqKAIAEAdBAUYgAigCDCEBBEBBACEDCyAAIAE2AgQgACADNgIAIAJBEGokAAtQAQJ/IAAoAgAiA0EIaiIEKAIAIQAgA0EEaigCACAAayACSQRAIAMgACACEFYgBCgCACEACyADKAIAIABqIAEgAhAsGiAEIAAgAmo2AgBBAAtZAQF/IwBBEGsiAyQAIAMgACABIAIQRgJAIAMoAgBBAUYEQCADQQhqKAIAIgBFDQEgAygCBCAAQfi4wAAoAgAiAEHUACAAGxEBAAALIANBEGokAA8LEJACAAtXAQF/IwBBEGsiAiQAIAIgACABEEoCQCACKAIAQQFGBEAgAkEIaigCACIARQ0BIAIoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyACQRBqJAAPCxCQAgALWQEBfyMAQRBrIgMkACADIAAgASACEFICQCADKAIAQQFGBEAgA0EIaigCACIARQ0BIAMoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyADQRBqJAAPCxCQAgALWQEBfyMAQRBrIgMkACADIAAgASACEEcCQCADKAIAQQFGBEAgA0EIaigCACIARQ0BIAMoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyADQRBqJAAPCxCQAgALVwEBfyMAQRBrIgIkACACIAAgARBNAkAgAigCAEEBRgRAIAJBCGooAgAiAEUNASACKAIEIABB+LjAACgCACIAQdQAIAAbEQEAAAsgAkEQaiQADwsQkAIAC1cBAX8jAEEQayICJAAgAiAAIAEQSAJAIAIoAgBBAUYEQCACQQhqKAIAIgBFDQEgAigCBCAAQfi4wAAoAgAiAEHUACAAGxEBAAALIAJBEGokAA8LEJACAAtFAQF/IAAoAgQgACgCCCIDayACIAFrIgJJBEAgACADIAIQvAEgACgCCCEDCyAAKAIAIANqIAEgAhAsGiAAIAIgA2o2AggLWQEBfyMAQRBrIgIkACACIAAgAUEBEFICQCACKAIAQQFGBEAgAkEIaigCACIARQ0BIAIoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyACQRBqJAAPCxCQAgALVwEBfyMAQRBrIgIkACACIAAgARBbAkAgAigCAEEBRgRAIAJBCGooAgAiAEUNASACKAIEIABB+LjAACgCACIAQdQAIAAbEQEAAAsgAkEQaiQADwsQkAIAC0gBAX8CfyABLQAARQRAEAUMAQtBASEDEAYLIQIgACABNgIEIABBADYCACAAQRBqQQA2AgAgAEEMaiACNgIAIABBCGogAzYCAAtXAQF/IwBBEGsiAiQAIAIgACABEHICQCACKAIAQQFGBEAgAkEIaigCACIARQ0BIAIoAgQgAEH4uMAAKAIAIgBB1AAgABsRAQAACyACQRBqJAAPCxCQAgALVwEBfyMAQRBrIgIkACACIAAgARB/AkAgAigCAEEBRgRAIAJBCGooAgAiAEUNASACKAIEIABB+LjAACgCACIAQdQAIAAbEQEAAAsgAkEQaiQADwsQkAIAC0sAAkACfyABQYCAxABHBEBBASAAKAIYIAEgAEEcaigCACgCEBEAAA0BGgsgAg0BQQALDwsgACgCGCACIAMgAEEcaigCACgCDBECAAtCAQF/AkAgAARAIAAoAgAiAkF/Rg0BIAAgAkEBajYCACAAQQRqIAEQiAEgACAAKAIAQX9qNgIADwsQowIACxCkAgALSQEBfyAAQQA2AgggACgCBEUEQCAAQQAQvgEgACgCCCEBCyAAKAIAIAFBAXRqQQA7AQAgAEEUakEANgIAIAAgACgCCEEBajYCCAtIAQF/IABBFGooAgAiAiAAQRBqKAIARgRAIABBDGogAhC7ASAAKAIUIQILIAAoAgwgAkECdGogATYCACAAIAAoAhRBAWo2AhQLSwEBfyAAQQA6AKYBIABBACAAKAI4IAAoAgBBmIzAACAAKAIIGy8BACIBQQEgARtqIgEgACgCGCIAQX9qIAEgAEkbIAFBAEgbNgI4C0sBAX8gAEEAOgCmASAAQQAgACgCOCAAKAIAQZiMwAAgACgCCBsvAQAiAUEBIAEbayIBIAAoAhgiAEF/aiABIABJGyABQQBIGzYCOAtAAQF/AkAgAARAIAAoAgAiAUF/Rg0BIAAgAUEBajYCACAAQQRqEK8BIAAgACgCAEF/ajYCAA8LEKMCAAsQpAIAC0gBAX8jAEEgayIDJAAgA0EUakEANgIAIANBzJ3AADYCECADQgE3AgQgAyABNgIcIAMgADYCGCADIANBGGo2AgAgAyACEOcBAAs9AQF/IwBBEGsiASQAIAEgABDXAQJAIAEoAgAiAEUNACABKAIERQ0AIAFBCGooAgAaIAAQEwsgAUEQaiQACzsBAX8jAEEQayICJAAgAiABQaCGwABBBRDiASACIAA2AgwgAiACQQxqQaiGwAAQNyACEHYgAkEQaiQAC1YBAn8gASgCBCECIAEoAgAhA0EIQQQQiQIiAUUEQEEIQQRB+LjAACgCACIAQdQAIAAbEQEAAAsgASACNgIEIAEgAzYCACAAQYSawAA2AgQgACABNgIACzQBAX8gACgCCCIBBEAgACgCACEAIAFBHGwhAQNAIAAQ6wEgAEEcaiEAIAFBZGoiAQ0ACwsLOgEBfyABQQhqKAIAIQICQCABKAIMRQ0AIAFBEGooAgAiAUEkSQ0AIAEQAAsgACACNgIEIABBADYCAAs5AQF/IAFBEHZAACECIABBADYCCCAAQQAgAUGAgHxxIAJBf0YiARs2AgQgAEEAIAJBEHQgARs2AgALMwEBfyMAQdACayICJAAgAiAAIAEQHiACQagBaiIAIAJBqAEQLBogABDaASACQdACaiQAC2sBA38jAEEQayIBJAAgACgCDCICRQRAQYyZwABBK0HUmcAAEM0BAAsgACgCCCIDRQRAQYyZwABBK0HkmcAAEM0BAAsgASACNgIIIAEgADYCBCABIAM2AgAgASgCACABKAIEIAEoAggQgQEACzQBAX8gASgCBCICBEAgAEEIakEENgIAIAAgAkECdDYCBCAAIAEoAgA2AgAPCyAAQQA2AgALNAEBfyABKAIEIgIEQCAAQQhqQQQ2AgAgACACQRxsNgIEIAAgASgCADYCAA8LIABBADYCAAsrAAJAIABBfEsNACAARQRAQQQPCyAAIABBfUlBAnQQiQIiAEUNACAADwsACz8AAkACQAJAAkAgACgCAEGYjMAAIAAoAggbLwEADgYAAwEDAwIDCyAAEHEPCyAAEHcPCyAAQcgAakEANgIACwtBAQF/QawBQQQQiQIiAUUEQEGsAUEEQfi4wAAoAgAiAEHUACAAGxEBAAALIAFBADYCACABQQRqIABBqAEQLBogAQsuACABIAJPBEAgASACayIBIAFBFGwgAGogAhAhDwtB+JPAAEEhQZyUwAAQzQEACzABAX8gAUEoaigCACIDIAJNBEAgAiADQbyMwAAQmQEACyAAIAEoAiAgAkEMbGoQEAsuACABIAJPBEAgASACayIBIAFBDGwgAGogAhARDwtBtJXAAEEhQdiVwAAQzQEACzwAIAAoAgAhACABLQAAQRBxQQR2RQRAIAEtAABBIHFBBXZFBEAgACABEJMCDwsgACABEG0PCyAAIAEQbAs8AQJ/IwBBEGsiAiQAIAJBCGoiAyAAKAIINgIEIAMgACgCADYCACACKAIIIAIoAgwgARCoAiACQRBqJAALPgAgACgCACEAIAEtAABBEHFBBHZFBEAgAS0AAEEgcUEFdkUEQCAAMwEAIAEQLg8LIAAgARBrDwsgACABEGgLPAAgACgCACEAIAEtAABBEHFBBHZFBEAgAS0AAEEgcUEFdkUEQCAAIAEQlgIPCyAAIAEQag8LIAAgARBpCzQAIAAgASgCGCACIAMgAUEcaigCACgCDBECADoACCAAIAE2AgAgACADRToACSAAQQA2AgQLLAAgASACTwRAIAIgAkEUbCAAaiABIAJrECEPC0H4ksAAQSNB6JPAABDNAQALLAAgASACTwRAIAIgAkEMbCAAaiABIAJrEBEPC0G0lMAAQSNBpJXAABDNAQALMgEBfyAAIAEoAgQgASgCCCICSwR/IAEgAhDFASABKAIIBSACCzYCBCAAIAEoAgA2AgALKgAgACAAKAIEQQFxIAFyQQJyNgIEIAAgAWpBBGoiACAAKAIAQQFyNgIACzUBAX8jAEEQayICJAAgAiABNgIMIAIgADYCCCACQYSewAA2AgQgAkHMncAANgIAIAIQ1QEACzQAIABBAzoAICAAQoCAgICABDcCACAAIAE2AhggAEEANgIQIABBADYCCCAAQRxqIAI2AgALNQACQAJAAkAgACgCAEGYjMAAIAAoAggbLwEADgQAAgIBAgsgABB3DwsgAEHIAGpBADYCAAsLMgEBfyAA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cGVjdGVkbHkvcnVzdGMvOWQxYjIxMDZlMjNiMWFiZDMyZmNlMWYxNzI2NzYwNGE1MTAyZjU3YS9saWJyYXJ5L2FsbG9jL3NyYy9zdHJpbmcucnMAAHcBEABLAAAAXwkAAA4AAAABAAAAAAAAAAYAAAAAAAAAAQAAAAcAAADsARAAAAAAAHNyYy9saWIucnMAAPQBEAAKAAAAIwAAAC0AAAD0ARAACgAAACgAAAAvAAAAY2FsbGVkIGBSZXN1bHQ6OnVud3JhcCgpYCBvbiBhbiBgRXJyYCB2YWx1ZQAJAAAABAAAAAQAAAAKAAAAVHJpZWQgdG8gc2hyaW5rIHRvIGEgbGFyZ2VyIGNhcGFjaXR5L3J1c3RjLzlkMWIyMTA2ZTIzYjFhYmQzMmZjZTFmMTcyNjc2MDRhNTEwMmY1N2EvbGlicmFyeS9hbGxvYy9zcmMvcmF3X3ZlYy5yc4ACEABMAAAAqwEAAAkAAAABAAAAAAAAACBjYW4ndCBiZSByZXByZXNlbnRlZCBhcyBhIEphdmFTY3JpcHQgbnVtYmVy5AIQAAAAAADkAhAALAAAAEVycm9yAAAADAAAAAQAAAAEAAAADQAAAA4AAAAMAAAABAAAAA8AAAAQAAAABQAAAGEgRGlzcGxheSBpbXBsZW1lbnRhdGlvbiByZXR1cm5lZCBhbiBlcnJvciB1bmV4cGVjdGVkbHkvcnVzdGMvOWQxYjIxMDZlMjNiMWFiZDMyZmNlMWYxNzI2NzYwNGE1MTAyZjU3YS9saWJyYXJ5L2FsbG9jL3NyYy9zdHJpbmcucnMAAIcDEABLAAAAXwkAAA4AAAABAAAAAAAAABEAAAAAAAAAAQAAAAcAAAAvcnVzdGMvOWQxYjIxMDZlMjNiMWFiZDMyZmNlMWYxNzI2NzYwNGE1MTAyZjU3YS9saWJyYXJ5L2FsbG9jL3NyYy9yYXdfdmVjLnJzVHJpZWQgdG8gc2hyaW5rIHRvIGEgbGFyZ2VyIGNhcGFjaXR5/AMQAEwAAACrAQAACQAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBkZXN0cm95ZWQgYWxyZWFkeWYmAACSJQAACSQAAAwkAAANJAAACiQAALAAAACxAAAAJCQAAAskAAAYJQAAECUAAAwlAAAUJQAAPCUAALojAAC7IwAAACUAALwjAAC9IwAAHCUAACQlAAA0JQAALCUAAAIlAABkIgAAZSIAAMADAABgIgAAowAAAMUiAAB2dC1ycy9zcmMvbGliLnJzKAUQABAAAABLAgAAEQAAACgFEAAQAAAAbgIAABoAAAAoBRAAEAAAAOwCAAAaAAAAKAUQABAAAADvAgAAGgAAACgFEAAQAAAAVAMAAA0AAAAoBRAAEAAAAFkDAAANAAAAKAUQABAAAABlAwAADQAAACgFEAAQAAAAagMAAA0AAAAoBRAAEAAAAHcDAAAJAAAAKAUQABAAAACXAwAAGAAAACgFEAAQAAAAsAQAAAkAAAAoBRAAEAAAAL4EAAAkAAAAKAUQABAAAADKBAAAGgAAACgFEAAQAAAA0gQAABoAAAAAAAAAKAUQABAAAABpBQAACQAAACgFEAAQAAAAcQUAAAkAAAAoBRAAEAAAALUFAAAaAAAAKAUQABAAAADYBQAAFwAAACgFEAAQAAAA3gUAAAkAAABTb3NQbUFwY1N0cmluZ09zY1N0cmluZ0Rjc0lnbm9yZURjc1Bhc3N0aHJvdWdoRGNzSW50ZXJtZWRpYXRlRGNzUGFyYW1EY3NFbnRyeUNzaUlnbm9yZUNzaUludGVybWVkaWF0ZUNzaVBhcmFtQ3NpRW50cnlFc2NhcGVJbnRlcm1lZGlhdGVFc2NhcGVHcm91bmRSR0IAACYAAAAEAAAABAAAACcAAABJbmRleGVkUGVuZm9yZWdyb3VuZCgAAAAEAAAABAAAACkAAABiYWNrZ3JvdW5kYm9sZAAAKgAAAAQAAAAEAAAAKwAAAGl0YWxpY3VuZGVybGluZXN0cmlrZXRocm91Z2hibGlua2ludmVyc2VDZWxsLAAAAAQAAAAEAAAALQAAAC4AAAAEAAAABAAAAC8AAAAwAAAABAAAAAQAAAAxAAAARzFHMEFsdGVybmF0ZVByaW1hcnlTYXZlZEN0eGN1cnNvcl94MgAAAAQAAAAEAAAAMwAAAGN1cnNvcl95cGVub3JpZ2luX21vZGVhdXRvX3dyYXBfbW9kZVZUc3RhdGUANAAAAAQAAAAEAAAANQAAAHBhcmFtcwAANgAAAAQAAAAEAAAANwAAAGludGVybWVkaWF0ZXNjb2x1bW5zcm93c2J1ZmZlcgAAOAAAAAQAAAAEAAAAOQAAAGFsdGVybmF0ZV9idWZmZXJhY3RpdmVfYnVmZmVyX3R5cGUAADoAAAAEAAAABAAAADsAAABjdXJzb3JfdmlzaWJsZWNoYXJzZXQAAAA8AAAABAAAAAQAAAA9AAAAdGFicz4AAAAEAAAABAAAAD8AAABpbnNlcnRfbW9kZW5ld19saW5lX21vZGVuZXh0X3ByaW50X3dyYXBzdG9wX21hcmdpbmJvdHRvbV9tYXJnaW5zYXZlZF9jdHhAAAAABAAAAAQAAABBAAAAYWx0ZXJuYXRlX3NhdmVkX2N0eGFmZmVjdGVkX2xpbmVzAAAAQgAAAAQAAAAEAAAAQwAAAAQAAAAAAAAAAgAAAAAAAABhc3NlcnRpb24gZmFpbGVkOiBtaWQgPD0gc2VsZi5sZW4oKS9ydXN0Yy85ZDFiMjEwNmUyM2IxYWJkMzJmY2UxZjE3MjY3NjA0YTUxMDJmNTdhL2xpYnJhcnkvY29yZS9zcmMvc2xpY2UvbW9kLnJzmwkQAE0AAACiCwAACQAAAGFzc2VydGlvbiBmYWlsZWQ6IGsgPD0gc2VsZi5sZW4oKQAAAJsJEABNAAAAzQsAAAkAAAAEAAAAAAAAAGFzc2VydGlvbiBmYWlsZWQ6IG1pZCA8PSBzZWxmLmxlbigpL3J1c3RjLzlkMWIyMTA2ZTIzYjFhYmQzMmZjZTFmMTcyNjc2MDRhNTEwMmY1N2EvbGlicmFyeS9jb3JlL3NyYy9zbGljZS9tb2QucnNXChAATQAAAKILAAAJAAAAYXNzZXJ0aW9uIGZhaWxlZDogayA8PSBzZWxmLmxlbigpAAAAVwoQAE0AAADNCwAACQAAAEQAAAAEAAAABAAAADMAAABFAAAABAAAAAQAAABGAAAARwAAAAQAAAAEAAAASAAAAEkAAAAEAAAABAAAAC0AAABKAAAABAAAAAQAAAArAAAASwAAAAQAAAAEAAAATAAAAFNvbWVOb25lTQAAAAQAAAAEAAAATgAAAAQAAAAAAAAAbnVsbCBwb2ludGVyIHBhc3NlZCB0byBydXN0cmVjdXJzaXZlIHVzZSBvZiBhbiBvYmplY3QgZGV0ZWN0ZWQgd2hpY2ggd291bGQgbGVhZCB0byB1bnNhZmUgYWxpYXNpbmcgaW4gcnVzdEpzVmFsdWUoKQDSCxAACAAAANoLEAABAAAAL3J1c3RjLzlkMWIyMTA2ZTIzYjFhYmQzMmZjZTFmMTcyNjc2MDRhNTEwMmY1N2EvbGlicmFyeS9hbGxvYy9zcmMvcmF3X3ZlYy5yc1RyaWVkIHRvIHNocmluayB0byBhIGxhcmdlciBjYXBhY2l0eewLEABMAAAAqwEAAAkAAABQAAAABAAAAAQAAABRAAAAUgAAAFMAAAABAAAAAAAAAGNhbGxlZCBgT3B0aW9uOjp1bndyYXAoKWAgb24gYSBgTm9uZWAgdmFsdWVsaWJyYXJ5L3N0ZC9zcmMvcGFuaWNraW5nLnJzALcMEAAcAAAA8AEAAB8AAAC3DBAAHAAAAPEBAAAeAAAAVQAAAAwAAAAEAAAAVgAAAFcAAAAIAAAABAAAAFgAAABZAAAAEAAAAAQAAABaAAAAWwAAAFcAAAAIAAAABAAAAFwAAABdAAAAVwAAAAQAAAAEAAAAXgAAAF8AAABgAAAAbGlicmFyeS9hbGxvYy9zcmMvcmF3X3ZlYy5yc2NhcGFjaXR5IG92ZXJmbG93AAAAVA0QABwAAAAGAgAABQAAAGEgZm9ybWF0dGluZyB0cmFpdCBpbXBsZW1lbnRhdGlvbiByZXR1cm5lZCBhbiBlcnJvcmxpYnJhcnkvYWxsb2Mvc3JjL2ZtdC5ycwDHDRAAGAAAAFUCAAAcAAAAKSBzaG91bGQgYmUgPCBsZW4gKGlzIClsaWJyYXJ5L2FsbG9jL3NyYy92ZWMvbW9kLnJzaW5zZXJ0aW9uIGluZGV4IChpcyApIHNob3VsZCBiZSA8PSBsZW4gKGlzIAAAIw4QABQAAAA3DhAAFwAAAAYOEAABAAAABw4QABwAAAA9BQAADQAAAHJlbW92YWwgaW5kZXggKGlzIAAAeA4QABIAAADwDRAAFgAAAAYOEAABAAAAYgAAAAAAAAABAAAABwAAAGIAAAAEAAAABAAAAGMAAABkAAAAZQAAAC4uAADMDhAAAgAAAGNhbGxlZCBgT3B0aW9uOjp1bndyYXAoKWAgb24gYSBgTm9uZWAgdmFsdWUAawAAAAAAAAABAAAAbAAAAGluZGV4IG91dCBvZiBib3VuZHM6IHRoZSBsZW4gaXMgIGJ1dCB0aGUgaW5kZXggaXMgAAAUDxAAIAAAADQPEAASAAAAYDogAMwOEAAAAAAAWQ8QAAIAAABrAAAADAAAAAQAAABtAAAAbgAAAG8AAAAgICAgbGlicmFyeS9jb3JlL3NyYy9mbXQvYnVpbGRlcnMucnOIDxAAIAAAAC8AAAAhAAAAiA8QACAAAAAwAAAAEgAAACB7CiwKLCAgeyB9IH0oCigsKQpbXWxpYnJhcnkvY29yZS9zcmMvZm10L251bS5yc90PEAAbAAAAZQAAABQAAAAweDAwMDEwMjAzMDQwNTA2MDcwODA5MTAxMTEyMTMxNDE1MTYxNzE4MTkyMDIxMjIyMzI0MjUyNjI3MjgyOTMwMzEzMjMzMzQzNTM2MzczODM5NDA0MTQyNDM0NDQ1NDY0NzQ4NDk1MDUxNTI1MzU0NTU1NjU3NTg1OTYwNjE2MjYzNjQ2NTY2Njc2ODY5NzA3MTcyNzM3NDc1NzY3Nzc4Nzk4MDgxODI4Mzg0ODU4Njg3ODg4OTkwOTE5MjkzOTQ5NTk2OTc5ODk5AABrAAAABAAAAAQAAABwAAAAcQAAAHIAAAB0cnVlZmFsc2VsaWJyYXJ5L2NvcmUvc3JjL3NsaWNlL21lbWNoci5ycwAAAPUQEAAgAAAAWwAAAAUAAAByYW5nZSBzdGFydCBpbmRleCAgb3V0IG9mIHJhbmdlIGZvciBzbGljZSBvZiBsZW5ndGggKBEQABIAAAA6ERAAIgAAAHJhbmdlIGVuZCBpbmRleCBsERAAEAAAADoREAAiAAAAc2xpY2UgaW5kZXggc3RhcnRzIGF0ICBidXQgZW5kcyBhdCAAjBEQABYAAACiERAADQAAAGF0dGVtcHRlZCB0byBpbmRleCBzbGljZSB1cCB0byBtYXhpbXVtIHVzaXplbGlicmFyeS9jb3JlL3NyYy9zdHIvdmFsaWRhdGlvbnMucnMA7BEQACMAAAAeAQAAEQAAAFsuLi5dYnl0ZSBpbmRleCAgaXMgb3V0IG9mIGJvdW5kcyBvZiBgAAAlEhAACwAAADASEAAWAAAAWA8QAAEAAABiZWdpbiA8PSBlbmQgKCA8PSApIHdoZW4gc2xpY2luZyBgAABgEhAADgAAAG4SEAAEAAAAchIQABAAAABYDxAAAQAAACBpcyBub3QgYSBjaGFyIGJvdW5kYXJ5OyBpdCBpcyBpbnNpZGUgIChieXRlcyApIG9mIGAlEhAACwAAAKQSEAAmAAAAyhIQAAgAAADSEhAABgAAAFgPEAABAAAAbGli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BAgBBwMKAh4BOwEBAQwBCQEoAQMBNwEBAwUDAQQHAgsCHQE6AQIBAgEDAQUCBwILAhwCOQIBAQIECAEJAQoCHQFIAQQBAgMBAQgBUQECBwwIYgECCQsGSgIbAQEBAQE3DgEFAQIFCwEkCQFmBAEGAQICAhkCBAMQBA0BAgIGAQ8BAAMAAx0CHgIeAkACAQcIAQILCQEtAwEBdQIiAXYDBAIJAQYD2wICAToBAQcBAQEBAggGCgIBMB8xBDAHAQEFASgJDAIgBAICAQM4AQECAwEBAzoIAgKYAwENAQcEAQYBAwLGQAABwyEAA40BYCAABmkCAAQBCiACUAIAAQMBBAEZAgUBlwIaEg0BJggZCy4DMAECBAICJwFDBgICAgIMAQgBLwEzAQEDAgIFAgEBKgIIAe4BAgEEAQABABAQEAACAAHiAZUFAAMBAgUEKAMEAaUCAAQAApkLMQR7ATYPKQECAgoDMQQCAgcBPQMkBQEIPgEMAjQJCgQCAV8DAgEBAgYBoAEDCBUCOQIBAQEBFgEOBwMFwwgCAwEBFwFRAQIGAQECAQECAQLrAQIEBgIBAhsCVQgCAQECagEBAQIGAQFlAwIEAQUACQEC9QEKAgEBBAGQBAICBAEgCigGAgQIAQkGAgMuDQECAAcBBgEBUhYCBwECAQJ6BgMBAQIBBwEBSAIDAQEBAAIABTsHAAE/BFEBAAIALgIXAAEBAwQFCAgCBx4ElAMANwQyCAEOARYFAQ8ABwERAgcBAgEFAAcAAT0EAAdtBwBggPAAewlwcm9kdWNlcnMCCGxhbmd1YWdlAQRSdXN0AAxwcm9jZXNzZWQtYnkDBXJ1c3RjHTEuNTkuMCAoOWQxYjIxMDZlIDIwMjItMDItMjMpBndhbHJ1cwYwLjE5LjAMd2FzbS1iaW5kZ2VuEjAuMi43OCAoN2Y4MjBkYjRiKQ==");

                      var loadVt = async () => {
                          await init(wasm_code);
                          return exports$1;
                      };

  function parseNpt(time) {
    if (typeof time === 'number') {
      return time;
    } else if (typeof time === 'string') {
      return time.split(':').reverse().map(parseFloat).reduce(function (sum, n, i) {
        return sum + n * Math.pow(60, i);
      });
    } else {
      return undefined;
    }
  }

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var vt = loadVt(); // trigger async loading of wasm

  var Core = /*#__PURE__*/function () {
    // public
    function Core(driverFn, opts) {
      var _opts$speed;

      _classCallCheck(this, Core);

      this.state = 'initial';
      this.driver = null;
      this.driverFn = driverFn;
      this.changedLines = new Set();
      this.cursor = undefined;
      this.duration = null;
      this.cols = opts.cols;
      this.rows = opts.rows;
      this.startTime = null;
      this.speed = (_opts$speed = opts.speed) !== null && _opts$speed !== void 0 ? _opts$speed : 1.0;
      this.loop = opts.loop;
      this.idleTimeLimit = opts.idleTimeLimit;
      this.preload = opts.preload;
      this.startAt = opts.startAt;
      this.poster = opts.poster;
      this.onSize = opts.onSize;
      this.onFinish = opts.onFinish;
      this.onTerminalUpdate = opts.onTerminalUpdate;
    }

    _createClass(Core, [{
      key: "init",
      value: function () {
        var _init = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          var _this = this,
              _this$cols,
              _this$rows;

          var playCount, feed, now, setTimeout, setInterval, reset, onFinish;
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  playCount = 0;
                  feed = this.feed.bind(this);
                  now = this.now.bind(this);

                  setTimeout = function setTimeout(f, t) {
                    return window.setTimeout(f, t / _this.speed);
                  };

                  setInterval = function setInterval(f, t) {
                    return window.setInterval(f, t / _this.speed);
                  };

                  reset = function reset(cols, rows) {
                    _this.resetVt(cols, rows);
                  };

                  onFinish = function onFinish() {
                    playCount++;

                    if (_this.loop === true || typeof _this.loop === 'number' && playCount < _this.loop) {
                      _this.restart();
                    } else {
                      _this.state = 'finished';

                      if (typeof _this.onFinish === 'function') {
                        _this.onFinish();
                      }
                    }
                  };

                  _context.next = 9;
                  return vt;

                case 9:
                  this.wasm = _context.sent;
                  this.driver = this.driverFn({
                    feed: feed,
                    now: now,
                    setTimeout: setTimeout,
                    setInterval: setInterval,
                    onFinish: onFinish,
                    reset: reset
                  }, {
                    cols: this.cols,
                    rows: this.rows,
                    idleTimeLimit: this.idleTimeLimit
                  });

                  if (typeof this.driver === 'function') {
                    this.driver = {
                      start: this.driver
                    };
                  }

                  this.duration = this.driver.duration;
                  this.cols = (_this$cols = this.cols) !== null && _this$cols !== void 0 ? _this$cols : this.driver.cols;
                  this.rows = (_this$rows = this.rows) !== null && _this$rows !== void 0 ? _this$rows : this.driver.rows;

                  if (this.preload) {
                    this.initializeDriver();
                  }

                  _context.t0 = !!this.driver.pauseOrResume;
                  _context.t1 = !!this.driver.seek;
                  _context.next = 20;
                  return this.renderPoster();

                case 20:
                  _context.t2 = _context.sent;
                  return _context.abrupt("return", {
                    isPausable: _context.t0,
                    isSeekable: _context.t1,
                    poster: _context.t2
                  });

                case 22:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function init() {
          return _init.apply(this, arguments);
        }

        return init;
      }()
    }, {
      key: "play",
      value: function () {
        var _play = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(this.state == 'initial')) {
                    _context2.next = 5;
                    break;
                  }

                  _context2.next = 3;
                  return this.start();

                case 3:
                  _context2.next = 6;
                  break;

                case 5:
                  if (this.state == 'paused') {
                    this.resume();
                  } else if (this.state == 'finished') {
                    this.restart();
                  }

                case 6:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function play() {
          return _play.apply(this, arguments);
        }

        return play;
      }()
    }, {
      key: "pauseOrResume",
      value: function () {
        var _pauseOrResume = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
          return regenerator.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!(this.state == 'initial')) {
                    _context3.next = 5;
                    break;
                  }

                  _context3.next = 3;
                  return this.start();

                case 3:
                  _context3.next = 16;
                  break;

                case 5:
                  if (!(this.state == 'playing')) {
                    _context3.next = 9;
                    break;
                  }

                  this.pause();
                  _context3.next = 16;
                  break;

                case 9:
                  if (!(this.state == 'paused')) {
                    _context3.next = 13;
                    break;
                  }

                  this.resume();
                  _context3.next = 16;
                  break;

                case 13:
                  if (!(this.state == 'finished')) {
                    _context3.next = 16;
                    break;
                  }

                  _context3.next = 16;
                  return this.restart();

                case 16:
                  return _context3.abrupt("return", this.state == 'playing');

                case 17:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function pauseOrResume() {
          return _pauseOrResume.apply(this, arguments);
        }

        return pauseOrResume;
      }()
    }, {
      key: "stop",
      value: function stop() {
        if (typeof this.driver.stop === 'function') {
          this.driver.stop();
        }
      }
    }, {
      key: "seek",
      value: function () {
        var _seek = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(where) {
          return regenerator.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  if (!(typeof this.driver.seek === 'function')) {
                    _context4.next = 8;
                    break;
                  }

                  _context4.next = 3;
                  return this.initializeDriver();

                case 3:
                  if (this.state != 'playing') {
                    this.state = 'paused';
                  }

                  this.driver.seek(where);
                  return _context4.abrupt("return", true);

                case 8:
                  return _context4.abrupt("return", false);

                case 9:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function seek(_x) {
          return _seek.apply(this, arguments);
        }

        return seek;
      }()
    }, {
      key: "getChangedLines",
      value: function getChangedLines() {
        if (this.changedLines.size > 0) {
          var lines = new Map();

          var _iterator = _createForOfIteratorHelper(this.changedLines),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var i = _step.value;
              lines.set(i, {
                id: i,
                segments: this.vt.get_line(i)
              });
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }

          this.changedLines.clear();
          return lines;
        }
      }
    }, {
      key: "getCursor",
      value: function getCursor() {
        if (this.cursor === undefined && this.vt) {
          var _this$vt$get_cursor;

          this.cursor = (_this$vt$get_cursor = this.vt.get_cursor()) !== null && _this$vt$get_cursor !== void 0 ? _this$vt$get_cursor : false;
        }

        return this.cursor;
      }
    }, {
      key: "getCurrentTime",
      value: function getCurrentTime() {
        if (typeof this.driver.getCurrentTime === 'function') {
          return this.driver.getCurrentTime();
        } else if (this.startTime) {
          return (this.now() - this.startTime) / 1000;
        }
      }
    }, {
      key: "getRemainingTime",
      value: function getRemainingTime() {
        if (typeof this.duration === 'number') {
          return this.duration - Math.min(this.getCurrentTime(), this.duration);
        }
      }
    }, {
      key: "getProgress",
      value: function getProgress() {
        if (typeof this.duration === 'number') {
          return Math.min(this.getCurrentTime(), this.duration) / this.duration;
        }
      } // private

    }, {
      key: "start",
      value: function () {
        var _start = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5() {
          var stop;
          return regenerator.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return this.initializeDriver();

                case 2:
                  this.onTerminalUpdate(); // clears the poster

                  _context5.next = 5;
                  return this.driver.start(this.startAt);

                case 5:
                  stop = _context5.sent;

                  if (typeof stop === 'function') {
                    this.driver.stop = stop;
                  }

                  this.startTime = this.now();
                  this.state = 'playing';

                case 9:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function start() {
          return _start.apply(this, arguments);
        }

        return start;
      }()
    }, {
      key: "pause",
      value: function pause() {
        if (typeof this.driver.pauseOrResume === 'function') {
          this.driver.pauseOrResume();
          this.state = 'paused';
        }
      }
    }, {
      key: "resume",
      value: function resume() {
        if (typeof this.driver.pauseOrResume === 'function') {
          this.state = 'playing';
          this.driver.pauseOrResume();
        }
      }
    }, {
      key: "restart",
      value: function () {
        var _restart = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee6() {
          return regenerator.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return this.seek(0);

                case 2:
                  if (!_context6.sent) {
                    _context6.next = 4;
                    break;
                  }

                  this.resume();

                case 4:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        function restart() {
          return _restart.apply(this, arguments);
        }

        return restart;
      }()
    }, {
      key: "feed",
      value: function feed(data) {
        var _this2 = this;

        var affectedLines = this.vt.feed(data);
        affectedLines.forEach(function (i) {
          return _this2.changedLines.add(i);
        });
        this.cursor = undefined;
        this.onTerminalUpdate();
      }
    }, {
      key: "now",
      value: function now() {
        return performance.now() * this.speed;
      }
    }, {
      key: "initializeDriver",
      value: function initializeDriver() {
        if (this.initializeDriverPromise === undefined) {
          this.initializeDriverPromise = this.doInitializeDriver();
        }

        return this.initializeDriverPromise;
      }
    }, {
      key: "doInitializeDriver",
      value: function () {
        var _doInitializeDriver = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee7() {
          var _this$duration, _this$cols2, _this$rows2, meta;

          return regenerator.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  if (!(typeof this.driver.init === 'function')) {
                    _context7.next = 7;
                    break;
                  }

                  _context7.next = 3;
                  return this.driver.init();

                case 3:
                  meta = _context7.sent;
                  this.duration = (_this$duration = this.duration) !== null && _this$duration !== void 0 ? _this$duration : meta.duration;
                  this.cols = (_this$cols2 = this.cols) !== null && _this$cols2 !== void 0 ? _this$cols2 : meta.cols;
                  this.rows = (_this$rows2 = this.rows) !== null && _this$rows2 !== void 0 ? _this$rows2 : meta.rows;

                case 7:
                  this.ensureVt();

                case 8:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        function doInitializeDriver() {
          return _doInitializeDriver.apply(this, arguments);
        }

        return doInitializeDriver;
      }()
    }, {
      key: "ensureVt",
      value: function ensureVt() {
        var _this$cols3, _this$rows3;

        var cols = (_this$cols3 = this.cols) !== null && _this$cols3 !== void 0 ? _this$cols3 : 80;
        var rows = (_this$rows3 = this.rows) !== null && _this$rows3 !== void 0 ? _this$rows3 : 24;

        if (this.vt !== undefined && this.vt.cols === cols && this.vt.rows === rows) {
          return;
        }

        this.initializeVt(cols, rows);
      }
    }, {
      key: "resetVt",
      value: function resetVt(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.initializeVt(cols, rows);
      }
    }, {
      key: "initializeVt",
      value: function initializeVt(cols, rows) {
        this.vt = this.wasm.create(cols, rows);
        this.vt.cols = cols;
        this.vt.rows = rows;
        this.changedLines.clear();

        for (var i = 0; i < rows; i++) {
          this.changedLines.add(i);
        }

        if (typeof this.onSize === 'function') {
          this.onSize(cols, rows);
        }
      }
    }, {
      key: "renderPoster",
      value: function () {
        var _renderPoster = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee8() {
          var _this3 = this;

          var poster, cursor, lines, i;
          return regenerator.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  if (this.poster) {
                    _context8.next = 2;
                    break;
                  }

                  return _context8.abrupt("return");

                case 2:
                  this.ensureVt();
                  poster = [];

                  if (!(this.poster.substring(0, 16) == "data:text/plain,")) {
                    _context8.next = 8;
                    break;
                  }

                  poster = [this.poster.substring(16)];
                  _context8.next = 12;
                  break;

                case 8:
                  if (!(this.poster.substring(0, 4) == 'npt:' && typeof this.driver.getPoster === 'function')) {
                    _context8.next = 12;
                    break;
                  }

                  _context8.next = 11;
                  return this.initializeDriver();

                case 11:
                  poster = this.driver.getPoster(this.parseNptPoster(this.poster));

                case 12:
                  poster.forEach(function (text) {
                    return _this3.vt.feed(text);
                  });
                  cursor = this.getCursor();
                  lines = [];

                  for (i = 0; i < this.vt.rows; i++) {
                    lines.push({
                      id: i,
                      segments: this.vt.get_line(i)
                    });
                    this.changedLines.add(i);
                  }

                  this.vt.feed('\x1bc'); // reset vt

                  this.cursor = undefined;
                  return _context8.abrupt("return", {
                    cursor: cursor,
                    lines: lines
                  });

                case 19:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8, this);
        }));

        function renderPoster() {
          return _renderPoster.apply(this, arguments);
        }

        return renderPoster;
      }()
    }, {
      key: "parseNptPoster",
      value: function parseNptPoster(poster) {
        return parseNpt(poster.substring(4));
      }
    }]);

    return Core;
  }();

  const _tmpl$$6 = /*#__PURE__*/template(`<span></span>`);

  var Segment = (function (props) {
    return function () {
      var _el$ = _tmpl$$6.cloneNode(true);

      insert(_el$, function () {
        return props.text;
      });

      createRenderEffect(function (_p$) {
        var _v$ = className(props.attrs, props.extraClass),
            _v$2 = classList(props.attrs),
            _v$3 = style(props.attrs);

        _v$ !== _p$._v$ && (_el$.className = _p$._v$ = _v$);
        _p$._v$2 = classList$1(_el$, _v$2, _p$._v$2);
        _p$._v$3 = style$1(_el$, _v$3, _p$._v$3);
        return _p$;
      }, {
        _v$: undefined,
        _v$2: undefined,
        _v$3: undefined
      });

      return _el$;
    }();
  });

  function className(attrs, extraClass) {
    var fg = attrs.get('inverse') ? attrs.has('bg') ? attrs.get('bg') : 'bg' : attrs.get('fg');
    var bg = attrs.get('inverse') ? attrs.has('fg') ? attrs.get('fg') : 'fg' : attrs.get('bg');
    var fgClass = colorClass(fg, attrs.get('bold'), 'fg-');
    var bgClass = colorClass(bg, attrs.get('blink'), 'bg-');
    var cls = extraClass !== null && extraClass !== void 0 ? extraClass : '';

    if (fgClass) {
      cls += ' ' + fgClass;
    }

    if (bgClass) {
      cls += ' ' + bgClass;
    }

    return cls;
  }

  function classList(attrs) {
    return {
      bright: attrs.has('bold'),
      italic: attrs.has('italic'),
      underline: attrs.has('underline'),
      blink: attrs.has('blink')
    };
  }

  function colorClass(color, intense, prefix) {
    if (typeof color === 'number') {
      if (intense && color < 8) {
        color += 8;
      }

      return "".concat(prefix).concat(color);
    } else if (color == 'fg' || color == 'bg') {
      return "".concat(prefix).concat(color);
    }
  }

  function style(attrs) {
    var fg = attrs.get('inverse') ? attrs.get('bg') : attrs.get('fg');
    var bg = attrs.get('inverse') ? attrs.get('fg') : attrs.get('bg');
    var style = {};

    if (typeof fg === 'string') {
      style['color'] = fg;
    }

    if (typeof bg === 'string') {
      style['background-color'] = bg;
    }

    return style;
  }

  const _tmpl$$5 = /*#__PURE__*/template(`<span class="line"></span>`);
  var Line = (function (props) {
    var segments = function segments() {
      if (typeof props.cursor === 'number') {
        var segs = [];
        var len = 0;
        var i = 0;

        while (i < props.segments.length && len + props.segments[i][0].length - 1 < props.cursor) {
          var seg = props.segments[i];
          segs.push(seg);
          len += seg[0].length;
          i++;
        }

        if (i < props.segments.length) {
          var _seg = props.segments[i];
          var cursorAttrsA = _seg[1];
          var cursorAttrsB = new Map(cursorAttrsA);
          cursorAttrsB.set('inverse', !cursorAttrsB.get('inverse'));
          var pos = props.cursor - len;

          if (pos > 0) {
            segs.push([_seg[0].substring(0, pos), _seg[1]]);
          }

          segs.push([_seg[0][pos], cursorAttrsA, ' cursor-a']);
          segs.push([_seg[0][pos], cursorAttrsB, ' cursor-b']);

          if (pos < _seg[0].length - 1) {
            segs.push([_seg[0].substring(pos + 1), _seg[1]]);
          }

          i++;

          while (i < props.segments.length) {
            var _seg2 = props.segments[i];
            segs.push(_seg2);
            i++;
          }
        }

        return segs;
      } else {
        return props.segments;
      }
    };

    return function () {
      var _el$ = _tmpl$$5.cloneNode(true);

      insert(_el$, createComponent(Index, {
        get each() {
          return segments();
        },

        children: function children(s) {
          return createComponent(Segment, {
            get text() {
              return s()[0];
            },

            get attrs() {
              return s()[1];
            },

            get extraClass() {
              return s()[2];
            }

          });
        }
      }));

      return _el$;
    }();
  });

  const _tmpl$$4 = /*#__PURE__*/template(`<pre class="asciinema-terminal"></pre>`);
  var Terminal = (function (props) {
    var terminalStyle = function terminalStyle() {
      return {
        width: "".concat(props.cols, "ch"),
        height: "".concat(1.3333333333 * props.rows, "em"),
        "font-size": "".concat((props.scale || 1.0) * 100, "%")
      };
    };

    var cursorCol = function cursorCol() {
      var _props$cursor;

      return (_props$cursor = props.cursor) === null || _props$cursor === void 0 ? void 0 : _props$cursor[0];
    };

    var cursorRow = function cursorRow() {
      var _props$cursor2;

      return (_props$cursor2 = props.cursor) === null || _props$cursor2 === void 0 ? void 0 : _props$cursor2[1];
    };

    return function () {
      var _el$ = _tmpl$$4.cloneNode(true);

      var _ref$ = props.ref;
      typeof _ref$ === "function" ? _ref$(_el$) : props.ref = _el$;

      insert(_el$, createComponent(For, {
        get each() {
          return props.lines;
        },

        children: function children(line, i) {
          return createComponent(Line, {
            get segments() {
              return line.segments;
            },

            get cursor() {
              return memo(function () {
                return i() === cursorRow();
              }, true)() ? cursorCol() : null;
            }

          });
        }
      }));

      createRenderEffect(function (_p$) {
        var _v$ = props.blink || props.cursorHold,
            _v$2 = props.blink,
            _v$3 = terminalStyle();

        _v$ !== _p$._v$ && _el$.classList.toggle("cursor", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && _el$.classList.toggle("blink", _p$._v$2 = _v$2);
        _p$._v$3 = style$1(_el$, _v$3, _p$._v$3);
        return _p$;
      }, {
        _v$: undefined,
        _v$2: undefined,
        _v$3: undefined
      });

      return _el$;
    }();
  });

  const _tmpl$$3 = /*#__PURE__*/template(`<svg version="1.1" viewBox="0 0 12 12" class="icon"><path d="M1,0 L4,0 L4,12 L1,12 Z"></path><path d="M8,0 L11,0 L11,12 L8,12 Z"></path></svg>`),
        _tmpl$2 = /*#__PURE__*/template(`<svg version="1.1" viewBox="0 0 12 12" class="icon"><path d="M1,0 L11,6 L1,12 Z"></path></svg>`),
        _tmpl$3 = /*#__PURE__*/template(`<span class="playback-button"></span>`),
        _tmpl$4 = /*#__PURE__*/template(`<span class="progressbar"><span class="bar"><span class="gutter"><span></span></span></span></span>`),
        _tmpl$5 = /*#__PURE__*/template(`<div class="control-bar"><span class="timer"><span class="time-elapsed"></span><span class="time-remaining"></span></span><span class="fullscreen-button" title="Toggle fullscreen mode"><svg version="1.1" viewBox="0 0 12 12" class="icon"><path d="M12,0 L7,0 L9,2 L7,4 L8,5 L10,3 L12,5 Z"></path><path d="M0,12 L0,7 L2,9 L4,7 L5,8 L3,10 L5,12 Z"></path></svg><svg version="1.1" viewBox="0 0 12 12" class="icon"><path d="M7,5 L7,0 L9,2 L11,0 L12,1 L10,3 L12,5 Z"></path><path d="M5,7 L0,7 L2,9 L0,11 L1,12 L3,10 L5,12 Z"></path></svg></span></div>`);

  function formatTime(seconds) {
    seconds = Math.floor(seconds);
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    var time = '';

    if (m < 10) {
      time += '0';
    }

    time += "".concat(m, ":");

    if (s < 10) {
      time += '0';
    }

    time += "".concat(s);
    return time;
  }

  var ControlBar = (function (props) {
    var e = function e(f) {
      return function (e) {
        e.preventDefault();
        f(e);
      };
    };

    var currentTime = function currentTime() {
      return typeof props.currentTime === 'number' ? formatTime(props.currentTime) : '--:--';
    };

    var remainingTime = function remainingTime() {
      return typeof props.remainingTime === 'number' ? '-' + formatTime(props.remainingTime) : currentTime();
    };

    var gutterBarStyle = function gutterBarStyle() {
      return {
        width: "100%",
        transform: "scaleX(".concat(props.progress || 0),
        "transform-origin": "left center"
      };
    };

    var onSeek = function onSeek(e) {
      if (e.altKey || e.shiftKey || e.metaKey || e.ctrlKey) {
        return;
      }

      var barWidth = e.currentTarget.offsetWidth;
      var rect = e.currentTarget.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var pos = mouseX / barWidth;
      return props.onSeekClick("".concat(pos * 100, "%"));
    };

    return function () {
      var _el$ = _tmpl$5.cloneNode(true),
          _el$5 = _el$.firstChild,
          _el$6 = _el$5.firstChild,
          _el$7 = _el$6.nextSibling,
          _el$8 = _el$5.nextSibling;

      insert(_el$, createComponent(Show, {
        get when() {
          return props.isPausable;
        },

        get children() {
          var _el$2 = _tmpl$3.cloneNode(true);

          addEventListener(_el$2, "click", e(props.onPlayClick), true);

          insert(_el$2, createComponent(Switch, {
            get children() {
              return [createComponent(Match, {
                get when() {
                  return props.isPlaying;
                },

                get children() {
                  return _tmpl$$3.cloneNode(true);
                }

              }), createComponent(Match, {
                get when() {
                  return !props.isPlaying;
                },

                get children() {
                  return _tmpl$2.cloneNode(true);
                }

              })];
            }

          }));

          return _el$2;
        }

      }), _el$5);

      insert(_el$6, currentTime);

      insert(_el$7, remainingTime);

      addEventListener(_el$8, "click", e(props.onFullscreenClick), true);

      insert(_el$, createComponent(Show, {
        get when() {
          return typeof props.progress === 'number' || props.isSeekable;
        },

        get children() {
          var _el$9 = _tmpl$4.cloneNode(true),
              _el$10 = _el$9.firstChild,
              _el$11 = _el$10.firstChild,
              _el$12 = _el$11.firstChild;

          _el$10.$$mousedown = onSeek;

          createRenderEffect(function (_$p) {
            return style$1(_el$12, gutterBarStyle(), _$p);
          });

          return _el$9;
        }

      }), null);

      createRenderEffect(function () {
        return _el$.classList.toggle("seekable", props.isSeekable);
      });

      return _el$;
    }();
  });

  delegateEvents(["click", "mousedown"]);

  const _tmpl$$2 = /*#__PURE__*/template(`<div class="loading"><div class="loader"></div></div>`);

  var LoaderOverlay = (function (props) {
    return _tmpl$$2.cloneNode(true);
  });

  const _tmpl$$1 = /*#__PURE__*/template(`<div class="start-prompt"><div class="play-button"><div><span><svg version="1.1" viewBox="0 0 866.0254037844387 866.0254037844387" class="icon"><defs><mask id="small-triangle-mask"><rect width="100%" height="100%" fill="white"></rect><polygon points="508.01270189221935 433.01270189221935, 208.0127018922194 259.8076211353316, 208.01270189221927 606.217782649107" fill="black"></polygon></mask></defs><polygon points="808.0127018922194 433.01270189221935, 58.01270189221947 -1.1368683772161603e-13, 58.01270189221913 866.0254037844386" mask="url(#small-triangle-mask)" fill="white" class="play-btn-fill"></polygon><polyline points="481.2177826491071 333.0127018922194, 134.80762113533166 533.0127018922194" stroke="white" stroke-width="90" class="play-btn-stroke"></polyline></svg></span></div></div></div>`);

  var StartOverlay = (function (props) {
    var e = function e(f) {
      return function (e) {
        e.preventDefault();
        f(e);
      };
    };

    return function () {
      var _el$ = _tmpl$$1.cloneNode(true);

      addEventListener(_el$, "click", e(props.onClick), true);

      return _el$;
    }();
  });

  delegateEvents(["click"]);

  const _tmpl$ = /*#__PURE__*/template(`<div class="asciinema-player-wrapper" tabindex="-1"><div></div></div>`);
  var Player = (function (props) {
    var _props$autoPlay;

    var _createStore = createStore({
      state: 'initial',
      cols: props.cols,
      rows: props.rows,
      lines: [],
      cursor: undefined,
      charW: null,
      charH: null,
      bordersW: null,
      bordersH: null,
      containerW: null,
      containerH: null,
      showControls: false,
      isPausable: true,
      isSeekable: true,
      currentTime: null,
      remainingTime: null,
      progress: null,
      blink: true,
      cursorHold: false
    }),
        _createStore2 = _slicedToArray(_createStore, 2),
        state = _createStore2[0],
        setState = _createStore2[1];

    var autoPlay = (_props$autoPlay = props.autoPlay) !== null && _props$autoPlay !== void 0 ? _props$autoPlay : props.autoplay;
    var frameRequestId;
    var userActivityTimeoutId;
    var timeUpdateIntervalId;
    var blinkIntervalId;
    var wrapperRef;
    var playerRef;
    var terminalRef;
    var resizeObserver;

    var terminalCols = function terminalCols() {
      return state.cols || 80;
    };

    var terminalRows = function terminalRows() {
      return state.rows || 24;
    };

    var core = new Core(props.driverFn, {
      cols: props.cols,
      rows: props.rows,
      loop: props.loop,
      speed: props.speed,
      preload: props.preload,
      startAt: props.startAt,
      poster: props.poster,
      idleTimeLimit: props.idleTimeLimit,
      onSize: function onSize(cols, rows) {
        if (rows < state.rows) {
          setState('lines', state.lines.slice(0, rows));
        }

        setState({
          cols: cols,
          rows: rows
        });
      },
      onTerminalUpdate: function onTerminalUpdate() {
        if (frameRequestId === undefined) {
          frameRequestId = requestAnimationFrame(updateTerminal);
        }
      },
      onFinish: function onFinish() {
        setState('state', 'paused');
      }
    });

    var measureDomElements = function measureDomElements() {
      setState({
        charW: terminalRef.clientWidth / terminalCols(),
        charH: terminalRef.clientHeight / terminalRows(),
        bordersW: terminalRef.offsetWidth - terminalRef.clientWidth,
        bordersH: terminalRef.offsetHeight - terminalRef.clientHeight,
        containerW: wrapperRef.offsetWidth,
        containerH: wrapperRef.offsetHeight
      });
    };

    var setupResizeObserver = function setupResizeObserver() {
      resizeObserver = new ResizeObserver(function (_entries) {
        setState({
          containerW: wrapperRef.offsetWidth,
          containerH: wrapperRef.offsetHeight
        });
        wrapperRef.dispatchEvent(new CustomEvent('resize', {
          detail: {
            el: playerRef
          }
        }));
      });
      resizeObserver.observe(wrapperRef);
    };

    onMount( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
      var _yield$core$init, isPausable, isSeekable, poster;

      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.debug('player mounted');
              measureDomElements();
              setupResizeObserver();
              _context.next = 5;
              return core.init();

            case 5:
              _yield$core$init = _context.sent;
              isPausable = _yield$core$init.isPausable;
              isSeekable = _yield$core$init.isSeekable;
              poster = _yield$core$init.poster;
              setState({
                isPausable: isPausable,
                isSeekable: isSeekable
              });

              if (poster !== undefined && !autoPlay) {
                setState({
                  lines: poster.lines,
                  cursor: poster.cursor
                });
              }

              if (autoPlay) {
                play();
              }

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
    onCleanup(function () {
      core.stop();
      stopBlinking();
      stopTimeUpdates();
      resizeObserver.disconnect();
    });
    createEffect(function () {
      var s = state.state;

      if (s === 'playing') {
        startBlinking();
        startTimeUpdates();
      } else if (s === 'paused') {
        stopBlinking();
        stopTimeUpdates();
        updateTime();
      }
    });

    var play = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
        var timeoutId;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                setState('state', 'loading');
                timeoutId = setTimeout(function () {
                  setState('state', 'waiting');
                }, 1000);
                _context2.next = 4;
                return core.play();

              case 4:
                clearTimeout(timeoutId);
                setState('state', 'playing');

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function play() {
        return _ref2.apply(this, arguments);
      };
    }();

    var pauseOrResume = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
        var isPlaying;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return core.pauseOrResume();

              case 2:
                isPlaying = _context3.sent;
                setState('state', isPlaying ? 'playing' : 'paused');

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function pauseOrResume() {
        return _ref3.apply(this, arguments);
      };
    }();

    var seek = /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(pos) {
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return core.seek(pos);

              case 2:
                if (!_context4.sent) {
                  _context4.next = 4;
                  break;
                }

                updateTime();

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      return function seek(_x) {
        return _ref4.apply(this, arguments);
      };
    }();

    var updateTerminal = function updateTerminal() {
      var changedLines = core.getChangedLines();

      if (changedLines) {
        changedLines.forEach(function (line, i) {
          setState('lines', i, reconcile(line));
        });
      }

      setState('cursor', reconcile(core.getCursor()));
      setState('cursorHold', true);
      frameRequestId = undefined;
    };

    var terminalSize = createMemo(function () {
      var _props$fit;

      if (!state.charW) {
        return;
      }

      console.debug("containerW = ".concat(state.containerW));
      var terminalW = state.charW * terminalCols() + state.bordersW;
      var terminalH = state.charH * terminalRows() + state.bordersH;
      var fit = (_props$fit = props.fit) !== null && _props$fit !== void 0 ? _props$fit : 'width';

      if (fit === 'both' || !!document.fullscreenElement) {
        var containerRatio = state.containerW / state.containerH;
        var terminalRatio = terminalW / terminalH;

        if (containerRatio > terminalRatio) {
          fit = 'height';
        } else {
          fit = 'width';
        }
      }

      if (fit === false || fit === 'none') {
        return {};
      } else if (fit === 'width') {
        var scale = state.containerW / terminalW;
        return {
          scale: scale,
          width: state.containerW,
          height: terminalH * scale
        };
      } else if (fit === 'height') {
        var _scale = state.containerH / terminalH;

        return {
          scale: _scale,
          width: terminalW * _scale,
          height: state.containerH
        };
      } else {
        throw "unsupported fit mode: ".concat(fit);
      }
    });

    var toggleFullscreen = function toggleFullscreen() {
      var _document$fullscreenE;

      if ((_document$fullscreenE = document.fullscreenElement) !== null && _document$fullscreenE !== void 0 ? _document$fullscreenE : document.webkitFullscreenElement) {
        var _ref5, _document$exitFullscr;

        ((_ref5 = (_document$exitFullscr = document.exitFullscreen) !== null && _document$exitFullscr !== void 0 ? _document$exitFullscr : document.webkitExitFullscreen) !== null && _ref5 !== void 0 ? _ref5 : function () {}).apply(document);
      } else {
        var _ref6, _wrapperRef$requestFu;

        ((_ref6 = (_wrapperRef$requestFu = wrapperRef.requestFullscreen) !== null && _wrapperRef$requestFu !== void 0 ? _wrapperRef$requestFu : wrapperRef.webkitRequestFullscreen) !== null && _ref6 !== void 0 ? _ref6 : function () {}).apply(wrapperRef);
      }
    };

    var onKeyPress = function onKeyPress(e) {
      if (e.altKey || e.shiftKey || e.metaKey || e.ctrlKey) {
        return;
      }

      if (e.key == ' ') {
        pauseOrResume();
      } else if (e.key == 'f') {
        toggleFullscreen();
      } else if (e.key == 'ArrowLeft') {
        seek('<<');
      } else if (e.key == 'ArrowRight') {
        seek('>>');
      } else if (e.key.charCodeAt(0) >= 48 && e.key.charCodeAt(0) <= 57) {
        var pos = (e.key.charCodeAt(0) - 48) / 10;
        seek("".concat(pos * 100, "%"));
      } else {
        return;
      }

      e.preventDefault();
    };

    var startTimeUpdates = function startTimeUpdates() {
      timeUpdateIntervalId = setInterval(updateTime, 100);
    };

    var stopTimeUpdates = function stopTimeUpdates() {
      clearInterval(timeUpdateIntervalId);
    };

    var updateTime = function updateTime() {
      var currentTime = core.getCurrentTime();
      var remainingTime = core.getRemainingTime();
      var progress = core.getProgress();
      setState({
        currentTime: currentTime,
        remainingTime: remainingTime,
        progress: progress
      });
    };

    var startBlinking = function startBlinking() {
      blinkIntervalId = setInterval(function () {
        setState(function (state) {
          var changes = {
            blink: !state.blink
          };

          if (changes.blink) {
            changes.cursorHold = false;
          }

          return changes;
        });
      }, 500);
    };

    var stopBlinking = function stopBlinking() {
      clearInterval(blinkIntervalId);
      setState('blink', true);
    };

    var showControls = function showControls(show) {
      clearTimeout(userActivityTimeoutId);

      if (show) {
        userActivityTimeoutId = setTimeout(function () {
          return showControls(false);
        }, 2000);
      }

      setState('showControls', show);
    };

    var playerStyle = function playerStyle() {
      var style = {};

      if ((props.fit === false || props.fit === 'none') && props.fontSize !== undefined) {
        if (props.fontSize === 'small') {
          style['font-size'] = '12px';
        } else if (props.fontSize === 'medium') {
          style['font-size'] = '18px';
        } else if (props.fontSize === 'big') {
          style['font-size'] = '24px';
        } else {
          style['font-size'] = props.fontSize;
        }
      }

      var size = terminalSize();

      if (size === undefined) {
        style['height'] = 0;
        return style;
      }

      if (size.width !== undefined) {
        style['width'] = "".concat(size.width, "px");
        style['height'] = "".concat(size.height, "px");
      }

      return style;
    };

    var playerClass = function playerClass() {
      var _props$theme;

      return "asciinema-player asciinema-theme-".concat((_props$theme = props.theme) !== null && _props$theme !== void 0 ? _props$theme : 'asciinema');
    };

    var terminalScale = function terminalScale() {
      var _terminalSize;

      return (_terminalSize = terminalSize()) === null || _terminalSize === void 0 ? void 0 : _terminalSize.scale;
    };

    return function () {
      var _el$ = _tmpl$.cloneNode(true),
          _el$2 = _el$.firstChild;

      var _ref$ = wrapperRef;
      typeof _ref$ === "function" ? _ref$(_el$) : wrapperRef = _el$;
      _el$.$$keydown = onKeyPress;

      _el$.addEventListener("keypress", onKeyPress);

      var _ref$2 = playerRef;
      typeof _ref$2 === "function" ? _ref$2(_el$2) : playerRef = _el$2;

      _el$2.$$mousemove = function () {
        return showControls(true);
      };

      _el$2.addEventListener("mouseleave", function () {
        return showControls(false);
      });

      _el$2.addEventListener("mouseenter", function () {
        return showControls(true);
      });

      insert(_el$2, createComponent(Terminal, {
        get cols() {
          return terminalCols();
        },

        get rows() {
          return terminalRows();
        },

        get scale() {
          return terminalScale();
        },

        get blink() {
          return state.blink;
        },

        get lines() {
          return state.lines;
        },

        get cursor() {
          return state.cursor;
        },

        get cursorHold() {
          return state.cursorHold;
        },

        ref: function ref(r$) {
          var _ref$3 = terminalRef;
          typeof _ref$3 === "function" ? _ref$3(r$) : terminalRef = r$;
        }
      }), null);

      insert(_el$2, createComponent(ControlBar, {
        get currentTime() {
          return state.currentTime;
        },

        get remainingTime() {
          return state.remainingTime;
        },

        get progress() {
          return state.progress;
        },

        get isPlaying() {
          return state.state == 'playing';
        },

        get isPausable() {
          return state.isPausable;
        },

        get isSeekable() {
          return state.isSeekable;
        },

        onPlayClick: pauseOrResume,
        onFullscreenClick: toggleFullscreen,
        onSeekClick: seek
      }), null);

      insert(_el$2, createComponent(Switch, {
        get children() {
          return [createComponent(Match, {
            get when() {
              return state.state == 'initial' && !autoPlay;
            },

            get children() {
              return createComponent(StartOverlay, {
                onClick: play
              });
            }

          }), createComponent(Match, {
            get when() {
              return state.state == 'waiting';
            },

            get children() {
              return createComponent(LoaderOverlay, {});
            }

          })];
        }

      }), null);

      createRenderEffect(function (_p$) {
        var _v$ = state.showControls,
            _v$2 = playerClass(),
            _v$3 = playerStyle();

        _v$ !== _p$._v$ && _el$.classList.toggle("hud", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && (_el$2.className = _p$._v$2 = _v$2);
        _p$._v$3 = style$1(_el$2, _v$3, _p$._v$3);
        return _p$;
      }, {
        _v$: undefined,
        _v$2: undefined,
        _v$3: undefined
      });

      return _el$;
    }();
  });

  delegateEvents(["keydown", "mousemove"]);

  // Efficient array transformations without intermediate array objects.
  // Inspired by Clojure's transducers and Elixir's streams.
  var Stream = /*#__PURE__*/function (_Symbol$iterator) {
    function Stream(input, xfs) {
      _classCallCheck(this, Stream);

      this.input = input;
      this.xfs = xfs !== null && xfs !== void 0 ? xfs : [];
    }

    _createClass(Stream, [{
      key: "map",
      value: function map(f) {
        return this.transform(Map$1(f));
      }
    }, {
      key: "flatMap",
      value: function flatMap(f) {
        return this.transform(FlatMap(f));
      }
    }, {
      key: "filter",
      value: function filter(f) {
        return this.transform(Filter(f));
      }
    }, {
      key: "take",
      value: function take(n) {
        return this.transform(Take(n));
      }
    }, {
      key: "drop",
      value: function drop(n) {
        return this.transform(Drop(n));
      }
    }, {
      key: "transform",
      value: function transform(f) {
        return new Stream(this.input, this.xfs.concat([f]));
      }
    }, {
      key: "toArray",
      value: function toArray() {
        return Array.from(this);
      }
    }, {
      key: _Symbol$iterator,
      value: function value() {
        var _this = this;

        var i = 0;
        var v = 0;
        var values = [];
        var flushed = false;
        var xf = compose(this.xfs, function (val) {
          return values.push(val);
        });
        return {
          next: function next() {
            if (v === values.length) {
              values = [];
              v = 0;
            }

            while (values.length === 0 && i < _this.input.length) {
              xf.step(_this.input[i++]);
            }

            if (values.length === 0 && !flushed) {
              xf.flush();
              flushed = true;
            }

            if (values.length > 0) {
              return {
                done: false,
                value: values[v++]
              };
            } else {
              return {
                done: true
              };
            }
          }
        };
      }
    }]);

    return Stream;
  }(Symbol.iterator);

  function Map$1(f) {
    return function (emit) {
      return function (input) {
        emit(f(input));
      };
    };
  }

  function FlatMap(f) {
    return function (emit) {
      return function (input) {
        f(input).forEach(emit);
      };
    };
  }

  function Filter(f) {
    return function (emit) {
      return function (input) {
        if (f(input)) {
          emit(input);
        }
      };
    };
  }

  function Take(n) {
    var c = 0;
    return function (emit) {
      return function (input) {
        if (c < n) {
          emit(input);
        }

        c += 1;
      };
    };
  }

  function Drop(n) {
    var c = 0;
    return function (emit) {
      return function (input) {
        c += 1;

        if (c > n) {
          emit(input);
        }
      };
    };
  }

  function compose(xfs, push) {
    return xfs.reverse().reduce(function (next, curr) {
      var xf = toXf(curr(next.step));
      return {
        step: xf.step,
        flush: function flush() {
          xf.flush();
          next.flush();
        }
      };
    }, toXf(push));
  }

  function toXf(xf) {
    if (typeof xf === 'function') {
      return {
        step: xf,
        flush: function flush() {}
      };
    } else {
      return xf;
    }
  }

  function asciicast(_ref, _ref2, _ref3) {
    var url = _ref.url;
    var feed = _ref2.feed,
        now = _ref2.now,
        setTimeout = _ref2.setTimeout,
        onFinish = _ref2.onFinish;
    var idleTimeLimit = _ref3.idleTimeLimit;
    var cols;
    var rows;
    var frames;
    var duration;
    var timeoutId;
    var nextFrameIndex = 0;
    var elapsedVirtualTime = 0;
    var startTime;
    var pauseElapsedTime;

    function load() {
      return _load.apply(this, arguments);
    }

    function _load() {
      _load = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
        var _asciicast;

        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!frames) {
                  // const res = await fetch(url);
                  _asciicast = parseAsciicast(url);
                  cols = _asciicast.cols;
                  rows = _asciicast.rows;
                  frames = prepareFrames(_asciicast.frames, idleTimeLimit !== null && idleTimeLimit !== void 0 ? idleTimeLimit : _asciicast.idleTimeLimit);
                  duration = frames[frames.length - 1][0];
                }

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));
      return _load.apply(this, arguments);
    }

    function scheduleNextFrame() {
      var nextFrame = frames[nextFrameIndex];

      if (nextFrame) {
        var t = nextFrame[0] * 1000;
        var elapsedWallTime = now() - startTime;
        var timeout = t - elapsedWallTime;

        if (timeout < 0) {
          timeout = 0;
        }

        timeoutId = setTimeout(runFrame, timeout);
      } else {
        timeoutId = null;
        pauseElapsedTime = duration * 1000;
        onFinish();
      }
    }

    function runFrame() {
      var frame = frames[nextFrameIndex];
      var elapsedWallTime;

      do {
        feed(frame[1]);
        elapsedVirtualTime = frame[0] * 1000;
        frame = frames[++nextFrameIndex];
        elapsedWallTime = now() - startTime;
      } while (frame && elapsedWallTime > frame[0] * 1000);

      scheduleNextFrame();
    }

    function pause() {
      clearTimeout(timeoutId);
      timeoutId = null;
      pauseElapsedTime = now() - startTime;
    }

    function resume() {
      startTime = now() - pauseElapsedTime;
      pauseElapsedTime = null;
      scheduleNextFrame();
    }

    function _seek(where) {
      var isPlaying = !!timeoutId;

      if (isPlaying) {
        pause();
      }

      if (typeof where === 'number') {
        where = Math.min(1, where / duration);
      } else if (where === '<<') {
        var _pauseElapsedTime;

        where = Math.max(0, ((_pauseElapsedTime = pauseElapsedTime) !== null && _pauseElapsedTime !== void 0 ? _pauseElapsedTime : 0) / (duration * 1000) - 0.1);
      } else if (where === '>>') {
        var _pauseElapsedTime2;

        where = Math.min(1, ((_pauseElapsedTime2 = pauseElapsedTime) !== null && _pauseElapsedTime2 !== void 0 ? _pauseElapsedTime2 : 0) / (duration * 1000) + 0.1);
      } else if (typeof where === 'string') {
        if (where[where.length - 1] === '%') {
          where = parseFloat(where.substring(0, where.length - 1)) / 100;
        } else {
          where = Math.min(1, parseNpt(where) / duration);
        }
      }

      var targetTime = duration * where * 1000;

      if (targetTime < elapsedVirtualTime) {
        feed('\x1bc'); // reset terminal

        nextFrameIndex = 0;
        elapsedVirtualTime = 0;
      }

      var frame = frames[nextFrameIndex];

      while (frame && frame[0] * 1000 < targetTime) {
        feed(frame[1]);
        elapsedVirtualTime = frame[0] * 1000;
        frame = frames[++nextFrameIndex];
      }

      pauseElapsedTime = targetTime;

      if (isPlaying) {
        resume();
      }
    }

    function _getPoster(time) {
      var posterTime = time * 1000;
      var poster = [];
      var nextFrameIndex = 0;
      var frame = frames[0];

      while (frame && frame[0] * 1000 < posterTime) {
        poster.push(frame[1]);
        frame = frames[++nextFrameIndex];
      }

      return poster;
    }

    return {
      init: function () {
        var _init = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return load();

                case 2:
                  return _context.abrupt("return", {
                    cols: cols,
                    rows: rows,
                    duration: duration
                  });

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function init() {
          return _init.apply(this, arguments);
        }

        return init;
      }(),
      start: function () {
        var _start = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(startAt) {
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return load();

                case 2:
                  _seek(startAt !== null && startAt !== void 0 ? startAt : 0);

                  resume();

                case 4:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function start(_x) {
          return _start.apply(this, arguments);
        }

        return start;
      }(),
      stop: function stop() {
        clearTimeout(timeoutId);
      },
      pauseOrResume: function pauseOrResume() {
        if (timeoutId) {
          pause();
          return false;
        } else {
          resume();
          return true;
        }
      },
      seek: function seek(where) {
        return _seek(where);
      },
      getPoster: function getPoster(t) {
        return _getPoster(t);
      },
      getCurrentTime: function getCurrentTime() {
        if (timeoutId) {
          return (now() - startTime) / 1000;
        } else {
          var _pauseElapsedTime3;

          return ((_pauseElapsedTime3 = pauseElapsedTime) !== null && _pauseElapsedTime3 !== void 0 ? _pauseElapsedTime3 : 0) / 1000;
        }
      }
    };
  }

  function parseAsciicast(json) {
    try {
      return parseAsciicastV2(json);
    } catch (_error) {
      // not a v2 format - let's try parsing as v1
      return parseAsciicastV1(json);
    }
  }

  function parseAsciicastV1(json) {
    var asciicast = JSON.parse(json);
    var time = 0;
    var frames = new Stream(asciicast.stdout).map(function (e) {
      time += e[0];
      return [time, e[1]];
    });
    return {
      cols: asciicast.width,
      rows: asciicast.height,
      frames: frames
    };
  }

  function parseAsciicastV2(jsonl) {
    var lines = jsonl.split('\n');
    var header = JSON.parse(lines[0]);

    if (header.version !== 2) {
      throw 'not asciicast v2 format';
    }

    var frames = new Stream(lines).drop(1).filter(function (l) {
      return l[0] === '[';
    }).map(function (l) {
      return JSON.parse(l);
    }).filter(function (e) {
      return e[1] === 'o';
    }).map(function (e) {
      return [e[0], e[2]];
    });
    return {
      cols: header.width,
      rows: header.height,
      idleTimeLimit: header.idle_time_limit,
      frames: frames
    };
  }

  function prepareFrames(frames, idleTimeLimit) {
    return Array.from(limitFrames(batchFrames(frames), idleTimeLimit));
  }

  function batchFrames(frames) {
    var maxFrameTime = 1.0 / 60;
    var prevFrame;
    return frames.transform(function (emit) {
      var ic = 0;
      var oc = 0;
      return {
        step: function step(frame) {
          ic++;

          if (prevFrame === undefined) {
            prevFrame = frame;
            return;
          }

          if (frame[0] - prevFrame[0] < maxFrameTime) {
            prevFrame[1] += frame[1];
          } else {
            emit(prevFrame);
            prevFrame = frame;
            oc++;
          }
        },
        flush: function flush() {
          if (prevFrame !== undefined) {
            emit(prevFrame);
            oc++;
          }

          console.debug("batched ".concat(ic, " frames to ").concat(oc, " frames"));
        }
      };
    });
  }

  function limitFrames(frames) {
    var idleTimeLimit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;
    var prevT = 0;
    var shift = 0;
    return frames.map(function (e) {
      var delay = e[0] - prevT;
      var cappedDelay = Math.min(delay, idleTimeLimit);
      shift += delay - cappedDelay;
      prevT = e[0];
      return [e[0] - shift, e[1]];
    });
  }

  function test(_ref, callbacks, opts) {
    var kind = _ref.kind;

    if (kind == 'random') {
      return random(callbacks);
    } else if (kind == 'clock') {
      return clock(callbacks, opts);
    }
  }

  function random(_ref2) {
    var feed = _ref2.feed,
        setTimeout = _ref2.setTimeout;
    var base = ' '.charCodeAt(0);
    var range = '~'.charCodeAt(0) - base;
    var timeoutId;

    var schedule = function schedule() {
      var t = Math.pow(5, Math.random() * 4);
      timeoutId = setTimeout(print, t);
    };

    var print = function print() {
      schedule();
      var char = String.fromCharCode(base + Math.floor(Math.random() * range));
      feed(char);
    };

    return function () {
      schedule();
      return function () {
        return clearInterval(timeoutId);
      };
    };
  }

  function clock(_ref3, _ref4) {
    var feed = _ref3.feed;
    var _ref4$cols = _ref4.cols,
        cols = _ref4$cols === void 0 ? 5 : _ref4$cols,
        _ref4$rows = _ref4.rows,
        rows = _ref4$rows === void 0 ? 1 : _ref4$rows;
    var middleRow = Math.floor(rows / 2);
    var leftPad = Math.floor(cols / 2) - 2;
    var intervalId;
    return {
      cols: cols,
      rows: rows,
      duration: 24 * 60,
      start: function start() {
        setTimeout(function () {
          feed("\x1B[?25l\x1B[1m\x1B[".concat(middleRow, "B"));
        }, 0);
        intervalId = setInterval(function () {
          var d = new Date();
          var h = d.getHours();
          var m = d.getMinutes();
          feed('\r');

          for (var i = 0; i < leftPad; i++) {
            feed(' ');
          }

          feed('\x1b[32m');

          if (h < 10) {
            feed('0');
          }

          feed("".concat(h));
          feed('\x1b[39;5m:\x1b[25;35m');

          if (m < 10) {
            feed('0');
          }

          feed("".concat(m));
        }, 1000);
      },
      stop: function stop() {
        clearInterval(intervalId);
      },
      getCurrentTime: function getCurrentTime() {
        var d = new Date();
        return d.getHours() * 60 + d.getMinutes();
      }
    };
  }

  var Queue = /*#__PURE__*/function () {
    function Queue() {
      _classCallCheck(this, Queue);

      this.first = undefined;
      this.last = undefined;
      this.onPush = undefined;
    }

    _createClass(Queue, [{
      key: "push",
      value: function push(item) {
        var node = {
          item: item
        };

        if (this.last !== undefined) {
          this.last = this.last.next = node;
        } else {
          this.last = this.first = node;
        }

        if (this.onPush) {
          this.onPush(this.pop());
          this.onPush = undefined;
        }
      }
    }, {
      key: "pop",
      value: function pop() {
        var node = this.first;

        if (node !== undefined) {
          this.first = node.next;

          if (this.first === undefined) {
            this.last = undefined;
          }

          return node.item;
        } else {
          var thiz = this;
          return new Promise(function (resolve) {
            thiz.onPush = resolve;
          });
        }
      }
    }, {
      key: "forEach",
      value: function forEach(f) {
        var _this = this;

        var stop = false;

        var go = /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
            var item;
            return regenerator.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    item = _this.pop();

                  case 1:
                    if (!(_typeof(item) !== 'object' || typeof item.then !== 'function')) {
                      _context.next = 9;
                      break;
                    }

                    if (!stop) {
                      _context.next = 4;
                      break;
                    }

                    return _context.abrupt("return");

                  case 4:
                    _context.next = 6;
                    return f(item);

                  case 6:
                    item = _this.pop();
                    _context.next = 1;
                    break;

                  case 9:
                    _context.next = 11;
                    return item;

                  case 11:
                    item = _context.sent;

                    if (!stop) {
                      _context.next = 14;
                      break;
                    }

                    return _context.abrupt("return");

                  case 14:
                    _context.next = 16;
                    return f(item);

                  case 16:
                    go();

                  case 17:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          return function go() {
            return _ref.apply(this, arguments);
          };
        }();

        setTimeout(go, 0);
        return function () {
          stop = true;
        };
      }
    }]);

    return Queue;
  }();

  function buffer(feed, bufferTime) {
    var events = new Queue();
    var startTime;
    var stopFeeding = events.forEach( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(event) {
        var elapsedWallTime, elapsedStreamTime;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                elapsedWallTime = now() - startTime;
                elapsedStreamTime = (event[0] + bufferTime) * 1000;

                if (!(elapsedStreamTime > elapsedWallTime)) {
                  _context.next = 5;
                  break;
                }

                _context.next = 5;
                return sleep(elapsedStreamTime - elapsedWallTime);

              case 5:
                feed(event[2]);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    return {
      pushEvent: function pushEvent(event) {
        if (startTime === undefined) {
          startTime = now();
        }

        if (event[1] != 'o') return;
        events.push(event);
      },
      pushText: function pushText(text) {
        if (startTime === undefined) {
          startTime = now();
        }

        var time = (now() - startTime) / 1000;
        events.push([time, 'o', text]);
      },
      stop: function stop() {
        stopFeeding();
      }
    };
  }

  function now() {
    return new Date().getTime();
  }

  function sleep(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t);
    });
  }

  function websocket(_ref, _ref2) {
    var url = _ref.url,
        _ref$bufferTime = _ref.bufferTime,
        bufferTime = _ref$bufferTime === void 0 ? 0 : _ref$bufferTime;
    var feed = _ref2.feed,
        reset = _ref2.reset;
    var utfDecoder = new TextDecoder();
    var socket;
    var buf;
    var reconnectDelay = 250;
    var _stop = false;

    function initBuffer() {
      if (buf !== undefined) buf.stop();
      buf = buffer(feed, bufferTime);
    }

    function connect() {
      socket = new WebSocket(url);
      socket.binaryType = 'arraybuffer';

      socket.onopen = function () {
        console.debug('websocket: opened');
        initBuffer();
        reconnectDelay = 250;
      };

      socket.onmessage = function (event) {
        if (typeof event.data === 'string') {
          var e = JSON.parse(event.data);

          if (e.cols !== undefined || e.width !== undefined) {
            var _e$cols, _e$rows;

            initBuffer();
            reset((_e$cols = e.cols) !== null && _e$cols !== void 0 ? _e$cols : e.width, (_e$rows = e.rows) !== null && _e$rows !== void 0 ? _e$rows : e.height);
          } else {
            buf.pushEvent(e);
          }
        } else {
          buf.pushText(utfDecoder.decode(event.data));
        }
      };

      socket.onclose = function (event) {
        if (_stop || event.wasClean) {
          console.debug('websocket: closed');
        } else {
          console.debug("websocket: unclean close, reconnecting in ".concat(reconnectDelay, "..."));
          setTimeout(connect, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, 5000);
        }
      };
    }

    return {
      start: function start() {
        connect();
      },
      stop: function stop() {
        _stop = true;
        if (buf !== undefined) buf.stop();
        if (socket !== undefined) socket.close();
      }
    };
  }

  function eventsource(_ref, _ref2) {
    var url = _ref.url,
        _ref$bufferTime = _ref.bufferTime,
        bufferTime = _ref$bufferTime === void 0 ? 0 : _ref$bufferTime;
    var feed = _ref2.feed,
        reset = _ref2.reset;
    var es;
    var buf;

    function initBuffer() {
      if (buf !== undefined) buf.stop();
      buf = buffer(feed, bufferTime);
    }

    return {
      start: function start() {
        es = new EventSource(url);
        es.addEventListener('open', function () {
          console.debug('eventsource: opened');
          initBuffer();
        });
        es.addEventListener('message', function (event) {
          var e = JSON.parse(event.data);

          if (e.cols !== undefined || e.width !== undefined) {
            var _e$cols, _e$rows;

            initBuffer();
            reset((_e$cols = e.cols) !== null && _e$cols !== void 0 ? _e$cols : e.width, (_e$rows = e.rows) !== null && _e$rows !== void 0 ? _e$rows : e.height);
          } else {
            buf.pushEvent(e);
          }
        });
        es.addEventListener('done', function () {
          console.debug('eventsource: closed');
          es.close();
        });
      },
      stop: function stop() {
        if (buf !== undefined) buf.stop();
        if (es !== undefined) es.close();
      }
    };
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

  function create(src, elem) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var props = _objectSpread({
      driverFn: getDriver(src)
    }, opts);

    var el;
    var dispose = render(function () {
      el = createComponent(Player, props);
      return el;
    }, elem);
    return {
      el: el,
      dispose: dispose
    };
  }

  function getDriver(src) {
    if (typeof src === 'string') {
      if (src.substring(0, 5) == 'ws://' || src.substring(0, 6) == 'wss://') {
        src = {
          driver: 'websocket',
          url: src
        };
      } else if (src.substring(0, 7) == 'test://') {
        src = {
          driver: 'test',
          kind: src.substring(7)
        };
      } else {
        src = {
          driver: 'asciicast',
          url: src
        };
      }
    }

    var drivers = new Map([['asciicast', asciicast], ['websocket', websocket], ['eventsource', eventsource], ['test', test]]);

    if (typeof src === 'function') {
      return src;
    } else if (drivers.has(src.driver)) {
      var driver = drivers.get(src.driver);
      return function (callbacks, opts) {
        return driver(src, callbacks, opts);
      };
    } else {
      throw "unsupported driver: ".concat(JSON.stringify(src));
    }
  }

  exports.create = create;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
