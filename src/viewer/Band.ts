/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="PlotRegistry.ts" />
/// <reference path="UncertainLinePlot.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["band"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var bandgraph = new InteractiveDataDisplay.Area(div, chart.master);
            chart.addChild(bandgraph);
            return [bandgraph];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {        
            // The method actually just passed data from plotDefinition to IDD plot
            // except it also can sort data series by x.
            var plot = plots[0];
            var bandDef = <Plot.BandDefinition><any>plotDefinition;
            var drawArgs = {
                x: [],
                y1: [],
                y2: [],
                fill: undefined,
            }

            drawArgs.x = bandDef.x;

            var y1 = bandDef.y1;
            var y2 = bandDef.y2;
           
            var len = Math.min(drawArgs.x.length,
                Math.min(y1.length, y2.length));
            drawArgs.y1 = CutArray(y1, len);
            drawArgs.y2 = CutArray(y2, len);
            drawArgs.x = CutArray(drawArgs.x, len);
            drawArgs.fill = bandDef.fill;
   
            plot.draw(drawArgs);
        }
    }
}