/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="utils.ts" />
/// <reference path="plotregistry.ts" />
/// <reference path="uncertainlineplot.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["band"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            var bandgraph = chart.area(plotDefinition.displayName);
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
        },

        createPlotCardContent: function (plotInfo) {
            var bandDef = <Plot.BandDefinition><any>plotInfo;
            var titleDiv = $("<div class='dsv-plotcard-title'></div>");
            var canvas = $("<canvas class='dsv-plotcard-thumbnail'></canvas>").appendTo(titleDiv);
            $("<div></div>").addClass('dsv-plotcard-resolved').appendTo(titleDiv).text(plotInfo.displayName);

            canvas.prop({ width: 20, height: 20 });
            var ctx = (<HTMLCanvasElement>canvas.get(0)).getContext("2d");

            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = bandDef.fill;
            ctx.fillStyle = bandDef.fill;

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

            return {
                content: titleDiv
            }
        },
        subscribeToViewState: function (plots, persistentViewState) {

        },
    }
}