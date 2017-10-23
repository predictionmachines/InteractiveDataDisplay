### 1.5.2 (not released)
New features:
 - Chart legend becomes opaque on mouse hover and transparent otherwise. 
 - Legend in Chart Viewer has tooltip if the name is too long.
 - Area plot has tooltip.
 - Legend has the red sign if plot can not be displayed.
 - New property `opacity` and new binding `iddOpacity` to set area opacity.

Bug fixes: 
 - First pulled probe is now visible while putting on the chart. 
 - The function `fitToView()` now doesn't consider not visible plots for fitting to view.
 - Scrolling now works correctly after log scale transform. 
 - Probe information for polyline dissapears after zoom/scale/datatransform changes.

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
 - Fixed bug in mouse wheel behaviour.
 
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
