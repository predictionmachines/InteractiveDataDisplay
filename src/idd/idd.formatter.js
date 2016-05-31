InteractiveDataDisplay.AdaptiveFormatter = function (series, segment) {

    var standardDeviation = function (array) {
        var avg = average(array);

        var squareDiffs = array.map(function (value) {
            var diff = value - avg;
            var sqrDiff = diff * diff;
            return sqrDiff;
        });

        var avgSquareDiff = average(squareDiffs);

        var stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
    };

    var average = function (data) {
        var sum = 0;
        var n = 0;
        for (var i = 0; i < data.length; i++) {
            if (isNaN(data[i])) continue;
            else {
                sum += data[i];
                ++n;
            }
        }
        return (n != 0) ? sum / n : NaN;
    };

    var power10 = function (p) {
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
    };

    this.getPrintFormat = function (min, max, std) {
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
                var c1 = power10(-p2);
                var exponent = p2;
                return {
                    toString: function (x) {
                        if (exponent > 0)
                            return (x * c1).toFixed(-alpha + p2) + "e+" + exponent;
                        else
                            return (x * c1).toFixed(-alpha + p2) + "e" + exponent
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
                var c1 = power10(-alpha - extraPrec);
                var exponent = alpha + extraPrec;
                return {
                    toString: function (x) {
                        if (exponent > 0)
                            return (x * c1).toFixed(extraPrec) + "e+" + exponent;
                        else
                            return (x * c1).toFixed(extraPrec) + "e" + exponent
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
    };

    var _std;
    var _min;
    var _max;

    if (series !== undefined && segment !== undefined) {
        _min = series;
        _max = segment;
        _std = (_max - _min) / 4;
    }
    else if (series !== undefined && segment === undefined) {
        var range = InteractiveDataDisplay.Utils.getMinMax(series);
        _min = range.min;
        _max = range.max;
        _std = standardDeviation(series);
    }

    return this.getPrintFormat(_min, _max, _std);
};