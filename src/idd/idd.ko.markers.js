
(function(InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else { 
        var updateMarkers = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var data = {};
            if (allBindings.has('iddX'))
                data.x = ko.unwrap(allBindings.get('iddX'));            
            else
                throw new Error("Please define iddX binding for marker plot");

            var N = data.x.length;

            if (allBindings.has('iddShape')) 
                data.shape = ko.unwrap(allBindings.get('iddShape'));
            
            if(data.shape == "boxwhisker") {
                if (allBindings.has('iddSize')) {                     
                    data.size = ko.unwrap(allBindings.get('iddSize'));
                    if(data.size.constructor === Array) {
                        console.warn("Ignoring markers (boxwhisker) iddSize binding. It must be number, not an array!");
                        delete data.size;
                    }
                }
                if (allBindings.has('iddColor')) {
                    data.color = ko.unwrap(allBindings.get('iddColor'));
                    if(data.color.constructor === Array) {
                        console.warn("Ignoring markers (boxwhisker) iddColor binding. It must be string, not an array!");
                        delete data.color;
                    }
                }
                if (allBindings.has('iddBorder')) {
                    data.border = ko.unwrap(allBindings.get('iddBorder'));
                    if(data.border.constructor === Array) {
                        console.warn("Ignoring markers (boxwhisker) iddBorder binding. It must be string, not an array!");
                        delete data.border;
                    }
                }
                if (allBindings.has('iddThickness')) {
                    data.thickness = ko.unwrap(allBindings.get('iddThickness'));
                }
                if (!allBindings.has('iddYMedian'))
                    throw new Error("Please define iddYMedian binding for \"boxwhisker\" marker shape");
                else {                                        
                    data.y = {median: ko.unwrap(allBindings.get('iddYMedian'))};
                    if(data.y.median.length != N)
                        return;                    
                    if(allBindings.has('iddLower68') && allBindings.has('iddLower68')) {
                        data.y.lower68 = ko.unwrap(allBindings.get('iddLower68'));
                        data.y.upper68 = ko.unwrap(allBindings.get('iddUpper68'));
                        if((data.y.lower68.length != N) || (data.y.upper68.length != N))
                            return;
                    }
                    if(allBindings.has('iddUpper95') && allBindings.has('iddLower95')) {
                        data.y.upper95 = ko.unwrap(allBindings.get('iddUpper95'));
                        data.y.lower95 = ko.unwrap(allBindings.get('iddLower95'));
                        if((data.y.lower95.length != N) || (data.y.upper95.length != N))
                            return;
                    }                    
                }                
            } else if (data.shape == "petals") {
                if (!(allBindings.has('iddY') && allBindings.has('iddUpper95') && allBindings.has('iddLower95')))
                    throw new Error("Please define iddY, iddLower95, iddUpper95 bindings for \"petals\" marker shape");
                else {                    
                    data.y = ko.unwrap(allBindings.get('iddY'));
                    data.size = {};
                    data.size.upper95 = ko.unwrap(allBindings.get('iddUpper95'));
                    data.size.lower95 = ko.unwrap(allBindings.get('iddLower95'));
                    if((data.size.lower95.length != N) || (data.size.upper95.length != N) || (data.y.length != N))
                        return;
                }    
            } else if (data.shape == "bulleye") {
                if (!(allBindings.has('iddY') && allBindings.has('iddUpper95') && allBindings.has('iddLower95')))
                    throw new Error("Please define iddY, iddLower95, iddUpper95 bindings for \"bulleye\" marker shape");
                else {
                    if (allBindings.has('iddSize')) {                     
                        data.size = ko.unwrap(allBindings.get('iddSize'));
                        if(data.size.constructor === Array) {
                            console.warn("Ignoring markers (bulleye) iddSize binding. It must be number, not an array!");
                            delete data.size;
                        }
                    }                    
                    data.y = ko.unwrap(allBindings.get('iddY'));
                    data.color = {};
                    data.color.upper95 = ko.unwrap(allBindings.get('iddUpper95'));                    
                    data.color.lower95 = ko.unwrap(allBindings.get('iddLower95'));
                    if((data.color.lower95.length != N) || (data.color.upper95.length != N) || (data.y.length != N))
                        return;
                }   
            } else {
                if (allBindings.has('iddY'))
                    data.y = ko.unwrap(allBindings.get('iddY'));                        
                if (data.x && data.y && data.x.length !== data.y.length)
                    return;

                if (allBindings.has('iddColor'))
                    data.color = ko.unwrap(allBindings.get('iddColor'));

                if (data.y && data.color && Array.isArray(data.color) && data.color.length !== data.y.length)
                    return;
            
                var customShape;            
                if (allBindings.has('iddSize')) 
                    data.size = ko.unwrap(allBindings.get('iddSize'));
                if (allBindings.has('iddBorder'))
                    data.border = ko.unwrap(allBindings.get('iddBorder'));
    			if (allBindings.has('iddColorPalette'))
                    data.colorPalette = ko.unwrap(allBindings.get('iddColorPalette'));
    			if (allBindings.has('iddBarWidth'))
                    data.barWidth = ko.unwrap(allBindings.get('iddBarWidth'));
    			if (allBindings.has('iddShadow'))
                    data.shadow = ko.unwrap(allBindings.get('iddShadow'));
    			if (allBindings.has('iddLabelPlacement'))
                    data.placement = ko.unwrap(allBindings.get('iddLabelPlacement'));
                if (allBindings.has('iddCustomShape'))
                    customShape = ko.unwrap(allBindings.get('iddCustomShape'));
            }
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
                    element.setAttribute("data-idd-datasource", JSON.stringify(data));
                }
            }
        }

        InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("markers", updateMarkers, ['iddX', 'iddY','iddYMedian','iddMedian','iddLower68','iddUpper68','iddLower95','iddUpper95', 'iddShape', 'iddSize', 'iddBorder', 'iddThickness', 'iddColor','iddColorPalette','iddBarWidth', 'iddShadow','iddCustomShape','iddLabelPlacement'])
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
