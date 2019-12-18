(function (InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    }
    else {
        var updateBoundaryLine = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var data = {};
            if (!allBindings.has('iddX'))
                if (!allBindings.has('iddY'))
                    throw new Error("Please define iddX or iddY binding");
                else
                    data.y = ko.unwrap(allBindings.get('iddY'));
            else
                if (allBindings.has('iddY'))
                    throw new Error("Please define either iddX or iddY binding");
                else
                    data.x = ko.unwrap(allBindings.get('iddX'));

            if (allBindings.has('iddStroke'))
                data.stroke = ko.unwrap(allBindings.get('iddStroke'));
            if (allBindings.has('iddThickness'))
                data.thickness = ko.unwrap(allBindings.get('iddThickness'));
            if (allBindings.has('iddLineDash'))
                data.lineDash = ko.unwrap(allBindings.get('iddLineDash'));

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
        InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("boundaryLine", updateBoundaryLine, ['iddX', 'iddY', 'iddStroke', 'iddThickness', 'iddLineDash'])
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))