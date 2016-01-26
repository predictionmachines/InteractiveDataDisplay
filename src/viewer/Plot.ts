/// <reference path="chartViewer.d.ts" />
/// <reference path="Utils.ts" />
/// <reference path="ViewState.ts" />
/// <reference path="onScreenNavigation.ts" />
/// <reference path="PlotRegistry.ts" />
/// <reference path="Uncertainlineplot.ts" />
/// <reference path="PlotViewer.ts" />
module Plot {
    export module MarkerShape {
        export var Box = "box";
        export var Circle = "circle";
        export var Diamond = "diamond";
        export var Cross = "cross";
        export var Triangle = "triangle";
    }
    export module HeatmapRenderType {
        export var Gradient = "gradient";
        export var Discrete = "discrete";
    }
    export module LineTreatAs {
        export var Function = "function";
        export var Trajectory = "trajectory";
    }
    export function line(element: Plot.LineDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "line";
        return plotInfo;

    }
    export function band(element: BandDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "band";
        return plotInfo; 
    }
    export function boxplot(element: BoxPlotDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "markers";
        return plotInfo;
    }
    export function markers(element: Plot.MarkersDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "markers";
        return plotInfo;
    }
    export function heatmap(element: Plot.HeatmapDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "heatmap";
        return plotInfo;
    }
}