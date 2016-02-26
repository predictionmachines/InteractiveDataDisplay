
var drawShape = function (context, shape, x, y, width, height, scale, fill, stroke) {
    var w = width;
    var h = height;
    var useStroke = stroke !== "none";
    context.strokeStyle = stroke !== undefined ? stroke : "black";
    context.fillStyle = fill !== undefined ? fill : "black";

    var x1 = x;
    var y1 = y;

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
};
var RgbaToString = function (rgba) {
    return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
};
InteractiveDataDisplay.Petal = {
    draw: function (marker, plotRect, screenSize, transform, context) {
        var x0 = transform.dataToScreenX(marker.x);
        var y0 = transform.dataToScreenY(marker.y);
        if (x0 > screenSize.width || x0 < 0) return;
        if (y0 > screenSize.height || y0 < 0) return;

        var maxSize = marker.size / 2;
        var minSize = maxSize * (1 - (marker.u95 - marker.l95) / marker.maxDelta);
        if (marker.maxDelta <= 0) minSize = NaN;

        InteractiveDataDisplay.Petal.drawSample(context, x0, y0, minSize, maxSize, marker.color);
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
    },
    getLegendItem: function (drawData) {
        var canvas = $("<canvas style='margin-right: 10px; display: inline-block'></canvas>");
        var size = 21;
        canvas[0].width = canvas[0].height = size + 2;
        var halfSize = size / 2;
        var x1 = halfSize + 0.5;
        var y1 = halfSize + 0.5;
        var context = canvas[0].getContext("2d");
        var sampleColor = "gray";
        var sampleBorderColor = typeof drawData.border == "string" ? drawData.border : "gray"; 
        
        InteractiveDataDisplay.Petal.drawSample(context, x1, y1, halfSize / 2, halfSize, sampleColor);
        
        return canvas;
    }
    
};

InteractiveDataDisplay.BullEye = {
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
      },
      getLegendItem: function (drawData) {
          var canvas = $("<canvas style='margin-right: 10px; display: inline-block'></canvas>");
          var size = 21;
          canvas[0].width = canvas[0].height = size + 2;
          var halfSize = size / 2;
          var x1 = halfSize + 0.5;
          var y1 = halfSize + 0.5;
          var context = canvas[0].getContext("2d");
          var sampleColor = typeof drawData.color == "string" ? drawData.color : "gray";
          var sampleBorderColor = typeof drawData.border == "string" ? drawData.border : "gray";

          drawShape(context, drawData.bullEyeShape, x1, y1, size, size, 1.0, sampleColor, sampleBorderColor);

          return canvas;
      }
};

InteractiveDataDisplay.BoxWhisker = {
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
    },
    getLegendItem: function (drawData) {
        var canvas = $("<canvas style='margin-right: 10px; display: inline-block'></canvas>");
        var size = 21;
        canvas[0].width = canvas[0].height = size + 2;
        var halfSize = size / 2;
        var x1 = halfSize + 0.5;
        var y1 = halfSize + 0.5;
        var context = canvas[0].getContext("2d");
        var sampleColor = typeof drawData.color == "string" ? drawData.color : "gray";
        var sampleBorderColor = typeof drawData.border == "string" ? drawData.border : "gray";

        var shp = drawData.shape;
        if (drawData.u95 && drawData.l95 && shp !== "boxwhisker" && shp !== "boxnowhisker" && shp !== "whisker")
            shp = "boxwhisker";
        drawShape(context, shp, x1, y1, size, size, 1.0, sampleColor, sampleBorderColor);

        return canvas;
    }
};

InteractiveDataDisplay.BoxNoWhisker = {
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
    },
    getLegendItem: function (drawData) {
        var canvas = $("<canvas style='margin-right: 10px; display: inline-block'></canvas>");
        var size = 21;
        canvas[0].width = canvas[0].height = size + 2;
        var halfSize = size / 2;
        var x1 = halfSize + 0.5;
        var y1 = halfSize + 0.5;
        var context = canvas[0].getContext("2d");
        var sampleColor = typeof drawData.color == "string" ? drawData.color : "gray";
        var sampleBorderColor = typeof drawData.border == "string" ? drawData.border : "gray";

        var shp = drawData.shape;
        if (drawData.u95 && drawData.l95 && shp !== "boxwhisker" && shp !== "boxnowhisker" && shp !== "whisker")
            shp = "boxwhisker";
        drawShape(context, shp, x1, y1, size, size, 1.0, sampleColor, sampleBorderColor);

        return canvas;
    }
};

InteractiveDataDisplay.Whisker = {
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
    },
    getLegendItem: function (drawData) {
        var canvas = $("<canvas style='margin-right: 10px; display: inline-block'></canvas>");
        var size = 21;
        canvas[0].width = canvas[0].height = size + 2;
        var halfSize = size / 2;
        var x1 = halfSize + 0.5;
        var y1 = halfSize + 0.5;
        var context = canvas[0].getContext("2d");
        var sampleColor = typeof drawData.color == "string" ? drawData.color : "gray";
        var sampleBorderColor = typeof drawData.border == "string" ? drawData.border : "gray";

        var shp = drawData.shape;
        if (drawData.u95 && drawData.l95 && shp !== "boxwhisker" && shp !== "boxnowhisker" && shp !== "whisker")
            shp = "boxwhisker";
        drawShape(context, shp, x1, y1, size, size, 1.0, sampleColor, sampleBorderColor);

        return canvas;
    }
};