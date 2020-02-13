export module InteractiveDataDisplay {
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

    //==================Interactive Data Display=====================
    //settings
    /**minimum size in pixels of the element to be rendered*/
    export var MinSizeToShow: any;
    /**extra padding in pixels which is added to padding computed by the plots*/
    export var Padding: any;
    /**max number of iterations in loop of ticks creating*/
    export var maxTickArrangeIterations: any;
    /**length of ordinary tick*/
    export var tickLength: any;
    /**minimum space (in px) between 2 labels on axis*/
    export var minLabelSpace: any;
    /**minimum space (in px) between 2 ticks on axis*/
    export var minTickSpace: any;
    /**minimum order when labels on logarithmic scale are written with supscript*/
    export var minLogOrder: any;
    /**minimum order when labels on numeric scale are written with supscript*/
    export var minNumOrder: any;
    /**delay(seconds) between mouse stops over an element and the tooltip appears*/
    export var TooltipDelay: any;
    /**duration(seconds) when tooltip is shown*/
    export var TooltipDuration: any;
    /**browser - dependent prefix for the set of css styles*/
    export var CssPrefix: any;
    export var ZIndexNavigationLayer: any;
    export var ZIndexDOMMarkers: any;
    export var ZIndexTooltipLayer: any;

    //readers
    export function readTable(jqPlotDiv: any): any;
    export function readCsv(jqPlotDiv: any): any;
    export function readCsv2d(jqDiv: any): any;

    //palettes
    /**Represents a mapping from a number to a value (e.g. a color)
    The function color has an domain [min,max]. If type is absolute, min and max are arbitrary numbers such that max>min.
    If type is relative, min=0,max=1, and a user of the palette should normalize the values to that range.
    Argument of the color is normalized to the domain of the function
    palettePoints is an array of hslaColor.*/
    export class ColorPalette {
        isNormalized: boolean;
        range: MinMax;
        points: any;
        constructor(isNormalized: boolean, range: MinMax, palettePoints: any);
        getRgba(value: any): any;
        getHsla(value: any): any;
        absolute(min: any, max: any): any;
        relative(): any;
        banded(bands: any): ColorPalette;
        /**Discretizes the palette
        Returns an Uint8Array array of numbers with length (4 x number of colors), 
        contains 4 numbers (r,g,b,a) for each color, 
        where 0 <= r,g,b,a <= 255*/
        static toArray(palette: any, n: any): any;
        static create(): ColorPalette;
        static parse(paletteString?: any): ColorPalette;
        static colorFromString(hexColor: any): any;
        static RGBtoHSL(rgbaColor: any): any;
        static HSLtoRGB(hslaColor: any): any;
    }
    export class Lexer {
        position: any;
        paletteString: any;
        currentSeparator: any;
        currentLexeme: any;
        currentNumber: any;
        currentColor: any;
        constructor(paletteString: string);
        readNext(): any;
    }
    export class ColorPaletteViewer {
        axisVisible: boolean;
        palette: any;
        dataRange: MinMax;
        constructor(div: any, palette?: any, options?: any);
    }
    export module palettes {
        var grayscale: ColorPalette
    }
    export class SizePalette {
        isNormalized: boolean;
        range: MinMax;
        sizeRange: MinMax;
        constructor(isNormalized: boolean, sizeRange: MinMax, valueRange?: MinMax);
        getSize(value: number): any;
    }
    export class SizePaletteViewer {
        axisVisible: boolean;
        palette: any;
        dataRange: MinMax;
        constructor(div: any, palette?: any, options?: any);
    }
    export class UncertaintySizePaletteViewer {
        maxDelta: number;
        constructor(div: any, options?: any);
    }

    //transforms
    /**Class for coordinate transform, cs is build from plot rect and screen size*/
    export class CoordinateTransform {
        constructor(plotRect?: Rect, screenRect?: any, aspectRatio?: number);
        plotToScreenX(x: number): number;
        plotToScreenY(y: number): number;
        screenToPlotX(left: number): number;
        screenToPlotY(top: number): number;
        plotToScreenWidth(x: number): number;
        plotToScreenHeight(y: number): number;
        screenToPlotWidth(left: number): number;
        screenToPlotHeight(top: number): number;
        /**Builds plot rectangle for the given screen rectangle
        as {x,y,width,height}, where x,y are left/top of the rectangle.*/
        getPlotRect(screenRect: Rect): Rect;
        /**Returns {x, y}*/
        getScale(): any;
        /**Returns {x, y}*/
        getOffset(): any;
        clone(): CoordinateTransform;
    }
    export class DataTransform {
        constructor(dataToPlot: any, plotToData: any, domain: any, type: any);
    }
    export var mercatorTransform: DataTransform;
    export var logTransform: DataTransform;

    //Plots
    export class Plot {
        isMaster: boolean;
        /**Indicates whether the last frame included rendering of this plot or not.*/
        isRendered: boolean;
        flatRendering: any;
        master: any;
        host: any;
        centralPart: any;
        name: any;
        children: any;
        screenSize: ScreenSize;
        xDataTransform: any;
        yDataTransform: any;
        coordinateTransform: any;
        doFitOnDataTransformChanged: any;
        aspectRatio: any;
        isAutoFitEnabled: any;
        isVisible: boolean;
        order: number;
        visibleRect: Rect;
        mapControl: any;
        tooltipSettings: any;
        isToolTipEnabled: any;
        navigation: any;
        /**Allows to set titles for the plot's properties.
        E.g. "{ color:'age' }" sets the 'age' title for the color data series.
        Given titles are displayed in legends and tooltips.*/
        titles: any;
        constructor(div: any, master: any, myCentralPart?: any);
        selfMapRefresh(): any;
        /**Returns a user-readable title for a property of a plot.
        E.g. can return "age" for property "color".
        If there is no user-defined title, returns the given property name as it is.*/
        getTitle(property: string): string;
        setTitles(titles: any, suppressFireAppearanceChanged?: any): any;
        /**Uninitialize the plot (clears its input)*/
        destroy(): any;
        /**Removes this plot from its master and physically destroys its host element.*/
        remove(): any;
        removeMap(): any;
        addChild(childPlot: any): any;
        /**The function is called when this plot is added(removed) to the new master.*/
        onAddedTo(master: any): any;
        /**Removes a child from this plot.
        Argument plot is either the plot object or its name*/
        removeChild(plot: any): boolean;
        /**Gets linear list of plots from hierarchy*/
        getPlotsSequence(): any;
        /**Gets the bounds of inner content of this plot (excluding its children plots)*/
        getLocalBounds(step: any, computedBounds: any): Rect;
        /**Computes bounds of inner content of this plot (excluding its children plots)*/
        computeLocalBounds(step: any, computedBounds: any): Rect;
        /**Invalidates local bounding box stored in the cache.
        To be called by derived plots. Returns previous local bounding box.*/
        invalidateLocalBounds(): any;
        /**Aggregates all bounds of this plot and its children plots*/
        aggregateBounds(): Rect;
        /**Computes padding of inner content of this plot.
        Returns 4 margins in the screen coordinate system.*/
        getLocalPadding(): any;
        /**Aggregates padding of both content of this plot and its children plots.
        Returns 4 margins in the plot plane coordinate system.*/
        aggregatePadding(): any;
        requestNextFrame(plot?: any): any;
        requestUpdateLayout(settings?: any): any;
        /**Updates output of this plot using the current coordinate transform and screen size.
        Returns true, if the plot actually has rendered something; otherwise, returns false.*/
        render(plotRect: Rect, screenSize: ScreenSize): boolean;
        /**Updates output of this plot using the current coordinate transform and screen size.*/
        renderCore(plotRect: Rect, screenSize: ScreenSize): any;
        /**Renders the plot to the svg and returns the svg object.*/
        exportToSvg(): any;
        exportContentToSvg(plotRect: Rect, screenSize: ScreenSize, svg: any): any;
        /**Renders this plot to svg using the current coordinate transform and screen size.*/
        renderCoreSvg(plotRect: Rect, screenSize: ScreenSize, svg: any): any;
        fit(screenSize: ScreenSize, finalPath: boolean, plotScreenSizeChanged: boolean): Rect;
        /**Makes layout of all children elements of the plot and invalidates the plots' images.*/
        updateLayout(): any;
        measure(availibleSize: any, plotScreenSizeChanged: any): any;
        arrange(finalRect: any): any;
        fitToView(): any;
        fitToViewX(): any;
        fitToViewY(): any;
        /**If auto fit is on and bound box changed, updates the layout; otherwise, requests next frame for this plot.*/
        requestNextFrameOrUpdate(): any;
        getTooltip(xd: number, yd: number, xp?: number, yp?: number): any;
        /**Gets the plot object with the given name.
        If plot is not found, returns undefined.*/
        get(p: any): any;
        polyline(name: string, data?: any): Polyline;
        markers(name: string, data?: any, titles?: any): Markers;
        area(name: string, data?: any): Area;
        heatmap(name: string, data?: any, titles?: any): Heatmap;
        getLegend(): any;
        updateOrder(elem?: any, isPrev?: boolean): any;

    }
    /**Class for plots and axes arrangement.Takes into account "placement" property of an element use it for element arrangement*/
    export class Figure extends Plot {
        constructor(div: any, master?: any);
        getAxes(placement?: any): any;
        get(p: any): any;
        addDiv(htmlCode: any, placement: any): any;
        removeDiv(divToRemove: any): any;
        addAxis(placement: any, axisType: any, params: any, insertBeforeDiv: any): any;
        measure(screenSize: ScreenSize): any;
        arrange(finalRect: any): any;
        exportContentToSvg(plotRect: Rect, screenSize: ScreenSize, svg: any): any;
    }
    export class Chart extends Figure {
        legend: Legend;
        constructor(div: any, master?: any);
        onDataTranformChangedCore(arg: any): any;
        //onChildrenChanged(arg);
    }
    /**Base class for plots rendering on a private canvas.*/
    export class CanvasPlot extends Plot {
        constructor(div: any, master: any);
        getContext(doClear: boolean): any;
        destroy(): any;
        arrange(finalRect: any): any;
        /**Gets the transform functions from data to screen coordinates.
        Returns { dataToScreenX, dataToScreenY }*/
        getTransform(): any;
        /**Gets the transform functions from screen to data coordinates.
        Returns { screenToDataX, screenToDataY }*/
        getScreenToDataTransform(): any;
    }
    /**Renders a function y=f(x) as a polyline.*/
    export class Polyline extends CanvasPlot {
        thickness: number;
        stroke: any;
        lineCap: any;
        lineJoin: any;
        fill68: any;
        fill95: any;
        constructor(div: any, master: any);
        draw(data: any): any;
        computeLocalBounds(step: any, computedBounds: any): Rect;
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding(): any;
        getTooltip(xd: any, yd: any, px: any, py: any): any;
        renderCore(plotRect: Rect, screenSize: ScreenSize): any;
        renderCoreSvg(plotRect: Rect, screenSize: ScreenSize, svg: any): any;
        onDataTransformChanged(arg: any): any;
        getLegend(): any;
    }

    type MarkersDefaults = {
        color: string
        colorPalette: ColorPalette
        border: string
        size: number
    }
    export class Markers extends CanvasPlot {
        constructor(div: any, master: any);
        /**return copy of data*/
        getDataCopy(): any;
        /**Draws the data as markers.*/
        draw(data: any, titles?: any): any;
        /**Returns a rectangle in the plot plane.*/
        computeLocalBounds(step: any, computedBounds: any): any;
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding(): any;
        renderCore(plotRect: any, screenSize: any): any;
        findToolTipMarkers(xd: number, yd: number, xp?: number, yp?: number): any;
        /**Builds a tooltip <div> for a point*/
        getTooltip(xd: any, yd: any, xp: any, yp: any): any;
        getLegend(): any;
        onDataTransformChanged(arg: any): any;

        static defaults: MarkersDefaults;
        static shapes: any;
    }
    /**Area plot takes data with coordinates named 'x', 'y1', 'y2' and a fill colour named 'fill'.*/
    export class Area extends CanvasPlot {
        constructor(div: any, master: any);
        draw(data: any): any;
        /**Returns a rectangle in the plot plane.*/
        computeLocalBounds(): any;
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding(): any;
        renderCore(plotRect: Rect, screenSize: ScreenSize): any;
        onDataTransformChanged(arg: any): any;
        getLegend(): any;
    }
    /**Renders a fuction  f(x, y) on a regular grid (x, y) as a heat map using color palette*/
    export class Heatmap extends CanvasPlot {
        palette: ColorPalette;
        opacity: number;
        mode: any;
        constructor(div: any, master: any);
        onRenderTaskCompleted(completedTask: any): any;
        draw(data: any, titles?: any): any;
        /**Returns a rectangle in the plot plane.*/
        computeLocalBounds(): any;
        /**Updates output of this plot using the current coordinate transform and screen size.
        plotRect - rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
        screenSize - size of the output region to render inside
        Returns true, if the plot actually has rendered something; otherwise, returns false.*/
        renderCore(plotRect: Rect, screenSize: ScreenSize): any;
        onIsRenderedChanged(): any;
        onDataTransformChanged(arg: any): any;
        /**Gets the value (probably, interpolated) for the heatmap
        in the point (xd,yd) in data coordinates.
        Depends on the heatmap mode.
        Returns null, if the point is outside of the plot.*/
        getValue(xd: any, yd: any, array: any): any;
        getTooltip(xd: number, yd: number, xp?: number, yp?: number, changeInterval?: MinMax): any;
        getLegend(): any;
    }
    /**Renders set of DOM elements in the data space of this plot*/
    export class DOMPlot extends Plot {
        domElements: any;
        constructor(host: any, master: any);
        computeLocalBounds(): Rect;
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding(): any;
        arrange(finalRect: any): any;
        renderCore(plotRect: Rect, screenSize: ScreenSize): any;
        onIsRenderedChanged(): any;
        clear(): any;
        /**Adds new DIV element to the plot.
        element is an HTML describing the new DIV element;
        scaleMode is either 'element', 'content', or 'none';
        returns added DOM element*/
        add(element: any, scaleMode: any, x: number, y: number, width?: number, height?: number, originX?: number, originY?: number): any;
        /**Removes DIV element from the plot. element is DOM object.*/
        remove(element?: any): any;
        /**Set the position and optionally width and height of the element
        element is DOM object which must be added to the plot prior to call this method
        left, top are new coordinates of the left top corner of the element in the plot's data space
        ox, oy are optional new originX and originY which range from 0 to 1 and determines binding point of element to plots coordinates*/
        set(element: any, x: number, y: number, width?: number, height?: number, ox?: number, oy?: number): any;

    }
    export class GridlinesPlot extends CanvasPlot {
        xAxis: any;
        yAxis: any;
        thickness: number;
        stroke: any;
        constructor(host: any, master: any);
        renderCore(plotRect: Rect, screenSize: ScreenSize): any;
        renderCoreSvg(plotRect: Rect, screenSize: ScreenSize, svg: any): any;
    }
    export class BingMapsPlot extends Plot {
        map: any;
        constructor(div: any, master: any);
        arrange(finalRect: any): any;
        /**Sets the map provided as an argument which is either a tile source (Microsoft.Maps.TileSource, e.g. see InteractiveDataDisplay.BingMaps.OpenStreetMap.GetTileSource),
        or a map type of Bing Maps (Microsoft.Maps.MapTypeId).*/
        setMap(map: any): any;
        constraint(plotRect: Rect, screenSize: ScreenSize): any;
    }

    //Navigation
    export class NavigationPanel {
        constructor(plot: any, div: any, url?: any);
        remove(): any;
    }
    export class Navigation {
        animation: any;
        gestureSource: any;
        constructor(_plot: any, _setVisibleRegion: any);
        /**Changes the visible rectangle of the plot.
        visible is { x, y, width, height } in the plot plane, (x,y) is the left-bottom corner
        if animate is true, uses elliptical zoom animation*/
        setVisibleRect(visible: any, animate: any, settings: any): any;
        stop(): any;
    }
    export module NavigationUtils {
        /**Suppress default multitouch for web pages to enable special handling of multitouch in InteractiveDataDisplay.
        Suitable for iPad, Mac.
        For Windows 8, idd.css contains special css property for this effect.*/
        function SuppressDefaultMultitouch(): any;
        function calcPannedRect(plotRect: Rect, screenSize: ScreenSize, panGesture: any): Rect;
        function calcZoomedRect(plotRect: Rect, coordinateTransform: any, zoomGesture: any): any;
    }

    //Workers
    export class SharedRenderWorker {
        constructor(scriptUri: any, onTaskCompleted: any);
        enqueue(task: any, source: any): any;
        /**Cancels the pending task for the given source.*/
        cancelPending(source: any): any;
    }

    //Uncertain Shapes
    interface UncertainShape {
        prepare(data: any): void;
        preRender(data: any, plotRect: any, screenSize: any, dt: any, context: any): any;
        draw(marker: any, plotRect: any, screenSize: any, transform: any, context: any): void;
        hitTest(marker: any, transform: any, ps: any, pd: any): boolean;
        getLegend(data: any, getTitle: any, legendDiv: any): any;
        getTooltipData(originalData: any, index: number): any;
    }
    export var Petal: UncertainShape;
    export var BullEye: UncertainShape;
    export var BoxWhisker: UncertainShape;

    //Legend
    export class Legend {
        isVisible: boolean;
        constructor(_plot: any, _jqdiv: any, isCompact?: any, hasTooltip?: any);
        remove(): any;
    }

    //Utils
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
    type ScreenSize = {
        width: number;
        height: number;
    }
    export module Utils {
        function applyMask(mask: number[], array: any, newLength: number): any;
        function maskNaN(mask: number[], numArray: number[]): any;
        /**Returns true if value is Array or TypedArray*/
        function isArray(arr: any): boolean;
        function isOrderedArray(arr: any): boolean;
        function cutArray(arr: any, len: number): any;
        /**Returns intersection of two rectangles {x,y,width,height}, left-bottom corner
        If no intersection, returns undefined.*/
        function intersect(rect1: Rect, rect2: Rect): Rect;
        /**Returns boolean value indicating whether rectOuter includes entire rectInner, or not.
        Rect is  {x,y,width,height}*/
        function includes(rectOuter: Rect, rectInner: Rect): boolean;
        /**Returns boolean value indicating whether rect1 equals rect2, or not.
        Rect is  {x,y,width,height}*/
        function equalRect(rect1: Rect, rect2: Rect): boolean;
        function calcCSWithPadding(plotRect: any, screenSize: any, padding: any, aspectRatio: any): any;//??
        /**Browser-specific function. Should be replaced with the optimal implementation on the page loading.*/
        function requestAnimationFrame(handler: any, args?: any): any;
        /**Creates and initializes an array with values from start to end with step 1.*/
        function range(start: any, end: any): any;
        /**finalRect should contain units in its values. f.e. "px" or "%"*/
        function arrangeDiv(div: any, finalRect: any): any;
        /**Computes minimum rect, containing rect1 and rect 2*/
        function unionRects(rect1: Rect, rect2: Rect): Rect;
        /**Parses the attribute data-idd-style of jqElement and adds the properties to the target
        e.g. data-idd-style="thickness: 5px; lineCap: round; lineJoin: round; stroke: #ff6a00"*/
        function readStyle(jqElement: any, target: any): any;//??
        function getDataSourceFunction(jqElem: any, defaultSource: any): any;
        function makeNonEqual(range: MinMax): MinMax;
        function getMinMax(array: number[]): MinMax;
        function getMin(array: number[]): number;
        function getMax(array: number[]): number;
        /**Returns structure {minx, maxx, miny, maxy}*/
        function getMinMaxForPair(arrayx: any, arrayy: any): any;
        function enumPlots(plot: any): any;//???
        function reorder(p: any, p_before: any, isPrev: any): any;//??
        function getMaxOrder(p: any): number;
        function getBoundingBoxForArrays(_x: any, _y: any, dataToPlotX: any, dataToPlotY: any): any//??
        function getAndClearTextContent(jqElement: any): any;
        function getPlotRectForMap(map: any, screenSize: any): any;
    }
    export module Binding {
        /**Binds visible rectangles of two plots.
        filter is either "v" (binds vertical ranges), "h" (binds horizontal ranges), or "vh" (default, binds both ranges).*/
        function bindPlots(plot1: any, plot2: any, filter?: string): any;
        function getBoundPlots(plot: any): any;
    }

    //Formatter
    export class AdaptiveFormatter {
        constructor(series: any, segment?: any);
        getPrintFormat(min: any, max: any, std: any): any;
    }

    //Axis
    export function InitializeAxis(div: any, params?: any): any;

    //Base
    /**Registers new plot type
    key: string, plot-factory: jqDiv x master plot -> plot*/
    export function register(key: string, factory: any): any;
    /**Instantiates a plot for the given DIV element.
    jqDiv is either ID of a DIV element within the HTML page or jQuery to the element to be initialized as a plot.
    Returns new InteractiveDataDisplay.Plot instance.*/
    export function asPlot(div: any): any;
    /**Tries to get IDD plot object from jQuery selector
    Returns null if selector is null or DOM object is not an IDD master plot*/
    function tryGetMasterPlot(jqElem: any): any;
    /**Traverses descendants of jQuery selector and invokes updateLayout 
    for all IDD master plots*/
    function updateLayouts(jqElem: any): any;
}

export module Plot {
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
    type AreaTitles = {
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
    type AreaDefinition = {
        x?: number[];
        y1: number[];
        y2: number[];
        fill?: Color;
        opacity?: number;
        displayName?: string;
        titles?: AreaTitles;
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
        sizePalette?: InteractiveDataDisplay.SizePalette;
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
    /**The plot draws a colored area between two scalar grid functions.
    The space between lines y1[i](x[i]) and y2[i](x[i]) is filled with a solid color; the boundaries are not stroked.*/
    function area(element: AreaDefinition): InteractiveDataDisplay.PlotInfo;
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