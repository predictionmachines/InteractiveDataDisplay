# Markers

An InteractiveDataDisplay plot which displays data as a collection of points, each having the value of one data series 
determining the position on the horizontal axis and the value of the other data series 
determining the position on the vertical axis. Also data series can be bound to marker size and color, and other
appearance settings.

Markers plot has default collection of supported shapes such as box, circle, cross, triangle etc, but still it allows 
creating new shapes.

See a [sample](http://predictionmachines.github.io/InteractiveDataDisplay/sample-bubbles.html) of the marker plot.

## API 

### HTML
In HTML, a marker plot is indicated by the attribute ``data-idd-plot="markers"``. 

```HTML
<script type="text/javascript">
    $(document).ready(function () {
        var chart = InteractiveDataDisplay.asPlot($("#chart"));
    });
</script>

<div id="chart" data-idd-plot="chart" style="width: 800px; height: 600px;">    
  <div id="markers" data-idd-plot="markers" data-idd-style="shape:circle; size:15; color:blue;">
  y x
  3 0
  4 1
  2 2
  </div>
</div>
```

### JavaScript
In JavaScript, use `InteractiveDataDisplay.Plot.markers(name, data, titles)` or
`InteractiveDataDisplay.Markers.draw(data, titles)`.

The `Plot.markers` function returns an instance of `Markers` which allows to update values using `Markers.draw` function.
Still it is possible to call `Plot.markers` many times with same `name`, so that the first call creates the markers plot and
subsequent calls update the existing plot. The `name` allows to identify the plot in code and also it is displayed in a tooltip
and a legend.

The following example adds `"markers"` plot to the `chart`; `x` and `y` are numeric arrays determining positions of markers.
Each marker is a circle with diameter 15 pixels and filled with blue.

```JavaScript
chart.markers("markers", { x: [0,1,2], y: [3,4,2], size: 15, color: "blue", shape: "circle" });
```

The methods make a shallow copy of the given `data` so it can be re-used by the caller. 
Note that values of the `data` properties are not 
copied because it would degrade the performance. Thus content of `data` must not be changed to avoid
side effects on the drawn plot.

If the `data.shape` is undefined, the default shape is `"box"`; otherwise, `shape` must be either a string name
of one of the shapes contained in the `InteractiveDataDisplay.Markers.shapes` or an object implementing
the `MarkerShape` interface. See section `Shape` for details about available shapes and developing
a new shape.

The argument `data` considered as a table whose columns correspond to properties of the object,
while rows are the values of the properties.

For instance, the following `data` represents a table with columns `x`, `y`, `size` and `color`:

```JavaScript
var data = {
    x: [ 0, 1, 2 ],
    y: [ 3, 4, 2 ],
    size: 15
    color: "blue",
    shape: circle
}
``` 

While value of the property `data.shape` determines the expected structure of the `data` and the rendering algorithm,
the common rules for `data` comprehension are:
- each of the table rows represents a single marker to be rendered;
- all arrays should be of same length;
- total number of rows is the length of the arrays;
- the scalar values are considered as an array with length equal to the number of rows, where all elements equal to the given scalar value, 
e.g. the `data.color` will be read as `["blue", "blue", "blue"]`.

For example, the shown `data` specifies 3 markers; first is located at point `(0, 3)`, displayed as a circle with diameter 15 pixels.

See description of a shape for specific requirements on `data` structure.

### ChartViewer
When building ChartViewer, use `Plot.markers(plotInfo)`:

```Javascript
ChartViewer.show(chartDiv, {
    "y(x)": Plot.markers({ x: [0,1,2], y: [3,4,2], size: 15, color: "blue", shape: "circle" })
});
```
See [ChartViewer](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/ChartViewer.md#markers) for more details.

## Shapes

When drawing a markers plot, a user provides shape of a marker as a value of property `data.shape`. It must be either a string name
of one of the shapes contained in the `InteractiveDataDisplay.Markers.shapes` or an object implementing
the `MarkerShape` interface. If `data.shape` is undefined, the default shape is `"box"`. 

In the basic configuration of the InteractiveDataDisplay release, the `InteractiveDataDisplay.Markers.shapes` contains the shapes described in the Basic Shapes section.

### Basic Shapes

The shapes `"box"`, `"circle"`, `"cross"`, `"diamond"`, `"triangle"` make the markers to be rendered as the corresponding glyph
at points determined by `data.x` and `data.y` numeric arrays. The mandatory and optional properties of the `data` are listed below.

Mandatory properties:
- `y` is an array of numbers. May contain `NaN` indicating the missing value. Determines markers positions on the vertical axis.

Optional properties:
- `shape` is either `"box"`, `"circle"`, `"cross"`, `"diamond"`, `"triangle"`; default value is `"box"`. 
- `x` is an array of numbers. May contain `NaN` indicating the missing value. Determines markers positions on the horizontal axis.
Default values are point indices 0, 1, 2, ....
- `border` is a string color parsed as CSS color [value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). Determines
a color of the border drawn around the marker with corresponding shape. If it is undefined or `"none"`, no border is drawn; this usually
significantly increases performance. Default is `undefined`. 
- `color` is either a string color, an array of string colors, or an array of numbers. Default value is a predefined string color.
    - A string color parsed as CSS color [value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value). 
    All markers are filled with this color. 
    - An array of string colors, each parsed as CSS color [value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
    The array contains individual colors for each of the markers. Missing or undefined values are prohibited.
    - An array of numbers. These values along with the `data.colorPalette` will be used to get individual colors 
    for each of the markers. May contain `NaN` indicating the missing value.
- `colorPalette` is an instance of `InteractiveDataDisplay.ColorPalette` which allows to get a color from a number. Used only when the 
`data.color` is an array of numbers; otherwise, it is ignored. A default palette is used if the property is missed.
- `size` is either a number of an array of numbers. Default value is a certain size in pixels.
    - A number is a size in pixels, same for all markers.
    - An array of numbers. 
        * If the `sizePalette` is defined, the actual sizes in pixels for each of the markers are computed using 
    `data.sizePalette`; may contain `NaN` indicating the missing value. 
        * Otherwise the values are sizes in pixels. Missing or undefined values are prohibited.
- `sizePalette` is an instance of `InteractiveDataDisplay.SizePalette` which allows to get a marker size in pixels from a number. 
Used only when the `data.size` is an array of numbers; otherwise, it is ignored. A default palette is used if the property is missed.

If some element of `x` or `y` has value `NaN`, the corresponding marker is not displayed.

### Custom Shape

#### Implementing Shape
Custom marker shape is an object implementing certain interface:

```TypeScript
interface MarkerShape {
    prepare? (data: Object): void;
    preRender? (data: Object, plotRect: Rect, screenSize: Size, transform: DataToScreen, context: Context2d): Object;
    draw(markerData: Object, plotRect: Rect, screenSize: Size, transform: DataToScreen, context: Context2d, index: number): void;    
    hitTest? (markerData: Object, transform: DataToScreen, p_screen: Point, p_data: Point) : boolean; 
    getBoundingBox? (data: Object) : Rect;
    getPadding? (data: Object) : Padding;
    getLegend? (data: Object) : Legend;
}

type Point {
    x: number;
    y: number;
}

type Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

type Size {
    width: number;
    height: number;
}

type Padding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

type DataToScreen {
    dataToScreenX: number => number;
    dataToScreenY: number => number;
}

type Legend {
    thumbnail: HtmlElement;
    content: HtmlElement;
}
```

The shape instance should be stateless and side effect-free. The marker plot life cycle is as follows:

1. **Construction.** A user defines a marker plot in any of available ways and an instance of the markers plot is created.
1. **Drawing.** A user (implicitly or explicitly) calls method `draw` and provides `data` object.
Initial data taken from the HTML attribute `data-idd-style` and the DOM element content is copied to the 
given `data` (but doesn't override the existing values).
This stage can repeat several times for a single plot instance and shape of the marker can change. Each time user needs to 
change data or appearance settings, the "drawing" stage occurs. 
1. **Preparing.** This stage immediately follows the previous stage. The `shape.prepare` method is called 
for the given `data`; the method checks the object for validity and completeness. 
If the object is invalid, the method must throw an exception.
The method should modify the given object.
After the stage the object must be valid and complete in terms of the shape;
all following stages use this `data` object.
If `shape.prepare` is undefined, the stage outputs the original data object.
This is a place to compute min and max for data series and replace normalized palettes with absolute, as well as
substitue default values; to check lengths of the given arrays. 
The color data series can replaced with colors using the palette.
Also, at this stage the missing values can be filtered out, so only the data that should be
rendered remains.   
1. **Plot Rendering.** Rendering is initiated by IDD infrastructure when required
(but after the "preparing" stage is complete).
Its goal is to render the plot in the given canvas context. This stage includes two sub-stages:
    1. **Pre-rendering.** At this stage, the `data` object is passed the `shape.preRender` method along with screen
    parameters. This is a place where data rows can be filtered or altered, for example adjusted to the current 
    screen size. The method returns new `data` object; if the method is undefined, the original data is used next.
    Also here it is possible to set up the canvas context before markers rendering started.
    1. **Marker rendering.** Next, the method `shape.draw` is applied to each of the `data` rows and renders a single
    marker in the given canvas context.

The optional method `prepare` takes the input data table object and may change it or produce another object
of any structure it needs. 

The method `draw` takes following arguments:

- `markerData` object whose properties are values of the processed input data table, e.g. 
`{x:0.0, y:0.0, color:"blue",shape:"box"}`. 
- `plotRect` is a visible rectangle in the plot coordinates, where the given `(x,y)` is left bottom corner
of the rectangle.
- `screenSize` is a size in screen pixels of the output region, corresponding to the `plotRect`. 
- `transform` contains functions transforming x and y coordinates from data to screen planes.
- `context` is an HTML canvas two-dimensional context instance to render.
- `index` is a sequence index of the marker being rendered (among the markers left after pre-rendering). 
First marker has index zero.

The optional method `getBoundingBox` is called for each of the markers and gets the corresponding
data row. It returns either a rectangle describing its bounding box in the data space,
or `undefined`, if it shouldn't affect the visible rectangle of the plot.
If the method is undefined, the basic implementation will look for `"x"` and `"y"` properties
and will automatically build the bounding box if they are data space locations of the markers
without taking marker size into account. Otherwise, the plot will not affect the fit-to-view process.  

The optional method `getPadding` returns the total padding in screen pixels required by the plot to be included to the
plot screen size when fitting to the content. It is guaranteed that the given `data` is a result of
`prepare` function.

The method `getLegend` builds structured HTML elements that will be embedded to plot legends.
Its argument is the original `data` which has been passed to the `draw` method.

#### Registering Shape

The `data.shape` must be either one of the basic shapes listed above or it should be explicitly added to the 
`InteractiveDataDisplay.Markers.shapes` which is an object where property name is a shape name and property value
is a `MarkerShape` instance.

The following example registers new marker shape so that the `data.shape` is allowed to be `"errorBar"`:

```JavaScript
InteractiveDataDisplay.Markers.shapes["errorBar"] = errorBar;
``` 
