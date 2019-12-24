
//extending basic events
InteractiveDataDisplay.Event = InteractiveDataDisplay.Event || {};
InteractiveDataDisplay.Event.widthScaleChanged = jQuery.Event("widthScaleChanged");
    

InteractiveDataDisplay.Navigation = function (_plot, _setVisibleRegion) {
    var plot = _plot;
    var that = this;

    plot.master.host.on('visibleRectChanged', function(arg) {
        var screenWidth = plot.screenSize.width;
        var screenHeight = plot.screenSize.width;            
            
        ct = plot.coordinateTransform;
        vis = ct.getPlotRect({ x: 0, y: 0, width: screenWidth, height: screenHeight });

        var scaleToReport = screenWidth/vis.width;
        //console.log('navigation: plot x='+vis.x+' y='+vis.y+' w='+vis.width+' h='+vis.height);
        // console.log('firing scale changed to:'+scaleToReport);
        plot.master.host.trigger(InteractiveDataDisplay.Event.widthScaleChanged, {'widthScale':scaleToReport});
    });        
    

    var getVisible = function () {
        var size = plot.screenSize;
        var ct = plot.coordinateTransform;
        var vis = ct.getPlotRect({ x: 0, y: 0, width: size.width, height: size.height });

        return { plotRect: vis, screenSize: size, cs: ct };
    }

    /** Calls externally set function that implements needed side effects. */     
    var setVisibleRegion = function(plotRect,settings){        
        _setVisibleRegion(plotRect,settings);                
    }

    var stream = undefined;
    var unsubscriber = undefined;

    var _animation = undefined;

    var prevCalcedPlotRect = undefined;

    Object.defineProperty(this, "animation", {
        get: function () { return _animation; },
        set: function (value) {
            that.stop();
            _animation = value;
        },
        configurable: false 
    });

    /** Calculates panned plotRect */
    var panPlotRect = InteractiveDataDisplay.NavigationUtils.calcPannedRect;

    /** Calculates zoomed plotRect */
    var zoomPlotRect = InteractiveDataDisplay.NavigationUtils.calcZoomedRect;    

    //How many screen units in one plot unit of width (units: screen pts/plot pts)
    Object.defineProperty(this, "widthScale", {
        get: function () {
            var scale = plot.coordinateTransform.getScale();
            return scale.x;
         },
        set: function (value) {
            that.stop();
            var visRect = plot.visibleRect;
            var screenWidth = plot.screenSize.width;
            var plotAspectRatio = visRect.width/visRect.height;
            var center = {x: visRect.x + visRect.width*0.5, y: visRect.y + visRect.height*0.5};
            var newPlotRectWidth = screenWidth / value;
            var newPlotRectHeight = newPlotRectWidth / plotAspectRatio;
            var newPlotRect = {x: center.x - newPlotRectWidth*0.5, y: center.y - newPlotRectHeight*0.5, width: newPlotRectWidth, height: newPlotRectHeight};            
            that.setVisibleRect(newPlotRect,false,{'suppressScaleChangeNotification': true});            
        },
        configurable: false 
    });
    
    var subscribeToAnimation = function () {
        if (_animation) {
            return _animation.currentObservable.subscribe(function (args) {
                if (args.isLast) {
                    plot.isInAnimation = false;
                    // I wanted to trigger scaleChanged (special key in settings object) only for the last update
                    // but the experience looks buggy, thus
                    // triggering on every animation update
                }
                var settings = { syncUpdate: args.syncUpdate };
                setVisibleRegion(args.plotRect, settings);
            }, function (err) {
            }, function () {
            }
            );
        }
    };
    
    // Changes the visible rectangle of the plot.
    // visible is { x, y, width, height } in the plot plane, (x,y) is the left-bottom corner
    // if animate is true, uses elliptical zoom animation
    this.setVisibleRect = function (visible, animate, settings) {
        that.stop();
        prevCalcedPlotRect = visible;
        if (animate) {
            if (!that.animation.isInAnimation) {
                subscribeToAnimation();
            }

            plot.isInAnimation = true;
            that.animation.animate(getVisible, visible); 
        }
        else {
            var coercedVisible = visible;
            if (that.animation && that.animation.constraint) {
                coercedVisible = that.animation.constraint(coercedVisible);
            }

            if(!settings) settings = { fromSetVisibleRect: true };
            setVisibleRegion(coercedVisible, settings);
        }        
    };

    var processGesture = function (gesture) {

        var size = plot.screenSize;
        var ct;
        var vis;

        var prevEstimatedRect = that.animation !== undefined ? that.animation.previousEstimatedPlotRect : prevCalcedPlotRect;

        if (prevEstimatedRect !== undefined) {
            ct = InteractiveDataDisplay.Utils.calcCSWithPadding(prevEstimatedRect, { width: size.width, height: size.height }, { left: 0, top: 0, bottom: 0, right: 0 }, plot.aspectRatio);
            vis = prevEstimatedRect;
        }
        else {
            ct = plot.coordinateTransform;
            vis = ct.getPlotRect({ x: 0, y: 0, width: size.width, height: size.height });
        }

        if (gesture.Type == "Pin") {
            if (that.animation && that.animation.isInAnimation) {
                that.stop();
            }
            return;
        }
        
        var newPlotRect = undefined;
        if (gesture.Type == "Pan") {
            newPlotRect = panPlotRect(vis, size, gesture);
            prevCalcedPlotRect = newPlotRect
        } else if (gesture.Type == "Zoom") {
            newPlotRect = zoomPlotRect(vis, ct, gesture);

            if (newPlotRect.width < 1e-9) {
                newPlotRect.width = vis.width;
                newPlotRect.x = vis.x;
            }

            if (newPlotRect.height < 1e-9) {
                newPlotRect.height = vis.height;
                newPlotRect.y = vis.y;
            }

            prevCalcedPlotRect = newPlotRect;            
        }

        if (newPlotRect) {
            if (that.animation) {

                var firstFrame = !that.animation.isInAnimation;
                if (firstFrame) {
                    subscribeToAnimation();
                }

                plot.isInAnimation = true;
                that.animation.animate(getVisible, newPlotRect, { gestureType: gesture.Type, isFirstFrame: firstFrame });
            } else {
                setVisibleRegion(newPlotRect);                
            }
        }
    };

    this.stop = function () {
        plot.isInAnimation = false;
        prevCalcedPlotRect = undefined;
        if (that.animation) {
            that.animation.stop();
        }
    };

    Object.defineProperty(this, "gestureSource", {
        get: function () { return stream; },
        set: function (value) {
            if (stream == value) return;

            if (unsubscriber) {
                unsubscriber.dispose();
            }

            stream = value;

            if (stream !== undefined) {
                unsubscriber = stream.subscribe(function (gesture) {
                    processGesture(gesture);
                });
            }
        },
        configurable: false
    });

    that.animation = new InteractiveDataDisplay.PanZoomAnimation();
};


InteractiveDataDisplay.NavigationUtils = {};

// Suppress default multitouch for web pages to enable special handling of multitouch in InteractiveDataDisplay.
// Suitable for iPad, Mac.
// For Windows 8, idd.css contains special css property for this effect.
InteractiveDataDisplay.NavigationUtils.SuppressDefaultMultitouch = function () {
    if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
        // Suppress the default iOS elastic pan/zoom actions.
        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    }
    if (navigator.userAgent.indexOf('Mac') != -1) {
        // Disable Mac OS Scrolling Bounce Effect
        var body = document.getElementsByTagName('body')[0];
        body.style.overflow = "hidden";
    }
};

InteractiveDataDisplay.NavigationUtils.calcPannedRect = function (plotRect, screenSize, panGesture) {
    var scale = { x: plotRect.width / screenSize.width, y: plotRect.height / screenSize.height };
    var panX = panGesture.xOffset * scale.x;
    var panY = -panGesture.yOffset * scale.y;
    return { x: plotRect.x - panX, y: plotRect.y - panY, width: plotRect.width, height: plotRect.height };
};

InteractiveDataDisplay.NavigationUtils.calcZoomedRect = function (plotRect, coordinateTransform, zoomGesture) {
    //console.log("zoom origin: " + zoomGesture.xOrigin + ", " + zoomGesture.yOrigin);
    //console.log("zoom origin plot: " + coordinateTransform.screenToPlotX(zoomGesture.xOrigin) + ", " + coordinateTransform.screenToPlotY(zoomGesture.yOrigin));

    var scale = coordinateTransform.getScale();

    var screenCenterX = coordinateTransform.plotToScreenX(plotRect.x + plotRect.width / 2);
    var screenCenterY = coordinateTransform.plotToScreenY(plotRect.y + plotRect.height / 2);

    var panOffsetX = zoomGesture.preventHorizontal ? 0 : zoomGesture.xOrigin - screenCenterX;
    var panOffsetY = zoomGesture.preventVertical ? 0 : zoomGesture.yOrigin - screenCenterY;

    var pannedRect = { x: plotRect.x + panOffsetX / scale.x, y: plotRect.y - panOffsetY / scale.y, width: plotRect.width, height: plotRect.height };

    var newWidth = plotRect.width * (zoomGesture.preventHorizontal ? 1 : zoomGesture.scaleFactor);
    var newHeight = plotRect.height * (zoomGesture.preventVertical ? 1 : zoomGesture.scaleFactor);
    var newX = pannedRect.x + pannedRect.width / 2 - newWidth / 2;
    var newY = pannedRect.y + pannedRect.height / 2 - newHeight / 2;

    return { x: newX - zoomGesture.scaleFactor * panOffsetX / scale.x, y: newY + zoomGesture.scaleFactor * panOffsetY / scale.y, width: newWidth, height: newHeight, zoomOrigin: { x: coordinateTransform.screenToPlotX(zoomGesture.xOrigin), y: coordinateTransform.screenToPlotY(zoomGesture.yOrigin) } };
}

