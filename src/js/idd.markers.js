// Represents a custom marker to be provided as a shape to a markers plot.
// draw is a function (marker, plotRect, screenSize, transform, context) 
//    it is called once for each marker to render it on a canvas
//    marker is an object with properties representing a slice of data provided in MarkerPlot.draw() method
//    plotRect     {x,y,width,height}  Rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
//    screenSize   {width,height}      Size of the output region to render.
//    transform  { dataToScreenX, dataToScreenY } Transform functions from data to screen coordinates
//    context (canvas context2d) A context to render.
InteractiveDataDisplay.CustomMarkerShape = function (draw, getBoundingBox, getLegendItem) {
    this.draw = draw;
    this.getBoundingBox = getBoundingBox;
    this.getLegendItem = getLegendItem;
};

InteractiveDataDisplay.MaxMarkersPerAnimationFrame = 3000;

InteractiveDataDisplay.Markers = function (div, master) {

    // Initialization (#1)
    var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv);
    var initialData = initializer(div);

    this.base = InteractiveDataDisplay.CanvasPlot;
    this.base(div, master);
    if (!div) return;

    var _data = {};
    var _shape;
    var _colorPalette, _sizePalette;
    var _colorRange, _sizeRange;
    
    var _dataUpdated = false;

    var _markerPushpins = undefined;
    var _pushpinsVisible = false;
    
    var that = this;
    var _preRender;

    var iconDiv = $("<div></div>");
    iconDiv.width(10);
    iconDiv.height(10);
    var iconCv = $("<canvas></canvas>").appendTo(iconDiv);
    var iconCtx = iconCv[0].getContext("2d");
    iconCtx.fillStyle = "rgba(100,100,100,0.3)";
    iconCtx.fillRect(0, 0, 10, 10);

    // default styles:
    var defaultShape = "box";
    var defaultColor = "#4169ed";
    var defaultBorder = "#000000";
    var defaultSize = 10;
    if (initialData) {
        _data.x = initialData.x;
        _data.y = initialData.y;
        _data.size = typeof initialData.size != "undefined" ? initialData.size : defaultSize;
        _data.color = typeof initialData.color != "undefined" ? initialData.color : defaultColor;
        _data.border = typeof initialData.border != "undefined" ? initialData.border : defaultBorder;
        
        _shape = typeof initialData.shape != "undefined" ? initialData.shape : defaultShape;
        _colorPalette = typeof initialData.colorPalette != "undefined" ? initialData.colorPalette : undefined;
        _sizePalette = typeof initialData.sizePalette != "undefined" ? initialData.sizePalette : undefined;
    }

    // Draws the data as markers.
    // { x, y, 
    //   color, colorPalette,
    //   size, sizePalette,
    //   border  
    // }
    // x (optional) is an array of numbers. If absent, sequential numbers are taken.
    // y is an array of numbers, length(y) = length(x).
    // border (optional) is a color, value "none" means no border.
    // size is either a number, or an array of numbers (length(size) = length(y)) those are sizes in pixel or values for sizePalette.
    // sizePalette is InteractiveDataDisplay.SizePalette, if size is an array of numbers it is used to get the pixel size of a marker by size element.
    this.draw = function (data) {
        var y2 = data.y;
        if (!y2) throw "Data series y is undefined";
        var n = y2.length;

        if (!data.x) {
            data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
        if (n != data.x.length) throw "Data series x and y have different lengths";
                
        for (var prop in data) {
            if (prop == "shape" && data[prop] != "undefined")
                _shape = data[prop];
            else if (prop == "sizePalette" && data[prop] != "undefined")
                _sizePalette = data[prop];
            else if (prop == "colorPalette" && data[prop] != "undefined")
                _colorPalette = data[prop];
            else
                _data[prop] = data[prop] != "undefined" ? data[prop] : _data[prop];
        }

        if (_colorPalette && _colorPalette.isNormalized) {
            _colorRange = InteractiveDataDisplay.Utils.getMinMax(_data.color);
        }
        if (_sizePalette && _sizePalette.isNormalized) {
            _sizeRange = InteractiveDataDisplay.Utils.getMinMax(_data.size);
        }
        
        if (typeof _shape == "string") {
            if (!isStandartShape(_shape))
                _shape = eval(_shape);
        }

        _dataUpdated = true;

        this.invalidateLocalBounds();

        this.requestNextFrameOrUpdate();
        this.fireAppearanceChanged();
    };

    // Returns a rectangle in the plot plane.
    this.computeLocalBounds = function (step, computedBounds) {
        var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
        var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
        return InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_data.x, _data.y, dataToPlotX, dataToPlotY);
    }

    // Returns 4 margins in the screen coordinate system
    this.getLocalPadding = function () {
        var padding = 0;
        if (_shape && typeof _shape.getPadding == 'function') {
            return _shape.getPadding(_data);
        }
        var size = _data.size;
        if (InteractiveDataDisplay.Utils.isArray(size)) {
            if (_sizePalette)
                padding = _sizePalette.sizeRange.max / 2;
            else {
                padding = InteractiveDataDisplay.Utils.getMinMax(size).max / 2;
            }
        }
        else {
            padding = size / 2;
        }
        return { left: padding, right: padding, top: padding, bottom: padding };
    };
    
    var isStandartShape = function (shape) {
        if (typeof (shape) == "string") {
            var invShape = shape.toLowerCase();
            if (invShape == "box") return 1;
            else if (invShape == "circle") return 2;
            else if (invShape == "diamond") return 3;
            else if (invShape == "cross") return 4;
            else if (invShape == "triangle") return 5;
            return false;
        }
        else
            return false;
    }

    this.renderCore = function (plotRect, screenSize) {
        InteractiveDataDisplay.Markers.prototype.renderCore.call(this, plotRect, screenSize);

        var _x = _data.x;
        var _y = _data.y;
        if (_x === undefined || _y == undefined) return;
        var n = _y.length;
        if (n == 0) return;

        var dt = this.getTransform();
        var dataToScreenX = dt.dataToScreenX;
        var dataToScreenY = dt.dataToScreenY;

        // size of the canvas
        var w_s = screenSize.width;
        var h_s = screenSize.height;
        var xmin = 0, xmax = w_s;
        var ymin = 0, ymax = h_s;
        var drawBasic = !that.master.isInAnimation || !(that.master.mapControl !== undefined);

        if (that.mapControl !== undefined) {
            if (_dataUpdated || _markerPushpins === undefined) {
                //removing old pushpins
                if (_markerPushpins !== undefined) {
                    _markerPushpins.forEach(function (pp) {
                        var index = that.mapControl.entities.indexOf(pp);
                        if (index >= 0)
                            that.mapControl.entities.removeAt(index);
                    });

                    _markerPushpins = undefined;
                }

                //Creating pushpins if necessary
                if (that.mapControl !== undefined && n <= InteractiveDataDisplay.MaxMarkersPerAnimationFrame) {
                    _markerPushpins = [];
                    for (var i = 0; i < n; i++) {
                        var newPushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(_y[i], _x[i]),
                            {
                                visible: false,
                                htmlContent: '<div style="background-color: white; opacity: 0.5; width: 10px; height: 10px"></div>',
                                anchor: new Microsoft.Maps.Point(5, 5)
                            });
                        _markerPushpins.push(newPushpin);
                        that.mapControl.entities.push(newPushpin); 
                    }
                }
                _dataUpdated = false;
            }

            if (that.master.isInAnimation === true && _markerPushpins !== undefined) {
                if (_pushpinsVisible === false) {
                    _markerPushpins.forEach(function (pp) { pp.setOptions({ visible: true }); });
                    _pushpinsVisible = true;
                }
            }
            else {
                if (_pushpinsVisible === true) {
                    _markerPushpins.forEach(function (pp) { pp.setOptions({ visible: false }); });
                    _pushpinsVisible = false;
                }
            }
        }

        if (drawBasic) {

            // copy array of properties before changings
            var markersData = {};
            for (var prop in _data) {
                markersData[prop] = _data[prop];
            }

            if (_preRender)
                _preRender(markersData, plotRect, screenSize, dt, context);

            // adding aditional field to check whether value is array or not
            for (var prop in markersData) {
                var v = markersData[prop];
                markersData[prop] = { value: v, isArray: InteractiveDataDisplay.Utils.isArray(v) };
            }

            _x = markersData.x.value;
            _y = markersData.y.value;
            if (_x === undefined || _y == undefined) return;
            n = _y.length;
            if (n == 0) return;

            var context = this.getContext(true);
            var i = 0;
            var dx, dy;
            var localSize;
            var localColor = markersData.color.value;
            var colorIsArray = markersData.color.isArray;
            var sizeIsArray = markersData.size.isArray;
            var colorPaletteNormalized = _colorPalette && _colorPalette.isNormalized;
            var sizePaletteNormalized = _sizePalette && _sizePalette.isNormalized;
            
            if (!colorIsArray) {
                context.strokeStyle = localColor;
                context.fillStyle = localColor; // for single points surrounded with missing values
            }
            var drawBorder = false;
            if (markersData.border.value && markersData.border.value !== "none") {
                drawBorder = true;
                context.strokeStyle = markersData.border.value;
            }

            if (typeof _shape == "object") {
                var draw = _shape.draw;
                for (; i < n; i++) {
                    dx = _x[i];
                    dy = _y[i];
                    if ((dx != dx) || (dy != dy)) continue; // missing value

                    var drawData = {}; // construct data (appearance properties) for marker
                    for (var prop in markersData) {
                        var v = markersData[prop];
                        if (v.isArray) drawData[prop] = v.value[i];
                        else drawData[prop] = v.value;
                    }
                    
                    if (sizeIsArray) {
                        localSize = drawData.size;
                        if (localSize != localSize) continue;
                        if (_sizePalette) {
                            if (sizePaletteNormalized)
                                localSize = (localSize - _sizeRange.min) / (_sizeRange.max - _sizeRange.min);
                            drawData.size = _sizePalette.getSize(localSize);
                        }
                    }
                    if (colorIsArray) {
                        localColor = drawData.color;
                        if (localColor != localColor) continue;
                        if (_colorPalette) {
                            if (colorPaletteNormalized)
                                localColor = (localColor - _colorRange.min) / (_colorRange.max - _colorRange.min);
                            rgba = _colorPalette.getRgba(localColor);
                            drawData.color = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
                        }
                    }
                    
                    draw(drawData, plotRect, screenSize, dt, context);
                }
            }
            else {
                var invShape = isStandartShape(_shape);
                var rgba;
                var x1, x2;
                for (; i < n; i++) {
                    dx = _x[i];
                    dy = _y[i];
                    if ((dx != dx) || (dy != dy)) continue; // missing value

                    var drawData = {}; // construct data (appearence properties) for marker
                    for (var prop in markersData) {
                        var v = markersData[prop];
                        if (v.isArray) drawData[prop] = v.value[i];
                        else drawData[prop] = v.value;
                    }

                    if (sizeIsArray) {
                        localSize = drawData.size;
                        if (localSize != localSize) continue;
                        if (_sizePalette) {
                            if (sizePaletteNormalized)
                                localSize = (localSize - _sizeRange.min) / (_sizeRange.max - _sizeRange.min);
                            drawData.size = _sizePalette.getSize(localSize);
                        }
                    }

                    if (colorIsArray) {
                        localColor = drawData.color;
                        if (localColor != localColor) continue;
                        if (_colorPalette) {
                            if (colorPaletteNormalized)
                                localColor = (localColor - _colorRange.min) / (_colorRange.max - _colorRange.min);
                            rgba = _colorPalette.getRgba(localColor);
                            drawData.color = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
                        }
                        context.fillStyle = drawData.color;
                    }
                    
                    x1 = dataToScreenX(drawData.x);
                    y1 = dataToScreenY(drawData.y);
                    localSize = drawData.size;
                    var halfSize = localSize / 2;
                    if ((x1 - halfSize) > w_s || (x1 + halfSize) < 0 || (y1 - halfSize) > h_s || (y1 + halfSize) < 0) continue;

                    // Drawing the marker
                    switch (invShape) {
                        case 1: // box
                            context.fillRect(x1 - halfSize, y1 - halfSize, localSize, localSize);
                            if (drawBorder)
                                context.strokeRect(x1 - halfSize, y1 - halfSize, localSize, localSize);
                            break;
                        case 2: // circle
                            context.beginPath();
                            context.arc(x1, y1, halfSize, 0, 2 * Math.PI);
                            context.fill();
                            if (drawBorder)
                                context.stroke();
                            break;
                        case 3: // diamond
                            context.beginPath();
                            context.moveTo(x1 - halfSize, y1);
                            context.lineTo(x1, y1 - halfSize);
                            context.lineTo(x1 + halfSize, y1);
                            context.lineTo(x1, y1 + halfSize);
                            context.closePath();
                            context.fill();
                            if (drawBorder)
                                context.stroke();
                            break;
                        case 4: // cross
                            var thirdSize = localSize / 3;
                            var halfThirdSize = thirdSize / 2;
                            if (drawBorder) {
                                context.beginPath();
                                context.moveTo(x1 - halfSize, y1 - halfThirdSize);
                                context.lineTo(x1 - halfThirdSize, y1 - halfThirdSize);
                                context.lineTo(x1 - halfThirdSize, y1 - halfSize);
                                context.lineTo(x1 + halfThirdSize, y1 - halfSize);
                                context.lineTo(x1 + halfThirdSize, y1 - halfThirdSize);
                                context.lineTo(x1 + halfSize, y1 - halfThirdSize);
                                context.lineTo(x1 + halfSize, y1 + halfThirdSize);
                                context.lineTo(x1 + halfThirdSize, y1 + halfThirdSize);
                                context.lineTo(x1 + halfThirdSize, y1 + halfSize);
                                context.lineTo(x1 - halfThirdSize, y1 + halfSize);
                                context.lineTo(x1 - halfThirdSize, y1 + halfThirdSize);
                                context.lineTo(x1 - halfSize, y1 + halfThirdSize);
                                context.closePath();
                                context.fill();
                                context.stroke();
                            } else {
                                context.fillRect(x1 - halfThirdSize, y1 - halfSize, thirdSize, localSize);
                                context.fillRect(x1 - halfSize, y1 - halfThirdSize, localSize, thirdSize);
                            }
                            break;
                        case 5: // triangle
                            context.beginPath();
                            context.moveTo(x1 - halfSize, y1 + halfSize);
                            context.lineTo(x1, y1 - halfSize);
                            context.lineTo(x1 + halfSize, y1 + halfSize);
                            context.closePath();
                            context.fill();
                            if (drawBorder)
                                context.stroke();
                            break;
                    }
                }
            }
        }
    };

    this.findToolTipMarkers = function (xd, yd, xp, yp) {
        var result = [];

        var _x = _data.x;
        var _y = _data.y;
        if (_x == undefined || _y == undefined)
            return result;
        var n = _x.length;
        var m = _y.length;
        if (n == 0 || m == 0) return result;

        var x1, x2
        var i = 0;
        var localSize = _data.size;
        var sizeIsArray = InteractiveDataDisplay.Utils.isArray(localSize);
        var colorIsArray = InteractiveDataDisplay.Utils.isArray(_data.color);
        var sizePaletteNormalized = _sizePalette && _sizePalette.isNormalized;

        var t = this.getTransform();
        var xs = t.dataToScreenX(xd);
        var ys = t.dataToScreenY(yd);

        var that = this;

        if (typeof (_shape) == "object") {
            if (typeof (_shape.hitTest) == "function") {
                var ps = { x: xs, y: ys };
                var pd = { x: xd, y: yd };
                for (var i = 0; i < n; i++) {
                    var drawData = {};
                    for (var prop in _data) {
                        var v = _data[prop];
                        if (InteractiveDataDisplay.Utils.isArray(v)) drawData[prop] = v[i];
                        else drawData[prop] = v;
                    }
                    if (sizeIsArray) {
                        localSize = drawData.size;
                        if (_sizePalette) {
                            if (sizePaletteNormalized)
                                localSize = (localSize - _sizeRange.min) / (_sizeRange.max - _sizeRange.min);
                            drawData.size = _sizePalette.getSize(localSize);
                        }
                    }
                    if (_shape.hitTest(drawData, t, ps, pd)) {
                        var drawData = {};
                        for (var prop in _data) {
                            var v = _data[prop];
                            if (InteractiveDataDisplay.Utils.isArray(v)) drawData[prop] = v[i];
                        }
                        drawData.index = i;
                        result.push(drawData);
                    }
                }
            }
        }
        else {
            var isInside = function (p, points) {
                var classify = function (p, p0, p1) {
                    var a = { x: p1.x - p0.x, y: p1.y - p0.y };
                    var b = { x: p.x - p0.x, y: p.y - p0.y };
                    var s = a.x * b.y - a.y * b.x;
                    if (s > 0) return 1; // left
                    if (s < 0) return 2; // right
                    return 0;
                }
                var n = points.length;
                for (var i = 0; i < n; i++) {
                    if (classify(p, points[i], points[(i + 1) % n]) != 1) return false;
                }
                return true;
            };

            var invShape = isStandartShape(_shape);
            for (; i < n; i++) {
                var dx = _x[i];
                var dy = _y[i];
                if ((dx != dx) || (dy != dy)) continue; // missing value

                if (sizeIsArray) {
                    localSize = _data.size[i];
                    if (_sizePalette) {
                        if (sizePaletteNormalized)
                            localSize = (localSize - _sizeRange.min) / (_sizeRange.max - _sizeRange.min);
                        localSize = _sizePalette.getSize(localSize);
                    }
                }

                x1 = t.dataToScreenX(dx);
                y1 = t.dataToScreenY(dy);
                var halfSize = localSize / 2; // Checks bounding box hit:
                if (xs >= x1 - halfSize && xs <= x1 + halfSize && ys >= y1 - halfSize && ys <= y1 + halfSize) {
                    var drawData = {};
                    for (var prop in _data) {
                        var v = _data[prop];
                        if (InteractiveDataDisplay.Utils.isArray(v)) drawData[prop] = v[i];
                    }
                    drawData.index = i;
                                        
                    // Drawing the marker
                    switch (invShape) {
                        case 1: // box
                            result.push(drawData);
                            break;
                        case 2: // circle
                            if ((x1 - xs) * (x1 - xs) + (y1 - ys) * (y1 - ys) <= halfSize * halfSize)
                                result.push(drawData);
                            break;
                        case 3: // diamond
                            if (isInside({ x: xs, y: ys }, [{ x: x1 - halfSize, y: y1 }, { x: x1, y: y1 - halfSize },
                                                            { x: x1 + halfSize, y: y1 }, { x: x1, y: y1 + halfSize }, ]))
                                result.push(drawData);
                            break;
                        case 4: // cross
                            var thirdSize = localSize / 3;
                            var halfThirdSize = thirdSize / 2;
                            if (isInside({ x: xs, y: ys }, [{ x: x1 - halfThirdSize, y: y1 + halfSize }, { x: x1 - halfThirdSize, y: y1 - halfSize },
                                                            { x: x1 + halfThirdSize, y: y1 - halfSize }, { x: x1 + halfThirdSize, y: y1 + halfSize }]) ||
                                isInside({ x: xs, y: ys }, [{ x: x1 - halfSize, y: y1 + halfThirdSize }, { x: x1 - halfSize, y: y1 - halfThirdSize },
                                                            { x: x1 + halfSize, y: y1 - halfThirdSize }, { x: x1 + halfSize, y: y1 + halfThirdSize }]))
                                result.push(drawData);
                            break;
                        case 5: // triangle
                            if (isInside({ x: xs, y: ys }, [{ x: x1 - halfSize, y: y1 + halfSize }, { x: x1, y: y1 - halfSize },
                                                            { x: x1 + halfSize, y: y1 + halfSize }]))
                                result.push(drawData);
                            break;
                    }
                }
            }
        }

        return result;
    };

    // Builds a tooltip <div> for a point
    this.getTooltip = function (xd, yd, xp, yp) {
        var that = this;
        var resultMarkers = that.findToolTipMarkers(xd, yd, xp, yp);
        var buildTooltip = function (markerInfo) {
            var content = undefined;
            for (var prop in markerInfo) {
                if (markerInfo.hasOwnProperty(prop)) {
                    if (content)
                        content += "<br/><b>" + prop + "</b>: " + markerInfo[prop];
                    else
                        content = "<b>" + prop + "</b>: " + markerInfo[prop];
                }
            }
            return "<div>" + content + "</div>";
        };
        if (resultMarkers.length > 0) {
            var toolTip = "<b>" + that.name + "</b>";
            resultMarkers.forEach(function (markerInfo) {
                toolTip += "<br/>" + buildTooltip(markerInfo);
            });
            return "<div>" + toolTip + "</div>";
        }
    };

    // Others
    this.onDataTransformChanged = function (arg) {
        this.invalidateLocalBounds();
        InteractiveDataDisplay.Markers.prototype.onDataTransformChanged.call(this, arg);
    };

    Object.defineProperty(this, "color", {
        get: function () { return _data.color; },
        set: function (value) {
            if (value == _data.color) return;
            _data.color = value;

            this.fireAppearanceChanged("color");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    Object.defineProperty(this, "colorPalette", {
        get: function () { return _colorPalette; },
        set: function (value) {
            if (value == _colorPalette) return;
            _colorPalette = value;
            if (value.isNormalized) {
                _colorRange = InteractiveDataDisplay.Utils.getMinMax(_data.color);
            }

            this.fireAppearanceChanged("colorPalette");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    Object.defineProperty(this, "size", {
        get: function () { return _data.size; },
        set: function (value) {
            if (value == _data.size) return;
            _data.size = value;

            this.fireAppearanceChanged("size");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    Object.defineProperty(this, "sizePalette", {
        get: function () { return _sizePalette; },
        set: function (value) {
            if (value == _sizePalette) return;
            _sizePalette = value;
            if (value.isNormalized) {
                _sizeRange = InteractiveDataDisplay.Utils.getMinMax(_data.size);
            }

            this.fireAppearanceChanged("sizePalette");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    Object.defineProperty(this, "shape", {
        get: function () { return _shape; },
        set: function (value) {
            if (value == _shape) return;
            _shape = value;

            this.fireAppearanceChanged("shape");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    Object.defineProperty(this, "border", {
        get: function () { return _data.border; },
        set: function (value) {
            if (value == _data.border) return;
            _data.border = value;

            this.fireAppearanceChanged("border");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    Object.defineProperty(this, "preRender", {
        get: function () { return _preRender; },
        set: function (value) {
            if (value == _preRender) return;
            _preRender = value;

            this.fireAppearanceChanged("preRender");
            this.requestNextFrameOrUpdate();
        },
        configurable: false
    });

    this.getLegend = function () {
        var div = $("<div class='idd-legend-item'></div>");

        var itemDiv = $("<div></div>").appendTo(div);

        var fontSize = 14;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            fontSize = parseFloat(document.defaultView.getComputedStyle(div[0], null).getPropertyValue("font-size"));
        }
        if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

        var canvas = $("<canvas style='margin-right: 10px; display: inline-block'></canvas>").appendTo(itemDiv);
        var canvasIsVisible = true;
        var maxSize = fontSize * 1.5;
        var x1 = maxSize / 2 + 1;
        var y1 = x1;
        canvas[0].width = canvas[0].height = maxSize + 2;
        var canvasStyle = canvas[0].style;
        var context = canvas.get(0).getContext("2d");

        var name = $("<span style='vertical-align: top'>" + this.name + "</span>").appendTo(itemDiv);

        var item, itemDivStyle;
        var itemIsVisible = 0;

        var colorIsArray, color, border, drawBorder;
        var colorDiv, colorDivStyle, colorControl;
        var colorIsVisible = 0;

        var sizeIsArray, size, halfSize;
        var sizeDiv, sizeDivStyle, sizeControl;
        var sizeIsVisible = 0;

        var refreshSize = function () {
            sizeIsArray = InteractiveDataDisplay.Utils.isArray(_data.size);
            if (sizeIsArray) {
                size = maxSize;
                if (_sizePalette) {
                    if (sizeIsVisible == 0) {
                        sizeDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(div);
                        sizeDivStyle = sizeDiv[0].style;
                        sizeControl = new InteractiveDataDisplay.SizePaletteViewer(sizeDiv);
                        sizeIsVisible = 2;
                    }
                    sizeControl.palette = _sizePalette;
                    if (_sizePalette.isNormalized) {
                        sizeControl.dataRange = _sizeRange;
                    }
                    if (sizeIsVisible == 1) {
                        sizeDivStyle.display = "block";
                        sizeIsVisible = 2;
                    }
                }
            }
            else {
                size = Math.min(_data.size, maxSize);
                if (sizeIsVisible == 2) {
                    sizeDivStyle.display = "none";
                    sizeIsVisible = 1;
                }
            }
            halfSize = size / 2;
        };

        var refreshColor = function () {
            colorIsArray = InteractiveDataDisplay.Utils.isArray(_data.color);
            drawBorder = false;
            if (colorIsArray && _colorPalette) {
                if (colorIsVisible == 0) {
                    colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(div);
                    colorDivStyle = colorDiv[0].style;
                    colorControl = new InteractiveDataDisplay.ColorPaletteViewer(colorDiv);
                    colorIsVisible = 2;
                }
                colorControl.palette = _colorPalette;
                if (_colorPalette.isNormalized) {
                    colorControl.dataRange = _colorRange;
                }
                if (colorIsVisible == 1) {
                    colorDivStyle.display = "block";
                    colorIsVisible = 2;
                }
            }
            else {
                if (colorIsVisible == 2) {
                    colorDivStyle.display = "none";
                    colorIsVisible = 1;
                }
            }
            if (colorIsArray) {
                border = "#000000";
                color = "#ffffff";
                drawBorder = true;
            }
            else {
                color = _data.color;
                border = color;
                if (_data.border) {
                    drawBorder = true;
                    border = _data.border;
                }
            }
        };

        var renderShape = function () {
            if (typeof (_shape) == "object") {
                if (_shape.getLegendItem) {
                    var drawData = { size: size, color: color, border: border };
                    for (var prop in _data) {
                        if (prop != "size" && prop != "color" && prop != "border") {
                            var v = _data[prop];
                            if (InteractiveDataDisplay.Utils.isArray(v)) drawData[prop] = v[i];
                            else drawData[prop] = v;
                        }
                    }

                    if (itemIsVisible == 0) {
                        item = _shape.getLegendItem(drawData);
                        itemDiv[0].insertBefore(item[0], name[0]);
                    }
                    else {
                        var newItem = _shape.getLegendItem(drawData);
                        item.replaceWith(newItem);
                        item = newItem;
                    }
                    itemDivStyle = item[0].style;
                    itemIsVisible = 2;
                }
                if (canvasIsVisible) {
                    canvasStyle.display = "none";
                    canvasIsVisible = false;
                }
            }
            else {
                if (itemIsVisible == 2) {
                    itemDivStyle.display = "none";
                    itemIsVisible = 1;
                }
                context.clearRect(0, 0, maxSize + 2, maxSize + 2);
                context.strokeStyle = border;
                context.fillStyle = color;

                var invShape = isStandartShape(_shape);
                switch (invShape) {
                    case 1: // box
                        context.fillRect(x1 - halfSize, y1 - halfSize, size, size);
                        if (drawBorder)
                            context.strokeRect(x1 - halfSize, y1 - halfSize, size, size);
                        break;
                    case 2: // circle
                        context.beginPath();
                        context.arc(x1, y1, halfSize, 0, 2 * Math.PI);
                        context.fill();
                        if (drawBorder)
                            context.stroke();
                        break;
                    case 3: // diamond
                        context.beginPath();
                        context.moveTo(x1 - halfSize, y1);
                        context.lineTo(x1, y1 - halfSize);
                        context.lineTo(x1 + halfSize, y1);
                        context.lineTo(x1, y1 + halfSize);
                        context.closePath();
                        context.fill();
                        if (drawBorder)
                            context.stroke();
                        break;
                    case 4: // cross
                        var thirdSize = size / 3;
                        var halfThirdSize = thirdSize / 2;
                        if (drawBorder) {
                            context.beginPath();
                            context.moveTo(x1 - halfSize, y1 - halfThirdSize);
                            context.lineTo(x1 - halfThirdSize, y1 - halfThirdSize);
                            context.lineTo(x1 - halfThirdSize, y1 - halfSize);
                            context.lineTo(x1 + halfThirdSize, y1 - halfSize);
                            context.lineTo(x1 + halfThirdSize, y1 - halfThirdSize);
                            context.lineTo(x1 + halfSize, y1 - halfThirdSize);
                            context.lineTo(x1 + halfSize, y1 + halfThirdSize);
                            context.lineTo(x1 + halfThirdSize, y1 + halfThirdSize);
                            context.lineTo(x1 + halfThirdSize, y1 + halfSize);
                            context.lineTo(x1 - halfThirdSize, y1 + halfSize);
                            context.lineTo(x1 - halfThirdSize, y1 + halfThirdSize);
                            context.lineTo(x1 - halfSize, y1 + halfThirdSize);
                            context.closePath();
                            context.fill();
                            context.stroke();
                        } else {
                            context.fillRect(x1 - halfThirdSize, y1 - halfSize, thirdSize, size);
                            context.fillRect(x1 - halfSize, y1 - halfThirdSize, size, thirdSize);
                        }
                        break;
                    case 5: // triangle
                        context.beginPath();
                        context.moveTo(x1 - halfSize, y1 + halfSize);
                        context.lineTo(x1, y1 - halfSize);
                        context.lineTo(x1 + halfSize, y1 + halfSize);
                        context.closePath();
                        context.fill();
                        if (drawBorder)
                            context.stroke();
                        break;
                }
                if (!canvasIsVisible) {
                    canvasStyle.display = "inline-block";
                    canvasIsVisible = true;
                }
            }
        };

        refreshColor();
        refreshSize();
        renderShape();
        var that = this;

        this.host.bind("appearanceChanged",
            function (event, propertyName) {
                if (!propertyName || propertyName == "color" || propertyName == "colorPalette") {
                    refreshColor();
                }
                if (!propertyName || propertyName == "size" || propertyName == "sizePalette")
                    refreshSize();
                renderShape();
            });

        var onLegendRemove = function () {
            that.host.unbind("appearanceChanged");

            div[0].innerHTML = "";
            div.removeClass("idd-legend-item");
        };

        return { div: div, onLegendRemove: onLegendRemove };
    };

    // Initialization 
    if (initialData && typeof initialData.y != 'undefined')
        this.draw(initialData);
};

InteractiveDataDisplay.Markers.prototype = new InteractiveDataDisplay.CanvasPlot;

InteractiveDataDisplay.AdaptMarkerSize = function (markers, plotRect, screenSize, transform, context) {
    var visibleMarkers = 0;
    var x = markers.x;
    var y = markers.y;
    var xi, yi;
    for (var i = 0, n = x.length; i < n; i++) {
        xi = x[i];
        yi = y[i];
        if (xi >= plotRect.x && xi <= plotRect.x + plotRect.width && yi >= plotRect.y && yi <= plotRect.y + plotRect.height)
            visibleMarkers++;
    }
    // constants
    var areaConst = 0.2;
    var minAdaptiveSize = 15;
    var maxAdaptiveSize = 100;
    // adaptive size in plot coordinates
    var adaptiveSize = Math.sqrt(areaConst * plotRect.width * plotRect.height / visibleMarkers);
    // transform to screen coordinates and check limits
    adaptiveSize = transform.dataToScreenX(adaptiveSize) - transform.dataToScreenX(0);
    if (adaptiveSize < minAdaptiveSize) adaptiveSize = minAdaptiveSize;
    else if (adaptiveSize > maxAdaptiveSize) adaptiveSize = maxAdaptiveSize;
    markers.size = adaptiveSize;
};



