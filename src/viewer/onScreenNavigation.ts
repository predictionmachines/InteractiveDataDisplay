/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
declare var Rx: any;
declare var InteractiveDataDisplay: any;
module ChartViewer {
    export function createSmallProbe (jqDiv, isTransparent, num?, fill?, scale?) {
        jqDiv.empty();

        var canvasScale = scale !== undefined ? scale : 1;

        var canvas = $("<canvas width='" + (18 * canvasScale + 1) + "' height='" + 55 * canvasScale + "'></canvas>").appendTo(jqDiv);
        var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
        if (isTransparent) ctx.globalAlpha = 0.7;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2 * canvasScale;
        ctx.fillStyle = fill !== undefined ? fill : '#F1F9FF';
        ctx.beginPath();
        ctx.moveTo(0, 55 * canvasScale);
        ctx.lineTo(0, 0);
        ctx.lineTo(18 * canvasScale, 0);
        ctx.lineTo(18 * canvasScale, 30 * canvasScale);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1 * canvasScale;
        ctx.lineTo(0, 55 * canvasScale);
        ctx.stroke();
        ctx.closePath();

        if (num !== undefined) {
            ctx.fillStyle = fill !== undefined ? 'white' : '#444';
            var fontsize = (num < 10 ? 16 : 14) * canvasScale;
            ctx.font = fontsize + "px Arial";
            var offsetX = (num < 10 ? 4 : 1) * canvasScale;
            ctx.fillText(num, offsetX, 19 * canvasScale);
        }
    };

    export function createSmallProbes (jqDiv, count, offset) {
        jqDiv.empty();
        var width = 18 + offset * count;
        var height = 55 + offset * count;
        var canvas = $("<canvas width='" + width + "' height='" + height + "'></canvas>").appendTo(jqDiv);

        var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#F1F9FF';

        var drawProbe = function (top, left) {
            ctx.beginPath();
            ctx.moveTo(left, top + 55);
            ctx.lineTo(left, top);
            ctx.lineTo(left + 18, top);
            ctx.lineTo(left + 18, top + 30);
            ctx.fill();
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.lineTo(left, top + 55);
            ctx.stroke();
            ctx.closePath();
        }

        var ofs = (count - 1) * offset;
        for (var i = 0; i < count; i++) {
            drawProbe(ofs, ofs);
            ofs -= offset;
        }
    };
    export function ProbePull(hostDiv, d3Div) {
        var _host = hostDiv;

        var draggable = $("<div></div>").addClass("dragPoint").addClass("probe").appendTo(_host);
        draggable.css("top", 5);
        draggable.css("left", (_host.width() - 18) / 2);
        createSmallProbes(draggable, 4, 1.2);

        draggable.draggable({
            containment: "document",
            scroll: false,
            zIndex: 2500,
            helper: function () {
                var hdr = $("<div></div>").addClass("dragPoint");
                createSmallProbe(hdr, true);
                return hdr;
            },
            appendTo: d3Div
        });

        draggable.mousedown(function (e) {
            e.stopPropagation();
        });
    };

    export function LogScaleSwitcher(d3Chart, persistentViewState) {
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
        }

        if (persistentViewState !== undefined) {

            var initialState = persistentViewState.axisTransform ? (persistentViewState.axisTransform.x && persistentViewState.axisTransform.x == "log10" ? 1 : 0) |
                (persistentViewState.axisTransform.y && persistentViewState.axisTransform.y == "log10" ? 2 : 0) :
                0;
            switchToState(initialState);

            var _viewStateUpdateCallback = function (state, propName) {
                if (propName === "axisTransform") {
                    var state1 = persistentViewState.axisTransform ? (persistentViewState.axisTransform.x && persistentViewState.axisTransform.x == "log10" ? 1 : 0) |
                        (persistentViewState.axisTransform.y && persistentViewState.axisTransform.y == "log10" ? 2 : 0) :
                        0;
                    switchToState(state1);
                }
            };
            persistentViewState.subscribe(_viewStateUpdateCallback);
        }

        this.switch = function () {
            if (d3Chart.mapControl) return;
            var state = (((d3Chart.xDataTransform ? 1 : 0) | (d3Chart.yDataTransform ? 2 : 0)) + 1) % 4;
            switchToState(state);

            if (persistentViewState !== undefined) {
                persistentViewState.axisTransform = {
                    x: d3Chart.xDataTransform && d3Chart.xDataTransform.type,
                    y: d3Chart.yDataTransform && d3Chart.yDataTransform.type,
                };
            }

            d3Chart.fitToView(); // doing this manually
        }
    };

    export function OnScreenNavigation(div, d3Chart, persistentViewState, propagateNavigationDiv) {
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
        var pannerDiv = $("<div></div>").addClass("dsv-onscreennavigation-panner").appendTo(div);
        var zoomInDiv = $("<div></div>").addClass("dsv-onscreennavigation-zoomin").appendTo(div);
        var zoomOutDiv = $("<div></div>").addClass("dsv-onscreennavigation-zoomout").appendTo(div);
        var fitDiv = $("<div></div>").addClass("dsv-onscreennavigation-fit").appendTo(div);
        var logScale = $("<div></div>").addClass("dsv-onscreennavigation-logscale").appendTo(div);
        var lockNavigation = $("<div></div>").addClass("dsv-onscreennavigation-navigationlockpressed").appendTo(div);
        var probePullDiv = $("<div></div>").addClass("dsv-onscreennavigation-probepull").appendTo(div);
        var probePull = new ProbePull(probePullDiv, d3Chart.centralPart);


        var obs = undefined;
        var observable = Rx.Observable.create(function (rx) {
            obs = rx;
            return function () {
                obs = undefined;
            };
        });
        
        var logScaleSwitcher = new LogScaleSwitcher(d3Chart, persistentViewState);
        logScale.click(function (e) {
            logScaleSwitcher.switch();
            var gestureSource = d3Chart.navigation.gestureSource;
            d3Chart.navigation.gestureSource = gestureSource.merge(observable);
        });

        var gestureSource = undefined;
        if (d3Chart.navigation.gestureSource !== undefined) {
            gestureSource = observable.merge(d3Chart.navigation.gestureSource);
        } else {
            gestureSource = observable;
        }
        d3Chart.navigation.gestureSource = gestureSource;

        var panLeft = function () {
            if (obs)
                obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(10, 0, "Mouse"));
        }

        var panRight = function () {
            if (obs)
                obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(-10, 0, "Mouse"));
        }

        var panUp = function () {
            if (obs)
                obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(0, 10, "Mouse"));
        }

        var panDown = function () {
            if (obs)
                obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(0, -10, "Mouse"));
        }

        var getZoomFactor = function () {
            if (d3Chart.mapControl === undefined)
                return InteractiveDataDisplay.Gestures.zoomLevelFactor;
            else
                return 3.0;
        }

        var zoomIn = function () {
            if (obs)
                obs.onNext(new InteractiveDataDisplay.Gestures.ZoomGesture(d3Chart.centralPart.width() / 2, d3Chart.centralPart.height() / 2, 1.0 / getZoomFactor(), "Mouse"));
        }

        var zoomOut = function () {
            if (obs)
                obs.onNext(new InteractiveDataDisplay.Gestures.ZoomGesture(d3Chart.centralPart.width() / 2, d3Chart.centralPart.height() / 2, getZoomFactor(), "Mouse"));
        }

        var fitToView = function () {
            d3Chart.fitToView();
        }

        var defaultGestureSource = d3Chart.navigation.gestureSource;
        d3Chart.navigation.gestureSource = undefined;
        propagateNavigationDiv.show();
        lockNavigation.click(function () {
            if (d3Chart.navigation.gestureSource !== undefined) {
                d3Chart.navigation.gestureSource = undefined;
                propagateNavigationDiv.show();
                lockNavigation.removeClass("dsv-onscreennavigation-navigationlock").addClass("dsv-onscreennavigation-navigationlockpressed");
            } else {
                d3Chart.navigation.gestureSource = defaultGestureSource;
                propagateNavigationDiv.hide();
                lockNavigation.removeClass("dsv-onscreennavigation-navigationlockpressed").addClass("dsv-onscreennavigation-navigationlock");
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
            fitDiv.attr("class", "dsv-onscreennavigation-fit-pressed");
        fitDiv.click(function () {
            d3Chart.isAutoFitEnabled = !d3Chart.isAutoFitEnabled;
        });
        d3Chart.host.on("isAutoFitEnabledChanged", function () {
            if (d3Chart.isAutoFitEnabled) {
                fitDiv.attr("class", "dsv-onscreennavigation-fit-pressed");
            } else {
                fitDiv.attr("class", "dsv-onscreennavigation-fit");
            }
        });

        div.keydown(function (event) {
            var key = event.which;
            if (key == leftKeyCode) {
                panLeft();
                event.preventDefault();
            } else if (key == upKeyCode) {
                panUp();
                event.preventDefault();
            } else if (key == righKeyCode) {
                panRight();
                event.preventDefault();
            } else if (key == downKeyCode) {
                panDown();
                event.preventDefault();
            } else if (key == plusKeyCode || key == equalKey) {
                zoomIn();
                event.preventDefault();
            } else if (key == minusKeyCode || key == dashKeyCode) {
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
            if (coords.x * coords.x + coords.y * coords.y > 1) return;
            $(document).on("mousemove", mousemove);
            iid = setInterval(function () {
                obs.onNext(new InteractiveDataDisplay.Gestures.PanGesture(-10 * coords.x, -10 * coords.y, "Mouse"));
            }, 25);
        });
        $(document).mouseup(function () {
            $(document).off("mousemove", mousemove);
            iid && clearInterval(iid);
        });
        var mousemove = function (event) {
            var offset = pannerDiv.offset();
            var xhalf = pannerDiv.outerWidth() / 2;
            coords.x = (event.pageX - offset.left - xhalf) / xhalf;
            coords.y = (event.pageY - offset.top - xhalf) / xhalf;
        }
    }
}