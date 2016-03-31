## 1.2.0git  (unpublished) 

 - Marker plot is significantly refactored.
    - The shape API has changed so that it allows much more flexibility in creating new shapes. 
    **The previously created shapes may not work with the new marker plot.**
    - Shapes are completely moved away from the markers plot itself.
    - The shape lookup & registration algorithm changed. 
    **Existing code using markers with custom shapes may not work with new marker plot.**
    - Plot life cycle optimized so that rendering performance has increased.
    - Documentation added (`docs/markers.md`)
 - New sample with animated transition between drawn data (`Animated markers update.html`)
  

## 1.1.4 (February 17, 2016)
## 1.1.3 (February 16, 2016)

Bug fix:
  - The plot definition's data series is allowed to be both an array and a native array.

## 1.1.2 (February 15, 2016)

  - ChartViewer contains two *.d.ts files - one when used through Globals, another when using as UMD.
  - ChartViewer allows to reorder plots using drag-and-drop.
  - ChartViewer accurately handles incorrect plot definitions.


## 1.1.0 (January 28, 2016)

Features:
  
  - Introducing ChartViewer - a TypeScript UI control to define, show and explore interactive charts. 

## 1.0.5 (January 21, 2016)

Features:

  - IDD plots observe changes of the DOM and add/remove child plots when DOM elements are added or removed.
  - InteractiveDataDisplay.updateLayouts function for responsive layouts support.

## 1.0.4 (January 13, 2016)

Features:

  - Introducing new Area plot type.
  
Changes:

  - Bower installs idd.js, not minified version. 

## 1.0.3 (November 25, 2015)

Features:

  - IDD supports titles of individual data series

Bugfixes:

  - Legend changes when plot name is changed.
  - Adding dependencies to the package manifest file

## 1.0.2 (October 14, 2015)

Bugfixes:

  - Removing unnecessary reference to rx.jquery module
  - Fixing case for scripts folder in sample page

## 1.0.1 (September 23, 2015)

Features:

  - Heatmap background renderer code is embedded into main script removing need for idd.heatmapworker.js and idd.transforms.js.

## 1.0.0 

Initial source drop.
