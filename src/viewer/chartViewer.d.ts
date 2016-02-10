declare module ChartViewer {
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
    function show(domElement: HTMLElement, plots: ChartInfo, viewState?: ViewState): ChartViewer.ViewerControl;
}

declare module Plot {
    module MarkerShape {
        var Box: string;
        var Circle: string;
        var Diamond: string;
        var Cross: string;
        var Triangle: string;
    }
    module HeatmapRenderType {
        var Gradient: string;
        var Discrete: string;
    }
    module LineTreatAs {
        var Function: string;
        var Trajectory: string;
    }
    type Quantiles = {
        median: number[];
        lower68: number[];
        upper68: number[];
        lower95: number[];
        upper95: number[];
    };
    type SizeRange = {
        min: number;
        max: number;
    };
    type Color = string;
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
        value?: string;
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
        x: number[];
        y: number[] | Quantiles;
        stroke?: Color;
        thickness?: number;
        treatAs?: string;
        fill68?: Color;
        fill95?: Color;
        displayName?: string;
        titles?: LineTitles;
    };
    type BandDefinition = {
        x: number[];
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
        x: number[];
        y: number[];
        shape?: string;
        color?: Color | number[] | Quantiles;
        colorPalette?: ColorPalette;
        size?: number | number[] | Quantiles;
        sizeRange?: SizeRange;
        borderColor?: Color;
        displayName?: string;
        titles?: MarkersTitles;
    };
    type HeatmapDefinition = {
        x: number[];
        y: number[];
        values: number[] | Quantiles;
        colorPalette?: ColorPalette;
        treatAs?: string;
        displayName?: string;
        titles?: HeatmapTitles;
    };
    function line(element: LineDefinition): ChartViewer.PlotInfo;
    function band(element: BandDefinition): ChartViewer.PlotInfo;
    function boxplot(element: BoxPlotDefinition): ChartViewer.PlotInfo;
    function markers(element: MarkersDefinition): ChartViewer.PlotInfo;
    function heatmap(element: HeatmapDefinition): ChartViewer.PlotInfo;
}

