/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="PlotRegistry.ts" />

module InteractiveDataDisplay {
    PlotRegistry["area"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var bandgraph = new InteractiveDataDisplay.Area(div, chart.master);
            chart.addChild(bandgraph);
            chart.assignChildOrder(bandgraph);
            return [bandgraph];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {        
            // The method actually just passed data from plotDefinition to IDD plot
            // except it also can sort data series by x.
            var plot = plots[0];
            var bandDef = <Plot.AreaDefinition><any>plotDefinition;
            plot.draw(bandDef);
        }
    }
}