InteractiveDataDisplay = InteractiveDataDisplay || {};

InteractiveDataDisplay.ColorPaletteEditor = function ($div, palette) {
    if($div.hasClass("idd-colorPaletteEditor")) return;

    $div.addClass("idd-colorPaletteEditor");
    $div[0].editor = this;

    var borderTemplate = "gray";
    var fillTemplate = "rgba(100,100,100,0.3)";

    var that = this;        
    var _palette = palette;
    Object.defineProperty(this, "palette", {
            get: function () { return _palette; },
            set: function (value) {
                _palette = value;
                paletteViewer.palette = _palette;
                updateMarkers();
            },
            configurable: false
    });
    var firePaletteChanged = function(newPalette){
        $div.trigger("paletteChanged", [ newPalette ]);
    }

    var isDraggingMarker = false;
    var isChoosingColor = false;
    
    var width = $div.width();
    var barHeight = 10;
    var paletteHeight = 20;    

    var $bar = 
        $("<div></div>")
        .height(barHeight)
        .width(width)
        .addClass("idd-colorPaletteEditor-bar")
        .appendTo($div);

    var $viewer = 
        $("<div></div>")
        .height(paletteHeight)
        .width(width)
        .addClass("idd-colorPaletteEditor-viewer")
        .appendTo($div);

    var options = {
        height : paletteHeight,
        axisVisible : false
    };
    var paletteViewer = new InteractiveDataDisplay.ColorPaletteViewer($viewer, _palette, options);
    var height = barHeight + $viewer.height();
    $div.height(height);

    var markers = [];

    var getCssColor = function(hsla){
        var rgba = InteractiveDataDisplay.ColorPalette.HSLtoRGB(hsla);
        return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
    }

     var getHexColor = function(hsla){
        var toHex = function(v) {
            var h = v.toString(16);
            while(h.length < 2)
                h = "0" + h;
            return h;
        }
        var rgba = InteractiveDataDisplay.ColorPalette.HSLtoRGB(hsla);
        var r = toHex(rgba.r);
        var g = toHex(rgba.g);
        var b = toHex(rgba.b);
        return "#" + r + g + b;
    }

    var renderMarker = function(ctx, left, top, borderColor, leftColor, rightColor){
        var sz = barHeight;        
        if(leftColor){
            ctx.fillStyle = leftColor;
            ctx.beginPath();
            ctx.moveTo(left, top);
            ctx.lineTo(left + sz/2, top);
            ctx.lineTo(left + sz/2, top + sz);
            ctx.fill();
        }
        if(rightColor){
            ctx.fillStyle = rightColor;
            ctx.beginPath();
            ctx.moveTo(left + sz/2, top);
            ctx.lineTo(left + sz, top);
            ctx.lineTo(left + sz/2, top + sz);
            ctx.fill();
        }
        // outline:
        ctx.strokeStyle = borderColor;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left + sz, top);
        ctx.lineTo(left + sz/2, top + sz);
        ctx.closePath();
        ctx.stroke();
    }

    var $canvasNew = 
        $("<canvas height='" + barHeight + "px'" + "width='" + width + "px' style='display: block'></canvas>")
        .css("position", "absolute")
        .appendTo($bar);
    var clearCanvasNew = function(){
        var ctx = $canvasNew[0].getContext("2d");
        ctx.clearRect(0, 0, width, barHeight);
    }

    var stopChoosingColor = function(){
        if(isChoosingColor){
            var $pickers = $(".idd-colorPaletteEditor-colorPicker", $bar);
            if($pickers.length > 0){
                var handler = $.data($pickers[0], "onClick");
                if(handler){
                    $(window).off("click", handler);
                }
                $(".idd-colorPaletteEditor-colorPicker", $bar).remove();
            }
            isChoosingColor = false;
        }
    }

    // Shows an element that allows to choose a color.
    // It is shown above the palette viewer.
    // Arguments:
    //  - xp: x-position relative to bars
    //  - hsla: initial color
    //  - onSelected: callback to set the chosen color
    var chooseColor = function(xp, hsla, onChosen){
        stopChoosingColor();
        isChoosingColor = true;

        var w = 60;
        var h = 20;

        var $colorPicker = 
            $("<div></div>")
            .addClass("idd-colorPaletteEditor-colorPicker")
            .css({ "position": "absolute", "left":  xp - w/2, "top": barHeight })            
            .appendTo($bar);

        $("<span>Color:</span>")
            .css("margin-right", 10)
            .appendTo($colorPicker);

        var $input = 
            $("<input type=color></input>")            
            .width(w)
            .height(h)
            .val(getHexColor(hsla))
            .change(function(){
                var color = $input.val();
                var rgba = InteractiveDataDisplay.ColorPalette.colorFromString(color);
                var hsla = InteractiveDataDisplay.ColorPalette.RGBtoHSL(rgba);
                onChosen(hsla);
                stopChoosingColor();
            })
            .appendTo($colorPicker);

        var onClick = function(e){
            var isOfColorPicker = 
                $(e.target).hasClass("idd-colorPaletteEditor-colorPicker") ||
                $colorPicker.has($(e.target)).length > 0;
            if(!isOfColorPicker){
                stopChoosingColor();
                e.stopPropagation();
            }
        }
        $(window).click(onClick);
        $.data($colorPicker[0], "onClick", onClick); // saves the handler to unsubscribe
    };

    // Computes position on the _palette range for the given marker element.
    var getMarkerX = function($marker) {
        var offset = $canvasNew.offset(); 
        var xp = $marker.offset().left + $marker.width()/2 - offset.left;
        var k = (_palette.range.max - _palette.range.min) / width;        
        var x = k * xp + _palette.range.min;
        return x;
    }

    var addMarker = function(point, leftX, rightX, isDraggable){
        var k = width / (_palette.range.max - _palette.range.min);
        var xp = k * (point.x - _palette.range.min);
        var lxp = k * (leftX - _palette.range.min);
        var rxp = k * (rightX - _palette.range.min);

        // Structure
        var sz = barHeight;
        var $marker = 
            $("<div style='position:absolute;'></div>")
            .addClass("idd-colorPaletteEditor-marker")
            .width(sz)
            .height(sz)
            .appendTo($bar);
        var $canvas = 
             $("<canvas height='" + sz + "px'" + "width='" + sz + "px' style='display: block'></canvas>")
            .appendTo($marker);
        $marker.css("left", xp - sz/2);

        if(isDraggable){
            var offset = $canvasNew.offset();
            var renderedAsRemoving = false;
            $marker.draggable({ 
                axis: "x", 
                containment: [ offset.left + lxp - sz/2, offset.top, offset.left + rxp - sz/2, offset.top + sz ],
                start: function(e){  // Starts dragging the marker
                    isDraggingMarker = true;
                    renderedAsRemoving = false;

                    stopChoosingColor();                    
                    clearCanvasNew();
                    var offset = $canvasNew.offset();
                    $(e.target).draggable("option", "containment",
                        [ offset.left + lxp - sz/2, offset.top, offset.left + rxp - sz/2, offset.top + sz ]);
                }, 
                drag: function(e){ // Dragging the marker
                    var parentOffset = $div.offset(); 
                    var cursorY = e.pageY - parentOffset.top;
                    if(cursorY < 0 || cursorY > height) { // cursor is above or below the bar panel ==> remove?
                        if(!renderedAsRemoving){
                            var ctx = $canvas[0].getContext("2d");
                            ctx.clearRect(0, 0, sz, sz);
                            renderMarker(ctx, 0, 0, borderTemplate, fillTemplate, fillTemplate);
                            renderedAsRemoving = true;
                        }
                    }else if(renderedAsRemoving) {
                        var ctx = $canvas[0].getContext("2d");
                        ctx.clearRect(0, 0, sz, sz);
                        renderMarker(ctx, 0, 0,
                            'black', 
                            point.leftColor && getCssColor(point.leftColor),
                            point.rightColor && getCssColor(point.rightColor));
                        renderedAsRemoving = false;
                    }
                },
                stop: function(e){ // Dragging stopped and we move the marker to new position                    
                    isDraggingMarker = false;
                    
                    var parentOffset = $div.offset(); 
                    var cursorY = e.pageY - parentOffset.top;

                    if(cursorY < 0 || cursorY > height) { // cursor is above or below the bar panel ==> remove
                        for(var i = 0; i < _palette.points.length; i++){
                            if(_palette.points[i].x == point.x){
                                _palette.points.splice(i, 1); // <-- remove the palette point
                                firePaletteChanged(_palette);
                                paletteViewer.palette = _palette;
                                break;
                            }
                        }
                    } else { // new position for the marker
                        var x = getMarkerX($marker)
                        if(x > _palette.range.min && x < _palette.range.max){
                            point.x = x;           // <-- new palette point                            
                            firePaletteChanged(_palette);  
                            paletteViewer.palette = _palette;
                        }
                    }                                        
                    updateMarkers();                    
                }
            });
        }

        $marker.click(function(e){ // <-- prompts a user to choose new color for the marker
            chooseColor(xp, point.rightColor ? point.rightColor : point.leftColor, 
                function(hsla) {  // <-- new color is chosen for the marker
                    if(point.leftColor) point.leftColor = hsla;
                    if(point.rightColor) point.rightColor = hsla;
                    paletteViewer.palette = _palette;
                    firePaletteChanged(_palette);
                    updateMarkers();
                });
            e.stopPropagation();
        });

        // Render   
        var ctx = $canvas[0].getContext("2d");
        renderMarker(ctx, 0, 0,
            'black', 
            point.leftColor && getCssColor(point.leftColor),
            point.rightColor && getCssColor(point.rightColor));
    }; // end of `addMarker`

    // Refreshes UI markers to correspond the `_palette`.
    var updateMarkers = function(){
        isDraggingMarker = false;
        stopChoosingColor();
        
        var $markers = $(".idd-colorPaletteEditor-marker", $bar);
        $markers.filter(".ui-draggable").each(function(){
            $(this).draggable("destroy");            
        });
        $markers.remove();

        // leftmost and rightmost markers are added separatly before others to have the lowes Z-index
        if(_palette.points.length>0) { 
            var leftX = _palette.range.min
            var rightX = _palette.points[1].x
            addMarker(_palette.points[0], leftX, rightX,false);
        }
        if(_palette.points.length>1) {
            var leftX = _palette.points[_palette.points.length-2].x;
            var rightX = _palette.range.max
            addMarker(_palette.points[_palette.points.length-1], leftX, rightX,false);
        }

        // now adding all the others
        for(var i = 1; i < _palette.points.length-1; i++){
            var leftX = _palette.points[i-1].x;
            var rightX =  _palette.points[i+1].x;
            addMarker(_palette.points[i], leftX, rightX, true);
        }
    }

    var addPalettePoint = function(p) { // <-- adds new palette point
        var points = _palette.points;
        if(points[0].x >= p.x || points[points.length-1].x <= p.x) return;
        var points2;
        for(var i = 1; i < points.length; i++){
            if(p.x == points[i].x) return;
            if(p.x < points[i].x){
                points2 = points.slice();
                points2.splice(i, 0, p);
                break;
            }
        }
        _palette = new InteractiveDataDisplay.ColorPalette(_palette.isNormalized, _palette.range, points2);
        paletteViewer.palette = _palette;
        firePaletteChanged(_palette);
        updateMarkers();
    }
    
    $canvasNew.mousemove(function(e){ // <-- draw a marker placeholder to indicate that it can be added here
        if(isDraggingMarker || isChoosingColor) return;

        var parentOffset = $canvasNew.offset(); 
        var relX = e.pageX - parentOffset.left;
        
        var ctx = $canvasNew[0].getContext("2d");
        ctx.clearRect(0, 0, width, barHeight);
        renderMarker(ctx, relX-barHeight/2, 0, borderTemplate, fillTemplate, fillTemplate);
    });
    $canvasNew.mouseleave(function(){
        clearCanvasNew();
    });
    $canvasNew.click(function(e){  // <-- user clicked to add new marker
        if(isDraggingMarker || isChoosingColor) return;

        var parentOffset = $canvasNew.offset(); 
        var relX = e.pageX - parentOffset.left;
        var k = (_palette.range.max - _palette.range.min) / width;
        
        var x = k * relX + _palette.range.min;
        var c = _palette.getHsla(x);
        var p = {
            x: x,
            leftColor: c,
            rightColor: c
        };
        addPalettePoint(p);
    });

    updateMarkers();
}