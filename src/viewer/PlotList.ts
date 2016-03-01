
/// <reference path="viewstate.ts" />
/// <reference path="utils.ts" />
/// <reference path="plotregistry.ts" />
/// <reference path="plotviewer.ts" />

module ChartViewer {
    export function PlotList(rootDiv, plotViewer, persistentViewState, transientViewState) {
        var that = this;
        var _isEditable = true;
        var _cards = [];
        var _plots = [];
        // Create element structure inside root 'div'
        rootDiv.addClass("dsv-plotlist");
        var tilesList = $("<ul class=\"dsv-plotlist-ul\"></ul>");
        tilesList.appendTo(rootDiv);
        tilesList.sortable();
        tilesList.on("sortupdate", function (e, ui) {
            var id = ui.item.attr('data-visualizationeditor-plot'); //id of plot what's card was moved
            var targetIndex;
            $("li", tilesList).each(function (idx, el) {
                if (id == $(el).attr('data-visualizationeditor-plot')) {
                    targetIndex = idx;
                    return false;
                }
            });//found new index of moved element
            for (var i = 0; i < _plots.length; ++i) {
                if (_plots[i].Id == id) {
                    var targetPlot = _plots.splice(i, 1);//removing plot from its old position
                    _plots.splice(targetIndex, 0, targetPlot[0]);//putting plot into its new position
                    break;
                }
            }
            raisePropertyChanged("update",getPlotInfo()); 
        });

        if (transientViewState)
            transientViewState.subscribe(function (transientViewState, property, args) {
                if (property == "ranges") {
                    var card = _cards[args.id];
                    var ranges = transientViewState.ranges[args.id];
                    if (card !== undefined && ranges !== undefined && card.updateRanges)
                        card.updateRanges(card, ranges);
                }
            });

        if (persistentViewState)
            persistentViewState.subscribe(function (persistentViewState, property, args) {
                if (property == "isLogData") {
                    var card = _cards[args.id];
                    if (card !== undefined) {
                        if (persistentViewState.isLogData[args.id]) card.content.find(".dsv-plotlist-card-islog").css('visibility', 'visible');
                        else card.content.find(".dsv-plotlist-card-islog").css('visibility', 'hidden');
                    }
                    rebuildUI();
                }
            });


        var getPlotById = function (id) {
            for (var i = 0; i < _plots.length; i++) {
                var plot = _plots[i];
                if (plot.Id == id)
                    return plot;
            }
            return undefined;
        };
        this.updateLayout = function () {
        }
        
        function getPlotInfo() {
            var plotinfo: PlotViewerItems = {};
            for (var i = 0; i < _plots.length; i++) {
                _plots[i].ZIndex = _plots.length - i;
                plotinfo[_plots[i].Id] = _plots[i];
            }
            return plotinfo;
        }
        // Creates card for specified plot and appends it to the end of the card list
        var addPlotCard = function (plot: PlotViewerItem) {
            var li = $("<li></li>").
                addClass("dsv-plotlist-card").
                appendTo(tilesList);
            tilesList.sortable();
            li.attr("data-visualizationeditor-plot", plot.Id);

            var card;

            if (plot.Definition.kind == null) {
                var existingplot = getPlotById(plot.Id);
                if (PlotRegistry[existingplot.Definition.kind] !== undefined && plot.Definition["error"] == undefined) 
                    card = PlotRegistry[existingplot.Definition.kind].createPlotCardContent(existingplot.Plots);
                else
                    card = PlotRegistry["fallback"].createPlotCardContent(plot.Plots);
            } else {
                if (PlotRegistry[plot.Definition.kind] !== undefined && plot.Definition["error"] == undefined)
                    card = PlotRegistry[plot.Definition.kind].createPlotCardContent(plot.Plots);
                else
                    card = PlotRegistry["fallback"].createPlotCardContent(plot.Plots);
            }
            _cards[plot.Id] = card;
            $("<div></div>").addClass("dsv-plotlist-card-islog").appendTo(card.content);
            addVisibilityCheckBox(card.content, plot.Id);//Id
            card.content.appendTo(li);
            if (card.updateRanges) {
                var ranges = transientViewState.ranges[plot.Id];//Id
                if (ranges !== undefined)
                    card.updateRanges(card, ranges);
            }
        }

        var addVisibilityCheckBox = function (targetDiv, id) {
            var cbx = $("<div></div>").addClass("dsv-plotcard-isselected-false").appendTo(targetDiv);
            if (persistentViewState.selectedPlots && persistentViewState.selectedPlots.indexOf(id) != -1)
                cbx.attr("class", "dsv-plotcard-isselected-true");
            cbx.click(function (e) {
                e.stopPropagation();
                if (persistentViewState.selectedPlots) {
                    var idx = persistentViewState.selectedPlots.indexOf(id);
                    if (idx == -1) {
                        cbx.attr("class", "dsv-plotcard-isselected-true");
                        persistentViewState.selectedPlots = persistentViewState.selectedPlots.concat(id);
                    } else {
                        cbx.attr("class", "dsv-plotcard-isselected-false");
                        var tmp = persistentViewState.selectedPlots.slice(0);
                        tmp.splice(idx, 1);
                        persistentViewState.selectedPlots = tmp;
                    }
                } else {
                    cbx.attr("class", "dsv-plotcard-isselected-false");
                    initSelectedPlots();
                    if (persistentViewState.selectedPlots) {
                        var idx = persistentViewState.selectedPlots.indexOf(id);
                        if (idx == -1) {
                            cbx.attr("class", "dsv-plotcard-isselected-true");
                            persistentViewState.selectedPlots = persistentViewState.selectedPlots.concat(id);
                        } else {
                            cbx.attr("class", "dsv-plotcard-isselected-false");
                            var tmp = persistentViewState.selectedPlots.slice(0);
                            tmp.splice(idx, 1);
                            persistentViewState.selectedPlots = tmp;
                        }
                    }
                }
                persistentViewState.probesViewModel.refresh(persistentViewState.probesViewModel.getProbes()); // todo: fix this
            });
        }

        var initSelectedPlots = function () {
            var tmp = [];
            $(".dsv-plotcard-isselected-true").parent().parent().each(function (i, e) {
                tmp.push($(e).attr("data-visualizationeditor-plot"));
            });
            persistentViewState.selectedPlots = tmp;
        }

        this.draw = function (plots: PlotViewerItems) {
            _plots = [];
            for (var id in plots) 
                _plots.push(plots[id]);
            _plots.sort(function (a: PlotViewerItem, b: PlotViewerItem) {
                return b.ZIndex - a.ZIndex;
            });
            rebuildUI();
        }

        var rebuildUI = function () {
            tilesList.empty();
            _cards = [];

            //Building plot cards
            for (var i = 0; i < _plots.length; i++) {
                var plot = _plots[i];
                addPlotCard(plot);
            }
        }

        var callbacks = [];
        function raisePropertyChanged(propName, extraData?) {
            for (var i = 0; i < callbacks.length; ++i)
                callbacks[i](extraData);
        }
        this.subscribe = function (callback) {
            callbacks.push(callback);
        }
        this.unsubscribe = function (callback) {
            callbacks = callbacks.filter(function (cb) {
                return cb !== callback;
            });
        }
        var probeListHost = $("<div></div>").css("position", "relative").css("margin-top", 20).appendTo(rootDiv);
        var probesControl = new ProbesControl(probeListHost, persistentViewState, transientViewState);
    }
}