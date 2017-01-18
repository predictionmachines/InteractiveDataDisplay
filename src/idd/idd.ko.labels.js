(function (InteractiveDataDisplay) {
	if (!ko) {
		console.log("Knockout was no found, please load Knockout first");
	} else {
		var updateLabels = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var data = [];
			var x = [];
			var y = [];
			var labelstext = [];
			if (!allBindings.has('iddX'))
				throw new Error("Please define iddX and iddY");
			else
				x = ko.unwrap(allBindings.get('iddX'));
			if (!allBindings.has('iddY'))
				throw new Error("Please define iddX and iddY");
			else
				y = ko.unwrap(allBindings.get('iddY'));

			if (!allBindings.has('iddLabelsText'))
				throw new Error("Please define iddLabelsText binding along with iddX and iddY");
			else
				labelstext = ko.unwrap(allBindings.get('iddLabelsText'));			

			if((x.length != y.length) || (x.length != labelstext.length)) {
				//updating the plot only in case of all properties have the same array length
				//in other words, dropping the updates as long as the dataseries are not aligned				
				return;
			}
						
			for(var i=0;i<x.length;i++) {
				data.push({
					text: labelstext[i],
					position: {
						x: x[i],
						y: y[i]
					}
				});
			};
			
			var plotAttr = element.getAttribute("data-idd-plot");
			if (plotAttr != null) {
				if (typeof element.plot != 'undefined') {
					element.plot.draw(data);
				}
				else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
					//storing the data in data-idd-datasource attribute as JSON string. it will be used by IDD during IDD-initializing of the dom element		
					element.setAttribute("data-idd-datasource", JSON.stringify(data));
				}
			}
		}

		InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("label", updateLabels, ['iddX', 'iddY', 'iddLabelsText'])
	}
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
