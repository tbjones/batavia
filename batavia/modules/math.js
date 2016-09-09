
batavia.modules.math = {
    __doc__: "",
    __file__: "math.js",
    __name__: "math",
    __package__: "",
    e: new batavia.types.Float(Math.E),
    nan: new batavia.types.Float(NaN),
    pi: new batavia.types.Float(Math.PI),
    inf: new batavia.types.Float(Infinity),

    _checkFloat: function(x) {
        if (batavia.isinstance(x, batavia.types.Complex)) {
            throw new batavia.builtins.TypeError("can't convert complex to float");
        } else if (!batavia.isinstance(x, [batavia.types.Bool, batavia.types.Float, batavia.types.Int])) {
            throw new batavia.builtins.TypeError('a float is required');
        }
    },

    acos: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.acos(x.__float__().val));
    },

    acosh: function(x) {
        batavia.modules.math._checkFloat(x);
        var result = Math.acosh(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        return new batavia.types.Float(result);
    },

    asin: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.asin(x.__float__().val));
    },

    asinh: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.asinh(x.__float__().val));
    },

    atan: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.atan(x.__float__().val));
    },

    atan2: function(y, x) {
        batavia.modules.math._checkFloat(x);
        var xx = x.__float__().val;
        batavia.modules.math._checkFloat(y);
        var yy = y.__float__().val;
        return new batavia.types.Float(Math.atan2(yy, xx));
    },

    atanh: function(x) {
        batavia.modules.math._checkFloat(x);
        var result = Math.atanh(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        return new batavia.types.Float(Math.atanh(x.__float__().val));
    },

    ceil: function(x) {
        if (batavia.isinstance(x, batavia.types.Int)) {
            return x;
        }
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Int(Math.ceil(x.__float__().val));
    },

    copysign: function(x, y) {
        batavia.modules.math._checkFloat(y);
        batavia.modules.math._checkFloat(x);
        var yy = y.__float__().val;
        var xx = x.__float__().val;
        if ((xx >= 0) != (yy >= 0)) {
            return x.__float__().__neg__();
        }
        return x;
    },

    cos: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.cos(x.__float__().val));
    },

    cosh: function(x) {
        batavia.modules.math._checkFloat(x);
        var result = Math.cosh(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.OverflowError("math range error");
        }
        return new batavia.types.Float(Math.cosh(x.__float__().val));
    },

    degrees: function(x) {
        batavia.modules.math._checkFloat(x);
        // multiply by 180 / math.pi
        return new batavia.types.Float(x.__float__().val * 57.295779513082322865);
    },

    // taylor series expansion for erf(x)
    _erf_series: function(x) {
        // From CPython docs:
        //
        // erf(x) = x*exp(-x*x)/sqrt(pi) * [
        //                    2/1 + 4/3 x**2 + 8/15 x**4 + 16/105 x**6 + ...]
        // x**(2k-2) here is 4**k*factorial(k)/factorial(2*k)
        var y = 2.0;
        var num = 4;
        var denom = 2;
        var xk = 1;
        // CPython uses 25 terms.
        for (var i = 2; i < 26; i++) {
            num *= 4;
            num *= i;
            for (var j = 2 * (i - 1) + 1; j <= 2 * i; j++) {
              denom *= j;
            }
            xk *= x * x;
            y += xk * num / denom;
        }
        return y * x * Math.exp(-x * x) / Math.sqrt(Math.PI);
    },

    // continued fraction expansion of 1 - erf(x)
    _erfc_cfrac: function(x) {
        // From CPython docs:
        //
        // erfc(x) = x*exp(-x*x)/sqrt(pi) * [1/(0.5 + x**2 -) 0.5/(2.5 + x**2 - )
        //                               3.0/(4.5 + x**2 - ) 7.5/(6.5 + x**2 - ) ...]
        //
        //    after the first term, the general term has the form:
        //
        //       k*(k-0.5)/(2*k+0.5 + x**2 - ...).

        if (x > 30.0) {
            return 0.0;
        }

        var p_n = 1;
        var p_n_1 = 0.0;
        var q_n = 0.5 + x * x;
        var q_n_1 = 1.0;
        var a = 0.0;
        var coeff = 0.5;

        // CPython uses 50 terms.
        for (var k = 0; k < 50; k++) {
            a += coeff;
            coeff += 2;
            var b = coeff + x * x;

            var t = p_n;
            p_n = b * p_n - a * p_n_1;
            p_n_1 = t;

            t = q_n;
            q_n = b * q_n - a * q_n_1;
            q_n_1 = t;
        }
        return p_n / q_n * x * Math.exp(-x * x) / Math.sqrt(Math.PI);
    },

    erf: function(x) {
        batavia.modules.math._checkFloat(x);
        var xx = x.__float__().val;
        // Save the sign of x
        var sign = 1;
        if (xx < 0) {
            sign = -1;
        }
        xx = Math.abs(x);

        var CUTOFF = 1.5;
        var result;
        if (xx < 1.5) {
            result = batavia.modules.math._erf_series(xx);
        } else {
            result = 1.0 - batavia.modules.math._erfc_cfrac(xx);
        }
        return new batavia.types.Float(sign * result);
    },

    erfc: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(1.0 - batavia.modules.math.erf(x).val);
    },

    exp: function(x) {
        batavia.modules.math._checkFloat(x);
        var result = Math.exp(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.OverflowError("math range error");
        }
        return new batavia.types.Float(result);
    },

    expm1: function(x) {
        batavia.modules.math._checkFloat(x);
        var result = Math.expm1(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.OverflowError("math range error");
        }
        return new batavia.types.Float(Math.expm1(x.__float__().val));
    },

    fabs: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.abs(x.__float__().val));
    },

    // efficiently multiply all of the bignumbers in the list together, returning the product
    _mul_list: function(l, start, end) {
        var len = end - start + 1;
        if (len == 0) {
            return new batavia.vendored.BigNumber(1);
        } else if (len == 1) {
            return l[start];
        } else if (len == 2) {
            return l[start].mul(l[start + 1]);
        } else if (len == 3) {
            return l[start].mul(l[start + 1]).mul(l[start + 2]);
        }

        // split into halves and recurse
        var mid = Math.round(start + len/2);
        var a = batavia.modules.math._mul_list(l, start, mid);
        var b = batavia.modules.math._mul_list(l, mid + 1, end);
        return a.mul(b);
    },

    factorial: function(x) {
        var num;

        if (batavia.isinstance(x, batavia.types.Int)) {
            num = x.val;
        } else if (batavia.isinstance(x, batavia.types.Float)) {
            if (!x.is_integer().valueOf()) {
                throw new batavia.builtins.ValueError("factorial() only accepts integral values");
            }
            num = new batavia.vendored.BigNumber(x.valueOf());
        } else if (batavia.isinstance(x, batavia.types.Bool)) {
            return new batavia.types.Int(1);
        } else if (batavia.isinstance(x, batavia.types.Complex)) {
            throw new batavia.builtins.TypeError("can't convert complex to int");
        } else if (x == null) {
            throw new batavia.builtins.TypeError("an integer is required (got type NoneType)");
        } else {
            throw new batavia.builtins.TypeError("an integer is required (got type " + x.__class__.__name__ + ")");
        }

        if (num.isNegative()) {
            throw new batavia.builtins.ValueError("factorial() not defined for negative values");
        }

        if (num.isZero()) {
            return new batavia.types.Int(1);
        }

        // a basic pyramid multiplication
        var nums = [];
        while (!num.isZero()) {
            nums.push(num);
            num = num.sub(1);
        }
        return new batavia.types.Int(batavia.modules.math._mul_list(nums, 0, nums.length - 1));
    },

    floor: function(x) {
        if (batavia.isinstance(x, batavia.types.Int)) {
            return x;
        }
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Int(Math.floor(x.__float__().val));
    },

    fmod: function(x, y) {
        batavia.modules.math._checkFloat(y);
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(x.__float__().val % y.__float__().val);
    },

    frexp: function(x) {
        batavia.modules.math._checkFloat(x);
        var xx = x.__float__().val;
        // check for 0, -0, NaN, Inf, -Inf
        if (xx === 0 || !isFinite(xx)) {
            return new batavia.types.Tuple([x.__float__(), new batavia.types.Int(0)]);
        }
        var buff = new batavia.vendored.buffer.Buffer(8);
        buff.writeDoubleLE(x, 0);
        var a = buff.readUInt32LE(0);
        var b = buff.readUInt32LE(4);
        var exp = ((b >> 20) & 0x7ff) - 1022;
        var num;
        // check for denormal number
        if (exp == -1022) {
            // each leading zero increases the exponent
            num = (b & 0xfffff) * 4294967296 + a;
            while ((num != 0) && (num < 0x8000000000000)) {
                exp--;
                num *= 2;
            }
            num = num / 0x10000000000000;
        } else {
          num = 0x10000000000000 + (b & 0xfffff) * 4294967296 + a;
          num = num / 0x20000000000000;
        }
        if (b >> 31) {
            num = -num;
        }
        return new batavia.types.Tuple([new batavia.types.Float(num), new batavia.types.Int(exp)]);
    },

    fsum: function() {
        throw new batavia.builtins.NotImplementedError("math.fsum has not been implemented");
    },

    gamma: function() {
        throw new batavia.builtins.NotImplementedError("math.gamma has not been implemented");
    },

    gcd: function() {
        throw new batavia.builtins.NotImplementedError("math.gcd has not been implemented");
    },

    hypot: function(x, y) {
        batavia.modules.math._checkFloat(x);
        batavia.modules.math._checkFloat(y);
        return new batavia.types.Float(Math.hypot(x.__float__().val, y.__float__().val));
    },

    isclose: function() {
        throw new batavia.builtins.NotImplementedError("math.isclose has not been implemented");
    },

    isfinite: function() {
        throw new batavia.builtins.NotImplementedError("math.isfinite has not been implemented");
    },

    isinf: function() {
        throw new batavia.builtins.NotImplementedError("math.isinf has not been implemented");
    },

    isnan: function() {
        throw new batavia.builtins.NotImplementedError("math.isnan has not been implemented");
    },

    ldexp: function() {
        throw new batavia.builtins.NotImplementedError("math.ldexp has not been implemented");
    },

    lgamma: function() {
        throw new batavia.builtins.NotImplementedError("math.lgamma has not been implemented");
    },

    log: function(x, base) {
        if (x == null) {
            throw new batavia.builtins.TypeError("a float is required");
        }

        // special case if both arguments are very large integers
        if (batavia.isinstance(x, batavia.types.Int) &&
            batavia.isinstance(base, batavia.types.Int)) {
            return batavia.modules.math._log2_int(x).__div__(batavia.modules.math._log2_int(base));
        }

        batavia.modules.math._checkFloat(x);
        if (x.__le__(new batavia.types.Float(0.0))) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        if (x.__eq__(new batavia.types.Float(1.0)) && batavia.isinstance(base, batavia.types.Int) && base.val.gt(1)) {
            return new batavia.types.Float(0.0);
        }
        var bb;
        if (typeof base !== 'undefined') {
            batavia.modules.math._checkFloat(base);
            if (base.__le__(new batavia.types.Float(0.0))) {
                throw new batavia.builtins.ValueError("math domain error");
            }
            bb = base.__float__().val;
        }
        if (typeof base !== 'undefined') {
            batavia.modules.math._checkFloat(base);
            bb = base.__float__().val;
            if (bb <= 0.0) {
                throw new batavia.builtins.ValueError("math domain error");
            }
        }
        if (typeof base === 'undefined') {
            if (batavia.isinstance(x, batavia.types.Int)) {
                if (x.val.isZero() || x.val.isNeg()) {
                    throw new batavia.builtins.ValueError("math domain error");
                }
                if (x.__ge__(batavia.MAX_FLOAT)) {
                    return batavia.modules.math._log2_int(x) * 0.6931471805599453;
                }
            }
            return new batavia.types.Float(Math.log(x.__float__().val));
        }
        if (bb == 1.0) {
            throw new batavia.builtins.ZeroDivisionError("float division by zero");
        }
        return batavia.modules.math.log(x).__div__(batavia.modules.math.log(base));
    },

    log10: function(x) {
        batavia.modules.math._checkFloat(x);
        if (batavia.isinstance(x, batavia.types.Int)) {
            if (x.val.isZero() || x.val.isNeg()) {
                throw new batavia.builtins.ValueError("math domain error");
            }
            if (x.__ge__(batavia.MAX_FLOAT)) {
                return batavia.modules.math._log2_int(x) * 0.30102999566398114;
            }
        }
        var xx = x.__float__().val;
        if (xx <= 0.0) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        return new batavia.types.Float(Math.log10(xx));
    },

    log1p: function(x) {
        batavia.modules.math._checkFloat(x);
        var xx = x.__float__().val;
        if (xx <= -1.0) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        return new batavia.types.Float(Math.log1p(xx));
    },

    // compute log2 of the (possibly large) integer argument
    _log2_int: function(x) {
        if (x.val.isNeg() || x.val.isZero()) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        var bits = x._bits();
        if (bits.length < 54) {
            return new batavia.types.Float(Math.log2(x.__float__().val));
        }
        // express x as M * (2**exp) where 0 <= M < 1.0
        var exp = bits.length;
        bits = bits.slice(0, 54);
        var num = new batavia.vendored.BigNumber(bits.join('') || 0, 2).valueOf();
        num = num / 18014398509481984.0;
        return new batavia.types.Float(Math.log2(num) + exp);
    },

    log2: function(x) {
        batavia.modules.math._checkFloat(x);
        if (batavia.isinstance(x, batavia.types.Int)) {
            return batavia.modules.math._log2_int(x);
        }
        var result = Math.log2(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        return new batavia.types.Float(Math.log2(x.__float__().val));
    },

    modf: function() {
        throw new batavia.builtins.NotImplementedError("math.modf has not been implemented");
    },

    pow: function(x, y) {
        batavia.modules.math._checkFloat(y);
        var yy = y.__float__().val;
        batavia.modules.math._checkFloat(x);
        var xx = x.__float__().val;
        var result = Math.pow(x, y);
        if (xx < 0 && !Number.isInteger(yy) && yy != 0.0) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        if (xx == 0.0 && yy < 0.0) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        if (!isFinite(result)) {
            throw new batavia.builtins.OverflowError("math range error");
        }
        return new batavia.types.Float(result);
    },

    radians: function(x) {
        batavia.modules.math._checkFloat(x);
        // multiply by math.pi / 180
        return new batavia.types.Float(x.__float__().val * 0.017453292519943295);
    },

    sin: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.sin(x.__float__().val));
    },

    sinh: function(x) {
      batavia.modules.math._checkFloat(x);
      var result = Math.sinh(x.__float__().val);
      if (!isFinite(result)) {
          throw new batavia.builtins.OverflowError("math range error");
      }
      return new batavia.types.Float(result);
    },

    sqrt: function(x) {
        batavia.modules.math._checkFloat(x);
        var result = Math.sqrt(x.__float__().val);
        if (!isFinite(result)) {
            throw new batavia.builtins.ValueError("math domain error");
        }
        return new batavia.types.Float(result);
    },

    tan: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.tan(x.__float__().val));
    },

    tanh: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.tanh(x.__float__().val));
    },

    trunc: function(x) {
        batavia.modules.math._checkFloat(x);
        return new batavia.types.Float(Math.trunc(x.__float__().val));
    }
};


// docstrings taken from Python 3, which falls under this license:
// https://docs.python.org/3/license.html
//
batavia.modules.math.acos.__doc__ = 'acos(x)\n\n\nReturn the arc cosine (measured in radians) of x.';
batavia.modules.math.acosh.__doc__ = 'acosh(x)\n\n\nReturn the inverse hyperbolic cosine of x.';
batavia.modules.math.asin.__doc__ = 'asin(x)\n\n\nReturn the arc sine (measured in radians) of x.';
batavia.modules.math.asinh.__doc__ = 'asinh(x)\n\n\nReturn the inverse hyperbolic sine of x.';
batavia.modules.math.atan.__doc__ = 'atan(x)\n\n\nReturn the arc tangent (measured in radians) of x.';
batavia.modules.math.atan2.__doc__ = 'atan2(y, x)\n\n\nReturn the arc tangent (measured in radians) of y/x.\nUnlike atan(y/x), the signs of both x and y are considered.';
batavia.modules.math.atanh.__doc__ = 'atanh(x)\n\n\nReturn the inverse hyperbolic tangent of x.';
batavia.modules.math.ceil.__doc__ = 'ceil(x)\n\n\nReturn the ceiling of x as an int.\nThis is the smallest integral value >= x.';
batavia.modules.math.copysign.__doc__ = 'copysign(x, y)\n\n\nReturn a float with the magnitude (absolute value) of x but the sign \nof y. On platforms that support signed zeros, copysign(1.0, -0.0) \nreturns -1.0.\n';
batavia.modules.math.cos.__doc__ = 'cos(x)\n\n\nReturn the cosine of x (measured in radians).';
batavia.modules.math.cosh.__doc__ = 'cosh(x)\n\n\nReturn the hyperbolic cosine of x.';
batavia.modules.math.degrees.__doc__ = 'degrees(x)\n\n\nConvert angle x from radians to degrees.';
batavia.modules.math.erf.__doc__ = 'erf(x)\n\n\nError function at x.';
batavia.modules.math.erfc.__doc__ = 'erfc(x)\n\n\nComplementary error function at x.';
batavia.modules.math.exp.__doc__ = 'exp(x)\n\n\nReturn e raised to the power of x.';
batavia.modules.math.expm1.__doc__ = 'expm1(x)\n\n\nReturn exp(x)-1.\nThis function avoids the loss of precision involved in the direct evaluation of exp(x)-1 for small x.';
batavia.modules.math.fabs.__doc__ = 'fabs(x)\n\n\nReturn the absolute value of the float x.';
batavia.modules.math.factorial.__doc__ = 'factorial(x) -> Integral\n\n\nFind x!. Raise a ValueError if x is negative or non-integral.';
batavia.modules.math.floor.__doc__ = 'floor(x)\n\n\nReturn the floor of x as an int.\nThis is the largest integral value <= x.';
batavia.modules.math.fmod.__doc__ = 'fmod(x, y)\n\n\nReturn fmod(x, y), according to platform C.  x % y may differ.';
batavia.modules.math.frexp.__doc__ = 'frexp(x)\n\n\nReturn the mantissa and exponent of x, as pair (m, e).\nm is a float and e is an int, such that x = m * 2.**e.\nIf x is 0, m and e are both 0.  Else 0.5 <= abs(m) < 1.0.';
batavia.modules.math.fsum.__doc__ = 'fsum(iterable)\n\n\nReturn an accurate floating point sum of values in the iterable.\nAssumes IEEE-754 floating point arithmetic.';
batavia.modules.math.gamma.__doc__ = 'gamma(x)\n\n\nGamma function at x.';
batavia.modules.math.gcd.__doc__ = 'gcd(x, y) -> int\n\ngreatest common divisor of x and y';
batavia.modules.math.hypot.__doc__ = 'hypot(x, y)\n\n\nReturn the Euclidean distance, sqrt(x*x + y*y).';
batavia.modules.math.isclose.__doc__ = 'is_close(a, b, *, rel_tol=1e-9, abs_tol=0.0) -> bool\n\n\nDetermine whether two floating point numbers are close in value.\n\n\n   rel_tol\n       maximum difference for being considered "close", relative to the\n       magnitude of the input values\n    abs_tol\n       maximum difference for being considered "close", regardless of the\n       magnitude of the input values\n\n\nReturn True if a is close in value to b, and False otherwise.\n\n\nFor the values to be considered close, the difference between them\nmust be smaller than at least one of the tolerances.\n\n\n-inf, inf and NaN behave similarly to the IEEE 754 Standard.  That\nis, NaN is not close to anything, even itself.  inf and -inf are\nonly close to themselves.';
batavia.modules.math.isfinite.__doc__ = 'isfinite(x) -> bool\n\n\nReturn True if x is neither an infinity nor a NaN, and False otherwise.';
batavia.modules.math.isinf.__doc__ = 'isinf(x) -> bool\n\n\nReturn True if x is a positive or negative infinity, and False otherwise.';
batavia.modules.math.isnan.__doc__ = 'isnan(x) -> bool\n\n\nReturn True if x is a NaN (not a number), and False otherwise.';
batavia.modules.math.ldexp.__doc__ = 'ldexp(x, i)\n\n\nReturn x * (2**i).';
batavia.modules.math.lgamma.__doc__ = 'lgamma(x)\n\n\nNatural logarithm of absolute value of Gamma function at x.';
batavia.modules.math.log.__doc__ = 'log(x[, base])\n\n\nReturn the logarithm of x to the given base.\nIf the base not specified, returns the natural logarithm (base e) of x.';
batavia.modules.math.log10.__doc__ = 'log10(x)\n\n\nReturn the base 10 logarithm of x.';
batavia.modules.math.log1p.__doc__ = 'log1p(x)\n\n\nReturn the natural logarithm of 1+x (base e).\nThe result is computed in a way which is accurate for x near zero.';
batavia.modules.math.log2.__doc__ = 'log2(x)\n\n\nReturn the base 2 logarithm of x.';
batavia.modules.math.modf.__doc__ = 'modf(x)\n\n\nReturn the fractional and integer parts of x.  Both results carry the sign\nof x and are floats.';
batavia.modules.math.pow.__doc__ = 'pow(x, y)\n\n\nReturn x**y (x to the power of y).';
batavia.modules.math.radians.__doc__ = 'radians(x)\n\n\nConvert angle x from degrees to radians.';
batavia.modules.math.sin.__doc__ = 'sin(x)\n\n\nReturn the sine of x (measured in radians).';
batavia.modules.math.sinh.__doc__ = 'sinh(x)\n\n\nReturn the hyperbolic sine of x.';
batavia.modules.math.sqrt.__doc__ = 'sqrt(x)\n\n\nReturn the square root of x.';
batavia.modules.math.tan.__doc__ = 'tan(x)\n\n\nReturn the tangent of x (measured in radians).';
batavia.modules.math.tanh.__doc__ = 'tanh(x)\n\n\nReturn the hyperbolic tangent of x.';
batavia.modules.math.trunc.__doc__ = 'trunc(x:Real) -> Integral\n\n\nTruncates x to the nearest Integral toward 0. Uses the __trunc__ magic method.';