InteractiveDataDisplay = InteractiveDataDisplay || {}



InteractiveDataDisplay.SubplotsTrapPlot = function (div, master) {
    this.base = InteractiveDataDisplay.Plot;
    this.base(div, master);
    if (!div) return;

	var that = this;
	
	this.renderCallback = function(visRegion) {}

	this.suppressRenderCallback =false

    this.renderCore = function (plotRect, screenSize) {		
		InteractiveDataDisplay.SubplotsTrapPlot.prototype.renderCore.call(this, plotRect, screenSize);
		if(this.suppressRenderCallback)
			return
		var plotToDataX = (this.xDataTransform && this.xDataTransform.plotToData) ? this.xDataTransform.plotToData : function(x) {return x}
		var plotToDataY = (this.yDataTransform && this.yDataTransform.plotToData) ? this.yDataTransform.plotToData : function(y) {return y}
		
		var x1 = plotToDataX(plotRect.x)
		var x2 = plotToDataX(plotRect.x + plotRect.width)
		var y1 = plotToDataY(plotRect.y)
		var y2 = plotToDataY(plotRect.y + plotRect.height)

		var visibleRegion = {
			x_min: (x1>x2 ? x2 : x1),
			x_max: (x1>x2 ? x1 : x2),
			y_min: (y1>y2 ? y2 : y1),
			y_max: (y1>y2 ? y1 : y2)
		}

		this.renderCallback(visibleRegion)
        return;
    };

    this.renderCoreSvg = function (plotRect, screenSize, svg) {
        return;        
    };        
};

InteractiveDataDisplay.factory['subplots-trap'] = function(jqDiv, master) { return new InteractiveDataDisplay.SubplotsTrapPlot(jqDiv, master) }


InteractiveDataDisplay.SubplotsTrapPlot.prototype = new InteractiveDataDisplay.Plot;

// subplots are grid like structure of plots (lets say N x M plots)
// The function must be applied as constructor to a <table> element of 3*N rows (<tr></tr>) and 3*M columns
// this is because each plot can have slots for axes and titles. This slots are implemented as separate grid cells
InteractiveDataDisplay.SubPlots = function (table) {

	if(!table || table.nodeName!='TABLE')
		throw "SubPlots must be applied to <table> element"
	var _host = table

	var _Ncol = 0
	var _Nrow = 0
	var _masterPlots = [] //Nrow/3 x Ncol/3 jagged array of plots
	var _trapPlots = []// Nrow/3 x Ncol/3 jagged array of SubplotsTrapPlot plots (see task #6 below)

	// these two arrays modified simultaniously, have same length
	var _axes = [] // this one holds the axis objects
	var _isAxisVertical = [] // the same length as array above
	var _axisLocationIndices = [] // this one holds indices (array of two numbers) of cell, containing the axis
	var _horizontalAxes = [] // Nrow/3 x Ncol/3 jagged array of axes. these are back indices: grid cell -> associated horizontal axis
	var _verticalAxes =[] // Nrow/3 x Ncol/3 jagged array of axes. these are back indices: grid cell -> associated vertical axis

	// In case of plot bindings, the axes which are used as tick source for the grid lines
	var verticalMasterAxis = undefined
	var horizontalMasterAxis = undefined	

	var that = this;

	var initializeSubPlots = function() {
		// traversing whole table structure.
		// initializing plots and axes in the slots
		//
		// there are following tasks to do:
		// 1. Initialize axes (e.g. InitializeAxis())
		// 2. Init plots (e.g. asPlot())
		// 3. bind plot transforms to axis (e.g. axis.DataTrasform = plot.xTransform)
		// 4. bind grid lines to axes (e.g. grid.xAxis = axis1)
		// 5. activate navigation
		// 6. activate rendering & binding
		var jqTr = $("tr",_host)
		_Nrow = jqTr.length
		_masterPlots = new Array(_Nrow/3)
		_trapPlots = new Array(_Nrow/3)
		_verticalAxes = new Array(_Nrow/3)
		_horizontalAxes = new Array(_Nrow/3)


		// common code is separated into this function
		// if "whereToLook" contains <div> which is axis, inits it and saved into "_axis" & "_axisLocationIndices" vars
		var initAxisIfExists = function(rIdx, cIdx, whereToLook) {
			var jqAxis = $("div[data-idd-axis]",whereToLook)
			var axisCount = jqAxis.length
			if(axisCount>0) {
				if(axisCount>1)
					console.warn("subplots: working with multiple axes in single slot is not implemented")
				else {
					var axis = InteractiveDataDisplay.InitializeAxis(jqAxis, {})
					_axes.push(axis)
					_axisLocationIndices.push([rIdx,cIdx])
					var isVertical = (rIdx % 3) === 1				
					_isAxisVertical.push(isVertical)
					var associatedPlotRow = Math.floor(rIdx/3)
					var associatedPlotCol = Math.floor(cIdx/3)
					axis.associatedPlotRow = associatedPlotRow
					axis.associatedPlotCol = associatedPlotCol
					if(isVertical) {
						_verticalAxes[associatedPlotRow][associatedPlotCol] = axis
					} else {
						_horizontalAxes[associatedPlotRow][associatedPlotCol] = axis
					}
				}
			}
		}

		jqTr.each(function(rIndex) {
			var jqTd = $("td",this)			
			if(_Ncol === 0)
				_NCol = jqTd.length
			else if(jqTd.length !== _NCol)
				throw "Different rows have non-equal number of columns"			
			if((rIndex-1) % 3 === 0) {
				// row containing plots	
				var pRowIdx = Math.floor(rIndex/3)
				_masterPlots[pRowIdx] = new Array(_NCol/3)
				_trapPlots[pRowIdx] = new Array(_NCol/3)
				_verticalAxes[pRowIdx] = new Array(_NCol/3)
				_horizontalAxes[pRowIdx] = new Array(_NCol/3)
				jqTd.each(function(cIndex) {
					var td = this
					if((cIndex-1) % 3 == 0) { // col containing plots
						var jqIdd = $("div[data-idd-plot='plot']",td)
						// task #2						
						var pColIdx = Math.floor(cIndex/3)
						var master = InteractiveDataDisplay.asPlot(jqIdd)					
						_masterPlots[pRowIdx][pColIdx] = master
						master.subplotRowIdx = pRowIdx
						master.subplotColIdx = pColIdx
						_trapPlots[pRowIdx][pColIdx] = InteractiveDataDisplay.asPlot($("div[data-idd-plot='subplots-trap']",td))
					} else { // col containing left/right slots
						// task #1
						initAxisIfExists(rIndex,cIndex,td)
					}
				})
			} else {
				// row contains top/bottom slots
				// task #1
				jqTd.each(function(cIndex) {
					var td = this				
					initAxisIfExists(rIndex,cIndex,td)
				})
			}			
	   	})
	   
	    // by this point the tasks #1 and #2 (initializations) are done
		// proceeding to bindings (tasks #3 and #4)

		// Task #3: binding plots transform to axes
	    for(var i=0; i < _axes.length; i++) {
			var axis = _axes[i]
			var cellRow = _axisLocationIndices[i][0]
			var cellCol = _axisLocationIndices[i][1]
			var plotRow = Math.floor(cellRow/3)
			var plotCol = Math.floor(cellCol/3)
			var plot = _masterPlots[plotRow][plotCol]
			if(cellRow % 3 === 1) { // row with plots => left/right slot => yTransform is needed				
				axis.dataTransform = plot.yDataTransform
				//TODO: hand vertical axis bindings here
			}
			else {// row without plots => bottom/top slots => xTransform is needed
				axis.dataTransform = plot.xDataTransform
				//TODO: hand horizontal axis bindings here
			}
	    }

	    // Task #4: binding grid lines to axis ticks
	    //
		// this is tricky, as the plot may not contain axis in its slots
		// Also the axes can be bound	    
	    $("div[data-idd-plot='grid']",_host).each(function(idx){			
			var host = this
			var grid = host.plot
			var master = grid.master
			var subplotRowIdx = master.subplotRowIdx
			var subplotColIdx = master.subplotColIdx
			var horAxis = _horizontalAxes[subplotRowIdx][subplotColIdx]
			if(horAxis)
				grid.xAxis = horAxis
			var vertAxis = _verticalAxes[subplotRowIdx][subplotColIdx]
			if(vertAxis)
				grid.yAxis = vertAxis
	    })
		
		// Task #5: activate navigation
		// we traverse master plots
		for(var i = 0; i < _masterPlots.length; i++) {
			var row = _masterPlots[i]
			for(var j = 0; j < row.length; j++) {
				var plot = row[j]
				var naviEnabled = $(plot.host).attr("data-idd-navigation-enabled")
				if(naviEnabled && naviEnabled==='true') {
					
					var jqPlot = $(plot.host)
					jqPlot.dblclick(function () {
						this.plot.master.fitToView();
					});	

					var rowIdx = plot.master.subplotRowIdx
					var colIdx = plot.master.subplotColIdx

					// attaching gesture sources & handling double clicks
					var gestureSource = InteractiveDataDisplay.Gestures.getGesturesStream(jqPlot)
					var horAxis = _horizontalAxes[rowIdx][colIdx]
					if(horAxis) {
						var jqAxisHost = horAxis.host
						var bottomAxisGestures = InteractiveDataDisplay.Gestures.applyHorizontalBehavior(InteractiveDataDisplay.Gestures.getGesturesStream(jqAxisHost));
						gestureSource = gestureSource.merge(bottomAxisGestures)

						jqAxisHost.dblclick(function() {
							var axis = this.axis
							_masterPlots[axis.associatedPlotRow][axis.associatedPlotCol].fitToViewX();
						});
					}
					var vertAxis = _verticalAxes[rowIdx][colIdx]
					if(vertAxis) {
						var jqAxisHost = vertAxis.host
						var leftAxisGestures = InteractiveDataDisplay.Gestures.applyVerticalBehavior(InteractiveDataDisplay.Gestures.getGesturesStream(jqAxisHost));
						gestureSource = gestureSource.merge(leftAxisGestures)
						jqAxisHost.dblclick(function () {
							var axis = this.axis
							_masterPlots[axis.associatedPlotRow][axis.associatedPlotCol].fitToViewY();
						});
					}					
					plot.navigation.gestureSource = gestureSource

					
					
				}
			}
		}

		// Task #6: activate rendering & binding
		// rendering is very tricky!
		// During the plot rendering the axes must be updated first, then all of the dependent plots (incl grid lines which use the coords from axis)
		// to intercept plot rendering before the grid lines for axis update I use specially crafted plot type "SubplotsTrapPlot"
		// it exposes the renderCallback to be set externally
		// we traverse trap plots and set renderCallback for them

		var isRendering = false

		var renderCallback = function(vr) {
			// the master plot draws something
			// this could be during data update. ignoring it for now (TODO: handle it)
			// or due to navigation of master or due to binding update
			
			// to separate original navigation from binding "echos" I use isRendering flag
			if(!isRendering) {
				// this is user navigation
				isRendering = true // supressing echo updates for bound master plots

				yRange = { min: vr.y_min, max: vr.y_max}
				xRange = { min: vr.x_min, max: vr.x_max}

				// we need to update all of the bound axes & update visual rects of the bound plots				
				
				// 1) updating bound axes
				
				var master = this.master
				var subplotRowIdx = master.subplotRowIdx
				var subplotColIdx = master.subplotColIdx
				
				var horAxis = _horizontalAxes[subplotRowIdx][subplotColIdx]
				if(horAxis)
					horAxis.update(xRange)
				var vertAxis = _verticalAxes[subplotRowIdx][subplotColIdx]
				if(vertAxis)
				vertAxis.update(yRange)

				// for(var i = 0; i < _axes.length; i++) {
				// 	var axis = _axes[i]
				// 	if(_isAxisVertical[i])
				// 		axis.update(yRange)
				// 	else
				// 		axis.update(xRange)
				// }

				// 2) updating bound plots
				// traversing all of the grid master plots. Calling set visible to everyone except for originator
				var visRec = {
					x: vr.x_min,
					y: vr.y_min,
					width: vr.x_max - vr.x_min,
					height: vr.y_max - vr.y_min
				}
				// for(var i = 0; i < _masterPlots.length; i++) {
				// 	var row = _masterPlots[i]
				// 	for(var j = 0; j < row.length; j++) {
				// 		var plot = row[j]
				// 		if(plot === this.master)
				// 			continue // skipping the originator
				// 		plot.navigation.setVisibleRect(visRec, false, { suppressNotifyBoundPlots: true, forceOnlyUpdatePlotsOutput:true, syncUpdate:true });								
				// 	}
				// }					

				isRendering = false
			} else {
				// this is binding triggered update
			}						
		}		

		for(var i = 0; i < _trapPlots.length; i++) {
			var row = _trapPlots[i]
			for(var j = 0; j < row.length; j++) {
				var trapPlot = row[j]
				if(trapPlot) {
					trapPlot.renderCallback = renderCallback
				}
			}
		}

		_host.subplots = that;
	}	

	this.renderSVG = function() {
		var searchForPlot = "div[data-idd-plot='plot']"; // subplots
		var searchForAxis = "div[data-idd-axis]"; // axes
		var searchForPlotTitle = "div.idd-subplot-title"; // titles of subplots
		var searchForHAxisTitle = "div.idd-horizontalTitle"; // horizontal axis names
		var searchForVAxisTitle = "div.idd-verticalTitle"; // vertical axis names
		var elemsToSVG = $(_host).find(searchForPlot+', '+searchForAxis+', '+searchForPlotTitle+', '+searchForHAxisTitle+', '+searchForVAxisTitle);

		var svgs = [];
		var svgHost = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var svg = SVG(svgHost).size($(_host).width(), $(_host).height());
		var svgSubPlotsGroup = svg.nested();
		var leftOffsets = [];
		var topOffsets = [];
		for (var i = 0; i < elemsToSVG.length; i++) {

			leftOffsets[i] = $(elemsToSVG[i]).offset().left;
			topOffsets[i] = $(elemsToSVG[i]).offset().top;
			
			var plotOrAxis = $(elemsToSVG[i]);
			if(plotOrAxis.is(searchForPlotTitle+', '+searchForHAxisTitle+', '+searchForVAxisTitle)){
				// subplot title
				var text = svg.text(elemsToSVG[i].innerText);
				svgs[i] = text.font({
					family:	$(elemsToSVG[i]).css("font-family")
				  , size:	$(elemsToSVG[i]).css("font-size")
				  , weight:	$(elemsToSVG[i]).css("font-weight")
				  })

				
				if(plotOrAxis.is(searchForVAxisTitle)){
					// vertical axis title
					switch ($(elemsToSVG[i]).css("vertical-align")) {
						case "top":
							svgs[i].move(leftOffsets[i], topOffsets[i]);
							break;
						case "bottom":
							svgs[i].move(leftOffsets[i], topOffsets[i] + $(elemsToSVG[i]).height() - svgs[i].bbox().w);
							svgs[i].rotate(-90, leftOffsets[i], topOffsets[i] + $(elemsToSVG[i]).height() - svgs[i].bbox().w);
							break;
						default:
							svgs[i].move(leftOffsets[i], topOffsets[i] + $(elemsToSVG[i]).height()/2 + svgs[i].bbox().w/2);
							svgs[i].rotate(-90, leftOffsets[i], topOffsets[i] + $(elemsToSVG[i]).height()/2 + svgs[i].bbox().w/2);
					}
				}
				else{
					// horizontal axis title
					switch ($(elemsToSVG[i]).css("text-align")) {
						case "left":
							svgs[i].move(leftOffsets[i], topOffsets[i]);
							break;
						case "right":
							svgs[i].move(leftOffsets[i] + $(elemsToSVG[i]).width() - svgs[i].bbox().w, topOffsets[i]);
							break;
						default:
							svgs[i].move(leftOffsets[i] + $(elemsToSVG[i]).width()/2 - svgs[i].bbox().w/2, topOffsets[i]);
					}
				}

			}
			else{
				if(plotOrAxis.is(searchForPlot)){
					// plot border
					var wth = $(elemsToSVG[i]).parent().width();
					var ht = $(elemsToSVG[i]).parent().height();
					var plotBox = svg.polyline('0,0 '+wth+',0 '+wth+','+ht+' 0,'+ht+' 0,0').fill('none');
					plotBox.stroke({ color: '#808080', width: 1 }).move(leftOffsets[i], topOffsets[i]);
					plotBox.attr('shape-rendering', 'crispEdges');
					svgSubPlotsGroup.add(plotBox);

					// subplot
					var plot = InteractiveDataDisplay.asPlot(plotOrAxis);
					svgs[i] = plot.exportToSvg();
					leftOffsets[i] += parseFloat($(elemsToSVG[i]).css('border-width').replace("px","")); 
					topOffsets[i] += parseFloat($(elemsToSVG[i]).css('border-width').replace("px",""));
				}
				else if(plotOrAxis.is(searchForAxis)){
					// axis
					svgs[i] = plotOrAxis[0].axis.exportToSvg();
				}
				else{
					throw "Unexpected element type. SVG export failure";
				}
				svgs[i].move(leftOffsets[i], topOffsets[i]);
			}

			// adding new svg element to the svg group
			svgSubPlotsGroup.add(svgs[i]);
		}

		return svg;
	}

	if (table.subplots !== undefined)
		return table.subplots;
	else {
		var subplots = initializeSubPlots();
		return subplots;
	}
}

InteractiveDataDisplay.asSubPlots = function (table) {
	if(!table || table.nodeName!='TABLE')
		throw "SubPlots must be applied to <table> element"

	if (table.subplots !== undefined)
		return table.subplots;
	else {
		return new InteractiveDataDisplay.SubPlots(table);
	}

}