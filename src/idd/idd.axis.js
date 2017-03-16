InteractiveDataDisplay.InitializeAxis = function (div, params) {
    
    if (div.hasClass("idd-axis"))
        throw "The div element already is initialized as an axis";
    var axisType = div.attr("data-idd-axis");
    switch (axisType) {
        case "numeric":
            div.axis = new InteractiveDataDisplay.NumericAxis(div);
            return div.axis;
        case "log":
            div.axis = new InteractiveDataDisplay.LogarithmicAxis(div);
            return div.axis;
        case "labels":
            div.axis = new InteractiveDataDisplay.LabelledAxis(div, params);
            return div.axis;
    }
};

// object that provides functions to render ticks    
InteractiveDataDisplay.TicksRenderer = function (div, source) {

    if (typeof (Modernizr) != 'undefined' && div) {
        if (!Modernizr.canvas) {
            div.replaceWith('<div">Browser does not support HTML5 canvas</div>');
        }
    }

    if (div && div.hasClass("idd-axis")) return;
    if (div) div[0].axis = this;
    var that = this;

    // link to div element - container of axis
    var _host = div;

    // orientation: horizontal or vertical
    var _mode = "";
    if (div) _mode = div.attr("data-idd-placement");
    if (_mode != "top" && _mode != "bottom" && _mode != "left" && _mode != "right")
        _mode == "bottom";
    var isHorizontal = (_mode == "top" || _mode == "bottom");
    this.rotateLabels = false;

    // _range of axis in plot coordinates
    var _range = { min: 0, max: 1 };

    // provider to calculate ticks and labels
    var _tickSource = source;
    var _ticks = [];

    var textOffset = 3;

    // canvas to render ticks
    var canvas = $("<canvas id='canvas' style='position:relative; float:left'></canvas>");
    // div to place labels
    var labelsDiv = $("<div id='labelsDiv' style='position:relative; float:left'></div>");

    if (div) {
        if (_mode == "bottom" || _mode == "right") {
            div[0].appendChild(canvas[0]);
            div[0].appendChild(labelsDiv[0]);
        }
        else {
            div[0].appendChild(labelsDiv[0]);
            div[0].appendChild(canvas[0]);
        }

        var canvasSize = InteractiveDataDisplay.tickLength + 1;
        if (isHorizontal) canvas[0].height = canvasSize;
        else {
            canvas[0].width = canvasSize;
            if (_mode == "right") labelsDiv.css("left", textOffset);
            else canvas.css("left", textOffset);
        }
    }

    var _width, _height;
    var _size;
    var _deltaRange;
    var _canvasHeight;
    var _rotateAngle;

    // checks if size of host element changed and refreshes size of canvas and labels' div
    this.updateSize = function () {
        var prevSize = _size;
        if (div) {
            var divWidth = div.outerWidth(false);
            var divHeight = div.outerHeight(false);
            _width = divWidth;
            _height = _rotateAngle ? divWidth * Math.abs(Math.sin(_rotateAngle)) + divHeight * Math.abs(Math.cos(_rotateAngle)) : divHeight;
        }
        if (isHorizontal) {
            _size = _width;
            if (_size != prevSize) {
                canvas[0].width = _size;
                labelsDiv.css("width", _size);              
            }
        }
        else {
            _size = _height;
            if (_size != prevSize) {
                canvas[0].height = _size;
                labelsDiv.css("height", _size);
            }
        }
        _deltaRange = (_size - 1) / (_range.max - _range.min);
        _canvasHeight = canvas[0].height;
    };

    var text_size = -1; 
    var smallTickLength = InteractiveDataDisplay.tickLength / 3;

    var strokeStyle = _host ? _host.css("color") : "Black";
    var ctx = canvas.get(0).getContext("2d");
    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = strokeStyle;
    ctx.lineWidth = 1;

    var fontSize = 12;        
    var customFontSize = false;
    var fontFamily = "";

    if (_host) {       
        if (_host[0].currentStyle) {
            fontSize = _host[0].currentStyle["font-size"];
            fontFamily = _host[0].currentStyle["font-family"];
        }
        else if (document.defaultView && document.defaultView.getComputedStyle) {
            fontSize = document.defaultView.getComputedStyle(_host[0], null).getPropertyValue("font-size");
            fontFamily = document.defaultView.getComputedStyle(_host[0], null).getPropertyValue("font-family");
        }
        else if (_host[0].style) {
            fontSize = _host[0].style["font-size"];
            fontFamily = _host[0].style["font-family"];
        }
        ctx.font = fontSize + fontFamily;        
    }

    Object.defineProperty(this, "host", { get: function () { return _host; }, configurable: false });
    Object.defineProperty(this, "mode", { get: function () { return _mode; }, configurable: false });
    Object.defineProperty(this, "tickSource",
        {
            get: function () { return _tickSource; },
            set: function (value) {
                _tickSource = value;
                labelsDiv.empty();
                render();
            },
            configurable: false
        });
    Object.defineProperty(this, "range", { get: function () { return _range; }, configurable: false });
    Object.defineProperty(this, "ticks", { get: function () { return _ticks; }, configurable: false });

    Object.defineProperty(this, "DesiredSize", { get: function () { return { width: _width, height: _height }; }, configurable: false });
    Object.defineProperty(this, "axisSize", { get: function () { return _size; }, configurable: false });
    Object.defineProperty(this, "deltaRange", { get: function () { return _deltaRange; }, configurable: false });
    Object.defineProperty(this, "FontSize", { 
        get: function () { return _defaultFontSize; }, 
        set: function (newFontSize) {
            customFontSize = true;
            fontSize = newFontSize + "px";
            ctx.font = fontSize + fontFamily;  
            _tickSource.invalidate();
            that.update();
        },
        configurable: false
    });
    Object.defineProperty(this, "rotateAngle", {
        get: function () { return _rotateAngle; },
        set: function (value) {
            _rotateAngle = value * Math.PI / 180;
            _tickSource.invalidate();
            that.update();
        },
        configurable: false
    });
    this.sizeChanged = true;

    // transform data <-> plot: is applied before converting into screen coordinates
    var _dataTransform = undefined;
    Object.defineProperty(this, "dataTransform", {
        get: function () { return _dataTransform; },
        set: function (value) {
            _dataTransform = value;
            render();
        },
        configurable: false
    });

    var ticksInfo = [];

    // calculate and cashe positions of ticks and labels' size
    var getPositions = function (ticks) {
        var len = ticks.length;
        ticksInfo = new Array(len);
        var size, width, height;
        var h = isHorizontal ? _canvasHeight : 0;
        for (var i = 0; i < len; i++) {
            var tick = ticks[i];
            if (tick.label) {
                size = tick.label._size;
                width = size.width; 
                height = size.height;
                if(width == 0 || height == 0) {       
                  var inner = _tickSource.getInner(tick.position);
                  if(typeof inner === "string"){
                      var sz = ctx.measureText(_tickSource.getInnerText(tick.position));
                      width = sz.width;
                      height = sz.height; // height = (isHorizontal ? h : parseFloat(fontSize)) + 8;
                  }else{ // html element
                      var $div = $("<div></div>").append($(inner)).css({ "display":"block", "visibility":"hidden", "position":"absolute" }).appendTo($("body"));                        
                      width = $div.width();
                      height = $div.height();
                      $div.remove();
                  }
                }
                height = _rotateAngle ? width * Math.abs(Math.sin(_rotateAngle)) + height * Math.abs(Math.cos(_rotateAngle)) : height;                
                ticksInfo[i] = { position: that.getCoordinateFromTick(tick.position), width: width, height: height, hasLabel: true };
            } else { // no label
                ticksInfo[i] = { position: that.getCoordinateFromTick(tick.position), width: 0, height: 0, hasLabel: false };
            }
        }
    };

    // private function to check whether ticks overlay each other
    var checkLabelsArrangement = function (ticks) {

        var delta, deltaSize;
        var len = ticks.length - 1;

        addNewLabels(ticks);
        getPositions(ticks);

        if (len == -1) return 1;

        var i1 = 0;
        var i2 = 0;
        while (i2 < len) {
            i1 = i2;
            i2++;
            while (i2 < len + 1 && !ticksInfo[i2].hasLabel) i2++;
            if (i2 > len) break;
            if (ticksInfo[i1].hasLabel) {
                delta = Math.abs(ticksInfo[i2].position - ticksInfo[i1].position);
                if (delta < InteractiveDataDisplay.minTickSpace) return -1;
                if (isHorizontal) {
                    deltaSize = (ticksInfo[i1].width + ticksInfo[i2].width) / 2;
                    if (i1 == 0 && ticksInfo[i1].position - ticksInfo[i1].width / 2 < 0) deltaSize -= ticksInfo[i1].width / 2;
                    else if (i2 == len - 1 && ticksInfo[i2].position - ticksInfo[i2].width / 2 > _size) deltaSize -= ticksInfo[i2].width / 2;
                }
                else {
                    deltaSize = (ticksInfo[i1].height + ticksInfo[i2].height) / 2;
                    if (i1 == 0 && ticksInfo[i1].position - ticksInfo[i1].height / 2 < 0) deltaSize -= ticksInfo[i1].height / 2;
                    else if (i2 == len - 1 && ticksInfo[i2].position - ticksInfo[i2].height / 2 > _size) deltaSize -= ticksInfo[i2].height / 2;
                }
                if (delta - deltaSize < InteractiveDataDisplay.minLabelSpace) return -1;
            }
        }
        var res = 1;
        i1 = i2 = 0;
        while (i2 < len) {
            i1 = i2;
            i2++;
            while (i2 < len + 1 && !ticksInfo[i2].hasLabel) i2++;
            if (i2 > len) break;
            if (ticksInfo[i1].hasLabel) {
                delta = Math.abs(ticksInfo[i2].position - ticksInfo[i1].position);
                if (isHorizontal) {
                    deltaSize = (ticksInfo[i1].width + ticksInfo[i2].width) / 2;
                    if (i1 == 0 && ticksInfo[i1].position - ticksInfo[i1].width / 2 < 0) deltaSize -= ticksInfo[i1].width / 2;
                    else if (i2 == len - 1 && ticksInfo[i2].position - ticksInfo[i2].width / 2 > _size) deltaSize -= ticksInfo[i2].width / 2;
                }
                else {
                    deltaSize = (ticksInfo[i1].height + ticksInfo[i2].height) / 2;
                    if (i1 == 0 && ticksInfo[i1].position - ticksInfo[i1].height / 2 < 0) deltaSize -= ticksInfo[i1].height / 2;
                    else if (i2 == len - 1 && ticksInfo[i2].position - ticksInfo[i2].height / 2 > _size) deltaSize -= ticksInfo[i2].height / 2;
                }
                if (delta - deltaSize < InteractiveDataDisplay.minLabelSpace) {
                    res = 0;
                    break;
                }
            }
        }
        return res;
    };

    // returns x coordinate in pixels by given coordinate in plot
    if (!this.getCoordinateFromTick) {
        this.getCoordinateFromTick = function (x) {
            return x;
        };
    }
    
    var minTicks = false;    

    // function to render ticks and labels
    var render = function () {

        // refreshing size of axis if changed
        that.updateSize();

        if (_dataTransform) {
            var min = _dataTransform.plotToData(_range.min);
            var max = _dataTransform.plotToData(_range.max);
            _ticks = _tickSource.getTicks({ min: Math.min(min, max), max: Math.max(min, max) });
        }
        else _ticks = _tickSource.getTicks(_range);

        // check for possible labels overlay
        var result = checkLabelsArrangement(_ticks);
        var newTicks, newResult;
        var iterations = 0;

        if (result == -1) {
            // if labels overlay each other -> need to be decreased
            while (iterations++ < InteractiveDataDisplay.maxTickArrangeIterations) {
                newTicks = _tickSource.decreaseTickCount();
                newResult = checkLabelsArrangement(newTicks);
                _ticks = newTicks;
                if (newResult != -1)
                    break;
            }
        }
        if (result == 1) {
            // if labels do not overlay each other and there is enough space to increase them -> need to be increased
            while (iterations++ < InteractiveDataDisplay.maxTickArrangeIterations) {
                newTicks = _tickSource.increaseTickCount();
                newResult = checkLabelsArrangement(newTicks);
                if (newResult == -1) {
                    _ticks = _tickSource.decreaseTickCount();
                    getPositions(_ticks);
                    addNewLabels(_ticks);
                    break;
                }
                _ticks = newTicks;
                if (newResult == 0)
                    break;
            }
        }
        if (_rotateAngle) {
            _ticks = _tickSource.updateTransform(result);
        }
        minTicks = false;
        if (_tickSource.getMinTicks) {
            if (newResult == -1 && iterations > InteractiveDataDisplay.maxTickArrangeIterations || _ticks.length < 2) {
                newTicks = _tickSource.getMinTicks();
                if (newTicks.length > 0) {
                    _ticks = newTicks;
                    addNewLabels(_ticks);
                    getPositions(_ticks);
                }
            }
        }
        if (_ticks.length == 2) {
            addNewLabels(_ticks);
            getPositions(_ticks);
            if (_ticks.length == 2) {
                var delta = ticksInfo[1].position - ticksInfo[0].position;
                var deltaSize;
                if (isHorizontal) deltaSize = (ticksInfo[0].width + ticksInfo[1].width) / 2;
                else deltaSize = (ticksInfo[0].height + ticksInfo[1].height) / 2;
                if (delta - deltaSize < InteractiveDataDisplay.minLabelSpace)
                    minTicks = true;
            }
        }

        var len = _ticks.length;
        var old_text_size = text_size;
        text_size = 0;
        this.sizeChanged = false;
        // calculate max size of labels (width or height) to set proper size of host
        if (isHorizontal) {
            for (var i = 0; i < len; i++) {
                text_size = Math.max(text_size, ticksInfo[i].height);
            }
            if (text_size != old_text_size && text_size != 0) {
                labelsDiv.css("height", text_size);
                canvas[0].height = canvasSize;
                _height = text_size + canvasSize;
                _host.css("height", _height);
                this.sizeChanged = true;
            }
        }
        else {
            for (var i = 0; i < len; i++) {
                text_size = Math.max(text_size, ticksInfo[i].width);
            }
            if (text_size != old_text_size && text_size != 0) {
                labelsDiv.css("width", text_size);
                canvas[0].width = canvasSize;
                _width = text_size + canvasSize + textOffset;
                _host.css("width", _width);
                this.sizeChanged = true;
            }
        }

        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = strokeStyle;

        // clear canvas context and render base line
        if (isHorizontal) {
            ctx.clearRect(0, 0, _size, canvasSize);
            if (_mode == "bottom") ctx.fillRect(0, 0, _size, 1);
            else ctx.fillRect(0, InteractiveDataDisplay.tickLength, _size, 1);
        }
        else {
            ctx.clearRect(0, 0, canvasSize, _size);
            if (_mode == "right") ctx.fillRect(0, 0, 1, _size);
            else ctx.fillRect(InteractiveDataDisplay.tickLength, 0, 1, _size);
        }

        // render ticks and labels (if necessary)
        // if range is single point - render only label in the middle of axis
        var x, shift;
        for (var i = 0; i < len; i++) {
            x = ticksInfo[i].position;
            if (isHorizontal) {
                shift = ticksInfo[i].width / 2;
                if (minTicks) {
                    if (i == 0) shift *= 2;
                    else if (i == len - 1) shift = 0;
                }
                else {
                    if (i == 0 && x < shift) shift = 0;
                    else if (i == len - 1 && x + shift > _size) shift *= 2;
                }

                if (!_ticks[i].invisible) ctx.fillRect(x, 1, 1, InteractiveDataDisplay.tickLength);
                if (_ticks[i].label) {
                    
                    if (!_rotateAngle || result == 1)
                        _ticks[i].label.css("left", x - shift);
                    else if (_rotateAngle > 0) 
                        _ticks[i].label.css("left", x);
                    else {
                        _ticks[i].label.css("left", x - ticksInfo[i].width);
                    }
                }
            }
            else {
                x = (_size - 1) - x;
                shift = ticksInfo[i].height / 2;
                if (minTicks) {
                    if (i == 0) shift = 0;
                    else if (i == len - 1) shift *= 2;
                }
                else {
                    if (i == 0 && x + shift > _size) shift *= 2;
                    else if (i == len - 1 && x < shift) shift = 0;
                }

                if (!_ticks[i].invisible) ctx.fillRect(1, x, InteractiveDataDisplay.tickLength, 1);
                if (_ticks[i].label) {
                    _ticks[i].label.css("top", x - shift);
                    if (_mode == "left") 
                        _ticks[i].label.css("left", text_size - (this.rotateLabels ? ticksInfo[i].height : ticksInfo[i].width));
                }
            }
        }

        // get and draw minor ticks
        var smallTicks = _tickSource.getSmallTicks(_ticks);
        if (smallTicks.length > 0) {
            // check for enough space
            var l = Math.abs(that.getCoordinateFromTick(smallTicks[1]) - that.getCoordinateFromTick(smallTicks[0]));
            for (var k = 1; k < smallTicks.length - 1; k++) {
                l = Math.min(l, Math.abs(that.getCoordinateFromTick(smallTicks[k + 1]) - that.getCoordinateFromTick(smallTicks[k])));
            }

            if (l >= InteractiveDataDisplay.minTickSpace) {
                for (var i = 0, len = smallTicks.length; i < len; i++) {
                    x = that.getCoordinateFromTick(smallTicks[i]);
                    if (_mode == "bottom") ctx.fillRect(x, 1, 1, smallTickLength);
                    else if (_mode == "top") ctx.fillRect(x, InteractiveDataDisplay.tickLength - smallTickLength, 1, smallTickLength);
                    else if (_mode == "left") ctx.fillRect(InteractiveDataDisplay.tickLength - smallTickLength, (_size - 1) - x, smallTickLength, 1);
                    else if (_mode == "right") ctx.fillRect(1, (_size - 1) - x, smallTickLength, 1);
                }
            }
        }
    };
    
    this.renderToSvg = function (svg) {
        var path = "";
        var drawHLine = function(x,y,w) {
            path += "M" + x + " " + y + "h" + w; 
        };
        var drawVLine = function(x,y,h) {
            path += "M" + x + " " + y + "v" + h; 
        };

        var textShift;
        var baseline;
        // render base line
        if (isHorizontal) {
            baseline = _height-1;
            if (_mode == "bottom"){
                drawHLine(0,0,_size);
                textShift = InteractiveDataDisplay.tickLength - textOffset;
            } else { // top
                drawHLine(0, baseline, _size);
                textShift = -textOffset;
            }
        }
        else {
            baseline = _width-1;
            if (_mode == "right"){ 
                drawVLine(0, 0, _size);
                textShift = InteractiveDataDisplay.tickLength + textOffset;
            }
            else {
                drawVLine(baseline,0,_size);
                textShift = 0;
            }
        }      
        
        // render ticks and labels (if necessary)
        // if range is single point - render only label in the middle of axis
        var x, shift;
        var len = _ticks.length;
        var _fontSize, fontFamily;
        if(len > 0){
            var firstLabel = undefined;
            for (i = 0 ; i < _ticks.length; i++) {
                if (_ticks[i] && _ticks[i].label) {
                    firstLabel = _ticks[i].label[0];
                    break;
                }
            }
            var style = window.getComputedStyle(firstLabel, null);
            fontFamily = style ? style.getPropertyValue('font-family') : undefined;
            if(customFontSize){
                _fontSize = fontSize;
            }else{
                _fontSize = style ? parseFloat(style.getPropertyValue('font-size')): undefined; 
            }
        }
        for (var i = 0; i < len; i++) {
            x = ticksInfo[i].position;
            if (isHorizontal) { // horizontal (top and bottom)
                shift = ticksInfo[i].width / 2;
                if (minTicks) {
                    if (i == 0) shift *= 2;
                    else if (i == len - 1) shift = 0;
                }
                else {
                    if (i == 0 && x < shift) shift = 0;
                    else if (i == len - 1 && x + shift > _size) shift *= 2;
                }

                if (!_ticks[i].invisible) {
                    if(_mode == "top") drawVLine(x, baseline, -InteractiveDataDisplay.tickLength);
                    else drawVLine(x, 0, InteractiveDataDisplay.tickLength); // bottom long tick
                }
                
                if (_ticks[i].label)
                    var style = _ticks[i].label instanceof jQuery ? window.getComputedStyle(_ticks[i].label[0], null) : window.getComputedStyle(_ticks[i].label, null);
                    var transform = style ? style.getPropertyValue('transform') : undefined;
                    var b = transform ? transform.split(',')[1] : undefined;
                    var angle = b ? Math.round(Math.asin(b) * (180 / Math.PI)) : 0;
                    if (angle == 0 || !_rotateAngle) {
                        _tickSource.renderToSvg(_ticks[i], svg)
                          .translate(x - shift, textShift)
                          .font({
                              family: fontFamily,
                              size: _fontSize
                          });
                    } else if (_rotateAngle) {
                        if (_rotateAngle > 0) {
                            var text = _tickSource.renderToSvg(_ticks[i], svg)
                                .translate(x, textShift)
                                .rotate(angle, 0, 0)
                                .font({
                                    family: fontFamily,
                                    size: _fontSize
                                });
                        } else if (_rotateAngle < 0) {
                            var text = _tickSource.renderToSvg(_ticks[i], svg)
                            .translate(x - ticksInfo[i].width, textShift)
                            .rotate(angle, ticksInfo[i].width, 0)
                            .font({
                                family: fontFamily,
                                size: _fontSize
                            });
                        }
                    }
            }
            else { // vertical (left and right)
                x = (_size - 1) - x;
                shift = ticksInfo[i].height * 0.66;
                if (minTicks) {
                    if (i == 0) shift = 0;
                    else if (i == len - 1) shift *= 2;
                }
                else {
                    if (i == 0 && x + shift > _size) shift *= 2;
                    else if (i == len - 1 && x < shift) shift = 0;
                }

                if (!_ticks[i].invisible)
                    if(_mode == "left") drawHLine(baseline, x, -InteractiveDataDisplay.tickLength);
                    else drawHLine(0, x, InteractiveDataDisplay.tickLength);
                    
                if (_ticks[i].label) {
                    var leftShift = 0;                    
                    if (_mode == "left")
                        leftShift = text_size - (this.rotateLabels ? ticksInfo[i].height : ticksInfo[i].width) + textShift;
                    if (this.rotateLabels) {
                        _tickSource.renderToSvg(_ticks[i], svg)
                            .translate(leftShift - textShift - ticksInfo[i].height, x - shift)
                            .rotate(-90)
                            .font({
                                family: fontFamily,
                                size: _fontSize
                            });       
                    } else {
                        _tickSource.renderToSvg(_ticks[i], svg)
                            .translate(leftShift + textShift, x - shift)
                            .font({
                                family: fontFamily,
                                size: _fontSize
                            });
                    }
                }
            }
        }
        
        // get and draw minor ticks
        var smallTicks = _tickSource.getSmallTicks(_ticks);
        if (smallTicks.length > 0) {
            // check for enough space
            var l = Math.abs(that.getCoordinateFromTick(smallTicks[1]) - that.getCoordinateFromTick(smallTicks[0]));
            for (var k = 1; k < smallTicks.length - 1; k++) {
                l = Math.min(l, Math.abs(that.getCoordinateFromTick(smallTicks[k + 1]) - that.getCoordinateFromTick(smallTicks[k])));
            }

            if (l >= InteractiveDataDisplay.minTickSpace) {
                for (var i = 0, len = smallTicks.length; i < len; i++) {
                    x = that.getCoordinateFromTick(smallTicks[i]);
                    if (_mode == "bottom") drawVLine(x, 0, smallTickLength);
                    else if (_mode == "top") drawVLine(x, baseline, -smallTickLength);
                    else if (_mode == "left") drawHLine(baseline, _size - x, -smallTickLength);
                    else if (_mode == "right") drawHLine(0.5, _size - x, smallTickLength);
                }
            }
        } 
        svg.path(path).stroke(strokeStyle).fill('none');    
    };

    // append all new label divs to host and add class for them
    var addNewLabels = function (ticks) {
        var label;
        for (var i = 0, len = ticks.length; i < len; i++) {
            label = ticks[i].label;
            if (label && !label.hasClass('idd-axis-label')) {
                var labelDiv = label[0];
                labelsDiv[0].appendChild(labelDiv);
                label.addClass('idd-axis-label');
                label._size = { width: labelDiv.offsetWidth, height: labelDiv.offsetHeight };
                if(customFontSize){
                    label.css("fontSize", fontSize);
                }
            }
        }
    };

    // function to set new _range
    this.update = function (newPlotRange) {
        if (newPlotRange) _range = newPlotRange;
        render();
    };

    // clears host element
    this.destroy = function () {
        _host[0].innerHTML = "";
        _host.removeClass("idd-axis");
        _host.removeClass("unselectable");
    };

    // destroys axis and removes it from parent
    this.remove = function () {
        var parent1 = _host[0].parentElement;
        if (parent1) {
            parent1.removeChild(_host[0]);
            var parent2 = parent1.parentElement;
            if (parent2 && (parent2.className == "idd-plot-master" || parent2.classList && parent2.classList.contains("idd-plot-master"))) {
                parent2.plot.removeDiv(parent1);
            }
        }
        this.destroy();
    };

    if (div) {
        render();
        div.addClass("idd-axis");
        div.addClass("unselectable");
    }
}

// decimal axis
// supports custom data transform
InteractiveDataDisplay.NumericAxis = function (div) {
    this.base = InteractiveDataDisplay.TicksRenderer;
    div[0].axis = this;
    this.getCoordinateFromTick = function (x) {
        var delta = this.deltaRange;
        if (isFinite(delta)) {
            var coord = x;
            var transform = this.dataTransform;
            if (transform) {
                coord = transform.dataToPlot(x);
            }
            return (coord - this.range.min) * delta;
        }
        else return this.axisSize / 2;
    };

    this.base(div, new InteractiveDataDisplay.NumericTickSource());
}
InteractiveDataDisplay.NumericAxis.prototype = new InteractiveDataDisplay.TicksRenderer;

InteractiveDataDisplay.LogarithmicAxis = function (div) {
    this.base = InteractiveDataDisplay.TicksRenderer;

    this.getCoordinateFromTick = function (x) {
        var delta = this.deltaRange;
        if (isFinite(delta)) {
            var coord = InteractiveDataDisplay.Utils.log10(x);
            return (coord - this.range.min) * delta;
        }
        else return this.axisSize / 2;
    };

    this.base(div, new InteractiveDataDisplay.LogarithmicTickSource());
}
InteractiveDataDisplay.LogarithmicAxis.prototype = new InteractiveDataDisplay.TicksRenderer;

// axis with string labels (passed as array)
// supports data transform
InteractiveDataDisplay.LabelledAxis = function (div, params) {
    this.base = InteractiveDataDisplay.TicksRenderer;
    var that = this;

    this.getCoordinateFromTick = function (x) {
        var delta = this.deltaRange;
        if (isFinite(delta)) {
            var coord = x;
            if (this.dataTransform) {
                coord = this.dataTransform.dataToPlot(x);
            }
            return (coord - this.range.min) * delta;
        }
        else return this.axisSize / 2;
    };

    this.updateLabels = function (params) {
        this.tickSource = new InteractiveDataDisplay.LabelledTickSource(params);
        if (params && params.rotate)
            this.rotateLabels = true;
        this.rotateAngle = params && params.rotateAngle ? params.rotateAngle : 0;
    };

    if (params && params.rotate)
        this.rotateLabels = true;

    this.base(div, new InteractiveDataDisplay.LabelledTickSource(params));
    this.rotateAngle = params && params.rotateAngle ? params.rotateAngle : 0;

    return this;
}
InteractiveDataDisplay.LabelledAxis.prototype = new InteractiveDataDisplay.TicksRenderer;

// object that provides functions to calculate ticks by given range
InteractiveDataDisplay.TickSource = function () {

    var divPool = [];
    var isUsedPool = [];
    var inners = [];
    var styles = [];
    var len = 0;

    this.start;
    this.finish;

    // gets first available div (not used) or creates new one
    this.getDiv = function (x) {
        var inner = this.getInner(x);
        var i = inners.indexOf(inner);
        if (i != -1) {
            isUsedPool[i] = true;
            styles[i].display = "block";
            var div = divPool[i][0];
            divPool[i]._size = { width: div.offsetWidth, height: div.offsetHeight };
            return divPool[i];
        }
        else {
            var i = isUsedPool.indexOf(false);
            if (i != -1) {
                isUsedPool[i] = true;
                styles[i].display = "block";
                inners[i] = inner;
                var $div = divPool[i];
                if(typeof inner !== "string"){
                    $div.empty();
                    $div.append(inner);
                }else{
                    $div.text(inner);
                }
                var div = $div[0];
                $div._size = { width: div.offsetWidth, height: div.offsetHeight };
                return divPool[i];
            }
            else {
                var $div = $("<div></div>");
                if(typeof inner !== "string"){
                    $div.append(inner);
                }else{
                    $div.text(inner);
                }
                isUsedPool[len] = true;
                divPool[len] = $div;
                inners[len] = inner;
                styles[len] = $div[0].style;
                $div._size = undefined;
                len++;
                return $div;
            }
        }
    };

    // function to get div's innerText
    this.getInner = function (x) {
        if (x)
            return x.toString();
        return undefined;
    };

    this.invalidate = function() {
        for(var i = 0; i < divPool.length; i++){
            divPool[i].remove();
        }
        isUsedPool = [];
        divPool = [];
        inners = [];
        styles = [];
        len = 0;
    };

    // make all not used divs invisible (final step)
    this.refreshDivs = function () {
        for (var i = 0; i < len; i++) {
            if (isUsedPool[i]) isUsedPool[i] = false;
            else styles[i].display = "none";
        }
    };

    // calculates ticks for specific range (main and first function to call)
    this.getTicks = function (_range) {
        this.start = _range.min;
        this.finish = _range.max;
    };
    // function that decreases number of ticks and returns new array
    this.decreaseTickCount = function () {
    };
    // function that increases number of ticks and returns new array
    this.increaseTickCount = function () {
    };

    // rounds value (x) to specific number (n) of decimal digits
    this.round = function (x, n) {
        if (n <= 0) {
            if (-n > 15) return parseFloat(x.toFixed(15));
            return parseFloat(x.toFixed(-n));
        }
        else {
            var degree = Math.pow(10, n - 1);
            return Math.round(x / degree) * degree;
        }
    };
}

// tick source for decimal axis
InteractiveDataDisplay.NumericTickSource = function () {
    this.base = InteractiveDataDisplay.TickSource;
    this.base();

    var that = this;

    var delta, beta;

    this.getInner = function (x) {
        if (x == 0) return x.toString();
        else if (beta >= InteractiveDataDisplay.minNumOrder)
            return this.round(x / Math.pow(10, beta), -1) + "e+" + beta;
        return this.round(x, beta).toString();
    };

    this.getTicks = function (_range) {
        InteractiveDataDisplay.NumericTickSource.prototype.getTicks.call(this, _range);

        delta = 1;
        beta = Math.floor(InteractiveDataDisplay.Utils.log10(this.finish - this.start));

        return createTicks();
    };
    
    this.renderToSvg = function (tick, svg) {
        return svg.text(that.getInner(tick.position));
    }

    var createTicks = function () {
        var ticks = [];

        if (that.start > that.finish) return ticks;

        if (isFinite(beta)) {
            var step = delta * Math.pow(10, beta);

            // calculate count of ticks to create
            var min = Math.floor(that.start / step);
            var count = Math.floor(that.finish / step) - min + 2;

            // calculate rounded ticks values
            var l = 0;
            var x0 = min * step;
            var x;
            for (var i = 0; i < count; i++) {
                x = x0 + i * step;
                if (x >= that.start && x <= that.finish) {
                    ticks[l] = { position: x, label: that.getDiv(x) };
                    l++;
                }
            }
        }
        else {
            ticks[0] = { position: that.start, label: that.getDiv(that.start), invisible: true };
        }

        that.refreshDivs();

        return ticks;
    };

    this.decreaseTickCount = function () {
        if (delta == 1) {
            delta = 2;
        }
        else if (delta == 2) {
            delta = 5;
        }
        else if (delta == 5) {
            delta = 1;
            beta++;
        }
        return createTicks();
    };
    this.increaseTickCount = function () {
        if (delta == 1) {
            delta = 5;
            beta--;
        }
        else if (delta == 2) {
            delta = 1;
        }
        else if (delta == 5) {
            delta = 2;
        }
        return createTicks();
    };

    // constructs array of small ticks
    this.getSmallTicks = function (ticks) {
        var smallTicks = [];
        var l = 0;
        if (ticks.length > 1) {
            var x = ticks[0].position;
            var dx = Math.abs(ticks[1].position - x) / 10;
            x -= dx;
            while (x > this.start && l < 10) {
                smallTicks[l] = x;
                l++;
                x -= dx;
            }
            var length = ticks.length;
            for (var i = 0; i < length - 1; i++) {
                x = ticks[i].position + dx;
                for (var j = 0; j < 9; j++) {
                    smallTicks[l] = x;
                    l++;
                    x += dx;
                }
            }
            x = ticks[length - 1].position + dx;
            var k = 0;
            while (x < this.finish && k < 10) {
                smallTicks[l] = x;
                l++;
                x += dx;
                k++;
            }
        }
        return smallTicks;
    };

    this.getMinTicks = function () {
        var ticks = [];

        beta = Math.floor(InteractiveDataDisplay.Utils.log10(this.finish - this.start));

        if (isFinite(beta)) {
            var step = Math.pow(10, beta);

            var min = Math.floor(that.start / step) * step;
            if (min < that.start) min += step;
            var max = Math.floor(that.finish / step) * step;
            if (max > that.finish) max -= step;

            if (min != max) {
                ticks[0] = { position: min, label: that.getDiv(that.round(min, beta)) };
                ticks[1] = { position: max, label: that.getDiv(that.round(max, beta)) };
            }
            else {
                beta--;
                delta = 5;
                step = delta * Math.pow(10, beta);

                min = Math.floor(that.start / step);
                var count = Math.floor(that.finish / step) - min + 2;

                // calculate rounded ticks values
                var l = 0;
                var x0 = min * step;
                var x;
                for (var i = 0; i < count; i++) {
                    x = x0 + i * step;
                    if (x >= that.start && x <= that.finish) {
                        ticks[l] = { position: x, label: that.getDiv(that.round(x, beta)) };
                        l++;
                    }
                }
            }
        }
        else {
            ticks[0] = { position: that.start, label: that.getDiv(that.start), invisible: true };
        }

        this.refreshDivs();

        return ticks;
    };
}
InteractiveDataDisplay.NumericTickSource.prototype = new InteractiveDataDisplay.TickSource;

// tick source for logarithmic axis
InteractiveDataDisplay.LogarithmicTickSource = function () {
    this.base = InteractiveDataDisplay.TickSource;
    this.base();

    var that = this;

    var delta = 1;
    var deltaX = 10;
    var start, finish;

    // redefined function for innerText - if degree is less than specific constant then render full number otherwise render 10 with degree
    this.getInner = function (x) {
        if (Math.abs(x) < InteractiveDataDisplay.minLogOrder)
            return Math.pow(10, x).toString();
        else {
            var html = "10<sup>" + x + "</sup>";
            var element = document.createElement("span");
            element.innerHTML = html;
            return element;
        }
    };

    this.renderToSvg = function (tick, svg) {
        var inner = tick.position;
        return svg.text(inner.toString());
        // todo: render exponential form in a special graphic representation
    }

    this.getTicks = function (_range) {
        InteractiveDataDisplay.LogarithmicTickSource.prototype.getTicks.call(this, _range);
        start = Math.pow(10, this.start);
        finish = Math.pow(10, this.finish);
        return createTicks();
    };    

    var createTicks = function () {
        var ticks = [];
        if (isFinite(Math.pow(10, -that.start)) && isFinite(finish)) {
            if (start == finish) {
                ticks[0] = { position: that.start, label: that.getDiv(that.start), invisible: true };
            }
            else {
                var x0 = (that.start / delta) | 0;
                var count = ((that.finish / delta) | 0) - x0 + 3;

                var order = (x0 - 1) * delta;
                var x = Math.pow(10, order);
                var l = 0;
                for (var i = 0; i < count; i++) {
                    if (x >= start && x <= finish) {
                        ticks[l] = { position: x, label: that.getDiv(order) };
                        l++;
                    }
                    order += delta;
                    x *= deltaX;
                }
            }
        }
        that.refreshDivs();
        return ticks;
    };

    this.decreaseTickCount = function () {
        delta *= 2;
        deltaX = Math.pow(10, delta);
        return createTicks();
    };
    this.increaseTickCount = function () {
        if (delta > 1) {
            delta /= 2;
            deltaX = Math.pow(10, delta);
        }
        return createTicks();
    };

    // constructs array of small ticks
    this.getSmallTicks = function (ticks) {
        var smallTicks = [];
        var finite = isFinite(Math.pow(10, -that.start)) && isFinite(finish);
        var l = 0;
        if (ticks.length > 0 && delta == 1 && finite) {
            var x = ticks[0].position;
            var dx = x / 10;
            x -= dx;
            while (x > start && l < 10) {
                smallTicks[l] = x;
                l++;
                x -= dx;
            }
            var length = ticks.length;
            for (var i = 0; i < length - 1; i++) {
                x = ticks[i].position;
                dx = (ticks[i + 1].position - x) / 10;
                x += dx;
                for (var j = 0; j < 9; j++) {
                    smallTicks[l] = x;
                    l++;
                    x += dx;
                }
            }
            x = ticks[length - 1].position;
            dx = x;
            x += dx;
            while (x < finish) {
                smallTicks[l] = x;
                l++;
                x += dx;
            }
        }

        return smallTicks;
    };

    this.getMinTicks = function () {
        var ticks = [];

        var finite = isFinite(Math.pow(10, -that.start)) && isFinite(finish);
        if (!finite) {
            ticks[0] = { position: 1, label: that.getDiv(0) };
            this.refreshDivs();
        }
        else if (start == finish) {
            ticks[0] = { position: that.start, label: that.getDiv(that.start), invisible: true };
            this.refreshDivs();
        }

        return ticks;
    };
}
InteractiveDataDisplay.LogarithmicTickSource.prototype = new InteractiveDataDisplay.TickSource;

// tick source for labelled axis (labels as finite array of strings)
InteractiveDataDisplay.LabelledTickSource = function (params) {
    this.base = InteractiveDataDisplay.TickSource;
    this.base();

    var that = this;

    var _labels = [];
    var _ticks = [];

    // if labels and ticks are defined - cashe them
    // if ticks are undefined - they are calculated as an array of integers from 0 to length of labels
    if (params && params.labels) {
        var len = params.labels.length;
        for (var i = 0; i < len; i++)
            _labels[i] = params.labels[i].toString();

        if (!params.ticks) {
            for (var i = 0; i < len; i++)
                _ticks[i] = i;
        }
        else
            _ticks = params.ticks;
    }

    var step = 1;
    var min, max;
    var delta = _ticks.length - _labels.length;

    var rotateLabels = params && params.rotate ? params.rotate : false;
    var rotateAngle = params && params.rotateAngle ? params.rotateAngle : 0;

    this.renderToSvg = function (tick, svg) {
        var text = tick.text ? tick.text : "";
        return svg.text(text);
    }

    this.getTicks = function (_range) {
        InteractiveDataDisplay.LabelledTickSource.prototype.getTicks.call(this, _range);
        step = 1;
        if (delta <= 0) {
            var i1 = 0;
            var i2 = _ticks.length - 1;
            var value = (this.start) | 0;
            if (value > _ticks[i1]) {
                while (i2 - i1 > 1) {
                    var mid = Math.round((i1 + i2) / 2);
                    if (_ticks[mid] < value) i1 = mid;
                    else i2 = mid;
                }
            }
            min = i1;

            i1 = 0;
            i2 = _ticks.length - 1;
            value = (this.finish) | 0 + 1;
            if (value < _ticks[i2]) {
                while (i2 - i1 > 1) {
                    var mid = Math.round((i1 + i2) / 2);
                    if (_ticks[mid] < value) i1 = mid;
                    else i2 = mid;
                }
            }
            max = i2;

            if (max > min) {
                var tempStep = (_ticks.length - 1) / (max - min);
                while (step < tempStep) step *= 2;
            }
        }

        return createTicks();
    };

    var createTicks = function () {

        var ticks = [];

        // if length of labels and ticks are equal - render each label under specific tick
        if (delta <= 0) {

            var currStep = Math.floor((_ticks.length - 1) / step);

            if (currStep > _ticks.length - 1)
                currStep = _ticks.length - 1;
            else if (currStep < 1)
                currStep = 1;

            var m = 0;
            var value = (that.start) | 0;
            while (_ticks[m] < value) m += currStep;
            if (m - currStep >= 0 && _ticks[m] > value) m -= currStep;

            var count = (max - min + 1);

            var l = 0;
            for (var i = 0; i < count; i++) {
                value = _ticks[m];
                if (value >= that.start && value <= that.finish) {
                    var div = that.getDiv(_labels[m]);
                    if (rotateLabels) {
                        div.addClass('idd-verticalText');
                    }
                    ticks[l] = { position: value, label: div, text: _labels[m] };
                    l++;
                }
                m += currStep;
            }
        }

            // otherwise render label between two neighboring ticks
        else {
            var m1 = 0;
            while (_ticks[m1] < that.start) m1++;
            if (m1 > 0) m1--;

            var m2 = _ticks.length - 1;
            while (_ticks[m2] > that.finish) m2--;
            if (m2 < _ticks.length - 1) m2++;

            var count = m2 - m1 + 1;
            var l = 0;
            
            var value2 = _ticks[m1];

            for (var i = 0; i < count; i++) {
                value = value2;
                if (value >= that.start && value <= that.finish) {
                    ticks[l] = { position: value };
                    l++;
                }
                m1++;
                value2 = _ticks[m1];
                var scale = 1;
                if (step > 1) scale /= step;
                if (i != count - 1) {
                    var v = (Math.min(value2, that.finish) + Math.max(value, that.start)) / 2;
                    if (v >= that.start && v <= that.finish) {
                        var div = that.getDiv(_labels[m1 - 1]);
                        if (rotateLabels) {
                            div.addClass('idd-verticalText');
                            div.css("transform", "rotate(-90deg) scale(" + scale + ", " + scale + ")");
                        }
                        ticks[l] = { position: v, label: div, invisible: true, text: _labels[m1-1] };
                        l++;
                    }
                }
            }
        }
        that.refreshDivs();
        return ticks;
    };

    this.decreaseTickCount = function () {
        if (delta <= 0) step /= 2;
        else step++;
        return createTicks();
    };
    this.increaseTickCount = function () {
        if (delta <= 0) step *= 2;
        else step--;
        return createTicks();
    };
    
    this.updateTransform = function (result) {
        var ticks = createTicks();
        for (var i = 0; i < ticks.length; i++) {
            if (ticks[i].label) {
                var div = ticks[i].label;
                if (result == -1) {
                    div.css("-webkit-transform", 'rotate(' + rotateAngle + 'deg)');
                    div.css("-moz-transform", 'rotate(' + rotateAngle + 'deg)');
                    div.css("-ms-transform", 'rotate(' + rotateAngle + 'deg)');
                    div.css("-o-transform", 'rotate(' + rotateAngle + 'deg)');
                    div.css("transform", 'rotate(' + rotateAngle + 'deg)');
                    if (rotateAngle > 0) {
                        div.css("transform-origin", 'left top');
                        div.css("-webkit-transform-origin", 'left top');
                        div.css("-moz-transform-origin", 'left top');
                        div.css("-ms-transform-origin", 'left top');
                        div.css("-o-transform-origin", 'left top');
                    }
                    else {
                        div.css("transform-origin", 'right top');
                        div.css("-webkit-transform-origin", 'right top');
                        div.css("-moz-transform-origin", 'right top');
                        div.css("-ms-transform-origin", 'right top');
                        div.css("-o-transform-origin", 'right top');
                    }
                } else if (result == 1) {
                    div.css("-webkit-transform", '');
                    div.css("-moz-transform", '');
                    div.css("-ms-transform", '');
                    div.css("-o-transform", '');
                    div.css("transform", '');
                }
            }
        }
        return ticks;
    }

    // constructs array of small ticks
    this.getSmallTicks = function (ticks) {
        var smallTicks = [];

        if (delta <= 0) {
            var l = 0;
            var k = 0;
            for (var i = 0; i < _ticks.length; i++) {
                if (ticks.length > k && _ticks[i] == ticks[k].position) k++;
                else {
                    smallTicks[l] = _ticks[i];
                    l++;
                }
            }
        }

        return smallTicks;
    };

    this.getMinTicks = function () {
        var ticks = [];

        if (delta <= 0 && _labels.length == 0) {
            var div = that.getDiv(_labels[0]);
            if (rotateLabels) {
                div.addClass('idd-verticalText');
            }
            ticks[0] = { position: _ticks[0], label: div, text: _labels[0] };

            div = that.getDiv(_labels[_labels.length - 1]);
            if (rotateLabels) {
                div.addClass('idd-verticalText');
            }
            ticks[1] = { position: _ticks[_ticks.length - 1], label: div, text: _labels[_labels.length - 1] };
            that.refreshDivs();
        }
        return ticks;
    };
}
InteractiveDataDisplay.LabelledTickSource.prototype = new InteractiveDataDisplay.TickSource;

InteractiveDataDisplay.TicksRenderer.getAxisType = function (dataTransform) {
    if (dataTransform === undefined)
        return 'numeric';
    if (!dataTransform.type)
        return 'numeric';
    else if (dataTransform.type == 'log10')
        return 'log';
    else
        return 'numeric';
}
