// See http://jsperf.com/rendering-a-frame-in-image-data
InteractiveDataDisplay.heatmapBackgroundRenderer = undefined;

// Renders a fuction  f(x,y) on a regular grid (x,y) as a heat map using color palette
InteractiveDataDisplay.Heatmap = function (div, master) {

    // Initialization (#1)
    var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv2d);
    var initialData = initializer(div);
    if (initialData && typeof initialData.y !== 'undefined' && typeof initialData.values !== 'undefined') {
        var y = initialData.y;
        var f = initialData.values;
        var n = y.length;
        var m = f.length;
        if (n > 1 && m > 0 && y[0] > y[1]) {
            y.reverse();
            for (var i = 0; i < n; i++)
                f[i].reverse();
        }
    }

    this.base = InteractiveDataDisplay.CanvasPlot;
    this.base(div, master);
    if (!div) return;
    //create heatmap background renderer
    if (InteractiveDataDisplay.heatmapBackgroundRenderer == undefined) InteractiveDataDisplay.heatmapBackgroundRenderer = new InteractiveDataDisplay.SharedRenderWorker(
        function () {
            var workerCodeUri;
            if (typeof InteractiveDataDisplay.heatmapBackgroundRendererCodeBase64 === 'undefined' || /PhantomJS/.test(window.navigator.userAgent) || InteractiveDataDisplay.Utils.getIEVersion() > 0) {
                //Blob doesn't work in IE10 and IE11
                // Build process usually initializes the heatmapBackgroundRendererCodeBase64 with base64 encoded 
                // concatenation of idd.heatmapworker.js and idd.transforms.js.
                workerCodeUri = InteractiveDataDisplay.HeatmapworkerPath ? InteractiveDataDisplay.HeatmapworkerPath + "idd.heatmapworker.js" : "idd.heatmapworker.js";
            }
            else {
                var workerBlob = new Blob([window.atob(InteractiveDataDisplay.heatmapBackgroundRendererCodeBase64)], { type: 'text/javascript' });
                workerCodeUri = window.URL.createObjectURL(workerBlob);
            }
            return workerCodeUri
        }(),
        function (heatmapPlot, completedTask) {
            heatmapPlot.onRenderTaskCompleted(completedTask);
        });
    // default styles:
    var loadPalette = function (palette) {
        if (palette) {
            try {
                if (typeof palette == 'string')
                    _palette = InteractiveDataDisplay.ColorPalette.parse(palette);
                else
                    _palette = palette;
                _paletteColors = InteractiveDataDisplay.ColorPalette.toArray(_palette, 512);
            } catch (exc) {
                if (window.console) console.error("Failed to initialize the palette");
            }
        }
    };
    var loadOpacity = function (opacity) {
        _opacity = Math.min(1.0, Math.max(0.0, opacity));
    };

    var _innerCanvas = document.createElement("canvas");
    var _imageData;
    var _y;
    var _x;

    // _f contains values that are mapped to colors.
    // _log_f is log10(_f) and it is used only if options.logColors is enabled instead of _f for color mapping.
    // _f or _logf is passed to the heatmap render.
    // _fmin/_fmax (and corresponding log-versions) are min/max for _f (_log_f) and are used EXCLUSIVELY for palette range.
    // Log range are computed with respect to _logTolerance (taken from option.logTolerance).
    // _log_f is passed to rendered only.
    // _f is passed to renderer and to build tooltip value.
    var _f, _f_u68, _f_l68, _f_median, _fmin, _fmax;
    var _logColors, _logTolerance;
    var _log_f, _log_fmin, _log_fmax;


    var _opacity; // 1 is opaque, 0 is transparent
    var _mode; // gradient or matrix
    var _palette;
    var _dataChanged;
    var _paletteColors;
    var _interval;
    var _originalInterval;
    var _heatmap_nav;
    var _formatter_f, _formatter_f_median, _formatter_f_l68, _formatter_f_u68, _formatter_interval;

    loadOpacity((initialData && typeof (initialData.opacity) != 'undefined') ? parseFloat(initialData.opacity) : 1.0);
    loadPalette((initialData && typeof (initialData.colorPalette) != 'undefined') ? initialData.colorPalette : InteractiveDataDisplay.palettes.grayscale);

    var findFminmax = function (f) {
        var n = f.length;
        if (n < 1) return;
        var m = f[0].length;
        if (m < 1) return;
        var fmin, fmax;
        fmin = fmax = f[0][0];
        for (var i = 0; i < n; i++) {
            var fi = f[i];
            for (var j = 0; j < m; j++) {
                var v = fi[j];
                if (v == v) {
                    if (v > fmax || isNaN(fmax)) fmax = v;
                    if (v < fmin || isNaN(fmin)) fmin = v;
                }
            }
        }
        return { min: fmin, max: fmax };
    };

    var lastCompletedTask;
    var that = this;

    //from chart viewer
    var makeHeatmapData = function(x, y, z, isDiscrete) {
        if (!x || !y || !z) return {};
        if (!x.length || !y.length || (z.v && !z.v.length) || (z.m && (!z.m.length || !z.lb68.length || !z.ub68.length))) return {};

        // Convert to Array.
        x = Array.prototype.slice.call(x);
        y = Array.prototype.slice.call(y);

        if (z.v) {
            z.v = Array.prototype.slice.call(z.v);
        } else if (z.m) {
            z.m = Array.prototype.slice.call(z.m);
            z.lb68 = Array.prototype.slice.call(z.lb68);
            z.ub68 = Array.prototype.slice.call(z.ub68);
        }

        // All arrays must have the same length.
        if (z.v && (x.length !== y.length || x.length !== z.v.length || y.length !== z.v.length)) {
            x.length = y.length = z.v.length = Math.min(x.length, y.length, z.v.length);
        } else if (z.m && (x.length !== y.length || x.length !== z.m.length || y.length !== z.m.length || z.m.length !== z.lb68.length || z.m.length !== z.ub68.length)) {
            x.length = y.length = z.m.length = z.lb68.length = z.ub68.length = Math.min(x.length, y.length, z.m.length, z.lb68.length, z.ub68.length);
        }

        // Remember indices in unsorted arrays.
        var ix = x.map(function (a, i) { return { v: a, i: i }; });
        var iy = y.map(function (a, i) { return { v: a, i: i }; });

        // Get sorted arrays.
        var sx = ix.sort(function (a, b) { return a.v < b.v ? -1 : a.v > b.v ? 1 : 0; });
        var sy = iy.sort(function (a, b) { return a.v < b.v ? -1 : a.v > b.v ? 1 : 0; });

        // Get unique sorted arrays of grid dimensions.
        var ux = sx.filter(function (a, i) { return !i || a.v != sx[i - 1].v; }).map(function (a) { return a.v; });
        var uy = sy.filter(function (a, i) { return !i || a.v != sy[i - 1].v; }).map(function (a) { return a.v; });

        // Using initial indices get arrays of grid indices for dimensions.
        var i, j, ifx = [], ify = [];
        i = 0; sx.forEach(function (a, k) { return ifx[a.i] = !k ? 0 : a.v != sx[k - 1].v ? ++i : i; });
        i = 0; sy.forEach(function (a, k) { return ify[a.i] = !k ? 0 : a.v != sy[k - 1].v ? ++i : i; });

        var f, m, lb68, ub68;

        // Initializes 2d array with NaNs.
        var initNaNs = function (d1, d2) {
            var a = [];
            for (var i = 0; i < d1; ++i) {
                a[i] = [];
                for (var j = 0; j < d2; ++j) {
                    a[i][j] = NaN;
                }
            }
            return a;
        }

        if (z.v) {
            f = initNaNs(ux.length, uy.length);

            for (i = 0; i < z.v.length; ++i) {
                f[ifx[i]][ify[i]] = z.v[i];
            }
        } else {
            m = initNaNs(ux.length, uy.length);
            lb68 = initNaNs(ux.length, uy.length);
            ub68 = initNaNs(ux.length, uy.length);

            for (i = 0; i < z.m.length; ++i) {
                m[ifx[i]][ify[i]] = z.m[i];
                lb68[ifx[i]][ify[i]] = z.lb68[i];
                ub68[ifx[i]][ify[i]] = z.ub68[i];
            }
        }


        if (isDiscrete) {
            if (ux.length >= 2) {
                var newx = [];
                newx.push(ux[0] - (ux[1] - ux[0]) / 2);
                var m;
                for (m = 1; m < ux.length; m++) {
                    newx.push(ux[m] - (ux[m] - ux[m - 1]) / 2);
                }
                newx.push(ux[ux.length - 1] + (ux[ux.length - 1] - ux[ux.length - 2]) / 2);
                ux = newx;
            }

            if (uy.length >= 2) {
                var newy = [];
                newy.push(uy[0] - (uy[1] - uy[0]) / 2);
                var k;
                for (k = 1; k < uy.length; k++) {
                    newy.push(uy[k] - (uy[k] - uy[k - 1]) / 2);
                }
                newy.push(uy[uy.length - 1] + (uy[uy.length - 1] - uy[uy.length - 2]) / 2);
                uy = newy;
            }
        }


        return {
            x: ux,
            y: uy,
            values: f,
            m: m,
            l68: lb68,
            u68: ub68
        };
    };

    var computeMinMax = function() {
        var minmax = findFminmax(_f);
        _fmin = minmax.min;
        _fmax = minmax.max;

        if(_logColors){      
            _fmin = Math.max(_fmin, _logTolerance);
            _fmax = Math.max(_fmax, _logTolerance);
            _log_fmin = Math.log10(_fmin);
            _log_fmax = Math.log10(_fmax);
        }
    }

    this.onRenderTaskCompleted = function (completedTask) {
        lastCompletedTask = completedTask;
        if (_innerCanvas.width !== lastCompletedTask.width || _innerCanvas.height !== lastCompletedTask.height) {
            _innerCanvas.width = lastCompletedTask.width;
            _innerCanvas.height = lastCompletedTask.height;
        }
        var context = _innerCanvas.getContext("2d");
        context.putImageData(lastCompletedTask.image, 0, 0);

        //console.log("Complete render " + this.name);

        that.requestNextFrame();
    };
    this.draw = function (data, titles) {
        var f = data.values;
        if (!f) throw "Data series f is undefined";
        var isOneDimensional = 
            f["median"] !== undefined && !InteractiveDataDisplay.Utils.isArray(f["median"][0])
            || !InteractiveDataDisplay.Utils.isArray(f[0]);
        var x = data.x;
        var y = data.y;
        if (_originalInterval == undefined && _interval == undefined) _originalInterval = data.interval;
        _interval = data.interval;


        _logColors = data.logPalette !== undefined && data.logPalette;
        _logTolerance = data.logTolerance ? data.logTolerance : 1e-12;

        if (f["median"]) {//uncertainty
            if (_heatmap_nav == undefined) {
                var div = $("<div></div>")
                    .attr("data-idd-name", "heatmap__nav_")
                    .appendTo(this.host);
                _heatmap_nav = new InteractiveDataDisplay.Heatmap(div, this.master);
                _heatmap_nav.getLegend = function () {
                    return undefined;
                };
                this.addChild(_heatmap_nav);
                _heatmap_nav.getTooltip = function (xd, yd, xp, yp) {
                    return undefined;
                }
            }
            if (isOneDimensional) {
                var r = makeHeatmapData(x, y, {
                    v: undefined,
                    m: f.median,
                    lb68: f.lower68,
                    ub68: f.upper68
                }, data.treatAs === 'discrete');
                _x = r.x;
                _y = r.y;
                _f = r.m;
                _f_median = r.m;
                _f_l68 = r.l68;
                _f_u68 = r.u68;

                _heatmap_nav.x = r.x;
                _heatmap_nav.y = r.y;
                _heatmap_nav.f_median = r.m;
                _heatmap_nav.f_l68 = r.l68;
                _heatmap_nav.f_u68 = r.u68;
            } else {
                _x = x;
                _y = y;
                _f = f.median;
                _f_median = f.median;
                _f_l68 = f.lower68;
                _f_u68 = f.upper68;

                _heatmap_nav.x = r.x;
                _heatmap_nav.y = r.y;
                _heatmap_nav.f_median = f.median68;
                _heatmap_nav.f_l68 = f.lower68;
                _heatmap_nav.f_u68 = f.upper68;
            }
            if (_interval) {
                updateInterval();
            }
        } else {
            if (_heatmap_nav) {
                _heatmap_nav.remove();
            }
            _heatmap_nav = undefined;
            if (isOneDimensional) {
                var r = makeHeatmapData(x, y, {
                    v: f
                }, data.treatAs === 'discrete');
                _x = r.x;
                _y = r.y;
                _f = r.values;
            } else {
                _f = f;
                _x = x;
                _y = y;

                // Logarithmic colors
                if(_logColors){
                    _log_f = new Array(_f.length);
                    for(var i = 0; i < _f.length; i++)
                    {
                        var row = _f[i];
                        var logRow = _log_f[i] = new Float32Array(row.length);
                        for(var j = 0; j < row.length; j++)
                        {
                            logRow[j] = Math.log10(row[j]);
                        }
                    }
                }
            }
        }

        _formatter_f = undefined;
        _formatter_f_median = undefined;
        _formatter_f_l68 = undefined;
        _formatter_f_u68 = undefined;

        var n = _f_median ? _f_median.length : _f.length;
        var m = _f_median ? _f_median[0].length : _f[0].length;
        if (!_x) {
            _x = InteractiveDataDisplay.Utils.range(0, n);
        } else {
            if (_x.length != n && _x.length != n + 1) throw "Data series x must have length equal or one more than length of data series f by first dimension";
        }
        if (!_y) {
             _y = InteractiveDataDisplay.Utils.range(0, m);
         } else {
             if (_y.length != m && _y.length != m + 1) throw "Data series y must have length equal or one more than length of data series f by second dimension";
         }

        if (_x.length == n) {
            if (_y.length != m) throw "Data series y must have length equal to length of data series f by second dimension";
            _mode = 'gradient';
        } else {
            if (_y.length != m + 1) throw "Data series y must have length equal to one more than length of data series f by second dimension";
            _mode = 'matrix';
        }

        if (_x.length < 2) throw "Data series x must have at least 2 elements by each dimension";
        if (_y.length < 2) throw "Data series y must have at least 2 elements by each dimension";

        // styles:
        if (data && typeof (data.opacity) != 'undefined') {
            loadOpacity(parseFloat(data.opacity));
        }
        if (data && typeof (data.colorPalette) != 'undefined')
            loadPalette(data.colorPalette);
        if (_palette.isNormalized) {
            computeMinMax();
        }
        _dataChanged = true;
        var prevBB = this.invalidateLocalBounds();
        var bb = this.getLocalBounds();

        if (InteractiveDataDisplay.Utils.equalRect(prevBB, bb))
            this.requestNextFrame();
        else
            this.requestNextFrameOrUpdate();
        this.setTitles(titles, true);
        this.fireAppearanceChanged();
    };

    // Returns a rectangle in the plot plane.
    this.computeLocalBounds = function () {
        var _bbox;
        if (_x && _y) { // todo: fix for matrix mode
            var xmin, xmax, ymin, ymax;
            var n = _x.length;
            var m = _y.length;
            var i;
            for (i = 0; i < n; i++) {
                xmin = _x[i];
                if (xmin == xmin) break;
            }
            for (i = n; --i >= 0;) {
                xmax = _x[i];
                if (xmax == xmax) break;
            }
            for (i = 0; i < m; i++) {
                ymin = _y[i];
                if (ymin == ymin) break;
            }
            for (i = m; --i >= 0;) {
                ymax = _y[i];
                if (ymax == ymax) break;
            }

            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            if (dataToPlotX) {
                xmin = dataToPlotX(xmin);
                xmax = dataToPlotX(xmax);
            }
            if (dataToPlotY) {
                ymin = dataToPlotY(ymin);
                ymax = dataToPlotY(ymax);
            }
            _bbox = { x: Math.min(xmin, xmax), y: Math.min(ymin, ymax), width: Math.abs(xmax - xmin), height: Math.abs(ymax - ymin) };
        }
        return _bbox;
    };

    if (typeof (Modernizr) != 'undefined') {
        if (div && (!Modernizr.webworkers || !Modernizr.postmessage)) {
            var parent = div[0].parentElement;
            if (parent) {
                var hasText = false;
                for (var i = 0; i < parent.childNodes.length; i++) {
                    if ($(parent.childNodes[i]).hasClass("nowebworkers")) {
                        hasText = true;
                        break;
                    }
                }
                div[0].removeAttribute("data-idd-plot");
                div[0].innerText = "";
                if (!hasText) {
                    div[0].innerText = ' Heatmap cannot be rendered: browser does not support web workers.';
                    div.addClass("nowebworkers");
                }
                else div[0].innerText = "";
            }
            return;
        }
    }

    //Theess objects are used for renderfing on the map
    var polygon = undefined;
    var polygon2 = undefined;

    // Updates output of this plot using the current coordinate transform and screen size.
    // plotRect     {x,y,width,height}  Rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
    // screenSize   {width,height}      Size of the output region to render inside
    // Returns true, if the plot actually has rendered something; otherwise, returns false.
    this.renderCore = function (plotRect, screenSize) {
        InteractiveDataDisplay.Heatmap.prototype.renderCore.call(this, plotRect, screenSize);
        var context = this.getContext(true);
        if (_x == undefined || _y == undefined || _f == undefined)
            return;

        var ct = this.coordinateTransform;
        var plotToScreenX = ct.plotToScreenX;
        var plotToScreenY = ct.plotToScreenY;

        var bb = this.getLocalBounds();
        // this is a rectangle which we should fill:
        var visibleRect = InteractiveDataDisplay.Utils.intersect(bb, plotRect);
        if (!visibleRect) return;

        var drawBasic = true;

        if (master.mapControl !== undefined) {

            var left = bb.x;
            var middle = bb.x + bb.width / 2;
            var right = bb.x + bb.width;

            if (polygon === undefined) {
                var backColor = 120;
                var options = {
                    fillColor: new Microsoft.Maps.Color(backColor, backColor, backColor, backColor),
                    strokeColor: new Microsoft.Maps.Color(backColor, backColor, backColor, backColor),
                    strokeThickness: 0
                };

                polygon = new Microsoft.Maps.Polygon([
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), left),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), middle),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), middle),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), left),
                ], options);

                polygon2 = new Microsoft.Maps.Polygon([
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), middle),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), right),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), right),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), middle),
                ], options);

                master.mapControl.entities.push(polygon);
                master.mapControl.entities.push(polygon2);
            }

            if (_dataChanged) {
                polygon.setLocations([
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), left),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), middle),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), middle),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), left),
                ]);

                polygon2.setLocations([
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), middle),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y), right),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), right),
                    new Microsoft.Maps.Location(InteractiveDataDisplay.mercatorTransform.plotToData(bb.y + bb.height), middle),
                ]);
            }

            drawBasic = !master.isInAnimation;
            polygon.setOptions({ visible: master.isInAnimation });
            polygon2.setOptions({ visible: master.isInAnimation });
        }

        if (drawBasic) {
            var visibleRect_s = {
                left: Math.floor(plotToScreenX(visibleRect.x)),
                width: Math.ceil(ct.plotToScreenWidth(visibleRect.width)),
                top: Math.floor(plotToScreenY(visibleRect.y + visibleRect.height)),
                height: Math.ceil(ct.plotToScreenHeight(visibleRect.height))
            };

            var scale = ct.getScale();
            var offset = ct.getOffset();

            // rendering a placeholder to indicate that here will be real heatmap
            context.fillStyle = 'rgba(200,200,200,0.3)';
            context.fillRect(visibleRect_s.left, visibleRect_s.top, visibleRect_s.width, visibleRect_s.height);

            if (lastCompletedTask) {
                var taskRect = InteractiveDataDisplay.Utils.intersect(lastCompletedTask.plotRect, plotRect);
                // todo: draw bb here
                if (taskRect) {
                    var left_s = plotToScreenX(lastCompletedTask.plotRect.x);
                    var top_s = plotToScreenY(lastCompletedTask.plotRect.y + lastCompletedTask.plotRect.height);
                    var alpha;

                    if (_opacity != 1) {
                        alpha = context.globalAlpha;
                        context.globalAlpha = _opacity;
                    }
                    if (scale.x != lastCompletedTask.scaleX || scale.y != lastCompletedTask.scaleY) {
                        var sx = scale.x / lastCompletedTask.scaleX;
                        var sy = scale.y / lastCompletedTask.scaleY;
                        context.drawImage(_innerCanvas, 0, 0, lastCompletedTask.image.width, lastCompletedTask.image.height,
                            left_s, top_s, sx * lastCompletedTask.image.width, sy * lastCompletedTask.image.height);
                    } else {
                        context.drawImage(_innerCanvas, left_s, top_s);
                    }
                    if (_opacity != 1) {
                        context.globalAlpha = alpha;
                    }
                }
            }

            if (_dataChanged ||
                !this.master.isInAnimation &&
                (!lastCompletedTask || lastCompletedTask.scaleX != scale.x || lastCompletedTask.scaleY != scale.y || !InteractiveDataDisplay.Utils.includes(lastCompletedTask.plotRect, visibleRect))) {

                if (!_imageData || _imageData.width !== visibleRect_s.width || _imageData.height !== visibleRect_s.height) {
                    // avoiding creating new image data, 
                    // it is possible to reuse the image data since web worker marshalling makes a copy of it
                    _imageData = context.createImageData(visibleRect_s.width, visibleRect_s.height);
                }

                var task = {
                    image: _imageData,
                    width: _imageData.width,
                    height: _imageData.height,
                    x: _x,
                    y: _y,
                    f: _logColors ? _log_f : _f,
                    fmin: _logColors ? _log_fmin : _fmin,
                    fmax: _logColors ? _log_fmax : _fmax,
                    plotRect: visibleRect,
                    scaleX: scale.x,
                    scaleY: scale.y,
                    offsetX: offset.x - visibleRect_s.left,
                    offsetY: offset.y - visibleRect_s.top,
                    palette: {
                        isNormalized: _palette.isNormalized,
                        range: _palette.range,
                        points: _palette.points,
                        colors: _paletteColors
                    },
                    xDataTransform: this.xDataTransform && this.xDataTransform.type,
                    yDataTransform: this.yDataTransform && this.yDataTransform.type
                };

                //console.log("Heatmap " + this.name + " enqueues a task (isInAnimation: " + this.master.isInAnimation + ")");
                InteractiveDataDisplay.heatmapBackgroundRenderer.enqueue(task, this);
                _dataChanged = false;
            }
            //}
        }
    };
    this.renderCoreSvg = function (plotRect, screenSize, svg) {
        var imageData_g = svg.group();
        if (_x == undefined || _y == undefined || _f == undefined)
            return;
        var w_s = screenSize.width;
        var h_s = screenSize.height;
        var ct = this.coordinateTransform;
        var plotToScreenX = ct.plotToScreenX;
        var plotToScreenY = ct.plotToScreenY;
        var bb = this.getLocalBounds();
        // this is a rectangle which we should fill:
        var visibleRect = InteractiveDataDisplay.Utils.intersect(bb, plotRect);
        if (!visibleRect) return;

        var visibleRect_s = {
            left: Math.floor(plotToScreenX(visibleRect.x)),
            width: Math.ceil(ct.plotToScreenWidth(visibleRect.width)),
            top: Math.floor(plotToScreenY(visibleRect.y + visibleRect.height)),
            height: Math.ceil(ct.plotToScreenHeight(visibleRect.height))
        };
        var image = _innerCanvas.toDataURL("image/png");
        var svgimage = imageData_g.image(image, _imageData.width, _imageData.height).opacity(_opacity);
        svgimage.clipWith(imageData_g.rect(visibleRect_s.width, visibleRect_s.height));
        imageData_g.translate(visibleRect_s.left, visibleRect_s.top);
    }
    this.onIsRenderedChanged = function () {
        if (!this.isRendered) {
            InteractiveDataDisplay.heatmapBackgroundRenderer.cancelPending(this);
        }
    };

    // Others
    this.onDataTransformChanged = function (arg) {
        this.invalidateLocalBounds();
        InteractiveDataDisplay.Heatmap.prototype.onDataTransformChanged.call(this, arg);
    };


    var getCellContaining = function (x_d, y_d) {
        var n = _x.length;
        var m = _y.length;
        if (n == 0 || m == 0) return;

        if (x_d < _x[0] || y_d < _y[0] ||
            x_d > _x[n - 1] || y_d > _y[m - 1]) return;

        var i;
        for (i = 1; i < n; i++) {
            if (x_d <= _x[i]) {
                if (isNaN(_x[i - 1])) return NaN;
                break;
            }
        }

        var j;
        for (j = 1; j < m; j++) {
            if (y_d <= _y[j]) {
                if (isNaN(_y[j - 1])) return NaN;
                break;
            }
        }
        if (i >= n || j >= m) return NaN;
        return { iLeft: i - 1, jBottom: j - 1 };
    };

    /// Gets the value (probably, interpolated) for the heatmap
    /// in the point (xd,yd) in data coordinates.
    /// Depends on the heatmap mode.
    /// Returns null, if the point is outside of the plot.
    this.getValue = function (xd, yd, array) {
        var n = _x.length;
        var m = _y.length;
        if (n == 0 || m == 0) return null;

        var cell = getCellContaining(xd, yd);
        if (cell == undefined) return null;
        if (cell != cell) return "<div>" + (this.name || "heatmap") + ": (unknown value)</div>";

        var value;
        if (_mode === "gradient") {
            var flb, flt, frt, frb;
            flt = array[cell.iLeft][cell.jBottom + 1];
            flb = array[cell.iLeft][cell.jBottom];
            frt = array[cell.iLeft + 1][cell.jBottom + 1];
            frb = array[cell.iLeft + 1][cell.jBottom];

            if (isNaN(flt) || isNaN(flb) || isNaN(frt) || isNaN(frb)) {
                value = NaN;
            } else {
                var y0 = _y[cell.jBottom];
                var y1 = _y[cell.jBottom + 1];
                var kyLeft = (flt - flb) / (y1 - y0);
                var kyRight = (frt - frb) / (y1 - y0);
                var fleft = kyLeft * (yd - y0) + flb;
                var fright = kyRight * (yd - y0) + frb;
                var x0 = _x[cell.iLeft];
                var x1 = _x[cell.iLeft + 1];
                var kx = (fright - fleft) / (x1 - x0);
                value = kx * (xd - x0) + fleft;
            }
        } else {
            value = array[cell.iLeft][cell.jBottom];
        }
        return value;
    };
    var updateInterval = function () {
        var fmedian = _heatmap_nav.f_median;
        var shadeData = new Array(fmedian.length);
        for (var i = 0; i < fmedian.length; i++) {
            var fmedian_i = fmedian[i];
            shadeData[i] = new Array(fmedian_i.length);
            for (var j = 0; j < fmedian_i.length; j++) {
                shadeData[i][j] = (_heatmap_nav.f_l68[i][j] < _interval.max && _heatmap_nav.f_u68[i][j] > _interval.min) ? 0 : 1;
            }
        }
        _heatmap_nav.draw({ x: _heatmap_nav.x, y: _heatmap_nav.y, values: shadeData, opacity: 0.5, colorPalette: InteractiveDataDisplay.ColorPalette.parse("0=#00000000=#00000080=1") });
        _heatmap_nav.isVisible = true;
    };
    this.getTooltip = function (xd, yd, xp, yp, changeInterval) {
        if (_f === undefined)
            return;
        var that = this;
        var pinCoord = { x: xd, y: yd };
        if (_f_u68 === undefined || _f_l68 === undefined || _f_median === undefined) {
            var fminmax = findFminmax(_f);
            _formatter_f = InteractiveDataDisplay.AdaptiveFormatter(fminmax.min, fminmax.max);
            var $toolTip = $("<div></div>");
            $("<div></div>").addClass('idd-tooltip-name').text((this.name || "heatmap")).appendTo($toolTip);
            var value = this.getValue(pinCoord.x, pinCoord.y, _f, _mode);
            if (value == null) return;
            var propTitle = this.getTitle("values");
            $("<div>" + propTitle + ": " + _formatter_f.toString(value) + "</div>").appendTo($toolTip);
            return $toolTip;
        } else {
            var fminmax = findFminmax(_f_median);
            _formatter_f_median = InteractiveDataDisplay.AdaptiveFormatter(fminmax.min, fminmax.max);
            fminmax = findFminmax(_f_l68);
            _formatter_f_l68 = InteractiveDataDisplay.AdaptiveFormatter(fminmax.min, fminmax.max);
            fminmax = findFminmax(_f_u68);
            _formatter_f_u68 = InteractiveDataDisplay.AdaptiveFormatter(fminmax.min, fminmax.max);
            var $toolTip = $("<div></div>");
            $("<div></div>").addClass('idd-tooltip-name').text((this.name || "heatmap")).appendTo($toolTip);
            var lb = this.getValue(pinCoord.x, pinCoord.y, _f_l68);
            var ub = this.getValue(pinCoord.x, pinCoord.y, _f_u68);
            var median = this.getValue(pinCoord.x, pinCoord.y, _f_median);
            if (lb == null || ub == null || median == null) return;
            var propTitle = this.getTitle("values");
            var uncertainContent = $("<div></div>").addClass('idd-tooltip-compositevalue');
            uncertainContent.append($("<div>median: " + _formatter_f_median.toString(median) + "</div>"));
            uncertainContent.append($("<div>lower 68%: " + _formatter_f_l68.toString(lb) + "</div>"));
            uncertainContent.append($("<div>upper 68%: " + _formatter_f_u68.toString(ub) + "</div>"));
            var $content = $("<div></div>");
            $content.append($("<div>" + propTitle + ":</div>")).append(uncertainContent);
            $content.appendTo($toolTip);

            var checkBoxCnt = $("<div></div>").css("display", "inline-block").appendTo($toolTip);
            var showSimilarBtn = $("<div></div>").addClass("checkButton").appendTo(checkBoxCnt);
            
            if (_interval ) {
                if (changeInterval) {
                    if (_interval != _originalInterval) {
                        _interval = { min: lb, max: ub };
                        $(".checkButton").removeClass("checkButton-checked");
                        showSimilarBtn.addClass("checkButton-checked");
                        this.fireAppearanceChanged("interval");
                    } else $(".checkButton").removeClass("checkButton-checked");
                }  else {
                    $(".checkButton").removeClass("checkButton-checked");
                    showSimilarBtn.addClass("checkButton-checked");
                }
                updateInterval();
            }
            showSimilarBtn.click(function () {
                if (showSimilarBtn.hasClass("checkButton-checked")) {
                    showSimilarBtn.removeClass("checkButton-checked");
                    if (_originalInterval) {
                        _interval = _originalInterval;
                        updateInterval();
                    } else {
                        _interval = undefined;
                        _heatmap_nav.isVisible = false;
                    }
                }
                else {
                    $(".checkButton").removeClass("checkButton-checked");
                    showSimilarBtn.addClass("checkButton-checked");
                    _interval = { min: lb, max: ub };
                    updateInterval();
                }
                that.fireAppearanceChanged("interval");
            });

            $($("<span style='margin-left:3px;'>highlight similar</span>")).appendTo(checkBoxCnt);
            return $toolTip;
        }
    };


    Object.defineProperty(this, "palette", {
        get: function () { return _palette; },
        set: function (value) {
            if (value == _palette) return;
            if (!value) throw "Heatmap palette is undefined";
            if (_palette && value.isNormalized && !_palette.isNormalized && _f) {
                computeMinMax();
            }
            loadPalette(value);
            lastCompletedTask = undefined;

            this.fireAppearanceChanged("palette");
            this.requestNextFrame();
        },
        configurable: false
    });
    Object.defineProperty(this, "opacity", {
        get: function () { return _opacity; },
        set: function (value) {
            if (!value) throw "Heatmap opacity is undefined";
            if (value == _opacity) return;
            loadOpacity(value);

            this.fireAppearanceChanged("opacity");
            this.requestNextFrame();
        },
        configurable: false
    });
    Object.defineProperty(this, "mode", {
        get: function () { return _mode; },
        configurable: false
    });

    this.getLegend = function () {
        var canvas = $("<canvas></canvas>");
        var infoDiv = $("<div></div>");
        var that = this;
        var nameDiv = $("<span></span>");
        var setName = function () {
            nameDiv.text(that.name);
        }
        setName();
        var colorIsVisible = 0;
        var paletteControl, colorDiv, paletteDiv;
        colorDiv = $("<div class='idd-legend-item-palette'></div>").appendTo(infoDiv);

        var clrTitleText, colorTitle;
        var refreshColor = function () {
            clrTitleText = that.getTitle("values");
            if (colorIsVisible == 0) {
                colorDiv.empty();                
                colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                paletteDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px;'></div>").appendTo(colorDiv);

                paletteControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv, _palette, { logAxis: _logColors });
                colorIsVisible = 2;
            } else colorTitle.text(clrTitleText);

            if (_palette && _palette.isNormalized) {
                paletteControl.dataRange = { min: _fmin, max: _fmax };
            }
        }
        refreshColor();
        var intervalDiv;
        var refreshInterval = function () {
            if (_interval == undefined && intervalDiv) intervalDiv.empty();
            else {
                if (_interval) {
                    _formatter_interval = InteractiveDataDisplay.AdaptiveFormatter(_interval.min, _interval.max);
                    if (intervalDiv) intervalDiv.text("highlighted interval: " + _formatter_interval.toString(_interval.min) + ", " + _formatter_interval.toString(_interval.max));
                    else intervalDiv = $("<div style='font-size:14px;'>highlighted interval: " + _formatter_interval.toString(_interval.min) + ", " + _formatter_interval.toString(_interval.max) + "</div>").appendTo(infoDiv);

                }
            }
        }
        refreshInterval();
        this.host.bind("appearanceChanged",
            function (event, propertyName) {
                if (!propertyName || propertyName == "name")
                    setName();
                if (!propertyName || propertyName == "interval")
                    refreshInterval();
                if (!propertyName || propertyName == "values" || propertyName == "colorPalette"){
                    colorIsVisible = 0;
                    refreshColor();
                }
                if (!propertyName || propertyName == "palette") paletteControl.palette = _palette;
                var oldRange = paletteControl.dataRange;
                if (_palette && _palette.isNormalized && (oldRange == undefined || oldRange.min != _fmin || oldRange.max != _fmax)) {
                    paletteControl.dataRange = { min: _fmin, max: _fmax };
                }
            });

        var onLegendRemove = function () {
            that.host.unbind("appearanceChanged");
        };

        return { name: nameDiv, legend: { thumbnail: canvas, content: infoDiv }, onLegendRemove: onLegendRemove };
    };

    this.buildSvgLegend = function (legendSettings, svg) {
        var that = this;
        legendSettings.height = 30;
        svg.add(svg.rect(legendSettings.width, legendSettings.height).fill("white").opacity(0.5));
        var style = window.getComputedStyle(legendSettings.legendDiv.children[0].children[1], null);
        var fontSize = parseFloat(style.getPropertyValue('font-size'));
        var fontFamily = style.getPropertyValue('font-family');
        var fontWeight = style ? style.getPropertyValue('font-weight') : undefined;
        svg.add(svg.text(that.name).font({ family: fontFamily, size: fontSize, weight: fontWeight }).translate(40, 0));
        //content
        var isContent = legendSettings.legendDiv.children[1];
        style = (isContent && legendSettings.legendDiv.children[1].children[0] && legendSettings.legendDiv.children[1].children[0].children[0]) ? window.getComputedStyle(legendSettings.legendDiv.children[1].children[0].children[0], null) : undefined;
        fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
        fontFamily = style ? style.getPropertyValue('font-family') : undefined;
        fontWeight = style ? style.getPropertyValue('font-weight') : undefined;
        var content = svg.group();
        var colorText = that.getTitle("values");
        content.text(colorText).font({ family: fontFamily, size: fontSize, weight: fontWeight });
        content.translate(5, 30);
        var colorPalette_g = svg.group();
        var width = legendSettings.width;
        var height = 20;
        InteractiveDataDisplay.SvgColorPaletteViewer(colorPalette_g, _palette, legendSettings.legendDiv.children[1].children[0].children[1], { width: width, height: height });
        colorPalette_g.translate(5, 50);
        legendSettings.height += (50 + height);
     
        if (_interval) {
            style = (isContent && legendSettings.legendDiv.children[1].children[1] && legendSettings.legendDiv.children[1].children[1]) ? window.getComputedStyle(legendSettings.legendDiv.children[1].children[1], null) : undefined;
            fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
            fontFamily = style ? style.getPropertyValue('font-family') : undefined;
            fontWeight = style ? style.getPropertyValue('font-weight') : undefined;

            var interval_g = svg.group();
            var text = $(legendSettings.legendDiv.children[1].children[1]).text();
            interval_g.add(interval_g.text(text).font({ family: fontFamily, size: fontSize, weight: fontWeight }));
            var width = legendSettings.width;
            var height = 25;
            interval_g.translate(5, 100);
            legendSettings.height += (50 + height);
        };
        
        svg.front();
    }
    // Initialization 
    if (initialData && typeof initialData.values != 'undefined')
        this.draw(initialData);
};
InteractiveDataDisplay.Heatmap.prototype = new InteractiveDataDisplay.CanvasPlot();

InteractiveDataDisplay.register("heatmap", function (jqDiv, master) {
    return new InteractiveDataDisplay.Heatmap(jqDiv, master);
});