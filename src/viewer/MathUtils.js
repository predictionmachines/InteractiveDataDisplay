(function () {

    MathUtils = typeof (MathUtils) === 'undefined' ? {} : MathUtils;

    MathUtils.power10 = function (p) {
        if (p >= 0) {
            var n = 1;
            for (var i = 0; i < p; i++)
                n *= 10;
            return n;
        } else {
            var n = 1.0;
            for (var i = 0; i < -p; i++)
                n *= 0.1;
            return n;
        }
    }

    MathUtils.getPrintFormat = function (min, max, std) {
        var extraPrec = 2;
        var posmax = Math.max(Math.abs(min), Math.abs(max));
        if (posmax === Infinity || std === Infinity || std === -Infinity || isNaN(posmax) || isNaN(std)) {
            return {
                toString: function (x) {
                    return x;
                }
            };
        }
        var log10 = Math.LN10;
        var p = posmax > 1e-12 ? Math.log(posmax) / log10 : 0;
        var alpha;
        if (std > 1e-12)
            alpha = Math.floor(Math.log(std) / log10) - extraPrec;
        else
            alpha = Math.floor(p - extraPrec);

        if (alpha < 0) { // i.e. nnnnn.ffff___
            var p2 = Math.floor(p);
            if (alpha <= -2 && p2 <= -4) { // 0.0000nn___  ->  0.nn x 10^-mmm
                var c1 = this.power10(-p2);
                return {
                    toString: function (x) {
                        return (x * c1).toFixed(-alpha + p2);
                    },

                    exponent: p2
                };
            }
            else // nnnnn.nn__ -> nnnnn.nn
                return {
                    toString: function (x) {
                        return x.toFixed(-alpha);
                    }
                };
        }
        else { // alpha >=0, i.e. nnnn___.___               
            if (alpha >= 2 && p > 5) { // nnnnnn.___  ->  nnnn x 10^mmm
                var c1 = this.power10(-alpha - extraPrec);
                return {
                    toString: function (x) {
                        return (x * c1).toFixed(extraPrec);
                    },

                    exponent: alpha + extraPrec
                };
            }
            else // alpha in [0,2), p in [alpha, 5], i.e. nnnnn.___ -> nnnnn.
                return {
                    toString: function (x) {
                        var y = x.toFixed();
                        if (x != y) y += ".";
                        return y;
                    }
                };
        }
    }
}());