ChartViewer - Technical Documentation
=====================================

## Plot Registry

### Responsibility

Creates and draws IDD plots, and builds legend content for an instance of `PlotInfo`.

### Description

`PlotRegistry` is a libary of plots supported by the ChartViewer. It exposes an interface used by the viewer to create and update IDD plots corresponding
to the plot definitions passed in `ChartViewer.show()` and `ViewerControl.update()` methods. Also it allows a user to register new plot kind and thus
make it available to show plot definitions of that kind.

	ChartViewer.PlotRegistry : {
		[plotKind: string]: IDDPlotFactory
	}

where 

	interface IDDPlotFactory = {		
		initialize(plotDefinition: PlotInfo, viewState: ViewState, chart: IDDChart): IDDPlot[];
		draw(plots: IDDPlot[], plotDefinition: PlotInfo): void;
		createPlotCardContent(plotDefinition: PlotInfo): PlotCardContent;
	}

	interface PlotCardContent = {		
		content: HtmlElement;
	}

The `initialize` method creates new IDD plot(s) for the given plot definition and returns them. Also it 
can subscribe to the view state to react on its changes.
It is guaranteed that `kind` of the plot definition is same as the `plotKind` key used to registry the factory
in the `PlotRegistry`. Nothing is drawn in the plots after the method returns.


The `draw` method draws data of the plot defition on the given plots. It is guaranteed that the `plots` are built
by a call of the `initialize` method of this factory, but probably for diferent instance of the plot definition.
It is guaranteed that `kind` of the plot definition is same as the `plotKind` key used to registry the factory
in the `PlotRegistry`.

The `createPlotCardContent` method builds new unattached HTML element that reflects the given plot definition.
It is guaranteed that `kind` of the plot definition is same as the `plotKind` key used to registry the factory
in the `PlotRegistry`.

## ViewerControl

### Update

	update(plots: ChartInfo)	

where 

	interface ChartInfo {
        [id: string]: PlotInfo;
    }

The method updates an existing collection of plots in accordance with the algorithm:

* if name from new given collection p2 exists in the old collection p1 then 
> * if PlotInfo in p2 == null then do nothing 
> * if old PlotInfo and new PlotInfo have same types then find and update an existing idd plot using its method draw
> * else remove old and create new Plot
* if name from p2 doesn't exist in p1 then add new Plot
* if name from p1 doesn't exist in p2 then remove Plot
 