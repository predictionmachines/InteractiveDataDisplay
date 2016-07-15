InteractiveDataDisplay = {
    MinSizeToShow: 1, // minimum size in pixels of the element to be rendered
    Padding: 20, // extra padding in pixels which is added to padding computed by the plots
    maxTickArrangeIterations: 5, // max number of iterations in loop of ticks creating
    tickLength: 10, // length of ordinary tick 
    minLabelSpace: 60, // minimum space (in px) between 2 labels on axis
    minTickSpace: 5, // minimum space (in px) between 2 ticks on axis
    minLogOrder: 4, // minimum order when labels on logarithmic scale are written with supscript
    minNumOrder: 5, // minimum order when labels on numeric scale are written with supscript
    TooltipDelay: 1, // delay (seconds) between mouse stops over an element and the tooltip appears
    TooltipDuration: 10, // duration (seconds) when tooltip is shown
    CssPrefix: '', // browser-dependent prefix for the set of css styles
    ZIndexNavigationLayer: 1000,
    ZIndexDOMMarkers: 1500,
    ZIndexTooltipLayer: 2000,
    HeatmapworkerPath: undefined,// prefix for idd.heatmapworker.js for using in IE10 and IE11
    factory: {} // table of values (key: string, plot-factory: jqDiv x master plot -> plot)
};
