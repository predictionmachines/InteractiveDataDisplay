InteractiveDataDisplay.Utils.getPlotRectForMap = function (map, screenSize) {
    var maxLat = 85.05112878;

    var _screenSize = screenSize === undefined ? { width: map.getWidth(), height: map.getHeight() } : screenSize;
    var mapCenter = map.getCenter();

    var w_s = _screenSize.width;
    var h_s = _screenSize.height;

    var deltaLon = 30;
    var firstPoint = map.tryLocationToPixel({ latitude: 0, longitude: mapCenter.longitude }, Microsoft.Maps.PixelReference.control);
    var secondPoint = map.tryLocationToPixel({ latitude: 0, longitude: mapCenter.longitude + deltaLon }, Microsoft.Maps.PixelReference.control);
    var pixelDelta = secondPoint.x - firstPoint.x;

    if (pixelDelta < 0)
        pixelDelta = firstPoint.x - map.tryLocationToPixel({ latitude: 0, longitude: mapCenter.longitude - deltaLon }, Microsoft.Maps.PixelReference.control).x;

    var periodDelta = pixelDelta / deltaLon;
    var leftCoordinate = mapCenter.longitude - firstPoint.x / periodDelta;
    var rightCoordinate = mapCenter.longitude + (w_s - firstPoint.x) / periodDelta;

    var bounds = map.getBounds();
    var topCoordinate = bounds.getNorth();
    var bottomCoordinate = bounds.getSouth();

    var topPixelDelta = 0;
    if (topCoordinate >= maxLat) {
        topCoordinate = maxLat
        var topPixel = map.tryLocationToPixel({ latitude: topCoordinate, longitude: mapCenter.longitude }, Microsoft.Maps.PixelReference.control);
        topPixelDelta = topPixel.y;
    }

    var bottomPixelDelta = 0;
    if (bottomCoordinate <= -maxLat) {
        bottomCoordinate = -maxLat;
        var bottomPixel = map.tryLocationToPixel({ latitude: bottomCoordinate, longitude: mapCenter.longitude }, Microsoft.Maps.PixelReference.control);
        bottomPixelDelta = h_s - bottomPixel.y
    }

    var width = rightCoordinate - leftCoordinate;
    if (width < 0)
        width = bounds.width;

    var newPlotRect = { y: bottomCoordinate, x: leftCoordinate, width: width, height: topCoordinate - bottomCoordinate };

    var yBottomPlot = InteractiveDataDisplay.mercatorTransform.dataToPlot(newPlotRect.y);
    var yTopPlot = InteractiveDataDisplay.mercatorTransform.dataToPlot(newPlotRect.y + newPlotRect.height);
    newPlotRect.y = yBottomPlot;
    newPlotRect.height = yTopPlot - yBottomPlot;

    if (bottomPixelDelta != 0 || topPixelDelta != 0) {
        var realH = h_s - topPixelDelta - bottomPixelDelta;
        var scale = newPlotRect.height / realH;
        var bottomOffset = bottomPixelDelta * scale;
        var topOffset = topPixelDelta * scale;
        var newBottom = newPlotRect.y - bottomOffset;
        var newTop = newPlotRect.y + newPlotRect.height + topOffset;
        newPlotRect.y = newBottom;
        newPlotRect.height = newTop - newBottom;
    }

    return newPlotRect;
};

InteractiveDataDisplay.BingMapsAnimation = function (map) {
    this.base = InteractiveDataDisplay.AnimationBase;
    this.base();

    var that = this;
    var _map = map;

    //PanZoom animation variables
    var startPlotRect = undefined;
    var estimatedPlotRect = undefined;

    var prevTime = new Date();
    var prevFramePlotRect = undefined;
    var prevEstimatedPlotRect = undefined;
    var direction = undefined;
    var pathLength = 0;

    var animationHandle = undefined;
    var velocity = undefined;

    var deltaWidth = 0;
    var deltaHeight = 0;

    var isInnerBMAnimationUsed = false;

    Object.defineProperty(this, "previousEstimatedPlotRect", {
        get: function () { return prevEstimatedPlotRect; },
        configurable: false
    });


    var getMerkatorPlotRect = function (plotRect) {
        var yBottomPlot = InteractiveDataDisplay.mercatorTransform.dataToPlot(plotRect.y);
        var yTopPlot = InteractiveDataDisplay.mercatorTransform.dataToPlot(plotRect.y + plotRect.height);

        return { x: plotRect.x, y: yBottomPlot, width: plotRect.width, height: yTopPlot - yBottomPlot };
    }

    var generateNextPlotRect = function () {
        var _obs = that.currentObserver;
        if (_obs) {
            var curTime = new Date();
            var timeDiff = curTime.getTime() - prevTime.getTime();
            var k = velocity * timeDiff;

            var dx = estimatedPlotRect.x - prevFramePlotRect.x;
            var dy = estimatedPlotRect.y - prevFramePlotRect.y;

            var curDist = Math.max(estimatedPlotRect.width / 1000, Math.sqrt(dx * dx + dy * dy)); //Math.max(1.0, Math.sqrt(dx * dx + dy * dy));

            var newX = prevFramePlotRect.x + curDist * k * direction.x;
            var newY = prevFramePlotRect.y + curDist * k * direction.y;

            var newWidth = (estimatedPlotRect.width - prevFramePlotRect.width) * k + prevFramePlotRect.width;
            var newHeight = (estimatedPlotRect.height - prevFramePlotRect.height) * k + prevFramePlotRect.height;

            prevTime = curTime;

            dx = newX - startPlotRect.x;
            dy = newY - startPlotRect.y;
            var distToStart = Math.sqrt(dx * dx + dy * dy);

            if (distToStart >= pathLength) //if we moved beyond the target point we must stop
            {
                //we have reach the target visible. stop
                that.isInAnimation = false;
                setMapVisible(estimatedPlotRect);
                that.stop();
            }
            else {
                prevFramePlotRect = { x: newX, y: newY, width: newWidth, height: newHeight };

                that.currentPlotRect = prevFramePlotRect;
                setMapVisible(prevFramePlotRect);
            }
        }
    }


    var animationStep = function () {
        generateNextPlotRect();
        if (that.isInAnimation) {
            animationHandle = setTimeout(function () { animationStep(); }, 1000 / 60);
        }
    }


    this.animate = function (getVisible, finalPlotRect, settings) {

        if (InteractiveDataDisplay.Gestures.zoomLevelFactor != 1.4) {
            InteractiveDataDisplay.Gestures.zoomLevelFactor = 1.4;
        }

        if (animationHandle !== undefined) {
            clearTimeout(animationHandle);
            animationHandle = undefined;
        }

        prevEstimatedPlotRect = finalPlotRect;
        that.isInAnimation = true;

        if (settings && settings.isFirstFrame) {
            syncViews(true);
        }

        if (settings && settings.gestureType == "Pan") {
            isInnerBMAnimationUsed = false;


            var startVisible = getVisible();

            startPlotRect = prevFramePlotRect === undefined ? startVisible.plotRect : prevFramePlotRect;

            estimatedPlotRect = finalPlotRect;

            prevFramePlotRect = startPlotRect;

            direction = {
                x: estimatedPlotRect.x - startPlotRect.x,
                y: estimatedPlotRect.y - startPlotRect.y
            };

            pathLength = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            if (pathLength > 1e-10) {
                direction = { x: direction.x / pathLength, y: direction.y / pathLength };
            } else {
                direction = { x: 0, y: 0 };
            }

            velocity = 0.008;

            animationStep();
        } else {
            isInnerBMAnimationUsed = true;
            setMapVisible(finalPlotRect);

        }
    }


    var oldRealZoom = 1;

    var getRealMapWidth = function () {
        var mapCenter = _map.getCenter();
        var _screenSize = { width: _map.getWidth(), height: _map.getHeight() };

        var w_s = _screenSize.width;
        var h_s = _screenSize.height;

        var deltaLon = 30;
        var firstPoint = _map.tryLocationToPixel({ latitude: 0, longitude: mapCenter.longitude }, Microsoft.Maps.PixelReference.control);
        var secondPoint = _map.tryLocationToPixel({ latitude: 0, longitude: mapCenter.longitude + deltaLon }, Microsoft.Maps.PixelReference.control);
        var pixelDelta = secondPoint.x - firstPoint.x;

        if (pixelDelta < 0)
            pixelDelta = firstPoint.x - _map.tryLocationToPixel({ latitude: 0, longitude: mapCenter.longitude - deltaLon }, Microsoft.Maps.PixelReference.control).x;

        var periodDelta = pixelDelta / deltaLon;
        var leftCoordinate = mapCenter.longitude - firstPoint.x / periodDelta;
        var rightCoordinate = mapCenter.longitude + (w_s - firstPoint.x) / periodDelta;

        return rightCoordinate - leftCoordinate;
    }

    var calcZoom = function (plotRect, screenSize, ceil) {
        var xZoom = Math.max(1, Math.log(screenSize.width / plotRect.width * 360 / 256) / Math.log(2));

        var yBottom = InteractiveDataDisplay.mercatorTransform.plotToData(plotRect.y);
        var yTop = InteractiveDataDisplay.mercatorTransform.plotToData(plotRect.y + plotRect.height);

        var yZoom = Math.max(1, Math.log(screenSize.height / (yTop - yBottom) * 180 / 256) / Math.log(2));

        if (ceil === true) {
            xZoom = Math.ceil(xZoom) - 1;
            yZoom = Math.ceil(yZoom);
        }

        return Math.min(xZoom, yZoom);
    }

    var calcSizeFromZoom = function (zoom, screenSize) {
        return { width: screenSize.width * 360 / (256 * Math.pow(2, zoom)), height: screenSize.height * 180 / (256 * Math.pow(2, zoom)) };
    }

    this.setMapView = function (plotRect, screenSize) {

        var mapScreenSize = screenSize;
        if (screenSize === undefined) {
            mapScreenSize = { width: _map.getWidth(), height: _map.getHeight() };
        }

        var realZoom = calcZoom(plotRect, mapScreenSize, true);
        var prevZoom = _map.getZoom();

        var plotCenter = {
            x: plotRect.x + plotRect.width / 2,
            y: InteractiveDataDisplay.mercatorTransform.plotToData(plotRect.y + plotRect.height / 2)
        };

        _map.setView({
            center: new Microsoft.Maps.Location(plotCenter.y, plotCenter.x),
            zoom: realZoom,
            animate: false
        });
    }

    var deltaZoom = 0;

    var setMapVisible = function (plotRect) {

        var realZoom;
        var prevZoom = _map.getZoom() + deltaZoom;
        deltaZoom = 0;

        if (isInnerBMAnimationUsed) {
            realZoom = calcZoom(plotRect, { width: _map.getWidth(), height: _map.getHeight() });
        } else {
            realZoom = prevZoom;
        }

        var plotCenter = {
            x: plotRect.x + plotRect.width / 2,
            y: InteractiveDataDisplay.mercatorTransform.plotToData(plotRect.y + plotRect.height / 2)
        };


        if (!isInnerBMAnimationUsed) {
            _map.setView({
                center: new Microsoft.Maps.Location(plotCenter.y, plotCenter.x),
                zoom: realZoom,
                animate: false
            });
        } else {
            if ((prevZoom > 1 || realZoom > prevZoom)) {
                var finalZoom = Math.round(realZoom);
                var finalSize = calcSizeFromZoom(finalZoom, { width: _map.getWidth(), height: _map.getHeight() });

                if (plotRect.zoomOrigin) {
                    var zoomOrigin = { x: plotRect.zoomOrigin.x, y: InteractiveDataDisplay.mercatorTransform.plotToData(plotRect.zoomOrigin.y) };
                    var zoomOffset = { x: zoomOrigin.x - plotCenter.x, y: zoomOrigin.y - plotCenter.y };
                    var scaleVec = { x: finalSize.width / plotRect.width, y: finalSize.height / plotRect.height };
                    var newCenter = { x: zoomOrigin.x - zoomOffset.x * scaleVec.x, y: zoomOrigin.y - zoomOffset.y * scaleVec.y };
                }
                else {
                    var newCenter = plotCenter;
                }

                _map.setView({ 
                    center: new Microsoft.Maps.Location(newCenter.y, newCenter.x), //Math.abs(curDeltaZoom) >= 0.5 ? new Microsoft.Maps.Location(newCenter.y, newCenter.x) : _map.getCenter(),
                    zoom: realZoom,
                    animate: true
                });
            } else {
                syncViews();
                prevEstimatedPlotRect = that.getCurrentPlotRect();
                that.stop();
            }
        }
    };

    var calcActualPlotRect = function () {
        return InteractiveDataDisplay.Utils.getPlotRectForMap(_map);
    }

    this.getCurrentPlotRect = function () {
        return calcActualPlotRect(_map.getBounds(), _map.getCenter());
    }

    var syncViews = function (syncUpdate) {
        var _obs = that.currentObserver;
        if (_obs !== undefined) {
            var currentPlotRect = that.getCurrentPlotRect();
            var args = { plotRect: currentPlotRect, isLast: false };
            if (syncUpdate !== undefined) {
                args.syncUpdate = syncUpdate;
            } 
            _obs.onNext(args);
        }
    }

    Microsoft.Maps.Events.addHandler(_map, 'viewchange', function (e) {
        syncViews();
    });

    Microsoft.Maps.Events.addHandler(_map, 'viewchangeend', function (e) {
        prevEstimatedPlotRect = that.getCurrentPlotRect();
        if (isInnerBMAnimationUsed || !that.isInAnimation) {
            that.stop();
        } else {
            syncViews(); 
        }
    });

    this.additionalStopRutines = function () {
        if (animationHandle !== undefined) {
            clearTimeout(animationHandle);
            animationHandle = undefined;
        }

        that.isInAnimation = false;

        startPlotRect = undefined;
        estimatedPlotRect = undefined;
        prevEstimatedPlotRect = undefined;

        prevTime = new Date();
        prevFramePlotRect = undefined;
        direction = undefined;
        pathLength = 0;

        animationHandle = undefined;

        deltaWidth = 0;
        deltaHeight = 0;
    };
}

InteractiveDataDisplay.BingMapsAnimation.prototype = new InteractiveDataDisplay.AnimationBase;
