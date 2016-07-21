
(function(InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else {
        var registerBindings = (function() {
            function knockoutBindings() {
                var bindings = {};
                var plotBinding = function(element, valueAccessor, allBindings, viewModel, bindingContext) {	
                    var plotAttr = element.getAttribute("data-idd-plot") || element.parentElement.getAttribute("data-idd-plot");//parent is checking for dom plot
                    if (bindings.hasOwnProperty(plotAttr)) {
                        bindings[plotAttr](element, valueAccessor, allBindings, viewModel, bindingContext);
                    } else {
                        throw new Error("There is no bindings registered for " + plotAttr + " plot");
                    }
                }
                this.registerPlotBinding = function (plotName, binding, array) {
                    bindings[plotName] = binding;
                    array.forEach(function(val) {
                        ko.bindingHandlers[val] = {update: plotBinding};
                    });
                }
            }            
            return knockoutBindings;
        })();

        InteractiveDataDisplay.KnockoutBindings = new registerBindings();
        
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
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))