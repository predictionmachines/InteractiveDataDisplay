InteractiveDataDisplay.NavigationPanel = function (plot, div, url) {
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
    if (plot.legend) {
        var hideShowLegend = $('<div></div>').appendTo(div);
        if (plot.legend.isVisible) hideShowLegend.addClass("idd-onscreennavigation-showlegend");
        else hideShowLegend.addClass("idd-onscreennavigation-hidelegend");
        hideShowLegend.click(function () {
            if (plot.legend.isVisible) {
                plot.legend.isVisible = false;
                hideShowLegend.removeClass("idd-onscreennavigation-showlegend").addClass("idd-onscreennavigation-hidelegend");
            } else {
                plot.legend.isVisible = true;
                hideShowLegend.removeClass("idd-onscreennavigation-hidelegend").addClass("idd-onscreennavigation-showlegend");
            }
        });
    };
    var help;
    if (url) {
        help = $('<a style="display:block" target="_blank"></div>').addClass("idd-onscreennavigation-help").appendTo(div);
        help.attr('href', url);
    }
    else help = $('<a href="https://github.com/predictionmachines/InteractiveDataDisplay/wiki/UI-Guidelines" style="display:block" target="_blank"></div>').addClass("idd-onscreennavigation-help").appendTo(div);
    var exportSVG = $("<div></div>").addClass("idd-onscreennavigation-exportsvg").appendTo(div);
    var lockNavigation = $("<div></div>").addClass("idd-onscreennavigation-navigationlockpressed").appendTo(div);
    var ZoomAndPanDiv = $("<div style='overflow: hidden; height: 0px'></div>").appendTo(div);
    var pannerDiv = $("<div></div>").addClass("idd-onscreennavigation-panner").appendTo(ZoomAndPanDiv);
    var zoomInDiv = $("<div></div>").addClass("idd-onscreennavigation-zoomin").appendTo(ZoomAndPanDiv);
    var zoomOutDiv = $("<div></div>").addClass("idd-onscreennavigation-zoomout").appendTo(ZoomAndPanDiv);
    var fitDiv = $("<div></div>").addClass("idd-onscreennavigation-fit").appendTo(ZoomAndPanDiv);
    var logScale = $("<div></div>").addClass("idd-onscreennavigation-logscale").appendTo(ZoomAndPanDiv);
    var obs = undefined;
    var observable = Rx.Observable.create(function (rx) {
        obs = rx;
        return function () {
            obs = undefined;
        };
    });

    exportSVG.click(function () {
        try {
            var isFileSaverSupported = !!new Blob;
            var svg = plot.exportToSvg();
            var blob = new Blob([svg.svg()]);
            saveAs(blob, "chart.svg");
        } catch (e) { throw e.message; }
    });
    var LogScaleSwitcher = function (plot) {
        var prevState = undefined;
        var switchToState = function (state) {
            if (state !== prevState) {
                switch (state) {
                    case 0:
                        plot.xDataTransform = undefined;
                        plot.yDataTransform = undefined;
                        break;
                    case 1:
                        plot.xDataTransform = InteractiveDataDisplay.logTransform;
                        plot.yDataTransform = undefined;
                        break;
                    case 2:
                        plot.xDataTransform = undefined;
                        plot.yDataTransform = InteractiveDataDisplay.logTransform;
                        break;
                    case 3:
                        plot.xDataTransform = InteractiveDataDisplay.logTransform;
                        plot.yDataTransform = InteractiveDataDisplay.logTransform;
                        break;
                }
                prevState = state;
            }
        };
        this.switch = function () {
            if (plot.mapControl)
                return;
            var state = (((plot.xDataTransform ? 1 : 0) | (plot.yDataTransform ? 2 : 0)) + 1) % 4;
            switchToState(state);
            plot.isAutoFitEnabled = true;
            return state;
        };
    };
    var logScaleSwitcher = new LogScaleSwitcher(plot);
    logScale.click(function (e) {
        var currentState = logScaleSwitcher.switch();
        var gestureSource = plot.navigation.gestureSource;
        plot.navigation.gestureSource = gestureSource ? observable.merge(gestureSource) : observable;
        $(this).trigger('axisChanged', [currentState]);
    });
    var gestureSource = undefined;
    if (plot.navigation.gestureSource !== undefined) {
        gestureSource = observable.merge(plot.navigation.gestureSource);
    }
    else {
        gestureSource = observable;
    }
    plot.navigation.gestureSource = gestureSource;
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
        if (plot.mapControl === undefined)
            return InteractiveDataDisplay.Gestures.zoomLevelFactor;
        else
            return 3.0;
    };
    var zoomIn = function () {
        if (obs) 
            obs.onNext(new InteractiveDataDisplay.Gestures.ZoomGesture(plot.centralPart.width() / 2, plot.centralPart.height() / 2, 1.0 / getZoomFactor(), "Mouse"));
    };
    var zoomOut = function () {
        if (obs)
            obs.onNext(new InteractiveDataDisplay.Gestures.ZoomGesture(plot.centralPart.width() / 2, plot.centralPart.height() / 2, getZoomFactor(), "Mouse"));
    };
    var fitToView = function () {
        plot.fitToView();
    };
    var defaultGestureSource = plot.navigation.gestureSource;
    plot.navigation.gestureSource = undefined;
    lockNavigation.click(function () {
        if (plot.navigation.gestureSource !== undefined) {
            plot.navigation.gestureSource = undefined;
            lockNavigation.removeClass("idd-onscreennavigation-navigationlock").addClass("idd-onscreennavigation-navigationlockpressed");
            ZoomAndPanDiv.animate({
                height: 0,
            }, 200);
        }
        else {
            plot.navigation.gestureSource = defaultGestureSource;
            lockNavigation.removeClass("idd-onscreennavigation-navigationlockpressed").addClass("idd-onscreennavigation-navigationlock");
            ZoomAndPanDiv.animate({
                height: 225,
            }, 200);
        }
        $(this).trigger('classChanged');
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
    if (plot.isAutoFitEnabled)
        fitDiv.attr("class", "idd-onscreennavigation-fit-pressed");
    fitDiv.click(function () {
        plot.isAutoFitEnabled = !plot.isAutoFitEnabled;
    });
    plot.host.on("isAutoFitEnabledChanged", function () {
        if (plot.isAutoFitEnabled) {
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
        plot.navigation.gestureSource = defaultGestureSource;
        div.removeClass('idd-navigation-container');
        div[0].innerHTML = "";
    };
}