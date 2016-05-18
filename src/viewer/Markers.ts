/// <reference path="PlotRegistry.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="Utils.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["markers"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var markerGraph = new InteractiveDataDisplay.Markers(div, chart.master);
            chart.addChild(markerGraph);
            return [markerGraph];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {
            var plot = <Plot.MarkersDefinition><any>plotDefinition;
            plots[0].draw(plot, plot.titles);

            var getRange = function (arr) {
                return { min: GetMin(arr), max: GetMax(arr) }
            }

            var res = {
                x: { min: GetMin(plot.x), max: GetMax(plot.x) },
                y: { min: GetMin(plot.y), max: GetMax(plot.y) }
            };
            return res;
        }
    }
}