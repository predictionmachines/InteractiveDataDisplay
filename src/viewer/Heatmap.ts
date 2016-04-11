/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="plotregistry.ts" />
/// <reference path="utils.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;

module ChartViewer {
    module Heatmap {
        export function makeHeatmapData(x, y, z, isDiscrete): any {
            if (!x || !y || !z) return {};
            if (!x.length || !y.length || (z.v && !z.v.length) || (z.m && (!z.m.length || !z.lb68.length || !z.ub68.length))) return {};

            // Convert to Array.
            x = Array.prototype.slice.call(x);
            y = Array.prototype.slice.call(y);

            if (z.v) {
                z.v = Array.prototype.slice.call(z.v);
            } else if (z.m) {
                z.m = Array.prototype.slice.call(z.m);
                z.lb68 = Array.prototype.slice.call(z.lb68);
                z.ub68 = Array.prototype.slice.call(z.ub68);
            }

            // All arrays must have the same length.
            if (z.v && (x.length !== y.length || x.length !== z.v.length || y.length !== z.v.length)) {
                x.length = y.length = z.v.length = Math.min(x.length, y.length, z.v.length);
            } else if (z.m && (x.length !== y.length || x.length !== z.m.length || y.length !== z.m.length || z.m.length !== z.lb68.length || z.m.length !== z.ub68.length)) {
                x.length = y.length = z.m.length = z.lb68.length = z.ub68.length = Math.min(x.length, y.length, z.m.length, z.lb68.length, z.ub68.length);
            }

            // Remember indices in unsorted arrays.
            var ix = x.map(function (a, i) { return { v: a, i: i }; });
            var iy = y.map(function (a, i) { return { v: a, i: i }; });

            // Get sorted arrays.
            var sx = ix.sort(function (a, b) { return a.v < b.v ? -1 : a.v > b.v ? 1 : 0; });
            var sy = iy.sort(function (a, b) { return a.v < b.v ? -1 : a.v > b.v ? 1 : 0; });

            // Get unique sorted arrays of grid dimensions.
            var ux = sx.filter(function (a, i) { return !i || a.v != sx[i - 1].v; }).map(function (a) { return a.v; });
            var uy = sy.filter(function (a, i) { return !i || a.v != sy[i - 1].v; }).map(function (a) { return a.v; });

            // Using initial indices get arrays of grid indices for dimensions.
            var i, j, ifx = [], ify = [];
            i = 0; sx.forEach(function (a, k) { return ifx[a.i] = !k ? 0 : a.v != sx[k - 1].v ? ++i : i; });
            i = 0; sy.forEach(function (a, k) { return ify[a.i] = !k ? 0 : a.v != sy[k - 1].v ? ++i : i; });

            var f, m, lb68, ub68;

            // Initializes 2d array with NaNs.
            var initNaNs = function (d1, d2) {
                var a = [];
                for (var i = 0; i < d1; ++i) {
                    a[i] = [];
                    for (var j = 0; j < d2; ++j) {
                        a[i][j] = NaN;
                    }
                }
                return a;
            }

            if (z.v) {
                f = initNaNs(ux.length, uy.length);

                for (i = 0; i < z.v.length; ++i) {
                    f[ifx[i]][ify[i]] = z.v[i];
                }
            } else {
                m = initNaNs(ux.length, uy.length);
                lb68 = initNaNs(ux.length, uy.length);
                ub68 = initNaNs(ux.length, uy.length);

                for (i = 0; i < z.m.length; ++i) {
                    m[ifx[i]][ify[i]] = z.m[i];
                    lb68[ifx[i]][ify[i]] = z.lb68[i];
                    ub68[ifx[i]][ify[i]] = z.ub68[i];
                }
            }


            if (isDiscrete) {
                if (ux.length >= 2) {
                    var newx = [];
                    newx.push(ux[0] - (ux[1] - ux[0]) / 2);
                    var m;
                    for (m = 1; m < ux.length; m++) {
                        newx.push(ux[m] - (ux[m] - ux[m - 1]) / 2);
                    }
                    newx.push(ux[ux.length - 1] + (ux[ux.length - 1] - ux[ux.length - 2]) / 2);
                    ux = newx;
                }

                if (uy.length >= 2) {
                    var newy = [];
                    newy.push(uy[0] - (uy[1] - uy[0]) / 2);
                    var k;
                    for (k = 1; k < uy.length; k++) {
                        newy.push(uy[k] - (uy[k] - uy[k - 1]) / 2);
                    }
                    newy.push(uy[uy.length - 1] + (uy[uy.length - 1] - uy[uy.length - 2]) / 2);
                    uy = newy;
                }
            }


            return {
                x: ux,
                y: uy,
                f: f,
                m: m,
                lb68: lb68,
                ub68: ub68
            };
        }

        var defaultPalette = InteractiveDataDisplay.ColorPalette.parse("black,#e5e5e5");

        export function BuildPalette(plot: Plot.HeatmapDefinition, min, max) {
            var d3Palette = plot.colorPalette ? InteractiveDataDisplay.ColorPalette.parse(plot.colorPalette) : defaultPalette;
            if (d3Palette.isNormalized) {
                d3Palette = d3Palette.absolute(min, max);
            }
            return d3Palette;
        }
    }


    PlotRegistry["heatmap"] = {
        initialize(plotDefinition: PlotInfo, viewState, chart: IDDPlot) {
            var div = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName)
                .appendTo(chart.host);
            var heatmap = new InteractiveDataDisplay.Heatmap(div, chart.master);
            chart.addChild(heatmap);
            
            var div2 = $("<div></div>")
                .attr("data-idd-name", plotDefinition.displayName + "__nav_")
                .appendTo(chart.host);
            var heatmap_nav = new InteractiveDataDisplay.Heatmap(div2, chart.master);
            heatmap_nav.getLegend = function () {
                return undefined;
            };
            chart.addChild(heatmap_nav);
            var plots = [heatmap, heatmap_nav];
           
            heatmap_nav.opacity = 0.5;
            heatmap_nav.palette = InteractiveDataDisplay.ColorPalette.parse("0=#00000000=#00000080=1");
            heatmap_nav.getTooltip = function (xd, yd, xp, yp) {
                return undefined;
            }
            var getHeader = function () {
                return plotDefinition.displayName;
            }

            heatmap.getTooltip = function (xd, yd, xp, yp, probe) {
                var pinCoord = { x: xd, y: yd };

                if (heatmap_nav.x === undefined || heatmap_nav.y === undefined || heatmap_nav.f_lb === undefined || heatmap_nav.f_ub === undefined || heatmap_nav.f_median === undefined) {
                    if (heatmap.values !== undefined && heatmap.x !== undefined && heatmap.values !== undefined) {
                        if (pinCoord.x >= heatmap.x[0] &&
                            pinCoord.x <= heatmap.x[heatmap.x.length - 1] &&
                            pinCoord.y >= heatmap.y[0] &&
                            pinCoord.y <= heatmap.y[heatmap.y.length - 1]) {

                            var val = getArrayValue(pinCoord.x, pinCoord.y, heatmap.x, heatmap.y, heatmap.values, heatmap.mode);

                            var result = $("<div></div>");
                            $("<div></div>").addClass("probecard-title").text(getHeader()).appendTo(result);
                            $("<div></div>").css("margin-left", 10).text("value: " + heatmap.f_formatter.toString(val)).appendTo(result);

                            return result;
                        }
                    }
                } else {
                    if (pinCoord.x >= heatmap_nav.x[0] &&
                        pinCoord.x <= heatmap_nav.x[heatmap_nav.x.length - 1] &&
                        pinCoord.y >= heatmap_nav.y[0] &&
                        pinCoord.y <= heatmap_nav.y[heatmap_nav.y.length - 1]) {

                        var lb = getArrayValue(pinCoord.x, pinCoord.y, heatmap_nav.x, heatmap_nav.y, heatmap_nav.f_lb, heatmap_nav.mode);
                        var ub = getArrayValue(pinCoord.x, pinCoord.y, heatmap_nav.x, heatmap_nav.y, heatmap_nav.f_ub, heatmap_nav.mode);
                        var median = getArrayValue(pinCoord.x, pinCoord.y, heatmap_nav.x, heatmap_nav.y, heatmap_nav.f_median, heatmap_nav.mode);

                        var result = $("<div></div>");
                        $("<div></div>").addClass("probecard-title").text(getHeader()).appendTo(result);
                        $("<div></div>").css("margin-left", 10).text("median: " + heatmap_nav.f_median_formatter.toString(median)).appendTo(result);
                        $("<div></div>").css("margin-left", 10).text("lower 68%: " + heatmap_nav.f_lb_formatter.toString(lb)).appendTo(result);
                        $("<div></div>").css("margin-left", 10).text("upper 68%: " + heatmap_nav.f_ub_formatter.toString(ub)).appendTo(result);

                        var checkBoxCnt = $("<div></div>").css("display", "inline-block").appendTo(result);

                        var showSimilarBtn = $("<div></div>").addClass("checkButton").appendTo(checkBoxCnt);

                        showSimilarBtn.click(function () {
                            if (showSimilarBtn.hasClass("checkButton-checked")) {
                                showSimilarBtn.removeClass("checkButton-checked");
                                viewState["uncertaintyRange"] = undefined;
                                viewState["probesViewModel"].selectProbe(-1);
                            }
                            else {
                                $(".checkButton").removeClass("checkButton-checked");
                                showSimilarBtn.addClass("checkButton-checked");
                                viewState["uncertaintyRange"] = { min: lb, max: ub, probeid: probe.id };
                                viewState["probesViewModel"].selectProbe(probe.id);
                            }
                        });

                        if (probe !== undefined && (viewState["uncertaintyRange"] !== undefined && probe.id === viewState["uncertaintyRange"].probeid)) {
                            $(".checkButton").removeClass("checkButton-checked");
                            showSimilarBtn.addClass("checkButton-checked");
                            viewState["uncertaintyRange"] = { min: lb, max: ub, probeid: probe.id };
                        }

                        $($("<span style='margin-left:3px;'>highlight similar</span>")).appendTo(checkBoxCnt);

                        return result;
                    }
                }
                return undefined;
            }

            var callback = function (vs, propName, extraData) {
                if (plots === undefined && plots[0] === undefined && plots[1] === undefined) {
                    viewState.unsubscribe(this);
                    return;
                }

                if (plots[1].f_median === undefined || plots[1].f_lb === undefined || plots[1].f_ub === undefined) {
                    return;
                }

                if (propName === "uncertaintyRange") {
                    var range = vs.uncertaintyRange;

                    if (range === undefined) {
                        plots[1].host.css("visibility", "hidden");
                        return;
                    }

                    var fmedian = plots[1].f_median;
                    var shadeData = new Array(fmedian.length);
                    for (var i = 0; i < fmedian.length; i++) {
                        var fmedian_i = fmedian[i]
                        shadeData[i] = new Array(fmedian_i.length);
                        for (var j = 0; j < fmedian_i.length; j++) {
                            shadeData[i][j] = (plots[1].f_lb[i][j] < range.max && plots[1].f_ub[i][j] > range.min) ? 0 : 1;
                        }
                    }
                    plots[1].draw({ x: plots[1].x, y: plots[1].y, f: shadeData });
                    plots[1].host.css("visibility", "visible");
                }
            }
            if (plots !== undefined && plots[0] !== undefined && plots[1] !== undefined && viewState !== undefined) viewState.subscribe(callback);

            return plots;
        },
 
        draw(plots: IDDPlot[], plotDefinition: PlotInfo) {
            var heatmap = <Plot.HeatmapDefinition><any>plotDefinition;
            var drawArgs = {
                x: undefined,
                y: undefined,
                f: undefined,
                palette: undefined
            };

            if (!heatmap.x || !heatmap.y || !heatmap.values) return;
            var isOneDimensional = heatmap.values["median"] !== undefined && !InteractiveDataDisplay.Utils.isArray(heatmap.values["median"][0])
                || !InteractiveDataDisplay.Utils.isArray(heatmap.values[0]);

            var min = 0, max = 1;
            if (heatmap.values["median"]) {
                var unc_values = <Plot.Quantiles>heatmap.values;
                var r;
                if (isOneDimensional) {
                    r = Heatmap.makeHeatmapData(heatmap.x, heatmap.y, {
                        v: undefined,
                        m: unc_values.median,
                        lb68: unc_values.lower68,
                        ub68: unc_values.upper68
                    }, heatmap.treatAs === Plot.HeatmapRenderType.Discrete);
                } else {
                    r = {
                        m: unc_values.median,
                        lb68: unc_values.lower68,
                        ub68: unc_values.upper68,
                        x: heatmap.x,
                        y: heatmap.y
                    };
                }

                drawArgs.f = r.m;
                drawArgs.x = r.x;
                drawArgs.y = r.y;


                plots[1].x = r.x;
                plots[1].y = r.y;

                plots[0].values = undefined;
                plots[0].x = undefined;
                plots[0].y = undefined;

                plots[1].f_median = r.m;
                plots[1].f_median_formatter = getFormatter(r.m, get2dRange);

                plots[1].f_lb = r.lb68;
                plots[1].f_lb_formatter = getFormatter(r.lb68, get2dRange);

                plots[1].f_ub = r.ub68;
                plots[1].f_ub_formatter = getFormatter(r.ub68, get2dRange);
            }
            else {
                var values = <any>heatmap.values;
                var r;
                if (isOneDimensional) {
                    r = Heatmap.makeHeatmapData(heatmap.x, heatmap.y, {
                        v: values
                    }, heatmap.treatAs === Plot.HeatmapRenderType.Discrete);
                } else {
                    r = {
                        f: values,
                        x: heatmap.x,
                        y: heatmap.y
                    };
                }

                drawArgs.f = r.f;
                plots[0].values = r.f;
                plots[0].f_formatter = getFormatter(r.f, get2dRange);

                plots[0].x = r.x;
                plots[0].y = r.y;
                drawArgs.x = r.x;
                drawArgs.y = r.y;

                plots[1].f_median = undefined;
                plots[1].f_median_formatter = undefined;
                plots[1].f_lb = undefined;
                plots[1].f_lb_formatter = undefined;
                plots[1].f_ub = undefined;
                plots[1].f_ub_formatter = undefined;
                plots[1].x = undefined;
                plots[1].y = undefined;
            }
            plots[0].range = get2dRange(drawArgs.f);
            drawArgs.palette = Heatmap.BuildPalette(heatmap, plots[0].range.min, plots[0].range.max);
            plots[0].draw(drawArgs, heatmap.titles);

        }
    }
}