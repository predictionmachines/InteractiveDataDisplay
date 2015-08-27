InteractiveDataDisplay.AnimationBase = function () {
    var _obs = undefined;
    var that = this;

    this.isInAnimation = false;

    var observable = Rx.Observable.create(function (rx) {
        _obs = rx;
        return function () {
        };
    });

    Object.defineProperty(this, "currentObserver", {
        get: function () { return _obs; },
        configurable: false
    });

    Object.defineProperty(this, "currentObservable", { 
        get: function () { return observable; },
        configurable: false
    });

    this.targetPlotRect = undefined;

    this.getCurrentPlotRect = function () {
    }

    this.stop = function () {
        if (that.isInAnimation) {
            that.isInAnimation = false;
        }

        if (_obs) {
            _obs.onNext({ plotRect: that.getCurrentPlotRect(), isLast: true });
            _obs.onCompleted();
            _obs = undefined;
        }

        this.additionalStopRutines();
    };

    this.additionalStopRutines = function () {
    };

    this.animate = function (getVisible, finalPlotRect) {
    };
}

InteractiveDataDisplay.PanZoomAnimation = function () {
    this.base = InteractiveDataDisplay.AnimationBase;
    this.base();

    var that = this;

    var screenSize = undefined;
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

    this.getCurrentPlotRect = function () {
        return prevFramePlotRect;
    }

    Object.defineProperty(this, "previousEstimatedPlotRect", {
        get: function () { return prevEstimatedPlotRect; },
        configurable: false
    });


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

            var currentDeltaWidth = newWidth - startPlotRect.width;
            var currentDeltaHeight = newHeight - startPlotRect.height;

            if (distToStart >= pathLength //if we moved beyond the target point we must stop
                || Math.abs(currentDeltaWidth) > Math.abs(deltaWidth)
                || Math.abs(currentDeltaHeight) > Math.abs(deltaHeight)//if we changed the scale more than needed we must stop
            ) {
                //we have reach the target visible. stop
                that.isInAnimation = false;
                prevFramePlotRect = estimatedPlotRect;
                that.stop();
            }
            else {
                prevFramePlotRect = { x: newX, y: newY, width: newWidth, height: newHeight };

                that.currentPlotRect = prevFramePlotRect;
                _obs.onNext({ plotRect: prevFramePlotRect, isLast: false });
            }
        }
    }

    var animationStep = function () {
        generateNextPlotRect();
        if (that.isInAnimation) {
            animationHandle = setTimeout(function () { animationStep(); }, 1000 / 60);
        }
    }

    this.animate = function (getVisible, finalPlotRect) {

        if (InteractiveDataDisplay.Gestures.zoomLevelFactor != 1.2) {
            InteractiveDataDisplay.Gestures.zoomLevelFactor = 1.2;
        }

        if (animationHandle !== undefined) {
            clearTimeout(animationHandle);
            animationHandle = undefined;
        }

        prevEstimatedPlotRect = finalPlotRect;

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
        }
        else {
            direction = { x: 0, y: 0 };
        }

        deltaWidth = finalPlotRect.width - startPlotRect.width;
        deltaHeight = finalPlotRect.height - startPlotRect.height;

        if (deltaWidth != 0 || deltaHeight != 0) {
            velocity = 0.008;
        }
        else {
            velocity = 0.009;
        }

        that.isInAnimation = true;
        animationStep();
    }

    this.additionalStopRutines = function () {
        if (animationHandle !== undefined) {
            clearTimeout(animationHandle);
            animationHandle = undefined;
        }

        that.isInAnimation = false;

        screenSize = undefined;
        startPlotRect = undefined;
        startCS = undefined;
        estimatedPlotRect = undefined;

        prevTime = new Date();
        prevFramePlotRect = undefined;
        prevEstimatedPlotRect = undefined;
        direction = undefined;
        pathLength = 0;

        startScreenCenter = undefined;
        previousFrameScreenCenter = undefined;
        endScreenCenter = undefined;

        animationHandle = undefined;

        deltaWidth = 0;
        deltaHeight = 0;
    };

}

InteractiveDataDisplay.PanZoomAnimation.prototype = new InteractiveDataDisplay.AnimationBase;