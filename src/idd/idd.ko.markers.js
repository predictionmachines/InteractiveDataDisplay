
(function(InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else { 
        var updateMarkers = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var data = {};		
            if (allBindings.has('iddY'))
                data.y = ko.unwrap(allBindings.get('iddY'));
            
            if (allBindings.has('iddX'))
                data.x = ko.unwrap(allBindings.get('iddX'));
            

            if (data.x && data.y && data.x.length !== data.y.length)
                return;
            
            var customShape;
            if (allBindings.has('iddShape')) 
                data.shape = ko.unwrap(allBindings.get('iddShape'));
            if (allBindings.has('iddSize')) 
                data.size = ko.unwrap(allBindings.get('iddSize'));
            if (allBindings.has('iddBorder')) 
                data.border = ko.unwrap(allBindings.get('iddBorder'));
            if (allBindings.has('iddColor')) 
                data.color = ko.unwrap(allBindings.get('iddColor'));
            if (allBindings.has('iddCustomShape')) 
                customShape = ko.unwrap(allBindings.get('iddCustomShape'));
            
            var plotAttr = element.getAttribute("data-idd-plot");
            if (plotAttr != null) {
                if (typeof element.plot != 'undefined') {
                    if (customShape)
                        for (var prop in customShape)
                            data[prop] = ko.unwrap(customShape[prop]);
                    element.plot.draw(data);
                }
                else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                    //storing the data in data-idd-datasource attribute as JSON string. it will be used by IDD during IDD-initializing of the dom element	 	
                    var evalstr = "(function(){return " + JSON.stringify(data) + "})";
                    element.setAttribute("data-idd-datasource", evalstr);
                }
            }
        }

        InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("markers", updateMarkers, ['iddX', 'iddY', 'iddShape', 'iddSize', 'iddBorder', 'iddColor', 'iddCustomShape'])
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
