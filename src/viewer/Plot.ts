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
    /**If treatAs is "Function" (default value), the series x[i] and y[i] are sorted by increasing values x. Otherwise, "Trajectory": the arrays are rendered as is.*/
    export module LineTreatAs {
        export var Function = "function";
        export var Trajectory = "trajectory";
    }
    /**allows to represent an array of uncertain values by providing the quantiles for each uncertain value*/
    export type Quantiles = {
        median: number[];
        lower68: number[];
        upper68: number[];
        lower95: number[];
        upper95: number[];
    }
    export type MarkerShape = {
        Box: string;
        Circle: string;
        Diamond: string;
        Cross: string;
        Triangle: string;
    }
    export type HeatmapRenderType = {
        Gradient: string;
        Discrete: string;
    }
    /**If treatAs is "Function" (default value), the series x[i] and y[i] are sorted by increasing values x. Otherwise, "Trajectory": the arrays are rendered as is.*/
    export type LineTreatAs = {
        Function: string;
        Trajectory: string;
    }
	/**SizeRange is { min: number; max: number }*/
    export type SizeRange = { min: number, max: number };
    /**Color is a string that supports same color definition as in CSS: "blue", "#606060", "rgba(10,150,200,100)"*/
    export type Color = string;
    /**ColorPalette is a string that has specific syntax to define palettes, e.g. "reg,green,blue" or "0=red=white=blue=100"*/
    export type ColorPalette = string;

    export type LineTitles = { x?: string, y?: string };
    export type MarkersTitles = { x?: string, y?: string, color?: string, size?: string }; 
    export type HeatmapTitles = { x?: string, y?: string, value?: string }; 
    export type BandTitles = { x?: string, y1?: string, y2?: string }; 
    export type BoxPlotTitles = { x?: string, y?: string };
    export type LineDefinition = {
        x: number[];
        y: number[] | Quantiles;
        stroke?: Color;
        thickness?: number;
        treatAs?: string;
        fill68?: Color;
        fill95?: Color;
        displayName?: string;
        titles?: LineTitles;
    }
    export type BandDefinition = {
        x: number[];
        y1: number[];
        y2: number[];
        fill?: Color;
        displayName?: string;
        titles?: BandTitles;
    }
    export type BoxPlotDefinition = {
        y: Quantiles;
        x?: number[];
        borderColor?: Color;
        color?: Color;
        displayName?: string;
        titles?: BoxPlotTitles;
    }
    export type MarkersDefinition = {
        x: number[];
        y: number[] | Quantiles;
        shape?: string;
        color?: Color | number[] | Quantiles;
        colorPalette?: ColorPalette;
        size?: number | number[] | Quantiles;
        sizeRange?: SizeRange;
        borderColor?: Color;
        displayName?: string
        titles?: MarkersTitles;
    }
    export type HeatmapDefinition = {
        x: number[];
        y: number[];
        values: number[] | Quantiles;
        colorPalette?: ColorPalette;
        treatAs?: string;
        displayName?: string
        titles?: HeatmapTitles;
    }
    export function line(element: LineDefinition) {
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
    export function markers(element: MarkersDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "markers";
        return plotInfo;
    }
    export function heatmap(element: HeatmapDefinition) {
        var plotInfo = <ChartViewer.PlotInfo><any>element;
        plotInfo.kind = "heatmap";
        return plotInfo;
    }
}
interface PlotFactory {
    /**line draws a grid function y[i] = y(x[i]) where y[i] is either a scalar value or a random variable distribution.
    In former case, a single polyline is drawn; in the latter case, a median polyline along with filled bands for percentiles of the distribution is rendered.*/
    line(element: Plot.LineDefinition): ChartViewer.PlotInfo;
    /**Displays data as a collection of points, each having the value of one variable determining 
    the position on the horizontal axis and the value of the other variable determining the position on the vertical axis. 
    Also variables can be bound to marker size and color. 
    Dependent variable, size-bound variable or color-bound variable 
    can be real or uncertain; the latter is represented as a set of quantiles.*/
    markers(element: Plot.MarkersDefinition): ChartViewer.PlotInfo;
    /**Heatmap plot renders values defined on a rectangular grid using color palette*/
    heatmap(element: Plot.HeatmapDefinition): ChartViewer.PlotInfo;
    /**The plot draws a colored band between two scalar grid functions.
    The space between lines y1[i](x[i]) and y2[i](x[i]) is filled with a solid color; the boundaries are not stroked.*/
    band(element: Plot.BandDefinition): ChartViewer.PlotInfo;
    /**The plot draws a colored boxplot.*/
    boxplot(element: Plot.BoxPlotDefinition): ChartViewer.PlotInfo;
    MarkerShape: Plot.MarkerShape;
    HeatmapRenderType: Plot.HeatmapRenderType;
    LineTreatAs: Plot.LineTreatAs;
}

interface ChartFactory {
    /**ChartViewer.show() gets a map of pairs (plot identifier, plot definition) as a second argument.
    Plot definition is a collection of key- value pairs specifying properties of a plot, such as line stroke or marker shape.
    Each plot definition has at least one property which is type; it determines a rendering method and must be known to the ChartViewer.*/
    show(domElement: HTMLElement, plots: ChartViewer.ChartInfo, viewState?: ChartViewer.ViewState): ChartViewer.ViewerControl;
}
interface Charting {
    ChartViewer: ChartFactory;
    Plot: PlotFactory;
}