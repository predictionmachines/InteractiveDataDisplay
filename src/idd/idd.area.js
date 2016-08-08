// Area plot takes data with coordinates named 'x', 'y1', 'y2' and a fill colour named 'fill'. 
InteractiveDataDisplay.Area = function (div, master) {
    var that = this;
    var defaultFill = "rgba(0,0,0,0.2)";

    // Initialization (#1)
    var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv);
    var initialData = initializer(div);

    this.base = InteractiveDataDisplay.CanvasPlot;
    this.base(div, master);


    var _x = []; // an array of horizontal axis coordinates
    var _y1 = [];
    var _y2 = []; // arrays of lower and upper limits of the area
    var _fill = defaultFill;

    // default styles:
    if (initialData) {
        _fill = typeof initialData.fill != "undefined" ? initialData.fill : defaultFill;

    }

    this.draw = function (data) {
        var y1 = data.y1;
        if (!y1) throw "Data series y1 is undefined";
        var n = y1.length;

        var y2 = data.y2;
        if (!y2) throw "Data series y2 is undefined";
        if (y2.length !== n)
            throw "Data series y1 and y2 have different lengths";

        var x = data.x;
        if (!x) {
            x = InteractiveDataDisplay.Utils.range(0, n - 1);
        }
        if (x.length !== n)
            throw "Data series x and y1, y2 have different lengths";

        _y1 = y1;
        _y2 = y2;
        _x = x;

        // styles:
        _fill = typeof data.fill != "undefined" ? data.fill : defaultFill;

        this.invalidateLocalBounds();

        this.requestNextFrameOrUpdate();
        this.fireAppearanceChanged();
    };

    // Returns a rectangle in the plot plane.
    this.computeLocalBounds = function () {
        var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
        var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;

        var y1 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y1, dataToPlotX, dataToPlotY);
        var y2 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y2, dataToPlotX, dataToPlotY);

        return InteractiveDataDisplay.Utils.unionRects(y1, y2);
    };

    // Returns 4 margins in the screen coordinate system
    this.getLocalPadding = function () {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    };

    this.renderCore = function (plotRect, screenSize) {
        InteractiveDataDisplay.Area.prototype.renderCore.call(this, plotRect, screenSize);
        var context = that.getContext(true);

        InteractiveDataDisplay.Area.render.call(this, _x, _y1, _y2, _fill, plotRect, screenSize, context);
    };

    // Clipping algorithms
    var code = function (x, y, xmin, xmax, ymin, ymax) {
        return (x < xmin) << 3 | (x > xmax) << 2 | (y < ymin) << 1 | (y > ymax);
    };


    // Others
    this.onDataTransformChanged = function (arg) {
        this.invalidateLocalBounds();
        InteractiveDataDisplay.Area.prototype.onDataTransformChanged.call(this, arg);
    };

    this.getLegend = function () {
        var that = this;
        var canvas = $("<canvas></canvas>");
        canvas[0].width = 40;
        canvas[0].height = 40;
        var ctx = canvas.get(0).getContext("2d");
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = _fill;
        ctx.fillStyle = _fill;

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

        var nameDiv = $("<span></span>");
        var setName = function () {
            nameDiv.text(that.name);
        }
        setName();

        this.host.bind("appearanceChanged",
            function (event, propertyName) {
                if (!propertyName || propertyName == "name")
                    setName();

                ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
                ctx.strokeStyle = _fill;
                ctx.fillStyle = _fill;

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
            });

        var that = this;

        var onLegendRemove = function () {
            that.host.unbind("appearanceChanged");

            //div[0].innerHTML = "";
            //div.removeClass("idd-legend-item");
        };

        //return { div: div, onLegendRemove: onLegendRemove };
        return { name: nameDiv, legend: { thumbnail: canvas, content: undefined }, onLegendRemove: onLegendRemove };
    };
    // Initialization 
    if (initialData && initialData.x && initialData.y1 && initialData.y2)
        this.draw(initialData);

    this.renderCoreSvg = function (plotRect, screenSize, svg) {
        InteractiveDataDisplay.Area.renderSvg.call(this, plotRect, screenSize, svg, _x, _y1, _y2, _fill);
    }
    this.buildSvgLegend = function (legendSettings, svg) {
        var that = this;
        legendSettings.height = 30;
        svg.add(svg.rect(legendSettings.width, legendSettings.height).fill("white").opacity(0.5));
        svg.add(svg.polyline([[0, 0], [0, 4.5], [13.5, 18], [18, 18], [18, 13.5], [4.5, 0], [0, 0]]).fill(_fill).opacity(0.5).translate(5, 5));
        var style = window.getComputedStyle(legendSettings.legendDiv.children[0].children[1], null);
        var fontSize = parseFloat(style.getPropertyValue('font-size'));
        var fontFamily = style.getPropertyValue('font-family');
        svg.add(svg.text(that.name).font({ family: fontFamily, size: fontSize }).translate(40, 0));
        svg.front();
    }
}
InteractiveDataDisplay.Area.prototype = new InteractiveDataDisplay.CanvasPlot;
InteractiveDataDisplay.Area.render = function (_x, _y1, _y2, _fill, plotRect, screenSize, context, globalAlpha) {
    if (_x === undefined || _y1 == undefined || _y2 == undefined)
        return;
    var n = _y1.length;
    if (n == 0) return;

    var t = this.getTransform();
    var dataToScreenX = t.dataToScreenX;
    var dataToScreenY = t.dataToScreenY;

    // size of the canvas
    var w_s = screenSize.width;
    var h_s = screenSize.height;
    var xmin = 0, xmax = w_s;
    var ymin = 0, ymax = h_s;

    context.globalAlpha = globalAlpha;
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
};
InteractiveDataDisplay.Area.renderSvg = function (plotRect, screenSize, svg, _x, _y1, _y2, _fill, globalAlpha) {
    if (_x === undefined || _y1 == undefined || _y2 == undefined) return;
    var n = _y1.length;
    if (n == 0) return;
    
    var t = this.getTransform();
    var dataToScreenX = t.dataToScreenX;
    var dataToScreenY = t.dataToScreenY;
    var area_g = svg.group();
    // size of the canvas
    var w_s = screenSize.width;
    var h_s = screenSize.height;
    var xmin = 0, xmax = w_s;
    var ymin = 0, ymax = h_s;

    var polygons = [];
    var curInd = undefined;
    for (var i = 0; i < n; i++) {
        if (isNaN(_x[i]) || isNaN(_y1[i]) || isNaN(_y2[i])) {
            if (curInd !== undefined) {
                polygons.push([curInd, i - 1]);
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
    var segment = [];
    var nPoly = polygons.length;
    for (var i = 0; i < nPoly; i++) {
        var curPoly = polygons[i];
        segment = [];
        segment.push([dataToScreenX(_x[curPoly[0]]), dataToScreenY(_y1[curPoly[0]])]);
        for (var j = curPoly[0] + 1; j <= curPoly[1]; j++) {
            segment.push([dataToScreenX(_x[j]), dataToScreenY(_y1[j])]);
        }
        for (var j = curPoly[1]; j >= curPoly[0]; j--) {
            segment.push([dataToScreenX(_x[j]), dataToScreenY(_y2[j])]);
        }
        segment.push([dataToScreenX(_x[curPoly[0]]), dataToScreenY(_y1[curPoly[0]])]);
        area_g.polyline(segment).fill(_fill).opacity(globalAlpha);
    }
    area_g.clipWith(area_g.rect(w_s, h_s));
}