InteractiveDataDisplay.LabelPlot = function (div, master) {
    var that = this;

    this.base = InteractiveDataDisplay.CanvasPlot;
    this.base(div, master);

    var _text = [];
    var _x = [];
    var _y = [];
    var _placement = [];

    var size_p = {
        x: 120,
        y: 25
    };
    var shift = [];
    this.getData = function () {
        var data = [];
        var n = _text.length;
        for (var i = 0; i < n; i++) {
            data.push({
                text: _text[i], position: { x: _x[i], y: _y[i] }, placement: _placement[i] });
        }
        return data;
    }
    this.draw = function (data) {
        if (data) {
            var n = data.length;
            var text = [];
            var x = [];
            var y = [];
            var placement = [];
            for (var i = 0; i < n; i++) {
                text.push(data[i].text);
                x.push(data[i].position.x);
                y.push(data[i].position.y);
                if (data[i].placement) placement.push(data[i].placement)
                else placement.push('center');
                shift.push(0);
            }

            _text = text;
            _x = x;
            _y = y;
            _placement = placement;
        }
        this.invalidateLocalBounds();
        this.requestNextFrameOrUpdate();
        this.fireAppearanceChanged();
    };
    // Returns a rectangle in the plot plane.
    this.computeLocalBounds = function () {
        var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
        var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;

        if (_x.length > 0 && _y.length > 0) {
            var xrange = InteractiveDataDisplay.Utils.getMinMax(_x);
            var yrange = InteractiveDataDisplay.Utils.getMinMax(_y);
            var xmin = xrange.min - 0.2;
            var xmax = xrange.max + 0.2;
            var ymin = yrange.min;
            var ymax = yrange.max;
            if (dataToPlotX) {
                xmin = dataToPlotX(xmin);
                xmax = dataToPlotX(xmax);
            }
            if (dataToPlotY) {
                ymin = dataToPlotY(ymin);
                ymax = dataToPlotY(ymax);
            }
            return { x: xmin, y: ymin, width: xmax - xmin, height: ymax - ymin };
        }
        
        return undefined;
    };
    // Returns 4 margins in the screen coordinate system
    this.getLocalPadding = function () {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    };
    this.renderCore = function (plotRect, screenSize) {
        InteractiveDataDisplay.LabelPlot.prototype.renderCore.call(this, plotRect, screenSize);
        var context = this.getContext(true);

        var n = _text.length;
        if (n == 0) return;

        var t = this.getTransform();
        var dataToScreenX = t.dataToScreenX;
        var dataToScreenY = t.dataToScreenY;
        for (var i = 0; i < n; i++) {
            var p = { // screen coordinates 
                x: dataToScreenX(_x[i]), // left
                y: dataToScreenY(_y[i]) // top
            };
            if (_placement[i] == 'left') {
                p = { // screen coordinates 
                    x: dataToScreenX(_x[i]) - size_p.x, // left
                    y: dataToScreenY(_y[i]) // top
                }
            } else if (_placement[i] == 'right') {
                p = { // screen coordinates 
                    x: dataToScreenX(_x[i]) + size_p.x, // left
                    y: dataToScreenY(_y[i]) // top
                }
            } else if (_placement[i] == 'top') {
                p = { // screen coordinates 
                    x: dataToScreenX(_x[i]), // left
                    y: dataToScreenY(_y[i]) - size_p.y // top
                }
            } else if (_placement[i] == 'bottom') {
                p = { // screen coordinates 
                    x: dataToScreenX(_x[i]), // left
                    y: dataToScreenY(_y[i]) + size_p.y // top
                }
            };
            var style = window.getComputedStyle(document.body, null);
            var fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
            var fontFamily = style ? style.getPropertyValue('font-family') : undefined;
            var fontWeight = style ? style.getPropertyValue('font-weight') : undefined;
            var left = p.x - 0.5 * size_p.x;
            var top = p.y;
            context.fillStyle = "black";
            context.font = fontWeight + " " + fontSize + "px " + fontFamily;
            context.textALign = 'center';
            var text = _text[i];
            var textWidth = context.measureText(text).width;
            while (textWidth > size_p.x) {
                text = text.substring(0, text.length - 1);
                textWidth = context.measureText(text).width;
            }
            shift[i] = (size_p.x - textWidth) / 2;
            context.fillText(text, left + shift[i], top);
        }
    };
    this.renderCoreSvg = function (plotRect, screenSize, svg) {
        var n = _text.length;
        if (n > 0) {
            var h_s = screenSize.height;
            var w_s = screenSize.width;

            // transformations
            var plotToScreenX = this.coordinateTransform.plotToScreenX;
            var plotToScreenY = this.coordinateTransform.plotToScreenY;
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)) } : plotToScreenX;
            var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)) } : plotToScreenY;

            var labels_g = svg.group();
            for (var i = 0; i < n; i++) {
                var style = window.getComputedStyle(document.body, null);
                var fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
                var fontFamily = style ? style.getPropertyValue('font-family') : undefined;
                var fontWeight = style ? style.getPropertyValue('font-weight') : undefined;
                var p = { // screen coordinates 
                    x: dataToScreenX(_x[i]), // left
                    y: dataToScreenY(_y[i]) // top
                };
                if (_placement[i] == 'left') {
                    p = { // screen coordinates 
                        x: dataToScreenX(_x[i]) - size_p.x, // left
                        y: dataToScreenY(_y[i]) // top
                    }
                } else if (_placement[i] == 'right') {
                    p = { // screen coordinates 
                        x: dataToScreenX(_x[i]) + size_p.x, // left
                        y: dataToScreenY(_y[i]) // top
                    }
                } else if (_placement[i] == 'top') {
                    p = { // screen coordinates 
                        x: dataToScreenX(_x[i]), // left
                        y: dataToScreenY(_y[i]) - size_p.y // top
                    }
                } else if (_placement[i] == 'bottom') {
                    p = { // screen coordinates 
                        x: dataToScreenX(_x[i]), // left
                        y: dataToScreenY(_y[i]) + size_p.y // top
                    }
                };

                var left = p.x - 0.5 * size_p.x;
                var top = p.y - 0.9 * size_p.y;

                var elem_g = labels_g.group();
                elem_g.size(size_p.x, size_p.y);
                var text = elem_g.text(_text[i]).font({ family: fontFamily, size: fontSize, weight: fontWeight });
                
               
                elem_g.translate(left + shift[i], top);
                elem_g.clipWith(elem_g.rect(size_p.x, size_p.y));
            }
            labels_g.clipWith(labels_g.rect(w_s, h_s));
        }
    };
}
InteractiveDataDisplay.LabelPlot.prototype = new InteractiveDataDisplay.CanvasPlot;