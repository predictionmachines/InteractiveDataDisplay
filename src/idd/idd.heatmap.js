// See http://jsperf.com/rendering-a-frame-in-image-data
InteractiveDataDisplay.heatmapBackgroundRenderer = new InteractiveDataDisplay.SharedRenderWorker(
    function() {
        var workerCodeUri;
        if(typeof InteractiveDataDisplay.heatmapBackgroundRendererCodeBase64 === 'undefined' || /PhantomJS/.test(window.navigator.userAgent)) {
            // Build process usually initializes the heatmapBackgroundRendererCodeBase64 with base64 encoded 
            // concatenation of idd.heatmapworker.js and idd.transforms.js.
            workerCodeUri = "idd.heatmapworker.js";
        }
        else {
           var workerBlob = new Blob([ window.atob(InteractiveDataDisplay.heatmapBackgroundRendererCodeBase64) ], { type: 'text/javascript' });
           workerCodeUri = window.URL.createObjectURL(workerBlob);
        }
        return workerCodeUri
    } (),
    function (heatmapPlot, completedTask) {
        heatmapPlot.onRenderTaskCompleted(completedTask);
    });

// Renders a fuction  f(x,y) on a regular grid (x,y) as a heat map using color palette
InteractiveDataDisplay.Heatmap = function (div, master) {

    // Initialization (#1)
    var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv2d);
    var initialData = initializer(div);
    if (initialData && typeof initialData.y !== 'undefined' && typeof initialData.f !== 'undefined') {
        var y = initialData.y;
        var f = initialData.f;
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
    var _f;
    var _fmin, _fmax;
    var _opacity; // 1 is opaque, 0 is transparent
    var _mode; // gradient or matrix
    var _palette;
    var _dataChanged;
    var _paletteColors;

    loadOpacity((initialData && typeof (initialData.opacity) != 'undefined') ? parseFloat(initialData.opacity) : 1.0);
    loadPalette((initialData && typeof (initialData.palette) != 'undefined') ? initialData.palette : InteractiveDataDisplay.palettes.grayscale);

    var findFminmax = function () {
        var n = _f.length;
        if (n < 1) return;
        var m = _f[0].length;
        if (m < 1) return;
        _fmin = _fmax = _f[0][0];
        for (var i = 0; i < n; i++) {
            var fi = _f[i];
            for (var j = 0; j < m; j++) {
                var v = fi[j];
                if (v == v) {
                    if (v > _fmax) _fmax = v;
                    else if (v < _fmin) _fmin = v;
                }
            }
        }
    };

    var lastCompletedTask;
    var that = this;

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
        var f = data.f;
        if (!f) throw "Data series f is undefined";
        var n = f.length;
        var m = f[0].length;

        var x = data.x;
        if (!x) {
            x = InteractiveDataDisplay.Utils.range(0, n);
        } else {
            if (x.length != n && x.length != n + 1) throw "Data series x must have length equal or one more than length of data series f by first dimension";
        }

        var y = data.y;
        if (!y) {
            y = InteractiveDataDisplay.Utils.range(0, m);
        } else {
            if (y.length != m && y.length != m + 1) throw "Data series y must have length equal or one more than length of data series f by second dimension";
        }

        _x = x;
        _y = y;
        _f = f;
        if (x.length == n) {
            if (y.length != m) throw "Data series y must have length equal to length of data series f by second dimension";
            _mode = 'gradient';
        } else {
            if (y.length != m + 1) throw "Data series y must have length equal to one more than length of data series f by second dimension";
            _mode = 'matrix';
        }

        if (_x.length < 2) throw "Data series x must have at least 2 elements by each dimension";
        if (_y.length < 2) throw "Data series y must have at least 2 elements by each dimension";

        // styles:
        if (data && typeof (data.opacity) != 'undefined') {
            loadOpacity(parseFloat(data.opacity));
        }
        if (data && typeof (data.palette) != 'undefined')
            loadPalette(data.palette);
        if (_palette.isNormalized) findFminmax();

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
                    f: _f,
                    fmin: _fmin,
                    fmax: _fmax,
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
    this.getValue = function (xd, yd) {
        var n = _x.length;
        var m = _y.length;
        if (n == 0 || m == 0) return null;

        var cell = getCellContaining(xd, yd);
        if (cell == undefined) return null;
        if (cell != cell) return "<div>" + (this.name || "heatmap") + ": (unknown value)</div>";

        var value;
        if (_mode === "gradient") {
            var flb, flt, frt, frb;
            flt = _f[cell.iLeft][cell.jBottom + 1];
            flb = _f[cell.iLeft][cell.jBottom];
            frt = _f[cell.iLeft + 1][cell.jBottom + 1];
            frb = _f[cell.iLeft + 1][cell.jBottom];

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
            value = _f[cell.iLeft][cell.jBottom];
        }
        return value;
    };

    this.getTooltip = function (xd, yd) {
        if (_f === undefined)
            return;

        var value = this.getValue(xd, yd);
        if (value == null) return;
        return "<div>" + (this.name || "heatmap") +
            ": " + value + "</div>";
    };


    Object.defineProperty(this, "palette", {
        get: function () { return _palette; },
        set: function (value) {
            if (value == _palette) return;
            if (!value) throw "Heatmap palette is undefined";
            if (_palette && value.isNormalized && !_palette.isNormalized && _f) {
                findFminmax();
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
        var div = $("<div class='idd-legend-item'></div>");
        var that = this;
        var nameDiv = $("<span class='idd-legend-item-title'></span>").appendTo(div);
        var setName = function () {
            nameDiv.text(that.name);
        }
        setName();
        var colorIsVisible = 0;
        var paletteControl, colorDiv, paletteDiv;
        var clrTitleText, colorTitle;
        var refreshColor = function () {
            clrTitleText = that.getTitle("values");
            if (colorIsVisible == 0) {
                colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(div);
                colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                paletteDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(colorDiv);

                paletteControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv, _palette);
                colorIsVisible = 2;
            } else colorTitle.text(clrTitleText);

            if (_palette && _palette.isNormalized) {
                paletteControl.dataRange = { min: _fmin, max: _fmax };
            }
        }
        refreshColor();

        this.host.bind("appearanceChanged",
            function (event, propertyName) {
                if (!propertyName || propertyName == "name")
                    setName();
                if (!propertyName || propertyName == "values" || propertyName == "colorPalette")
                    refreshColor();
                if (!propertyName || propertyName == "palette") paletteControl.palette = _palette;
                var oldRange = paletteControl.dataRange;
                if (_palette && _palette.isNormalized && (oldRange == undefined || oldRange.min != _fmin || oldRange.max != _fmax)) {
                    paletteControl.dataRange = { min: _fmin, max: _fmax };
                }
            });

        var onLegendRemove = function () {
            that.host.unbind("appearanceChanged");

            div[0].innerHTML = "";
            div.removeClass("idd-legend-item");
        };

        return { div: div, onLegendRemove: onLegendRemove };
    };

    // Initialization 
    if (initialData && typeof initialData.f != 'undefined')
        this.draw(initialData);
};
InteractiveDataDisplay.Heatmap.prototype = new InteractiveDataDisplay.CanvasPlot();

InteractiveDataDisplay.register("heatmap", function (jqDiv, master) {
    return new InteractiveDataDisplay.Heatmap(jqDiv, master);
});
