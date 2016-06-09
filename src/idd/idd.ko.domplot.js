
(function(InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else {
        var updateDOM = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var x, y, width, height;
            if (!allBindings.has('iddY'))
                throw new Error("Please define iddY binding along with iddX");               
            else
                y = ko.unwrap(allBindings.get('iddY'));
            
            if (!allBindings.has('iddX'))
                throw new Error("Please define iddX binding along with iddY");
            else
                x = ko.unwrap(allBindings.get('iddX'));

            if (allBindings.has('iddWidth'))
                width = ko.unwrap(allBindings.get('iddWidth'));
            if (allBindings.has('iddHeight'))
                height = ko.unwrap(allBindings.get('iddHeight'));
                  

            if (typeof element.parentElement.plot != 'undefined') {
                var plot = element.parentElement.plot;
                if (typeof plot.domElements !== 'undefined') { //plot is initialized
                    var domElems = plot.domElements;
                    var registered = false;
                    registered = domElems.some(function(val) {
                        return (val[0] === element);
                    });

                    if (registered) {
                        //(element, x, y, width, height, ox, oy)
                        plot.set(element, x, y, width, height, 0.5, 1);
                    }
                    else {
                        //(element, scaleMode, x, y, width, height, originX, originY)
                        plot.add(element, 'none', x, y, width, height, 0.5, 1);
                    }
                }
            }
            else { 
            }
        }

        InteractiveDataDisplay.KnockoutBindings.registerPlotBinding("dom", updateDOM, ['iddX', 'iddY', 'iddWidth', 'iddHeight'])
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))
