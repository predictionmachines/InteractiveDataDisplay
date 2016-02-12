/// <reference path="plotregistry.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="plotregistry.ts" />
/// <reference path="utils.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    module Markers {
        export function drawShape(context, shape, x, y, width, height, scale, fill, stroke?) {
            var w = width;
            var h = height;
            var useStroke = stroke !== "none";
            context.strokeStyle = stroke !== undefined ? stroke : "black";
            context.fillStyle = fill !== undefined ? fill : "black";

            var x1 = x;// w / 2;
            var y1 = y; //h / 2;

            var size = Math.min(w, h) * scale;
            var halfSize = 0.5 * size;
            var quarterSize = 0.5 * halfSize;

            context.clearRect(0, 0, w, h);
            switch (shape) {
                case "box": // box                
                    if (useStroke) context.strokeRect(x1 - halfSize, y1 - halfSize, size, size);
                    context.fillRect(x1 - halfSize, y1 - halfSize, size, size);
                    break;
                case "circle": // circle
                    context.beginPath();
                    context.arc(x1, y1, halfSize, 0, 2 * Math.PI);
                    if (useStroke) context.stroke();
                    context.fill();
                    break;
                case "diamond": // diamond
                    context.beginPath();
                    context.moveTo(x1 - halfSize, y1);
                    context.lineTo(x1, y1 - halfSize);
                    context.lineTo(x1 + halfSize, y1);
                    context.lineTo(x1, y1 + halfSize);
                    context.closePath();
                    if (useStroke) context.stroke();
                    context.fill();
                    break;
                case "cross": // cross
                    var thirdSize = size / 3;
                    var halfThirdSize = thirdSize / 2;
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
                    if (useStroke) context.stroke();
                    context.fill();
                    break;
                case "triangle": // triangle
                    var r = Math.sqrt(3) / 6 * size;
                    context.beginPath();
                    context.moveTo(x1 - halfSize, y1 + r);
                    context.lineTo(x1, y1 - r * 2);
                    context.lineTo(x1 + halfSize, y1 + r);
                    context.closePath();
                    if (useStroke) context.stroke();
                    context.fill();
                    break;
                case "boxnowhisker":
                    context.fillRect(x1 - halfSize, y1 - halfSize, size, size);

                    if (useStroke) context.strokeRect(x1 - halfSize, y1 - halfSize, size, size);
                    context.beginPath();
                    context.moveTo(x1 - halfSize, y1);
                    context.lineTo(x1 + halfSize, y1);
                    context.closePath();
                    if (useStroke) context.stroke();
                    break;
                case "boxwhisker":
                    context.fillRect(x1 - halfSize, y1 - quarterSize, size, halfSize);

                    context.beginPath();
                    context.moveTo(x1 - halfSize, y1 + halfSize);
                    context.lineTo(x1 + halfSize, y1 + halfSize);
                    context.moveTo(x1 - halfSize, y1 - halfSize);
                    context.lineTo(x1 + halfSize, y1 - halfSize);
                    context.moveTo(x1, y1 + halfSize);
                    context.lineTo(x1, y1 + quarterSize);
                    context.moveTo(x1, y1 - halfSize);
                    context.lineTo(x1, y1 - quarterSize);
                    context.closePath();
                    if (useStroke) context.stroke();

                    if (useStroke) context.strokeRect(x1 - halfSize, y1 - quarterSize, size, halfSize);

                    if (useStroke) {
                        context.beginPath();
                        context.moveTo(x1 - halfSize, y1);
                        context.lineTo(x1 + halfSize, y1);
                        context.stroke();
                    }
                    break;
                case "whisker":
                    context.fillRect(x1 - halfSize, y1 - halfSize, size, size);

                    if (useStroke) {
                        context.beginPath();
                        context.moveTo(x1 - halfSize, y1 + halfSize);
                        context.lineTo(x1 + halfSize, y1 + halfSize);

                        context.moveTo(x1 - halfSize, y1 - halfSize);
                        context.lineTo(x1 + halfSize, y1 - halfSize);

                        context.moveTo(x1 - halfSize, y1);
                        context.lineTo(x1 + halfSize, y1);

                        context.moveTo(x1, y1 + halfSize);
                        context.lineTo(x1, y1 - halfSize);

                        context.stroke();
                    }
                    break;

            }
        }

        export var BoxWhisker = {
            draw: function (marker, plotRect, screenSize, transform, context) {

                var msize = marker.size;
                var shift = msize / 2;
                var x = transform.dataToScreenX(marker.x);
                var y = transform.dataToScreenY(marker.y);
                var u68 = transform.dataToScreenY(marker.u68);
                var l68 = transform.dataToScreenY(marker.l68);
                var u95 = transform.dataToScreenY(marker.u95);
                var l95 = transform.dataToScreenY(marker.l95);
                var mean = transform.dataToScreenY(marker.y_mean);

                context.beginPath();
                context.strokeStyle = marker.border === undefined ? "black" : marker.border;

                if (marker.color) context.fillRect(x - shift, l68, msize, u68 - l68);
                context.strokeRect(x - shift, l68, msize, u68 - l68);

                context.moveTo(x - shift, u95);
                context.lineTo(x + shift, u95);

                context.moveTo(x, u95);
                context.lineTo(x, u68);

                context.moveTo(x, l68);
                context.lineTo(x, l95);

                context.moveTo(x - shift, l95);
                context.lineTo(x + shift, l95);

                context.moveTo(x - shift, mean);
                context.lineTo(x + shift, mean);

                context.stroke();

                if (marker.y_min !== undefined) {
                    context.beginPath();
                    context.arc(x, transform.dataToScreenY(marker.y_min), shift / 2, 0, 2 * Math.PI);
                    context.stroke();
                }

                if (marker.y_max !== undefined) {
                    context.beginPath();
                    context.arc(x, transform.dataToScreenY(marker.y_max), shift / 2, 0, 2 * Math.PI);
                    context.stroke();
                }
            },

            hitTest: function (marker, transform, ps, pd) {
                var xScreen = transform.dataToScreenX(marker.x);

                var ymax = transform.dataToScreenY(marker.y_min === undefined ? marker.l95 : marker.y_min);
                var ymin = transform.dataToScreenY(marker.y_max === undefined ? marker.u95 : marker.y_max);

                var isIntersecting =
                    ps.x > xScreen - marker.size / 2 &&
                    ps.x < xScreen + marker.size / 2 &&
                    ps.y > ymin &&
                    ps.y < ymax;

                return isIntersecting;
            },

            getPadding: function (data) {
                var padding = 0;
                return { left: padding, right: padding, top: padding, bottom: padding };
            }
        };

        export var BoxNoWhisker = {
            draw: function (marker, plotRect, screenSize, transform, context) {

                var msize = marker.size;
                var shift = msize / 2;
                var x = transform.dataToScreenX(marker.x);
                var y = transform.dataToScreenY(marker.y);
                var u68 = transform.dataToScreenY(marker.u68);
                var l68 = transform.dataToScreenY(marker.l68);
                var u95 = transform.dataToScreenY(marker.u95);
                var l95 = transform.dataToScreenY(marker.l95);
                var mean = transform.dataToScreenY(marker.y_mean);

                context.beginPath();
                context.strokeStyle = marker.border === undefined ? "black" : marker.border;

                if (marker.color) context.fillRect(x - shift, l68, msize, u68 - l68);
                context.strokeRect(x - shift, l68, msize, u68 - l68);

                context.moveTo(x - shift, mean);
                context.lineTo(x + shift, mean);

                context.stroke();

                if (marker.y_min !== undefined) {
                    context.beginPath();
                    context.arc(x, transform.dataToScreenY(marker.y_min), shift / 2, 0, 2 * Math.PI);
                    context.stroke();
                }

                if (marker.y_max !== undefined) {
                    context.beginPath();
                    context.arc(x, transform.dataToScreenY(marker.y_max), shift / 2, 0, 2 * Math.PI);
                    context.stroke();
                }
            },

            hitTest: function (marker, transform, ps, pd) {
                var xScreen = transform.dataToScreenX(marker.x);

                var ymax = transform.dataToScreenY(marker.y_min === undefined ? marker.l95 : marker.y_min);
                var ymin = transform.dataToScreenY(marker.y_max === undefined ? marker.u95 : marker.y_max);

                var isIntersecting =
                    ps.x > xScreen - marker.size / 2 &&
                    ps.x < xScreen + marker.size / 2 &&
                    ps.y > ymin &&
                    ps.y < ymax;

                return isIntersecting;
            },

            getPadding: function (data) {
                var padding = 0;
                return { left: padding, right: padding, top: padding, bottom: padding };
            }
        };

        export var Whisker = {
            draw: function (marker, plotRect, screenSize, transform, context) {

                var msize = marker.size;
                var shift = msize / 2;
                var x = transform.dataToScreenX(marker.x);
                var y = transform.dataToScreenY(marker.y);
                var u68 = transform.dataToScreenY(marker.u68);
                var l68 = transform.dataToScreenY(marker.l68);
                var u95 = transform.dataToScreenY(marker.u95);
                var l95 = transform.dataToScreenY(marker.l95);
                var mean = transform.dataToScreenY(marker.y_mean);

                context.beginPath();
                context.strokeStyle = marker.border === undefined ? "black" : marker.border;

                context.moveTo(x - shift, u95);
                context.lineTo(x + shift, u95);

                context.moveTo(x, u95);
                context.lineTo(x, l95);

                context.moveTo(x - shift, l95);
                context.lineTo(x + shift, l95);

                context.moveTo(x - shift, mean);
                context.lineTo(x + shift, mean);

                context.stroke();

                if (marker.y_min !== undefined) {
                    context.beginPath();
                    context.arc(x, transform.dataToScreenY(marker.y_min), shift / 2, 0, 2 * Math.PI);
                    context.stroke();
                }

                if (marker.y_max !== undefined) {
                    context.beginPath();
                    context.arc(x, transform.dataToScreenY(marker.y_max), shift / 2, 0, 2 * Math.PI);
                    context.stroke();
                }
            },

            getBoundingBox: function (marker, transform) {
                var sizeX = transform.screenToDataX(marker.size);

                var ymin = marker.y_min === undefined ? marker.l95 : marker.y_min;
                var ymax = marker.y_max === undefined ? marker.u95 : marker.y_max;

                return { x: marker.x - sizeX / 2, y: ymin, width: sizeX, height: Math.abs(ymax - ymin) };
            },

            hitTest: function (marker, transform, ps, pd) {
                var xScreen = transform.dataToScreenX(marker.x);

                var ymax = transform.dataToScreenY(marker.y_min === undefined ? marker.l95 : marker.y_min);
                var ymin = transform.dataToScreenY(marker.y_max === undefined ? marker.u95 : marker.y_max);

                var isIntersecting =
                    ps.x > xScreen - marker.size / 2 &&
                    ps.x < xScreen + marker.size / 2 &&
                    ps.y > ymin &&
                    ps.y < ymax;

                return isIntersecting;
            },

            getPadding: function (data) {
                var padding = 0;
                return { left: padding, right: padding, top: padding, bottom: padding };
            }
        };

        export var BullEye = {
            draw: function (marker, plotRect, screenSize, transform, context) {

                var mean = marker.y_mean;
                var u95 = marker.u95;
                var l95 = marker.l95;

                if (marker.uncertainColorPalette) {
                    u95 = RgbaToString(marker.uncertainColorPalette.getRgba(u95));
                    l95 = RgbaToString(marker.uncertainColorPalette.getRgba(l95));
                }

                var msize = marker.size;
                var shift = msize / 2;
                var x = transform.dataToScreenX(marker.x);
                var y = transform.dataToScreenY(marker.y);

                if (x + shift < 0 || x - shift > screenSize.width) return;
                if (y + shift < 0 || y - shift > screenSize.height) return;

                drawShape(context, marker.bullEyeShape, x, y, msize, msize, 1, u95);
                drawShape(context, marker.bullEyeShape, x, y, shift, shift, 1, l95);
            },

            hitTest: function (marker, transform, ps, pd) {
                var xScreen = transform.dataToScreenX(marker.x);
                var yScreen = transform.dataToScreenY(marker.y);

                var isIntersecting =
                    ps.x > xScreen - marker.size / 2 &&
                    ps.x < xScreen + marker.size / 2 &&
                    ps.y > yScreen - marker.size / 2 &&
                    ps.y < yScreen + marker.size / 2;

                return isIntersecting;
            },

            getPadding: function (data) {
                var padding = 0;
                return { left: padding, right: padding, top: padding, bottom: padding };
            }
        };

        export var Petal = {

            draw: function (marker, plotRect, screenSize, transform, context) {
                var x0 = transform.dataToScreenX(marker.x);
                var y0 = transform.dataToScreenY(marker.y);
                if (x0 > screenSize.width || x0 < 0) return;
                if (y0 > screenSize.height || y0 < 0) return;

                var maxSize = marker.size / 2;
                var minSize = maxSize * (1 - (marker.u95 - marker.l95) / marker.maxDelta);
                if (marker.maxDelta <= 0) minSize = NaN;

                Petal.drawSample(context, x0, y0, minSize, maxSize, marker.color);
            },

            drawSample: function (context, x, y, minSize, maxSize, color) {
                var A, D;
                var C = Math.random() * Math.PI * 2;
                if (isNaN(minSize)) {
                    A = 0;
                    D = maxSize;
                    context.fillStyle = "rgba(0, 0, 0, 0.2)";
                }
                else {
                    A = (maxSize - minSize) / 2;
                    D = (maxSize + minSize) / 2;
                    context.fillStyle = color;
                }
                context.strokeStyle = "black";

                context.beginPath();
                var n = 1000;
                var alpha = Math.PI * 2 / n;
                for (var i = 0; i < n; i++) {
                    var phi = alpha * i;
                    var r = A * Math.sin(6 * phi + C) + D;
                    if (i == 0)
                        context.moveTo(x + r * Math.cos(phi), y + r * Math.sin(phi));
                    else
                        context.lineTo(x + r * Math.cos(phi), y + r * Math.sin(phi));
                }
                context.stroke();
                context.closePath();
                context.fill();

                context.strokeStyle = "grey";
                context.beginPath();
                context.arc(x, y, 1, 0, Math.PI * 2);
                context.stroke();
                context.closePath();
            },

            getBoundingBox: function (marker) {
                var r = marker.size / 2;
                var xLeft = marker.x - r;
                var yBottom = marker.y - r;
                return { x: marker.x - r, y: marker.y - r, width: 2 * r, height: 2 * r };
            },

            hitTest: function (marker, transform, ps, pd) {
                var x = transform.dataToScreenX(marker.x);
                var y = transform.dataToScreenY(marker.y);
                var r = marker.size / 2;
                if (ps.x < x - r || ps.x > x + r) return false;
                if (ps.y < y - r || ps.y > y + r) return false;
                return true;
            }
        };
       
        export function createThumbnail (plotInfo: Plot.MarkersDefinition) {
            var isSizeDataBound = plotInfo.size && plotInfo.size["median"];
            var content = $("<div></div>");

            // Append canvas marker thumbnail. 
            // Marker is drawn in color if color is fixed or in black is color is data series.
            // Size of marker is always 18.
            var canvas = $("<canvas class='dsv-plotcard-thumbnail'></canvas>").appendTo(content);
            var size = 18;
            var halfSize = size / 2;
            var x1 = halfSize + 0.5;
            var y1 = halfSize + 0.5;
            canvas.prop({ width: size + 1, height: size + 1 });
            var context = (<HTMLCanvasElement>canvas[0]).getContext("2d");

            var sampleColor = typeof plotInfo.color == "string" ? plotInfo.color : "gray";
            var sampleBorderColor = typeof plotInfo.borderColor == "string" ? plotInfo.borderColor : "gray";
            
            if (isSizeDataBound) {
                Petal.drawSample(context, x1, y1, halfSize / 2, halfSize, sampleColor);
            }
            else {
                var y = <Plot.Quantiles>plotInfo.y;
                var shp = plotInfo.shape;
                if (y.upper95 && y.lower95 && shp !== "boxwhisker" && shp !== "boxnowhisker" && shp !== "whisker")
                    shp = "boxwhisker";
                drawShape(context, shp, x1, y1, size, size, 1.0, sampleColor, sampleBorderColor);
            }
            return content;
        }

        export function UncertaintySizePaletteViewer(div, options?) {
            var _host = div;
            var _width = _host.width();
            var _height = 65;

            if (options !== undefined) {
                if (options.width !== undefined)
                    _width = options.width;
                if (options.height !== undefined)
                    _height = options.height;
            }

            var _maxDelta = undefined;
            Object.defineProperty(this, "maxDelta", {
                get: function () { return _maxDelta; },
                set: function (value) {
                    if (value) {
                        _maxDelta = value;
                        renderPalette();
                    }
                }
            });

            var canvas = $("<canvas height='50px'></canvas>");
            _host[0].appendChild(canvas[0]);
            var context = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
            var markers = [
                { x: 25, y: 20, min: 16, max: 16 },
                { x: 75, y: 20, min: 10, max: 16 },
                { x: 125, y: 20, min: 0, max: 16 }];

            var renderPalette = function () {
                //canvas[0].width = canvas[0].width;
                // draw sample markers
                for (var i = 0; i < markers.length; i++) {
                    Petal.drawSample(context, markers[i].x, markers[i].y, markers[i].min, markers[i].max, "#484848");
                }
                // draw arrow
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(20, 45.5);
                context.lineTo(118, 45.5);
                context.stroke();
                context.closePath();
                context.beginPath();
                context.moveTo(118, 45.5);
                context.lineTo(103.5, 40.5);
                context.lineTo(103.5, 49.5);
                context.lineTo(118, 45.5);
                context.stroke();
                context.closePath();
                context.fill();
            
                // if maxData is known - stroke value
                context.strokeStyle = "black";
                context.fillStyle = "black";
                context.lineWidth = 1;
                if (_maxDelta) {
                    context.fillText("X", 9, 49);
                    context.fillText("X", 122, 49);
                    context.beginPath();
                    context.moveTo(134, 44.5);
                    context.lineTo(141, 44.5);
                    context.stroke();
                    context.closePath();
                    context.beginPath();
                    context.moveTo(134, 48.5);
                    context.lineTo(141, 48.5);
                    context.stroke();
                    context.closePath();
                    context.beginPath();
                    context.moveTo(137.5, 41);
                    context.lineTo(137.5, 48);
                    context.stroke();
                    context.closePath();
                    context.fillText("", round(_maxDelta, { min: 0, max: _maxDelta }, false), 145, 49);
                }
            }
            renderPalette();
            // add text 'uncertainty'
            $("<div style='margin-left: 30px; margin-top: -10px'>uncertainty</div>").appendTo(_host);
        }

        var defaultPalette = InteractiveDataDisplay.ColorPalette.parse("black,#e5e5e5");

        export function BuildPalette(plot: Plot.MarkersDefinition) {
            var d3Palette = plot.colorPalette ? InteractiveDataDisplay.ColorPalette.parse(plot.colorPalette) : defaultPalette;
            if (d3Palette.isNormalized) {
                var colorRange = { min: GetMin(plot.color), max: GetMax(plot.color) };
                if (colorRange.min === colorRange.max) 
                    d3Palette = d3Palette.absolute(colorRange.min - 0.5, colorRange.max + 0.5);
                else 
                    d3Palette = d3Palette.absolute(colorRange.min, colorRange.max);
            }
            return d3Palette;
        }

        export function BuildPaletteForUncertain(plot: Plot.MarkersDefinition) {
            var d3Palette = plot.colorPalette ? InteractiveDataDisplay.ColorPalette.parse(plot.colorPalette) : defaultPalette;
            if (d3Palette.isNormalized) {
                var color = <Plot.Quantiles>plot.color;
                var colorRange = {
                    min: GetMin(color.lower95),
                    max: GetMax(color.upper95)
                };
                if (colorRange.min > colorRange.max) {
                    d3Palette = d3Palette;
                }
                else if (colorRange.min === colorRange.max) {
                    d3Palette = d3Palette.absolute(colorRange.min - 0.5, colorRange.max + 0.5);
                } else {
                    d3Palette = d3Palette.absolute(colorRange.min, colorRange.max);
                }
            }
            return d3Palette;
        }

        export function BuildSizePalette(plot: Plot.MarkersDefinition) {
            var sizeRange = plot.sizeRange ? plot.sizeRange : { min: 5, max: 50 };
            var valueRange = { min: GetMin(plot.size), max: GetMax(plot.size) };
            return new InteractiveDataDisplay.SizePalette(false, sizeRange, valueRange);
        }
    }

    PlotRegistry["markers"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var markerGraph = chart.markers(plotDefinition.displayName);
            markerGraph.getTooltip = function (xd, yd, xp, yp) {
                if (markerGraph.ttData === undefined || markerGraph.ttFormatters === undefined)
                    return undefined;

                var resultMarkers = markerGraph.findToolTipMarkers(xd, yd, xp, yp);
                var buildTooltip = function (markerInfo) {

                    var index = markerInfo.index;

                    var content = undefined;
                    for (var prop in markerGraph.ttData) {
                        if (content) {
                            if (markerGraph.ttData[prop] != undefined && markerGraph.ttData[prop] instanceof Array)
                                if (markerGraph.ttData[prop].Column != undefined)
                                    content += "<br/>" + markerGraph.ttData[prop].Column + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                                else
                                    content += "<br/>" + prop + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                        } else {
                            if (markerGraph.ttData[prop] != undefined)
                                if (markerGraph.ttData[prop].Column != undefined)
                                    content = markerGraph.ttData[prop].Column + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                                else
                                    content = prop + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                        }
                    }
                    content += "<br/>index: " + index;
                    return "<div style='margin-left: 10px; font-size: 11pt;'>" + content + "</div>";
                };

                if (resultMarkers.length > 0) {
                    var result = $("<div></div>");
                    var thumbnail = Markers.createThumbnail(<Plot.MarkersDefinition><any>plotDefinition);
                    thumbnail.css("float", "left").css("margin-right", 3).appendTo(result);

                    var toolTip = plotDefinition.displayName != undefined ? plotDefinition.displayName : '(not specified)';
                    var ttHeader = $("<div></div>").addClass("probecard-title").text(toolTip);
                    toolTip = "";
                    for (var i = 0; i < resultMarkers.length; i++) {
                        toolTip += buildTooltip(resultMarkers[i]);
                        if (i < resultMarkers.length - 1) {
                            toolTip += "<br/>";
                        }
                    }
                    var ttContent = $("<div>" + toolTip + "</div>");
                    ttHeader.appendTo(result);
                    ttContent.appendTo(result);
                    return result;
                }
            };
            return [markerGraph];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {
                var plot = <Plot.MarkersDefinition><any>plotDefinition;
                if (!plot.shape) {
                    plot.shape = "box";
                }

                var drawArgs = {
                    x: undefined,
                    y: undefined,
                    shape: undefined,
                    u95: undefined,
                    l95: undefined,
                    u68: undefined,
                    l68: undefined,
                    y_mean: undefined,
                    color: undefined,
                    colorPalette: undefined,
                    uncertainColorPalette: undefined,
                    size: undefined,
                    sizePalette: undefined,
                    maxDelta: undefined,
                    bullEyeShape: undefined,
                    border: undefined
                };
                var toolTipData = {
                    x: undefined,
                    y: undefined,
                    median: undefined,
                    color: undefined,
                    size: undefined
                };
                var toolTipFormatters = {};
                var colorRange, sizeRange;
                drawArgs.border = plot.borderColor;
                if (plot.x == undefined && !Array.isArray(plot.y)) {
                    plot.x = [];
                    for (var i = 0; i < plot.y["median"].length; i++) plot.x.push(i);
                }
                drawArgs.x = plot.x;
                if (drawArgs.y === undefined && Array.isArray(plot.y))
                    drawArgs.y = plot.y;
                else
                    drawArgs.y = (<Plot.Quantiles>plot.y).median;

                var len = Math.min(drawArgs.x.length, drawArgs.y.length);
                if (drawArgs.y !== undefined) {
                    drawArgs.x = CutArray(drawArgs.x, len);
                    drawArgs.y = CutArray(drawArgs.y, len);
                }

                toolTipData[getTitle(plotDefinition, "x")] = drawArgs.x;

                if (plot.y !== undefined) {
                    toolTipData[getTitle(plotDefinition, "y")] = drawArgs.y;
                }
                var getDataFromPalette = function (data, d3Palette) {
                    var result = [];
                    var cl = Math.min(drawArgs.x.length, data.length);
                    for (var i = 0; i < cl; i++) {
                        var rgba = d3Palette ? d3Palette.getRgba(data[i]) : { r: 0, g: 0, b: 0, a: 0.2 };
                        result.push("rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")");
                    }
                    return result;
                }

                if (!Array.isArray(plot.y)) {
                    //Y is uncertainty, using box&whisker
                    switch (plot.shape) {
                        case "boxnowhisker":
                            drawArgs.shape = Markers.BoxNoWhisker;
                            break;
                        case "boxwhisker":
                            drawArgs.shape = Markers.BoxWhisker;
                            break;
                        case "whisker":
                            drawArgs.shape = Markers.Whisker;
                            break;
                        default:
                            drawArgs.shape = Markers.BoxWhisker;
                            break;
                    }
                    var y = <Plot.Quantiles>plot.y;
                    drawArgs.u95 = y.upper95;
                    drawArgs.l95 = y.lower95;
                    drawArgs.u68 = y.upper68;
                    drawArgs.l68 = y.lower68;
                    drawArgs.y_mean = y.median;

                    toolTipData[getTitle(plotDefinition, "y") + " median"] = y.median;
                    toolTipData["upper 68%"] = y.upper68;
                    toolTipData["lower 68%"] = y.lower68;
                    toolTipData["upper 95%"] = y.upper95;
                    toolTipData["lower 95%"] = y.lower95;
                } else {
                    if (plot.shape === "boxnowhisker" || plot.shape === "boxwhisker" || plot.shape === "whisker")
                        plot.shape = "box";
                }

                if (typeof plot.color === "undefined") {
                    if (drawArgs.shape === undefined) drawArgs.shape = plot.shape;
                    if (Array.isArray(plot.y)) drawArgs.color = plot.color = "#1F497D";
                }
                else if (typeof plot.color === "string") {
                    if (drawArgs.shape === undefined) drawArgs.shape = plot.shape;
                    drawArgs.color = <string>plot.color;

                }
                else if (Array.isArray(plot.color)) {
                    if (drawArgs.shape === undefined) drawArgs.shape = plot.shape;
                    toolTipData[getTitle(plotDefinition, "color")] = plot.color;
                    drawArgs.color = plot.color;
                    drawArgs.colorPalette = Markers.BuildPalette(plot);
                } else {
                    //Color is uncertainty data, using bull eye markers
                    drawArgs.shape = Markers.BullEye;
                    drawArgs.bullEyeShape = plot.shape;

                    var color = <Plot.Quantiles>plot.color;

                    drawArgs.u95 = color.upper95;
                    drawArgs.l95 = color.lower95;
                    drawArgs.uncertainColorPalette = Markers.BuildPaletteForUncertain(plot);

                    if (plot.titles != undefined && plot.titles.color != undefined)
                        toolTipData[getTitle(plotDefinition, "color") + " median"] = color.median;
                    toolTipData["upper (95%)"] = color.upper95;
                    toolTipData["lower (95%)"] = color.lower95;
                }

                if (plot.size && typeof plot.size["median"] !== "undefined") {
                    var size = <Plot.Quantiles>plot.size;
                    //Size is uncertainty data, using petalled markers
                    drawArgs.shape = Markers.Petal;
                    drawArgs.u95 = CutArray(size.upper95, len);
                    drawArgs.l95 = CutArray(size.lower95, len);

                    if (plot.titles != undefined && plot.titles.size != undefined)
                        toolTipData[getTitle(plotDefinition, "size") + " median"] = size.median;
                    else toolTipData["size median"] = size.median;
                    toolTipData["upper 95%"] = size.upper95;
                    toolTipData["lower 95%"] = size.lower95;

                    var i = 0;
                    while (isNaN(size.upper95[i]) || isNaN(size.lower95[i])) i++;
                    var maxDelta = size.upper95[i] - size.lower95[i];
                    i++;
                    for (; i < size.upper95.length; i++)
                        if (!isNaN(size.upper95[i]) && !isNaN(size.lower95[i]))
                            maxDelta = Math.max(maxDelta, size.upper95[i] - size.lower95[i]);
                    drawArgs.maxDelta = maxDelta;

                    sizeRange = { from: 0, to: maxDelta };
                    drawArgs.size = 15;
                }
                else if (Array.isArray(plot.size)) {
                    toolTipData[getTitle(plotDefinition, "size")] = plot.size;
                    drawArgs.sizePalette = Markers.BuildSizePalette(plot);
                    drawArgs.size = <number[]>plot.size;
                }
                else if (plot.size) {
                    drawArgs.size = <number>plot.size;
                }
                else {
                    drawArgs.size = plot.size = 8;
                }

                plots[0].draw(drawArgs);

                var getRange = function (arr) {
                    return { min: GetMin(arr), max: GetMax(arr) }
                }

                for (var prop in toolTipData) {
                    toolTipFormatters[prop] = getFormatter(toolTipData[prop], getRange);
                }

                plots[0].ttData = toolTipData;
                plots[0].ttFormatters = toolTipFormatters;

                var res = {
                    x: { min: GetMin(drawArgs.x), max: GetMax(drawArgs.x) },
                    y: { min: GetMin(drawArgs.y), max: GetMax(drawArgs.y) },
                    color: undefined,
                    size: undefined
                };
                if (colorRange)
                    res.color = colorRange;
                if (sizeRange)
                    res.size = sizeRange;
                return res;
            
        },

        createPlotCardContent: function (plotInfo) {
            var plot = <Plot.MarkersDefinition><any>plotInfo;
            var content = Markers.createThumbnail(plot);

            // Append marker coordinates. 
            var coordsDiv = $("<div></div>").width(150).addClass("dsv-plotcard-title").appendTo(content);
            coordsDiv.addClass("dsv-plotcard-resolved").text(plotInfo.displayName);
            $("<br/>").appendTo(content);

            var result = {
                content: content,
                colorPaletteViewer: undefined,
                colorPaletteDiv: undefined,
                sizePaletteViewer: undefined,
                sizePaletteDiv: undefined,
                uncertaintySizePalette: undefined
            };


            //// Add color palette
            if (plot.colorPalette || Array.isArray(plot.color) || typeof (plot.size["median"]) != "undefined") {
                $("<div></div>").text(getTitle(plotInfo, "color")).addClass("dsv-plotcard-title").width(180).css("margin-top", "5px").appendTo(content);
                var cpalette = $("<div class='dsv-plotcard-palette'></div>").appendTo(content);
                var paletteViewer = new InteractiveDataDisplay.ColorPaletteViewer(
                    cpalette,
                    null,
                    {
                        axisVisible: true,
                        width: 180,
                        height: 10
                    });
                paletteViewer.palette = Array.isArray(plot.color) ? Markers.BuildPalette(plot) : Markers.BuildPaletteForUncertain(plot);
                result.colorPaletteViewer = paletteViewer;
                result.colorPaletteDiv = cpalette;
            }

            //// Add size palette
            if (plot.sizeRange || Array.isArray(plot.size) || typeof (plot.size["median"]) != "undefined") {
                $("<div></div>").text(getTitle(plotInfo, "size")).addClass("dsv-plotcard-title").width(180).appendTo(content);
                if (plot.size && typeof(plot.size["median"]) != "undefined") {
                    var spalette = $("<div class='dsv-plotcard-regular' style='height:65px'></div>").appendTo(content);
                    var paletteViewer = new Markers.UncertaintySizePaletteViewer(spalette);
                    result.uncertaintySizePalette = paletteViewer;
                    result.sizePaletteDiv = spalette;
                }
                else {
                    var spalette = $("<div class='dsv-plotcard-palette'></div>").appendTo(content);
                    var paletteViewer = new InteractiveDataDisplay.SizePaletteViewer(
                        spalette,
                        null,
                        {
                            axisVisible: true,
                            width: 180,
                            height: 30
                        });                    
                    paletteViewer.palette = Markers.BuildSizePalette(plot);
                    result.sizePaletteViewer = paletteViewer;
                    result.sizePaletteDiv = spalette;
                }
            }
            return result;
        }
    }
}