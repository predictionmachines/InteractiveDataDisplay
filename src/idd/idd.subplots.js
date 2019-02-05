InteractiveDataDisplay = InteractiveDataDisplay || {}

// Enum
InteractiveDataDisplay.SubPlotsBindingMode = {
	NotBound: 0,
	SelectedColumnsRowsBound: 1,
	EverythingBound: 2
}


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

	// for now the only mode supported
	var _mode = InteractiveDataDisplay.SubPlotsBindingMode.EverythingBound

	var _Ncol = 0
	var _Nrow = 0
	var _masterPlots = [] //Nrow/3 x Ncol/3 jagged array of plots
	var _trapPlots = []// Nrow/3 x Ncol/3 jagged array of SubplotsTrapPlot plots (see task #6 below)

	// these two arrays modified simultaniously, have same length
	var _axes = [] // this one holds the axis objects
	var _isAxisVertical = [] // the same length as array above
	var _axisLocationIndices = [] // this one holds indices (array of two numbers) of cell, containing the axis

	// in SelectedColumnsRowsBound and EverythingBound modes, each row of plots can have master axis.
	// The one which is used as a tick provider for a grid lines
	// In fact any of the axes in synced row can be master axis
	// If there is no any vertical axis for the synced row, there is no master, thus grid lines are not bound
	var _rowMasterAxis = []
	var _colMasterAxis = []

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
		// 5. activate naviation
		// 6. activate rendering & binding
		var jqTr = $("tr",_host)
		_Nrow = jqTr.length
		_masterPlots = new Array(_Nrow/3)
		_trapPlots = new Array(_Nrow/3)


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
					_isAxisVertical.push((rIdx % 3) === 1)			
					_axisLocationIndices.push([rIdx,cIdx])
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
				jqTd.each(function(cIndex) {
					var td = this
					if((cIndex-1) % 3 == 0) { // col containing plots
						var jqIdd = $("div[data-idd-plot='plot']",td)
						// task #2						
						var pColIdx = Math.floor(cIndex/3)					
						_masterPlots[pRowIdx][pColIdx] = InteractiveDataDisplay.asPlot(jqIdd)
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
		// proceding to bindings (tasks #3 and #4)

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
				switch(_mode) {
					case InteractiveDataDisplay.SubPlotsBindingMode.EverythingBound:
						// in this mode any vertical axis is master axis for whole the grid and we found it!
						if(_colMasterAxis.length === 0)
							_colMasterAxis.push(axis)
					break;
					default:
						throw "not implemented yet"
				}
			}
			else {// row without plots => bottom/top slots => xTransform is needed
				axis.dataTransform = plot.xDataTransform
				switch(_mode) {
					case InteractiveDataDisplay.SubPlotsBindingMode.EverythingBound:
						// in this mode any horizontal axis is master axis for thw whole grid and we found it!
						if(_rowMasterAxis.length === 0)
							_rowMasterAxis.push(axis)
					break;
					default:
						throw "not implemented yet"
				}
			}
	    }

	    // Task #4: binding grid lines to axis ticks
	    //
	    // this is tricky, as the plot may not contain axis in its slots
	    // but the bound axis can be in other slots in the same row or column
	    // it also depends on the subplots bound mode
	    $("div[data-idd-plot='grid']").each(function(idx){			
			var host = this
			var grid = host.plot
			switch(_mode) {
				case InteractiveDataDisplay.SubPlotsBindingMode.EverythingBound:
					// in this mode binding to the only master axis
					if(_rowMasterAxis[0])
						grid.xAxis = _rowMasterAxis[0]
					if(_colMasterAxis[0])
						grid.yAxis = _colMasterAxis[0]
					
				break;
				case InteractiveDataDisplay.SubPlotsBindingMode.SelectedColumnsRowsBound:
					var master = plot.master
					// where is this plot in the grid? Looking for indices
					var plotRow = -1
					var plotCol = -1
					for(var i = 0; i < _masterPlots.length && (plotRow === -1); i++) {
						for(var j =0; j < _Ncol/3; j++) {
							if(_masterPlots[i][j] === master) {
								plotRow = i
								plotCol = j
								break
							}
						}
					}
					if(plotRow === -1)
						throw "grid's master is not among the grid plots. Unsupported grid composition?"
					throw "not implemented"
				break;
				default:
					throw "not implemented"
			}
			
	    })
		
		// Task #5: activate naviation
		// we traveres master plots
		for(var i = 0; i < _masterPlots.length; i++) {
			var row = _masterPlots[i]
			for(var j = 0; j < row.length; j++) {
				var plot = row[j]
				// attaching gesture source
				var gestureSource = InteractiveDataDisplay.Gestures.getGesturesStream($(plot.host))
				plot.navigation.gestureSource = gestureSource							
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
				switch(_mode) {
					case InteractiveDataDisplay.SubPlotsBindingMode.EverythingBound:
						// 1) updating bound axes
						// all of the axes are affected
						for(var i = 0; i < _axes.length; i++) {
							var axis = _axes[i]
							if(_isAxisVertical[i])
								axis.update(yRange)
							else
								axis.update(xRange)
						}

						// 2) updating bound plots
						// traversing all of the grid master plots. Calling set visible to everyone except for originator
						var visRec = {
							x: vr.x_min,
							y: vr.y_min,
							width: vr.x_max - vr.x_min,
							height: vr.y_max - vr.y_min
						}
						for(var i = 0; i < _masterPlots.length; i++) {
							var row = _masterPlots[i]
							for(var j = 0; j < row.length; j++) {
								var plot = row[j]
								if(plot === this.master)
									continue // skipping the originator
								plot.navigation.setVisibleRect(visRec, false, { suppressNotifyBoundPlots: true, forceOnlyUpdatePlotsOutput:true, syncUpdate:true });								
							}
						}
					break;
					default:
						throw "not implemented"
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

		_host.subplots = that;
	}	

	this.renderSVG = function() {
		//var elemsToSVG = $(_host).find("div[data-idd-plot='plot'], div[data-idd-axis]");
		var elemsToSVG = $(_host).find("div[data-idd-plot='plot'], div[data-idd-axis], h4");
		
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
			if(plotOrAxis.is("h4")){
				var text = svg.text(elemsToSVG[i].innerText);
				svgs[i] = text.font({
					family:	$(elemsToSVG[i]).css("font-family")
				  , size:	$(elemsToSVG[i]).css("font-size")
				  , weight:	$(elemsToSVG[i]).css("font-weight")
				  })

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
			else{
				if(plotOrAxis.attr('data-idd-plot')){
					var plot = InteractiveDataDisplay.asPlot(plotOrAxis);
					svgs[i] = plot.exportToSvg();

					var wth = $(elemsToSVG[i]).find("div[data-idd-plot='grid']").width();
					var ht = $(elemsToSVG[i]).find("div[data-idd-plot='grid']").height();
					var plotBox = svg.polyline('0,0 '+wth+',0 '+wth+','+ht+' 0,'+ht+' 0,0').fill('none');
					plotBox.stroke({ color: '#808080', width: 1 }).move(leftOffsets[i], topOffsets[i]);
					svgSubPlotsGroup.add(plotBox);
				}
				else{
					svgs[i] = plotOrAxis[0].axis.exportToSvg();
				}
				svgs[i].move(leftOffsets[i], topOffsets[i]);
			}


			svgSubPlotsGroup.add(svgs[i]);
		}

		return svgSubPlotsGroup;
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