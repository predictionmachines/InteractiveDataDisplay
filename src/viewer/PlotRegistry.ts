/// <reference path="../../typings/jquery/jquery.d.ts" />
declare var InteractiveDataDisplay: any;
module ChartViewer {   
    export type PlotRegistry = {
        [plotKind: string]: IDDPlotFactory;
    }
    export interface IDDPlotFactory {
        initialize(plotDefinition: PlotInfo, viewState, chart: IDDPlot): IDDPlot[];
        draw(plots: IDDPlot[], plotDefinition: PlotInfo): void;
    }
    /* A libary of plots supported by the ChartViewer. */
    export var PlotRegistry: PlotRegistry = {}
}