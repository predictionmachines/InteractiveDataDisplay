
(function (InteractiveDataDisplay) {
    if (!ko) {
        console.log("Knockout was no found, please load Knockout first");
    } else {
        var registerBindings = (function () {
            function knockoutBindings() {
                var bindings = {};
                var plotBinding = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var plotAttr = element.getAttribute("data-idd-plot") || element.parentElement.getAttribute("data-idd-plot");//parent is checking for dom plot
                    if (bindings.hasOwnProperty(plotAttr)) {
                        bindings[plotAttr](element, valueAccessor, allBindings, viewModel, bindingContext);
                    } else {
                        throw new Error("There is no bindings registered for " + plotAttr + " plot");
                    }
                }
                this.registerPlotBinding = function (plotName, binding, array) {
                    bindings[plotName] = binding;
                    array.forEach(function (val) {
                        ko.bindingHandlers[val] = { update: plotBinding };
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

        ko.bindingHandlers.iddIgnoredByFitToView = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var unwrappedName = ko.unwrap(value);

                var plotAttr = element.getAttribute("data-idd-plot");
                if (plotAttr != null) {
                    if (typeof element.plot != 'undefined') {
                        element.plot.isIgnoredByFitToView = unwrappedName;
                    }
                    else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                        //storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element                        
                        element.setAttribute("data-idd-ignored-by-fit-to-view", unwrappedName);

                    }
                }
            }
        };

        ko.bindingHandlers.iddXlog = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var unwrappedName = ko.unwrap(value);

                var plotAttr = element.getAttribute("data-idd-plot");
                if (plotAttr != null) {
                    if (typeof element.plot != 'undefined') {
                        if(unwrappedName)
                            element.plot.xDataTransform = InteractiveDataDisplay.logTransform;
                        else
                            element.plot.xDataTransform = InteractiveDataDisplay.identityTransform;
                    }
                    else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                        //storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element                        
                        element.setAttribute("data-idd-X-log", unwrappedName);
                    }
                }
            }
        };

        ko.bindingHandlers.iddYlog = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var unwrappedName = ko.unwrap(value);

                var plotAttr = element.getAttribute("data-idd-plot");
                if (plotAttr != null) {
                    if (typeof element.plot != 'undefined') {
                        if(unwrappedName)
                            element.plot.yDataTransform = InteractiveDataDisplay.logTransform;
                        else
                            element.plot.yDataTransform = InteractiveDataDisplay.identityTransform;
                    }
                    else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                        //storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element                        
                        element.setAttribute("data-idd-Y-log", unwrappedName);

                    }
                }
            }
        };

        ko.bindingHandlers.iddPlotTitles = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var unwrappedData = ko.unwrap(value);

                var plotAttr = element.getAttribute("data-idd-plot");
                if (plotAttr != null) {
                    if (typeof element.plot != 'undefined') {
                        element.plot.setTitles(unwrappedData);
                    }
                }
            }
        };
        ko.bindingHandlers.iddEditorColorPalette = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var palette = ko.unwrap(value);

                if ($(element).hasClass("idd-colorPaletteEditor")) {
                    if (typeof element.editor != 'undefined') {
                        element.editor.palette = palette;
                    }
                }
            }
        };
        ko.bindingHandlers.iddAxisSettings = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var v = ko.unwrap(value);

                var plotAttr = element.getAttribute("data-idd-axis");
                if (plotAttr != null && v.type) {
                    var placement = element.getAttribute("data-idd-placement");
                    if (typeof element.axis != 'undefined') {
                        var div = $(element).closest('div[data-idd-plot]');
                        if (plotAttr != v.type) {
                            var axisElement = div[0].plot.addAxis(placement, v.type, { labels: v.labels ? v.labels : [], ticks: v.ticks ? v.ticks : [], rotate: v.rotate, rotateAngle: v.rotateAngle }, element);
                            var bindData = $(element).attr("data-bind");
                            axisElement.attr("data-bind", bindData);
                            element.axis.remove();
                            element = axisElement;
                        }
                        else if (plotAttr == "labels") {
                            element.axis.updateLabels({ labels: v.labels, ticks: v.ticks, rotate: v.rotate, rotateAngle: v.rotateAngle });
                        }
                        if (v.fontSize) element.axis.FontSize = v.fontSize;
                        if (typeof v.attachGrid != 'undefined' && v.attachGrid && typeof div[0].plot != 'undefined') {
                            var plots = div[0].plot.getPlotsSequence();
                            for (var i = 0; i < plots.length; i++) {
                                var p = plots[i];
                                if (p instanceof InteractiveDataDisplay.GridlinesPlot) {
                                    if (placement == "bottom") {
                                        p.xAxis = element.axis;
                                        p.requestUpdateLayout();
                                    }
                                    else if (placement == "left") {
                                        p.yAxis = element.axis;
                                        p.requestUpdateLayout();
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        };
        ko.bindingHandlers.iddPlotOrder = {
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var unwrappedOrder = ko.unwrap(value);
                
                if (typeof element.plot != 'undefined') {
                    element.plot.order = Number(unwrappedOrder);
                }
                else { //the case when the element was not yet initialized and not yet bound to the logical entity (plot)
                    //storing the data in the DOM. it will be used by IDD during IDD-initializing of the dom element

                    //saving plot order in  attribute: will be picked up by initialization
                    element.setAttribute("data-idd-plot-order", unwrappedOrder);

                }
            }
        };
    }
})(InteractiveDataDisplay || (InteractiveDataDisplay = {}))