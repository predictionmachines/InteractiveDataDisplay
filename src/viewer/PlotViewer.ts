/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="onScreenNavigation.ts" />
declare var InteractiveDataDisplay: any;
declare var Microsoft: any;
module ChartViewer {

    export type IDDPlot = any;
    export type PlotId = string;

    export type PlotViewerItem = {
        Id: PlotId;
        Definition: PlotInfo;
        Plots?: IDDPlot[];
        ZIndex?: number;
    }

    export interface PlotViewerItems {
        [id: string]: PlotViewerItem;
    }

    export class PlotViewer {
        currentPlots: PlotViewerItems = {};
        iddChart: IDDPlot;
        bingMapsPlot: IDDPlot;
        persistentViewState: any;

        div: JQuery;
        iddDiv: JQuery;
        propagateNavigationDiv: JQuery;
        xAxisTitle: JQuery;
        yAxisTitle: JQuery;

        constructor(div: JQuery, navigationDiv, persistentViewState, transientViewState) {
            this.div = div;
            var that = this;
            var iddDiv = this.iddDiv = $("<div data-idd-plot='chart'></div>").appendTo(div);
            iddDiv.width(div.width());
            iddDiv.height(div.height());

            var iddChart = this.iddChart = InteractiveDataDisplay.asPlot(iddDiv);
            iddChart.legend.isVisible = false;
            iddChart.isToolTipEnabled = false;
            iddChart.doFitOnDataTransformChanged = false;
        
            //adding onscreen navigation
            var onscreenNavigationContainer = $("<div></div>").addClass("dsv-onscreennavigationcontainer").attr("data-idd-placement", "center").appendTo(navigationDiv);
            var onscreenNavigationDiv = $("<div></div>").addClass("dsv-onscreennavigation").appendTo(onscreenNavigationContainer);
            var onscreenNavigation = new OnScreenNavigation(onscreenNavigationDiv, iddChart, persistentViewState);

            /* adds probes plot */
            var probesPlot_div = $("<div></div>")
                .attr("data-idd-name", "draggableMarkers")
                .appendTo(iddChart.host);
            var probesPlot = new InteractiveDataDisplay.DOMPlot(probesPlot_div, iddChart);
            probesPlot.order = 9007199254740991;
            iddChart.addChild(probesPlot);

            this.persistentViewState = persistentViewState;
            persistentViewState.probesViewModel.getProbeContent = function (probe) {
                var children = iddChart.children;
                var result = [];
                for (var i = 0; i < children.length; i++) {
                    if (children[i].isVisible) {
                        var xd = children[i].xDataTransform ? children[i].xDataTransform.plotToData(probe.location.x) : probe.location.x;
                        var yd = children[i].yDataTransform ? children[i].yDataTransform.plotToData(probe.location.y) : probe.location.y;
                        var tt = children[i].getTooltip(probe.location.x, probe.location.y, xd, yd, true);
                        if (tt !== undefined) {
                            result.push(tt);
                        }
                    }
                }
                if (result.length > 0) {
                    return result;
                } else
                    return undefined;
            }

            var addNewProbe = function (probe) {
                var id = probe.id;
                var x = probe.location.x;
                var y = probe.location.y;

                var draggable = $("<div></div>");
                draggable.addClass("dragPoint");

                probesPlot.add(draggable, 'none', x , y, undefined, undefined, 0.5, 1);
                var children = probesPlot.domElements;
                var addedDragable = children[children.length - 1];
                addedDragable.id = id;

                draggable.draggable({
                    containment: probesPlot.master.centralPart[0],
                    scroll: false,
                    drag: function () {
                    },
                    stop: function (event, ui) {
                        var pinCoord = { x: addedDragable._x, y: addedDragable._y };
                        persistentViewState.probesViewModel.updateProbe(id, pinCoord);
                    },
                    start: function () {
                    }
                });

                if (probe.selected) {
                    createSmallProbe(draggable,id, "#365C95");
                } else {
                    createSmallProbe(draggable, id);
                }
            }
            probesPlot.host.droppable({
                accept: ".probe",
                tolerance: "fit",
                drop: function (event, ui) {
                    var pos = $(this).offset();
                    var probePosition = {
                        x: ui.position.left + ui.draggable.width() / 2, 
                        y: ui.position.top + ui.draggable.height()
                    };

                    var cs = probesPlot.coordinateTransform;
                    var x = iddChart.xDataTransform ? iddChart.xDataTransform.plotToData(cs.screenToPlotX(probePosition.x)) : cs.screenToPlotX(probePosition.x);
                    var y = iddChart.yDataTransform ? iddChart.yDataTransform.plotToData(cs.screenToPlotY(probePosition.y)) : cs.screenToPlotY(probePosition.y);

                    var id = persistentViewState.probesViewModel.addProbe({ x: x, y: y });
                    addNewProbe({ id: id, location: { x: x, y: y } });
                },
            });

            persistentViewState.probesViewModel.subscribe(function (args) {
                var probe = args.probe;
                switch (args.status) {
                    case "fit":
                        var eps = 1e-7;
                        var children = probesPlot.domElements;
                        for (var i = 0; i < children.length; i++) {
                            var draggable = children[i];
                            if (draggable.id === probe.id) {
                                var curPlotRect = iddChart.visibleRect;
                                var x = iddChart.xDataTransform ? iddChart.xDataTransform.dataToPlot(draggable._x) : draggable._x;
                                var y = iddChart.yDataTransform ? iddChart.yDataTransform.dataToPlot(draggable._y) : draggable._y;

                                if (Math.abs(x - curPlotRect.x - curPlotRect.width / 2) > eps || Math.abs(y - curPlotRect.y - curPlotRect.height / 2) > eps) {
                                    iddChart.navigation.setVisibleRect({ x: x - curPlotRect.width / 2, y: y - curPlotRect.height / 2, width: curPlotRect.width, height: curPlotRect.height }, true);
                                }
                                break;
                            }
                        }
                        break;
                    case "remove":
                        var children = probesPlot.domElements;
                        for (var i = 0; i < children.length; i++) {
                            var draggable = children[i];
                            if (draggable.id === probe.id) {
                                probesPlot.remove(draggable);
                                break;
                            }
                        }
                        break;
                    case "unselected":
                        var children = probesPlot.domElements;
                        for (var i = 0; i < children.length; i++) {
                            var possibleProbe = children[i];
                            createSmallProbe(possibleProbe, possibleProbe.id);
                        }
                        break;
                    case "selected":
                        var children = probesPlot.domElements;
                        for (var i = 0; i < children.length; i++) {
                            var possibleProbe = children[i];
                            if (possibleProbe.id === probe.id) {
                                createSmallProbe(possibleProbe, possibleProbe.id, "#365C95");
                            } else {
                                createSmallProbe(possibleProbe, possibleProbe.id);
                            }
                        }
                        break;
                }
            });

            var existingProbes = persistentViewState.probesViewModel.getProbes();
            for (var i = 0; i < existingProbes.length; i++) {
                addNewProbe(existingProbes[i]);
            }

            iddDiv.on("visibleRectChanged", function () {
                var plotRect = iddChart.visibleRect;

                transientViewState.plotXFormatter = MathUtils.getPrintFormat(plotRect.x, plotRect.x + plotRect.width, plotRect.width / 4);
                transientViewState.plotYFormatter = MathUtils.getPrintFormat(plotRect.y, plotRect.y + plotRect.height, plotRect.height / 4);

                persistentViewState.plotRect = plotRect;
                if (persistentViewState.probesViewModel !== undefined) {
                    persistentViewState.probesViewModel.refresh();
                }
            });

            persistentViewState.subscribe(function (state, propName) {
                if (propName == "selectedPlots")
                    that.setupPlotsVisibility();
            });
        }

        private setupPlotsVisibility() {
            for (var id in this.currentPlots) {
                var p = this.currentPlots[id];
                var iddPlots = p.Plots;
                if (iddPlots) {
                    var isVisible = this.persistentViewState.selectedPlots.indexOf(p.Id) == -1;
                    for (var j = 0; j < iddPlots.length; ++j)
                        iddPlots[j].isVisible = isVisible;
                }
            }
        }

        private checkLatLon(plot: PlotInfo) {
            var isLat = function (str) {
                var lower = str.toLowerCase();
                return lower === "lat" || lower === "latitude";
            }
            var isLon = function (str) {
                var lower = str.toLowerCase();
                return lower === "lon" || lower === "longitude";
            }
            return plot["x"] !== undefined && isLon(getTitle(plot, "x")) && plot["y"] !== undefined && isLat(getTitle(plot, "y"));
        }

        private addPlot(p: PlotViewerItem) {
            var factory = PlotRegistry[p.Definition.kind] ? PlotRegistry[p.Definition.kind] : PlotRegistry["fallback"];
            p.Plots = factory.initialize(p.Definition, this.persistentViewState, this.iddChart);
            try {
                factory.draw(p.Plots, p.Definition);
            } catch (ex) {  
                if (p.Plots !== undefined) p.Plots.forEach(function (graph) { graph.remove(); });                 
                factory = PlotRegistry["fallback"];
                p.Definition["error"] = ex.message;
                p.Plots = factory.initialize(p.Definition, this.persistentViewState, this.iddChart);
                factory.draw(p.Plots, p.Definition);
            }
        }

        private updateAxes() {
            var xAxisStr = "";
            var yAxisStr = "";
            var xNames = [];
            var yNames = [];
            for (var id in this.currentPlots) {
                var p = this.currentPlots[id];
                var def = p.Definition;
                if (def["x"]) {
                    var xStr = getTitle(def, "x");
                    var contains = false;
                    for (var i = 0; i < xNames.length; i++) {
                        if (xNames[i] === xStr) {
                            contains = true;
                            break;
                        }
                    }
                    if (!contains) {
                        xNames.push(xStr);
                        if (xAxisStr !== "") {
                            xAxisStr += ", ";
                        }
                        xAxisStr += xStr;
                    }
                }
                if (def["y"]) {
                    var yStr = getTitle(def, "y");
                    var contains = false;
                    for (var i = 0; i < yNames.length; i++) {
                        if (yNames[i] === yStr) {
                            contains = true;
                            break;
                        }
                    }
                    if (!contains) {
                        yNames.push(yStr);

                        if (yAxisStr !== "") {
                            yAxisStr += ", ";
                        }

                        yAxisStr += yStr;
                    }
                }
            }

            if (xAxisStr !== "") {
                if (this.xAxisTitle === undefined) {
                    this.xAxisTitle = $(this.iddChart.addDiv('<div style="font-size: larger; text-align: center"></div>', "bottom"));
                }
                this.xAxisTitle.text(xAxisStr);
            } else {
                if (this.xAxisTitle !== undefined) {
                    this.iddChart.removeDiv(this.xAxisTitle[0]);
                    this.xAxisTitle.remove();
                    this.xAxisTitle = undefined;
                }
            }

            if (yAxisStr !== "") {
                if (this.yAxisTitle === undefined) {
                    this.yAxisTitle =
                        $(this.iddChart.addDiv('<div class="dsv-leftaxistitle"></div>', "left"));
                }
                this.yAxisTitle.text(yAxisStr);
            } else {
                if (this.yAxisTitle !== undefined) {
                    this.iddChart.removeDiv(this.yAxisTitle[0]);
                    this.yAxisTitle.remove();
                    this.yAxisTitle = undefined;
                }
            }
        }

        private createMap() {
            var div = $("<div></div>")
                .attr("data-idd-name", "bingMaps")
                .css("z-index", 0)
                .prependTo(this.iddChart.host);
            var plot = new InteractiveDataDisplay.BingMapsPlot(div, this.iddChart);
            plot.order = 9007199254740991;
            this.iddChart.addChild(plot);
            return plot;
        }

        private updateMap() {
            var shouldContainMap = false;
            var first = true;
            for (var id in this.currentPlots) {
                var p = this.currentPlots[id];
                shouldContainMap = (first || shouldContainMap) && this.checkLatLon(p.Definition);
                first = false;
            }

            //Enabling map if necessary
            if (shouldContainMap && typeof Microsoft !== 'undefined') {
                if (this.bingMapsPlot === undefined) {
                    this.bingMapsPlot = this.createMap();
                    if (this.persistentViewState.mapType)
                        this.bingMapsPlot.setMap(this.persistentViewState.mapType);
                    else
                        this.bingMapsPlot.setMap(Microsoft.Maps.MapTypeId.road);//InteractiveDataDisplay.BingMaps.ESRI.GetWorldShadedRelief());
                    this.iddChart.yDataTransform = InteractiveDataDisplay.mercatorTransform;
                    this.iddChart.xDataTransform = undefined;
                } else {
                    if (this.persistentViewState.mapType)
                        this.bingMapsPlot.setMap(this.persistentViewState.mapType);
                }
            } else {
                if (this.bingMapsPlot !== undefined) {
                    this.bingMapsPlot.remove();
                    this.bingMapsPlot = undefined;
                    this.iddChart.yDataTransform = undefined;
                }
            }
        }

        draw(plots: PlotViewerItems): PlotViewerItems {
            var that = this;
            this.currentPlots = updateBag(this.currentPlots, plots,
                // replace
                function (id: string, oldPlot: PlotViewerItem, newPlot: PlotViewerItem): PlotViewerItem {
                    if (oldPlot.Definition.kind == newPlot.Definition.kind) {
                        if (syncProps(oldPlot.Definition, newPlot.Definition)) // if some properties of new plot are updated                            
                            ChartViewer.PlotRegistry[oldPlot.Definition.kind].draw(oldPlot.Plots, oldPlot.Definition);
                        return oldPlot;
                    }
                    else { // plot kind is changed
                        if (oldPlot.Plots !== undefined) oldPlot.Plots.forEach(function (graph) { graph.remove(); });
                        that.addPlot(newPlot);
                        return newPlot;
                    }
                },
                // add
                function (id: string, newPlot: PlotViewerItem) {
                    that.addPlot(newPlot);
                    return newPlot;
                },
                // remove
                function (id: string, p: PlotViewerItem) {
                    if (p.Plots !== undefined) p.Plots.forEach(function (graph) { graph.remove(); });
                });

            this.updateAxes();
            this.persistentViewState.probesViewModel.refresh();
            this.updateMap();            


            var z = 0;
            for (var id in this.currentPlots) {
                var p = this.currentPlots[id];
                if (p.ZIndex) z = Math.max(p.ZIndex, z);
            }
            for (var id in this.currentPlots) {
                var p = this.currentPlots[id];
                if (!p.ZIndex) p.ZIndex = ++z;
                if (!p.Plots) continue;
                for (var j = 0; j < p.Plots.length; ++j)
                    p.Plots[j].host.css("z-index", p.ZIndex);//p.ZIndex
            }


            if (this.persistentViewState.selectedPlots)
                this.setupPlotsVisibility();
            return this.currentPlots;
        }

        updateLayout() {
            this.iddDiv.width(this.div.width());
            this.iddDiv.height(this.div.height());
            this.iddChart.updateLayout();

            if (this.bingMapsPlot !== undefined) {
                this.iddChart.navigation.setVisibleRect(this.iddChart.visibleRect, false);
            }
        }
    }
}