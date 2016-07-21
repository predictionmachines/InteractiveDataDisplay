
(function(InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else {
        var updateArea = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var data = {};
            if (!allBindings.has('iddY1'))
                throw new Error("Please define iddY1 and iddY2 bindings along with iddX");               
            else
                data.y1 = ko.unwrap(allBindings.get('iddY1'));
            if (!allBindings.has('iddY2'))
                throw new Error("Please define iddY1 and iddY2 bindings along with iddX");               
            else
                data.y2 = ko.unwrap(allBindings.get('iddY2'));
            
            if (!allBindings.has('iddX'))
                throw new Error("Please define iddX binding along with iddY1 and iddY2");
            else
                data.x = ko.unwrap(allBindings.get('iddX'));
            
            var n;
            if (Array.isArray(data.x))
                n = data.x.length;
            else throw new Error("iddX is not an array");

            if (Array.isArray(data.y1)) 
                if (data.y1.length !== n)
                    return;
            if (Array.isArray(data.y2))
                if (data.y2.length !== n)
                    return;
            
            if (allBindings.has('iddFill')) 
                data.fill = ko.unwrap(allBindings.get('iddFill'));
            
            var plotAttr = element.getAttribute("data-idd-plot");
            if (plotAttr != null) {
                if (typeof element.plot != 'undefined') {
                    element.plot.draw(data);
                }
                else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                    //storing the data in data-idd-datasource attribute as JSON string. it will be used by IDD during IDD-initializing of the dom element		
                    var evalstr = "(function(){return " + JSON.stringify(data) + "})";
                    element.setAttribute("data-idd-datasource", evalstr);
                }
            }
        }

        InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("area", updateArea, ['iddX', 'iddY1', 'iddY2', 'iddFill'])
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
