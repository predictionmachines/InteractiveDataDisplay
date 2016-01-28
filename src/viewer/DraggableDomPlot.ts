/// <reference path="../../typings/jquery/jquery.d.ts" />
module ChartViewer {

    var plotClickEvent = jQuery.Event("plotClick");

    export function DraggableDOMPlot(host, master) {
        this.base = InteractiveDataDisplay.Plot;
        this.base(host, master);

        var that = this;

        // array of DOM elements located in the data space of this plot
        var domElements = [];

        var addElement = function (jqElem, scaleMode, xld, ytd, wd, hd, ox, oy) {
            if (jqElem[0].tagName.toLowerCase() !== "div") throw "DOMPlot supports only DIV elements";
            jqElem._x = xld;
            jqElem._y = ytd;
            jqElem._width = wd && wd > 0 ? wd : 1;
            jqElem._height = hd && hd > 0 ? hd : 1;
            jqElem._originX = ox || 0;
            jqElem._originY = oy || 0;
            jqElem._scale = scaleMode || 'element';

            var updateElement = function (elt) {
                // transformations
                var screenToPlotX = that.coordinateTransform.screenToPlotX;
                var screenToPlotY = that.coordinateTransform.screenToPlotY;
                var plotToDataX = that.xDataTransform && that.xDataTransform.plotToData;
                var plotToDataY = that.yDataTransform && that.yDataTransform.plotToData;
                var screenToDataX = plotToDataX ? function (x) { return plotToDataX(screenToPlotX(x)) } : screenToPlotX;
                var screenToDataY = plotToDataY ? function (y) { return plotToDataY(screenToPlotY(y)) } : screenToPlotY;

                var currentPos = elt.position();
                elt._left = currentPos.left + elt._originX * elt.width();
                elt._top = currentPos.top + elt._originY * elt.height();
                elt._x = screenToDataX(currentPos.left + elt._originX * elt.width());
                elt._y = screenToDataY(currentPos.top + elt._originY * elt.height());
            };

            jqElem.on("drag", function (event, ui) {
                updateElement(jqElem);
            });

            jqElem.on("dragstop", function (event, ui) {
                updateElement(jqElem);
                that.invalidateLocalBounds();
                that.requestUpdateLayout();
            });

            jqElem.addClass("d3-dom-marker");
            jqElem.css('display', 'none').css('z-index', InteractiveDataDisplay.ZIndexDOMMarkers);
            domElements.push(jqElem);
        };

        host.children("div[data-idd-position]")
            .each(function () {
                var jqElem = $(this);

                var positions = jqElem.attr('data-idd-position').split(/\s+/g);
                if (positions.length < 2)
                    throw "Position of the DOM marker should define x and y";

                var xld = parseFloat(positions[0]);
                var ytd = parseFloat(positions[1]);

                var wd, hd;
                var size = jqElem.attr('data-idd-size');
                if (size) {
                    var sizes = size.split(/\s+/g);
                    if (sizes.length >= 2) {
                        wd = parseFloat(sizes[0]);
                        hd = parseFloat(sizes[1]);
                    }
                }

                var ox, oy;
                var origin = jqElem.attr('data-idd-origin');
                if (origin) {
                    var origins = origin.split(/\s+/g);
                    if (origins.length >= 2) {
                        ox = parseFloat(origins[0]);
                        oy = parseFloat(origins[1]);
                    }
                }

                var scale = jqElem.attr('data-idd-scale');
                addElement(jqElem, scale, xld, ytd, wd, hd, ox, oy);
            });

        var getPosition = function (el) {
            var left = el._x - el._originX * el._width;
            var top = el._y + el._originY * el._height;
            return { left: left, top: top };
        }

        // Returns a rectangle in the plot plane.
        this.computeLocalBounds = function () {
            return undefined;
        }

        // Returns 4 margins in the screen coordinate system
        this.getLocalPadding = function () {
            var padding = 0;
            return { left: padding, right: padding, top: padding, bottom: padding };
        }

        this.arrange = function (finalRect) {
            InteractiveDataDisplay.CanvasPlot.prototype.arrange.call(this, finalRect);

            var width = finalRect.width;
            var height = finalRect.height;
            this.host.css('clip', 'rect(0px,' + width + 'px,' + height + 'px,0px)');
        };

        this.renderCore = function (plotRect, screenSize) {
            DraggableDOMPlot.prototype.renderCore.call(this, plotRect, screenSize);
            var n = domElements.length;
            if (n > 0) {
                //Define screen rectangle
                var screenTop = 0;
                var screenBottom = screenSize.height;
                var screenLeft = 0;
                var screenRight = screenSize.width;

                // transformations
                var plotToScreenX = this.coordinateTransform.plotToScreenX;
                var plotToScreenY = this.coordinateTransform.plotToScreenY;
                var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
                var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
                var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)) } : plotToScreenX;
                var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)) } : plotToScreenY;

                for (var i = 0; i < n; i++) {
                    var el = domElements[i];
                    var p; // screen coordinates of the el's left-top
                    var size_p; // screen size of the element

                    if (el._scale == 'none') {
                        size_p = {
                            x: el.width(),
                            y: el.height()
                        };

                        p = { // screen coordinates 
                            x: dataToScreenX(el._x), // left
                            y: dataToScreenY(el._y) // top
                        };

                        var left = p.x - el._originX * size_p.x;
                        var top = p.y - el._originY * size_p.y;

                        p = { x: left, y: top };
                    } else {
                        var pos; // plot coordinates of the el's left-top
                        pos = getPosition(el);

                        p = { // screen coordinates of the el's left-top
                            x: dataToScreenX(pos.left),
                            y: dataToScreenY(pos.top)
                        };
                        size_p = { // screen size of the el
                            x: dataToScreenX(pos.left + el._width) - p.x,
                            y: dataToScreenY(pos.top - el._height) - p.y
                        };
                    }

                    var clipRectTop = 0, clipRectLeft = 0, clipRectBottom = size_p.y, clipRectRight = size_p.x;
                    var elIsVisible;

                    //Vertical intersection ([a1,a2] are screen top and bottom, [b1,b2] are iframe top and bottom)
                    var a1 = screenTop; var a2 = screenBottom;
                    var b1 = p.y; var b2 = p.y + size_p.y; // a,b are in the screen coordinate system
                    var c1 = Math.max(a1, b1); var c2 = Math.min(a2, b2); //[c1,c2] is intersection        
                    elIsVisible = c1 < c2;
                    if (elIsVisible) { //clip, if [c1,c2] is not empty (if c1<c2)                    
                        clipRectTop = c1 - p.y;
                        clipRectBottom = c2 - p.y;

                        //Horizontal intersection ([a1,a2] are screen left and right, [b1,b2] are iframe left and right)
                        a1 = screenLeft; a2 = screenRight;
                        b1 = p.x; b2 = p.x + size_p.x;
                        c1 = Math.max(a1, b1); c2 = Math.min(a2, b2); //[c1,c2] is intersection   
                        elIsVisible = c1 < c2;
                        if (elIsVisible) { //clip, if [c1,c2] is not empty (if c1<c2)
                            clipRectLeft = c1 - p.x;
                            clipRectRight = c2 - p.x;

                            //Finally, reset style.
                            el.css('left', p.x + 'px');
                            el.css('top', p.y + 'px');
                            //el.css('clip', 'rect(' + clipRectTop + 'px,' + clipRectRight + 'px,' + clipRectBottom + 'px,' + clipRectLeft + 'px)');
                            el.css('display', 'block');

                            if (el._scale === 'content') {
                                var scalex = size_p.x / el.width();
                                var scaley = size_p.y / el.height();
                                el.css(InteractiveDataDisplay.CssPrefix + '-transform-origin', '0% 0%');
                                el.css(InteractiveDataDisplay.CssPrefix + '-transform', 'scale(' + scalex + ',' + scaley + ')');
                            } else if (el._scale === 'element') {
                                el.css('width', size_p.x + 'px');
                                el.css('height', size_p.y + 'px');
                            }
                        }
                    }
                    if (!elIsVisible) {
                        el.css('display', 'none');
                    }
                }
            }
        };

        this.onIsRenderedChanged = function () {
            if (!this.isRendered) {
                var n = domElements.length;
                for (var i = 0; i < n; i++) {
                    var el = domElements[i];
                    el.css('display', 'none');
                }
            } else {
                var n = domElements.length;
                for (var i = 0; i < n; i++) {
                    var el = domElements[i];
                    el.css('z-index', InteractiveDataDisplay.ZIndexDOMMarkers);
                }
            }
        }

        this.clear = function () {
            var n = domElements.length;
            for (var i = 0; i < n; i++) {
                var el = domElements[i];
                el.remove();
            }
            domElements = [];
            this.invalidateLocalBounds();
            this.requestUpdateLayout();
        };


        // Adds new DIV element to the plot
        // element is an HTML describing the new DIV element
        // scaleMode is either 'element', 'content', or 'none'
        // left, top are coordinates of the element in the data space
        // width, height are optional size of the element in the data space
        // returns added DOM element
        this.add = function (element, scaleMode, x, y, width, height, originX, originY) {
            var el = $(element).appendTo(this.host);
            addElement(el, scaleMode, x, y, width, height, originX, originY);


            this.invalidateLocalBounds();
            this.requestUpdateLayout();
            return el.get(0);
        };

        var getElement = function (domEl) {
            var a = jQuery.grep(domElements, function (e) {
                return e[0] === domEl;
            });
            if (a && a.length > 0) return a[0];
            return undefined;
        };

        // Removes DIV element from the plot
        // element is DOM object
        this.remove = function (element) {
            var removeJQ = function (jqe) {
                var el = getElement(jqe[0]);
                if (el) {
                    domElements.splice(domElements.indexOf(el), 1);
                }
                jqe.remove();
            };

            if (typeof element.remove == "function") {
                removeJQ(element);
            } else {
                removeJQ($(element));
            }

            this.invalidateLocalBounds();
            this.requestUpdateLayout();
        };

        // Set the position and optionally width and height of the element
        // element is DOM object which must be added to the plot prior to call this method
        // left, top are new coordinates of the left top corner of the element in the plot's data space
        // width, height are optional new width and height of the element in the plot's data space (if not provided, remain same; valuable only for scale mode 'element' or 'content')
        this.set = function (element, x, y, width, height) {
            var myEl = getElement(element);
            if (!myEl) throw "Element is not found in the plot";

            myEl._x = x;
            myEl._y = y;
            if (myEl.scale != 'none') {
                if (width && width > 0)
                    myEl._width = width;
                if (height && height > 0)
                    myEl._height = height;
            }

            this.invalidateLocalBounds();
            this.requestUpdateLayout();
        };


        Object.defineProperty(this, "domElements", { get: function () { return domElements.slice(0); }, configurable: false });

        this.enableClickablePanel = false;

        that.master.centralPart.click(function (e) {
            if (that.enableClickablePanel) {
                // transformations
                var screenToPlotX = that.coordinateTransform.screenToPlotX;
                var screenToPlotY = that.coordinateTransform.screenToPlotY;
                var plotToDataX = that.xDataTransform && that.xDataTransform.plotToData;
                var plotToDataY = that.yDataTransform && that.yDataTransform.plotToData;
                var screenToDataX = plotToDataX ? function (x) { return plotToDataX(screenToPlotX(x)) } : screenToPlotX;
                var screenToDataY = plotToDataY ? function (y) { return plotToDataY(screenToPlotY(y)) } : screenToPlotY;

                var origin = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(that.master.centralPart, e);

                var x = screenToDataX(origin.x);
                var y = screenToDataY(origin.y);

                that.host.trigger(plotClickEvent, { x: x, y: y });
            }
        });
    }

    DraggableDOMPlot.prototype = new InteractiveDataDisplay.Plot;
    InteractiveDataDisplay.register('draggableMarkers', function (jqDiv, master) { return new DraggableDOMPlot(jqDiv, master); });
}