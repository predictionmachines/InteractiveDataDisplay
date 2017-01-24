InteractiveDataDisplay.Navigation = function (_plot, _setVisibleRegion) {
    var plot = _plot;
    var that = this;

    var setVisibleRegion = _setVisibleRegion;

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

    //Calculates panned plotRect
    var panPlotRect = InteractiveDataDisplay.NavigationUtils.calcPannedRect;

    //Calculates zoomed plotRect
    var zoomPlotRect = InteractiveDataDisplay.NavigationUtils.calcZoomedRect;

    var getVisible = function () {
        var size = plot.screenSize;
        var ct = plot.coordinateTransform;
        var vis = ct.getPlotRect({ x: 0, y: 0, width: size.width, height: size.height });

        return { plotRect: vis, screenSize: size, cs: ct };
    }

    var subscribeToAnimation = function () {
        if (_animation) {
            return _animation.currentObservable.subscribe(function (args) {
                if (args.isLast) {
                    plot.isInAnimation = false;
                }
                setVisibleRegion(args.plotRect, { syncUpdate: args.syncUpdate });
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
            var coercedVisisble = visible;
            if (that.animation && that.animation.constraint) {
                coercedVisisble = that.animation.constraint(coercedVisisble);
            }

            setVisibleRegion(coercedVisisble, settings);
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

