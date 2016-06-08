if(ko) { //add Knockout bindings. Requires that IDD loaded after Knockout
    var lineThickness = 3;
	
	function updatePolyline(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var data = {};
		if (!allBindings.has('iddY'))
			if (!allBindings.has('iddYMedian'))
				throw new Error("Please define iddY or iddYMedian binding along with iddX");
			else {
				data.y = {median: ko.unwrap(allBindings.get('iddYMedian'))};
				
				if (allBindings.has('iddLower68'))
					data.y.lower68 = ko.unwrap(allBindings.get('iddLower68'));
				if (allBindings.has('iddUpper68'))
					data.y.upper68 = ko.unwrap(allBindings.get('iddUpper68'));
				if (allBindings.has('iddUpper95'))
					data.y.upper95 = ko.unwrap(allBindings.get('iddUpper95'));
				if (allBindings.has('iddLower95'))
					data.y.lower95 = ko.unwrap(allBindings.get('iddLower95'));
			}
		else
			data.y = ko.unwrap(allBindings.get('iddY'));
		
		if (!allBindings.has('iddX'))
			throw new Error("Please define iddX binding along with iddY");
		else
			data.x = ko.unwrap(allBindings.get('iddX'));
        
        var n;
        if (Array.isArray(data.x))
            n = data.x.length;
        else throw new Error("iddX is not array");

        if (Array.isArray(data.y.length)) {
            if (data.y.length !== n)
                return;
        } else if (Array.isArray(data.y.median)) {
            if (data.y.median.length !== n)
                return;
            if (Array.isArray(data.y.lower68) && data.y.lower68.length !== n)
                return;
            if (Array.isArray(data.y.upper68) && data.y.upper68.length !== n)
                return;
            if (Array.isArray(data.y.lower95) && data.y.lower95.length !== n)
                return;
            if (Array.isArray(data.y.upper95) && data.y.upper95.length !== n)
                return;            
        }
		
		if (allBindings.has('iddStroke')) 
			data.stroke = ko.unwrap(allBindings.get('iddStroke'));
		if (allBindings.has('iddThickness')) 
			data.thickness = ko.unwrap(allBindings.get('iddThickness'));
		if (allBindings.has('iddLineCap')) 
			data.lineCap = ko.unwrap(allBindings.get('iddLineCap'));
		if (allBindings.has('iddLineJoin')) 
			data.lineJoin = ko.unwrap(allBindings.get('iddLineJoin'));
		if (allBindings.has('iddFill68')) 
			data.fill68 = ko.unwrap(allBindings.get('iddFill68'));
		if (allBindings.has('iddFill95')) 
			data.fill95 = ko.unwrap(allBindings.get('iddFill95'));
		
		var plotAttr = element.getAttribute("data-idd-plot");
		if (plotAttr != null) {
			if (typeof element.plot != 'undefined') {
				element.plot.draw(data);
			}
			else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
				//storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element				
				var csvDataToDraw = "x ";
                if (Array.isArray(data.y)) csvDataToDraw += "y";
                else if (Array.isArray(data.y.median)) {
                    csvDataToDraw += "y.median ";
                    if (Array.isArray(data.y.lower68)) csvDataToDraw += "y.lower68 ";
                    if (Array.isArray(data.y.upper68)) csvDataToDraw += "y.upper68 ";
                    if (Array.isArray(data.y.lower95)) csvDataToDraw += "y.lower95 ";
                    if (Array.isArray(data.y.upper95)) csvDataToDraw += "y.upper95 ";
                }

				var len = data.x.length;
				for (var i = 0; i < len; i++) {
					csvDataToDraw += "\n" + data.x[i];
                    if (Array.isArray(data.y)) csvDataToDraw += " " + data.y[i];
                    else if (Array.isArray(data.y.median)) {
                        csvDataToDraw += " " + data.y.median[i];
                        if (Array.isArray(data.y.lower68)) csvDataToDraw += " " + data.y.lower68[i];
                        if (Array.isArray(data.y.upper68)) csvDataToDraw += " " + data.y.upper68[i];
                        if (Array.isArray(data.y.lower95)) csvDataToDraw += " " + data.y.lower95[i];
                        if (Array.isArray(data.y.upper95)) csvDataToDraw += " " + data.y.upper95[i];
                    }
				}

				element.innerHTML = csvDataToDraw;
					//saving stroke color in the data-idd-style attribute: will be picked up by initialization
				element.setAttribute("data-idd-style",  (data.stroke    ? "stroke: "    + data.stroke    + "; " : "") + 
                                                        (data.lineCap   ? "lineCap: "   + data.lineCap   + "; " : "") + 
                                                        (data.lineJoin  ? "lineJoin: "  + data.lineJoin  + "; " : "") + 
                                                        (data.thickness ? "thickness: " + data.thickness + "; " : "") + 
                                                        (data.fill68    ? "fill68: "    + data.fill68    + "; " : "") + 
                                                        (data.fill95    ? "fill95: "    + data.fill95    + "; " : ""));
			}
		}
	}
	    
	function updateMarkers(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var data = {};		
        if (!allBindings.has('iddY'))
            throw new Error("Please define iddY binding along with iddX");
		else
			data.y = ko.unwrap(allBindings.get('iddY'));
		
		if (!allBindings.has('iddX'))
			throw new Error("Please define iddX binding along with iddY");
		else
			data.x = ko.unwrap(allBindings.get('iddX'));
		

        if (data.x.length !== data.y.length)
            return;

		if (allBindings.has('iddShape')) 
			data.shape = ko.unwrap(allBindings.get('iddShape'));
		if (allBindings.has('iddSize')) 
			data.size = ko.unwrap(allBindings.get('iddSize'));
		if (allBindings.has('iddBorder')) 
			data.border = ko.unwrap(allBindings.get('iddBorder'));
		if (allBindings.has('iddColor')) 
			data.color = ko.unwrap(allBindings.get('iddColor'));
		
		var plotAttr = element.getAttribute("data-idd-plot");
		if (plotAttr != null) {
			if (typeof element.plot != 'undefined') {
				element.plot.draw(data);
			}
			else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
				//storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element				
				var csvDataToDraw = "x y";
				var len = data.x.length;
				for (var i = 0; i < len; i++) {
					csvDataToDraw += "\n" + data.x[i] + " " + data.y[i];
				}

				element.innerHTML = csvDataToDraw;
					//saving stroke color in the data-idd-style attribute: will be picked up by initialization
				element.setAttribute("data-idd-style",  (data.shape  ? "shape: "  + data.shape  + "; " : "") + 
                                                        (data.size   ? "size: "   + data.size   + "; " : "") + 
                                                        (data.border ? "border: " + data.border + "; " : "") + 
                                                        (data.color  ? "color: "  + data.color  + "; " : ""));
			}
		}
	}
	
	function updatePlot(element, valueAccessor, allBindings, viewModel, bindingContext) {		
		var plotAttr = element.getAttribute("data-idd-plot");
		if (plotAttr != null) {
			switch (plotAttr) {
				case 'polyline':
					updatePolyline(element, valueAccessor, allBindings, viewModel, bindingContext);
					break;
				case 'area':
					
					break;
				case 'markers':
				    updateMarkers(element, valueAccessor, allBindings, viewModel, bindingContext);
					break;
			}			
		}	
	}
	
    var binding = function () {
        return {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                updatePlot(element, valueAccessor, allBindings, viewModel, bindingContext);
            }
        }
    }

    ko.bindingHandlers.iddPlotName  = binding();
    ko.bindingHandlers.iddY         = binding();
    ko.bindingHandlers.iddYMedian   = binding();
    ko.bindingHandlers.iddLower68   = binding();
    ko.bindingHandlers.iddUpper68   = binding();
    ko.bindingHandlers.iddLower95   = binding();
    ko.bindingHandlers.iddUpper95   = binding();
    ko.bindingHandlers.iddStroke    = binding();    
    ko.bindingHandlers.iddThickness = binding();
    ko.bindingHandlers.iddX         = binding();
    ko.bindingHandlers.iddShape     = binding();
    ko.bindingHandlers.iddSize      = binding();
    ko.bindingHandlers.iddBorder    = binding();
    ko.bindingHandlers.iddColor     = binding();
    
    ko.bindingHandlers.iddPlotName = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            var unwrappedName = ko.unwrap(value);

            var plotAttr = element.getAttribute("data-idd-plot");
            if (plotAttr != null) {
                if (typeof element.plot != 'undefined') {
                    element.plot.name = unwrappedName;
                }
                else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                    //storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element

                    //saving plot name in  attribute: will be picked up by initialization
                    element.setAttribute("data-idd-name", unwrappedName);

                }
            }
        }
    };

    ko.bindingHandlers.iddAreaY1 = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            var unwrappedY1 = ko.unwrap(value);

            var xBindings;
            if (!allBindings.has('iddX'))
                throw new Error("Please define iddX binding along with iddAreaY1");
            else
                xBindings = allBindings.get('iddX');
            var unwrappedX = ko.unwrap(xBindings);
            var y2Bindings;
            if (!allBindings.has('iddAreaY2'))
                throw new Error("Please define iddAreaY2 binding along with iddAreaY1");
            else
                y2Bindings = allBindings.get('iddAreaY2');
            var unwrappedY2 = ko.unwrap(y2Bindings);
            var fillBindings;
            var unwrappedFill;
            if (!allBindings.has('iddAreaFill'))
                unwrappedFill = undefined;
            else
                fillBindings = allBindings.get('iddAreaFill');
            var unwrappedFill = ko.unwrap(fillBindings);
            var plotAttr = element.getAttribute("data-idd-plot");
            if (plotAttr != null) {
                if (typeof element.plot !== 'undefined') {
                    var data = { x: unwrappedX, y1: unwrappedY1, y2: unwrappedY2 };
                    if (typeof unwrappedFill !== 'undefined')
                        data.fill = unwrappedFill;
                    element.plot.draw(data);
                }
                else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                    //storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element
                    var csvDataToDraw = "x y1 y2";
                    var len = unwrappedX.length;
                    for (var i = 0; i < len; i++) {
                        csvDataToDraw += "\n" + unwrappedX[i] + " " + unwrappedY1[i] + " " + unwrappedY2[i];
                    }
                    element.innerHTML = csvDataToDraw;

                    if (typeof unwrappedFill !== 'undefined') {
                        //saving stroke color in the data-idd-style attribute: will be picked up by initialization
                        element.setAttribute("data-idd-style", "fill: " + unwrappedFill);
                    }

                }
            }
        }
    };

    var barMarker = {
        draw: function (marker, plotRect, screenSize, transform, context) {
            var barWidth = 0.5 * marker.barWidth;
            var xLeft = transform.dataToScreenX(marker.x - barWidth);
            var xRight = transform.dataToScreenX(marker.x + barWidth);
            if (xLeft > screenSize.width || xRight < 0) return;
            var yTop = transform.dataToScreenY(marker.y);
            var yBottom = transform.dataToScreenY(0);
            if (yTop > yBottom) {
                var k = yBottom;
                yBottom = yTop;
                yTop = k;
            }
            if (yTop > screenSize.height || yBottom < 0) return;

            if (marker.shadow) {
                context.fillStyle = marker.shadow;
                context.fillRect(xLeft + 2, yTop + 2, xRight - xLeft, yBottom - yTop);
            }

            context.fillStyle = marker.color;
            context.fillRect(xLeft, yTop, xRight - xLeft, yBottom - yTop);
            if (marker.border) {
                context.strokeStyle = marker.border;
                context.strokeRect(xLeft, yTop, xRight - xLeft, yBottom - yTop);
            }
        },
        prepare: function (data) {
            if (data.x == undefined)
                data.x = InteractiveDataDisplay.Utils.range(0, data.y.length - 1);

            if (data.colorPalette && data.color) {
                if (data.colorPalette.isNormalized) {
                    var r = InteractiveDataDisplay.Utils.getMinMax(data.color);
                    if (r === undefined)
                        r = {
                            min: 0,
                            max: 1
                        };
                    r = InteractiveDataDisplay.Utils.makeNonEqual(r);
                    data.colorPalette = data.colorPalette.absolute(r.min, r.max);
                }
                var n = data.color.length;
                var colors = new Array(n);
                for (var i = 0; i < n; i++) {
                    var color = data.color[i];
                    var rgba = data.colorPalette.getRgba(color);
                    colors[i] = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
                }
                data.color = colors;
            }
        },
        getBoundingBox: function (marker) {
            var barWidth = marker.barWidth;
            var xLeft = marker.x - barWidth / 2;
            var yBottom = Math.min(0, marker.y);
            return { x: xLeft, y: yBottom, width: barWidth, height: Math.abs(marker.y) };
        },

        hitTest: function (marker, transform, ps, pd) {
            var barWidth = marker.barWidth;
            var xLeft = marker.x - barWidth / 2;
            var yBottom = Math.min(0, marker.y);
            if (pd.x < xLeft || pd.x > xLeft + barWidth) return false;
            if (pd.y < yBottom || pd.y > yBottom + Math.abs(marker.y)) return false;
            return true;
        }
    };
    var colorPalette = InteractiveDataDisplay.ColorPalette.parse("#69D2E7,#A7DBD8,#E0E4CC,#F38630,#FA6900");

    ko.bindingHandlers.iddBarChartY = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {


            var value = valueAccessor();
            var unwrappedY = ko.unwrap(value);

            var plotAttr = element.getAttribute("data-idd-plot");
            if (plotAttr != null) {
                if (typeof element.plot !== 'undefined') {
                    //taking control of visible rect.
                    var len = unwrappedY.length;
                    if (len == 0)
                        element.plot.maxBar = undefined; //reseting max plot values, as new simulation started
                    var maxBar = Number.NEGATIVE_INFINITY;
                    if (typeof element.plot.maxBar !== 'undefined')
                        maxBar = element.plot.maxBar;

                    var x = new Array(len);
                    var heightIncreased = false;
                    for (var i = 0; i < len; i++) {
                        x[i] = i;
                        if (unwrappedY[i] > maxBar) {
                            heightIncreased = true;
                            maxBar = unwrappedY[i];
                        }
                    }
                    var data = { y: unwrappedY, color: x, colorPalette: colorPalette, barWidth: 0.9, shadow: 'grey', shape: barMarker };
                    var plot2 = element.plot;
                    plot2.isAutoFitEnabled = false;
                    plot2.draw(data);

                    plot2.maxBar = maxBar;
                    plot2.navigation.setVisibleRect({ x: -1, y: -maxBar * 0.1, width: len + 1, height: maxBar * 1.2 });


                }
            }
        }
    };

    ko.bindingHandlers.iddBarNamesOnAxis = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            var unwrappedNames = ko.unwrap(value);

            var plotAttr = element.getAttribute("data-idd-plot");
            if (plotAttr != null) {
                if (typeof element.plot != 'undefined') {
                    var ticks = [];
                    var len = unwrappedNames.length;
                    for (var i = 0; i < len; i++)
                        ticks.push(i);
                    var plot = element.plot.master
                    var currentAxes = plot.getAxes("bottom");
                    if (typeof currentAxes !== 'undefined' && currentAxes.length > 0)
                        currentAxes[0].remove();
                    if (len > 0)
                        plot.addAxis("bottom", "labels", { labels: unwrappedNames, ticks: ticks });
                }
            }
        }
    };

    ko.bindingHandlers.barLabelY = {
        //init: function(elem, valueAccessor) {                        
        //    return { controlsDescendantBindings: true };
        //},
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var barLabelX;
            if (!allBindings.has('barLabelX'))
                throw new Error("Please define barLabelX binding along with barLabelY");
            else
                barLabelX = allBindings.get('barLabelX');
            var unwrappedX = ko.unwrap(barLabelX);
            var unwrappedX = bindingContext.$index();
            var value = valueAccessor();
            var unwrappedY = ko.unwrap(value);

            if (typeof element.parentElement.plot !== 'undefined') {
                var plot = element.parentElement.plot;
                if (typeof plot.domElements !== 'undefined') { //plot is initialized
                    var domElems = plot.domElements;
                    var len = domElems.length;
                    var registered = false;
                    for (var i = 0; i < len; i++) {
                        if (domElems[i][0] === element) {
                            registered = true;
                            break;
                        }
                    }
                    if (registered) {
                        //(element, x, y, width, height, ox, oy)
                        plot.set(element, unwrappedX, unwrappedY, undefined, undefined, 0.5, 1);
                    }
                    else {
                        //(element, scaleMode, x, y, width, height, originX, originY)
                        plot.add(element, 'none', unwrappedX, unwrappedY, undefined, undefined, 0.5, 1);
                    }
                }
                else {
                    //todo: fill dom properies
                }
            }
        }
    };
}