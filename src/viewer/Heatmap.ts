/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="PlotRegistry.ts" />
/// <reference path="Utils.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    PlotRegistry["heatmap"] = {
        initialize(plotDefinition: PlotInfo, viewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var heatmap = new InteractiveDataDisplay.Heatmap(div, chart.master);
            chart.addChild(heatmap);

            var plots = [heatmap];
            //var getHeader = function () {
            //    return plotDefinition.displayName;
            //}

            //heatmap.getTooltip = function (xd, yd, xp, yp, probe) {
            //    var pinCoord = { x: xd, y: yd };

            //    if (heatmap_nav.x === undefined || heatmap_nav.y === undefined || heatmap_nav.f_lb === undefined || heatmap_nav.f_ub === undefined || heatmap_nav.f_median === undefined) {
            //        if (heatmap.values !== undefined && heatmap.x !== undefined && heatmap.values !== undefined) {
            //            if (pinCoord.x >= heatmap.x[0] &&
            //                pinCoord.x <= heatmap.x[heatmap.x.length - 1] &&
            //                pinCoord.y >= heatmap.y[0] &&
            //                pinCoord.y <= heatmap.y[heatmap.y.length - 1]) {

            //                var val = getArrayValue(pinCoord.x, pinCoord.y, heatmap.x, heatmap.y, heatmap.values, heatmap.mode);

            //                var result = $("<div></div>");
            //                $("<div></div>").addClass("probecard-title").text(getHeader()).appendTo(result);
            //                $("<div></div>").css("margin-left", 10).text("value: " + heatmap.f_formatter.toString(val)).appendTo(result);

            //                return result;
            //            }
            //        }
            //    } else {
            //        if (pinCoord.x >= heatmap_nav.x[0] &&
            //            pinCoord.x <= heatmap_nav.x[heatmap_nav.x.length - 1] &&
            //            pinCoord.y >= heatmap_nav.y[0] &&
            //            pinCoord.y <= heatmap_nav.y[heatmap_nav.y.length - 1]) {

            //            var lb = getArrayValue(pinCoord.x, pinCoord.y, heatmap_nav.x, heatmap_nav.y, heatmap_nav.f_lb, heatmap_nav.mode);
            //            var ub = getArrayValue(pinCoord.x, pinCoord.y, heatmap_nav.x, heatmap_nav.y, heatmap_nav.f_ub, heatmap_nav.mode);
            //            var median = getArrayValue(pinCoord.x, pinCoord.y, heatmap_nav.x, heatmap_nav.y, heatmap_nav.f_median, heatmap_nav.mode);

            //            var result = $("<div></div>");
            //            $("<div></div>").addClass("probecard-title").text(getHeader()).appendTo(result);
            //            $("<div></div>").css("margin-left", 10).text("median: " + heatmap_nav.f_median_formatter.toString(median)).appendTo(result);
            //            $("<div></div>").css("margin-left", 10).text("lower 68%: " + heatmap_nav.f_lb_formatter.toString(lb)).appendTo(result);
            //            $("<div></div>").css("margin-left", 10).text("upper 68%: " + heatmap_nav.f_ub_formatter.toString(ub)).appendTo(result);

            //            var checkBoxCnt = $("<div></div>").css("display", "inline-block").appendTo(result);

            //            var showSimilarBtn = $("<div></div>").addClass("checkButton").appendTo(checkBoxCnt);

            //            showSimilarBtn.click(function () {
            //                if (showSimilarBtn.hasClass("checkButton-checked")) {
            //                    showSimilarBtn.removeClass("checkButton-checked");
            //                    viewState["uncertaintyRange"] = undefined;
            //                    viewState["probesViewModel"].selectProbe(-1);
            //                }
            //                else {
            //                    $(".checkButton").removeClass("checkButton-checked");
            //                    showSimilarBtn.addClass("checkButton-checked");
            //                    viewState["uncertaintyRange"] = { min: lb, max: ub, probeid: probe.id };
            //                    viewState["probesViewModel"].selectProbe(probe.id);
            //                }
            //            });

            //            if (probe !== undefined && (viewState["uncertaintyRange"] !== undefined && probe.id === viewState["uncertaintyRange"].probeid)) {
            //                $(".checkButton").removeClass("checkButton-checked");
            //                showSimilarBtn.addClass("checkButton-checked");
            //                viewState["uncertaintyRange"] = { min: lb, max: ub, probeid: probe.id };
            //            }

            //            $($("<span style='margin-left:3px;'>highlight similar</span>")).appendTo(checkBoxCnt);

            //            return result;
            //        }
            //    }
            //    return undefined;
            //}

            //    var callback = function (vs, propName, extraData) {
            //        if (plots === undefined && plots[0] === undefined && plots[1] === undefined) {
            //            viewState.unsubscribe(this);
            //            return;
            //        }

            //        if (plots[1].f_median === undefined || plots[1].f_lb === undefined || plots[1].f_ub === undefined) {
            //            return;
            //        }

            //        if (propName === "uncertaintyRange") {
            //            var range = vs.uncertaintyRange;

            //            if (range === undefined) {
            //                plots[1].host.css("visibility", "hidden");
            //                return;
            //            }

            //            var fmedian = plots[1].f_median;
            //            var shadeData = new Array(fmedian.length);
            //            for (var i = 0; i < fmedian.length; i++) {
            //                var fmedian_i = fmedian[i]
            //                shadeData[i] = new Array(fmedian_i.length);
            //                for (var j = 0; j < fmedian_i.length; j++) {
            //                    shadeData[i][j] = (plots[1].f_lb[i][j] < range.max && plots[1].f_ub[i][j] > range.min) ? 0 : 1;
            //                }
            //            }
            //            plots[1].draw({ x: plots[1].x, y: plots[1].y, f: shadeData });
            //            plots[1].host.css("visibility", "visible");
            //        }
            //    }
            //    if (plots !== undefined && plots[0] !== undefined && plots[1] !== undefined && viewState !== undefined) viewState.subscribe(callback);

                return plots;
        },

        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {
            var heatmap = <Plot.HeatmapDefinition><any>plotDefinition;
            //    plots[0].range = get2dRange(r.values);
                plots[0].draw(heatmap, heatmap.titles);
        }
    }
}