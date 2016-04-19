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
            markerGraph.getTooltip = function (xd, yd, xp, yp) {
                if (markerGraph.ttData === undefined || markerGraph.ttFormatters === undefined)
                    return undefined;

                var resultMarkers = markerGraph.findToolTipMarkers(xd, yd, xp, yp);
                var buildTooltip = function (markerInfo) {

                    var index = markerInfo.index;

                    var content = undefined;
                    for (var prop in markerGraph.ttData) {
                        if (content) {
                            if (markerGraph.ttData[prop] != undefined && markerGraph.ttData[prop] instanceof Array)
                                if (markerGraph.ttData[prop].Column != undefined)
                                    content += "<br/>" + markerGraph.ttData[prop].Column + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                                else
                                    content += "<br/>" + prop + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                        } else {
                            if (markerGraph.ttData[prop] != undefined)
                                if (markerGraph.ttData[prop].Column != undefined)
                                    content = markerGraph.ttData[prop].Column + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                                else
                                    content = prop + ": " + markerGraph.ttFormatters[prop].toString(markerGraph.ttData[prop][index]);
                        }
                    }
                    content += "<br/>index: " + index;
                    return "<div style='margin-left: 10px; font-size: 11pt;'>" + content + "</div>";
                };

                if (resultMarkers.length > 0) {
                    var result = $("<div></div>");
                    var toolTip = plotDefinition.displayName != undefined ? plotDefinition.displayName : '(not specified)';
                    var ttHeader = $("<div></div>").addClass("probecard-title").text(toolTip);
                    toolTip = "";
                    for (var i = 0; i < resultMarkers.length; i++) {
                        toolTip += buildTooltip(resultMarkers[i]);
                        if (i < resultMarkers.length - 1) {
                            toolTip += "<br/>";
                        }
                    }
                    var ttContent = $("<div>" + toolTip + "</div>");
                    ttHeader.appendTo(result);
                    ttContent.appendTo(result);
                    return result;
                }
            };
            return [markerGraph];
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {
            var plot = <Plot.MarkersDefinition><any>plotDefinition;
            var toolTipData = {
                x: undefined,
                y: undefined,
                median: undefined,
                color: undefined,
                size: undefined
            };
            var toolTipFormatters = {};
            var colorRange, sizeRange;
           
            toolTipData[getTitle(plotDefinition, "x")] = plot.x;

            if (plot.y !== undefined && InteractiveDataDisplay.Utils.isArray(plot.y)) {
                toolTipData[getTitle(plotDefinition, "y")] = plot.y;
            }
           
            if (!InteractiveDataDisplay.Utils.isArray(plot.y)) {
                var y = <Plot.Quantiles><any>plot.y;

                toolTipData[getTitle(plotDefinition, "y") + " median"] = y.median;
                toolTipData["upper 68%"] = y.upper68;
                toolTipData["lower 68%"] = y.lower68;
                toolTipData["upper 95%"] = y.upper95;
                toolTipData["lower 95%"] = y.lower95;
            } 

            if (InteractiveDataDisplay.Utils.isArray(plot.color)) {
                toolTipData[getTitle(plotDefinition, "color")] = plot.color;
            } else if (plot.color && typeof plot.color["median"] !== "undefined") {
                var color = <Plot.Quantiles>plot.color;
                if (plot.titles != undefined && plot.titles.color != undefined)
                    toolTipData[getTitle(plotDefinition, "color") + " median"] = color.median;
                toolTipData["upper (95%)"] = color.upper95;
                toolTipData["lower (95%)"] = color.lower95;
            }

            if (plot.size && typeof plot.size["median"] !== "undefined") {
                var size = <Plot.Quantiles>plot.size;
                if (plot.titles != undefined && plot.titles.size != undefined)
                    toolTipData[getTitle(plotDefinition, "size") + " median"] = size.median;
                else toolTipData["size median"] = size.median;
                toolTipData["upper 95%"] = size.upper95;
                toolTipData["lower 95%"] = size.lower95;
            }
            else if (InteractiveDataDisplay.Utils.isArray(plot.size)) {
                toolTipData[getTitle(plotDefinition, "size")] = plot.size;
            }
            plots[0].draw(plot, plot.titles);

            var getRange = function (arr) {
                return { min: GetMin(arr), max: GetMax(arr) }
            }

            for (var prop in toolTipData) {
                toolTipFormatters[prop] = getFormatter(toolTipData[prop], getRange);
            }

            plots[0].ttData = toolTipData;
            plots[0].ttFormatters = toolTipFormatters;

            var res = {
                x: { min: GetMin(plot.x), max: GetMax(plot.x) },
                y: { min: GetMin(plot.y), max: GetMax(plot.y) },
                color: undefined,
                size: undefined
            };
            if (colorRange)
                res.color = colorRange;
            if (sizeRange)
                res.size = sizeRange;
            return res;
        }
    }
}