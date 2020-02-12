/// <reference path="PlotRegistry.ts" />
/// <reference path="Utils.ts" />

module InteractiveDataDisplay {
    PlotRegistry["markers"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var markerGraph = new InteractiveDataDisplay.Markers(div, chart.master);
            chart.addChild(markerGraph);
            chart.assignChildOrder(markerGraph);
            return [markerGraph];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {
            var plot = <Plot.MarkersDefinition><any>plotDefinition;
            plots[0].draw(plot, plot.titles);
        }
    }
}