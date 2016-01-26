/// <reference path="../../typings/jquery/jquery.d.ts" />
declare var InteractiveDataDisplay: any;
module ChartViewer {
    export type Map = {
        [key: string]: any;
    }

    /**
     * Synchronizes properties of bagB with properties of bagA:
     * 1) if (k,vB) of bagB such that (k,vA) belongs to bagA then
     * 1.1) if vB = null, (k,vA) goes to the output bag;
     * 1.2) else (k, replace(k, vA, vB)) goes to the output;
     * 2) if (k,vB) of bagB such that there is no (k,vA) in bagA then (k, add(k, vB)) goes to the output;
     * 3) if (k,vA) of bagA such that there is no (k,vB) in bagB then remove(k, vA) is called and it is missing in the output.
     */
    export function updateBag(bagA: Map, bagB: Map, replace: (key: string, prev: any, curr: any) => any, add: (key: string, val: any) => any, remove: (key: string, val: any) => void): Map {
        var output = {};
        for (var k in bagB) {
            var vA = bagA[k];
            var vB = bagB[k];
            if (typeof (vB) == "undefined") continue;
            if (typeof (vA) != "undefined") { // case 1
                if (vB == null) { // case 1.1
                    output[k] = vA;
                }
                else { // case 1.2
                    output[k] = replace(k, vA, vB);
                }
            }
            else { // case 2
                output[k] = add(k, vB);
            }
        }
        for (var k in bagA) {
            var vA = bagA[k];
            var vB = bagB[k];
            if (typeof (vA) == "undefined") continue;
            if (typeof (vB) == "undefined") { // case 3
                remove(k, vA);
            }
        }
        return output;
    }

    export function RgbaToString(rgba) {
        return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
    }

    export function getTitle(def: PlotInfo, seriesName: string) {
        if (def.titles && typeof def.titles[seriesName] != "undefined")
            return def.titles[seriesName];
        return seriesName;
    }

    export function updateProp(propName, obj1, obj2) {
        if (obj1[propName] === obj2[propName]) {
            return true;
        } else {
            obj1[propName] = obj2[propName];
            return false;
        }
    }

    export function isNumber(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }

    export function isString(obj) {
        return obj === obj + "";
    }
    export function isStringOrNumber(obj) {
        return isNumber(obj) || isString(obj)
    }

    export function deepCopyJS(obj) {
        var type = typeof obj;
        if (type !== 'object' || obj == null) {
            //basic types here
            return obj;
        } else if (InteractiveDataDisplay.Utils.isArray(obj)) {
            var result = [];
            for (var i = 0; i < obj.length; i++)
                result.push(deepCopyJS(obj[i]));
            return result;
        } else {
            var result1 = {};
            for (var prop in obj) {
                result1[prop] = deepCopyJS(obj[prop]);
            }
            return result1;
        }
    }

    export function syncProps(obj1, obj2) {
        var wasUpdated = false;

        for (var key in obj2) {
            if (obj1[key] === undefined || (isStringOrNumber(obj1[key]) && !isStringOrNumber(obj2[key]))) {
                obj1[key] = deepCopyJS(obj2[key]);
                if (!wasUpdated)
                    wasUpdated = true;
            } else if (isStringOrNumber(obj2[key])) {
                var wasUpdatedloc = !updateProp(key, obj1, obj2);
                if (!wasUpdated)
                    wasUpdated = wasUpdatedloc;
            } else {
                var wasUpdatedloc = syncProps(obj1[key], obj2[key]);
                if (!wasUpdated)
                    wasUpdated = wasUpdatedloc;
            }
        }

        var unpresentedProperties = [];
        for (var prop in obj1) {
            if (prop === "d3Graphs" || prop === "isPresented")
                continue;

            var isPresented = false;
            for (var key in obj2) {
                if (key === prop) {
                    isPresented = true;
                    break;
                }
            }
            if (!isPresented) {
                unpresentedProperties.push(prop);

                if (!wasUpdated)
                    wasUpdated = true;
            }
        }

        unpresentedProperties.forEach(function (prop) {
            delete obj1[prop];
        });

        for (var i = 0; i < obj1.length; i++) {
            if (obj1[i] == undefined && typeof obj1 != "function") {
                obj1.splice(i, 1);
                i--;
            }
        }        

        //TODO: remove unpresented dataKeys
        return wasUpdated;
    }

    export function GetMin(array) {
        var min = undefined;
        if (array != undefined) {
            for (var i = 0; i < array.length; i++) {
                if (!isNaN(array[i]) && (min === undefined || min > array[i])) {
                    min = array[i];
                }
            }
        }

        return min;
    }

    export function GetMax(array) {
        var max = undefined;
        if (array != undefined) {
            for (var i = 0; i < array.length; i++) {
                if (!isNaN(array[i]) && (max === undefined || max < array[i])) {
                    max = array[i];
                }
            }
        }
        return max;
    }

    export function CutArray(arr: any[], len: number) {
        if (arr.length > len) {
            var result = new Array(len);
            for (var i = 0; i < len; i++) {
                result[i] = arr[i];
            }
            return result;
        } else {
            return arr;
        }
    }

    export function IsOrderedArray(arr: any[]) {
        if (arr.length <= 1)
            return true;
        else {
            if (isNaN(arr[1]))
                return false;
            if (isNaN(arr[2]))
                return false;

            var diff = arr[1] - arr[0];
            for (var i = 2; i < arr.length; i++) {
                var diff_i = arr[i] - arr[i - 1];
                if (diff * diff_i < 0)
                    return false;
            }
            return true;
        }
    }

    export function getFormatter(arr, getRange) {
        var range = getRange(arr);
        var formatter = MathUtils.getPrintFormat(range.min, range.max, (range.max - range.min) / 4);
        return formatter;
    }

    export function get2dRange(arr) {

        var mins = [], maxes = [];
        for (var i = 0; i < arr.length; ++i) {
            mins.push(GetMin(arr[i]));
            maxes.push(GetMax(arr[i]));
        }
        return { min: GetMin(mins), max: GetMax(maxes) };
    }

    export function round(x, range, isCoords) {
        var log10 = 1 / Math.log(10);
        var beta = Math.floor(Math.log(range.max - range.min) * log10) - 2;
        if (isCoords) beta -= 2;
        if (beta <= 0) {
            if (-beta > 15) return parseFloat(x.toFixed(15));
            return parseFloat(x.toFixed(-beta));
        }
        else {
            var degree = Math.pow(10, beta - 1);
            return Math.round(x / degree) * degree;
        }
    }

    export function getCellContaining(dx, dy, x, y): any {
        var n = x.length;
        var m = y.length;
        if (n == 0 || m == 0) return;

        if (dx < x[0] || dy < y[0] ||
            dx > x[n - 1] || dy > y[m - 1]) return;

        var i;
        for (i = 1; i < n; i++) {
            if (dx <= x[i]) {
                if (isNaN(x[i - 1])) return NaN;
                break;
            }
        }

        var j;
        for (j = 1; j < m; j++) {
            if (dy <= y[j]) {
                if (isNaN(y[j - 1])) return NaN;
                break;
            }
        }
        if (i >= n || j >= m) return NaN;
        return { iLeft: i - 1, jBottom: j - 1 };
    };
    export function getArrayValue(xd, yd, x, y, array, mode) {
        var n = x.length;
        var m = y.length;
        if (n == 0 || m == 0) return null;

        var cell = getCellContaining(xd, yd, x, y);
        if (cell == undefined) return null;
        if (cell != cell) return NaN;

        var value;
        if (mode === "gradient") {
            var flb, flt, frt, frb;
            flt = array[cell.iLeft][cell.jBottom + 1];
            flb = array[cell.iLeft][cell.jBottom];
            frt = array[cell.iLeft + 1][cell.jBottom + 1];
            frb = array[cell.iLeft + 1][cell.jBottom];

            if (isNaN(flt) || isNaN(flb) || isNaN(frt) || isNaN(frb)) {
                value = NaN;
            } else {
                var y0 = y[cell.jBottom];
                var y1 = y[cell.jBottom + 1];
                var kyLeft = (flt - flb) / (y1 - y0);
                var kyRight = (frt - frb) / (y1 - y0);
                var fleft = kyLeft * (yd - y0) + flb;
                var fright = kyRight * (yd - y0) + frb;
                var x0 = x[cell.iLeft];
                var x1 = x[cell.iLeft + 1];
                var kx = (fright - fleft) / (x1 - x0);
                value = kx * (xd - x0) + fleft;
            }
        } else {
            value = array[cell.iLeft][cell.jBottom];
        }
        return value;
    };
}