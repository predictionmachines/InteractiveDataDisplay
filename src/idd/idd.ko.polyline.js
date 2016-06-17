
(function(InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else {
        var updatePolyline = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
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

            if (Array.isArray(data.y)) {
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
                    //storing the data in data-idd-datasource attribute as JSON string. it will be used by IDD during IDD-initializing of the dom element		
                    var evalstr = "(function(){return " + JSON.stringify(data) + "})";
                    element.setAttribute("data-idd-datasource", evalstr);
                }
            }
        }

        InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("polyline", updatePolyline, ['iddX', 'iddY', 'iddYMedian', 'iddLower68', 'iddUpper68', 'iddLower95',
                                                                                                 'iddUpeer95', 'iddFill68', 'iddFill95', 'iddStroke', 'iddThickness',
                                                                                                 'iddLineCap', 'iddLineJoin'])
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
