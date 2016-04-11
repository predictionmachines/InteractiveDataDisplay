InteractiveDataDisplay.Petal = {
    prepare: function (data) {
        if (!data.maxDelta) {
            var i = 0;
            while (isNaN(data.u95[i]) || isNaN(data.l95[i])) i++;
            var maxDelta = data.u95[i] - data.l95[i];
            i++;
            for (; i < data.u95.length; i++)
                if (!isNaN(data.u95[i]) && !isNaN(data.l95[i]))
                    maxDelta = Math.max(maxDelta, data.u95[i] - data.l95[i]);
            data.maxDelta = maxDelta;
        }
        // y
        if (data.y == undefined || data.y == null) throw "The mandatory property 'y' is undefined or null";
        if (!InteractiveDataDisplay.Utils.isArray(data.y)) throw "The property 'y' must be an array of numbers";
        var n = data.y.length;

        var mask = new Int8Array(n);
        InteractiveDataDisplay.Utils.maskNaN(mask, data.y);

        // x
        if (data.x == undefined)
            data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
        else if (!InteractiveDataDisplay.Utils.isArray(data.x)) throw "The property 'x' must be an array of numbers";
        else if (data.x.length != n) throw "Length of the array which is a value of the property 'x' differs from lenght of 'y'"
        else InteractiveDataDisplay.Utils.maskNaN(mask, data.x);

        // border
        if (data.border == undefined || data.border == "none")
            data.border = null; // no border

        // colors        
        if (data.color == undefined) data.color = InteractiveDataDisplay.Markers.defaults.color;
        if (InteractiveDataDisplay.Utils.isArray(data.color)) {
            if (data.color.length != n) throw "Length of the array 'color' is different than length of the array 'y'"
            if (n > 0 && typeof (data.color[0]) === "number") { // color is a data series                 
                var palette = data.colorPalette;
                if (palette == undefined) palette = InteractiveDataDisplay.Markers.defaults.colorPalette;
                if (typeof palette == 'string') palette = new InteractiveDataDisplay.ColorPalette.parse(palette);
                if (palette != undefined && palette.isNormalized) {
                    var r = InteractiveDataDisplay.Utils.getMinMax(data.color);
                    r = InteractiveDataDisplay.Utils.makeNonEqual(r);
                    data.colorPalette = palette = palette.absolute(r.min, r.max);
                }
                var colors = new Array(n);
                for (var i = 0; i < n; i++) {
                    var color = data.color[i];
                    if (color != color) // NaN
                        mask[i] = 1;
                    else {
                        var rgba = palette.getRgba(color);                        
                        colors[i] = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
                    }
                }
                data.color = colors;
            }
            data.individualColors = true;
        } else {
            data.individualColors = false;
        }

        // sizes    
        var sizes = new Array(n);
        if (data.size == undefined) data.size = InteractiveDataDisplay.Markers.defaults.size;
        if (InteractiveDataDisplay.Utils.isArray(data.l95) && InteractiveDataDisplay.Utils.isArray(data.u95)) {
            if (data.l95.length != n && data.u95.length != n) throw "Length of the array 'size' is different than length of the array 'y'";
        }
        for (var i = 0; i < n; i++) sizes[i] = data.size;
            data.sizeMax = data.size;
        data.size = sizes;

        // Filtering out missing values
        var m = 0;
        for (var i = 0; i < n; i++) if (mask[i] === 1) m++;
        if (m > 0) { // there are missing values
            m = n - m;
            data.x = InteractiveDataDisplay.Utils.applyMask(mask, data.x, m);
            data.y = InteractiveDataDisplay.Utils.applyMask(mask, data.y, m);
            data.size = InteractiveDataDisplay.Utils.applyMask(mask, data.size, m);
            if (data.individualColors)
                data.color = InteractiveDataDisplay.Utils.applyMask(mask, data.color, m);
            var indices = Array(m);
            for (var i = 0, j = 0; i < n; i++) if (mask[i] === 0) indices[j++] = i;
            data.indices = indices;
        } else {
            data.indices = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
    },
    preRender: function (data, plotRect, screenSize, dt, context) {
        if (!data.individualColors)
            context.fillStyle = data.color;
        if (data.border != null)
            context.strokeStyle = data.border;
        return data;
    },
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

        context.strokeStyle = "gray";
        context.beginPath();
        context.arc(x, y, 1, 0, Math.PI * 2);
        context.stroke();
        context.closePath();
    },
    hitTest: function (marker, transform, ps, pd) {
        var x = transform.dataToScreenX(marker.x);
        var y = transform.dataToScreenY(marker.y);
        var r = marker.size / 2;
        if (ps.x < x - r || ps.x > x + r) return false;
        if (ps.y < y - r || ps.y > y + r) return false;
        return true;
    },
    getLegend: function (data, getTitle, legendDiv) { // todo: should be refactored            
        var itemDiv = legendDiv.content;
        var fontSize = 14;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            fontSize = parseFloat(document.defaultView.getComputedStyle(itemDiv[0], null).getPropertyValue("font-size"));
        }
        if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

        var canvas = legendDiv.thumbnail;
        var canvasIsVisible = true;
        var maxSize = fontSize * 1.5;
        var x1 = maxSize / 2 + 1;
        var y1 = maxSize / 2 + 1;
        canvas[0].width = canvas[0].height = maxSize + 2;
        var canvasStyle = canvas[0].style;
        var context = canvas.get(0).getContext("2d");
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);

        var color, border, drawBorder;
        var colorDiv, colorDivStyle, colorControl;
        var colorIsVisible = 0;

        var size, halfSize;
        var sizeDiv, sizeDivStyle, sizeControl;
        var sizeIsVisible = 0;

        var sizeTitle;
        var refreshSize = function () {
            size = maxSize;
            var szTitleText = getTitle("size");
            if (sizeIsVisible == 0) {
                sizeDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                sizeTitle = $("<div class='idd-legend-item-property'></div>").text(szTitleText).appendTo(sizeDiv);
                sizeDivStyle = sizeDiv[0].style;
                var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(sizeDiv);
                sizeControl = new InteractiveDataDisplay.UncertaintySizePaletteViewer(paletteDiv);
                sizeIsVisible = 2;
            } else {
                sizeTitle.text(szTitleText);
            }
            halfSize = size / 2;
        };

        var colorTitle;
        var refreshColor = function () {
            drawBorder = false;
            if (data.individualColors && data.colorPalette) {
                var clrTitleText = getTitle("color");
                if (colorIsVisible == 0) {
                    colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                    colorDivStyle = colorDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(colorDiv);
                    colorControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv);
                    colorIsVisible = 2;
                } else {
                    colorTitle.text(clrTitleText);
                }
                colorControl.palette = data.colorPalette;
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
            if (data.individualColors) {
                border = "#000000";
                color = "#ffffff";
                drawBorder = true;
            }
            else {
                color = data.color;
                border = color;
                if (data.border != null) {
                    drawBorder = true;
                    border = data.border;
                }
            }
        };

        var renderShape = function () {
            var sampleColor = "gray";
            var sampleBorderColor = "gray";

            InteractiveDataDisplay.Petal.drawSample(context, x1, y1, halfSize / 2, halfSize, sampleColor);
        };

        refreshColor();
        refreshSize();
        renderShape();
    }
};
InteractiveDataDisplay.BullEye = {
    prepare: function (data) {
        data.bullEyeShape = data.bullEyeShape ? data.bullEyeShape.toLowerCase() : "circle";
        // y
        if (data.y == undefined || data.y == null) throw "The mandatory property 'y' is undefined or null";
        if (!InteractiveDataDisplay.Utils.isArray(data.y)) throw "The property 'y' must be an array of numbers";
        var n = data.y.length;

        var mask = new Int8Array(n);
        InteractiveDataDisplay.Utils.maskNaN(mask, data.y);

        // x
        if (data.x == undefined)
            data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
        else if (!InteractiveDataDisplay.Utils.isArray(data.x)) throw "The property 'x' must be an array of numbers";
        else if (data.x.length != n) throw "Length of the array which is a value of the property 'x' differs from lenght of 'y'"
        else InteractiveDataDisplay.Utils.maskNaN(mask, data.x);

        // border
        if (data.border == undefined || data.border == "none")
            data.border = null; // no border

        // colors        
        if (InteractiveDataDisplay.Utils.isArray(data.l95) && InteractiveDataDisplay.Utils.isArray(data.u95)) {
            if (data.l95.length != n && data.u95.length != n) throw "Length of the array 'color' is different than length of the array 'y'"
            if (n > 0 && typeof (data.l95[0]) === "number" && typeof (data.u95[0]) === "number") { // color is a data series                 
                var palette = data.colorPalette;
                if (palette == undefined) palette = InteractiveDataDisplay.Markers.defaults.colorPalette;
                if (typeof palette == 'string') palette = new InteractiveDataDisplay.ColorPalette.parse(palette);
                if (palette != undefined && palette.isNormalized) {
                    var r = { min: InteractiveDataDisplay.Utils.getMin(data.l95), max: InteractiveDataDisplay.Utils.getMax(data.u95) };
                    r = InteractiveDataDisplay.Utils.makeNonEqual(r);
                    data.colorPalette = palette = palette.absolute(r.min, r.max);
                }
                var colors_u95 = [];
                var colors_l95 = [];
                for (var i = 0; i < n; i++){
                    var color_u95 = data.u95[i];
                    var color_l95 = data.l95[i];
                    if (color_u95 != color_u95 || color_l95 != color_l95)
                        mask[i] = 1;
                    else {
                        var u95rgba = palette.getRgba(color_u95);
                        var l95rgba = palette.getRgba(color_l95);
                        colors_u95[i] = "rgba(" + u95rgba.r + "," + u95rgba.g + "," + u95rgba.b + "," + u95rgba.a + ")";
                        colors_l95[i] = "rgba(" + l95rgba.r + "," + l95rgba.g + "," + l95rgba.b + "," + l95rgba.a + ")";
                    }
                }
                data.u95 = colors_u95;
                data.l95 = colors_l95;
            }
            data.individualColors = true;
        } else {
            data.individualColors = false;
        }

        // sizes    
        var sizes = new Array(n);
        if (data.size == undefined) data.size = InteractiveDataDisplay.Markers.defaults.size;
        if (InteractiveDataDisplay.Utils.isArray(data.size)) {
            if (data.size.length != n) throw "Length of the array 'size' is different than length of the array 'y'"
            if (data.sizePalette != undefined) { // 'size' is a data series 
                var palette = data.sizePalette;
                if (palette.isNormalized) {
                    var r = InteractiveDataDisplay.Utils.getMinMax(data.size);
                    r = InteractiveDataDisplay.Utils.makeNonEqual(r);
                    data.sizePalette = palette = new InteractiveDataDisplay.SizePalette(false, palette.sizeRange, r);
                }
                for (var i = 0; i < n; i++) {
                    var size = data.size[i];
                    if (size != size) // NaN
                        mask[i] = 1;
                    else
                        sizes[i] = palette.getSize(size)
                }
            } else { // 'size' contains values in pixels
                data.sizeMax = InteractiveDataDisplay.Utils.getMax(data.size);
            }
        } else { // sizes is a constant
            for (var i = 0; i < n; i++) sizes[i] = data.size;
            data.sizeMax = data.size;
        }
        data.size = sizes;

        // Filtering out missing values
        var m = 0;
        for (var i = 0; i < n; i++) if (mask[i] === 1) m++;
        if (m > 0) { // there are missing values
            m = n - m;
            data.x = InteractiveDataDisplay.Utils.applyMask(mask, data.x, m);
            data.y = InteractiveDataDisplay.Utils.applyMask(mask, data.y, m);
            data.size = InteractiveDataDisplay.Utils.applyMask(mask, data.size, m);
            if (data.individualColors) {
                data.u95 = InteractiveDataDisplay.Utils.applyMask(mask, data.u95, m);
                data.l95 = InteractiveDataDisplay.Utils.applyMask(mask, data.l95, m);
            }
            var indices = Array(m);
            for (var i = 0, j = 0; i < n; i++) if (mask[i] === 0) indices[j++] = i;
            data.indices = indices;
        } else {
            data.indices = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
    },
    preRender: function (data, plotRect, screenSize, dt, context) {
        if(data.border != null)
            context.strokeStyle = data.border;
        return data;
    },
    draw: function (marker, plotRect, screenSize, transform, context) {

          var mean = marker.y_mean;
          var u95 = marker.u95;
          var l95 = marker.l95;

          var msize = marker.size;
          var shift = msize / 2;
          var x = transform.dataToScreenX(marker.x);
          var y = transform.dataToScreenY(marker.y);

          if (x + shift < 0 || x - shift > screenSize.width) return;
          if (y + shift < 0 || y - shift > screenSize.height) return;
          InteractiveDataDisplay.BullEye.drawBullEye(context, marker.bullEyeShape, x, y, msize, msize, u95);
          InteractiveDataDisplay.BullEye.drawBullEye(context, marker.bullEyeShape, x, y, shift, shift, l95);
    },
    drawBullEye: function(context, shape, x, y, width, height, fill, stroke) {
        var w = width;
        var h = height;
        var useStroke = stroke !== "none";
        context.strokeStyle = stroke !== undefined ? stroke : "black";
        context.fillStyle = fill !== undefined ? fill : "black";

        var x1 = x;
        var y1 = y;

        var size = Math.min(w, h);
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
        }
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
    getLegend: function (data, getTitle, legendDiv) { // todo: should be refactored            
          var itemDiv = legendDiv.content;
          var fontSize = 14;
          if (document.defaultView && document.defaultView.getComputedStyle) {
              fontSize = parseFloat(document.defaultView.getComputedStyle(itemDiv[0], null).getPropertyValue("font-size"));
          }
          if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

          var canvas = legendDiv.thumbnail;
          var canvasIsVisible = true;
          var maxSize = fontSize * 1.5;
          var x1 = maxSize / 2 + 1;
          var y1 = maxSize / 2 + 1;
          canvas[0].width = canvas[0].height = maxSize + 2;
          var canvasStyle = canvas[0].style;
          var context = canvas.get(0).getContext("2d");
          context.clearRect(0, 0, canvas[0].width, canvas[0].height);

          var color, border, drawBorder;
          var colorDiv, colorDivStyle, colorControl;
          var colorIsVisible = 0;

          var size, halfSize;
          var sizeDiv, sizeDivStyle, sizeControl;
          var sizeIsVisible = 0;

          var sizeTitle;
          var refreshSize = function () {
              size = maxSize;
              if (data.sizePalette) {
                  var szTitleText = getTitle("size");
                  if (sizeIsVisible == 0) {
                      sizeDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                      sizeTitle = $("<div class='idd-legend-item-property'></div>").text(szTitleText).appendTo(sizeDiv);
                      sizeDivStyle = sizeDiv[0].style;
                      var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(sizeDiv);
                      sizeControl = new InteractiveDataDisplay.SizePaletteViewer(paletteDiv);
                      sizeIsVisible = 2;
                  } else {
                      sizeTitle.text(szTitleText);
                  }
                  sizeControl.palette = data.sizePalette;
              }
              halfSize = size / 2;
          };

          var colorTitle;
          var refreshColor = function () {
              drawBorder = false;
              if (data.individualColors && data.colorPalette) {
                  var clrTitleText = getTitle("color");
                  if (colorIsVisible == 0) {
                      colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                      colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                      colorDivStyle = colorDiv[0].style;
                      var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(colorDiv);
                      colorControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv);
                      colorIsVisible = 2;
                  } else {
                      colorTitle.text(clrTitleText);
                  }
                  colorControl.palette = data.colorPalette;
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
              if (data.individualColors) {
                  border = "#000000";
                  color = "#ffffff";
                  drawBorder = true;
              }
              else {
                  color = data.color;
                  border = color;
                  if (data.border != null) {
                      drawBorder = true;
                      border = data.border;
                  }
              }
          };

          var renderShape = function () {
              var sampleColor = "gray";
              var sampleBorderColor = "gray";

              InteractiveDataDisplay.BullEye.drawBullEye(context, data.bullEyeShape, x1, y1, size, size, sampleColor, sampleBorderColor);
          };

          refreshColor();
          refreshSize();
          renderShape();
      }
      
};

InteractiveDataDisplay.BoxWhisker = {
    prepare: function (data) {
        // y
        if (data.y == undefined || data.y == null) throw "The mandatory property 'y' is undefined or null";
        if (!InteractiveDataDisplay.Utils.isArray(data.y)) throw "The property 'y' must be an array of numbers";
        var n = data.y.length;

        var mask = new Int8Array(n);
        InteractiveDataDisplay.Utils.maskNaN(mask, data.y);
        data.y_mean = data.y;

        // x
        if (data.x == undefined)
            data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
        else if (!InteractiveDataDisplay.Utils.isArray(data.x)) throw "The property 'x' must be an array of numbers";
        else if (data.x.length != n) throw "Length of the array which is a value of the property 'x' differs from lenght of 'y'"
        else InteractiveDataDisplay.Utils.maskNaN(mask, data.x);

        // border
        if (data.border == undefined || data.border == "none")
            data.border = null; // no border

        // colors        
        if (data.color == undefined) data.color = InteractiveDataDisplay.Markers.defaults.color;

        // sizes    
        var sizes = new Array(n);
        if (data.size == undefined) data.size = InteractiveDataDisplay.Markers.defaults.size;
        if (InteractiveDataDisplay.Utils.isArray(data.l95) && InteractiveDataDisplay.Utils.isArray(data.u95)) {
            if (data.l95.length != n && data.u95.length != n) throw "Length of the array 'size' is different than length of the array 'y'";
        }
        for (var i = 0; i < n; i++) sizes[i] = data.size;
        data.sizeMax = data.size;
        data.size = sizes;

        // Filtering out missing values
        var m = 0;
        for (var i = 0; i < n; i++) if (mask[i] === 1) m++;
        if (m > 0) { // there are missing values
            m = n - m;
            data.x = InteractiveDataDisplay.Utils.applyMask(mask, data.x, m);
            data.y = InteractiveDataDisplay.Utils.applyMask(mask, data.y, m);
            data.size = InteractiveDataDisplay.Utils.applyMask(mask, data.size, m);
            var indices = Array(m);
            for (var i = 0, j = 0; i < n; i++) if (mask[i] === 0) indices[j++] = i;
            data.indices = indices;
        } else {
            data.indices = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
    },
    preRender: function (data, plotRect, screenSize, dt, context) {
        context.fillStyle = data.color;
        if (data.border != null)
            context.strokeStyle = data.border;
        return data;
    },
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
    getLegend: function (data, getTitle, legendDiv) { // todo: should be refactored            
        var itemDiv = legendDiv.content;
        var fontSize = 14;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            fontSize = parseFloat(document.defaultView.getComputedStyle(itemDiv[0], null).getPropertyValue("font-size"));
        }
        if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

        var canvas = legendDiv.thumbnail;
        var canvasIsVisible = true;
        var maxSize = fontSize * 1.5;
        var x1 = maxSize / 2 + 1;
        var y1 = maxSize / 2 + 1;
        canvas[0].width = canvas[0].height = maxSize + 2;
        var canvasStyle = canvas[0].style;
        var context = canvas.get(0).getContext("2d");
        var itemIsVisible = 0;

        var color, border, drawBorder;
        var colorDiv, colorDivStyle, colorControl;
        var colorIsVisible = 0;

        var size, halfSize;
        var sizeDiv, sizeDivStyle, sizeControl;
        var sizeIsVisible = 0;

        var sizeTitle;
        var refreshSize = function () {
            size = maxSize;
            if (data.sizePalette) {
                var szTitleText = getTitle("size");
                if (sizeIsVisible == 0) {
                    sizeDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    sizeTitle = $("<div class='idd-legend-item-property'></div>").text(szTitleText).appendTo(sizeDiv);
                    sizeDivStyle = sizeDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(sizeDiv);
                    sizeControl = new InteractiveDataDisplay.SizePaletteViewer(paletteDiv);
                    sizeIsVisible = 2;
                } else {
                    sizeTitle.text(szTitleText);
                }
                sizeControl.palette = data.sizePalette;
            }
            halfSize = size / 2;
        };

        var colorTitle;
        var refreshColor = function () {
            drawBorder = false;
            if (data.individualColors && data.colorPalette) {
                var clrTitleText = getTitle("color");
                if (colorIsVisible == 0) {
                    colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                    colorDivStyle = colorDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(colorDiv);
                    colorControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv);
                    colorIsVisible = 2;
                } else {
                    colorTitle.text(clrTitleText);
                }
                colorControl.palette = data.colorPalette;
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
            if (data.individualColors) {
                border = "#000000";
                color = "#ffffff";
                drawBorder = true;
            }
            else {
                color = data.color;
                border = color;
                if (data.border != null) {
                    drawBorder = true;
                    border = data.border;
                }
            }
        };

        var renderShape = function () {
            var sampleColor = typeof data.color == "string" ? data.color : "gray";
            var sampleBorderColor = typeof data.border == "string" ? data.border : "gray";
            var useStroke = sampleBorderColor !== "none";
            context.strokeStyle = sampleBorderColor !== undefined ? sampleBorderColor : "black";
            context.fillStyle = sampleColor !== undefined ? sampleColor : "black";

            var halfSize = 0.5 * size;
            var quarterSize = 0.5 * halfSize;

            context.clearRect(0, 0, size, size);
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
        };

        refreshColor();
        refreshSize();
        renderShape();
    }
};
InteractiveDataDisplay.BoxNoWhisker = {
    prepare: function (data) {
        // y
        if (data.y == undefined || data.y == null) throw "The mandatory property 'y' is undefined or null";
        if (!InteractiveDataDisplay.Utils.isArray(data.y)) throw "The property 'y' must be an array of numbers";
        var n = data.y.length;

        var mask = new Int8Array(n);
        InteractiveDataDisplay.Utils.maskNaN(mask, data.y);
        data.y_mean = data.y;

        // x
        if (data.x == undefined)
            data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
        else if (!InteractiveDataDisplay.Utils.isArray(data.x)) throw "The property 'x' must be an array of numbers";
        else if (data.x.length != n) throw "Length of the array which is a value of the property 'x' differs from lenght of 'y'"
        else InteractiveDataDisplay.Utils.maskNaN(mask, data.x);

        // border
        if (data.border == undefined || data.border == "none")
            data.border = null; // no border

        // colors        
        if (data.color == undefined) data.color = InteractiveDataDisplay.Markers.defaults.color;

        // sizes    
        var sizes = new Array(n);
        if (data.size == undefined) data.size = InteractiveDataDisplay.Markers.defaults.size;
        if (InteractiveDataDisplay.Utils.isArray(data.l95) && InteractiveDataDisplay.Utils.isArray(data.u95)) {
            if (data.l95.length != n && data.u95.length != n) throw "Length of the array 'size' is different than length of the array 'y'";
        }
        for (var i = 0; i < n; i++) sizes[i] = data.size;
        data.sizeMax = data.size;
        data.size = sizes;

        // Filtering out missing values
        var m = 0;
        for (var i = 0; i < n; i++) if (mask[i] === 1) m++;
        if (m > 0) { // there are missing values
            m = n - m;
            data.x = InteractiveDataDisplay.Utils.applyMask(mask, data.x, m);
            data.y = InteractiveDataDisplay.Utils.applyMask(mask, data.y, m);
            data.size = InteractiveDataDisplay.Utils.applyMask(mask, data.size, m);
            var indices = Array(m);
            for (var i = 0, j = 0; i < n; i++) if (mask[i] === 0) indices[j++] = i;
            data.indices = indices;
        } else {
            data.indices = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
    },
    preRender: function (data, plotRect, screenSize, dt, context) {
        context.fillStyle = data.color;
        if (data.border != null)
            context.strokeStyle = data.border;
        return data;
    },
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
    getLegend: function (data, getTitle, legendDiv) { // todo: should be refactored            
        var itemDiv = legendDiv.content;
        var fontSize = 14;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            fontSize = parseFloat(document.defaultView.getComputedStyle(itemDiv[0], null).getPropertyValue("font-size"));
        }
        if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

        var canvas = legendDiv.thumbnail;
        var canvasIsVisible = true;
        var maxSize = fontSize * 1.5;
        var x1 = maxSize / 2 + 1;
        var y1 = maxSize / 2 + 1;
        canvas[0].width = canvas[0].height = maxSize + 2;
        var canvasStyle = canvas[0].style;
        var context = canvas.get(0).getContext("2d");
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);

        var color, border, drawBorder;
        var colorDiv, colorDivStyle, colorControl;
        var colorIsVisible = 0;

        var size, halfSize;
        var sizeDiv, sizeDivStyle, sizeControl;
        var sizeIsVisible = 0;

        var sizeTitle;
        var refreshSize = function () {
            size = maxSize;
            if (data.sizePalette) {
                var szTitleText = getTitle("size");
                if (sizeIsVisible == 0) {
                    sizeDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    sizeTitle = $("<div class='idd-legend-item-property'></div>").text(szTitleText).appendTo(sizeDiv);
                    sizeDivStyle = sizeDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(sizeDiv);
                    sizeControl = new InteractiveDataDisplay.SizePaletteViewer(paletteDiv);
                    sizeIsVisible = 2;
                } else {
                    sizeTitle.text(szTitleText);
                }
                sizeControl.palette = data.sizePalette;
            }
            halfSize = size / 2;
        };

        var colorTitle;
        var refreshColor = function () {
            drawBorder = false;
            if (data.individualColors && data.colorPalette) {
                var clrTitleText = getTitle("color");
                if (colorIsVisible == 0) {
                    colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                    colorDivStyle = colorDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(colorDiv);
                    colorControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv);
                    colorIsVisible = 2;
                } else {
                    colorTitle.text(clrTitleText);
                }
                colorControl.palette = data.colorPalette;
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
            if (data.individualColors) {
                border = "#000000";
                color = "#ffffff";
                drawBorder = true;
            }
            else {
                color = data.color;
                border = color;
                if (data.border != null) {
                    drawBorder = true;
                    border = data.border;
                }
            }
        };

        var renderShape = function () {
            var sampleColor = typeof data.color == "string" ? data.color : "gray";
            var sampleBorderColor = typeof data.border == "string" ? data.border : "gray";

            var useStroke = sampleBorderColor !== "none";
            context.strokeStyle = sampleBorderColor !== undefined ? sampleBorderColor : "black";
            context.fillStyle = sampleColor !== undefined ? sampleColor : "black";

            var halfSize = 0.5 * size;
            var quarterSize = 0.5 * halfSize;

            context.clearRect(0, 0, size, size);
            context.fillRect(x1 - halfSize, y1 - halfSize, size, size);

            if (useStroke) context.strokeRect(x1 - halfSize, y1 - halfSize, size, size);
            context.beginPath();
            context.moveTo(x1 - halfSize, y1);
            context.lineTo(x1 + halfSize, y1);
            context.closePath();
            if (useStroke) context.stroke();
        };

        refreshColor();
        refreshSize();
        renderShape();
    }
};

InteractiveDataDisplay.Whisker = {
    prepare: function (data) {
        // y
        if (data.y == undefined || data.y == null) throw "The mandatory property 'y' is undefined or null";
        if (!InteractiveDataDisplay.Utils.isArray(data.y)) throw "The property 'y' must be an array of numbers";
        var n = data.y.length;

        var mask = new Int8Array(n);
        InteractiveDataDisplay.Utils.maskNaN(mask, data.y);
        data.y_mean = data.y;

        // x
        if (data.x == undefined)
            data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
        else if (!InteractiveDataDisplay.Utils.isArray(data.x)) throw "The property 'x' must be an array of numbers";
        else if (data.x.length != n) throw "Length of the array which is a value of the property 'x' differs from lenght of 'y'"
        else InteractiveDataDisplay.Utils.maskNaN(mask, data.x);

        // border
        if (data.border == undefined || data.border == "none")
            data.border = null; // no border

        // colors        
        if (data.color == undefined) data.color = InteractiveDataDisplay.Markers.defaults.color;

        // sizes    
        var sizes = new Array(n);
        if (data.size == undefined) data.size = InteractiveDataDisplay.Markers.defaults.size;
        if (InteractiveDataDisplay.Utils.isArray(data.l95) && InteractiveDataDisplay.Utils.isArray(data.u95)) {
            if (data.l95.length != n && data.u95.length != n) throw "Length of the array 'size' is different than length of the array 'y'";
        }
        for (var i = 0; i < n; i++) sizes[i] = data.size;
        data.sizeMax = data.size;
        data.size = sizes;

        // Filtering out missing values
        var m = 0;
        for (var i = 0; i < n; i++) if (mask[i] === 1) m++;
        if (m > 0) { // there are missing values
            m = n - m;
            data.x = InteractiveDataDisplay.Utils.applyMask(mask, data.x, m);
            data.y = InteractiveDataDisplay.Utils.applyMask(mask, data.y, m);
            data.size = InteractiveDataDisplay.Utils.applyMask(mask, data.size, m);
            var indices = Array(m);
            for (var i = 0, j = 0; i < n; i++) if (mask[i] === 0) indices[j++] = i;
            data.indices = indices;
        } else {
            data.indices = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
    },
    preRender: function (data, plotRect, screenSize, dt, context) {
        context.fillStyle = data.color;
        if (data.border != null)
            context.strokeStyle = data.border;
        return data;
    },
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
    getLegend: function (data, getTitle, legendDiv) { // todo: should be refactored            
        var itemDiv = legendDiv.content;
        var fontSize = 14;
        if (document.defaultView && document.defaultView.getComputedStyle) {
            fontSize = parseFloat(document.defaultView.getComputedStyle(itemDiv[0], null).getPropertyValue("font-size"));
        }
        if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

        var canvas = legendDiv.thumbnail;
        var canvasIsVisible = true;
        var maxSize = fontSize * 1.5;
        var x1 = maxSize / 2 + 1;
        var y1 = maxSize / 2 + 1;
        canvas[0].width = canvas[0].height = maxSize + 2;
        var canvasStyle = canvas[0].style;
        var context = canvas.get(0).getContext("2d");
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);

        var color, border, drawBorder;
        var colorDiv, colorDivStyle, colorControl;
        var colorIsVisible = 0;

        var size, halfSize;
        var sizeDiv, sizeDivStyle, sizeControl;
        var sizeIsVisible = 0;

        var sizeTitle;
        var refreshSize = function () {
            size = maxSize;
            if (data.sizePalette) {
                var szTitleText = getTitle("size");
                if (sizeIsVisible == 0) {
                    sizeDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    sizeTitle = $("<div class='idd-legend-item-property'></div>").text(szTitleText).appendTo(sizeDiv);
                    sizeDivStyle = sizeDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(sizeDiv);
                    sizeControl = new InteractiveDataDisplay.SizePaletteViewer(paletteDiv);
                    sizeIsVisible = 2;
                } else {
                    sizeTitle.text(szTitleText);
                }
                sizeControl.palette = data.sizePalette;
            }
            halfSize = size / 2;
        };

        var colorTitle;
        var refreshColor = function () {
            drawBorder = false;
            if (data.individualColors && data.colorPalette) {
                var clrTitleText = getTitle("color");
                if (colorIsVisible == 0) {
                    colorDiv = $("<div style='width: 170px; margin-top: 5px; margin-bottom: 5px'></div>").appendTo(itemDiv);
                    colorTitle = $("<div class='idd-legend-item-property'></div>").text(clrTitleText).appendTo(colorDiv);
                    colorDivStyle = colorDiv[0].style;
                    var paletteDiv = $("<div style='width: 170px;'></div>").appendTo(colorDiv);
                    colorControl = new InteractiveDataDisplay.ColorPaletteViewer(paletteDiv);
                    colorIsVisible = 2;
                } else {
                    colorTitle.text(clrTitleText);
                }
                colorControl.palette = data.colorPalette;
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
            if (data.individualColors) {
                border = "#000000";
                color = "#ffffff";
                drawBorder = true;
            }
            else {
                color = data.color;
                border = color;
                if (data.border != null) {
                    drawBorder = true;
                    border = data.border;
                }
            }
        };

        var renderShape = function () {
            var sampleColor = typeof data.color == "string" ? data.color : "gray";
            var sampleBorderColor = typeof data.border == "string" ? data.border : "gray";

            var useStroke = sampleBorderColor !== "none";
            context.strokeStyle = sampleBorderColor !== undefined ? sampleBorderColor : "black";
            context.fillStyle = sampleColor !== undefined ? sampleColor : "black";

            var halfSize = 0.5 * size;
            var quarterSize = 0.5 * halfSize;

            context.clearRect(0, 0, size, size);

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
        };

        refreshColor();
        refreshSize();
        renderShape();
        return { thumbnail: canvas, content: itemDiv };
    }
};
InteractiveDataDisplay.Markers.shapes["boxwhisker"] = InteractiveDataDisplay.BoxWhisker;
InteractiveDataDisplay.Markers.shapes["boxnowhisker"] = InteractiveDataDisplay.BoxNoWhisker;
InteractiveDataDisplay.Markers.shapes["whisker"] = InteractiveDataDisplay.Whisker;
InteractiveDataDisplay.Markers.shapes["petals"] = InteractiveDataDisplay.Petal;
InteractiveDataDisplay.Markers.shapes["bulleye"] = InteractiveDataDisplay.BullEye;
