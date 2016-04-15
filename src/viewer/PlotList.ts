
/// <reference path="ViewState.ts" />
/// <reference path="Utils.ts" />
/// <reference path="PlotRegistry.ts" />
/// <reference path="PlotViewer.ts" />

module ChartViewer {
    export function PlotList(rootDiv, plotViewer, persistentViewState, transientViewState) {
        var that = this;
        var _isEditable = true;
        var _cards = [];
        var _plots = [];
        // Create element structure inside root 'div'
        rootDiv.addClass("dsv-plotlist");
        var legendDiv = $("<div></div>").appendTo(rootDiv);
        var legend = new InteractiveDataDisplay.Legend(plotViewer.iddChart, legendDiv);
        plotViewer.iddChart.host.bind("visibleChanged", function () {
            persistentViewState.probesViewModel.refresh(persistentViewState.probesViewModel.getProbes());
        });
        persistentViewState.probesViewModel.refresh(persistentViewState.probesViewModel.getProbes());
        var probesDiv = $("<div style='display:none'></div>").addClass('probes').appendTo(rootDiv);
        $("<div style='width:215px; height:1px; margin-bottom:6px; margin-left: 20px; background-color:lightgrey'></div>").appendTo(probesDiv);
        $("<div style='margin-left: 20px; font-family: Segoe UI;font-size: 12px;color:grey; margin-bottom:16px'>Probes</div>").appendTo(probesDiv);
        var probeListHost = $("<div></div>").addClass("probes-list").appendTo(probesDiv);
        var probesControl = new ProbesControl(probesDiv, probeListHost, persistentViewState, transientViewState);
        this.remove = function () {
            plotViewer.iddChart.host.bind("visibleChanged");
            legend.remove();
        };
    }
}