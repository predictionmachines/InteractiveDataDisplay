InteractiveDataDisplay = InteractiveDataDisplay || {};

// Utilities functions 
InteractiveDataDisplay.Utils =
    {
        //trim: function (s) { return s.replace(/^[\s\n]+|[\s\n]+$/g, ''); },

        applyMask: function(mask, array, newLength) {
            var n = mask.length;
            var newArr = new Array(newLength);
            for(var i = 0, j = 0; i < n; i++){
                if(mask[i] === 0) newArr[j++] = array[i];
            }
            return newArr;
        },
        
        maskNaN: function(mask, numArray){            
            for(var n = mask.length; --n>=0; ){
                 var v = numArray[n];
                 if(v != v) // NaN
                    mask[n] = 1;
            }
        },

        //Returns true if value is Array or TypedArray
        isArray: function(arr) {
            return arr instanceof Array || 
                arr instanceof Float64Array || 
                arr instanceof Float32Array ||
                arr instanceof Int8Array ||
                arr instanceof Int16Array ||
                arr instanceof Int32Array ||
                arr instanceof Uint8Array ||
                arr instanceof Uint16Array ||
                arr instanceof Uint32Array;
        },

        isOrderedArray: function (arr) {
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
        },

        cutArray: function (arr, len) {
            if (arr == undefined) return arr;
            if (arr.length > len) {
                var result = new Array(len);
                for (var i = 0; i < len; i++) {
                    result[i] = arr[i];
                }
                return result;
            } else {
                return arr;
            }
        },
        // Returns intersection of two rectangles {x,y,width,height}, left-bottom corner
        // If no intersection, returns undefined.
        intersect: function (rect1, rect2) {
            if (!rect1 || !rect2) return undefined;
            var x1 = Math.max(rect1.x, rect2.x);
            var x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
            var y1 = Math.max(rect1.y, rect2.y);
            var y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
            if (x2 >= x1 && y2 >= y1)
                return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
            return undefined;
        },

        // Returns boolean value indicating whether rectOuter includes entire rectInner, or not.
        // Rect is  {x,y,width,height}
        includes: function (rectOuter, rectInner) {
            if (!rectOuter || !rectInner) return false;
            return rectOuter.x <= rectInner.x && rectOuter.x + rectOuter.width >= rectInner.x + rectInner.width &&
                rectOuter.y <= rectInner.y && rectOuter.y + rectOuter.height >= rectInner.y + rectInner.height;
        },

        // Returns boolean value indicating whether rect1 equals rect2, or not.
        // Rect is  {x,y,width,height}
        equalRect: function (rect1, rect2) {
            if (!rect1 || !rect2) return false;
            return rect1.x == rect2.x && rect1.width == rect2.width &&
                rect1.y == rect2.y && rect1.height == rect2.height;
        },

        calcCSWithPadding: function (plotRect, screenSize, padding, aspectRatio) {
            var screenRect = { left: padding.left, top: padding.top, width: screenSize.width - padding.left - padding.right, height: screenSize.height - padding.top - padding.bottom };
            return new InteractiveDataDisplay.CoordinateTransform(plotRect, screenRect, aspectRatio);
        },

        // Browser-specific function. Should be replaced with the optimal implementation on the page loading.
        requestAnimationFrame: function (handler, args) {
            setTimeout(handler, 1000 / 60, args);
        },

        // Creates and initializes an array with values from start to end with step 1.
        range: function (start, end) {
            var n = end - start + 1;
            if (n <= 0) return [];
            var arr = new Array(n);
            for (var i = 0; i < n; i++) {
                arr[i] = i;
            }
            return arr;
        },

        //finalRect should contain units in its values. f.e. "px" or "%"
        arrangeDiv: function (div, finalRect) {
            //div.css("top", finalRect.y);
            //div.css("left", finalRect.x);
            div.width(finalRect.width);
            div.height(finalRect.height);
        },

        //Computes minimum rect, containing rect1 and rect 2
        unionRects: function (rect1, rect2) {
            if (rect1 === undefined) 
                return rect2 === undefined ? undefined : { x: rect2.x, y: rect2.y, width: rect2.width, height: rect2.height };
            if (rect2 === undefined)
                return rect1 === undefined ? undefined : { x: rect1.x, y: rect1.y, width: rect1.width, height: rect1.height };

            var minX = Math.min(rect1.x, rect2.x);
            var minY = Math.min(rect1.y, rect2.y);
            var maxX = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
            var maxY = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);

            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        },

        // Parses the attribute data-idd-style of jqElement and adds the properties to the target
        // e.g. data-idd-style="thickness: 5px; lineCap: round; lineJoin: round; stroke: #ff6a00"
        readStyle: function (jqElement, target) {
            var s = jqElement.attr("data-idd-style");
            if (s) {
                var items = s.split(";");
                var n = items.length;
                for (var i = 0; i < n; i++) {
                    var pair = items[i].split(':', 2);
                    if (pair && pair.length === 2) {
                        var name = pair[0].trim();
                        var val = pair[1].trim();
                        target[name] = val;
                    }
                }
                return target;
            } else {
                return undefined;
            }
        },

        missingValuesNaNProcessing: function (values){
            return values.map(function(value){
                if (value==null)
			return NaN;
		return value;
	    });
        },

        getDataSourceFunction: function (jqElem, defaultSource) {
            var source = jqElem.attr("data-idd-datasource");
            if (source)
                return eval(source);
            return defaultSource;
        },

        makeNonEqual: function(range) {
            if(range.min == range.max){
                if(range.min == 0) return { min : -1, max : 1}
                else if(range.min > 0)  return { min : range.min * 0.9, max : range.min * 1.1}
                else return { min : range.min * 1.1, max : range.min * 0.9}
            }else return range;
        },

        getMinMax: function (array) {
            if (!array || array.length === 0) return undefined;
            var n = array.length;
            var min, max;
            var v;
            for (var i = 0; i < n; i++) {
                v = array[i];
                if (v == v) {
                    min = max = v;
                    break;
                }
            }
            for (i++; i < n; i++) {
                v = array[i];
                if (v == v) {
                    if (v < min) min = v;
                    else if (v > max) max = v;
                }
            }
            return { min: min, max: max };
        },

        getMin: function (array) {
            if (!array || array.length === 0) return undefined;
            var n = array.length;
            var min;
            var v;
            for (var i = 0; i < n; i++) {
                v = array[i];
                if (v == v) {
                    min = v;
                    break;
                }
            }
            for (i++; i < n; i++) {
                v = array[i];
                if (v == v && v < min) min = v;
            }
            return min;
        },

        getMax: function (array) {
            if (!array || array.length === 0) return undefined;
            var n = array.length;
            var max;
            var v;
            for (var i = 0; i < n; i++) {
                v = array[i];
                if (v == v) {
                    max = v;
                    break;
                }
            }
            for (i++; i < n; i++) {
                v = array[i];
                if (v == v && v > max) max = v;
            }
            return max;
        },
        
        getMinMaxForPair: function (arrayx, arrayy) {
            if (!arrayx || arrayx.length === 0) return undefined;
            if (!arrayy || arrayx.length !== arrayy.length) throw 'Arrays should be equal';
            var n = arrayx.length;
            var minx, maxx;
            var miny, maxy;
            var vx, vy;
            for (var i = 0; i < n; i++) {
                vx = arrayx[i];
                vy = arrayy[i];

                if (isNaN(vx) || isNaN(vy)) continue;

                minx = maxx = vx;
                miny = maxy = vy;
                break;
            }
            for (i++; i < n; i++) {
                vx = arrayx[i];
                vy = arrayy[i];

                if (isNaN(vx) || isNaN(vy)) continue;

                if (vx < minx) minx = vx;
                else if (vx > maxx) maxx = vx;
                if (vy < miny) miny = vy;
                else if (vy > maxy) maxy = vy;
            }
            return { minx: minx, maxx: maxx, miny: miny, maxy: maxy };
        },

        enumPlots: function (plot) {
            var plotsArray = [];
            var enumRec = function (p, plotsArray) {
                plotsArray.push(p);
                if (p.children)
                    p.children.forEach(function (child) {
                        enumRec(child, plotsArray);
                    });
            };
            enumRec(plot, plotsArray);
            plotsArray.sort(function (a, b) { return b.order - a.order; });
            return plotsArray;
        },
        reorder: function (p, p_before, isPrev) {
            var plots = p.master ? InteractiveDataDisplay.Utils.enumPlots(p.master) : InteractiveDataDisplay.Utils.enumPlots(p);
            p.order = isPrev ? (p_before.order): (p_before.order + 1);
            var shift = function (masterPlot,p) {
                if (masterPlot.order >= p.order && masterPlot != p && masterPlot.order < InteractiveDataDisplay.MaxInteger) masterPlot.order += 1;
                if (masterPlot.children)
                    masterPlot.children.forEach(function (child) {
                        shift(child, p);
                    });
            }
            shift(p.master, p);
        },
    
        getMaxOrder: function (p) {
            var z = p && p.order != InteractiveDataDisplay.MaxInteger ? p.order : 0;
            if (p && p.children)
                p.children.forEach(function (child) {
                    var order = InteractiveDataDisplay.Utils.getMaxOrder(child);
                    if (order != InteractiveDataDisplay.MaxInteger) z = Math.max(z, order);
                });
            return z;
        },

        getBoundingBoxForArrays: function (_x, _y, dataToPlotX, dataToPlotY) {
            var _bbox = undefined;
            if (_x && _y) {
                var range = InteractiveDataDisplay.Utils.getMinMaxForPair(_x, _y);

                if (range) {
                    if (dataToPlotX) {
                        range.minx = dataToPlotX(range.minx);
                        range.maxx = dataToPlotX(range.maxx);
                    }
                    if (dataToPlotY) {
                        range.miny = dataToPlotY(range.miny);
                        range.maxy = dataToPlotY(range.maxy);
                    }

                    var x = Math.min(range.minx, range.maxx);
                    var width = Math.abs(range.maxx - range.minx);
                    var y = Math.min(range.miny, range.maxy);
                    var height = Math.abs(range.maxy - range.miny);

                    _bbox = { x: x, y: y, width: width, height: height };
                }
            }
            return _bbox;
        },

        getIEVersion: function () {
            var sAgent = window.navigator.userAgent;
            var Idx = sAgent.indexOf("MSIE");

            // If IE, return version number.
            if (Idx > 0) 
                return parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));

                // If IE 11 then look for Updated user agent string.
            else if (!!navigator.userAgent.match(/Trident\/7\./)) 
                return 11;
            else
                return 0; //It is not IE
        }
    };
