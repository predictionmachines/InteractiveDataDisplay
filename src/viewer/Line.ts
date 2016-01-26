/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="chartviewer.d.ts" />
/// <reference path="utils.ts" />
/// <reference path="plotregistry.ts" />
/// <reference path="uncertainlineplot.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["line"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var plot = new UncertainLinePlot(div, chart.master);
            chart.addChild(plot);
            return [plot];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {        
            // The method actually just passed data from plotDefinition to IDD plot
            // except it also can sort data series by x.
            var plot = plots[0];
            var lineDef = <Plot.LineDefinition><any>plotDefinition;
            var drawArgs = {
                x: [],
                y_mean: [],
                stroke: undefined,
                thickness: undefined,
                fill_68: undefined,
                fill_95: undefined,
                y_u68: undefined,
                y_u95: undefined,
                y_l68: undefined,
                y_l95: undefined
            }

            drawArgs.stroke = lineDef.stroke;
            drawArgs.thickness = lineDef.thickness;
            drawArgs.x = lineDef.x;

            var doSort = (!lineDef.treatAs || lineDef.treatAs == "function") && !IsOrderedArray(drawArgs.x);
            if (Array.isArray(lineDef.y)) { // certain values
                drawArgs.y_mean = <number[]>lineDef.y;
                if (doSort) {
                    var len = Math.min(drawArgs.x.length, plot.y.length);
                    drawArgs.y_mean = CutArray(plot.y, len);
                    drawArgs.x = CutArray(drawArgs.x, len);
                    if (doSort) {
                        var forSort = [];
                        for (var i = 0; i < len; i++)
                            if (!isNaN(drawArgs.x[i])) {
                                forSort.push({
                                    x: drawArgs.x[i],
                                    y_mean: drawArgs.y_mean[i],
                                });
                            }
                        forSort.sort(function (a, b) { return a.x - b.x; });
                        drawArgs.y_mean = [];
                        drawArgs.x = [];
                        for (var i = 0; i < forSort.length; i++) {
                            drawArgs.y_mean.push(forSort[i].y_mean);
                            drawArgs.x.push(forSort[i].x);
                        }
                    }
                }
            } else { // uncertain values
                var y = <Plot.Quantiles>lineDef.y;
                var len = Math.min(drawArgs.x.length,
                    Math.min(y.median.length,
                        Math.min(y.upper68.length,
                            Math.min(y.lower68.length,
                                Math.min(y.upper95.length, y.lower95.length)))));
                drawArgs.y_mean = CutArray(y.median, len);
                drawArgs.y_u68 = CutArray(y.upper68, len);
                drawArgs.y_l68 = CutArray(y.lower68, len);
                drawArgs.y_u95 = CutArray(y.upper95, len);
                drawArgs.y_l95 = CutArray(y.lower95, len);
                drawArgs.x = CutArray(drawArgs.x, len);
                if (doSort) {
                    var forSort = [];
                    for (var i = 0; i < len; i++) {
                        if (!isNaN(drawArgs.x[i])) {
                            forSort.push({
                                x: drawArgs.x[i],
                                y_mean: drawArgs.y_mean[i],
                                y_u68: drawArgs.y_u68[i],
                                y_l68: drawArgs.y_l68[i],
                                y_u95: drawArgs.y_u95[i],
                                y_l95: drawArgs.y_l95[i]
                            });
                        }
                    }
                    forSort.sort(function (a, b) { return a.x - b.x; });
                    drawArgs.y_mean = [];
                    drawArgs.y_u68 = [];
                    drawArgs.y_l68 = [];
                    drawArgs.y_u95 = [];
                    drawArgs.y_l95 = [];
                    drawArgs.x = [];
                    for (var i = 0; i < forSort.length; i++) {
                        drawArgs.y_mean.push(forSort[i].y_mean);
                        drawArgs.y_u68.push(forSort[i].y_u68);
                        drawArgs.y_l68.push(forSort[i].y_l68);
                        drawArgs.y_u95.push(forSort[i].y_u95);
                        drawArgs.y_l95.push(forSort[i].y_l95);
                        drawArgs.x.push(forSort[i].x);
                    }
                }
                drawArgs.fill_68 = lineDef.fill68;
                drawArgs.fill_95 = lineDef.fill95;
            }
            plot.draw(drawArgs);
            //return { x: { from: GetMin(plot.x), to: GetMax(plot.x), y: { from: GetMin(drawArgs.y_mean), to: GetMax(drawArgs.y_mean) } } };
        },

        createPlotCardContent: function (plotInfo) {
            var lineDef = <Plot.LineDefinition><any>plotInfo;
            var titleDiv = $("<div class='dsv-plotcard-title'></div>");
            var canvas = $("<canvas class='dsv-plotcard-thumbnail'></canvas>").appendTo(titleDiv);
            $("<div></div>").addClass('dsv-plotcard-resolved').appendTo(titleDiv).text(plotInfo.displayName);

            canvas.prop({ width: 20, height: 20 });
            var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");
            var isUncertainData = !Array.isArray(lineDef.y);
            if (isUncertainData) {
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = lineDef.fill68;
                ctx.fillStyle = lineDef.fill68;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 10);
                ctx.lineTo(10, 20);
                ctx.lineTo(20, 20);
                ctx.lineTo(20, 10);
                ctx.lineTo(10, 0);
                ctx.lineTo(0, 0);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 5);
                ctx.lineTo(15, 20);
                ctx.lineTo(20, 20);
                ctx.lineTo(20, 15);
                ctx.lineTo(5, 0);
                ctx.lineTo(0, 0);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }

            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = lineDef.stroke;
            ctx.lineWidth = lineDef.thickness;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(20, 20);
            ctx.stroke();
            ctx.closePath();

            return {
                content: titleDiv
            }
        },
        subscribeToViewState: function (plots, persistentViewState) {

        },
    }
}