/// <reference path="../../typings/jquery/jquery.d.ts" />

module ChartViewer {   

    export type PlotRegistry = {
        [plotKind: string]: IDDPlotFactory;
    }

    //export type IDDPlot = any;
    export type PlotCardContent = {}

    export interface IDDPlotFactory {
        initialize(plotDefinition: PlotInfo, viewState, chart: IDDPlot): IDDPlot[];
        draw(plots: IDDPlot[], plotDefinition: PlotInfo): void;
        createPlotCardContent(plotDefinition: PlotInfo): PlotCardContent;
    }
    /* A libary of plots supported by the ChartViewer. */
    export var PlotRegistry: PlotRegistry = {}
}