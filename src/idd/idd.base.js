// Registers new plot type
// key: string, plot-factory: jqDiv x master plot -> plot
InteractiveDataDisplay.register = function (key, factory) {
    if (!key) throw 'key is undefined';
    if (!factory) throw 'factory is undefined';

    InteractiveDataDisplay.factory[key] = factory;
};


var _initializeInteractiveDataDisplay = function () { // determines settings depending on browser type

    "use strict";
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('firefox') >= 0) {
        InteractiveDataDisplay.CssPrefix = '-moz';
    } else if (userAgent.indexOf('chrome') >= 0 || userAgent.indexOf('safari') >= 0) {
        InteractiveDataDisplay.CssPrefix = '-webkit';
    }

    //if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
    //    // Suppress the default iOS elastic pan/zoom actions.
    //    document.addEventListener('touchmove', function (e) { e.preventDefault(); });
    //}

    if (window.requestAnimationFrame) {
        InteractiveDataDisplay.Utils.requestAnimationFrame = function (callback) {
            return window.requestAnimationFrame(callback);
        };
    }
    else if (window.msRequestAnimationFrame) {
        InteractiveDataDisplay.Utils.requestAnimationFrame = function (callback) {
            return window.msRequestAnimationFrame(callback);
        };
    }
    else if (window.webkitRequestAnimationFrame) {
        InteractiveDataDisplay.Utils.requestAnimationFrame = function (callback) {
            return window.webkitRequestAnimationFrame(callback);
        };
    }
    else if (window.mozRequestAnimationFrame) {
        InteractiveDataDisplay.Utils.requestAnimationFrame = function (callback) {
            return window.mozRequestAnimationFrame(callback);
        };
    }
    else if (window.oRequestAnimationFrame) {
        InteractiveDataDisplay.Utils.requestAnimationFrame = function (callback) {
            return window.oRequestAnimationFrame(callback);
        };
    }
    
    var initializePlot = function (jqDiv, master) {

        if (typeof (Modernizr) != 'undefined' && jqDiv) {
            if (!Modernizr.canvas) {
                jqDiv.replaceWith('<div">Browser does not support HTML5 canvas</div>');
            }
            else if (!Modernizr.borderradius) {
                jqDiv.replaceWith('<div">Browser does not support "border-radius" style property</div>');
            }
            else if (!Modernizr.boxshadow) {
                jqDiv.replaceWith('<div">Browser does not support "box-shadow" style property</div>');
            }
            else if (!Modernizr.csstransforms) {
                jqDiv.replaceWith('<div">Browser does not support 2d css transformations</div>');
            }
            else if (!Modernizr.hsla) {
                jqDiv.replaceWith('<div">Browser does not support hsla colors</div>');
            }
            else if (!Modernizr.rgba) {
                jqDiv.replaceWith('<div">Browser does not support rgba colors</div>');
            }
        }

        if (jqDiv.hasClass("idd-plot-master") || jqDiv.hasClass("idd-plot-dependant"))
            throw "The div element already is initialized as a plot";
        
        var plot = undefined;
        var plotType = jqDiv.attr("data-idd-plot");
        switch (plotType) {
            case "plot":
                plot = new InteractiveDataDisplay.Plot(jqDiv, master);
                plot.order = Number.MAX_SAFE_INTEGER;
                break;
            case "polyline":
                plot = new InteractiveDataDisplay.Polyline(jqDiv, master);
                break;
            case "dom":
                plot = new InteractiveDataDisplay.DOMPlot(jqDiv, master);
                plot.order = Number.MAX_SAFE_INTEGER;
                break;
            case "figure":
                plot = new InteractiveDataDisplay.Figure(jqDiv, master);
                break;
            case "chart":
                plot = new InteractiveDataDisplay.Chart(jqDiv, master);
                break;
            case "grid":
                plot = new InteractiveDataDisplay.GridlinesPlot(jqDiv, master);
                break;
            case "markers":
                plot = new InteractiveDataDisplay.Markers(jqDiv, master);
				break;
            case "area":
                plot = new InteractiveDataDisplay.Area(jqDiv, master);
				break;
            case "bingMaps":
                plot = new InteractiveDataDisplay.BingMapsPlot(jqDiv, master);
                break;
        }
        
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if(MutationObserver) {
          var observer = new MutationObserver(function(mutations, observer) {
            mutations.forEach(function(mutation) {
              var added=mutation.addedNodes, removed = mutation.removedNodes;
              if(added.length>0)
                  for(var i=0; i< added.length;i++) {
                      var jqAdded = $(added[i]);
                      if(jqAdded.attr("data-idd-plot")) {
                          jqAdded.removeClass("idd-plot-master").removeClass("idd-plot-dependant");
                          plot.addChild(initializePlot(jqAdded,master));
                      };
                  }
              if(removed.length>0)
                for(var i=0; i< removed.length;i++) {
                  var elem = removed[i];
                  if(typeof elem.getAttribute === "function") {
                    var plotAttr = elem.getAttribute("data-idd-plot");
                    if(plotAttr != null)
                      plot.removeChild(elem.plot);        
                    }
                  }
            });
          });
          
          observer.observe(jqDiv[0], {
            subtree: false,
            characterData: false,
            attributes: false,
            childList: true,
            attributeOldValue: false,
            characterDataOldValue: false
          });
        }
        else {
          console.warn("MutationObservers are not supported by the browser. DOM changes are not tracked by IDD");
        }
        
        if(plot) {
          return plot;
        };
          
        
        var factory = InteractiveDataDisplay.factory[plotType];
        if (factory) {
            return factory(jqDiv, master);
        }

        throw "Unknown plot type";
    };


    // Instantiates a plot for the given DIV element.
    // jqDiv is either ID of a DIV element within the HTML page or jQuery to the element to be initialized as a plot.
    // Returns new InteractiveDataDisplay.Plot instance.
    InteractiveDataDisplay.asPlot = function (div) {
        if (!div)
            throw "Plot must be attached to div!";

        var jqDiv;

        if (div.tagName !== undefined && div.tagName.toLowerCase() === "div") {
            jqDiv = $(div);
        } else if (typeof (div) === "string") {
            jqDiv = $("#" + div);
            if (jqDiv.length === 0) throw "There is no element with id " + div;
            div = jqDiv[0];
        } else if (div instanceof jQuery && div.is('div')) {
            jqDiv = div;
            div = div[0];
        } else
            throw "Invalid input parameter! It should be div of id of div of jQuery of div";

        if (div.plot !== undefined)
            return div.plot;
        else {
            var plot = initializePlot(jqDiv);
            return plot;
        }
    };

    // Tries to get IDD plot object from jQuery selector
    // Returns null if selector is null or DOM object is not an IDD master plot
    InteractiveDataDisplay.tryGetMasterPlot = function (jqElem) {
        if(jqElem && jqElem.hasClass("idd-plot-master")) {
            var domElem = jqElem.get(0);
            if('plot' in domElem)
                return domElem.plot;
            else
                return null;
        }
        return null; 
    }

    // Traverses descendants of jQuery selector and invokes updateLayout 
    // for all IDD master plots
    InteractiveDataDisplay.updateLayouts = function (jqElem) {            
        var plot = InteractiveDataDisplay.tryGetMasterPlot(jqElem);
        if(plot)
            plot.updateLayout();
        else {
            var c = jqElem.children();
            for(var i = 0;i<c.length;i++)
                InteractiveDataDisplay.updateLayouts(c.eq(i));        
        }
    }

    InteractiveDataDisplay.Event = InteractiveDataDisplay.Event || {};
    InteractiveDataDisplay.Event.appearanceChanged = jQuery.Event("appearanceChanged");
    InteractiveDataDisplay.Event.childrenChanged = jQuery.Event("childrenChanged");
    InteractiveDataDisplay.Event.isAutoFitChanged = jQuery.Event("isAutoFitEnabledChanged");
    InteractiveDataDisplay.Event.visibleRectChanged = jQuery.Event("visibleRectChanged");
    InteractiveDataDisplay.Event.isVisibleChanged = jQuery.Event("visibleChanged");
    InteractiveDataDisplay.Event.plotRemoved = jQuery.Event("plotRemoved");
    InteractiveDataDisplay.Event.orderChanged = jQuery.Event("orderChanged");

    InteractiveDataDisplay.Plot = function (div, master, myCentralPart) {

        if (div && (div.hasClass("idd-plot-master") || div.hasClass("idd-plot-dependant")))
            return;

        if (div && (navigator.userAgent.match(/(iPhone|iPod|iPad)/) || navigator.userAgent.match(/Android/))) {
            div.bind('touchstart', function (e) { e.preventDefault(); });
            div.bind('touchmove', function (e) { e.preventDefault(); });
        }

        var _isMaster = master === undefined && div !== undefined;
        var _master = master || this;
        var _host = div; // JQuery for the hosting div element
        var _centralPart = myCentralPart || _host;
        var _xDataTransform;
        var _yDataTransform;
        var _coordinateTransform = _isMaster ? new InteractiveDataDisplay.CoordinateTransform() : undefined;
        var _children = []; // array of Plot containing children plots of this master plot (every child may have its children recursively)
        var _isVisible = true;
        var _aspectRatio;
        var _isAutoFitEnabled = true;
        var _requestFitToView = false;
        var _requestFitToViewX = false;
        var _requestFitToViewY = false;
        var _doFitOnDataTransformChanged = true;
        var _isFlatRenderingOn = false;
        var _width, _height;
        var _name = "";
        var _order = 0;
        // Contains user-readable titles for data series of a plot. They should be used in tooltips and legends.
        var _titles = {};
        // The flag is set in setVisibleRegion when it is called at me as a bound plot to notify that another plot is changed his visible.
        // I set this flag to suppress echo, i.e. I will not notify bound plots about my new visible rectangle.
        // The flag is reset when any other update request is received.
        var _suppressNotifyBoundPlots = false;

        var _plotRect;


        if (div) {
            _name = div.attr("data-idd-name") || div.attr("id") || "";
            div[0].plot = this; // adding a reference to the initialized DOM object of the plot, pointing to the plot instance.

            // Disables user selection for this element:
            div.attr('unselectable', 'on')
               .addClass('unselectable')
               .on('selectstart', false);
        }
        if (_isMaster) {
            this._sharedCanvas = undefined; // for flat rendering mode
        }


        var _localbbox;
        // Indicates whether the last frame included rendering of this plot or not.
        var _isRendered = false;

        this.requestsRender = false;
        this.isInAnimation = false;
        this.isAnimationFrameRequested = false;
        var renderAll = false;
        if (_isMaster) {
            this.requestsUpdateLayout = false;
        }

        var _constraint = undefined;

        var that = this;

        // Plot properties
        Object.defineProperty(this, "isMaster", { get: function () { return _isMaster; }, configurable: false });
        // Indicates whether the last frame included rendering of this plot or not.
        Object.defineProperty(this, "isRendered", { get: function () { return _isRendered; }, configurable: false });
        Object.defineProperty(this, "flatRendering", {
            get: function () {
                if (!_isMaster) return master.flatRendering;
                return _isFlatRenderingOn;
            },
            set: function (value) {
                if (!_isMaster) {
                    master.flatRendering = value;
                    return;
                }
                if (_isFlatRenderingOn === value) return;
                _isFlatRenderingOn = value;
                that.requestUpdateLayout();
            }
        });
        Object.defineProperty(this, "master", { get: function () { return _master; }, configurable: false });
        Object.defineProperty(this, "host", { get: function () { return _host; }, configurable: false });
        Object.defineProperty(this, "centralPart", { get: function () { return _centralPart; }, configurable: false });
        Object.defineProperty(this, "name", {
            get: function () { return _name; },
            set: function (value) {
                if (_name === value) return;
                _name = value;
                this.fireAppearanceChanged("name");
            },
            configurable: false
        });
        Object.defineProperty(this, "children", { get: function () { return _children.slice(0); }, configurable: false });
        Object.defineProperty(this, "screenSize", {
            get: function () {
                if (_isMaster)
                    return { width: _width, height: _height };
                return _master.screenSize;
            }, configurable: false
        });
        Object.defineProperty(this, "xDataTransform", { get: function () { return _xDataTransform; }, set: function (value) { _xDataTransform = value; this.onDataTransformChanged("x"); }, configurable: false });
        Object.defineProperty(this, "yDataTransform", { get: function () { return _yDataTransform; }, set: function (value) { _yDataTransform = value; this.onDataTransformChanged("y"); }, configurable: false });
        Object.defineProperty(this, "coordinateTransform",
            {
                get: function () { return _isMaster ? _coordinateTransform.clone() : _master.coordinateTransform; },
                configurable: false
            }
        );
        Object.defineProperty(this, "doFitOnDataTransformChanged",
          {
              get: function () { return _isMaster ? _doFitOnDataTransformChanged : _master.doFitOnDataTransformChanged; },
              set: function (value) {
                  if (_isMaster) {
                      _doFitOnDataTransformChanged = value;
                  } else {
                      _master.doFitOnDataTransformChanged = value;
                  }
              },
              configurable: false
          }
      );

        Object.defineProperty(this, "aspectRatio", {
            get: function () { return _isMaster ? _aspectRatio : _master.aspectRatio; },
            set: function (value) {
                if (_isMaster) {
                    _aspectRatio = value;
                    this.updateLayout();
                }
                else
                    _master.aspectRatio = value;
            },
            configurable: false
        });

        Object.defineProperty(this, "isAutoFitEnabled", {
            get: function () { return _isMaster ? _isAutoFitEnabled : _master.isAutoFitEnabled; },
            set: function (value) {
                if (_isMaster) {
                    if (_isAutoFitEnabled === value) return;
                    _isAutoFitEnabled = value;
                    if (_isAutoFitEnabled) {
                        this.requestUpdateLayout();
                    } else {
                        _plotRect = that.visibleRect;
                    }
                    this.host.trigger(InteractiveDataDisplay.Event.isAutoFitChanged);
                }
                else {
                    _master.isAutoFitEnabled = value;
                }
            },
            configurable: false
        });

        Object.defineProperty(this, "isVisible", {
            get: function () { return _isVisible; },
            set: function (value) {
                if (_isVisible === value) return;
                _isVisible = value;
                this.onIsVisibleChanged();
                this.fireVisibleChanged(this);
            },
            configurable: false
        });
        Object.defineProperty(this, "order", {
            get: function () { return _order; },
            set: function (value) {
                if (_order === value) return;
                _order = value;
            },
            configurable: false
        });

        Object.defineProperty(this, "visibleRect", {
            get: function () {
                if (_isMaster) {
                    return _coordinateTransform.getPlotRect({ x: 0, y: 0, width: _width, height: _height });
                }
                else {
                    return _master.visibleRect;
                }
            },
            configurable: false
        });


        var _mapControl = undefined;
        Object.defineProperty(this, "mapControl",
            {
                get: function () { return _isMaster ? _mapControl : _master.mapControl; },
                configurable: false
            }
        );

        var _tooltipSettings = undefined;
        Object.defineProperty(this, "tooltipSettings",
            {
                get: function () { return _isMaster ? _tooltipSettings : _master.tooltipSettings; },
                set: function (value) {
                    if (_isMaster) {
                        _tooltipSettings = value;
                    } else {
                        _master.tooltipSettings = value;
                    }
                },
                configurable: false
            }
        );

        var _isToolTipEnabled = true;
        Object.defineProperty(this, "isToolTipEnabled",
            {
                get: function () { return _isMaster ? _isToolTipEnabled : _master.isToolTipEnabled; },
                set: function (value) {
                    if (_isMaster) {
                        _isToolTipEnabled = value;
                    } else {
                        _master.isToolTipEnabled = value;
                    }
                },
                configurable: false
            }
        );

        Object.defineProperty(this, "titles",
            {
                get: function () { return $.extend({}, _titles); },

                // Allows to set titles for the plot's properties.
                // E.g. "{ color:'age' }" sets the 'age' title for the color data series.
                // Given titles are displayed in legends and tooltips.
                set: function (titles) {
                    this.setTitles(titles, false);
                }
            }
        );


        this.selfMapRefresh = function () {
            if (!_isMaster) {
                return;
            } else {
                if (this.map !== undefined) {
                    if (_mapControl !== undefined)
                        throw "Plot composition can have only 1 map!";
                    _mapControl = this.map;
                    this.requestUpdateLayout();
                }

                if (this.constraint) {
                    if (_constraint === undefined) {
                        _constraint = this.constraint;
                    }
                    else {
                        throw "Plot composition can have only 1 constraint function!";
                    }
                }
            }
        }

        // Returns a user-readable title for a property of a plot.
        // E.g. can return "age" for property "color".
        // If there is no user-defined title, returns the given property name as it is.
        this.getTitle = function (property) {
            if (typeof _titles !== "undefined" && typeof _titles[property] !== "undefined")
                return _titles[property];
            return property;
        }

        this.setTitles = function (titles, suppressFireAppearanceChanged) {
            _titles = titles;
            if (!suppressFireAppearanceChanged)
                this.fireAppearanceChanged();
        }

        // Uninitialize the plot (clears its input)
        this.destroy = function () {
            this.host.removeClass("idd-plot");
        };

        // Removes this plot from its master and physically destroys its host element.
        this.remove = function () {
            if (this.map !== undefined) {
                this.master.removeMap();
            }

            if(!this.isMaster)
                this.master.removeChild(this);
            this.firePlotRemoved(this);
            this.host.remove();
        };

        this.removeMap = function () {
            if (!_isMaster)
                return;
            else {
                _mapControl = undefined;
                _constraint = undefined;
                this.navigation.animation = new InteractiveDataDisplay.PanZoomAnimation();
                this.fitToView();
            }
        }

        //-------------------------------------------------------------------
        // Initialization of children

        // Adds a child to _children, fires the event and requests update.
        // (logical add)
        this.addChild = function (childPlot) {
            if (!childPlot) throw "Child plot is undefined";
            if (childPlot.master && (childPlot.master !== childPlot && childPlot.master !== this.master)) throw "Given child plot already added to another plot";
            if (childPlot.master !== this.master)
                childPlot.onAddedTo(this.master); // changing master 
            childPlot.order = childPlot.order == Number.MAX_SAFE_INTEGER ? childPlot.order : (InteractiveDataDisplay.Utils.getMaxOrder(this.master) + 1);
            if (childPlot.order < Number.MAX_SAFE_INTEGER) childPlot.host.css("z-index", childPlot.order);
            _children.push(childPlot);
            if (this.master._sharedCanvas) {
                this.master._sharedCanvas.remove();
                this.master._sharedCanvas = undefined;
            }

            if (childPlot.constraint) {
                if (_constraint === undefined) {
                    _constraint = childPlot.constraint;
                }
                else {
                    throw "Plot composition can have only 1 constraint function!";
                }
            }

            if (childPlot.map !== undefined) {
                if (_mapControl !== undefined)
                    throw "Plot composition can have only 1 map!";
                _mapControl = childPlot.map;
            }

            this.fireChildrenChanged({ type: "add", plot: childPlot });
            this.onChildrenChanged({ type: "add", plot: childPlot });
            this.requestUpdateLayout();
        };

        this.onChildrenChanged = function (arg) {
        };

        // The function is called when this plot is added(removed) to the new master.
        // It (recursively for its children) updates state.
        this.onAddedTo = function (master) {
            _master = master;
            _isMaster = this === master;
            var n = _children.length;
            for (; --n >= 0;) _children[n].onAddedTo(master);

            if (_isMaster) {
                div.addClass("idd-plot-master").removeClass("idd-plot-dependant");
            }
            else {
                div.removeClass("idd-plot-master").addClass("idd-plot-dependant");
            }
        };

        // Removes a child from this plot.
        // Argument plot is either the plot object or its name
        // Returns true if the plot was found and removed.
        // (locical remove)
        this.removeChild = function (plot) {
            if (!plot) throw 'plot is undefined';
            var child;
            var n = _children.length;
            for (; --n >= 0;) {
                child = _children[n];
                if (child === plot || child.name === plot) {
                    _children.splice(n, 1);
                    child.onAddedTo(child);

                    if (this.master._sharedCanvas) {
                        this.master._sharedCanvas.remove();
                        this.master._sharedCanvas = undefined;
                    }

                    if (child.constraint !== undefined) {
                        _constraint = undefined;
                    }

                    if (child.map !== undefined) {
                        _mapControl = undefined;
                    }

                    this.fireChildrenChanged({ type: "remove", plot: child });
                    this.onChildrenChanged({ type: "remove", plot: child });
                    this.requestUpdateLayout();
                    return true;
                }
            }
            n = _children.length;
            for (; --n >= 0;) {
                child = _children[n];
                if (child.removeChild(plot)) return true;
            }
            return false;
        };

        //Gets linear list of plots from hierarchy
        this.getPlotsSequence = function () {
            var plots = [that];
            var n = _children.length;
            for (var i = 0; i < n; i++) {
                var plot = _children[i];
                var plotSeq = plot.getPlotsSequence();
                plotSeq.forEach(function (cp) { plots.push(cp); });
            }
            return plots;
        };

        // Gets the bounds of inner content of this plot (excluding its children plots)
        // Returns a rectangle {x,y,width,height} in the plot plane (x,y is left-bottom, i.e. less point).
        // This should not be overriden in derived plot objects (caches previous bounding box).
        this.getLocalBounds = function (step, computedBounds) {
            if (!_localbbox)
                _localbbox = this.computeLocalBounds(step, computedBounds);
            return _localbbox;
        };

        // Computes bounds of inner content of this plot (excluding its children plots)
        // Returns a rectangle in the plot plane.
        // This should be overriden in derived plot objects.
        this.computeLocalBounds = function (step, computedBounds) {
            return undefined;
        };

        // Invalidates local bounding box stored in the cache.
        // To be called by derived plots.
        // Returns previous local bounding box.
        this.invalidateLocalBounds = function () {
            var bb = _localbbox;
            _localbbox = undefined;
            return bb;
        };

        var getChildrenBounds = function () {
            var bounds = undefined;
            var plotsWithUndefinedBounds = [];
            var n = _children.length;
            for (var i = 0; i < n; i++) {
                var plot = _children[i];
                var plotBounds = plot.aggregateBounds().bounds;
                bounds = InteractiveDataDisplay.Utils.unionRects(bounds, plotBounds);
            }
        };

        // Aggregates all bounds of this plot and its children plots
        // Returns a rectangle in the plot plane.
        this.aggregateBounds = function () {

            var plots = that.getPlotsSequence();
            var bounds = undefined;

            //First path: calculating static plot rects
            var undefinedBBPlots = [];
            var n = plots.length;
            for (var i = 0; i < n; i++) {
                var plot = plots[i];
                var plotBounds = plot.getLocalBounds(1);
                if (plotBounds === undefined) {
                    undefinedBBPlots.push(plot);
                } else {
                    bounds = InteractiveDataDisplay.Utils.unionRects(bounds, plotBounds);
                }
            }

            //Second path: calculating final plot rect
            n = undefinedBBPlots.length;
            var firstStepBounds = bounds;
            for (var i = 0; i < n; i++) {
                var plot = undefinedBBPlots[i];
                //On second step plot should return input bounds or extend them with itself bounds
                bounds = InteractiveDataDisplay.Utils.unionRects(bounds, plot.getLocalBounds(2, firstStepBounds));
            }

            if (bounds !== undefined) {
                var boundsWidthConstant = 100;
                if (bounds.width === 0) {
                    var absX = Math.max(0.1, Math.abs(bounds.x));
                    bounds.x = bounds.x - absX / (2 * boundsWidthConstant);
                    bounds.width = absX / boundsWidthConstant;
                }
                if (bounds.height === 0) {
                    var absY = Math.max(0.1, Math.abs(bounds.y));
                    bounds.y = bounds.y - absY / (2 * boundsWidthConstant);
                    bounds.height = absY / boundsWidthConstant;
                }
            }

            var isDefault = _isMaster && bounds === undefined;
            if (isDefault) {
                if (_mapControl !== undefined) {
                    bounds = { x: -180, y: -90, width: 360, height: 2 * 90 };
                } else {
                    bounds = { x: 0, y: 0, width: 1, height: 1 };
                }
            }
            return { bounds: bounds, isDefault: isDefault };
        };

        // Computes padding of inner content of this plot
        // Returns 4 margins in the screen coordinate system
        // This should be overriden in derived plot objects.
        this.getLocalPadding = function () {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        };

        // Aggregates padding of both content of this plot and its children plots
        // Returns 4 margins in the plot plane coordinate system
        this.aggregatePadding = function () {
            var padding = that.getLocalPadding() || { left: 0, right: 0, top: 0, bottom: 0 };
            var n = _children.length;
            for (var i = 0; i < n; i++) {
                var plot = _children[i];
                var plotPadding = plot.aggregatePadding();
                padding = {
                    left: Math.max(padding.left, plotPadding.left),
                    right: Math.max(padding.right, plotPadding.right),
                    top: Math.max(padding.top, plotPadding.top),
                    bottom: Math.max(padding.bottom, plotPadding.bottom)
                };
            }
            padding.left = padding.left + InteractiveDataDisplay.Padding || InteractiveDataDisplay.Padding;
            padding.right = padding.right + InteractiveDataDisplay.Padding || InteractiveDataDisplay.Padding;
            padding.top = padding.top + InteractiveDataDisplay.Padding || InteractiveDataDisplay.Padding;
            padding.bottom = padding.bottom + InteractiveDataDisplay.Padding || InteractiveDataDisplay.Padding;
            return padding;
        };

        //-------------------------------------------------------------------------
        // Layout and Rendering

        // Makes children plots to render (recursive).
        // If renderAll is false, renders only plots with the property requestsRender set to true.
        var updatePlotsOutput = function () {
            if (_master.flatRendering) { // flat rendering mode
                renderAll = true;
                if (_master._sharedCanvas) {
                    _master._sharedCanvas._dirty = true;
                }
            }
            if (that.requestsUpdateLayout) {
                that.requestsUpdateLayout = false;
                that.isAnimationFrameRequested = false;

                renderAll = true;
                that.updateLayout();
            } else {
                that.isAnimationFrameRequested = false;

                var screenSize = that.screenSize;
                var plotRect = that.coordinateTransform.getPlotRect({ x: 0, y: 0, width: screenSize.width, height: screenSize.height }); // (x,y) is left/top            
                // rectangle in the plot plane which is visible, (x,y) is left/bottom (i.e. less) of the rectangle

                updatePlotsOutputRec(renderAll, _master, plotRect, screenSize);
            }
            renderAll = false;

            if (_updateTooltip) _updateTooltip();
        };

        var updatePlotsOutputRec = function (renderAll, plot, plotRect, screenSize) {
            if (!plot || !plot.isVisible) return;

            if (renderAll || plot.requestsRender) {
                plot.requestsRender = false;
                plot.render(plotRect, screenSize);
            }
            var children = plot.children;
            var n = children.length;
            for (var i = 0; i < n; i++) {
                var child = children[i];
                updatePlotsOutputRec(renderAll, child, plotRect, screenSize);
            }
        };

        // When called, notifies that the given plot needs another render call at the next frame 
        // (to allow other system events to be handled between the renders).
        this.requestNextFrame = function (plot) {
            plot = plot || this;
            if (!_isMaster) {
                _master.requestNextFrame(plot);
                return;
            }
            plot.requestsRender = true;
            if (this.isAnimationFrameRequested) return;
            this.isAnimationFrameRequested = true;
            renderAll = false;
            InteractiveDataDisplay.Utils.requestAnimationFrame(updatePlotsOutput);
        };

        this.requestUpdateLayout = function (settings) {
            if (!_isMaster) {
                _master.requestUpdateLayout(settings);
                return;
            }
            renderAll = true;
            _suppressNotifyBoundPlots = settings && settings.suppressNotifyBoundPlots;
            if (this.requestsUpdateLayout) return;
            this.requestsUpdateLayout = true;
            if (this.isAnimationFrameRequested) return; // we use already set time out
            this.isAnimationFrameRequested = true; // because update layout includes rendering of all objects
            InteractiveDataDisplay.Utils.requestAnimationFrame(updatePlotsOutput);
        };

        this.onIsVisibleChanged = function () {
            this.updateLayout();
        };

        this.onDataTranformChangedCore = function (arg) {
        };

        this.onDataTransformChanged = function (arg) {
            _localbbox = undefined;
            this.onDataTranformChangedCore(arg);
            if (this.isAutoFitEnabled)
                this.master.requestUpdateLayout();
            else if (this.doFitOnDataTransformChanged)
                this.master.fitToView();
            //this.master.requestNextFrame(this);
        };

        // Updates output of this plot using the current coordinate transform and screen size.
        // plotRect     {x,y,width,height}  Rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
        // screenSize   {width,height}      Size of the output region to render inside
        // Returns true, if the plot actually has rendered something; otherwise, returns false.
        this.render = function (plotRect, screenSize) {
            var localbb = this.getLocalBounds(); //  {x,y,width,height}
            var nowIsRendered = false;

            // if localbb is undefined, plot is infinite and it is ready to render in any given region
            if (localbb) // has content to render
            {
                var intersection = InteractiveDataDisplay.Utils.intersect(localbb, plotRect); //  {x,y,width,height}
                if (intersection)  // visible
                {
                    this.renderCore(plotRect, screenSize);
                    nowIsRendered = true;

                    //var ct = this.coordinateTransform;
                    //var iw = ct.plotToScreenWidth(intersection.width);
                    //var ih = ct.plotToScreenHeight(intersection.height);
                    //if (iw >= InteractiveDataDisplay.MinSizeToShow && ih >= InteractiveDataDisplay.MinSizeToShow) // not too small
                    //{
                    //    doRender = true;
                    //}
                }

            } else {
                this.renderCore(plotRect, screenSize);
                nowIsRendered = true;
            }
            if (nowIsRendered !== _isRendered) {
                _isRendered = nowIsRendered;
                this.onIsRenderedChanged(); // todo: trigger event
            }
        };

        // Updates output of this plot using the current coordinate transform and screen size.
        // plotRect     {x,y,width,height}  Rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
        // screenSize   {width,height}      Size of the output region to render inside
        // This method should be implemented by derived plots.
        this.renderCore = function (plotRect, screenSize) {
        };
        
        /// Renders the plot to the svg and returns the svg object.
        this.exportToSvg = function() {
            if(!SVG.supported) throw "SVG is not supported";
            
            var screenSize = that.screenSize;
            var plotRect = that.coordinateTransform.getPlotRect({ x: 0, y: 0, width: screenSize.width, height: screenSize.height });
            
            var svgHost = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            var svg = SVG(svgHost).size(_host.width(), _host.height());
            that.exportContentToSvg(plotRect, screenSize, svg);
            return svg;            
        };
        
        this.exportContentToSvg = function(plotRect, screenSize, svg) {
            var plots = this.getPlotsSequence();
            for(var i = 0; i < plots.length; i++){
                plots[i].renderCoreSvg(plotRect, screenSize, svg);
            }
        };
        
        // Renders this plot to svg using the current coordinate transform and screen size.
        // plotRect     {x,y,width,height}  Rectangle in the plot plane which is visible, (x,y) is left/bottom of the rectangle
        // screenSize   {width,height}      Size of the output region to render inside
        // This method should be implemented by derived plots.
        this.renderCoreSvg = function (plotRect, screenSize, svg) {
        };

        // Notifies derived plots that isRendered changed.
        // todo: make an event and bind in the derived plots
        this.onIsRenderedChanged = function () {
        };

        this.fit = function (screenSize, finalPath, plotScreenSizeChanged) {
            _width = screenSize.width;
            _height = screenSize.height;

            var outputRect = undefined;

            if (_isAutoFitEnabled || _requestFitToView) {
                var aggregated = _master.aggregateBounds();
                var bounds = aggregated.bounds;
                if (bounds.x != bounds.x || bounds.y != bounds.y || bounds.width != bounds.width || bounds.height != bounds.height)
                    bounds = { x: 0, width: 1, y: 0, height: 1 }; // todo: this is an exceptional situation which should be properly handled
                _plotRect = bounds;
                var padding = aggregated.isDefault ? { left: 0, top: 0, bottom: 0, right: 0 } : _master.aggregatePadding();
                _coordinateTransform = InteractiveDataDisplay.Utils.calcCSWithPadding(_plotRect, screenSize, padding, _master.aspectRatio);


                outputRect = _coordinateTransform.getPlotRect({ x: 0, y: 0, width: screenSize.width, height: screenSize.height });

                if (_constraint !== undefined && finalPath === true) {
                    outputRect = _constraint(outputRect, screenSize);
                    _coordinateTransform = new InteractiveDataDisplay.CoordinateTransform(outputRect, { left: 0, top: 0, width: _width, height: _height }, _master.aspectRatio);
                }
            }
            else {
                var paddingX = undefined;
                var paddingY = undefined;
                var aggregatedPadding = undefined;
                var aggregated = undefined;

                if (_requestFitToViewX === true || _requestFitToViewY === true) {
                    aggregated = _master.aggregateBounds();
                    aggregatedPadding = aggregated.isDefault ? { left: 0, top: 0, bottom: 0, right: 0 } : _master.aggregatePadding();
                }

                if (_requestFitToViewX === true) {
                    _plotRect.width = aggregated.bounds.width;
                    _plotRect.x = aggregated.bounds.x;
                    paddingX = aggregated.isDefault ? { left: 0, top: 0, bottom: 0, right: 0 } : aggregatedPadding;
                }

                if (_requestFitToViewY === true) {
                    _plotRect.height = aggregated.bounds.height;
                    _plotRect.y = aggregated.bounds.y;
                    paddingY = aggregated.isDefault ? { left: 0, top: 0, bottom: 0, right: 0 } : aggregatedPadding;
                }

                var padding = undefined;
                if (paddingX !== undefined || paddingY !== undefined) {
                    padding = {
                        left: paddingX !== undefined ? paddingX.left : 0,
                        top: paddingY !== undefined ? paddingY.top : 0,
                        bottom: paddingY !== undefined ? paddingY.bottom : 0,
                        right: paddingX !== undefined ? paddingX.right : 0
                    }
                }

                if (padding !== undefined) {
                    _coordinateTransform = InteractiveDataDisplay.Utils.calcCSWithPadding(_plotRect, screenSize, padding, _master.aspectRatio);
                } else {
                    _coordinateTransform = new InteractiveDataDisplay.CoordinateTransform(_plotRect, { left: 0, top: 0, width: _width, height: _height }, _master.aspectRatio);
                }

                outputRect = _coordinateTransform.getPlotRect({ x: 0, y: 0, width: screenSize.width, height: screenSize.height });

                if (_constraint !== undefined && finalPath === true && plotScreenSizeChanged === true) {
                    outputRect = _constraint(outputRect, screenSize);
                    _coordinateTransform = new InteractiveDataDisplay.CoordinateTransform(outputRect, { left: 0, top: 0, width: _width, height: _height }, _master.aspectRatio);
                }

                _plotRect = outputRect;
            }

            if (finalPath) {
                _plotRect = outputRect;
            }
            return outputRect;
        };

        // Makes layout of all children elements of the plot and invalidates the plots' images.
        this.updateLayout = function () {
            this.requestsUpdateLayout = false;
            if (_isMaster) {

                var oldVisibleRect = that.visibleRect;
                var screenSize = { width: _host.width(), height: _host.height() };

                if (screenSize.width <= 1 || screenSize.height <= 1)
                    return;

                var plotScreenSizeChanged = that.screenSize.width !== screenSize.width || that.screenSize.height !== screenSize.height;

                var finalSize = this.measure(screenSize, plotScreenSizeChanged);
                _requestFitToView = false;
                _requestFitToViewX = false;
                _requestFitToViewY = false;
                that.arrange(finalSize);

                var newVisibleRect = that.visibleRect;
                if (newVisibleRect.x !== oldVisibleRect.x || newVisibleRect.y !== oldVisibleRect.y || newVisibleRect.width !== oldVisibleRect.width || newVisibleRect.height !== oldVisibleRect.height) {
                    that.fireVisibleRectChanged({ visibleRect: newVisibleRect });
                }

                renderAll = true;
                updatePlotsOutput();

                // Notifying bound plots about new visible rectangle
                if (!_suppressNotifyBoundPlots) {
                    var boundPlots = InteractiveDataDisplay.Binding.getBoundPlots(this);
                    var lengthH = boundPlots.h.length;
                    var lengthV = boundPlots.v.length;
                    if (lengthH > 0 || lengthV > 0) {
                        var plotRect = that.coordinateTransform.getPlotRect({ x: 0, y: 0, width: finalSize.width, height: finalSize.height }); // (x,y) is left/top            
                        boundPlots.v = boundPlots.v.slice(0);

                        // h or vh
                        for (var i = 0; i < lengthH; i++) {
                            var p = boundPlots.h[i];
                            var j = boundPlots.v.indexOf(p);
                            if (j >= 0) { // both v & h
                                boundPlots.v[j] = null; // already handled                            
                                p.navigation.setVisibleRect(plotRect, false, { suppressNotifyBoundPlots: true });
                            } else {
                                // binds only horizontal range
                                var exRect = p.visibleRect;
                                exRect.x = plotRect.x;
                                exRect.width = plotRect.width;
                                p.navigation.setVisibleRect(exRect, false, { suppressNotifyBoundPlots: true });
                            }
                        }

                        // just v
                        for (var i = 0; i < lengthV; i++) {
                            var p = boundPlots.v[i];
                            if (p == null) continue; // vh
                            // binds only vertical range
                            var exRect = p.visibleRect;
                            exRect.y = plotRect.y;
                            exRect.height = plotRect.height;
                            p.navigation.setVisibleRect(exRect, false, { suppressNotifyBoundPlots: true });
                        }
                    }
                }
                _suppressNotifyBoundPlots = false;
            }
            else {
                _master.updateLayout();
            }
        };

        this.measure = function (availibleSize, plotScreenSizeChanged) {

            if (this.mapControl !== undefined) {
                this.mapControl.setOptions({ width: availibleSize.width, height: availibleSize.height });
            }

            this.fit(availibleSize, true, plotScreenSizeChanged);

            if (_host) {
                _host.children("div")
                    .each(function () {
                        var jqElem = $(this); // refers the child DIV
                        jqElem.css("top", 0);
                        jqElem.css("left", 0);
                    });
            };

            return availibleSize;
        };

        this.arrange = function (finalRect) {
            if (!this.isMaster)
                InteractiveDataDisplay.Utils.arrangeDiv(this.host, finalRect);
            var myChildren = this.children;
            var n = myChildren.length;
            for (var i = 0; i < n; i++) {
                var dependant = myChildren[i];
                dependant.arrange(finalRect);
            }
        };

        // Requests to set the desired plot rect.
        // Can suppress notifications for bound plots to avoid echo.
        // Must be called by master plots.
        var setVisibleRegion = function (plotRect, settings) {
            if (that.isAutoFitEnabled) {
                that.isAutoFitEnabled = false;
            }


            _plotRect = plotRect;

            if (settings !== undefined && settings.syncUpdate !== undefined && settings.syncUpdate === true) {
                that.updateLayout();
            } else {
                that.requestUpdateLayout(settings);
            }
        };

        //Disables IsAutoFitEnabled and fits all visible objects into screen with padding
        this.fitToView = function () {
            if (!_isMaster) {
                _master.fitToView();
            }
            else {
                this.isAutoFitEnabled = false;
                this.navigation.stop();

                _requestFitToView = true;
                this.requestUpdateLayout();
            }
        };

        this.fitToViewX = function () {
            if (!_isMaster) {
                _master.fitToViewX();
            }
            else {
                this.isAutoFitEnabled = false;
                this.navigation.stop();

                _requestFitToViewX = true;
                this.requestUpdateLayout();
            }
        };

        this.fitToViewY = function () {
            if (!_isMaster) {
                _master.fitToViewY();
            }
            else {
                this.isAutoFitEnabled = false;
                this.navigation.stop();

                _requestFitToViewY = true;
                this.requestUpdateLayout();
            }
        };

        // If auto fit is on and bound box changed, updates the layout; otherwise, requests next frame for this plot.
        // This method should be called from derived plots to efficiently update output.
        this.requestNextFrameOrUpdate = function () {
            if (this.isAutoFitEnabled)
                this.master.requestUpdateLayout();
            else
                this.master.requestNextFrame(this);
        };

        //------------------------------------------------------------------------------------
        // Mouse & tooltips

        // Implementation of this method for a particular plot should build and return
        // a tooltip element for the point (xd,yd) in data coordinates, and (xp, yp) in plot coordinates.
        // Method returns <div> element or undefined
        var foreachDependentPlot = function (plot, f) {
                var myChildren = plot.children;
                var n = myChildren.length;
                for (var i = 0; i < n; i++) {
                    var child = myChildren[i];
                    foreachDependentPlot(child, f);
                }
                f(plot);
        };
        this.getTooltip = function (xd, yd, xp, yp) {
            return undefined;
        };

        if (_isMaster) {
            var _tooltipTimer; // descriptor of the set timer to show the tooltip
            var _tooltip; // <div> element which displays the tooltip
            var _updateTooltip;

            this.enumAll = function (plot, f) {
                foreachDependentPlot(plot, f);
            };



            // Callback function which is called by the tooltip timer
            var onShowTooltip = function (origin_s, origin_p) {
                _tooltipTimer = undefined;
                clearTooltip();

                var getElements = function () {
                    var tooltips = [];
                    var xd, yd;
                    var px = origin_p.x, py = origin_p.y;

                    foreachDependentPlot(that, function (child) {
                        var my_xd = child.xDataTransform ? child.xDataTransform.plotToData(px) : px;
                        var my_yd = child.yDataTransform ? child.yDataTransform.plotToData(py) : py;

                        var myTooltip = child.getTooltip(my_xd, my_yd, px, py);
                        if (myTooltip) {
                            if (my_xd !== xd || my_yd !== yd) {
                                xd = my_xd;
                                yd = my_yd;

                                var formatter1 = new InteractiveDataDisplay.AdaptiveFormatter(_master.visibleRect.x, _master.visibleRect.x + _master.visibleRect.width);
                                var formatter2 = new InteractiveDataDisplay.AdaptiveFormatter(_master.visibleRect.y, _master.visibleRect.y + _master.visibleRect.height);
                                if (_tooltipSettings === undefined || _tooltipSettings.showCursorCoordinates !== false)
                                    tooltips.push("<div class='idd-tooltip-coordinates'>" + formatter1.toString(xd) + ", " + formatter2.toString(yd) + "</div>");
                            }
                            tooltips.push(myTooltip);
                        }
                    });
                    return tooltips;
                }

                var tooltips = getElements();
                if (tooltips.length === 0) return;

                _tooltip = $("<div></div>")
                    .addClass("idd-tooltip")
                    .hide()
                    .appendTo(that.host)
                    .css("position", "absolute")
                    .css("left", origin_s.x + 15)
                    .css("top", origin_s.y + 15)
                    .css("z-index", InteractiveDataDisplay.ZIndexTooltipLayer);
                var n = tooltips.length;
                for (var i = 0; i < n; i++) {
                    $(tooltips[i]).appendTo(_tooltip).addClass("idd-tooltip-item");
                }

                // Building content of the tooltip:
                _updateTooltip = function () {
                    if (!_tooltip) return;
                    _tooltip.empty();

                    var tooltips = getElements();
                    if (tooltips.length === 0) return 0;

                    var n = tooltips.length;
                    for (var i = 0; i < n; i++) {
                        $(tooltips[i]).appendTo(_tooltip).addClass("idd-tooltip-item");
                    }
                    return n;
                }

                var localTooltip = _tooltip;
                _tooltip.fadeIn('fast', function () {
                    localTooltip.fadeOutTimer = setTimeout(function () {
                        _updateTooltip = undefined;
                        localTooltip.fadeOut('fast');
                    }, InteractiveDataDisplay.TooltipDuration * 1000);
                });
            };

            var clearTooltip = function () {
                if (_tooltipTimer) {
                    clearTimeout(_tooltipTimer);
                    _tooltipTimer = undefined;
                }
                _updateTooltip = undefined;
                if (_tooltip) {
                    if (_tooltip.fadeOutTimer) {
                        clearTimeout(_tooltip.fadeOutTimer);
                        _tooltip.fadeOutTimer = undefined;
                    }
                    _tooltip.fadeOut('fast', function () { $(this).remove(); });
                    _tooltip = undefined;
                }
            };

            _centralPart.mousemove(function (event) {
                mouseDownPoint = undefined;
                var originHost = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(_host, event);
                var originCentralPart = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(_centralPart, event);
                var ct = that.coordinateTransform;
                var p = { // plot coordinates of the event
                    x: ct.screenToPlotX(originCentralPart.x),
                    y: ct.screenToPlotY(originCentralPart.y)
                };

                clearTooltip();

                if (that.master.isToolTipEnabled) {
                    _tooltipTimer = setTimeout(function () { onShowTooltip(originHost, p); }, InteractiveDataDisplay.TooltipDelay * 1000);
                }

                var onmousemove_rec = function (plot, origin_s, origin_p) {
                    if (plot.onMouseMove) {
                        plot.onMouseMove(origin_s, origin_p);
                    }
                    var children = plot.children;
                    var n = children.length;
                    for (var i = 0; i < n; i++) {
                        onmousemove_rec(children[i], origin_s, origin_p);
                    }
                };
                onmousemove_rec(that, originCentralPart, p);
            });

            var mouseDownPoint;
            _centralPart.mousedown(function (event) {
                clearTooltip();

                mouseDownPoint = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(_centralPart, event);
            });

            _centralPart.mouseup(function (event) {
                clearTooltip();

                var origin = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(_centralPart, event);
                if (!mouseDownPoint || mouseDownPoint.x != origin.x || mouseDownPoint.y != origin.y) return;
                var ct = that.coordinateTransform;
                var p = { // plot coordinates of the event
                    x: ct.screenToPlotX(origin.x),
                    y: ct.screenToPlotY(origin.y)
                };

                var onclick_rec = function (plot, origin_s, origin_p) {
                    if (plot.onClick) {
                        plot.onClick(origin_s, origin_p);
                    }
                    var children = plot.children;
                    var n = children.length;
                    for (var i = 0; i < n; i++) {
                        onclick_rec(children[i], origin_s, origin_p);
                    }
                };
                onclick_rec(that, origin, p);
            });

            _centralPart.mouseleave(function (event) {
                clearTooltip();
            });
        }
        else {
            this.enumAll = _master.enumAll;
        }

        //------------------------------------------------------------------------------------
        // Other API

        // Gets the plot object with the given name.
        // If plot is not found, returns undefined.
        this.get = function (p) {
            var getrec = function (p, plot) {
                if (plot.name === p || plot.host[0].id === p || plot.host[0] === p) return plot;

                var children = plot.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var res = getrec(p, children[i]);
                    if (res) return res;
                }

                return undefined;
            };
            return getrec(p, this.master);
        };

        // fires the AppearanceChanged event
        this.fireAppearanceChanged = function (propertyName) {
            this.host.trigger(InteractiveDataDisplay.Event.appearanceChanged, propertyName);
        };

        // fires the ChildrenChanged event
        this.fireChildrenChanged = function (propertyParams) {
            this.master.host.trigger(InteractiveDataDisplay.Event.childrenChanged, propertyParams);
        };

        // fires the VisibleRect event
        this.fireVisibleRectChanged = function (propertyParams) {
            clearTooltip();
            this.master.host.trigger(InteractiveDataDisplay.Event.visibleRectChanged, propertyParams);
        };

        this.fireVisibleChanged = function (propertyParams) {
            this.host.trigger(InteractiveDataDisplay.Event.isVisibleChanged, propertyParams);
        };
        this.firePlotRemoved = function (propertyParams) {
            this.host.trigger(InteractiveDataDisplay.Event.plotRemoved, propertyParams);
            foreachDependentPlot(propertyParams, function (child) {
                child.host.trigger(InteractiveDataDisplay.Event.plotRemoved, child);
            });
        };
        this.fireOrderChanged = function (propertyParams) {
            this.host.trigger(InteractiveDataDisplay.Event.orderChanged, propertyParams);
        };
        //--------------------------------------------------------------------------------------
        // Plot factories

        // If this plot has no child plot with given name, it is created from the data;
        // otherwise, existing plot is updated.
        this.polyline = function (name, data) {
                var plot = this.get(name);
                if (!plot) {
                    var div = $("<div></div>")
                               .attr("data-idd-name", name)
                             //  .attr("data-idd-plot", "polyline")
                               .appendTo(this.host);
                    plot = new InteractiveDataDisplay.Polyline(div, this.master);
                    this.addChild(plot);
            }
            if (data !== undefined) {
                plot.draw(data);
            }
            return plot;
        };

        this.markers = function (name, data, titles) {
            var plot = this.get(name);
            if (!plot) {
                var div = $("<div></div>")
                           .attr("data-idd-name", name)
                           .appendTo(this.host);
                plot = new InteractiveDataDisplay.Markers(div, this.master);
                this.addChild(plot);
            }
            if (data !== undefined) {
                plot.draw(data, titles);
            }

            return plot;
        };

        this.area = function (name, data) {
            var plot = this.get(name);
            if (!plot) {
                var div = $("<div></div>")
                           .attr("data-idd-name", name)
                          // .attr("data-idd-plot", "area")
                           .appendTo(this.host);
                plot = new InteractiveDataDisplay.Area(div, this.master);
                this.addChild(plot);
            }
            if (data !== undefined) {
                plot.draw(data);
            }

            return plot;
        };

        this.heatmap = function (name, data, titles) {
            var plot = this.get(name);
            if (!plot) {
                var div = $("<div></div>")
                           .attr("data-idd-name", name)
                         //  .attr("data-idd-plot", "heatmap")
                           .appendTo(this.host);
                plot = new InteractiveDataDisplay.Heatmap(div, this.master);
                this.addChild(plot);
            }
            if (data !== undefined) {
                plot.draw(data, titles);
            }
            return plot;
        };

        //------------------------------------------------------------------------------
        //Navigation
        if (_isMaster) {
            //Initializing navigation
            var _navigation = new InteractiveDataDisplay.Navigation(this, setVisibleRegion);
        }

        Object.defineProperty(this, "navigation", { get: function () { if (_isMaster) return _navigation; else return _master.navigation; }, configurable: false });


        //-------------------------------------------------------------------
        // Initialization of children

        // Looking for children of this master plot (builds collection _children)
        if (_host) {
            _host.children("div")
                .each(function () {
                    var jqElem = $(this); // refers the child DIV
                    if(!jqElem.hasClass("idd-plot-master") && !jqElem.hasClass("idd-plot-dependant") && jqElem.attr("data-idd-plot") !== undefined && jqElem.attr("data-idd-plot") !== "figure" && jqElem.attr("data-idd-plot") !== "chart") { // it shouldn't be initialized and it shouldn't be a master plot (e.g. a figure)
                        that.addChild(initializePlot(jqElem, _master)); // here children of the new child will be initialized recursively
                    }
            });
        }

        //------------------------------------------------------------------------
        // Legend
        this.getLegend = function () {
            return undefined;
        };
        setTimeout(function () {
            if (_host && _host.attr("data-idd-legend")) {
                var legendDiv = $("#" +_host.attr("data-idd-legend"));
                var _legend = new InteractiveDataDisplay.Legend(that, legendDiv, true);
                Object.defineProperty(that, "legend", { get: function () { return _legend; }, configurable: false });

                //Stop event propagation
                InteractiveDataDisplay.Gestures.FullEventList.forEach(function (eventName) {
                    legendDiv[0].addEventListener(eventName, function (e) {
                        e.stopPropagation();
                    }, false);
                });
            }
        }, 0);

        this.updateOrder = function (elem, isPrev) {
            if (elem) InteractiveDataDisplay.Utils.reorder(this, elem, isPrev);
            if (!_isFlatRenderingOn) {
                var plots = InteractiveDataDisplay.Utils.enumPlots(_master);
                for (var i = 0; i < plots.length; i++) {
                    if (plots[i].order < Number.MAX_SAFE_INTEGER) plots[i].host.css('z-index', plots[i].order);
                }
            }
            if (elem) this.fireOrderChanged();
        };

        if (div) {
            if (_isMaster) {
                if (div.attr("data-idd-plot") !== 'figure' && div.attr("data-idd-plot") !== 'chart')
                    this.updateLayout();
                div.addClass("idd-plot-master");
        }
        else {
            div.addClass("idd-plot-dependant");
            }
        }
    };

    var _plotLegends = [];
    //Legend with hide/show function
    InteractiveDataDisplay.Legend = function (_plot, _jqdiv, isCompact) {

        var plotLegends = [];
        var divStyle = _jqdiv[0].style;

        var _isVisible = true;
        Object.defineProperty(this, "isVisible", {
            get: function () { return _isVisible; },
            set: function (value) {
                _isVisible = value;
                if (_isVisible) divStyle.display = "block";
                else divStyle.display = "none";
            },
            configurable: false
        });

        if (isCompact) _jqdiv.addClass("idd-legend-compact");
        else _jqdiv.addClass("idd-legend");
        _jqdiv.addClass("unselectable");
        if (!isCompact) {
            _jqdiv.sortable({ axis: 'y' });
            _jqdiv.on("sortupdate", function (e, ui) {
                var name = ui.item.data('plot'); //name of plot what's card was moved
                var targetIndex;
                var next_elem, prev_elem;
                $("li", _jqdiv).each(function (idx, el) {
                    if (name == $(el).data('plot')) {
                        targetIndex = idx;
                        prev_elem = ($(el)).prev().data('plot');
                        next_elem = ($(el).next()).data('plot');
                        return false;
                    }
                });//found new index of moved element
                for (var i = 0; i < plotLegends.length; ++i) {
                    if (plotLegends[i].plot == name) {
                        if (next_elem) {
                            for (var j = 0; j < plotLegends.length; ++j) {
                                if (plotLegends[j].plot == next_elem) {
                                    plotLegends[i].plot.updateOrder(plotLegends[j].plot);
                                    break;
                                }
                            }
                        }
                        else {
                            for (var j = 0; j < plotLegends.length; ++j) {
                                if (plotLegends[j].plot == prev_elem) {
                                    plotLegends[i].plot.updateOrder(plotLegends[j].plot, true);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            });
        }
        
        var createLegend = function () {
            _jqdiv.empty();
            for (var i = 0, len = plotLegends.length; i < len; i++) {
                removeLegend(plotLegends[i]);
            }
            _plot.host.unbind('childrenChanged', childrenChangedHandler);
            plotLegends = [];
            var plots = InteractiveDataDisplay.Utils.enumPlots(_plot);
            for (var i = 0; i < plots.length; i++) {
                createLegendForPlot(plots[plots.length - i - 1]);
            }
            if (_jqdiv[0].hasChildNodes() && _isVisible) {
                divStyle.display = "block";
            }
        };
    
        var addVisibilityCheckBox = function (div, plot) {
            var cbx = $("<div></div>").addClass("idd-legend-isselected-false").appendTo(div);
            if (plot.isVisible) cbx.attr("class", "idd-legend-isselected-false");
            else cbx.attr("class", "idd-legend-isselected-true");
            cbx.click(function (e) {
                e.stopPropagation();
                if (plot.isVisible) {
                    cbx.attr("class", "idd-legend-isselected-true");
                    plot.isVisible = false;
                } else {
                    cbx.attr("class", "idd-legend-isselected-false");
                    plot.isVisible = true;
                }
            });
        };

        var removeLegend = function (legend) {
            for (var i = 0; i < _plotLegends.length; i++) {
                if (_plotLegends[i] == legend) {
                    _plotLegends.splice(i, 1);
                    break;
                }
            }
        };
        var childrenChangedHandler = function (event, params) {

            if (params.type === "add" && _jqdiv[0].hasChildNodes() && params.plot.master == _plot.master) {
                createLegendForPlot(params.plot);
            }
            else if (params.type === "remove") {
                var removeLegendItem = function (i) {
                    var legend = plotLegends[i];
                    plotLegends.splice(i, 1);
                    removeLegend(legend);
                    legend.plot.host.unbind("childrenChanged", childrenChangedHandler);
                    legend.plot.host.unbind("visibleChanged", visibleChangedHandler);
                    if (legend.onLegendRemove) legend.onLegendRemove();
                    legend[0].innerHTML = "";
                    if (isCompact) legend.removeClass("idd-legend-item-compact");
                    else legend.removeClass("idd-legend-item");
                    _jqdiv[0].removeChild(legend[0]);
                    var childDivs = legend.plot.children;
                    childDivs.forEach(function (childPlot) {
                        for (var j = 0, len = plotLegends.length; j < len; j++)
                            if (plotLegends[j].plot === childPlot) {
                                removeLegendItem(plotLegends[j]);
                            }
                    });
                    $(legend[0]).css( "display", "none" );
                    if (plotLegends.length == 0) divStyle.display = "none";
                };

                for (var i = 0, len = plotLegends.length; i < len; i++)
                    if (plotLegends[i].plot === params.plot) {
                        removeLegendItem(i);
                        break;
                    }
            }
            else {
                _jqdiv[0].innerHTML = "";
                divStyle.display = "none";
                len = plotLegends.length;
                for (i = 0; i < len; i++) {
                    removeLegend(plotLegends[i]);
                    plotLegends[i].plot.host.unbind("childrenChanged", childrenChangedHandler);
                    if (plotLegends[i].onLegendRemove) plotLegends[i].onLegendRemove();
                    plotLegends[i][0].innerHTML = "";
                    if (isCompact) plotLegends[i].removeClass("idd-legend-item-compact");
                    else plotLegends[i].removeClass("idd-legend-item");
                }
                plotLegends = [];
              
                createLegend();
            }
        };
        var orderChangedHandler = function (event, params) {
            createLegend();
        };
        var plotRemovedHandler = function (event, params) {
            if (_plot == params) _jqdiv.remove();
        };
        var visibleChangedHandler = function (event, params) {
            var updateLegendItem = function (i, isVisible) {
                var legend = _plotLegends[i];
                if (isVisible) legend[0].firstElementChild.lastElementChild.setAttribute("class", "idd-legend-isselected-false");
                else legend[0].firstElementChild.lastElementChild.setAttribute("class", "idd-legend-isselected-true");
            };

            for (var i = 0, len = _plotLegends.length; i < len; i++)
                if (_plotLegends[i].plot === params) {
                    updateLegendItem(i, params.isVisible);
                }
        }; 
        var createLegendForPlot = function (plot) {
            var legend = plot.getLegend();
            //change getLegend
            plot.host.bind("visibleChanged", visibleChangedHandler);
            plot.host.bind("childrenChanged", childrenChangedHandler);
            if (legend) {
                var div = (isCompact) ? $("<div class='idd-legend-item-compact'></div>") : $("<li class='idd-legend-item'></li>");
                if (!isCompact) div.data("plot", plot);
                var title = (isCompact) ? $("<div class='idd-legend-item-title-compact'></div>") : $("<div class='idd-legend-item-title'></div>");
                if (legend.legend && legend.legend.thumbnail)
                    if (isCompact) legend.legend.thumbnail.addClass("idd-legend-item-title-thumb-compact").appendTo(title);
                    else legend.legend.thumbnail.addClass("idd-legend-item-title-thumb").appendTo(title);
                if (isCompact) legend.name.addClass("idd-legend-item-title-name-compact").appendTo(title);
                else legend.name.addClass("idd-legend-item-title-name").appendTo(title);
                addVisibilityCheckBox(title, plot);
                title.appendTo(div);
                if (legend.legend && legend.legend.content)
                    if (isCompact) legend.legend.content.addClass("idd-legend-item-info-compact").appendTo(div);
                    else legend.legend.content.addClass("idd-legend-item-info").appendTo(div);
                
                div.prependTo(_jqdiv);
                div.plot = plot;
                plotLegends[plotLegends.length] = div;
                _plotLegends[_plotLegends.length] = div;
                div.plot.updateOrder();
            }
        };
        this.remove = function () {
            for (var i = 0, len = plotLegends.length; i < len; i++) {
                removeLegend(plotLegends[i]);
                if (plotLegends[i].onLegendRemove) plotLegends[i].onLegendRemove();
                plotLegends[i][0].innerHTML = "";
                if (isCompact) plotLegends[i].removeClass("idd-legend-item-compact");
                else plotLegends[i].removeClass("idd-legend-item");
            }
            plotLegends = [];
            var removeLegendForPlot = function (plot) {
                plot.host.unbind("visibleChanged", visibleChangedHandler);
                var childDivs = plot.children;
                childDivs.forEach(function (childPlot) {
                    removeLegendForPlot(childPlot);
                });
            };
            removeLegendForPlot(_plot);
            _jqdiv[0].innerHTML = "";
            if (isCompact) _jqdiv.removeClass("idd-legend-compact");
            else _jqdiv.removeClass("idd-legend");
            _jqdiv.removeClass("unselectable");
            _plot.host.unbind("plotRemoved", plotRemovedHandler);
            _plot.host.unbind("orderChanged", orderChangedHandler);
            _plot.host.unbind("childrenChanged", childrenChangedHandler);
        };
        _plot.host.bind("plotRemoved", plotRemovedHandler);
        _plot.host.bind("orderChanged", orderChangedHandler);
        _plot.host.bind("childrenChanged", childrenChangedHandler);
        createLegend();
        _jqdiv.dblclick(function (event) {
            event.stopImmediatePropagation();
        });
    };
    //--------------------------------------------------------------------------------------------
    // Transforms

    //Class for coordinate transform, cs is build from plot rect and screen size
    InteractiveDataDisplay.CoordinateTransform = function (plotRect, screenRect, aspectRatio) {
        var offsetX = 0;
        var offsetY = 0;
        var scaleX = 1;
        var scaleY = 1;

        if (plotRect !== undefined && screenRect !== undefined) {
            //Perform Fit ...
            scaleX = screenRect.width / plotRect.width;
            scaleY = screenRect.height / plotRect.height;

            if (aspectRatio !== undefined && aspectRatio > 0) {
                if (aspectRatio * scaleY < scaleX)
                    scaleX = aspectRatio * scaleY;
                else
                    scaleY = scaleX / aspectRatio;
            }

            offsetX = screenRect.left - scaleX * plotRect.x;
            offsetY = screenRect.height + screenRect.top + scaleY * plotRect.y;
        }

        this.plotToScreenX = function (x) {
            return x * scaleX + offsetX;
        };

        this.plotToScreenY = function (y) {
            return offsetY - y * scaleY;
        };

        this.screenToPlotX = function (left) {
            return (left - offsetX) / scaleX;
        };

        this.screenToPlotY = function (top) {
            return (offsetY - top) / scaleY;
        };

        this.plotToScreenWidth = function (x) {
            return x * scaleX;
        };

        this.plotToScreenHeight = function (y) {
            return y * scaleY;
        };

        this.screenToPlotWidth = function (left) {
            return left / scaleX;
        };

        this.screenToPlotHeight = function (top) {
            return top / scaleY;
        };


        // Builds plot rectangle for the given screen rectangle
        // as {x,y,width,height}, where x,y are left/top of the rectangle.
        this.getPlotRect = function (screenRect) {
            var x = this.screenToPlotX(screenRect.x);
            var y = this.screenToPlotY(screenRect.height + screenRect.y);
            return {
                x: x,
                y: y,
                width: this.screenToPlotX(screenRect.x + screenRect.width) - x,
                height: this.screenToPlotY(screenRect.y) - y
            };
        };

        this.getScale = function () {
            return {
                x: scaleX,
                y: scaleY
            };
        };

        this.getOffset = function () {
            return {
                x: offsetX,
                y: offsetY
            };
        };

        this.clone = function () {
            var cloneTransform = new InteractiveDataDisplay.CoordinateTransform();
            cloneTransform.plotToScreenX = this.plotToScreenX;
            cloneTransform.plotToScreenY = this.plotToScreenY;
            cloneTransform.screenToPlotX = this.screenToPlotX;
            cloneTransform.screenToPlotY = this.screenToPlotY;

            cloneTransform.plotToScreenWidth = this.plotToScreenWidth;
            cloneTransform.plotToScreenHeight = this.plotToScreenHeight;
            cloneTransform.screenToPlotWidth = this.screenToPlotWidth;
            cloneTransform.screenToPlotHeight = this.screenToPlotHeight;

            cloneTransform.getPlotRect = this.getPlotRect;
            cloneTransform.getScale = this.getScale;
            cloneTransform.getOffset = this.getOffset;
            return cloneTransform;
        };
    };


    //-------------------------------------------------------------------------------------
    // Plots

    // Base class for plots rendering on a private canvas.
    InteractiveDataDisplay.CanvasPlot = function (div, master) {
        this.base = InteractiveDataDisplay.Plot;
        this.base(div, master);
        if (!div) return;

        var _canvas;
        var destroySharedCanvas = function () {
            if (master._sharedCanvas) {
                master._sharedCanvas.remove();
                master._sharedCanvas = undefined;
            }
        };

        this.getContext = function (doClear) {
            var canvas;
            var master = this.master;
            if (master.flatRendering) { // shared canvas
                canvas = master._sharedCanvas;
                doClear = master._sharedCanvas._dirty && doClear;
                master._sharedCanvas._dirty = false;
            } else { // individual canvas
                canvas = _canvas;
            }

            var context = canvas[0].getContext("2d");
            if (doClear) {
                var size = this.screenSize;
                context.clearRect(0, 0, size.width, size.height);
            }
            return context;
        };

        this.destroy = function () {
            InteractiveDataDisplay.CanvasPlot.prototype.destroy.call(this);
            this.host.children(".idd-plot-canvas").remove();
            destroySharedCanvas();
            return this;
        };


        this.arrange = function (finalRect) {
            InteractiveDataDisplay.CanvasPlot.prototype.arrange.call(this, finalRect);

            var canvas;
            var master = this.master;
            if (master.flatRendering) { // shared canvas                
                if (!master._sharedCanvas) { // i'm first who renders in the flat mode!
                    // let's use my canvas for everybody
                    if (_canvas) {
                        canvas = _canvas;
                        _canvas = undefined;
                    } else {
                        canvas = $("<canvas></canvas>")
                            .prependTo(this.host)
                            .addClass("idd-plot-canvas");
                    }
                    master._sharedCanvas = canvas;
                    master._sharedCanvas._dirty = false;
                } else {
                    canvas = master._sharedCanvas;
                }
                if (_canvas) { // removing canvas if just switched to flat mode
                    _canvas.remove();
                    _canvas = undefined;
                }
            } else { // individual canvas
                if (master._sharedCanvas) { // switched to individual mode                
                    destroySharedCanvas();
                }
                if (!_canvas) {
                    _canvas = $("<canvas></canvas>")
                        .prependTo(this.host)
                        .addClass("idd-plot-canvas");
                }
                canvas = _canvas;
            }

            var c = canvas[0];
            c.width = finalRect.width;
            c.height = finalRect.height;
        };

        // Gets the transform functions from data to screen coordinates.
        // Returns { dataToScreenX, dataToScreenY }
        this.getTransform = function () {
            var ct = this.coordinateTransform;
            var plotToScreenX = ct.plotToScreenX;
            var plotToScreenY = ct.plotToScreenY;
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
            var dataToScreenX = dataToPlotX ? function (x) { return plotToScreenX(dataToPlotX(x)); } : plotToScreenX;
            var dataToScreenY = dataToPlotY ? function (y) { return plotToScreenY(dataToPlotY(y)); } : plotToScreenY;

            return { dataToScreenX: dataToScreenX, dataToScreenY: dataToScreenY };
        };

        // Gets the transform functions from screen to data coordinates.
        // Returns { screenToDataX, screenToDataY }
        this.getScreenToDataTransform = function () {
            var ct = this.coordinateTransform;
            var screenToPlotX = ct.screenToPlotX;
            var screenToPlotY = ct.screenToPlotY;
            var plotToDataX = this.xDataTransform && this.xDataTransform.plotToData;
            var plotToDataY = this.yDataTransform && this.yDataTransform.plotToData;
            var screenToDataX = plotToDataX ? function (x) { return plotToDataX(screenToPlotX(x)); } : screenToPlotX;
            var screenToDataY = plotToDataY ? function (y) { return plotToDataY(screenToPlotY(y)); } : screenToPlotY;

            return { screenToDataX: screenToDataX, screenToDataY: screenToDataY };
        };
    };
    InteractiveDataDisplay.CanvasPlot.prototype = new InteractiveDataDisplay.Plot();


    // Renders a function y=f(x) as a polyline.
    InteractiveDataDisplay.Polyline = function (div, master) {
        var that = this;
        // Initialization (#1)
        var initializer = InteractiveDataDisplay.Utils.getDataSourceFunction(div, InteractiveDataDisplay.readCsv);
        var initialData = initializer(div);

        this.base = InteractiveDataDisplay.CanvasPlot;
        this.base(div, master);

        var _y;
        var _x;
        var _y_u68, _y_l68, _y_u95, _y_l95;
        var _fill68 = 'blue';
        var _fill95 = 'pink';
        var _thickness = 1;
        var _stroke = '#4169ed';
        var _lineCap = 'butt';
        var _lineJoin = 'miter';

        // default styles:
        if (initialData) {
            _thickness = typeof initialData.thickness != "undefined" ? initialData.thickness : _thickness;
            _stroke = typeof initialData.stroke != "undefined" ? initialData.stroke : _stroke;
            _lineCap = typeof initialData.lineCap != "undefined" ? initialData.lineCap : _lineCap;
            _lineJoin = typeof initialData.lineJoin != "undefined" ? initialData.lineJoin : _lineJoin;
            _fill68 = typeof initialData.fill68 != "undefined" ? initialData.fill68 : _fill68;
            _fill95 = typeof initialData.fill95 != "undefined" ? initialData.fill95 : _fill95;
        }

        this.draw = function (data) {
            var y = data.y.median ? data.y.median : data.y;
            if (!y) throw "Data series y is undefined";
            var n = y.length;

            if (!data.x) {
                data.x = InteractiveDataDisplay.Utils.range(0, n - 1);
            }
            if (n != data.x.length) throw "Data series x and y have different lengths";
            _y = y;
            _x = data.x;
                
            var y_u68 = data.y.upper68;
            if (y_u68 && y_u68.length !== n)
                throw "Data series y_u68 and y_median have different lengths";

            var y_l68 = data.y.lower68;
            if (y_l68 && y_l68.length !== n)
                throw "Data series y_l68 and y_median have different lengths";

            var y_u95 = data.y.upper95;
            if (y_u95 && y_u95.length !== n)
                throw "Data series y_u95 and y_median have different lengths";

            var y_l95 = data.y.lower95;
            if (y_l95 && y_l95.length !== n)
                throw "Data series y_l95 and y_median have different lengths";
            
            _y_u68 = y_u68;
            _y_l68 = y_l68;
            _y_u95 = y_u95;
            _y_l95 = y_l95;

            //sort
            var doSort = (data.treatAs && data.treatAs == "function") && !InteractiveDataDisplay.Utils.isOrderedArray(_x);
            if (InteractiveDataDisplay.Utils.isArray(data.y)) { // certain values
                _y = y;
                if (doSort) {
                    var len = Math.min(_x.length, y.length);
                    _y = InteractiveDataDisplay.Utils.cutArray(y, len);
                    _x = InteractiveDataDisplay.Utils.cutArray(_x, len);
                    if (doSort) {
                        var forSort = [];
                        for (var i = 0; i < len; i++)
                            if (!isNaN(_x[i])) {
                                forSort.push({
                                    x: _x[i],
                                    y: _y[i],
                                });
                            }
                        forSort.sort(function (a, b) { return a.x - b.x; });
                        _y = [];
                        _x = [];
                        for (var i = 0; i < forSort.length; i++) {
                            _y.push(forSort[i].y);
                            _x.push(forSort[i].x);
                        }
                    }
                }
            } else { // uncertain values
                var y = data.y;
                var len = Math.min(_x.length, y.median.length);
                if (y.upper68 && y.lower68) len = Math.min(len, Math.min(y.upper68.length, y.lower68.length));
                if (y.upper95 && y.lower95) len = Math.min(len, Math.min(y.upper95.length, y.lower95.length));
                _y = InteractiveDataDisplay.Utils.cutArray(y.median, len);
                _y_u68 = InteractiveDataDisplay.Utils.cutArray(y.upper68, len);
                _y_l68 = InteractiveDataDisplay.Utils.cutArray(y.lower68, len);
                _y_u95 = InteractiveDataDisplay.Utils.cutArray(y.upper95, len);
                _y_l95 = InteractiveDataDisplay.Utils.cutArray(y.lower95, len);
                _x = InteractiveDataDisplay.Utils.cutArray(_x, len);
                if (doSort) {
                    var forSort = [];
                    for (var i = 0; i < len; i++) {
                        if (!isNaN(_x[i])) {
                            forSort.push({
                                x: _x[i],
                                y: _y[i],
                                y_u68: _y_u68[i],
                                y_l68: _y_l68[i],
                                y_u95: _y_u95[i],
                                y_l95: _y_l95[i]
                            });
                        }
                    }
                    forSort.sort(function (a, b) { return a.x - b.x; });
                    _y = [];
                    _y_u68 = [];
                    _y_l68 = [];
                    _y_u95 = [];
                    _y_l95 = [];
                    _x = [];
                    for (var i = 0; i < forSort.length; i++) {
                        _y.push(forSort[i].y);
                        _y_u68.push(forSort[i].y_u68);
                        _y_l68.push(forSort[i].y_l68);
                        _y_u95.push(forSort[i].y_u95);
                        _y_l95.push(forSort[i].y_l95);
                        _x.push(forSort[i].x);
                    }
                }
            }

            // styles:
            _thickness = typeof data.thickness != "undefined" ? data.thickness : _thickness;
            if (typeof (_thickness) != "number")
                _thickness = parseFloat(_thickness) || 1;
            _stroke = typeof data.stroke != "undefined" ? data.stroke : _stroke;
            _lineCap = typeof data.lineCap != "undefined" ? data.lineCap : _lineCap;
            _lineJoin = typeof data.lineJoin != "undefined" ? data.lineJoin : _lineJoin;
            _fill68 = typeof data.fill68 != "undefined" ? data.fill68 : _fill68;
            _fill95 = typeof data.fill95 != "undefined" ? data.fill95 : _fill95;

            this.invalidateLocalBounds();

            this.requestNextFrameOrUpdate();
            this.fireAppearanceChanged();
        };

        // Returns a rectangle in the plot plane.
        this.computeLocalBounds = function (step, computedBounds) {
            var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
            var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
           
            var mean = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y, dataToPlotX, dataToPlotY);
            var u68 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_u68, dataToPlotX, dataToPlotY);
            var l68 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_l68, dataToPlotX, dataToPlotY);
            var u95 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_u95, dataToPlotX, dataToPlotY);
            var l95 = InteractiveDataDisplay.Utils.getBoundingBoxForArrays(_x, _y_l95, dataToPlotX, dataToPlotY);

            return InteractiveDataDisplay.Utils.unionRects(mean, InteractiveDataDisplay.Utils.unionRects(u68, InteractiveDataDisplay.Utils.unionRects(l68, InteractiveDataDisplay.Utils.unionRects(u95, l95))));

        };

        // Returns 4 margins in the screen coordinate system
        this.getLocalPadding = function () {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        };

        this.getTooltip = function (xd, yd, px, py) {
            if (_x === undefined || _y == undefined)
                return;
            var n = _y.length;
            if (n == 0) return;

            var ct = this.coordinateTransform;
            var sx = ct.plotToScreenX(px);
            var sy = ct.plotToScreenY(py);

            var context = this.getContext(false);
            var myImageData = context.getImageData(sx, sy, 1, 1);
            if (myImageData.data[0] === 0 && myImageData.data[1] === 0 && myImageData.data[2] === 0 && myImageData.data[3] === 0)
                return undefined;
            var $toolTip = $("<div></div>")
            $("<div></div>").addClass('idd-tooltip-name').text((this.name || "polyline")).appendTo($toolTip);
            return $toolTip;
        };
        var renderLine = function (_x, _y, _stroke, _thickness, plotRect, screenSize, context) {
            if (_x === undefined || _y == undefined)
                return;
            var n = _y.length;
            if (n == 0) return;

            var t = that.getTransform();
            var dataToScreenX = t.dataToScreenX;
            var dataToScreenY = t.dataToScreenY;

            // size of the canvas
            var w_s = screenSize.width;
            var h_s = screenSize.height;
            var xmin = 0, xmax = w_s;
            var ymin = 0, ymax = h_s;

            context.globalAlpha = 1.0;
            context.strokeStyle = _stroke;
            context.fillStyle = _stroke; // for single points surrounded with missing values
            context.lineWidth = _thickness;
            context.lineCap = _lineCap;
            context.lineJoin = _lineJoin;

            context.beginPath();
            var x1, x2, y1, y2;
            var i = 0;

            // Looking for non-missing value
            var nextValuePoint = function () {
                for (; i < n; i++) {
                    if (isNaN(_x[i]) || isNaN(_y[i])) continue; // missing value
                    x1 = dataToScreenX(_x[i]);
                    y1 = dataToScreenY(_y[i]);
                    c1 = code(x1, y1, xmin, xmax, ymin, ymax);
                    break;
                }
                if (c1 == 0) // point is inside visible rect 
                    context.moveTo(x1, y1);
            };
            nextValuePoint();

            var c1, c2, c1_, c2_;
            var dx, dy;
            var x2_, y2_;
            var m = 1; // number of points for the current batch
            for (i++; i < n; i++) {
                if (isNaN(_x[i]) || isNaN(_y[i])) // missing value
                {
                    if (m == 1) { // single point surrounded by missing values
                        context.stroke(); // finishing previous segment (it is broken by missing value)
                        var c = code(x1, y1, xmin, xmax, ymin, ymax);
                        if (c == 0) {
                            context.beginPath();
                            context.arc(x1, y1, _thickness / 2, 0, 2 * Math.PI);
                            context.fill();
                        }
                    } else {
                        context.stroke(); // finishing previous segment (it is broken by missing value)
                    }
                    context.beginPath();
                    i++;
                    nextValuePoint();
                    m = 1;
                    continue;
                }

                x2_ = x2 = dataToScreenX(_x[i]);
                y2_ = y2 = dataToScreenY(_y[i]);
                if (Math.abs(x1 - x2) < 1 && Math.abs(y1 - y2) < 1) continue;

                // Clipping and drawing segment p1 - p2:
                c1_ = c1;
                c2_ = c2 = code(x2, y2, xmin, xmax, ymin, ymax);

                while (c1 | c2) {
                    if (c1 & c2) break; // segment is invisible
                    dx = x2 - x1;
                    dy = y2 - y1;
                    if (c1) {
                        if (x1 < xmin) { y1 += dy * (xmin - x1) / dx; x1 = xmin; }
                        else if (x1 > xmax) { y1 += dy * (xmax - x1) / dx; x1 = xmax; }
                        else if (y1 < ymin) { x1 += dx * (ymin - y1) / dy; y1 = ymin; }
                        else if (y1 > ymax) { x1 += dx * (ymax - y1) / dy; y1 = ymax; }
                        c1 = code(x1, y1, xmin, xmax, ymin, ymax);
                    } else {
                        if (x2 < xmin) { y2 += dy * (xmin - x2) / dx; x2 = xmin; }
                        else if (x2 > xmax) { y2 += dy * (xmax - x2) / dx; x2 = xmax; }
                        else if (y2 < ymin) { x2 += dx * (ymin - y2) / dy; y2 = ymin; }
                        else if (y2 > ymax) { x2 += dx * (ymax - y2) / dy; y2 = ymax; }
                        c2 = code(x2, y2, xmin, xmax, ymin, ymax);
                    }
                }
                if (!(c1 & c2)) {
                    if (c1_ != 0) // point wasn't visible
                        context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    m++;
                }

                x1 = x2_;
                y1 = y2_;
                c1 = c2_;
            }

            // Final stroke
            if (m == 1) { // single point surrounded by missing values
                context.stroke(); // finishing previous segment (it is broken by missing value)
                var c = code(x1, y1, xmin, xmax, ymin, ymax);
                if (c == 0) {
                    context.beginPath();
                    context.arc(x1, y1, _thickness / 2, 0, 2 * Math.PI);
                    context.fill();
                }
            } else {
                context.stroke(); // finishing previous segment (it is broken by missing value)
            }
        }
        this.renderCore = function (plotRect, screenSize) {
            InteractiveDataDisplay.Polyline.prototype.renderCore.call(this, plotRect, screenSize);

            var context = this.getContext(true);
            InteractiveDataDisplay.Area.render.call(this, _x, _y_l95, _y_u95, _fill95, plotRect, screenSize, context, 0.5);
            InteractiveDataDisplay.Area.render.call(this, _x, _y_l68, _y_u68, _fill68, plotRect, screenSize, context, 0.5);
            renderLine(_x, _y, _stroke, _thickness, plotRect, screenSize, context);
        };
        
        this.renderCoreSvg = function (plotRect, screenSize, svg) {
            if (_x === undefined || _y == undefined) return;
            var n = _y.length;
            if (n == 0) return;

            var t = this.getTransform();
            var dataToScreenX = t.dataToScreenX;
            var dataToScreenY = t.dataToScreenY;

            // size of the canvas
            var w_s = screenSize.width;
            var h_s = screenSize.height;
            var xmin = 0, xmax = w_s;
            var ymin = 0, ymax = h_s;

            var x1, x2, y1, y2;
            var i = 0;
            
            var segment;
            var drawSegment = function() {
                svg.polyline(segment).stroke({ color: _stroke, width: _thickness }).fill('none');
            }
            // Looking for non-missing value
            var nextValuePoint = function () {
                segment = new Array(0);
                for (; i < n; i++) {
                    if (isNaN(_x[i]) || isNaN(_y[i])) continue; // missing value
                    x1 = dataToScreenX(_x[i]);
                    y1 = dataToScreenY(_y[i]);
                    c1 = code(x1, y1, xmin, xmax, ymin, ymax);
                    break;
                }
                if (c1 == 0) // point is inside visible rect 
                    segment.push([x1, y1]);
            };
            nextValuePoint();

            var c1, c2, c1_, c2_;
            var dx, dy;
            var x2_, y2_;
            var m = 1; // number of points for the current batch
            for (i++; i < n; i++) {
                if (isNaN(_x[i]) || isNaN(_y[i])) // missing value
                {
                    if (m == 1) { // single point surrounded by missing values
                        drawSegment(); // finishing previous segment (it is broken by missing value)
                        var c = code(x1, y1, xmin, xmax, ymin, ymax);
                        if (c == 0) {
                            context.beginPath();
                            context.arc(x1, y1, _thickness / 2, 0, 2 * Math.PI);
                            context.fill();
                        }
                    } else {
                        drawSegment(); // finishing previous segment (it is broken by missing value)
                    }
                    i++;
                    nextValuePoint();
                    m = 1;
                    continue;
                }

                x2_ = x2 = dataToScreenX(_x[i]);
                y2_ = y2 = dataToScreenY(_y[i]);
                if (Math.abs(x1 - x2) < 1 && Math.abs(y1 - y2) < 1) continue;

                // Clipping and drawing segment p1 - p2:
                c1_ = c1;
                c2_ = c2 = code(x2, y2, xmin, xmax, ymin, ymax);

                while (c1 | c2) {
                    if (c1 & c2) break; // segment is invisible
                    dx = x2 - x1;
                    dy = y2 - y1;
                    if (c1) {
                        if (x1 < xmin) { y1 += dy * (xmin - x1) / dx; x1 = xmin; }
                        else if (x1 > xmax) { y1 += dy * (xmax - x1) / dx; x1 = xmax; }
                        else if (y1 < ymin) { x1 += dx * (ymin - y1) / dy; y1 = ymin; }
                        else if (y1 > ymax) { x1 += dx * (ymax - y1) / dy; y1 = ymax; }
                        c1 = code(x1, y1, xmin, xmax, ymin, ymax);
                    } else {
                        if (x2 < xmin) { y2 += dy * (xmin - x2) / dx; x2 = xmin; }
                        else if (x2 > xmax) { y2 += dy * (xmax - x2) / dx; x2 = xmax; }
                        else if (y2 < ymin) { x2 += dx * (ymin - y2) / dy; y2 = ymin; }
                        else if (y2 > ymax) { x2 += dx * (ymax - y2) / dy; y2 = ymax; }
                        c2 = code(x2, y2, xmin, xmax, ymin, ymax);
                    }
                }
                if (!(c1 & c2)) {
                    if (c1_ != 0){ // point wasn't visible
                        drawSegment();
                        segment = new Array(0);
                        segment.push([x1, y1]);
                    }
                    segment.push([x2, y2]);
                    m++;
                }

                x1 = x2_;
                y1 = y2_;
                c1 = c2_;
            }

            // Final stroke
            if (m == 1) { // single point surrounded by missing values
                drawSegment(); // finishing previous segment (it is broken by missing value)
                var c = code(x1, y1, xmin, xmax, ymin, ymax);
                if (c == 0) {
                    svg.circle(_thickness).translate(x1, y1).fill(_stroke);
                }
            } else {
                drawSegment(); // finishing previous segment (it is broken by missing value)
            }
        };

        // Clipping algorithms
        var code = function (x, y, xmin, xmax, ymin, ymax) {
            return (x < xmin) << 3 | (x > xmax) << 2 | (y < ymin) << 1 | (y > ymax);
        };


        // Others
        this.onDataTransformChanged = function (arg) {
            this.invalidateLocalBounds();
            InteractiveDataDisplay.Polyline.prototype.onDataTransformChanged.call(this, arg);
        };

        Object.defineProperty(this, "thickness", {
            get: function () { return _thickness; },
            set: function (value) {
                if (value == _thickness) return;
                if (value <= 0) throw "Polyline thickness must be positive";
                _thickness = value;

                this.fireAppearanceChanged("thickness");
                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });

        Object.defineProperty(this, "stroke", {
            get: function () { return _stroke; },
            set: function (value) {
                if (value == _stroke) return;
                _stroke = value;

                this.fireAppearanceChanged("stroke");
                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });

        Object.defineProperty(this, "lineCap", {
            get: function () { return _lineCap; },
            set: function (value) {
                if (value == _lineCap) return;
                _lineCap = value;

                this.fireAppearanceChanged("lineCap");
                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });

        Object.defineProperty(this, "lineJoin", {
            get: function () { return _lineJoin; },
            set: function (value) {
                if (value == _lineJoin) return;
                _lineJoin = value;

                this.fireAppearanceChanged("lineJoin");
                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });

        Object.defineProperty(this, "fill68", {
            get: function () { return _fill68; },
            set: function (value) {
                if (value == _fill68) return;
                _fill68 = value;

                this.fireAppearanceChanged("fill68");
                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });

        Object.defineProperty(this, "fill95", {
            get: function () { return _fill95; },
            set: function (value) {
                if (value == _fill95) return;
                _fill95 = value;

                this.fireAppearanceChanged("fill95");
                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });
        this.getLegend = function () {
            var canvas = $("<canvas></canvas>");
            
            canvas[0].width = 40;
            canvas[0].height = 40;
            var ctx = canvas.get(0).getContext("2d");
            var isUncertainData95 = _y_u95 != undefined && _y_l95 != undefined;
            var isUncertainData68 = _y_u68 != undefined && _y_l68 != undefined;
            if (isUncertainData95) {
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = _fill95;
                ctx.fillStyle = _fill95;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 20);
                ctx.lineTo(20, 40);
                ctx.lineTo(40, 40);
                ctx.lineTo(40, 20);
                ctx.lineTo(20, 0);
                ctx.lineTo(0, 0);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
            if (isUncertainData68) {
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = _fill68;
                ctx.fillStyle = _fill68;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, 10);
                ctx.lineTo(30, 40);
                ctx.lineTo(40, 40);
                ctx.lineTo(40, 30);
                ctx.lineTo(10, 0);
                ctx.lineTo(0, 0);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
            ctx.strokeStyle = _stroke;
            ctx.lineWidth = _thickness;
            ctx.moveTo(0, 0);
            ctx.lineTo(40, 40);
            ctx.stroke();

            var that = this;
            var nameDiv = $("<span></span>");
            var setName = function () {
                nameDiv.text(that.name);
            }
            setName();

            this.host.bind("appearanceChanged",
                function (event, propertyName) {
                    if (!propertyName || propertyName == "name")
                        setName();

                    ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
                    var isUncertainData95 = _y_u95 != undefined && _y_l95 != undefined;
                    var isUncertainData68 = _y_u68 != undefined && _y_l68 != undefined; 
                    if (isUncertainData95) {
                        ctx.globalAlpha = 0.5;
                        ctx.strokeStyle = _fill95;
                        ctx.fillStyle = _fill95;

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, 20);
                        ctx.lineTo(20, 40);
                        ctx.lineTo(40, 40);
                        ctx.lineTo(40, 20);
                        ctx.lineTo(20, 0);
                        ctx.lineTo(0, 0);
                        ctx.fill();
                        ctx.stroke();
                        ctx.closePath();
                    }
                    if (isUncertainData68) {
                        ctx.globalAlpha = 0.5;
                        ctx.strokeStyle = _fill68;
                        ctx.fillStyle = _fill68;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, 10);
                        ctx.lineTo(30, 40);
                        ctx.lineTo(40, 40);
                        ctx.lineTo(40, 30);
                        ctx.lineTo(10, 0);
                        ctx.lineTo(0, 0);
                        ctx.fill();
                        ctx.stroke();
                        ctx.closePath();
                    }
                    ctx.strokeStyle = _stroke;
                    ctx.lineWidth = _thickness;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(40, 40);
                    ctx.stroke();
                });

            var that = this;

            var onLegendRemove = function () {
                that.host.unbind("appearanceChanged");

            };

            return { name: nameDiv, legend: { thumbnail: canvas, content: undefined }, onLegendRemove: onLegendRemove };
        };

        // Initialization 
        if (initialData && typeof initialData.y != 'undefined')
            this.draw(initialData);
    }
    InteractiveDataDisplay.Polyline.prototype = new InteractiveDataDisplay.CanvasPlot;



    // Renders set of DOM elements in the data space of this plot
    InteractiveDataDisplay.DOMPlot = function (host, master) {
        this.base = InteractiveDataDisplay.Plot;
        this.base(host, master);

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

            jqElem.addClass("idd-dom-marker");
            jqElem.css('display', 'none').css('z-index', InteractiveDataDisplay.ZIndexDOMMarkers);
            domElements.push(jqElem);
        };

        // todo: limit type of children
        host.children("div[data-idd-position]")
            .each(function () {
                var jqElem = $(this); // refers the child DIV

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
            var _bbox;
            if (domElements) {
                var n = domElements.length;
                if (n > 0) {
                    var _x = [], _y = [];
                    for (var i = 0, j = 0; i < n; i++, j++) {
                        var el = domElements[i];
                        if (el._scale != 'none') {
                            var pos = getPosition(el);
                            _x[j] = pos.left;
                            _y[j] = pos.top;
                            _x[++j] = pos.left + el._width;
                            _y[j] = pos.top - el._height;
                        }
                    }
                    var xrange = InteractiveDataDisplay.Utils.getMinMax(_x);
                    var yrange = InteractiveDataDisplay.Utils.getMinMax(_y);

                    if (xrange && yrange) {
                        var dataToPlotX = this.xDataTransform && this.xDataTransform.dataToPlot;
                        var dataToPlotY = this.yDataTransform && this.yDataTransform.dataToPlot;
                        if (dataToPlotX) {
                            xrange.min = dataToPlotX(xrange.min);
                            xrange.max = dataToPlotX(xrange.max);
                        }
                        if (dataToPlotY) {
                            yrange.min = dataToPlotY(yrange.min);
                            yrange.max = dataToPlotY(yrange.max);
                        }
                        _bbox = { x: xrange.min, y: yrange.min, width: xrange.max - xrange.min, height: yrange.max - yrange.min };
                    };
                }
            }
            return _bbox;
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
            InteractiveDataDisplay.DOMPlot.prototype.renderCore.call(this, plotRect, screenSize);
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

                            //el.css('opacity', opacity);
                            //el.css('filter', 'alpha(opacity=' + (opacity * 100) + ')');
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
            var el = $(element)
            if(!this.host[0].contains(element))
                el.appendTo(this.host);
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

            if (element.jquery) {
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
        // ox, oy are optional new originX and originY which range from 0 to 1 and determines binding point of element to plots coordinates 
        this.set = function (element, x, y, width, height, ox, oy) {
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
            
            myEl._originX = ox || myEl._originX;
            myEl._originY = oy || myEl._originY;

            this.invalidateLocalBounds();
            this.requestUpdateLayout();
        };


        Object.defineProperty(this, "domElements", { get: function () { return domElements.slice(0); }, configurable: false });
    }
    InteractiveDataDisplay.DOMPlot.prototype = new InteractiveDataDisplay.Plot;

    InteractiveDataDisplay.GridlinesPlot = function (host, master) {
        this.base = InteractiveDataDisplay.CanvasPlot;
        this.base(host, master);

        var _xAxis, _yAxis;
        var _thickness = "1px";
        var _stroke = "LightGray";

        var style = {};
        InteractiveDataDisplay.Utils.readStyle(this.host, style);
        if (style) {
            _stroke = typeof style.stroke != "undefined" ? style.stroke : _stroke;
            _thickness = typeof style.thickness != "undefined" ? style.thickness : _thickness;
        }

        Object.defineProperty(this, "xAxis", {
            get: function () { return _xAxis; },
            set: function (value) {
                if (value == _xAxis) return;
                _xAxis = value;
                this.requestUpdateLayout();
            },
            configurable: false
        });

        Object.defineProperty(this, "yAxis", {
            get: function () { return _yAxis; },
            set: function (value) {
                if (value == _yAxis) return;
                _yAxis = value;
                this.requestUpdateLayout();
            },
            configurable: false
        });

        Object.defineProperty(this, "thickness", {
            get: function () { return _thickness; },
            set: function (value) {
                if (value == _thickness) return;
                if (value <= 0) throw "GridLines thickness must be positive";
                _thickness = value;

                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });

        Object.defineProperty(this, "stroke", {
            get: function () { return _stroke; },
            set: function (value) {
                if (value == _stroke) return;
                _stroke = value;

                this.requestNextFrameOrUpdate();
            },
            configurable: false
        });
        
        var initializeAxes = function(){
            if (!_xAxis) {
                var axisName = this.host.attr("data-idd-xaxis");
                if (axisName) {
                    var axis = this.master.get(axisName);
                    if (axis) _xAxis = axis;
                }
            }
            if (!_yAxis) {
                var axisName = this.host.attr("data-idd-yaxis");
                if (axisName) {
                    var axis = this.master.get(axisName);
                    if (axis) _yAxis = axis;
                }
            }
        };

        this.renderCore = function (plotRect, screenSize) {
            InteractiveDataDisplay.GridlinesPlot.prototype.renderCore.call(this, plotRect, screenSize);

            initializeAxes.call(this);
            var ctx = this.getContext(true);
            ctx.strokeStyle = _stroke;
            ctx.fillStyle = _stroke;
            ctx.lineWidth = 1;

            var strokeThickness = parseInt(_thickness.slice(0, -2));

            var ticks = [];
            var v;
            if (_xAxis)
                ticks = _xAxis.ticks;
            for (var i = 0, len = ticks.length; i < len; i++) {
                if (!ticks[i].invisible) {
                    v = _xAxis.getCoordinateFromTick(ticks[i].position);
                    ctx.fillRect(v, 0, strokeThickness, screenSize.height);
                }
            }

            ticks = [];
            if (_yAxis)
                ticks = _yAxis.ticks;
            for (var i = 0, len = ticks.length; i < len; i++) {
                if (!ticks[i].invisible) {
                    v = (screenSize.height - 1) - _yAxis.getCoordinateFromTick(ticks[i].position);
                    ctx.fillRect(0, v, screenSize.width, strokeThickness);
                }
            }
        };
        
        this.renderCoreSvg = function (plotRect, screenSize, svg) {
            initializeAxes.call(this);

            var strokeThickness = parseInt(_thickness.slice(0, -2));
            var style = { width: strokeThickness, color: _stroke };

            var ticks = [];
            var v;
            if (_xAxis)
                ticks = _xAxis.ticks;
            for (var i = 0, len = ticks.length; i < len; i++) {
                if (!ticks[i].invisible) {
                    v = _xAxis.getCoordinateFromTick(ticks[i].position);
                    svg.polyline([[v,0], [v,screenSize.height-1]]).stroke(style).fill('none');
                }
            }

            ticks = [];
            if (_yAxis)
                ticks = _yAxis.ticks;
            for (var i = 0, len = ticks.length; i < len; i++) {
                if (!ticks[i].invisible) {
                    v = (screenSize.height - 1) - _yAxis.getCoordinateFromTick(ticks[i].position);
                    svg.polyline([[0,v], [screenSize.width-1,v]]).stroke(style).fill('none');
                }
            }
        };
    }
    InteractiveDataDisplay.GridlinesPlot.prototype = new InteractiveDataDisplay.CanvasPlot;
}();