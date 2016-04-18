/// <reference path="../../typings/jquery/jquery.d.ts" />
declare var InteractiveDataDisplay: any;
module ChartViewer {
    export function UncertainLinePlot(div, master)  {
            var that = this;

            // Initialization (#1)
            var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv);
            var initialData = initializer(div);

            this.base = InteractiveDataDisplay.CanvasPlot;
            this.base(div, master);

            var _x, _y_mean, _y_u68, _y_l68, _y_u95, _y_l95;
            var _fill_68 = 'blue';
            var _fill_95 = 'pink';
            var _stroke = "black";
            var _thickness = 1; 

            // default styles:
            if (initialData) {
                _fill_68 = typeof initialData.fill68 != "undefined" ? initialData.fill68 : _fill_68;
                _fill_95 = typeof initialData.fill95 != "undefined" ? initialData.fill95 : _fill_95;
                _stroke = typeof initialData.stroke != "undefined" ? initialData.stroke : _stroke;
                _thickness = typeof initialData.thickness != "undefined" ? initialData.thickness : _thickness;

            }

            this.draw = function (data) {
                var y_mean = InteractiveDataDisplay.Utils.isArray(data.y) ? data.y : data.y.median;
                if (!y_mean) throw "Data series y_mean is undefined";
                var n = y_mean.length;

                var y_u68 = data.y.upper68;
                if (y_u68 && y_u68.length !== n)
                    throw "Data series y_u68 and y_mean have different lengths";

                var y_l68 = data.y.lower68;
                if (y_l68 && y_l68.length !== n)
                    throw "Data series y_l68 and y_mean have different lengths";

                var y_u95 = data.y.upper95;
                if (y_u95 && y_u95.length !== n)
                    throw "Data series y_u95 and y_mean have different lengths";

                var y_l95 = data.y.lower95;
                if (y_l95 && y_l95.length !== n)
                    throw "Data series y_l95 and y_mean have different lengths";

                if (!data.x) {
                    data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
                }
                _y_mean = y_mean;
                _y_u68 = y_u68;
                _y_l68 = y_l68;
                _y_u95 = y_u95;
                _y_l95 = y_l95;
                _x = data.x;

                var doSort = (!data.treatAs || data.treatAs == "function") && !IsOrderedArray(_x);
                if (InteractiveDataDisplay.Utils.isArray(y_mean)) { // certain values
                    _y_mean = y_mean;
                    if (doSort) {
                        var len = Math.min(_x.length, y_mean.length);
                        _y_mean = CutArray(y_mean, len);
                        _x = CutArray(_x, len);
                        if (doSort) {
                            var forSort = [];
                            for (var i = 0; i < len; i++)
                                if (!isNaN(_x[i])) {
                                    forSort.push({
                                        x: _x[i],
                                        y_mean: _y_mean[i],
                                    });
                                }
                            forSort.sort(function (a, b) { return a.x - b.x; });
                            _y_mean = [];
                            _x = [];
                            for (var i = 0; i < forSort.length; i++) {
                                _y_mean.push(forSort[i].y_mean);
                                _x.push(forSort[i].x);
                            }
                        }
                    }
                } else { // uncertain values
                    var y = data.y;
                    var len = Math.min(_x.length,
                        Math.min(y.median.length,
                            Math.min(y.upper68.length,
                                Math.min(y.lower68.length,
                                    Math.min(y.upper95.length, y.lower95.length)))));
                    _y_mean = CutArray(y.median, len);
                    _y_u68 = CutArray(y.upper68, len);
                    _y_l68 = CutArray(y.lower68, len);
                    _y_u95 = CutArray(y.upper95, len);
                    _y_l95 = CutArray(y.lower95, len);
                    _x = CutArray(_x, len);
                    if (doSort) {
                        var forSort = [];
                        for (var i = 0; i < len; i++) {
                            if (!isNaN(_x[i])) {
                                forSort.push({
                                    x: _x[i],
                                    y_mean: _y_mean[i],
                                    y_u68: _y_u68[i],
                                    y_l68: _y_l68[i],
                                    y_u95: _y_u95[i],
                                    y_l95: _y_l95[i]
                                });
                            }
                        }
                        forSort.sort(function (a, b) { return a.x - b.x; });
                        _y_mean = [];
                        _y_u68 = [];
                        _y_l68 = [];
                        _y_u95 = [];
                        _y_l95 = [];
                        _x = [];
                        for (var i = 0; i < forSort.length; i++) {
                            _y_mean.push(forSort[i].y_mean);
                            _y_u68.push(forSort[i].y_u68);
                            _y_l68.push(forSort[i].y_l68);
                            _y_u95.push(forSort[i].y_u95);
                            _y_l95.push(forSort[i].y_l95);
                            _x.push(forSort[i].x);
                        }
                    }
                }
                // styles:
                _fill_68 = typeof data.fill68 != "undefined" ? data.fill68 : _fill_68;
                _fill_95 = typeof data.fill95 != "undefined" ? data.fill95 : _fill_95;
                _stroke = typeof data.stroke != "undefined" ? data.stroke : _stroke;
                _thickness = typeof data.thickness != "undefined" ? data.thickness : _thickness;

                this.invalidateLocalBounds();

                this.requestNextFrameOrUpdate();
                this.fireAppearanceChanged();
            };

            // Returns a rectangle in the plot plane.
            this.computeLocalBounds = function () {
                var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
                var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;

                var mean = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_mean, dataToPlotX, dataToPlotY);
                var u68 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_u68, dataToPlotX, dataToPlotY);
                var l68 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_l68, dataToPlotX, dataToPlotY);
                var u95 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_u95, dataToPlotX, dataToPlotY);
                var l95 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_l95, dataToPlotX, dataToPlotY);

                return InteractiveDataDisplay.Utils.unionRects(mean, InteractiveDataDisplay.Utils.unionRects(u68, InteractiveDataDisplay.Utils.unionRects(l68, InteractiveDataDisplay.Utils.unionRects(u95, l95))));
            };

            // Returns 4 margins in the screen coordinate system
            this.getLocalPadding = function () {
                return { left: 0, right: 0, top: 0, bottom: 0 };
            };

            var renderArea = function (_x, _y1, _y2, _fill, plotRect, screenSize, context) {
                if (_x === undefined || _y1 == undefined || _y2 == undefined)
                    return;
                var n = _y1.length;
                if (n == 0) return;

                var t = that.getTransform();
                var dataToScreenX = t.dataToScreenX;
                var dataToScreenY = t.dataToScreenY;

                // size of the canvas
                var w_s = screenSize.width;
                var h_s = screenSize.height;
                var xmin = 0, xmax = w_s;
                var ymin = 0, ymax = h_s;

                context.globalAlpha = 0.5;
                context.fillStyle = _fill;

                //Drawing polygons
                var polygons = [];
                var curInd = undefined;
                for (var i = 0; i < n; i++) {
                    if (isNaN(_x[i]) || isNaN(_y1[i]) || isNaN(_y2[i])) {
                        if (curInd === undefined) {
                            curInd = i;
                        }
                        else {
                            polygons.push([curInd, i]);
                            curInd = undefined;
                        }
                    } else {
                        if (curInd === undefined) {
                            curInd = i;
                        }
                        else {
                            if (i === n - 1) {
                                polygons.push([curInd, i]);
                                curInd = undefined;
                            }
                        }
                    }
                }

                var nPoly = polygons.length;
                for (var i = 0; i < nPoly; i++) {
                    context.beginPath();
                    var curPoly = polygons[i];
                    context.moveTo(dataToScreenX(_x[curPoly[0]]), dataToScreenY(_y1[curPoly[0]]));
                    for (var j = curPoly[0] + 1; j <= curPoly[1]; j++) {
                        context.lineTo(dataToScreenX(_x[j]), dataToScreenY(_y1[j]));
                    }
                    for (var j = curPoly[1]; j >= curPoly[0]; j--) {
                        context.lineTo(dataToScreenX(_x[j]), dataToScreenY(_y2[j]));
                    }
                    context.fill();
                }
            }

            var renderLine = function (_x, _y, _stroke, _thickness, plotRect, screenSize, context) {
                if (_x === undefined || _y == undefined)
                    return;
                var n = _y.length;
                if (n == 0) return;

                var t = that.getTransform();
                var dataToScreenX = t.dataToScreenX;
                var dataToScreenY = t.dataToScreenY;

                // size of the canvas
                var w_s = screenSize.width;
                var h_s = screenSize.height;
                var xmin = 0, xmax = w_s;
                var ymin = 0, ymax = h_s;

                context.globalAlpha = 1.0;
                context.strokeStyle = _stroke;
                context.fillStyle = _stroke; // for single points surrounded with missing values
                context.lineWidth = _thickness;
                //context.lineCap = _lineCap;
                //context.lineJoin = _lineJoin;

                context.beginPath();
                var x1, x2, y1, y2;
                var i = 0;

                // Looking for non-missing value
                var nextValuePoint = function () {
                    for (; i < n; i++) {
                        if (isNaN(_x[i]) || isNaN(_y[i])) continue; // missing value
                        x1 = dataToScreenX(_x[i]);
                        y1 = dataToScreenY(_y[i]);
                        c1 = code(x1, y1, xmin, xmax, ymin, ymax);
                        break;
                    }
                    if (c1 == 0) // point is inside visible rect 
                        context.moveTo(x1, y1);
                };
                nextValuePoint();

                var c1, c2, c1_, c2_;
                var dx, dy;
                var x2_, y2_;
                var m = 1; // number of points for the current batch
                for (i++; i < n; i++) {
                    if (isNaN(_x[i]) || isNaN(_y[i])) // missing value
                    {
                        if (m == 1) { // single point surrounded by missing values
                            context.stroke(); // finishing previous segment (it is broken by missing value)
                            var c = code(x1, y1, xmin, xmax, ymin, ymax);
                            if (c == 0) {
                                context.beginPath();
                                context.arc(x1, y1, _thickness / 2, 0, 2 * Math.PI);
                                context.fill();
                            }
                        } else {
                            context.stroke(); // finishing previous segment (it is broken by missing value)
                        }
                        context.beginPath();
                        i++;
                        nextValuePoint();
                        m = 1;
                        continue;
                    }

                    x2_ = x2 = dataToScreenX(_x[i]);
                    y2_ = y2 = dataToScreenY(_y[i]);
                    if (Math.abs(x1 - x2) < 1 && Math.abs(y1 - y2) < 1) continue;

                    // Clipping and drawing segment p1 - p2:
                    c1_ = c1;
                    c2_ = c2 = code(x2, y2, xmin, xmax, ymin, ymax);

                    while (c1 | c2) {
                        if (c1 & c2) break; // segment is invisible
                        dx = x2 - x1;
                        dy = y2 - y1;
                        if (c1) {
                            if (x1 < xmin) { y1 += dy * (xmin - x1) / dx; x1 = xmin; }
                            else if (x1 > xmax) { y1 += dy * (xmax - x1) / dx; x1 = xmax; }
                            else if (y1 < ymin) { x1 += dx * (ymin - y1) / dy; y1 = ymin; }
                            else if (y1 > ymax) { x1 += dx * (ymax - y1) / dy; y1 = ymax; }
                            c1 = code(x1, y1, xmin, xmax, ymin, ymax);
                        } else {
                            if (x2 < xmin) { y2 += dy * (xmin - x2) / dx; x2 = xmin; }
                            else if (x2 > xmax) { y2 += dy * (xmax - x2) / dx; x2 = xmax; }
                            else if (y2 < ymin) { x2 += dx * (ymin - y2) / dy; y2 = ymin; }
                            else if (y2 > ymax) { x2 += dx * (ymax - y2) / dy; y2 = ymax; }
                            c2 = code(x2, y2, xmin, xmax, ymin, ymax);
                        }
                    }
                    if (!(c1 & c2)) {
                        if (c1_ != 0) // point wasn't visible
                            context.moveTo(x1, y1);
                        context.lineTo(x2, y2);
                        m++;
                    }

                    x1 = x2_;
                    y1 = y2_;
                    c1 = c2_;
                }

                // Final stroke
                if (m == 1) { // single point surrounded by missing values
                    context.stroke(); // finishing previous segment (it is broken by missing value)
                    var c = code(x1, y1, xmin, xmax, ymin, ymax);
                    if (c == 0) {
                        context.beginPath();
                        context.arc(x1, y1, _thickness / 2, 0, 2 * Math.PI);
                        context.fill();
                    }
                } else {
                    context.stroke(); // finishing previous segment (it is broken by missing value)
                }
            }

            this.renderCore = function (plotRect, screenSize) {
                UncertainLinePlot.prototype.renderCore.call(this, plotRect, screenSize);

                var context = that.getContext(true);

                renderArea(_x, _y_l95, _y_u95, _fill_95, plotRect, screenSize, context);
                renderArea(_x, _y_l68, _y_u68, _fill_68, plotRect, screenSize, context);
                renderLine(_x, _y_mean, _stroke, _thickness, plotRect, screenSize, context);
            };

            // Clipping algorithms
            var code = function (x, y, xmin, xmax, ymin, ymax) {
                return <any>(x < xmin) << 3 | <any>(x > xmax) << 2 | <any>(y < ymin) << 1 | <any>(y > ymax);
            };


            // Others
            this.onDataTransformChanged = function (arg) {
                this.invalidateLocalBounds();
                UncertainLinePlot.prototype.onDataTransformChanged.call(this, arg);
            };

            this.getLegend = function () {
                var canvas = $("<canvas></canvas>");
                canvas.prop({ width: 40, height: 40 });
                var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
                var isUncertainData = _y_u68 != undefined && _y_l68 != undefined && _y_u95 != undefined && _y_l95 != undefined;
                if (isUncertainData) {
                    ctx.globalAlpha = 0.5;
                    ctx.strokeStyle = _fill_68;
                    ctx.fillStyle = _fill_68;
                
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, 10);
                    ctx.lineTo(20, 40);
                    ctx.lineTo(40, 40);
                    ctx.lineTo(40, 20);
                    ctx.lineTo(20, 0);
                    ctx.lineTo(0, 0);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, 10);
                    ctx.lineTo(30, 40);
                    ctx.lineTo(40, 40);
                    ctx.lineTo(40, 30);
                    ctx.lineTo(10, 0);
                    ctx.lineTo(0, 0);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();
                }
                ctx.strokeStyle = _stroke;
                ctx.lineWidth = _thickness;
                ctx.moveTo(0, 0);
                ctx.lineTo(40, 40);
                ctx.stroke();

                var that = this;
                var nameDiv = $("<span></span>");
                var setName = function () {
                    nameDiv.text(that.name);
                }
                setName();

                this.host.bind("appearanceChanged",
                    function (event, propertyName) {
                        if (!propertyName || propertyName == "name")
                            setName();

                        ctx.clearRect(0, 0, 40, 40);
                        var isUncertainData = _y_u68 != undefined && _y_l68 != undefined && _y_u95 != undefined && _y_l95 != undefined;
                        if (isUncertainData) {
                            ctx.globalAlpha = 0.5;
                            ctx.strokeStyle = _fill_68;
                            ctx.fillStyle = _fill_68;

                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(0, 20);
                            ctx.lineTo(20, 40);
                            ctx.lineTo(40, 40);
                            ctx.lineTo(40, 20);
                            ctx.lineTo(20, 0);
                            ctx.lineTo(0, 0);
                            ctx.fill();
                            ctx.stroke();
                            ctx.closePath();

                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(0, 10);
                            ctx.lineTo(30, 40);
                            ctx.lineTo(40, 40);
                            ctx.lineTo(40, 30);
                            ctx.lineTo(10, 0);
                            ctx.lineTo(0, 0);
                            ctx.fill();
                            ctx.stroke();
                            ctx.closePath();
                        }
                        ctx.strokeStyle = _stroke;
                        ctx.lineWidth = _thickness;
                        ctx.moveTo(0, 0);
                        ctx.lineTo(40, 40);
                        ctx.stroke();
                    });

                var that = this;

                var onLegendRemove = function () {
                    that.host.unbind("appearanceChanged");

                };
                return { name: nameDiv, legend: { thumbnail: canvas, content: undefined }, onLegendRemove: onLegendRemove };
            };
        }
    //}
    UncertainLinePlot.prototype = new InteractiveDataDisplay.CanvasPlot;
}