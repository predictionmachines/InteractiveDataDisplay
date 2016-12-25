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

    //==================Interactive Data Display=====================
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
    /**Represents a mapping from a number to a value (e.g. a color)
    The function color has an domain [min,max]. If type is absolute, min and max are arbitrary numbers such that max>min.
    If type is relative, min=0,max=1, and a user of the palette should normalize the values to that range.
    Argument of the color is normalized to the domain of the function
    palettePoints is an array of hslaColor.*/
    export class ColorPalette {
        isNormalized: boolean;
        range: MinMax;
        points;
        constructor(isNormalized: boolean, range: MinMax, palettePoints);
        getRgba(value);
        getHsla(value);
        absolute(min, max);
        relative();
        banded(bands): ColorPalette;
        /**Discretizes the palette
        Returns an Uint8Array array of numbers with length (4 x number of colors), 
        contains 4 numbers (r,g,b,a) for each color, 
        where 0 <= r,g,b,a <= 255*/
        static toArray(palette, n);
        static create(): ColorPalette;
        static parse(paletteString?): ColorPalette;
        static colorFromString(hexColor);
        static RGBtoHSL(rgbaColor);
        static HSLtoRGB(hslaColor);
    }
    export class Lexer {
        position;
        paletteString;
        currentSeparator;
        currentLexeme;
        currentNumber;
        currentColor;
        constructor(paletteString:string);
        readNext();
    }
    export class ColorPaletteViewer {
        axisVisible: boolean;
        palette;
        dataRange: MinMax;
        constructor(div, palette?, options?);
    }
    export module palettes {
        var grayscale: ColorPalette
    }
    export class SizePalette {
        isNormalized: boolean;
        range: MinMax;
        sizeRange: MinMax;
        constructor(isNormalized: boolean, sizeRange: MinMax, valueRange?: MinMax);
        getSize(value: number);
    }
    export class SizePaletteViewer {
        axisVisible: boolean;
        palette;
        dataRange: MinMax;
        constructor(div, palette?, options?);
    }
    export class UncertaintySizePaletteViewer {
        maxDelta: number;
        constructor(div, options?);
    }

    //transforms
    /**Class for coordinate transform, cs is build from plot rect and screen size*/
    export class CoordinateTransform {
        constructor(plotRect?: Rect, screenRect?, aspectRatio?: number);
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
        getScale();
        /**Returns {x, y}*/
        getOffset();
        clone(): CoordinateTransform;
    }
    export class DataTransform {
        constructor(dataToPlot, plotToData, domain, type);
    }
    export var mercatorTransform: DataTransform;
    export var logTransform: DataTransform;

    //Plots
    export class Plot {
        isMaster: boolean;
        /**Indicates whether the last frame included rendering of this plot or not.*/
        isRendered: boolean;
        flatRendering;
        master;
        host;
        centralPart;
        name;
        children;
        screenSize: ScreenSize;
        xDataTransform;
        yDataTransform;
        coordinateTransform;
        doFitOnDataTransformChanged;
        aspectRatio;
        isAutoFitEnabled;
        isVisible: boolean;
        order: number;
        visibleRect: Rect;
        mapControl;
        tooltipSettings;
        isToolTipEnabled;
        navigation;
        /**Allows to set titles for the plot's properties.
        E.g. "{ color:'age' }" sets the 'age' title for the color data series.
        Given titles are displayed in legends and tooltips.*/
        titles;
        constructor(div, master, myCentralPart?);
        selfMapRefresh();
        /**Returns a user-readable title for a property of a plot.
        E.g. can return "age" for property "color".
        If there is no user-defined title, returns the given property name as it is.*/
        getTitle(property: string): string;
        setTitles(titles, suppressFireAppearanceChanged?);
        /**Uninitialize the plot (clears its input)*/
        destroy();
        /**Removes this plot from its master and physically destroys its host element.*/
        remove();
        removeMap();
        addChild(childPlot);
        /**The function is called when this plot is added(removed) to the new master.*/
        onAddedTo(master);
        /**Removes a child from this plot.
        Argument plot is either the plot object or its name*/
        removeChild(plot): boolean;
        /**Gets linear list of plots from hierarchy*/
        getPlotsSequence();
        /**Gets the bounds of inner content of this plot (excluding its children plots)*/
        getLocalBounds(step, computedBounds): Rect;
        /**Computes bounds of inner content of this plot (excluding its children plots)*/
        computeLocalBounds(step, computedBounds): Rect;
        /**Invalidates local bounding box stored in the cache.
        To be called by derived plots. Returns previous local bounding box.*/
        invalidateLocalBounds();
        /**Aggregates all bounds of this plot and its children plots*/
        aggregateBounds(): Rect;
        /**Computes padding of inner content of this plot.
        Returns 4 margins in the screen coordinate system.*/
        getLocalPadding();
        /**Aggregates padding of both content of this plot and its children plots.
        Returns 4 margins in the plot plane coordinate system.*/
        aggregatePadding();
        requestNextFrame(plot?);
        requestUpdateLayout(settings?);
        /**Updates output of this plot using the current coordinate transform and screen size.
        Returns true, if the plot actually has rendered something; otherwise, returns false.*/
        render(plotRect: Rect, screenSize: ScreenSize): boolean;
        /**Updates output of this plot using the current coordinate transform and screen size.*/
        renderCore(plotRect: Rect, screenSize: ScreenSize);
        /**Renders the plot to the svg and returns the svg object.*/
        exportToSvg();
        exportContentToSvg(plotRect: Rect, screenSize: ScreenSize, svg);
        /**Renders this plot to svg using the current coordinate transform and screen size.*/
        renderCoreSvg(plotRect: Rect, screenSize: ScreenSize, svg);
        fit(screenSize:ScreenSize, finalPath: boolean, plotScreenSizeChanged: boolean): Rect;
        /**Makes layout of all children elements of the plot and invalidates the plots' images.*/
        updateLayout();
        measure(availibleSize, plotScreenSizeChanged);
        arrange(finalRect);
        fitToView();
        fitToViewX();
        fitToViewY();
        /**If auto fit is on and bound box changed, updates the layout; otherwise, requests next frame for this plot.*/
        requestNextFrameOrUpdate();
        getTooltip(xd: number, yd: number, xp?: number, yp?: number);
        /**Gets the plot object with the given name.
        If plot is not found, returns undefined.*/
        get(p);
        polyline(name: string, data?): Polyline;
        markers(name: string, data?, titles?): Markers;
        area(name: string, data?): Area;
        heatmap(name: string, data?, titles?): Heatmap;
        getLegend();
        updateOrder(elem?, isPrev?: boolean);

    }
    /**Class for plots and axes arrangement.Takes into account "placement" property of an element use it for element arrangement*/
    export class Figure extends Plot {
        constructor(div, master?);
        getAxes(placement?);
        get(p);
        addDiv(htmlCode, placement);
        removeDiv(divToRemove);
        addAxis(placement, axisType, params, insertBeforeDiv);
        measure(screenSize: ScreenSize);
        arrange(finalRect);
        exportContentToSvg(plotRect: Rect, screenSize: ScreenSize, svg);
    }
    export class Chart extends Figure {
        legend: Legend;
        constructor(div, master?);
        onDataTranformChangedCore(arg);
        onChildrenChanged(arg);
    }
    /**Base class for plots rendering on a private canvas.*/
    export class CanvasPlot extends Plot{
        constructor(div, master);
        getContext(doClear: boolean);
        destroy();
        arrange(finalRect);
        /**Gets the transform functions from data to screen coordinates.
        Returns { dataToScreenX, dataToScreenY }*/
        getTransform();
        /**Gets the transform functions from screen to data coordinates.
        Returns { screenToDataX, screenToDataY }*/
        getScreenToDataTransform();
    }
    /**Renders a function y=f(x) as a polyline.*/
    export class Polyline extends CanvasPlot {
        thickness: number;
        stroke;
        lineCap;
        lineJoin;
        fill68;
        fill95;
        constructor(div, master);
        draw(data);
        computeLocalBounds(step, computedBounds): Rect;
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding();
        getTooltip(xd, yd, px, py);
        renderCore(plotRect: Rect, screenSize: ScreenSize);
        renderCoreSvg(plotRect: Rect, screenSize: ScreenSize, svg);
        onDataTransformChanged(arg);
        getLegend();
    }

    type MarkersDefaults = {
        color: string
        colorPalette: ColorPalette
        border: string
        size: number
    }
    export class Markers extends CanvasPlot{
        constructor(div, master);
        /**return copy of data*/
        getDataCopy();
        /**Draws the data as markers.*/
        draw(data, titles?);
        /**Returns a rectangle in the plot plane.*/
        computeLocalBounds(step, computedBounds);
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding();
        renderCore(plotRect, screenSize);
        findToolTipMarkers(xd: number, yd: number, xp?: number, yp?: number);
        /**Builds a tooltip <div> for a point*/
        getTooltip(xd, yd, xp, yp);
        getLegend();
        onDataTransformChanged(arg);

        static defaults: MarkersDefaults;
        static shapes;
    }
    /**Area plot takes data with coordinates named 'x', 'y1', 'y2' and a fill colour named 'fill'.*/ 
    export class Area extends CanvasPlot {
        constructor(div, master);
        draw(data);
        /**Returns a rectangle in the plot plane.*/
        computeLocalBounds();
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding();
        renderCore(plotRect: Rect, screenSize: ScreenSize);
        onDataTransformChanged(arg);
        getLegend();
    }
    /**Renders a fuction  f(x, y) on a regular grid (x, y) as a heat map using color palette*/
    export class Heatmap extends CanvasPlot {
        palette: ColorPalette;
        opacity: number;
        mode;
        constructor(div, master);
        onRenderTaskCompleted(completedTask);
        draw(data, titles?);
        /**Returns a rectangle in the plot plane.*/
        computeLocalBounds();
        /**Updates output of this plot using the current coordinate transform and screen size.
        plotRect - rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
        screenSize - size of the output region to render inside
        Returns true, if the plot actually has rendered something; otherwise, returns false.*/
        renderCore(plotRect: Rect, screenSize: ScreenSize);
        onIsRenderedChanged();
        onDataTransformChanged(arg);
        /**Gets the value (probably, interpolated) for the heatmap
        in the point (xd,yd) in data coordinates.
        Depends on the heatmap mode.
        Returns null, if the point is outside of the plot.*/
        getValue(xd, yd, array);
        getTooltip(xd: number, yd: number, xp?: number, yp?: number, changeInterval?: MinMax);
        getLegend();
    }
    /**Renders set of DOM elements in the data space of this plot*/
    export class DOMPlot extends Plot {
        domElements;
        constructor(host, master);
        computeLocalBounds(): Rect;
        /**Returns 4 margins in the screen coordinate system*/
        getLocalPadding();
        arrange(finalRect);
        renderCore(plotRect: Rect, screenSize: ScreenSize);
        onIsRenderedChanged();
        clear();
        /**Adds new DIV element to the plot.
        element is an HTML describing the new DIV element;
        scaleMode is either 'element', 'content', or 'none';
        returns added DOM element*/
        add(element, scaleMode, x: number, y: number, width?: number, height?: number, originX?: number, originY?: number);
        /**Removes DIV element from the plot. element is DOM object.*/
        remove(element?);
        /**Set the position and optionally width and height of the element
        element is DOM object which must be added to the plot prior to call this method
        left, top are new coordinates of the left top corner of the element in the plot's data space
        ox, oy are optional new originX and originY which range from 0 to 1 and determines binding point of element to plots coordinates*/ 
        set(element, x: number, y: number, width?: number, height?: number, ox?: number, oy?: number);

    }
    export class GridlinesPlot extends CanvasPlot {
        xAxis;
        yAxis;
        thickness: number;
        stroke;
        constructor(host, master);
        renderCore(plotRect: Rect, screenSize: ScreenSize);
        renderCoreSvg(plotRect: Rect, screenSize: ScreenSize, svg);
    }
    export class BingMapsPlot extends Plot {
        map;
        constructor(div, master);
        arrange(finalRect);
        /**Sets the map provided as an argument which is either a tile source (Microsoft.Maps.TileSource, e.g. see InteractiveDataDisplay.BingMaps.OpenStreetMap.GetTileSource),
        or a map type of Bing Maps (Microsoft.Maps.MapTypeId).*/
        setMap(map);
        constraint(plotRect: Rect, screenSize: ScreenSize);
    }

    //Navigation
    export class NavigationPanel {
        constructor(plot, div, url?);
        remove();
    }
    export class Navigation {
        animation;
        gestureSource;
        constructor(_plot, _setVisibleRegion);
        /**Changes the visible rectangle of the plot.
        visible is { x, y, width, height } in the plot plane, (x,y) is the left-bottom corner
        if animate is true, uses elliptical zoom animation*/
        setVisibleRect(visible, animate, settings);
        stop();
    }
    export module NavigationUtils {
        /**Suppress default multitouch for web pages to enable special handling of multitouch in InteractiveDataDisplay.
        Suitable for iPad, Mac.
        For Windows 8, idd.css contains special css property for this effect.*/
        function SuppressDefaultMultitouch();
        function calcPannedRect(plotRect: Rect, screenSize: ScreenSize, panGesture): Rect;
        function calcZoomedRect(plotRect: Rect, coordinateTransform, zoomGesture);
    }

    //Workers
    export class SharedRenderWorker {
        constructor(scriptUri, onTaskCompleted);
        enqueue(task, source);
        /**Cancels the pending task for the given source.*/
        cancelPending(source);
    }

    //Uncertain Shapes
    interface UncertainShape {
        prepare(data): void;
        preRender(data, plotRect, screenSize, dt, context);
        draw(marker, plotRect, screenSize, transform, context): void;
        hitTest(marker, transform, ps, pd): boolean;
        getLegend(data, getTitle, legendDiv);
        getTooltipData(originalData, index: number);
    }
    export var Petal: UncertainShape;
    export var BullEye: UncertainShape;
    export var BoxWhisker: UncertainShape;

    //Legend
    export class Legend {
        isVisible: boolean;
        constructor(_plot, _jqdiv, isCompact?);
        remove();
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
        /*Returns array similar to original but all 'null' are replaced by 'NaN' in it*/
        function missingValuesNaNProcessing(values);
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
        function getPlotRectForMap(map, screenSize);
    }
    export module Binding {
        /**Binds visible rectangles of two plots.
        filter is either "v" (binds vertical ranges), "h" (binds horizontal ranges), or "vh" (default, binds both ranges).*/
        function bindPlots(plot1, plot2, filter?: string);
        function getBoundPlots(plot);
    }

    //Formatter
    export class AdaptiveFormatter {
        constructor(series, segment?);
        getPrintFormat(min, max, std);
    }

    //Axis
    export function InitializeAxis(div, params?);

    //Base
    /**Registers new plot type
    key: string, plot-factory: jqDiv x master plot -> plot*/
    export function register(key: string, factory);
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

