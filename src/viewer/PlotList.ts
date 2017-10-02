﻿/// <reference path="ViewState.ts" />
/// <reference path="Utils.ts" />
/// <reference path="PlotViewer.ts" />

module InteractiveDataDisplay {
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
        var probesDiv = $("<div></div>").addClass('probes').appendTo(rootDiv);
        var probesTitle = $("<div style='width:240px; margin-bottom: 16px'></div>").appendTo(probesDiv);
        var probePullDiv = $("<div></div>").addClass("dsv-onscreennavigation-probepull").appendTo(probesTitle);
        var probePull = new ProbePull(probePullDiv, plotViewer.iddChart.centralPart);
        var titleDiv = $("<div style='width: 195px; display:inline-block'></div>").appendTo(probesTitle);
        $("<div style='width:180px; height:1px; margin-bottom:6px; float:right; margin-top: 8px; background-color:lightgrey'></div>").appendTo(titleDiv);
        $("<div style='float:left; margin-left:15px;font-family: Segoe UI;font-size: 12px;color:grey; margin-bottom:16px'>Probes</div>").appendTo(titleDiv);
        var probeListHost = $("<div></div>").addClass("probes-list").appendTo(probesDiv);
        probeListHost[0].style.display = "none";
        var probesControl = new ProbesControl(probesDiv, probeListHost, persistentViewState, transientViewState);
        this.remove = function () {
            plotViewer.iddChart.host.bind("visibleChanged");
            legend.remove();
        };
    }
}