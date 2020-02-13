### 1.5.38 (February 13, 2020)

Changes:
 - New type definitions (idd.umd.d.ts and idd.webpack.d.ts)
 - Switched to typescript 3.7

### 1.5.37 (February 13, 2020)

Feature:
 - Master plot got new 'initialized' property (jQuery Promise) which provides the way to use the plot after it is fully initialized.

Other changes:
 - Updated dependencies: grunt, grunt-contrib-concat, grunt-contrib-copy, grunt-contrib-jasmine, grunt-contrib-uglify, grunt-ts
 - Switched to typescript 2.4.0

### 1.5.36 (January 30, 2020)

New features:
 - Added Boundary line plot. It represents infinite horizontal or vertical lines that are not presented in a legend. A boundary line name is displayed alongside on the canvas.
 - Added iddAutoFitMode ko.binding that allows to set a visible region for a master chart. Switches between three modes: 1. fit-to-view is enabled for a master plot ("enable" value, is set by default); 2. fit-to-view is disabled for a master plot ("disable" value); 3. fit-to-view is enabled, but constraints are applied. Notation: "bounds(x_left, x_right, y_low, y_high)". Values can be numbers or special 'auto' string.

### 1.5.35 (December 19, 2019)

New features:
 - added iddIgnoredByFitToViewX/iddIgnoredByFitToViewY knockout bindings so that a plot can be not respected by fit to view along one of the axes.
 - Added dash lines support. Choose from dash patterns: "dot", "dash", "dash dot", "long dash", "long dash dot", "long dash dot dot"; or define a set of number pairs: [ dash_length1, space1, dash_length2, space2, ... ]. Knockout binding - iddLineDash.

### 1.5.34 (July 30, 2019)

Bugfix:
 - Proper path to the main file.
Features:
 - adding idd.webpack.d.ts types to package.json

### 1.5.33 (July 30, 2019)

New features:
 - idd.webpack.js is now used as an main file in NPM package.

### 1.5.32 (July 18, 2019)

New features:
 - Adding idd.webpack.d.ts to the distribution.

### 1.5.31 (July 17, 2019)

New features:
 - new bundle idd.webpack.js file distributed with release. It uses dependency names that match npm packages. It is also references CSS dependency directly without "css!" requireJS extension.

### 1.5.30 (March 15, 2019)

Fixes:
 - Regression of legend behavior of legend in Figure and Chart (e.g. not specifying all of the Legend constructor parameters)

New features:
 - Ability to force the display of all labels on the axis (even if the overlay) for the labelled axis

### 1.5.29 (March 8, 2019)

Hot-fix:
 - Axis initialization using custom data readers in subplots

### 1.5.28 (March 7, 2019)

Bug fixes:
 - Subplots alignment fix
 - Legend exception fix

 ### 1.5.27 (March 1, 2019)

New features:
 - Visibility of plots with a same name can be managed via legend in subplot
 - Margin between subplots and margin between subplots and an external legend can be set 
 - Axes sync is enabled in subplots

Bug fixes:
 - Tilted label axis bug fix. #161
 - Label axis positioning bug fix. #164
 - Palette editor z-index bug fix.

### 1.5.26 (February 20, 2019)

New features:
 - Subplots can have a common title
 
### 1.5.25 (February 19, 2019)

Bug fixes:
 - Fixed #174: SVG export of subplots in Edge and FF
 - Legend clipping
 
### 1.5.24 (February 19, 2019)

New features:
 - External legend for subplots: requirement by predictionmachines/FSharpIDD#19
 
Bug fix:
 - Tooltip delay is fixed
 - Legend is hidden in the Figure by default, but visible in the Chart by default

### 1.5.23 (February 14, 2019)

Resolved issues:
 - 175: Vertical labels are not exported to SVG for chart export
 
Reengineering:
 - moved padding, suppress-tooltip-coords, ignored-by-fit-to-view Plot settings to the data-idd-style attribute value

New features:
 - added tooltipDelay property to the data-idd-style. User can now set duration of a delay(sec) before the tooltip appearance

### 1.5.22 (February 11, 2019)

Bug fixes
 - rgba color format parsing support
 - Area and polyline plots now properly exports SVG with transparency. Fixes #172

### 1.5.21 (February 5, 2019)

New features:
 - added basic subplots functionality.
 - Subplots can be exported as one SVG.

### 1.5.20 (January 15, 2019)

New features:
 - added support for data-idd-scientific-notation attribute on numeric axes. With this feature enabled ticks are represented in a form: m × 10ⁿ, where 1≤m≤9 for numbers(modulo): ≥10³ that divisible exactly by 10³, or <10⁻³ 

### 1.5.19 (December 27, 2018)

New features:
 - Tooltip now shows the labels of label axis (in case of label axis depicts intervals)
 - Plot coordinates info can be suppressed in tooltip with `data-idd-suppress-tooltip-coords`

### 1.5.18 (December 21, 2018)
 - base64 data source is now supported for specifying the data declaratively
 - Label axis data can be specified declaratively in the DOM before IDD plot initialization

### 1.5.17 (December 13, 2018)

New features:
 - fixed bar chart: guarding barWidth value to be treated as number.

### 1.5.16 (December 13, 2018)

New features:
 - "data-idd-visible-region" plot attribute can now define the visible are in data coordinates in format "xmin xmax ymin ymax". Specifying the attribute disables fit to view
 - "data-idd-padding" plot attribute can now override the padding (in pixels) added to the data region during calculation of visible region in case of active "fit to view" mode.

### 1.5.15 (December 10, 2018)

New features:
 - fixed vertical alignment of vertical axis title. See samples/Titles.html
 - added a new sample of figure with axes, grid and navigation
 - added support for the figure's data-idd-navigation-enabled and data-idd-legend-enabled attributes.

### 1.5.14 (August 16, 2018)

Bug fixes:
 - fixed multiple event subscription to the zoom event.

### 1.5.13 (August 9, 2018)

Bug fixes:
 - ChartViewer.update() call now redraws the content.

### 1.5.12 (June 14, 2018)

Bug fixed:
 - iddXAxisSettings, iddYAxisSettings added.

### 1.5.11 (May 31, 2018)

Bug fixed:
 - bounding box for Bars is now calculated in plot coordinates.

### 1.5.10 (May 29, 2018)

Bug fixed:
 - iddBarWidth binding for markers works with plot coordinates now.

### 1.5.9 (May 21, 2018)

Bug fixed:
 - plot.order can now be assigned either externally (e.g. via binding) or by relevant legend item reordering (in Chart Viewer).

### 1.5.8 (May 18, 2018)

Bug fixed:
 - iddXlog, iddYlog do not brake axes navigation any more.

### 1.5.7 (May 15, 2018)

New features:
 - added custom KO binding: iddPlotOrder - integer value that controls the plot order
 - added sample page KO.Order.html for the iddPlotOrder binding
 - added custom KO bindings: iddXlog, iddYlog. They boolean value of them controls the log transform of corresponding axis
 - added custom KO bindings: iddIgnoredByFitToView. if set to true, the plot is excluded from FitToView visible region calculation.

### 1.5.6 (May 11, 2018)

New features:
 - plot now has `isIgnoredByFitToView` property. Setting it to `true` prevents the plot to be accounted during FitToView visible region recalculation
 - new sample page: order property of the plot is changed by slider.

### 1.5.5 (May 10, 2018)

Bug fixed:
 - IE 11 related: Number.IsFinite usage avoided
 - Setting aspect value for plot right after initialization does not produce exceptions in Edge

### 1.5.4 (April 24, 2018)

New features:
  - Chart allows to change its axis type using `Chart.changeXAxis()` or `Chart.changeYAxis()` methods.
  See sample `ChangeChartAxis.html`.

## 1.5.3 (April 24, 2018)

Bower away!

New features:
 - Chart legend becomes opaque on mouse hover and transparent otherwise. 
 - Legend in Chart Viewer has tooltip if the name is too long.
 - Area plot has tooltip.
 - Legend has the red sign if plot can not be displayed.
 - New property `opacity` and new binding `iddOpacity` to set area opacity.
 - Navigation now exposes `widthScale` property as an API to build zoom controls

Bug fixes: 
 - First pulled probe is now visible while putting on the chart. 
 - Axis related IDs are now unique in case of several IDD instances at the page
 - The function `fitToView()` now doesn't consider not visible plots for fitting to view.
 - Scrolling now works correctly after log scale transform. 
 - Probe information for polyline disappears after zoom/scale/datatransform changes.
 - Correct dependency on FileSaver.

## 1.5.1 (March 24, 2017)

New features:
 - Deployment of `idd` as an npm package. 
 - Heatmap supports log10-based color palette. 
 - Palette editor `InteractiveDataDisplay.ColorPaletteEditor`.
 - `InteractiveDataDisplay.ColorPaletteViewer` can show palette as logarithmic.
 - IDD Knockout Js extended:
      - New binding [`iddAxisSettings`](https://github.com/predictionmachines/InteractiveDataDisplay/wiki/KnockoutJS%3A-Axis) allows creating a labelled axis, change tick font size etc.
      - New binding `iddPlotTitles` to provide titles for each of a plot properties.      
      - New binding `iddEditorColorPalette` to assign a color palette to the color palette editor instance.
 - Labelled axis:
    - Labels can be angled, see sample `ChangeBottomAxisLabelsAngle.html`.
    - Too long axis labels can become angled.
    - Line breaks are preserved and multiline labels show tooltips.     
 - Box-and-whiskers plot (a kind of markers plot) allows to specify line thickness.
 - Plot has new property `padding` which allows to specify padding which is added to the bounding box of the plot in fit-to-view.
 - Bar plot allows to specify orientation, either horizontal or vertical.
 - New event `Plot.frameRendered` which occurs when master plot rendered a frame.
 - The event `Plot.appearanceChanged` now fires asynchronously and thus multiple events of this kind can be accumulated into a single event and corresponding legend update occurs just once. This significantly reduces load caused by legend update in case
 of intensive data update.
 - New property `Axis.FontSize` to set tick labels font size for particular axis instance.
 - Logarithmic axis can be exported to SVG.
 - `Plot` instances expose an integer ID through property `Plot.instanceId` which is assigned automatically during construction of the plot and is unique during the window lifetime.
 This simplifies debugging of plots.  

Bug fixes: 
  - Fixed bug with pan and zoom using touch events.
  - Labelled axis now escapes label text so it can contain `<`, `>` etc.
  - KnockoutJs for Markers now allows passing an array of string colors as value for the parameter `color`.
  - Fixed `Plot.fireChildrenChanged`: now it raises event for the plot whose children are changed, not for a master plot.
  - Fixed bug with legend update on target plot change.
  - Fixed processing of the attribute `data-idd-datasource`.  
  - Fixed export of labelled axis to svg.
 
### 1.5.0 (December 28, 2016)

**Breaking changes**:
 - **IDD now requires `jquery.mousewheel.js`.** 
 
Fixes:
 - Previously function `add` from `InteractiveDataDisplay.DOMPlot` (see `idd.base.js`) failed if `element` had type jQuery Object.
 - Previously function `getInnerText(x)` from `idd.axis.js` failed if `x` was `undefined`.
 - `bower.json` was incorrect.
 - Fixed bug in mouse wheel behavior.
 
### 1.4.3 (October 19, 2016)

Fixes:
 - UMD version of IDD now properly requires svg.js using alias `svg` and FileSaver.js using alias `filesaver`. 
 Previous version doesn't allow to export SVG when loaded as UMD/CommonJs module.

### 1.4.2 (October 13, 2016)

New features:
 - Label plot draws text labels andor the heatmap plot when using `idd_knockout.js`. See `samples/Dynamic Gradient Heatmap with Knockout.html`.
 - Knockout bindings for label plot.

### 1.4.1 (August 8, 2016)

New features:
 - Export to SVG: chart, area, markers, polyline with uncertainty can be exported to SVG; legend also can be exported to SVG except uncertain marker shapes.
 - New marker shape `"bars"`.
 - Navigation panel is updated, it allows to download the plot as SVG file (uses FileSaver.js).   

### 1.4.0 (July 21, 2016)

**Breaking changes**: 
 - **Removed separate chartViewer.js (.css, .d.ts)**. Idd.js now includes chartViewer.js (same for umd version). 
 Changed namespace `ChartViewer` to `InteractiveDataDisplay`.
 - ChartViewer's `"band"` plot is now `"area"` as it is in idd. Corresponding changes are in names: `AreaDefinition`, `Plot.area()`.

New features:
 - IDD release includes idd.ko.js which is a superset for idd.js with basic support for Knockout. See coming examples in the [Wiki](https://github.com/predictionmachines/InteractiveDataDisplay/wiki).
 - Support of knockout bindings register for arbitrary plots.
 - The `sizePalette` property of markers definition now can be either object `InteractiveDataDisplay.SizePalette` (as before) or 
 an object of following structure: `{ sizeRange: {min:Number, max:Number}, valueRange?: {min:Number, max:Number}}`.
 
Fixes:
  - Previously markers failed if `colorPalette` was a string defining an absolute palette.
  - Box-and-whisker markers failed if `y.median` or `x` had `NaN`.

 
Changes:
 - Box-and-whisker markers are now represented by a single shape `"boxwhisker"` and the actual marker type (either box-and-whisker, box or just whisker) depends on the drawn data. See the [samples](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/test/manual/Boxwhisker%20plot.html).
 
 allows SVG exporting.
 - Export to SVG text labels from left, right, top and bottom around Plot (include axis titles and title of plot).
 - Export heatmap to SVG.
 - Knockout bindings for the heatmap plot when using `idd_knockout.js`. See `samples/Dynamic Gradient Heatmap with Knockout.html`.
 - Knockout bindings for label plot.

## 1.4.1 (August 8, 2016)

New features:
 - Export to SVG: chart, area, markers, polyline with uncertainty can be exported to SVG; legend also can be exported to SVG except uncertain marker shapes.
 - New marker shape `"bars"`.
 - Navigation panel is updated, it allows to download the plot as SVG file (uses FileSaver.js).   

### 1.4.0 (July 21, 2016)

**Breaking changes**: 
 - **Removed separate chartViewer.js (.css, .d.ts)**. Idd.js now includes chartViewer.js (same for umd version). 
 Changed namespace `ChartViewer` to `InteractiveDataDisplay`.
 - ChartViewer's `"band"` plot is now `"area"` as it is in idd. Corresponding changes are in names: `AreaDefinition`, `Plot.area()`.

New features:
 - IDD release includes idd.ko.js which is a superset for idd.js with basic support for Knockout. See coming examples in the [Wiki](https://github.com/predictionmachines/InteractiveDataDisplay/wiki).
 - Support of knockout bindings register for arbitrary plots.
 - The `sizePalette` property of markers definition now can be either object `InteractiveDataDisplay.SizePalette` (as before) or 
 an object of following structure: `{ sizeRange: {min:Number, max:Number}, valueRange?: {min:Number, max:Number}}`.
 
Fixes:
  - Previously markers failed if `colorPalette` was a string defining an absolute palette.
  - Box-and-whisker markers failed if `y.median` or `x` had `NaN`.

 
Changes:
 - Box-and-whisker markers are now represented by a single shape `"boxwhisker"` and the actual marker type (either box-and-whisker, box or just whisker) depends on the drawn data. See the [samples](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/test/manual/Boxwhisker%20plot.html).
 
### 1.3.0 (May 27, 2016)

New features:
 - Export to SVG: figure, numeric axis and polyline can be exported to SVG. Uses SVG.js. See method `Plot.exportToSvg()` and the sample [Vector export](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/samples/Vector%20export.html#L22).
 - Nice real numbers formatting in tooltips, probes and legend.
 - Tooltips and probes share same content. The content is refactored for the markers and heatmaps.

Fixes:
 - Legend doesn't stop propagation of mouse and touch events by default so it can be made draggable if needed. 
  
**Breaking changes in API**:
 - Polyline plot: 
   - `y` can be uncertain, the plot renders bands for the quantiles (see `samples/Uncertain polyline.html`); 
   - function or trajectory mode determines whether input points will be ordered or not.
 - Heatmap plot:
   - Argument of `draw` now contains property `values` instead of `f`. Values may be uncertain.
   - Introduces new property of `draw` data, `interval` which allows to highlight region containing uncertain data interseting with the interval.
 

### 1.2.1 (April 26, 2016)

 - Updated UI:
   - ChartViewer legend is now on the right and is hidden by default
   - Navigation panel is updated, in particular, it allows showing and hiding the legend
   - Increased axes titles font size and added margin for the vertical axis title
 - Fixes bug which prevented reordering of plots having same name

### 1.2.0  (April 19, 2016) 

 - Marker plot is significantly refactored.
    - The shape API has changed so that it allows much more flexibility in creating new shapes. 
    **The previously created shapes may not work with the new marker plot.**
    - Shapes are completely moved away from the markers plot itself.
    - The shape lookup & registration algorithm changed. 
    **Existing code using markers with custom shapes may not work with new marker plot.**
    - Plot life cycle optimized so that rendering performance has increased.
    - Documentation added (`docs/markers.md`)
 - Introduces Navigation Panel (type `InteractiveDataDisplay.NavigationPanel`), see sample [`NavigationPanel.html`](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/samples/Navigation%20Panel.html)
 - IDD Legend is re-designed; it can appear as compact or large. Large legend allows to reorder plots. Any legend allows to show/hide individual plots.
 - Default markers shapes include uncertain data visualization, incl. [petals](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/samples/Markers%20with%20size%20uncertain%20data.html), [bull-eyes](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/samples/Markers%20with%20color%20uncertain%20data.html) and box plots. See details [here](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/src/idd/idd.markers.uncertain.js).
 - New sample with animated transition between drawn data (`Animated markers update.html`)
  

### 1.1.4 (February 17, 2016)
### 1.1.3 (February 16, 2016)

Bug fix:
  - The plot definition's data series is allowed to be both an array and a native array.

### 1.1.2 (February 15, 2016)

  - ChartViewer contains two *.d.ts files - one when used through Globals, another when using as UMD.
  - ChartViewer allows to reorder plots using drag-and-drop.
  - ChartViewer accurately handles incorrect plot definitions.


### 1.1.0 (January 28, 2016)

Features:
  
  - Introducing ChartViewer - a TypeScript UI control to define, show and explore interactive charts. 

### 1.0.5 (January 21, 2016)

Features:

  - IDD plots observe changes of the DOM and add/remove child plots when DOM elements are added or removed.
  - InteractiveDataDisplay.updateLayouts function for responsive layouts support.

### 1.0.4 (January 13, 2016)

Features:

  - Introducing new Area plot type.
  
Changes:

  - Bower installs idd.js, not minified version. 

### 1.0.3 (November 25, 2015)

Features:

  - IDD supports titles of individual data series

Bugfixes:

  - Legend changes when plot name is changed.
  - Adding dependencies to the package manifest file

### 1.0.2 (October 14, 2015)

Bugfixes:

  - Removing unnecessary reference to rx.jquery module
  - Fixing case for scripts folder in sample page

### 1.0.1 (September 23, 2015)

Features:

  - Heatmap background renderer code is embedded into main script removing need for idd.heatmapworker.js and idd.transforms.js.

### 1.0.0 

Initial source drop.
