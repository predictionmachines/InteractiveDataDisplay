InteractiveDataDisplay.MaxMarkersPerAnimationFrame = 3000;

InteractiveDataDisplay.Markers = function (div, master) {
    var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv);
    var initialData = initializer(div);

    this.base = InteractiveDataDisplay.CanvasPlot;
    this.base(div, master);
    if (!div) return;

    var _originalData = {};
    var _shape = undefined;
    var _data = {};
    var _renderData = {};
    var _markerPushpins = undefined;
    var _pushpinsVisible = false;
    
    var that = this;

    var destroyPushpins = function() {
        if (that.mapControl == undefined || _markerPushpins == undefined) return;
        _markerPushpins.forEach(function (pp) {
            var index = that.mapControl.entities.indexOf(pp);
            if (index >= 0)
                that.mapControl.entities.removeAt(index);
        });
        _markerPushpins = undefined;
    };

    var createPushpins = function() {
        if(typeof _data.x == "undefined" || typeof _data.y == "undefined") return;
        var x = _data.x;
        var y = _data.y;
        if(InteractiveDataDisplay.Utils.isArray(x) && InteractiveDataDisplay.Utils.isArray(y)){
            var n = Math.min(x.length, y.length);
            if (n <= InteractiveDataDisplay.MaxMarkersPerAnimationFrame) {
                _markerPushpins = new Array(n);
                for (var i = 0; i < n; i++) {
                    var newPushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(y[i], x[i]),
                        {
                            visible: false,
                            htmlContent: '<div style="background-color: white; opacity: 0.5; width: 10px; height: 10px"></div>',
                            anchor: new Microsoft.Maps.Point(5, 5)
                        });
                    _markerPushpins[i] = newPushpin;
                    that.mapControl.entities.push(newPushpin); 
                }
            }   
        }
    }
        
    var prepareDataRow = function(data) {
        var arrays = {};
        var scalars = {};
        var n = -1;
        for (var prop in data) {
            var vals = data[prop];
            if(InteractiveDataDisplay.Utils.isArray(vals)){
                if(vals.length < n || n === -1) n = vals.length;
                arrays[prop] = vals;
            } else {
                scalars[prop] = vals;
    }
        }
        return { arrays: arrays, scalars: scalars, length: n === -1 ? 0 : n };
    }

    // Draws the data as markers.
    this.draw = function (data, titles) {
        if(data == undefined || data == null) throw "The argument 'data' is undefined or null";
        _originalData = data;

        // Determines shape object for the data:        
        var shape;
        if(typeof data.shape === "undefined" || data.shape == null) 
            shape = InteractiveDataDisplay.Markers.shapes["box"];
        else if(typeof data.shape === "string") {
            shape = InteractiveDataDisplay.Markers.shapes[data.shape];
            if(shape == undefined) throw "The given marker shape is unknown";
        }else if(typeof data.shape === "object" && data.shape != null && typeof data.shape.draw === "function") {
            shape = data.shape;
        }
        else throw "The argument 'data' is incorrect: value of the property 'shape' must be a string, a MarkerShape object, undefined or null";
        _shape = shape;
                
        // Copying data and combining with initial data and styles read from HTML
        var dataFull = {};
        for(var prop in data){
            if(data[prop] != undefined){
                dataFull[prop] = data[prop];
            }else if(initialData[prop] != undefined){
                dataFull[prop] = initialData[prop];
        }
        }
        
        // Preparing data specifically for the given marker shape
        if(shape.prepare != undefined)
            shape.prepare(dataFull);
        
        destroyPushpins();
        _data = dataFull;       
        _renderData = {};        

        this.invalidateLocalBounds();
        this.requestNextFrameOrUpdate();
        this.setTitles(titles, true);
        this.fireAppearanceChanged();
    };

    // Returns a rectangle in the plot plane.
    this.computeLocalBounds = function (step, computedBounds) {
        var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
        var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
        
        if (_shape && typeof _shape.getBoundingBox !== "undefined" && _data) {
            var pattern = prepareDataRow(_data);
            var n = pattern.length;
            var arrays = pattern.arrays;
            var row = pattern.scalars;
            
            var found = [];           
            var total_bb = undefined;
            for(var i = 0; i < n; i++){
                for(var prop in arrays) row[prop] = arrays[prop][i];
                var bb = _shape.getBoundingBox(row);
                total_bb = InteractiveDataDisplay.Utils.unionRects (total_bb, bb);
            }
            if(dataToPlotX){
                var l = dataToPlotX(total_bb.x);
                var r = dataToPlotX(total_bb.x + total_bb.width);
                total_bb.x = l;
                total_bb.width = r - l;
            }
            if(dataToPlotY){
                var b = dataToPlotX(total_bb.y);
                var t = dataToPlotX(total_bb.y + total_bb.height);
                total_bb.y = b;
                total_bb.height = t - b;
            }
            return total_bb;
        } else if(typeof _data.x != "undefined" && typeof _data.y != "undefined") {
        return InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_data.x, _data.y, dataToPlotX, dataToPlotY);
    }
        return undefined;
    };

    // Returns 4 margins in the screen coordinate system
    this.getLocalPadding = function () {
        if (_shape && typeof _shape.getPadding !== "undefined") 
            return _shape.getPadding(_data);
        var padding = 0;
        return { left: padding, right: padding, top: padding, bottom: padding };
    };
    
    this.renderCore = function (plotRect, screenSize) {
        InteractiveDataDisplay.Markers.prototype.renderCore.call(this, plotRect, screenSize);
        if(_shape == undefined) return;

        var dt = this.getTransform();
        var drawBasic = !that.master.isInAnimation || that.master.mapControl === undefined;

        if (that.mapControl !== undefined) {
            if (_markerPushpins === undefined) createPushpins();
            if (_markerPushpins !== undefined){
                if (that.master.isInAnimation && !_pushpinsVisible) {
                    _markerPushpins.forEach(function (pp) { pp.setOptions({ visible: true }); });
                    _pushpinsVisible = true;
                }
                else if (!that.master.isInAnimation && _pushpinsVisible) {
                    _markerPushpins.forEach(function (pp) { pp.setOptions({ visible: false }); });
                    _pushpinsVisible = false;
                }
            }
        }

        if (drawBasic) {
            var context = this.getContext(true);
            _renderData = _data;
            if (typeof _shape.preRender != "undefined")
                _renderData = _shape.preRender(_data, plotRect, screenSize, dt, context);
            var pattern = prepareDataRow(_renderData);
            var n = pattern.length;
            var arrays = pattern.arrays;
            var row = pattern.scalars;
            for(var i = 0; i < n; i++){
                for(var prop in arrays) row[prop] = arrays[prop][i];
                _shape.draw(row, plotRect, screenSize, dt, context, i);
            }
            }
    };

    this.findToolTipMarkers = function (xd, yd, xp, yp) {
        if(_shape == undefined || typeof _shape.hitTest == "undefined" || _renderData == undefined) return [];
        var t = this.getTransform();
        var ps = { x: t.dataToScreenX(xd), y: t.dataToScreenY(yd) };
                var pd = { x: xd, y: yd };

        var pattern = prepareDataRow(_renderData);
        var n = pattern.length;
        var arrays = pattern.arrays;
        var row = pattern.scalars;
                                        
        var found = [];           
        for(var i = 0; i < n; i++){
            for(var prop in arrays) row[prop] = arrays[prop][i];
            if(_shape.hitTest(row, t, ps, pd) && typeof row.indices == "number"){
                // todo: this is a shape-dependent code; needs factorization or a rule of using `indices` property
                var j = row.indices;
                var dataRow = {};
                // makes slice of the original data row
                for (var prop in _originalData) {
                    var vals = _originalData[prop];
                    if(InteractiveDataDisplay.Utils.isArray(vals) && j < vals.length){
                        dataRow[prop] = vals[j];
                    } // scalars do not go to the tooltip since they are identical for all markers
                }
                dataRow["index"] = j;
                found.push(dataRow);
            }
        }
        return found;
    };

    // Builds a tooltip <div> for a point
    this.getTooltip = function (xd, yd, xp, yp) {
        var that = this;
        var resultMarkers = that.findToolTipMarkers(xd, yd, xp, yp);
        var buildTooltip = function (markerInfo) {
            var content = undefined;
            for (var prop in markerInfo) {
                if (markerInfo.hasOwnProperty(prop)) {
                    var propTitle = that.getTitle(prop);
                    if (content)
                        content += "<br/><b>" + propTitle + "</b>: " + markerInfo[prop];
                    else
                        content = "<b>" + propTitle + "</b>: " + markerInfo[prop];
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

    this.getLegend = function () {
        var div = $("<div class='idd-legend-item'></div>");
        var buildLegend = function() {
            div.empty();
            var nameDiv = $("<div></div>").appendTo(div);    
            if(_shape && typeof _shape.getLegend != "undefined") {                
                var legend = _shape.getLegend(_data, that.getTitle);
                if(legend){ 
                    legend.thumbnail.appendTo(nameDiv).css("display", "inline-block");
                    legend.content.appendTo(div);                
                }
                }
            $("<span class='idd-legend-item-title'></span>").appendTo(nameDiv).text(that.name);
            }
        this.host.bind("appearanceChanged", buildLegend);  
        buildLegend();
        var onLegendRemove = function () {
            that.host.unbind("appearanceChanged", buildLegend);
            div.empty();
            div.removeClass("idd-legend-item");
        };
        return { div: div, onLegendRemove: onLegendRemove };        
    };

    // Others
    this.onDataTransformChanged = function (arg) {
        this.invalidateLocalBounds();
        InteractiveDataDisplay.Markers.prototype.onDataTransformChanged.call(this, arg);
    };

    // Initialization 
    if (initialData && typeof initialData.y != 'undefined')
        this.draw(initialData);
};

InteractiveDataDisplay.Markers.prototype = new InteractiveDataDisplay.CanvasPlot;

InteractiveDataDisplay.Markers.defaults = {
    color : "#4169ed",
    colorPalette : InteractiveDataDisplay.palettes.grayscale,
    border : "#000000",
    size : 10
    }

InteractiveDataDisplay.Markers.shapes = InteractiveDataDisplay.Markers.shapes || {};