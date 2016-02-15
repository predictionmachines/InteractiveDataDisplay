ChartViewer
===========

ChartViewer is a TypeScript UI control to show interactive charts. It is based on [Interactive Data Display](https://github.com/predictionmachines/InteractiveDataDisplay).

ChartViewer:

* gives a user an informative legend, smooth navigation, log scales and probes
* exposes a succinct and easy API to create and update a chart
* allows to visualize uncertain values as well as usual numeric values
* high performance enables interactive visualization of tens of thousands data items
* automatically puts geographical map on a background
* works on mobile devices and supports gestures

## Preparing to use

### Installing

Add following line to `bower.json` to get all required scripts and resources:

	"idd": "~1.1.1"

Dependencies:

* Interactive Data Display
* Reactive Extensions
* JQuery
* JQuery UI
* BingMaps Map Control
* Modernizr

### Using from HTML

Add following references to your HTML page (don't forget to correct paths):

    <link rel="stylesheet" href="dist/idd.css" />
    <link rel="stylesheet" type="text/css" href="dist/chartViewer.css" />

	<script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js"></script>
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/3.1.2/rx.lite.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.0-beta.1/jquery-ui.min.js"></script>
    <script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>
    
	<script src="dist/idd.js"></script>
    <script src="dist/chartViewer.js"></script>

The variables `ChartViewer` and `Plot` are globally defined.

### Use as AMD module in TypeScript

1. Add reference to `require.js` script in HTML file.

2. Create file `config.js` and configure following modules using `require.config` (please don't forget to update paths):

        require.config({
            baseUrl: ".",
            paths: {
                "chartViewer": "scripts/chartViewer",
                "jquery": "scripts/jquery",
                "jquery-ui": "scripts/jquery-ui",
                "idd": "scripts/idd",
                "idd-css": "scripts/idd",
                "rx": "scripts/rx.lite",
                "css": "scripts/css"
            },
        })

3.  Import `chartViewer` module and get `Charting` object which has two properties: `ChartViewer` and `Plot`:

		import Charting = require("chartViewer.umd");
		Charting.ChartViewer.show(chartDiv, {
			"y(x)": Charting.Plot.line({ x: [0,1,2], y: [3,4,2] })
		});

### Use as AMD module

1. Add reference to `require.js` script in HTML file.

2. Configure following modules using `require.config` (please don't forget to update paths):

        require.config({
            baseUrl: ".",
            paths: {
                "chartViewer": "scripts/chartViewer",
                "jquery": "scripts/jquery",
                "jquery-ui": "scripts/jquery-ui",
                "idd": "scripts/idd",
                "idd-css": "scripts/idd",
                "rx": "scripts/rx.lite",
                "css": "scripts/css"
            },
        })

3. Require `chartViewer` module and get `Charting` object which has two properties: `ChartViewer` and `Plot`:

		require(["chartViewer.umd"], function (Charting) {
				Charting.ChartViewer.show(chartDiv, {
					"y(x)": Charting.Plot.line({ x: [0,1,2], y: [3,4,2] })
				});
		});

### Licensing
Please see the file called [LICENSE](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/LICENSE).

## How to create a ChartViewer

Use `ChartViewer.show(htmlElement, plots) : ViewerControl` method to turn the `htmlElement` to a ChartViewer and show the given plot definitions `plots`.

The following example creates a ChartViewer that displays a line plot of a grid function `y(x)` by providing two arrays for `x` and `y`:

	ChartViewer.show(chartDiv, {
		"y(x)": Plot.line({ x: [0,1,2], y: [3,4,2] })
	});


## What is a plot definition

`ChartViewer.show()` gets a map of pairs (plot identifier, plot definition) as a second argument. Plot definition is a collection of key-value pairs specifying properties of a plot, such as line stroke or marker shape.
Each plot definition has at least one property which is `kind`; it determines a rendering method and must be known to the ChartViewer.

List of other mandatory and optional properties depends on the `kind` value. For example, `line` plot expects mandatory properties `x` and `y` and optional `stroke`, `thickness`.

To simplify process of defining a plot, there are typed functions building plot definitions. They allow a user (i) to see list of available plot kinds using suggestion list of a code editor, and (ii) to see a list of available properties
of each plot kind. These functions are exposed by the `Plot` module.

The following list shows which plot kinds are supported by the ChartViewer:

* `line` dispays information as straight line segments connecting a series of data points. If a variable determining the position on the vertical axis is uncertain,
 bands corresponding to the quantiles of the uncertain values are displayed instead of line segments.
* `band` draws a colored band between two scalar grid functions `y1[i]=y1(x[i])` and `y2[i]=y2(x[i])`.
* `boxplot` draws a colored box plot. The variable determinig the position on vertical axis is uncertain. 
* `markers` displays data as a collection of points, each having the value of one variable determining the position on the horizontal axis and the value of the other variable determining the position on the vertical axis. Other variables
can be bound to marker size and color. Dependent variable, size-bound variable or color-bound variable can be real or uncertain.  
* `heatmap` displays a graphical representation of data where the individual values contained in a matrix are represented as colors. If the values are uncertain,
 allows to see quantiles of each point and highlight regions with similar values.

### Line

Dispays information as straight line segments connecting a series of data points. If a variable that determines the position on the vertical axis is uncertain,
bands corresponding to the quantiles of the uncertain values are displayed instead of line segments.

Use `Plot.line(LineDefinition) : PlotInfo` to a define a line plot.

	type LineDefinition = {
		x?: number[];
		y: number[] | Quantiles;
		stroke?: Color;
		thickness?: number;
		treatAs?: string;
		fill68?: Color;
		fill95?: Color;
		displayName?: string;
		titles?: LineTitles;
	}

`treatAs` may be one of pre-defined values:

	module LineTreatAs {
		var Function = "function";
		var Trajectory = "trajectory";
	}

If `treatAs` is `"Function"` (default value), the series `x[i]` and `y[i]` are sorted by increasing values `x`. Otherwise, the arrays are rendered as is.

If `x` series is missing, it is `[0, 1, ..., y.length-1]`.

Example:

	ChartViewer.show(chartDiv, {
		"y(x)": Plot.line({ x: [0,1,2], y: [3,4,2], stroke: 'blue' })
	});

### Band

The plot draws a colored band between two scalar grid functions.
Use `Plot.band(BandDefinition) : PlotInfo` to a define a band plot.

	type BandDefinition = {
		x: number[];
		y1: number[];
		y2: number[];
		fill?: Color;
		displayName?: string;
		titles?: BandTitles;
	}

The space between lines `y1[i](x[i])` and `y2[i](x[i])` is filled with a solid color; the boundaries are not stroked.

Example:

	ChartViewer.show(chartDiv, {
		"band": Plot.band({ x: [0,1,2], y1: [3,4,2], y2: [1,2,6], fill: 'gray' })
	});


### BoxPlot

The plot draws a colored boxplot.
Use `Plot.boxplot(BoxPlotDefinition) : PlotInfo` to a define a box plot (https://en.wikipedia.org/wiki/Box_plot).  
	
	type BoxPlotDefinition = {
		y: Quantiles;
		x?: number[];
		borderColor?: Color;
		color?: Color;
		displayName?: string;
		titles?: BoxPlotTitles;
	}

Example:

	ChartViewer.show(chartDiv, {
		"boxplot": Plot.boxplot({ 
			y: { median: [1,2,3], lower68: [0,0,0], upper68: [4,4,4], lower95: [0.5,1,2], upper95: [2,3,3.5] }, 
			x : [1,2,3], border: 'red', fill: 'gray' })
	});


### Markers

Displays data as a collection of points, each having the value of one variable determining the position on the horizontal axis and the value of the other variable determining the position on the vertical axis. Also variables
can be bound to marker size and color. Dependent variable, size-bound variable or color-bound variable can be real or uncertain; the latter is represented as a set of quantiles.


Use `Plot.markers(MarkersDefinition) : PlotInfo` to a define a markers plot.

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
	}

`sizeRange` is used if `size` is an array of numbers. In this case, a marker size is within the given range in screen pixels
and proportional to the corresponding value of the array `size`:

	type SizeRange = {
		min: number;
		max: number
	}

Marker shape is either one of pre-defined shapes or a cutom marker shape identified by a string:

	module MarkerShape {        
		var Box = "box";
        var Circle = "circle";
        var Diamond = "diamond";
        var Cross = "cross";
        var Triangle = "triangle";
	}

Example:

	ChartViewer.show(chartDiv, {
		"y(x)": Plot.markers({ x: [0,1,2], y: [3,4,2], color: 'blue', shape: Plot.MarkerShape.Circle })
	});


#### Remarks
 
* If `color` is a value of `Color`, the `colorPalette` is ignored.
* If `color` is a value of `Quantiles`, `size` must be a `number`; `shape` is ignored
	and markers are rendered as so-called 'bull-eyes' glyphs when outer and inner colors indicate level of uncertainty.
* If `size` is a number, the `sizeRange` is ignored.
* If `size` is a value of `Quantiles`, `color` must be a `Color`; `shape` is ignored
	and markers are rendered as so-called 'petals' glyphs when shape indicates level of uncertainty.


### Heatmap

Displays a graphical representation of data where the individual values contained in a matrix are represented as colors. If the values are uncertain, 
 allows to see quantiles of each point and highlight regions with similar values.

Use `Plot.heatmap(HeatmapDefinition) : PlotInfo` to a define a heatmap plot.

	type HeatmapDefinition = {
		x: number[];
		y: number[];
		values: number[] | Quantiles;
		colorPalette?: ColorPalette;
		treatAs?: string; 		 
		displayName?: string;
		titles?: HeatmapTitles;
	}

`treatAs` may be one of pre-defined values:

	module HeatmapRenderType {        
		var Gradient = "gradient";
		var Discrete =  "discrete";
	}

#### Tabular input

One way to define input data for a heatmap is to use tabular definition, when `x`, `y`, `value` form columns of a table
and rows correpond to a single grid point in any order. Final grid is a bounding box of points given in the table.
Missing values are considered as NaN.

For example, the tabular input:

	x  y  values
	0  0  0      
	0  1  0.5    
	1  0  0.5    
	1  1  1.0    

and the code:

	ChartViewer.show(chartDiv, {
		"heatmap": Plot.heatmap({x: [0,0,1,1], y: [0,1,0,1], values: [0,0.5,0.5,1])
	});


#### Two-dimensional values

_not supported yet_



## About used types

- `Color` is a `string` that supports same color definition as in CSS: `"blue"`, `"#606060"`, `"rgba(10,150,200,100)"`
- `ColorPalette` is a `string` that has specific syntax to define palettes, e.g. `"reg,green,blue"` or `"0=red=white=blue=100"`.
- `Quantiles` allows to represent a sequence of uncertain values by providing the quantiles for each of these values:

		type Quantiles = {
			median: number[];
			lower68: number[];
			upper68: number[];
			lower95: number[];
			upper95: number[];
		}

## Using a geographical map on the background

_to do_

## How to give names to data series

_to do_


## How to show dynamic data

Use `ViewerControl.update(plots)` method to update plots.

_to do_
