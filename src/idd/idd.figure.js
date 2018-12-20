//Class for plots and axes arrangement. Takes into account "placement" property of an element use it for element arrangement
InteractiveDataDisplay.Figure = function (div, master) {
    if (master !== undefined)
        throw "Figure cannot be a dependent plot";

    if (!div) return;

    var centralPart;
    if (div) {
        centralPart = $("<div data-idd-plot='plot' data-idd-placement='center'></div>");
        centralPart.css("z-index", InteractiveDataDisplay.ZIndexNavigationLayer).css("background-color", "rgba(0,0,0,0)");
    }

    var childDivs = div.children().toArray();

    /*
    childDivs.forEach(function (child) {
        var jqchild = $(child);
        var plotAttr = jqchild.attr("data-idd-plot");
        if (plotAttr !== undefined) {
            jqchild.appendTo(centralPart);
        }
    });*/

    centralPart.appendTo(div);

    this.base = InteractiveDataDisplay.Plot;
    this.base(div, master, centralPart);

    var that = this;
    centralPart.dblclick(function () {
        that.master.fitToView();
    });

    // returns true if "position" of the element is not "absolute"
    // and changes the style is required.
    var checkElementPosition = function (jqdiv) {
        //checking element position
        var pos = jqdiv.css("position");
        if (pos == "static") {
            jqdiv.css("position", "relative");
        }
        else if (pos == "inherit") {
            jqdiv.css("position", "relative");
        }

        if (pos === undefined || pos == "")
            jqdiv.css("position", "relative");

        return jqdiv.css("position") == "relative";
    }

    //Distribute children via Placement
    var leftChildren = [];
    var bottomChildren = [];
    var centerChildren = [];
    var topChildren = [];
    var rightChildren = [];

    var initAxis = function (jqdiv, params) {
        if (jqdiv.attr("data-idd-axis")) {
            var axis = InteractiveDataDisplay.InitializeAxis(jqdiv, params);
            jqdiv.axis = axis;
            jqdiv.dblclick(function () {
                if (placement == "bottom" || placement == "top") that.master.fitToViewX();
                else that.master.fitToViewY();
            });
        }
    }

    var addRelativeDiv = function (jqdiv, params, insertBeforeDiv) {
        var packDiv = $("<div></div>");
        packDiv.appendTo(that.host).addClass("idd-figure-container");
        packDiv.content = jqdiv;
        jqdiv.appendTo(packDiv);

        var placement = jqdiv.attr("data-idd-placement");

        var addDiv = function (packs) {
            if (insertBeforeDiv) {
                var packDef = getPackOfDiv(insertBeforeDiv, packs);
                packs.splice(packDef.index, 0, packDiv);
            } else {
                packs.push(packDiv);
            }
        }

        if (placement == "left") {
            addDiv(leftChildren);
        } else if (placement == "bottom") {
            addDiv(bottomChildren);
        } else if (placement == "center") {
            addDiv(centerChildren);
        } else if (placement == "right") {
            addDiv(rightChildren);
        } else if (placement == "top") {
            addDiv(topChildren);
        }

        if (placement)
            packDiv.attr("data-idd-placement", placement);
    }

    this.getAxes = function (placement) {
        if (!placement) {
            var children = leftChildren.concat(bottomChildren).concat(rightChildren).concat(topChildren);
            var result = jQuery.grep(children, function (e) {
                if (e.content && e.content.axis) return e.content.axis;
            });
            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    result[i] = result[i].content.axis;
                }
                return result;
            }
        }
        else {
            var result;
            if (placement == "top") {
                result = jQuery.grep(topChildren, function (e) {
                    if (e.content && e.content.axis && e.content.axis.mode == placement) return e.content.axis;
                });
            }
            else if (placement == "bottom") {
                result = jQuery.grep(bottomChildren, function (e) {
                    if (e.content && e.content.axis && e.content.axis.mode == placement) return e.content.axis;
                });
            }
            else if (placement == "left") {
                result = jQuery.grep(leftChildren, function (e) {
                    if (e.content && e.content.axis && e.content.axis.mode == placement) return e.content.axis;
                });
            }
            else if (placement == "right") {
                result = jQuery.grep(rightChildren, function (e) {
                    if (e.content && e.content.axis && e.content.axis.mode == placement) return e.content.axis;
                });
            }

            if (result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    result[i] = result[i].content.axis;
                }
                return result;
            }
        }
        return undefined;
    }

    this.get = function (p) {
        var plotResult = InteractiveDataDisplay.Figure.prototype.get.call(this, p);

        if (!plotResult) {
            var axes = this.getAxes();
            if (axes) {
                for (var i = 0; i < axes.length; i++) {
                    if (axes[i].host[0].id == p || axes[i].host[0] == p) return axes[i];
                }
            }
            return undefined;
        }
        return plotResult;
    }

    childDivs.forEach(function (cdiv) {
        var jqdiv = $(cdiv);
        //packing element to figure containers in figure packs
        if (checkElementPosition(jqdiv)) {
            addRelativeDiv(jqdiv);
            initAxis(jqdiv);
        }
    });

    var addJQDiv = function (htmlCode, placement, params, suspendUpdate, insertBeforeDiv) {
        var addedDiv = $(htmlCode);

        if (!addedDiv.is("div"))
            throw "Only DIVs can be added to figure!";

        if (placement !== undefined) {
            if (placement != "top" &&
                placement != "bottom" &&
                placement != "center" &&
                placement != "left" &&
                placement != "right")
                throw "Placement is incorrect!";

            addedDiv.attr("data-idd-placement", placement);
        }

        if (checkElementPosition(addedDiv) && addedDiv.attr("data-idd-placement") !== undefined) {
            addRelativeDiv(addedDiv, params, insertBeforeDiv);
        }
        else { // absolute
            if (insertBeforeDiv)
                addedDiv.insertBefore(insertBeforeDiv);
            else
                addedDiv.appendTo(that.host);
        }

        if (suspendUpdate === undefined || !suspendUpdate) {
            that.requestUpdateLayout();
        }

        return addedDiv;
    };

    this.addDiv = function (htmlCode, placement) {
        return addJQDiv(htmlCode, placement)[0];
    };

    var removeEmptyPackDiv = function (collection) {
        var emptyPackDiv = [];
        var resultCollection = [];
        collection.forEach(function (child) {
            if (child.children().toArray().length == 0) {
                emptyPackDiv.push(child);
            } else {
                resultCollection.push(child);
            }
        });
        emptyPackDiv.forEach(function (child) {
            child.remove();
        });

        return resultCollection;
    };

    var checkIfBelongsToChildren = function (div, divArray) {
        var a = jQuery.grep(divArray, function (e) {
            return e == div;
        });
        return a && a.length > 0;
    };

    var getPackOfDiv = function (div, packs) {
        for (var i = 0; i < packs.length; i++) {
            if (packs[i].content[0] == div) return { pack: div, index: i };
        }
        throw "Pack not found";
    }

    var checkIfBelongsToPack = function (div, divArray) {
        var a = jQuery.grep(divArray, function (e) {
            return e.content[0] == div;
        });
        return a && a.length > 0;
    };

    this.removeDiv = function (divToRemove) {
        if (divToRemove === undefined)
            throw "Unable to remove undefined object!";

        var directChildren = this.host.children().toArray();
        if (!checkIfBelongsToChildren(divToRemove, directChildren) &&
            !checkIfBelongsToPack(divToRemove, leftChildren) &&
            !checkIfBelongsToPack(divToRemove, bottomChildren) &&
            !checkIfBelongsToPack(divToRemove, centerChildren) &&
            !checkIfBelongsToPack(divToRemove, rightChildren) &&
            !checkIfBelongsToPack(divToRemove, topChildren))
            throw "Specified div doesn't belong to figure!";

        var jqdiv = $(divToRemove);
        jqdiv.remove();

        if (jqdiv.attr("data-idd-placement")) {
            if (jqdiv.attr("data-idd-placement") == "left") {
                leftChildren = removeEmptyPackDiv(leftChildren);
            } else if (jqdiv.attr("data-idd-placement") == "bottom") {
                bottomChildren = removeEmptyPackDiv(bottomChildren);
            } else if (jqdiv.attr("data-idd-placement") == "center") {
                centerChildren = removeEmptyPackDiv(centerChildren);
            } else if (jqdiv.attr("data-idd-placement") == "right") {
                rightChildren = removeEmptyPackDiv(rightChildren);
            } else if (jqdiv.attr("data-idd-placement") == "top") {
                topChildren = removeEmptyPackDiv(topChildren);
            }
        }

        that.requestUpdateLayout();
    };

    this.addAxis = function (placement, axisType, params, insertBeforeDiv) {
        var actualAxisType = axisType === undefined ? 'numeric' : axisType;
        var jqDiv = addJQDiv('<div data-idd-axis="' + actualAxisType + '"></div>', placement, params, false, insertBeforeDiv);
        initAxis(jqDiv, params);
        return jqDiv;
    }

    var finalSize;
    this.measure = function (screenSize) {

        var plotScreenSizeChanged = that.screenSize.width !== screenSize.width || that.screenSize.height !== screenSize.height;
        var plotRect = this.fit(screenSize);
        //console.log("first step: " + plotRect.y + "," + plotRect.height);


        finalSize = { x: 0, y: 0, width: screenSize.width, height: screenSize.height };

        var measureHorizontalPack = function (childrenCollection, width, range, topOffsetFunc, leftOffset, isTop) {
            var height = 0;
            var len = childrenCollection.length
            for (var i = len - 1; i >= 0; i--) {
                var child = childrenCollection[i];
                var content = child.content;
                child.width(width);
                if (isTop) {
                    child.css("top", topOffsetFunc(height));
                }
                child.css("left", leftOffset);
                if (content.axis !== undefined) {
                    content.width(width);
                    var axis = content.axis;
                    axis.update(range);

                    var contentHeight = content.height();
                    if (child.height() !== contentHeight) {
                        child.height(contentHeight);
                    }

                    height += child.height();
                }
                else {
                    height += child.height();
                }
                if (!isTop) {
                    child.css("top", topOffsetFunc(height));
                }
            }
            return height;
        };

        var measureVerticalPack = function (childrenCollection, height, range, leftOffsetFunc, topOffset, isLeft) {
            var width = 0;
            var len = childrenCollection.length
            for (var i = len - 1; i >= 0; i--) {
                var child = childrenCollection[i];
                var content = child.content;
                child.height(height);
                content.height(height);
                if (isLeft) {
                    child.css("left", leftOffsetFunc(width));
                }
                child.css("top", topOffset);
                if (content.axis !== undefined) {
                    content.height(height);
                    var axis = content.axis;
                    axis.update(range);

                    var contentWidth = content.width();
                    if (child.width() !== contentWidth) {
                        child.width(contentWidth);
                    }

                    width += child.width();
                }
                else {
                    width += child.width();
                }
                if (!isLeft) {
                    child.css("left", leftOffsetFunc(width));
                }
            }
            return width;
        };

        //First Iteration: Measuring top and bottom slots, 
        //then measuring left and right with top and bottom output values

        //Measuring top and bottom slots
        var topBottomHeight = 0;
        var topHeight = 0;
        var bottomHeight = 0;

        //Measure top slot
        topHeight = measureHorizontalPack(topChildren, screenSize.width, { min: plotRect.x, max: plotRect.x + plotRect.width }, function (height) { return height; }, 0, true);

        //Measure bottom slot
        bottomHeight = measureHorizontalPack(bottomChildren, screenSize.width, { min: plotRect.x, max: plotRect.x + plotRect.width }, function (height) { return screenSize.height - height; }, 0, false);

        topBottomHeight = topHeight + bottomHeight;

        //Measuring left and right slots
        var leftRightWidth = 0;
        var leftWidth = 0;
        var rightWidth = 0;

        //Measure left slot
        leftWidth = measureVerticalPack(leftChildren, screenSize.height - topBottomHeight, { min: plotRect.y, max: plotRect.y + plotRect.height }, function (width) { return width; }, topHeight, true);

        //Measure right slot
        rightWidth = measureVerticalPack(rightChildren, screenSize.height - topBottomHeight, { min: plotRect.y, max: plotRect.y + plotRect.height }, function (width) { return screenSize.width - width; }, topHeight, false);

        leftRightWidth = leftWidth + rightWidth;

        var availibleCenterSize = { width: screenSize.width - leftRightWidth, height: screenSize.height - topBottomHeight };

        if (availibleCenterSize.width < 0)
            availibleCenterSize.width = 0;
        if (availibleCenterSize.height < 0)
            availibleCenterSize.height = 0;

        if (that.mapControl !== undefined) {
            that.mapControl.setOptions({ width: availibleCenterSize.width, height: availibleCenterSize.height });
        }

        plotRect = this.fit(availibleCenterSize, true);

        centerChildren.forEach(function (child) {
            child.width(availibleCenterSize.width);
            child.height(availibleCenterSize.height);
            child.css("top", topHeight);
            child.css("left", leftWidth);
        });

        var childPlots = this.children;
        childPlots.forEach(function (child) {
            var childHost = child.host;
            childHost.width(availibleCenterSize.width);
            childHost.height(availibleCenterSize.height);
            childHost.css("top", topHeight);
            childHost.css("left", leftWidth);
        });

        //Second step: remeasure top and bottom slots
        //Measure top and bottom slots
        var topHeight2 = 0;
        var bottomHeight2 = 0;
        var topBottomHeight2 = 0;

        topHeight2 = measureHorizontalPack(topChildren, availibleCenterSize.width, { min: plotRect.x, max: plotRect.x + plotRect.width }, function (height) { return height; }, leftWidth, true);
        bottomHeight2 = measureHorizontalPack(bottomChildren, availibleCenterSize.width, { min: plotRect.x, max: plotRect.x + plotRect.width }, function (height) { return screenSize.height - height; }, leftWidth, false);

        if (topHeight2 != topHeight) {
            var scale = topHeight / topHeight2;
            var offset = 0;
            for (var i = 0; i < topChildren.length; i++) {
                child = topChildren[i];
                var transformString = "scaleY(" + scale + ") translate(0px," + offset + "px)";
                var transformOriginString = "0% 0%";
                child.css("-webkit-transform", transformString);
                child.css("-webkit-transform-origin", transformOriginString);
                child.css("-moz-transform", transformString);
                child.css("-moz-transform-origin", transformOriginString);
                child.css("-o-transform", transformString);
                child.css("-o-transform-origin", transformOriginString);
                child.css("-ms-transform", transformString);
                child.css("-ms-transform-origin", transformOriginString);
                child.css("transform", transformString);
                child.css("transform-origin", transformOriginString);
                offset += child.height() * (scale - 1);
            };
        }
        else {
            topChildren.forEach(function (child) {
                child.css("-ms-transform", '');
                child.css("-webkit-transform", '');
                child.css("-moz-transform", '');
                child.css("-o-transform", '');
                child.css("transform", '');
            });
        }

        if (bottomHeight != bottomHeight2) {
            var scale = bottomHeight / bottomHeight2;
            var offset = 0;
            for (var i = 0; i < bottomChildren.length; i++) {
                child = bottomChildren[i];
                var transformString = "scaleY(" + scale + ") translate(0px," + -offset + "px)";
                var transformOriginString = "0% 0%";
                child.css("-webkit-transform", transformString);
                child.css("-webkit-transform-origin", transformOriginString);
                child.css("-moz-transform", transformString);
                child.css("-moz-transform-origin", transformOriginString);
                child.css("-o-transform", transformString);
                child.css("-o-transform-origin", transformOriginString);
                child.css("-ms-transform", transformString);
                child.css("-ms-transform-origin", transformOriginString);
                child.css("transform", transformString);
                child.css("transform-origin", transformOriginString);
                offset += child.height() * (scale - 1);
            };
        }
        else {
            bottomChildren.forEach(function (child) {
                child.css("-ms-transform", '');
                child.css("-webkit-transform", '');
                child.css("-moz-transform", '');
                child.css("-o-transform", '');
                child.css("transform", '');
            });
        }

        //Measure left and right slots
        //Measuring left and right slots
        var leftRightWidth2 = 0;
        var leftWidth2 = 0;
        var rightWidth2 = 0;

        //Measure left slot
        leftWidth2 = measureVerticalPack(leftChildren, screenSize.height - topBottomHeight, { min: plotRect.y, max: plotRect.y + plotRect.height }, function (width) { return width; }, topHeight, true);

        //Measure right slot
        rightWidth2 = measureVerticalPack(rightChildren, screenSize.height - topBottomHeight, { min: plotRect.y, max: plotRect.y + plotRect.height }, function (width) { return screenSize.width - width; }, topHeight, false);

        leftRightWidth2 = leftWidth2 + rightWidth2;

        if (leftWidth != leftWidth2) {
            var scale = leftWidth / leftWidth2;
            var offset = 0;
            for (var i = 0; i < leftChildren.length; i++) {
                var child = leftChildren[i];
                var transformString = "scaleX(" + scale + ") translate(" + offset + "px, 0px)";
                var transformOriginString = "0% 0%";
                child.css("-webkit-transform", transformString);
                child.css("-webkit-transform-origin", transformOriginString);
                child.css("-moz-transform", transformString);
                child.css("-moz-transform-origin", transformOriginString);
                child.css("-o-transform", transformString);
                child.css("-o-transform-origin", transformOriginString);
                child.css("-ms-transform", transformString);
                child.css("-ms-transform-origin", transformOriginString);
                child.css("transform", transformString);
                child.css("transform-origin", transformOriginString);
                offset += child.width() * (scale - 1);
            }
        }
        else {
            leftChildren.forEach(function (child) {
                child.css("-ms-transform", '');
                child.css("-webkit-transform", '');
                child.css("-moz-transform", '');
                child.css("-o-transform", '');
                child.css("transform", '');
            });
        }

        if (rightWidth != rightWidth2) {
            var scale = rightWidth / rightWidth2;
            var offset = 0;
            for (var i = 0; i < rightChildren.length; i++) {
                var child = rightChildren[i];
                var transformString = "scaleX(" + scale + ") translate(" + -offset + "px, 0px)";
                var transformOriginString = "100% 0%";
                child.css("-webkit-transform", transformString);
                child.css("-webkit-transform-origin", transformOriginString);
                child.css("-moz-transform", transformString);
                child.css("-moz-transform-origin", transformOriginString);
                child.css("-o-transform", transformString);
                child.css("-o-transform-origin", transformOriginString);
                child.css("-ms-transform", transformString);
                child.css("-ms-transform-origin", transformOriginString);
                child.css("transform", transformString);
                child.css("transform-origin", transformOriginString);
                offset += child.width() * (scale - 1);
            }; 
        }
        else {
            rightChildren.forEach(function (child) {
                child.css("-ms-transform", '');
                child.css("-webkit-transform", '');
                child.css("-moz-transform", '');
                child.css("-o-transform", '');
                child.css("transform", '');
            });
        }

        return availibleCenterSize;
    };

    this.arrange = function (finalRect) {
        InteractiveDataDisplay.Figure.prototype.arrange.call(this, finalRect);
        //InteractiveDataDisplay.Utils.arrangeDiv(this.host, finalSize);
    };
    
    this.exportContentToSvg = function(plotRect, screenSize, svg) {
        var exportTextToSvg = function (div, svg) {
            var style = div instanceof jQuery ? window.getComputedStyle(div[0], null) : window.getComputedStyle(div, null);
            var transform = style ? style.getPropertyValue('transform') : undefined;
            var paddingBottom = style ? style.getPropertyValue('padding-bottom') : undefined;
            var fontSize = style ? parseFloat(style.getPropertyValue('font-size')) : undefined;
            var fontFamily = style ? style.getPropertyValue('font-family') : undefined;
            var fontWeight = style ? style.getPropertyValue('font-weight') : undefined;
            var textAlign = style ? style.getPropertyValue('text-align') : undefined;
            if (textAlign == 'center') textAlign = 'middle';
            if (textAlign == 'left') textAlign = 'start';
            if (textAlign == 'right') textAlign = 'end';
            var width = $(div).width();
            var height = $(div).height();

            var content = $(div).text().trim();
            var text = svg.text(content).font({ family: fontFamily, size: fontSize, weight: fontWeight, anchor: textAlign });

            if (textAlign == 'middle') text.translate(width / 2, -height / 2);
            else if (textAlign == "end") text.translate(width, -height / 2);
            else text.translate(0, -height / 2);

            if (transform != "none" && transform != undefined) {
                if (paddingBottom != undefined) paddingBottom = parseFloat(paddingBottom.substring(0, paddingBottom.length - 2));
                else paddingBottom = 0;
                text.attr({ transform: transform });
                text.translate(-paddingBottom, height / 2);
            }
        };

        var left_g = svg.group();
        var leftLine = 0;
        for(var i = leftChildren.length; --i>=0; ){
            var child = leftChildren[i];
            var child_g = left_g.group();
            child_g.translate(leftLine, 0);
            leftLine += child.width();
            if (child.content) {
                if (child.content.axis) {
                    child.content.axis.renderToSvg(child_g);
                }
                else {
                    var isText = true;
                    $(child.content).contents().each(function () {
                        if (this.nodeType != 3) isText = false;
                    });
                    if (isText) exportTextToSvg(child.content, child_g);
                }
            }
        }
        
        var top_g = svg.group();
        var topLine = 0;
        for(var i = topChildren.length; --i>=0; ){
            var child = topChildren[i];
            var child_g = top_g.group();
            child_g.translate(leftLine, topLine);
            topLine += child.height();
            if (child.content) {
                if (child.content.axis) {
                    child.content.axis.renderToSvg(child_g);
                } else {
                    var isText = true;
                    $(child.content).contents().each(function () {
                        if (this.nodeType != 3) isText = false;
                    });
                    if (isText) exportTextToSvg(child.content, child_g);
                }
            }
        }
        left_g.translate(0, topLine);
        
        var bottom_g = svg.group();
        var bottomLine = topLine + screenSize.height;
        for(var i = 0; i < bottomChildren.length; i++){
            var child = bottomChildren[i];
            var child_g = bottom_g.group();
            child_g.translate(leftLine, bottomLine);
            bottomLine += child.height();
            if (child.content) {
                if (child.content.axis) {
                    child.content.axis.renderToSvg(child_g);
                } else {
                    var isText = true;
                    $(child.content).contents().each(function () {
                        if (this.nodeType != 3) isText = false;
                    });
                    if (isText) exportTextToSvg(child.content, child_g);
                }
            }
        }
        
        var right_g = svg.group();
        var rightLine = leftLine + screenSize.width;
        for(var i = 0; i < rightChildren.length; i++){
            var child = rightChildren[i];
            var child_g = right_g.group();
            child_g.translate(rightLine, topLine);
            rightLine += child.width();
            if (child.content) {
                if (child.content.axis) {
                    child.content.axis.renderToSvg(child_g);
                } else {
                    var isText = true;
                    $(child.content).contents().each(function () {
                        if (this.nodeType != 3) isText = false;
                    });
                    if (isText) exportTextToSvg(child.content, child_g);
                }
            }
        }
      
        var plots_g = svg.group();
        plots_g
            .viewbox(0, 0, screenSize.width, screenSize.height)
            .translate(leftLine, topLine);

        InteractiveDataDisplay.Figure.prototype.exportContentToSvg.call(this, plotRect, screenSize, plots_g);
    };    

    this.requestUpdateLayout();
    
    if(div.attr("data-idd-navigation-enabled") === "true"){
        var gestureSource = InteractiveDataDisplay.Gestures.getGesturesStream(this.centralPart);
        this.navigation.gestureSource = gestureSource;
    }

    if(div.attr("data-idd-legend-enabled") === "true"){
        var legendDiv = $("<div></div>").prependTo(this.centralPart); 
        var _legend = new InteractiveDataDisplay.Legend(this, legendDiv, true);
        legendDiv.css("float", "right");
        Object.defineProperty(this, "legend", { get: function () { return _legend; }, configurable: false });

        //Stop event propagation
        InteractiveDataDisplay.Gestures.FullEventList.forEach(function (eventName) {
            legendDiv[0].addEventListener(eventName, function (e) {
                e.stopPropagation();
            }, false);
        });

        var data = {};
        InteractiveDataDisplay.Utils.readStyle(div, data);
        var visible = data.isLegendVisible;
        if (visible) {
            if (visible == "true")
                _legend.isVisible = true;
            else if (visible == "false")
                _legend.isVisible = false;
        }
    }
}

InteractiveDataDisplay.Figure.prototype = new InteractiveDataDisplay.Plot;