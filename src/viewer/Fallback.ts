/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="utils.ts" />
/// <reference path="plotregistry.ts" />
/// <reference path="uncertainlineplot.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["fallback"] = {
        initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDPlot) {
            return undefined;
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {        
        },

        createPlotCardContent: function (plotInfo) {
            var content = $("<div></div>");
            if (plotInfo.displayName != undefined) {
                var titleDiv = $("<div class='dsv-plotcard-title'></div>");
                $("<div></div>").addClass('dsv-plotcard-resolved').appendTo(titleDiv).text(plotInfo.displayName);
                titleDiv.appendTo(content);
            }
            var message = "";
            if (plotInfo["error"]) message += plotInfo["error"]; 
            else message += 'kind "' + plotInfo.kind + '" is unknown';
            $("<div></div>").addClass('dsv-plotcard-unresolved').appendTo(content).text(message);

            return {
                content: content
            }
        }
    }
}