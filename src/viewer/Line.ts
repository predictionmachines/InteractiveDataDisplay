/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="PlotRegistry.ts" />

module ChartViewer {
    PlotRegistry["line"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var plot = new InteractiveDataDisplay.Polyline(div, chart.master);
            chart.addChild(plot);
            return [plot];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {        
            // The method actually just passed data from plotDefinition to IDD plot
            // except it also can sort data series by x.
            var plot = plots[0];
            var lineDef = <Plot.LineDefinition><any>plotDefinition;
            plot.draw(lineDef);
        }
    }
}