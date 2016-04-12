//var createSmallProbe = function (jqDiv, isTransparent, num, fill, scale) {
//    jqDiv.empty();
//    var canvasScale = scale !== undefined ? scale : 1;
//    var canvas = $("<canvas width='" + (40 * canvasScale + 1) + "' height='" + 40 * canvasScale + "'></canvas>").appendTo(jqDiv);
//    var ctx = canvas.get(0).getContext("2d");
//    if (isTransparent)
//        ctx.globalAlpha = 0.7;
//    var img = new Image();   // Create new img element
//    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAJvSURBVGhD1dg7r0xRGMbxg1AR30JCQ+PSCCpxLcQXEFEr+A4IhWiJKKYXH4C4VW4NlUuBApW4JoTwf5M5yeTs/9p7rTVril38kpNn9l7vc/bZe2adWZpMJqOm4ZhoOCYajomGlVZhHy7hIT7h99RHPMBF7EEca2sU07DQGpzCG/zL9AonsRq2ZjYNC2zGU1jJHI+xCbZ2Fg0zHcR3WLES37AfNmOQhhmifNzbVqhGrFX1S2g4IG6bFld+pfhLFN9OGvaIB/YZrEALj1D0YGvYI95tbHBLJ2CzlYYJ8d5d8lZZ6yWyPyc0TNgLG2i+ZGYpu2EdOjRMiE9YG7YIF2AdOjRMiO2BDZuVc5VzjrkP69ChYULsbWzYInyAdejQMKHlB9eQX7AOHRom/IQNW4QfsA4dGia8hw1bhLewDh0aJtyBDZvV6iG+DevQoWHCediwRTgH69ChYULsFm2Ysaucc+WXZe9MNUxYh5IStT5jLaxDh4Y9bsCGtnQdNltp2GMXbGhLO2GzlYYDnsAGtxBr28wkDQcchw1v4RhsZpKGA2Kv/gJWYB7PUfx9kYYZjsJKzOMIbFYvDTPdgxWpcRc2Y5CGmbbhD6xQiVhjK2zGIA0LXIGVKnEZtnYWDQtswDtYsRyx64w1bO0sGhY6ACuXI861NbNpWOEarGCfq7C1imhYYT1KvjN6jTjH1iqiYaUdyPm/OY7ZDlujmIZzOAsrPesM7NwqGs4htgK3YMXDTdh51TSc00bE95sry0cWr9k51TRsYAu+Yrl8/ByZHTsXDRs5jL9Th6ZZcxo2dHrKXmtCwzHRcEw0HBMNx2Oy9B/6jED2Lp0vyQAAAABJRU5ErkJggg==';
//    ctx.drawImage(img, 0, 0, 40, 40);
    
//    if (num !== undefined) {
//        ctx.fillStyle = fill !== undefined ? 'white' : '#444';
//        var fontsize = (num < 10 ? 16 : 14) * canvasScale;
//        ctx.font = fontsize + "px Arial";
//        var offsetX = (num < 10 ? 4 : 1) * canvasScale;
//        ctx.fillText(num, offsetX, 19 * canvasScale);
//    }
//};
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
}