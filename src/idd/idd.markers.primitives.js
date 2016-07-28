(function() {
    var primitiveShape =
    {
        // Checks validity of the data and modifies it by replacing missing values with defaults
        // and applying palettes, if required. Filters out missing values, original indices are in `indices`.
        // Output data:
        // `shape`: shape is transformed to an integer value to enable fast switch. 
        // `y`: must be an array and its length must be length of other data series.
        // `x`: 
        //      input: either array of proper length or undefined; if undefined, [0,1,...] is taken;
        //      output: an array of numbers
        // 'border' 
        //      input: a color string, null, undefined or "none"
        //      output: becomes a string color or null, if no border
        // `color`: becomes either a string color or an array of string colors
        //   - if undefined, a default color is used
        //   - if an array of numbers, the color palette is applied, so 'color' is an array of colors.
        // `individualColors`: If data.color is a scalar string, the `data.individualColors` is true, otherwise false.
        // `colorPalette`: if undefined, uses default palette.
        // `size`: always becomes an array of numbers, those are sizes in pixels.
        // `sizeMax`: a number which is a maximum of marker size in pixels.
        // `inidices`: array of original marker index (may be required if there're missing values filtered out).
        prepare : function(data) { 
            // shape
            var invShape = data.shape ? data.shape.toLowerCase() : "box";
            if (invShape == "box") data.shape = 1;
            else if (invShape == "circle") data.shape = 2;
            else if (invShape == "diamond") data.shape = 3;
            else if (invShape == "cross") data.shape = 4;
            else if (invShape == "triangle") data.shape = 5;
            else throw "Unexpected value of property 'shape'";
            
            // y
            if(data.y == undefined || data.y == null) throw "The mandatory property 'y' is undefined or null";
            if(!InteractiveDataDisplay.Utils.isArray(data.y)) throw "The property 'y' must be an array of numbers";                
            var n = data.y.length;
            
            var mask = new Int8Array(n);
            InteractiveDataDisplay.Utils.maskNaN(mask, data.y);               
            
            // x
            if(data.x == undefined)
                data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
            else if (!InteractiveDataDisplay.Utils.isArray(data.x)) throw "The property 'x' must be an array of numbers";  
            else if (data.x.length != n) throw "Length of the array which is a value of the property 'x' differs from lenght of 'y'"
            else InteractiveDataDisplay.Utils.maskNaN(mask, data.x);        
        
            // border
            if(data.border == undefined || data.border == "none")
                data.border = null; // no border
            
            // colors        
            if(data.color == undefined) data.color = InteractiveDataDisplay.Markers.defaults.color;
            if(InteractiveDataDisplay.Utils.isArray(data.color)) {
                if(data.color.length != n) throw "Length of the array 'color' is different than length of the array 'y'"            
                if(n > 0 && typeof(data.color[0]) !== "string"){ // color is a data series (otherwise, it is an array of string colors)                 
                    var palette = data.colorPalette;
                    if (palette == undefined) palette = InteractiveDataDisplay.Markers.defaults.colorPalette;
                    if (typeof palette == 'string') palette = new InteractiveDataDisplay.ColorPalette.parse(palette);
                    if (palette != undefined && palette.isNormalized) {
                        var r = InteractiveDataDisplay.Utils.getMinMax(data.color);
                        r = InteractiveDataDisplay.Utils.makeNonEqual(r);
                        palette = palette.absolute(r.min, r.max);
                    }
                    data.colorPalette = palette;
                    var colors = new Array(n);
                    for (var i = 0; i < n; i++){
                        var color = data.color[i];
                        if(color != color) // NaN
                            mask[i] = 1;
                        else {
                            var rgba = palette.getRgba(color);                        
                            colors[i] = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
                        }
                    }
                    data.color = colors;
                }
                data.individualColors = true;            
            }else{
                data.individualColors = false;
            }
            //sizes
            var sizes = new Array(n);
            if (data.size == undefined) data.size = InteractiveDataDisplay.Markers.defaults.size;
            if (InteractiveDataDisplay.Utils.isArray(data.size)) {
                if (data.size.length != n) throw "Length of the array 'size' is different than length of the array 'y'"
                if (data.sizePalette != undefined) { // 'size' is a data series 
                    var palette = InteractiveDataDisplay.SizePalette.Create(data.sizePalette);
                    if (palette.isNormalized) {
                        var r = InteractiveDataDisplay.Utils.getMinMax(data.size);
                        r = InteractiveDataDisplay.Utils.makeNonEqual(r);
                        palette = new InteractiveDataDisplay.SizePalette(false, palette.sizeRange, r);
                    }
                    data.sizePalette = palette;
                    for (var i = 0; i < n; i++) {
                        var size = data.size[i];
                        if (size != size) // NaN
                            mask[i] = 1;
                        else
                            sizes[i] = palette.getSize(size)
                    }
                } else { // 'size' contains values in pixels
                    sizes = data.size;
                    data.sizeMax = InteractiveDataDisplay.Utils.getMax(data.size);
                }
            } else { // sizes is a constant
                for (var i = 0; i < n; i++) sizes[i] = data.size;
                data.sizeMax = data.size;
            }
            data.size = sizes;
            
            // Filtering out missing values
            var m = 0;
            for(var i = 0; i < n; i++) if(mask[i] === 1) m++;            
            if(m > 0){ // there are missing values
                m = n - m; 
                data.x = InteractiveDataDisplay.Utils.applyMask(mask, data.x, m);
                data.y = InteractiveDataDisplay.Utils.applyMask(mask, data.y, m);
                data.size = InteractiveDataDisplay.Utils.applyMask(mask, data.size, m);
                if(data.individualColors)
                    data.color = InteractiveDataDisplay.Utils.applyMask(mask, data.color, m);
                var indices = Array(m);
                for(var i = 0, j = 0; i < n; i++) if(mask[i] === 0) indices[j++] = i;
                data.indices = indices;
            }else{
                data.indices = InteractiveDataDisplay.Utils.range(0, n-1);
            }
        },
        
        preRender : function (data, plotRect, screenSize, dt, context){
            if(!data.individualColors)
                context.fillStyle = data.color;
            if(data.border != null)
                context.strokeStyle = data.border;
            return data;
        },
        
        draw : function (d, plotRect, screenSize, t, context, index){ 
            if(d.individualColors) context.fillStyle = d.color;
            var drawBorder = d.border != null;
            var x1 = t.dataToScreenX(d.x);
            var y1 = t.dataToScreenY(d.y);
            var w_s = screenSize.width;
            var h_s = screenSize.height;
            var localSize = d.size;
            var halfSize = localSize / 2;
            if ((x1 - halfSize) > w_s || (x1 + halfSize) < 0 || (y1 - halfSize) > h_s || (y1 + halfSize) < 0) return;
            switch (d.shape) {
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
        },
        
        getPadding : function(data) {
            var p = data.sizeMax / 2;
            return { left: p, right: p, top: p, bottom: p };
        },
        
        hitTest : function(d, t, ps, pd){
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
            
            var x1 = t.dataToScreenX(d.x);
            var y1 = t.dataToScreenY(d.y);
            var xs = ps.x;
            var ys = ps.y;
            var localSize = d.size;
            var halfSize = localSize / 2; // Checks bounding box hit:
            if (ps.x >= x1 - halfSize && ps.x <= x1 + halfSize && ps.y >= y1 - halfSize && ps.y <= y1 + halfSize) {
                switch (d.shape) {
                    case 1: // box
                        return true;
                    case 2: // circle
                        return ((x1 - xs) * (x1 - xs) + (y1 - ys) * (y1 - ys) <= halfSize * halfSize);
                    case 3: // diamond
                        return (isInside({ x: xs, y: ys }, [{ x: x1 - halfSize, y: y1 }, { x: x1, y: y1 - halfSize },
                                                        { x: x1 + halfSize, y: y1 }, { x: x1, y: y1 + halfSize }, ]));
                    case 4: // cross
                        var thirdSize = localSize / 3;
                        var halfThirdSize = thirdSize / 2;
                        return (isInside({ x: xs, y: ys }, [{ x: x1 - halfThirdSize, y: y1 + halfSize }, { x: x1 - halfThirdSize, y: y1 - halfSize },
                                                        { x: x1 + halfThirdSize, y: y1 - halfSize }, { x: x1 + halfThirdSize, y: y1 + halfSize }]) ||
                            isInside({ x: xs, y: ys }, [{ x: x1 - halfSize, y: y1 + halfThirdSize }, { x: x1 - halfSize, y: y1 - halfThirdSize },
                                                        { x: x1 + halfSize, y: y1 - halfThirdSize }, { x: x1 + halfSize, y: y1 + halfThirdSize }]));
                    case 5: // triangle
                        return (isInside({ x: xs, y: ys }, [{ x: x1 - halfSize, y: y1 + halfSize }, { x: x1, y: y1 - halfSize },
                                                        { x: x1 + halfSize, y: y1 + halfSize }]));
                }
            }
        },
        
        getLegend: function(data, getTitle, legendDiv) { // todo: should be refactored            
            var itemDiv = legendDiv.content;
            var fontSize = 14;
            if (document.defaultView && document.defaultView.getComputedStyle) {
                fontSize = parseFloat(document.defaultView.getComputedStyle(itemDiv[0], null).getPropertyValue("font-size"));
            }
            if (isNaN(fontSize) || fontSize == 0) fontSize = 14;

            //var thumbDiv = $("<div></div>");
            var canvas = legendDiv.thumbnail;
            var canvasIsVisible = true;
            var maxSize = fontSize * 1.5;
            var x1 = maxSize / 2 + 1;
            var y1 = x1;
            canvas[0].width = canvas[0].height = maxSize + 2;
            var canvasStyle = canvas[0].style;
            var context = canvas.get(0).getContext("2d");
            context.clearRect(0, 0, canvas[0].width, canvas[0].height);
            var item, itemDivStyle;
            var itemIsVisible = 0;

            var colorIsArray, color, border, drawBorder;
            var colorDiv, colorDivStyle, colorControl;
            var colorIsVisible = 0;

            var sizeIsArray, size, halfSize;
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
                        var paletteDiv = $("<div style='width: 170px; color: rgb(0,0,0)'></div>").appendTo(sizeDiv);
                        sizeControl = new InteractiveDataDisplay.SizePaletteViewer(paletteDiv);
                        sizeIsVisible = 2;
                    } else {
                        sizeTitle.text(szTitleText);
                    }
                    sizeControl.palette = InteractiveDataDisplay.SizePalette.Create(data.sizePalette);
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
                        var paletteDiv = $("<div style='width: 170px; color: rgb(0,0,0); '></div>").appendTo(colorDiv);
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
                if (itemIsVisible == 2) {
                    itemDivStyle.display = "none";
                    itemIsVisible = 1;
                }
                context.clearRect(0, 0, maxSize + 2, maxSize + 2);
                context.strokeStyle = border;
                context.fillStyle = color;

                switch (data.shape) {
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
            };

            refreshColor();
            refreshSize();
            renderShape();
        },

        renderSvg: function (plotRect, screenSize, svg, data, t) {
            var n = data.y.length;
            if (n == 0) return;

            var dataToScreenX = t.dataToScreenX;
            var dataToScreenY = t.dataToScreenY;

            // size of the canvas
            var w_s = screenSize.width;
            var h_s = screenSize.height;
            var xmin = 0, xmax = w_s;
            var ymin = 0, ymax = h_s;

            var x1, y1;
            var i = 0;
            var nextValuePoint = function () {
                var border = data.border == null? 'none': data.border;
                for (; i < n; i++) {
                    x1 = dataToScreenX(data.x[i]);
                    y1 = dataToScreenY(data.y[i]);
                    var size = data.size[i];
                    var halfSize = size / 2;
                    c1 = ((x1 - halfSize) > w_s || (x1 + halfSize) < 0 || (y1 - halfSize) > h_s || (y1 + halfSize) < 0);
                    var color = data.individualColors ? data.color[i] : data.color;
                    if (!c1) {// point is inside visible rect
                        if (data.shape == 1) svg.rect(data.size[i], data.size[i]).translate(x1 - halfSize, y1 - halfSize).fill(color).stroke(border);
                        else if (data.shape == 2) svg.circle(data.size[i]).translate(x1 - halfSize, y1 - halfSize).fill(color).stroke(border);
                        else if (data.shape == 3) svg.rect(data.size[i] / Math.sqrt(2), data.size[i] / Math.sqrt(2)).translate(x1, y1 - halfSize).fill(color).stroke(border).rotate(45); //diamond
                        else if (data.shape == 4) {
                            var halfThirdSize = size / 6;
                            svg.polyline([[-halfSize, -halfThirdSize], [-halfThirdSize, -halfThirdSize], [-halfThirdSize, -halfSize], [halfThirdSize, -halfSize],
                                [halfThirdSize, -halfThirdSize], [halfSize, -halfThirdSize], [halfSize, halfThirdSize], [halfThirdSize, halfThirdSize], [halfThirdSize, halfSize],
                                [-halfThirdSize, halfSize], [-halfThirdSize, halfThirdSize], [-halfSize, halfThirdSize], [-halfSize, -halfThirdSize]]).translate(x1, y1).fill(color).stroke(border);//cross
                        }
                        else if (data.shape == 5) {
                            var r = Math.sqrt(3) / 6 * size;
                            svg.polyline([[x1 - halfSize, y1 + r], [x1, y1 - r * 2], [x1 + halfSize, y1 + r], [x1 - halfSize, y1 + r]]).fill(color).stroke(border);//triangle
                        }
    
                    }
                }
                svg.clipWith(svg.rect(w_s, h_s));
            };
            nextValuePoint();
        },

        buildSvgLegendElements: function (legendSettings, svg, data, getTitle) {
            var thumbnail = svg.group();
            var content = svg.group();
            var fontSize = 12;
            var size = fontSize * 1.5;
            var x1 = size / 2 + 1;
            var y1 = x1;
            var halfSize = size / 2;
            //thumbnail
            if (data.individualColors) {
                border = "#000000";
                color = "#ffffff";
            }
            else {
                color = data.color;
                border = "none";
                if (data.border != null) border = data.border;
            }
            switch (data.shape) {     
                case 1: // box
                    thumbnail.rect(size, size).translate(x1 - halfSize, y1 - halfSize).fill({color: color, opacity: 1}).stroke(border); 
                    break;
                case 2: // circle
                    thumbnail.circle(size).translate(x1 - halfSize, y1 - halfSize).fill(color).stroke(border);
                    break;
                case 3: // diamond
                    thumbnail.rect(size / Math.sqrt(2), size / Math.sqrt(2)).translate(x1, y1 - halfSize).fill(color).stroke(border).rotate(45);
                    break;
                case 4: // cross
                    var halfThirdSize = size / 6;
                    thumbnail.polyline([[-halfSize, -halfThirdSize], [-halfThirdSize, -halfThirdSize], [-halfThirdSize, -halfSize], [halfThirdSize, -halfSize],
                        [halfThirdSize, -halfThirdSize], [halfSize, -halfThirdSize], [halfSize, halfThirdSize], [halfThirdSize, halfThirdSize], [halfThirdSize, halfSize],
                        [-halfThirdSize, halfSize], [-halfThirdSize, halfThirdSize], [-halfSize, halfThirdSize], [-halfSize, -halfThirdSize]]).translate(x1, y1).fill(color).stroke(border);//cross    
                    break;
                case 5: // triangle
                    var r = Math.sqrt(3) / 6 * size;
                    thumbnail.polyline([[x1 - halfSize, y1 + r], [x1, y1 - r * 2], [x1 + halfSize, y1 + r], [x1 - halfSize, y1 + r]]).fill(color).stroke(border);//triangle    
                    break;
            }
            //content
            var shiftsizePalette = 0;
            var isContent = legendSettings.legendDiv.children[1];
            var isColor = data.individualColors && data.colorPalette;
            var isSize = data.sizePalette;
            var style = (isContent && legendSettings.legendDiv.children[1].children[0] && legendSettings.legendDiv.children[1].children[0].children[0]) ? window.getComputedStyle(legendSettings.legendDiv.children[1].children[0].children[0], null) : undefined;
            fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
            fontFamily = style ? style.getPropertyValue('font-family') : undefined;
            if (isColor) {
                var colorText = getTitle("color");
                content.text(colorText).font({ family: fontFamily, size: fontSize });
                var colorPalette_g = svg.group();
                var width = legendSettings.width;
                var height = 20;
                InteractiveDataDisplay.SvgColorPaletteViewer(colorPalette_g, data.colorPalette, legendSettings.legendDiv.children[1].children[0].children[1], { width: width, height: height });
                colorPalette_g.translate(5, 50);
                shiftsizePalette = 50 + height;
                legendSettings.height += (50 + height);
            };
            if (data.sizePalette) {
                var sizeText = getTitle("size");
                content.add(svg.text(sizeText).font({ family: fontFamily, size: fontSize }).translate(0, shiftsizePalette));
                var sizePalette_g = svg.group();
                var width = legendSettings.width;
                var height = 35;
                var sizeElement = isColor ? legendSettings.legendDiv.children[1].children[1].children[1] : legendSettings.legendDiv.children[1].children[0].children[1];
                InteractiveDataDisplay.SvgSizePaletteViewer(sizePalette_g, data.sizePalette, sizeElement, { width: width, height: height });
                sizePalette_g.translate(5, 50 + shiftsizePalette);

                legendSettings.height += (50 + height);
            };
            svg.front();
            return { thumbnail: thumbnail, content: content };
        }
    }
    InteractiveDataDisplay.Markers.shapes["box"] = primitiveShape;
    InteractiveDataDisplay.Markers.shapes["circle"] = primitiveShape;
    InteractiveDataDisplay.Markers.shapes["diamond"] = primitiveShape;
    InteractiveDataDisplay.Markers.shapes["cross"] = primitiveShape;
    InteractiveDataDisplay.Markers.shapes["triangle"] = primitiveShape;
})();