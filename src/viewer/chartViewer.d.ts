declare module InteractiveDataDisplay {
    //Chart Viewer
    export interface ViewState {
        [name: string]: any;
    }
    export interface Titles {
        [seriesName: string]: string;
    }
    export interface PlotInfo {
        kind: string;
        displayName: string;
        titles?: Titles;
        [propertyName: string]: any;
    } 
    export interface ChartInfo {
        [id: string]: PlotInfo;
    }
    export interface PropertyTitles {
        [prop: string]: string;
    }
    export interface ViewerControl {
        update(plots: ChartInfo): any;
        viewState: ViewState;
        dispose(): void;
    }
    /**ChartViewer.show() gets a map of pairs (plot identifier, plot definition) as a second argument.
    Plot definition is a collection of key- value pairs specifying properties of a plot, such as line stroke or marker shape.
    Each plot definition has at least one property which is type; it determines a rendering method and must be known to the ChartViewer.*/
    function show(domElement: HTMLElement, plots: ChartInfo, viewState?: ViewState): InteractiveDataDisplay.ViewerControl;

    //Interactive Data Display
    //settings
    /**minimum size in pixels of the element to be rendered*/
    export var MinSizeToShow;
    /**extra padding in pixels which is added to padding computed by the plots*/
    export var Padding; 
    /**max number of iterations in loop of ticks creating*/
    export var maxTickArrangeIterations;
    /**length of ordinary tick*/
    export var tickLength; 
    /**minimum space (in px) between 2 labels on axis*/
    export var minLabelSpace;
    /**minimum space (in px) between 2 ticks on axis*/
    export var minTickSpace;
    /**minimum order when labels on logarithmic scale are written with supscript*/
    export var minLogOrder;
    /**minimum order when labels on numeric scale are written with supscript*/
    export var minNumOrder;
    /**delay(seconds) between mouse stops over an element and the tooltip appears*/
    export var TooltipDelay; 
    /**duration(seconds) when tooltip is shown*/
    export var TooltipDuration;
    /**browser - dependent prefix for the set of css styles*/
    export var CssPrefix;
    export var ZIndexNavigationLayer;
    export var ZIndexDOMMarkers;
    export var ZIndexTooltipLayer;

    //readers
    export function readTable(jqPlotDiv);
    export function readCsv(jqPlotDiv);
    export function readCsv2d(jqDiv);

    //palettes
    export class ColorPalette {
        constructor(isNormalized, range, palettePoints);
        static toArray(palette, n);
        static parse(paletteString);
        static colorFromString(hexColor);
        static RGBtoHSL(rgbaColor);
        static HSLtoRGB(hslaColor);

    }
    export class SizePalette {
        constructor(isNormalized, sizeRange, valueRange?);

    }
    export var palettes: any;
    //transforms
    export class CoordinateTransform {
        constructor(plotRect, screenRect, aspectRatio);
    }
    export class DataTransform {
        constructor(dataToPlot, plotToData, domain, type);
    }
    export var mercatorTransform: DataTransform;
    export var logTransform: DataTransform;
    //Plots
    export class Plot {
        constructor(div, master, myCentralPart?);
    }
    export class Figure {
        constructor(div, master);
    }
    export class Chart {
        constructor(div, master);
    }
    export class CanvasPlot extends Plot{
        constructor(div, master);
    }
    export class Polyline extends CanvasPlot {
        constructor(div, master);
    }
    export class Markers {
        constructor(div, master);
        static defaults;
        static shapes;
    }
    export var Petal: any;
    export var BullEye: any;
    export var BoxWhisker: any;
    export class Area {
        constructor(div, master);
    }
    export class Heatmap {
        constructor(div, master);
    }
    export class DOMPlot extends Plot {
        constructor(host, master);
    }
    export class GridlinesPlot extends CanvasPlot {
        constructor(host, master);
    }
    export class BingMapsPlot {
        constructor(div, master);
    }
    //Navigation
    export class NavigationPanel {
        constructor(plot, div, url?);
    }
    //Legend
    export class Legend {
        constructor(_plot, _jqdiv, isCompact?);
    }
    type Rect = {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    type MinMax = {
        min: number;
        max: number;
    }
    export module Utils {
        function applyMask(mask:number[], array, newLength:number);
        function maskNaN(mask: number[], numArray: number[]);
        /**Returns true if value is Array or TypedArray*/
        function isArray(arr): boolean;
        function isOrderedArray(arr): boolean;
        function cutArray(arr, len:number);
        /**Returns intersection of two rectangles {x,y,width,height}, left-bottom corner
        If no intersection, returns undefined.*/
        function intersect(rect1:Rect, rect2:Rect):Rect;
        /**Returns boolean value indicating whether rectOuter includes entire rectInner, or not.
        Rect is  {x,y,width,height}*/
        function includes(rectOuter:Rect, rectInner:Rect): boolean;
        /**Returns boolean value indicating whether rect1 equals rect2, or not.
        Rect is  {x,y,width,height}*/
        function equalRect(rect1: Rect, rect2: Rect): boolean;
        function calcCSWithPadding(plotRect, screenSize, padding, aspectRatio);//??
        /**Browser-specific function. Should be replaced with the optimal implementation on the page loading.*/
        function requestAnimationFrame(handler, args?);
        /**Creates and initializes an array with values from start to end with step 1.*/
        function range(start, end);
        /**finalRect should contain units in its values. f.e. "px" or "%"*/
        function arrangeDiv(div, finalRect);
        /**Computes minimum rect, containing rect1 and rect 2*/
        function unionRects(rect1:Rect, rect2:Rect):Rect;
        /**Parses the attribute data-idd-style of jqElement and adds the properties to the target
        e.g. data-idd-style="thickness: 5px; lineCap: round; lineJoin: round; stroke: #ff6a00"*/
        function readStyle(jqElement, target);//??
        function getDataSourceFunction(jqElem, defaultSource);
        function makeNonEqual(range: MinMax): MinMax;
        function getMinMax(array:number[]): MinMax;
        function getMin(array:number[]): number;
        function getMax(array:number[]): number;
        /**Returns structure {minx, maxx, miny, maxy}*/
        function getMinMaxForPair(arrayx, arrayy);
        function enumPlots(plot);//???
        function reorder(p, p_before, isPrev);//??
        function getMaxOrder(p):number;
        function getBoundingBoxForArrays(_x, _y, dataToPlotX, dataToPlotY)//??
        function getAndClearTextContent(jqElement);
    }
    export module Binding {
        function bindPlots(plot1, plot2, filter);
        function getBoundPlots(plot);
    }
    export class AdaptiveFormatter {
        constructor(series, segment?);
    }
    export function register(key, factory);
 
    export function InitializeAxis(div, params?);
    /**Instantiates a plot for the given DIV element.
    jqDiv is either ID of a DIV element within the HTML page or jQuery to the element to be initialized as a plot.
    Returns new InteractiveDataDisplay.Plot instance.*/
    export function asPlot(div);
    /**Tries to get IDD plot object from jQuery selector
    Returns null if selector is null or DOM object is not an IDD master plot*/
    function tryGetMasterPlot(jqElem);
    /**Traverses descendants of jQuery selector and invokes updateLayout 
    for all IDD master plots*/
    function updateLayouts(jqElem);
}

declare module Plot {
    module MarkerShape {
        var Box: string;
        var Circle: string;
        var Diamond: string;
        var Cross: string;
        var Triangle: string;
    }
    /**If treatAs is "Function" (default value), the series x[i] and y[i] are sorted by increasing values x. Otherwise, "Trajectory": the arrays are rendered as is.*/
    module HeatmapRenderType {
        var Gradient: string;
        var Discrete: string;
    }
    module LineTreatAs {
        var Function: string;
        var Trajectory: string;
    }
    /**allows to represent an array of uncertain values by providing the quantiles for each uncertain value*/
    type Quantiles = {
        median: number[];
        lower68: number[];
        upper68: number[];
        lower95: number[];
        upper95: number[];
    };
    /**Color is a string that supports same color definition as in CSS: "blue", "#606060", "rgba(10,150,200,100)"*/
    type Color = string;
    /**ColorPalette is a string that has specific syntax to define palettes, e.g. "reg,green,blue" or "0=red=white=blue=100"*/
    type ColorPalette = string;
    type LineTitles = {
        x?: string;
        y?: string;
    };
    type MarkersTitles = {
        x?: string;
        y?: string;
        color?: string;
        size?: string;
    };
    type HeatmapTitles = {
        x?: string;
        y?: string;
        values?: string;
    };
    type BandTitles = {
        x?: string;
        y1?: string;
        y2?: string;
    };
    type BoxPlotTitles = {
        x?: string;
        y?: string;
    };
    type LineDefinition = {
        x?: number[];
        y: number[] | Quantiles;
        stroke?: Color;
        thickness?: number;
        /**use Plot.LineTreatAs*/
        treatAs?: string;
        lineCap?: string;
        lineJoin?: string;
        fill68?: Color;
        fill95?: Color;
        displayName?: string;
        titles?: LineTitles;
    };
    type BandDefinition = {
        x?: number[];
        y1: number[];
        y2: number[];
        fill?: Color;
        displayName?: string;
        titles?: BandTitles;
    };
    type BoxPlotDefinition = {
        y: Quantiles;
        x?: number[];
        borderColor?: Color;
        color?: Color;
        displayName?: string;
        titles?: BoxPlotTitles;
    };
    type MarkersDefinition = {
        x?: number[];
        y: number[];
        /**use Plot.MarkerShape*/
        shape?: string;
        color?: Color | number[] | Quantiles;
        colorPalette?: ColorPalette;
        size?: number | number[] | Quantiles;
        sizePalette?: Object;
        border?: Color;
        displayName?: string;
        titles?: MarkersTitles;
    };
   
    type HeatmapDefinition = {
        x: number[];
        y: number[];
        values: number[] | Quantiles;
        colorPalette?: ColorPalette;
        /**use Plot.HeatmapRenderType*/
        treatAs?: string;
        displayName?: string;
        titles?: HeatmapTitles;
    };
    /**line draws a grid function y[i] = y(x[i]) where y[i] is either a scalar value or a random variable distribution.
    In former case, a single polyline is drawn; in the latter case, a median polyline along with filled bands for percentiles of the distribution is rendered.*/
    function line(element: LineDefinition): InteractiveDataDisplay.PlotInfo;
    /**The plot draws a colored band between two scalar grid functions.
    The space between lines y1[i](x[i]) and y2[i](x[i]) is filled with a solid color; the boundaries are not stroked.*/
    function band(element: BandDefinition): InteractiveDataDisplay.PlotInfo;
    /**The plot draws a colored boxplot.*/
    function boxplot(element: BoxPlotDefinition): InteractiveDataDisplay.PlotInfo;
    /**Displays data as a collection of points, each having the value of one variable determining 
    the position on the horizontal axis and the value of the other variable determining the position on the vertical axis. 
    Also variables can be bound to marker size and color. 
    Dependent variable, size-bound variable or color-bound variable 
    can be real or uncertain; the latter is represented as a set of quantiles.*/
    function markers(element: MarkersDefinition): InteractiveDataDisplay.PlotInfo;
    /**Heatmap plot renders values defined on a rectangular grid using color palette*/
    function heatmap(element: HeatmapDefinition): InteractiveDataDisplay.PlotInfo;
}

