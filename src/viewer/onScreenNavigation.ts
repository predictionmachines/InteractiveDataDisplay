/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
declare var Rx: any;
declare var InteractiveDataDisplay: any;
module ChartViewer {
    export function createSmallProbe (jqDiv, isTransparent, num?, fill?, scale?) {
        jqDiv.empty();

        var canvasScale = scale !== undefined ? scale : 1;

        var canvas = $("<canvas width='" + (40 * canvasScale + 1) + "' height='" + 40 * canvasScale + "'></canvas>").appendTo(jqDiv);
        var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
        if (isTransparent) ctx.globalAlpha = 0.7;
        
        var img = new Image();   // Create new img element
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAJvSURBVGhD1dg7r0xRGMbxg1AR30JCQ+PSCCpxLcQXEFEr+A4IhWiJKKYXH4C4VW4NlUuBApW4JoTwf5M5yeTs/9p7rTVril38kpNn9l7vc/bZe2adWZpMJqOm4ZhoOCYajomGlVZhHy7hIT7h99RHPMBF7EEca2sU07DQGpzCG/zL9AonsRq2ZjYNC2zGU1jJHI+xCbZ2Fg0zHcR3WLES37AfNmOQhhmifNzbVqhGrFX1S2g4IG6bFld+pfhLFN9OGvaIB/YZrEALj1D0YGvYI95tbHBLJ2CzlYYJ8d5d8lZZ6yWyPyc0TNgLG2i+ZGYpu2EdOjRMiE9YG7YIF2AdOjRMiO2BDZuVc5VzjrkP69ChYULsbWzYInyAdejQMKHlB9eQX7AOHRom/IQNW4QfsA4dGia8hw1bhLewDh0aJtyBDZvV6iG+DevQoWHCediwRTgH69ChYULsFm2Ysaucc+WXZe9MNUxYh5IStT5jLaxDh4Y9bsCGtnQdNltp2GMXbGhLO2GzlYYDnsAGtxBr28wkDQcchw1v4RhsZpKGA2Kv/gJWYB7PUfx9kYYZjsJKzOMIbFYvDTPdgxWpcRc2Y5CGmbbhD6xQiVhjK2zGIA0LXIGVKnEZtnYWDQtswDtYsRyx64w1bO0sGhY6ACuXI861NbNpWOEarGCfq7C1imhYYT1KvjN6jTjH1iqiYaUdyPm/OY7ZDlujmIZzOAsrPesM7NwqGs4htgK3YMXDTdh51TSc00bE95sry0cWr9k51TRsYAu+Yrl8/ByZHTsXDRs5jL9Th6ZZcxo2dHrKXmtCwzHRcEw0HBMNx2Oy9B/6jED2Lp0vyQAAAABJRU5ErkJggg==';
        ctx.drawImage(img, 0, 0, 40, 40);

        if (num !== undefined) {
            ctx.fillStyle = fill !== undefined ? 'white' : '#444';
            var fontsize = (num < 10 ? 14 : 12) * canvasScale;
            ctx.font = fontsize + "px Arial";
            var offsetX = (num < 10 ? 16 : 13) * canvasScale;
            ctx.fillText(num, offsetX, 20 * canvasScale);
        }
    };

    export function createSmallProbes (jqDiv, count, offset) {
        jqDiv.empty();
        var width = 40 + offset * count;
        var height = 40 + offset * count;
        var canvas = $("<canvas width='" + width + "' height='" + height + "'></canvas>").appendTo(jqDiv);

        var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
        var img = new Image();   // Create new img element
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuOWwzfk4AAAJvSURBVGhD1dg7r0xRGMbxg1AR30JCQ+PSCCpxLcQXEFEr+A4IhWiJKKYXH4C4VW4NlUuBApW4JoTwf5M5yeTs/9p7rTVril38kpNn9l7vc/bZe2adWZpMJqOm4ZhoOCYajomGlVZhHy7hIT7h99RHPMBF7EEca2sU07DQGpzCG/zL9AonsRq2ZjYNC2zGU1jJHI+xCbZ2Fg0zHcR3WLES37AfNmOQhhmifNzbVqhGrFX1S2g4IG6bFld+pfhLFN9OGvaIB/YZrEALj1D0YGvYI95tbHBLJ2CzlYYJ8d5d8lZZ6yWyPyc0TNgLG2i+ZGYpu2EdOjRMiE9YG7YIF2AdOjRMiO2BDZuVc5VzjrkP69ChYULsbWzYInyAdejQMKHlB9eQX7AOHRom/IQNW4QfsA4dGia8hw1bhLewDh0aJtyBDZvV6iG+DevQoWHCediwRTgH69ChYULsFm2Ysaucc+WXZe9MNUxYh5IStT5jLaxDh4Y9bsCGtnQdNltp2GMXbGhLO2GzlYYDnsAGtxBr28wkDQcchw1v4RhsZpKGA2Kv/gJWYB7PUfx9kYYZjsJKzOMIbFYvDTPdgxWpcRc2Y5CGmbbhD6xQiVhjK2zGIA0LXIGVKnEZtnYWDQtswDtYsRyx64w1bO0sGhY6ACuXI861NbNpWOEarGCfq7C1imhYYT1KvjN6jTjH1iqiYaUdyPm/OY7ZDlujmIZzOAsrPesM7NwqGs4htgK3YMXDTdh51TSc00bE95sry0cWr9k51TRsYAu+Yrl8/ByZHTsXDRs5jL9Th6ZZcxo2dHrKXmtCwzHRcEw0HBMNx2Oy9B/6jED2Lp0vyQAAAABJRU5ErkJggg==';
    
    
        var drawProbe = function (top, left) {
            ctx.drawImage(img, 0, 0, 40, 40);
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

    export function OnScreenNavigation(div, d3Chart, persistentViewState) {
        var that = this;
        
        InteractiveDataDisplay.NavigationPanel(d3Chart, div);
        var probePullDiv = $("<div></div>").addClass("dsv-onscreennavigation-probepull").appendTo(div);
        var probePull = new ProbePull(probePullDiv, d3Chart.centralPart);


    }
}