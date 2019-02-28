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
InteractiveDataDisplay.SubPlots = function (subplotsDiv) {
	if(!subplotsDiv)
		throw "SubPlots must be applied to <div> element"
	if(subplotsDiv.children.length !== 1 && subplotsDiv.children.length !== 2)
		throw "SubPlots div must contain one or two child elements: optional element div (subplots title) and mandatory element table"
	var div = $(subplotsDiv).children().last()[0]
	if(!div)
		throw "SubPlots div should contain at least one <div> element"
	if(div.children.length !== 1)
		throw "SubPlots child div must contain exactly one child element which is a <table>"
	var table = div.children[0]
	if(!table || table.nodeName!='TABLE')
		throw "SubPlots child div must contain exactly one child element which is a <table>"
	var _div = div
	var _table = table

	var _subplotsDiv = subplotsDiv;
	$(_subplotsDiv).css("display", "flex")
	$(_subplotsDiv).css("flex-direction", "column")
	$(_div).addClass("idd-subplots-legendholder")
	if(subplotsDiv.children.length === 2){
		var _titleDiv = $(subplotsDiv).children()[0]
		$(_titleDiv).addClass("idd-subplots-title")
	}

	var _Ncol = 0
	var _Nrow = 0
	var _masterPlots = [] //Nrow/3 x Ncol/3 jagged array of plots
	var _trapPlots = [] // Nrow/3 x Ncol/3 jagged array of SubplotsTrapPlot plots (see task #6 below)

	// these two arrays modified simultaniously, have same length
	var _axes = [] // this one holds the axis objects
	var _isAxisVertical = [] // the same length as array above
	var _axisLocationIndices = [] // this one holds indices (array of two numbers) of cell, containing the axis
	var _horizontalAxes = [] // Nrow/3 x Ncol/3 jagged array of axes. these are back indices: grid cell -> associated horizontal axis
	var _verticalAxes =[] // Nrow/3 x Ncol/3 jagged array of axes. these are back indices: grid cell -> associated vertical axis

	// In case of plot bindings, the axes which are used as tick source for the grid lines
	var verticalMasterAxis = undefined
	var horizontalMasterAxis = undefined	

	var _extLegendPlacement = undefined
	var _extLegendRowIdx = undefined
	var _extLegendColIdx = undefined
	var _extLegend = undefined

	var _syncVisualRectH = $(_div).attr('data-idd-horizontal-binding')
	var _syncVisualRectV = $(_div).attr('data-idd-vertical-binding')
	if (typeof _syncVisualRectH !== typeof undefined && (_syncVisualRectH === "true" || _syncVisualRectH === "enabled"))
		_syncVisualRectH = true
	else
		_syncVisualRectH = false
	if (typeof _syncVisualRectV !== typeof undefined && (_syncVisualRectV === "true" || _syncVisualRectV === "enabled"))
		_syncVisualRectV = true
	else
		_syncVisualRectV = false
	
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
		var jqTr = $("tr",_table)
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
					console.warn("subplots: work with multiple axes in a single slot is not implemented")
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
						if(jqIdd.length>0) {
							// the slot contains plot (not the blank slot)
							// task #2						
							var pColIdx = Math.floor(cIndex/3)
							var master = InteractiveDataDisplay.asPlot(jqIdd)					
							_masterPlots[pRowIdx][pColIdx] = master
							master.subplotRowIdx = pRowIdx
							master.subplotColIdx = pColIdx
							_trapPlots[pRowIdx][pColIdx] = InteractiveDataDisplay.asPlot($("div[data-idd-plot='subplots-trap']",td))

							// controlling legend visibility
							var style = {};							
							InteractiveDataDisplay.Utils.readStyle(jqIdd, style);
							if (style) {
								var isLegendVisible = typeof style.isLegendVisible != "undefined" ? style.isLegendVisible : "true";
								if(isLegendVisible === "true") {
									var legendDiv = $("<div style='z-index: 10;'></div>").appendTo(jqIdd);
									var _legend = new InteractiveDataDisplay.Legend(master, legendDiv, true, true, true);
									legendDiv.css("float", "right");									

									//Stop event propagation
									InteractiveDataDisplay.Gestures.FullEventList.forEach(function (eventName) {
										legendDiv[0].addEventListener(eventName, function (e) {
											e.stopPropagation();
										}, false);
									});
								}
							}

						}
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
	   		
		var _dataIddStyle = {}
		_dataIddStyle = InteractiveDataDisplay.Utils.readStyle($(_div), _dataIddStyle)
		var subplotsMargin = undefined
		if(_dataIddStyle && _dataIddStyle["subplots-margin"]){
			subplotsMargin = _dataIddStyle["subplots-margin"]
			$(_div).find("td div.idd-subplots-margin-left").css("padding-left", subplotsMargin)
			$(_div).find("tr").find("td div.idd-subplots-margin-left:first").css("padding-left", "")
			$(_div).find("td div.idd-subplots-margin-bottom").css("padding-bottom", subplotsMargin)
			$(_div).find("tr").last().find("td div.idd-subplots-margin-bottom").css("padding-bottom", "")
		}
		else{
			subplotsMargin = $(_div).find("td div.idd-axis").parent().css("padding-left")
		}

		// by this point the tasks #1 and #2 (initializations) are done
		
		var extLegendAttr = _div.getAttribute("data-idd-ext-legend")
		if(extLegendAttr) {
			var splitted = extLegendAttr.split(" ")
			if(splitted.length !== 3)
				throw "data-idd-ext-legend attribute bust contain string in format 'placement plotRowIdx plotColIdx'"
			var placement = splitted[0]
			_extLegendRowIdx = parseInt(splitted[1])
			_extLegendColIdx = parseInt(splitted[2])

			var legendSource = _masterPlots[_extLegendRowIdx][_extLegendColIdx]
			var legendDiv = $("<div></div>")
			switch(placement.trim().toLowerCase()) {
				case "left":
				case "top":
					legendDiv.prependTo(_div)
					break
				case "right":
				case "bottom":
					legendDiv.appendTo(_div)
					break
				default:
					throw "Unexpected external legend placement"
			}
			switch(placement.trim().toLowerCase()) {
				case "left":
					$(_div).css("flex-direction", "row")
					if(subplotsMargin)
						legendDiv.css("margin-right", subplotsMargin)
					break
				case "right":
					$(_div).css("flex-direction", "row")
					if(subplotsMargin)
						legendDiv.css("margin-left", subplotsMargin)
					break
				case "top":
					$(_div).css("flex-direction", "column")
					if(subplotsMargin)
						legendDiv.css("margin-bottom", subplotsMargin)
					break
				case "bottom":
					$(_div).css("flex-direction", "column")
					if(subplotsMargin)
						legendDiv.css("margin-top", subplotsMargin)
					break
				default:
					throw "Unexpected external legend placement"
			}
			_extLegend = new InteractiveDataDisplay.Legend(legendSource, legendDiv, false, undefined, true);
		}


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
		$("div[data-idd-plot='grid']",_table).each(function(idx){
			var host = this
			var grid = host.plot
			var master = grid.master
			var subplotRowIdx = master.subplotRowIdx
			var subplotColIdx = master.subplotColIdx
			var horAxis = _horizontalAxes[subplotRowIdx][subplotColIdx]
			if(horAxis)
				grid.xAxis = horAxis
			else if(_syncVisualRectH){

				function findHorizontalAxisIndexInColumn(horizontalAxesArr, columnIndex){
					for (var rowN = 0; rowN < horizontalAxesArr.length; rowN++){
						if(horizontalAxesArr[rowN] && horizontalAxesArr[rowN][columnIndex])
							return rowN;
					}
						return -1;
				}
		
				var horizontalAxisRow = findHorizontalAxisIndexInColumn(_horizontalAxes, subplotColIdx)

				if(horizontalAxisRow !== -1)
					grid.xAxis = _horizontalAxes[horizontalAxisRow][subplotColIdx]
			}

			var vertAxis = _verticalAxes[subplotRowIdx][subplotColIdx]
			if(vertAxis)
				grid.yAxis = vertAxis
			else if(_syncVisualRectV){
				function findVerticalAxisIndexInRow(row) {
					for (var i = 0; i < row.length; i++) {
						if(row[i])
							return i;
					}
					return -1;
				}
		
				var verticalAxisColumn = findVerticalAxisIndexInRow(_verticalAxes[subplotRowIdx])
				if(verticalAxisColumn !== -1)
					grid.yAxis = _verticalAxes[subplotRowIdx][verticalAxisColumn]
			}
		
		})
		
		// Task #5: activate navigation
		// we traverse master plots
		for(var i = 0; i < _masterPlots.length; i++) {
			var row = _masterPlots[i]
			for(var j = 0; j < row.length; j++) {
				var plot = row[j]
				if(plot) { // only for non-blank slots
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
				
				if(!_syncVisualRectH){
					var horAxis = _horizontalAxes[subplotRowIdx][subplotColIdx]
					if(horAxis)
						horAxis.update(xRange)
				}
				if(!_syncVisualRectV){
					var vertAxis = _verticalAxes[subplotRowIdx][subplotColIdx]
					if(vertAxis)
					vertAxis.update(yRange)
				}

				for(var i = 0; i < _axes.length; i++) {
					var axis = _axes[i]
					if(_isAxisVertical[i] && _syncVisualRectV)
						axis.update(yRange)
					else if(!_isAxisVertical[i] && _syncVisualRectH)
						axis.update(xRange)
				}


				// 2) updating bound plots
				// traversing all of the grid master plots. Calling set visible to everyone except for originator
				
				if(_syncVisualRectH || _syncVisualRectV){
					for(var i = 0; i < _masterPlots.length; i++) {
						var row = _masterPlots[i]
						for(var j = 0; j < row.length; j++) {
							var plot = row[j]
							if(plot === this.master)
								continue // skipping the originator
							
							var visRec = plot.visibleRect

							if(_syncVisualRectH){
								visRec.x = vr.x_min
								visRec.width = vr.x_max - vr.x_min
							}
							if(_syncVisualRectV){
								visRec.y = vr.y_min
								visRec.height = vr.y_max - vr.y_min
							}

							plot.navigation.setVisibleRect(visRec, false, { suppressNotifyBoundPlots: true, forceOnlyUpdatePlotsOutput:true, syncUpdate:true });								
						}
					}
				}

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

		var visibleChangedHandler = function (event, params) {
			for(var i = 0; i < _masterPlots.length; i++) {
				for(var j = 0; j < _masterPlots[i].length; j++) {
					var plotsSeq = _masterPlots[i][j].getPlotsSequence();
					for(var k = 0; k < plotsSeq.length; k++) {
						if(params.name.length > 0 && plotsSeq[k].name === params.name)
							if(plotsSeq[k].isVisible !== params.isVisible)
							plotsSeq[k].isVisible = params.isVisible
					}
				}
			}
		}

		var _commonVisibilityEnabled = $(_div).attr("data-idd-common-visibility")
		if(_commonVisibilityEnabled && (_commonVisibilityEnabled === "true" || _commonVisibilityEnabled === "enabled")){
			for(var i = 0; i < _masterPlots.length; i++) {
				for(var j = 0; j < _masterPlots[i].length; j++) {
					if(_masterPlots[i][j])
						_masterPlots[i][j].host.bind("visibleChanged", visibleChangedHandler);
				}
			}
		}

		_subplotsDiv.subplots = that;
	}	

	this.renderSVG = function() {
		var searchForPlot = "div[data-idd-plot='plot']"; // subplots
		var searchForAxis = "div[data-idd-axis]"; // axes
		var searchForPlotTitle = "div.idd-subplot-title"; // titles of each subplots
		var searchForHAxisTitle = "div.idd-horizontalTitle"; // horizontal axis names
		var searchForVAxisTitle = "div.idd-verticalTitle"; // vertical axis names
		var searchForLegend = "div.idd-legend" // legend which is used in subplots
		var searchSubplotsTitle = "div.idd-subplots-title" // title of subplots as a group
		var elemsToSVG = $(_subplotsDiv).find(searchForPlot+', '+searchForAxis+', '+searchForPlotTitle+', '+searchForHAxisTitle+', '+searchForVAxisTitle+', '+searchForLegend+', '+searchSubplotsTitle)

		var svgs = []
		var svgHost = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		var svg = SVG(svgHost).size($(_subplotsDiv).width(), $(_subplotsDiv).height())
		var svgSubPlotsGroup = svg.nested()
		var leftOffsets = []
		var topOffsets = []
		var subplotsOffset = $(_subplotsDiv).offset()
		for (var i = 0; i < elemsToSVG.length; i++) {
			// offsets are calculated for all of the elements
			leftOffsets[i] = $(elemsToSVG[i]).offset().left - subplotsOffset.left
			topOffsets[i] = $(elemsToSVG[i]).offset().top - subplotsOffset.top + 1 // dont know why the 1 offset is needed, without it 1px border at the edge is not visible
			
			var plotOrAxis = $(elemsToSVG[i]); // plotOrAxis or legend actually...
			// text containing divs are handled specially
			if(plotOrAxis.is(searchForPlotTitle+', '+searchForHAxisTitle+', '+searchForVAxisTitle+', '+searchSubplotsTitle)){
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
					leftOffsets[i] += parseFloat($(elemsToSVG[i]).css('border-left-width').replace("px","")); 
					topOffsets[i] += parseFloat($(elemsToSVG[i]).css('border-top-width').replace("px",""));
				}
				else if(plotOrAxis.is(searchForAxis)){
					// axis
					svgs[i] = plotOrAxis[0].axis.exportToSvg();
				}
				else if(plotOrAxis.is(searchForLegend)) {
					svgs[i] = _masterPlots[_extLegendRowIdx][_extLegendColIdx].exportLegendToSvg(plotOrAxis[0])
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
	
	initializeSubPlots()
}

InteractiveDataDisplay.asSubPlots = function (div) {	
	if (div && div.subplots !== undefined)
		return div.subplots;
	else {
		return new InteractiveDataDisplay.SubPlots(div);
	}

}