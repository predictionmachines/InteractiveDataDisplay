InteractiveDataDisplay.LabelPlot = function (div, master) {
    var that = this;
    this.base = InteractiveDataDisplay.CanvasPlot;
    this.base(div, master);

    var _text = [];
    var _x = [];
    var _y = [];

    //var jqElem = $(div);

    //var positions = jqElem.attr('data-idd-position').split(/\s+/g);
    //if (positions.length < 2)
    //   throw "Position of the DOM marker should define x and y";
    //for (var i = 0; i < positions.length; i += 2) {
    //    var xld = parseFloat(positions[0]);
    //    var ytd = parseFloat(positions[1]);
    //    x.push(xld);
    //    y.push(ytd);
    //    text.push(jqElem.text());
    //}
   
    this.draw = function (data) {
        if (!data) throw "Data series is undefined";
        var n = data.length;
        var text = [];
        var x = [];
        var y = [];
        for (var i = 0; i < n; i++) {
            text.push(data[i].text);
            x.push(data[i].position.x);
            y.push(data[i].position.y);
        }  

        _text = text;
        _x = x;
        _y = y;
       
        this.invalidateLocalBounds();
        this.requestNextFrameOrUpdate();
        this.fireAppearanceChanged();
    };
    // Returns a rectangle in the plot plane.
    this.computeLocalBounds = function (step, computedBounds) {
        var _bbox;
        if (_text) {
            var n = _text.length;
            if (n > 0) {
                var xc = [], yc = [];
                for (var i = 0, j = 0; i < n; i++, j++) {
                    xc[j] = _x[i];
                    yc[j] = _y[i];
                    xc[++j] = _x[i] + 150;
                    yc[++j] = _y[i] - 25;
                }
                var xrange = InteractiveDataDisplay.Utils.getMinMax(xc);
                var yrange = InteractiveDataDisplay.Utils.getMinMax(yc);

                if (xrange && yrange) {
                    var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
                    var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
                    if (dataToPlotX) {
                        xrange.min = dataToPlotX(xrange.min);
                        xrange.max = dataToPlotX(xrange.max);
                    }
                    if (dataToPlotY) {
                        yrange.min = dataToPlotY(yrange.min);
                        yrange.max = dataToPlotY(yrange.max);
                    }
                    _bbox = { x: xrange.min, y: yrange.min, width: xrange.max - xrange.min, height: yrange.max - yrange.min };
                };
            }
        }
        return _bbox;
    };

    // Returns 4 margins in the screen coordinate system
    this.getLocalPadding = function () {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    };
    this.renderCore = function (plotRect, screenSize) {
        InteractiveDataDisplay.LabelPlot.prototype.renderCore.call(this, plotRect, screenSize);
        var context = that.getContext(true);

        var n = _text.length;
        if (n == 0) return;

        var t = that.getTransform();
        var dataToScreenX = t.dataToScreenX;
        var dataToScreenY = t.dataToScreenY;

        // size of the canvas
        var w_s = screenSize.width;
        var h_s = screenSize.height;
        
        for (var i = 0; i < n; i++) {
            var p; // screen coordinates of the el's left-top
            var size_p; // screen size of the element

            size_p = {
                x: 150,
                y: 25
            };

            p = { // screen coordinates 
                x: dataToScreenX(_x[i]), // left
                y: dataToScreenY(_y[i]) // top
            };

            var left = p.x - 0.5 * size_p.x;
            var top = p.y - size_p.y;
            context.fillStyle = "black";
            context.font = "14px Calibri";
            context.beginPath();
            context.fillText(_text[i], left, top);
            context.fill();
        }  
    };
    this.renderCoreSvg = function (plotRect, screenSize, svg) {
        var n = _text.length;
        if (n > 0) {
            var h_s = screenSize.height;
            var w_s = screenSize.width;

             transformations
            var plotToScreenX = this.coordinateTransform.plotToScreenX;
            var plotToScreenY = this.coordinateTransform.plotToScreenY;
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)) } : plotToScreenX;
            var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)) } : plotToScreenY;

            var labels_g = svg.group();
            for (var i = 0; i < n; i++) {
                var style = el ? window.getComputedStyle(el[0], null) : undefined;
                var fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
                var fontFamily = style ? style.getPropertyValue('font-family') : undefined;
                //var textAlign = style ? style.getPropertyValue('text-align') : undefined;
                var fontWeight = style ? style.getPropertyValue('font-weight') : undefined;
                var p; // screen coordinates of the el's left-top
                var size_p; // screen size of the element

                size_p = {
                    x: 150,
                    y: 25
                };

                p = { // screen coordinates 
                    x: dataToScreenX(_x[i]), // left
                    y: dataToScreenY(_y[i]) // top
                };

                var left = p.x - 0.5 * size_p.x;
                var top = p.y - size_p.y;

                var elem_g = labels_g.group();
                elem_g.size(size_p.x, size_p.y);
                elem_g.text(_text[i]);//.font({ family: fontFamily, size: fontSize, weight: fontWeight, baseline: "baseline" });
                elem_g.translate(left, top);
            }
            labels_g.clipWith(labels_g.rect(w_s, h_s));
        }
    };
}
InteractiveDataDisplay.LabelPlot.prototype = new InteractiveDataDisplay.CanvasPlot;