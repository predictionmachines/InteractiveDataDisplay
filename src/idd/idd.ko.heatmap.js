(function (InteractiveDataDisplay) {
	if (!ko) {
		console.log("Knockout was no found, please load Knockout first");
	} else {
		var updateHeatmap = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var data = {};
			if (!allBindings.has('iddX'))
				throw new Error("Please define iddX and iddY");
			else
				data.x = ko.unwrap(allBindings.get('iddX'));
			if (!allBindings.has('iddY'))
				throw new Error("Please define iddX and iddY");
			else
				data.y = ko.unwrap(allBindings.get('iddY'));

			if (!allBindings.has('iddValues'))
				throw new Error("Please define iddValues binding along with iddX and iddY");
			else
				data.values = ko.unwrap(allBindings.get('iddValues'));

			var N = data.x.length;
			var M = data.y.length;
			if (data.values.length !== N || !Array.isArray(data.values[0]) || data.values[0].length !== M ||
				N < 2 || M < 2)
				return;

			var titles = undefined;
			if (allBindings.has('iddInterval'))
				data.interval = ko.unwrap(allBindings.get('iddInterval'));
			if (allBindings.has('iddColorPalette'))
				data.colorPalette = ko.unwrap(allBindings.get('iddColorPalette'));
			if (allBindings.has('iddOpacity'))
			    data.opacity = ko.unwrap(allBindings.get('iddOpacity'));
			if (allBindings.has('iddPlotTitles'))
			    titles = ko.unwrap(allBindings.get('iddPlotTitles'));

			var plotAttr = element.getAttribute("data-idd-plot");
			if (plotAttr != null) {
				if (typeof element.plot != 'undefined') {
					element.plot.draw(data, titles);
				}
				else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
					//storing the data in data-idd-datasource attribute as JSON string. it will be used by IDD during IDD-initializing of the dom element		
					var evalstr = "(function(){return " + JSON.stringify(data) + "})";
					element.setAttribute("data-idd-datasource", evalstr);
				}
			}
		}

		InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("heatmap", updateHeatmap, ['iddX', 'iddY', 'iddValues', 'iddOpacity', 'iddColorPalette', 'iddInterval'])
	}
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
