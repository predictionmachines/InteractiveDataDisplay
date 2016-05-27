##### 1.3.0 (unreleased)

New features:
 - Export to SVG: figure, numeric axis and polyline can be exported to SVG. Uses SVG.js. See method `Plot.exportToSvg()` and the sample [Vector export](https://github.com/predictionmachines/InteractiveDataDisplay/blob/master/samples/Vector%20export.html#L22).
 - Nice real numbers formatting in tooltips, probes and legend.
 - Tooltips and probes share same content. The content is refactored for the markers and heatmaps.

Fixes:
 - Legend doesn't stop propagation of mouse and touch events by default so it can be made draggable if needed. 
  
**Breaking changes in API**:
 - Polyline plot: 
   - `y` can be uncertain; 
   - function or trajectory mode determines whether input points will be ordered or not.
 - Heatmap plot:
   - Argument of `draw` now contains property `values` instead of `f`. Values may be uncertain.
   - Introduces new property of `draw` data, `interval` which allows to highlight region containing uncertain data interseting with the interval.
 

## 1.2.1 (April 26, 2016)

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
