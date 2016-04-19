InteractiveDataDisplay.NavigationPanel = function (d3Chart, div) {
    var that = this;
    var leftKeyCode = 37;
    var upKeyCode = 38;
    var righKeyCode = 39;
    var downKeyCode = 40;
    var plusKeyCode = 107;
    var minusKeyCode = 109;
    var dashKeyCode = 189;
    var equalKey = 187;
    div.attr("tabindex", "0");
    div.addClass('idd-navigation-container');
    var lockNavigation = $("<div></div>").addClass("idd-onscreennavigation-navigationlockpressed").appendTo(div);
    var ZoomAndPanDiv = $("<div style='overflow: hidden; height: 0px'></div>").appendTo(div);
    var pannerDiv = $("<div></div>").addClass("idd-onscreennavigation-panner").appendTo(ZoomAndPanDiv);
    var zoomInDiv = $("<div></div>").addClass("idd-onscreennavigation-zoomin").appendTo(ZoomAndPanDiv);
    var zoomOutDiv = $("<div></div>").addClass("idd-onscreennavigation-zoomout").appendTo(ZoomAndPanDiv);
    var fitDiv = $("<div></div>").addClass("idd-onscreennavigation-fit").appendTo(div);
    var logScale = $("<div></div>").addClass("idd-onscreennavigation-logscale").appendTo(div);
    var obs = undefined;
    var observable = Rx.Observable.create(function (rx) {
        obs = rx;
        return function () {
            obs = undefined;
        };
    });
    var LogScaleSwitcher = function (d3Chart) {
        var prevState = undefined;
        var switchToState = function (state) {
            if (state !== prevState) {
                switch (state) {
                    case 0:
                        d3Chart.xDataTransform = undefined;
                        d3Chart.yDataTransform = undefined;
                        break;
                    case 1:
                        d3Chart.xDataTransform = InteractiveDataDisplay.logTransform;
                        d3Chart.yDataTransform = undefined;
                        break;
                    case 2:
                        d3Chart.xDataTransform = undefined;
                        d3Chart.yDataTransform = InteractiveDataDisplay.logTransform;
                        break;
                    case 3:
                        d3Chart.xDataTransform = InteractiveDataDisplay.logTransform;
                        d3Chart.yDataTransform = InteractiveDataDisplay.logTransform;
                        break;
                }
                prevState = state;
            }
        };
        this.switch = function () {
            if (d3Chart.mapControl)
                return;
            var state = (((d3Chart.xDataTransform ? 1 : 0) | (d3Chart.yDataTransform ? 2 : 0)) + 1) % 4;
            switchToState(state);
            d3Chart.fitToView(); // doing this manually
        };
    };
    var logScaleSwitcher = new LogScaleSwitcher(d3Chart);
    logScale.click(function (e) {
        logScaleSwitcher.switch();
        var gestureSource = d3Chart.navigation.gestureSource;
        d3Chart.navigation.gestureSource = gestureSource.merge(observable);
    });
    var gestureSource = undefined;
    if (d3Chart.navigation.gestureSource !== undefined) {
        gestureSource = observable.merge(d3Chart.navigation.gestureSource);
    }
    else {
        gestureSource = observable;
    }
    d3Chart.navigation.gestureSource = gestureSource;
    var panLeft = function () {
        if (obs)
            obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(10, 0, "Mouse"));
    };
    var panRight = function () {
        if (obs)
            obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(-10, 0, "Mouse"));
    };
    var panUp = function () {
        if (obs)
            obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(0, 10, "Mouse"));
    };
    var panDown = function () {
        if (obs)
            obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(0, -10, "Mouse"));
    };
    var getZoomFactor = function () {
        if (d3Chart.mapControl === undefined)
            return InteractiveDataDisplay.Gestures.zoomLevelFactor;
        else
            return 3.0;
    };
    var zoomIn = function () {
        if (obs) 
            obs.onNext(new InteractiveDataDisplay.Gestures.ZoomGesture(d3Chart.centralPart.width() / 2, d3Chart.centralPart.height() / 2, 1.0 / getZoomFactor(), "Mouse"));
    };
    var zoomOut = function () {
        if (obs)
            obs.onNext(new InteractiveDataDisplay.Gestures.ZoomGesture(d3Chart.centralPart.width() / 2, d3Chart.centralPart.height() / 2, getZoomFactor(), "Mouse"));
    };
    var fitToView = function () {
        d3Chart.fitToView();
    };
    var defaultGestureSource = d3Chart.navigation.gestureSource;
    d3Chart.navigation.gestureSource = undefined;
    lockNavigation.click(function () {
        if (d3Chart.navigation.gestureSource !== undefined) {
            d3Chart.navigation.gestureSource = undefined;
            lockNavigation.removeClass("idd-onscreennavigation-navigationlock").addClass("idd-onscreennavigation-navigationlockpressed");
            ZoomAndPanDiv.animate({
                height: 0,
            }, 200);
        }
        else {
            d3Chart.navigation.gestureSource = defaultGestureSource;
            lockNavigation.removeClass("idd-onscreennavigation-navigationlockpressed").addClass("idd-onscreennavigation-navigationlock");
            ZoomAndPanDiv.animate({
                height: 135,
            }, 200);
        }
    });
    zoomOutDiv.dblclick(function (e) {
        e.stopPropagation();
    });
    zoomOutDiv.click(function (e) {
        e.stopPropagation();
        zoomOut();
    });
    zoomInDiv.dblclick(function (e) {
        e.stopPropagation();
    });
    zoomInDiv.click(function (e) {
        e.stopPropagation();
        zoomIn();
    });
    if (d3Chart.isAutoFitEnabled)
        fitDiv.attr("class", "idd-onscreennavigation-fit-pressed");
    fitDiv.click(function () {
        d3Chart.isAutoFitEnabled = !d3Chart.isAutoFitEnabled;
    });
    d3Chart.host.on("isAutoFitEnabledChanged", function () {
        if (d3Chart.isAutoFitEnabled) {
            fitDiv.attr("class", "idd-onscreennavigation-fit-pressed");
        }
        else {
            fitDiv.attr("class", "idd-onscreennavigation-fit");
        }
    });
    div.keydown(function (event) {
        var key = event.which;
        if (key == leftKeyCode) {
            panLeft();
            event.preventDefault();
        }
        else if (key == upKeyCode) {
            panUp();
            event.preventDefault();
        }
        else if (key == righKeyCode) {
            panRight();
            event.preventDefault();
        }
        else if (key == downKeyCode) {
            panDown();
            event.preventDefault();
        }
        else if (key == plusKeyCode || key == equalKey) {
            zoomIn();
            event.preventDefault();
        }
        else if (key == minusKeyCode || key == dashKeyCode) {
            zoomOut();
            event.preventDefault();
        }
    });
    var iid;
    var coords = { x: 0, y: 0 };
    pannerDiv.mousedown(function (event) {
        var offset = pannerDiv.offset();
        var xhalf = pannerDiv.outerWidth() / 2;
        coords.x = (event.pageX - offset.left - xhalf) / xhalf;
        coords.y = (event.pageY - offset.top - xhalf) / xhalf;
        if (coords.x * coords.x + coords.y * coords.y > 1)
            return;
        $(document).on("mousemove", mousemove);
        pannerDiv.removeClass("idd-onscreennavigation-panner").addClass("idd-onscreennavigation-panner-moved");
        iid = setInterval(function () {
            obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(-10 * coords.x, -10 * coords.y, "Mouse"));
        }, 25);
    });
    $(document).mouseup(function () {
        $(document).off("mousemove", mousemove);
        iid && clearInterval(iid);
        pannerDiv.removeClass("idd-onscreennavigation-panner-moved").addClass("idd-onscreennavigation-panner");
    });
    var mousemove = function (event) {
        var offset = pannerDiv.offset();
        var xhalf = pannerDiv.outerWidth() / 2;
        coords.x = (event.pageX - offset.left - xhalf) / xhalf;
        coords.y = (event.pageY - offset.top - xhalf) / xhalf;
    };
    this.remove = function () {
        lockNavigation.removeClass("idd-onscreennavigation-navigationlockpressed");
        pannerDiv.removeClass("idd-onscreennavigation-panner");
        zoomInDiv.removeClass("idd-onscreennavigation-zoomin");
        zoomOutDiv.removeClass("idd-onscreennavigation-zoomout");
        fitDiv.removeClass("idd-onscreennavigation-fit");
        logScale.removeClass("idd-onscreennavigation-logscale");
        div.removeClass('idd-navigation-container');
        div[0].innerHTML = "";
    };
    return div;
}