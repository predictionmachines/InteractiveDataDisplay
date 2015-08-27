InteractiveDataDisplay.Gestures = {};
InteractiveDataDisplay.Gestures.FullEventList = [
    "mousedown",
    "mousemove",
    "mouseup",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "gesturestart",
    "gesturechange",
    "gestureend",
    "MSGestureStart",
    "MSGestureChange",
    "MSGestureEnd",
    "MSGestureCancel",
    "MSPointerDown", 
];
InteractiveDataDisplay.Gestures.zoomLevelFactor = 1.4;

/* Calculates local offset of mouse cursor in specified jQuery element.
@param jqelement  (JQuery to Dom element) jQuery element to get local offset for.
@param event   (Mouse event args) mouse event args describing mouse cursor.
*/
InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin = function (jqelement, event) {
    var getPageCoordinates = function (element) {  
        var left = 0;
        var top = 0;

        while (element) {
            left += element.offsetLeft;
            top += element.offsetTop;

            element = element.offsetParent;
        }
        return { left: left, top: top };
    };

    var pageOffset = getPageCoordinates(jqelement[0]);

    var offsetX = event.pageX - pageOffset.left;
    var offsetY = event.pageY - pageOffset.top;
    return {
        x: offsetX,
        y: offsetY
    };
}

//Gesture for performing Pan operation
//Take horizontal and vertical offset in screen coordinates
//@param src    Source of gesture stream. ["Mouse", "Touch"]
InteractiveDataDisplay.Gestures.PanGesture = function (xOffset, yOffset, src) {
    this.Type = "Pan";
    this.Source = src;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
}

//Gesture for perfoming Zoom operation
//Takes zoom origin point in screen coordinates and scale value
InteractiveDataDisplay.Gestures.ZoomGesture = function (xOrigin, yOrigin, scaleFactor, src) {
    this.Type = "Zoom";
    this.Source = src;
    this.xOrigin = xOrigin;
    this.yOrigin = yOrigin;
    this.scaleFactor = scaleFactor;
}

//Gesture for performing Stop of all
//current transitions and starting to performing new
InteractiveDataDisplay.Gestures.PinGesture = function (src) {
    this.Type = "Pin";
    this.Source = src;
}


/*****************************************
* Gestures for non touch based devices   *
* mousedown, mousemove, mouseup          *
* xbrowserwheel                          *
******************************************/

//Subject that converts input mouse events into Pan gestures 
InteractiveDataDisplay.Gestures.createPanSubject = function (vc) {

    var _doc = $(document);

    var mouseDown = Rx.Observable.fromEvent(vc, "mousedown");
    var mouseMove = Rx.Observable.fromEvent(vc, "mousemove");
    var mouseUp = Rx.Observable.fromEvent(_doc, "mouseup");

    var mouseMoves = mouseMove.skip(1).zip(mouseMove, function (left, right) {
        return new InteractiveDataDisplay.Gestures.PanGesture(left.clientX - right.clientX, left.clientY - right.clientY, "Mouse");
    });

    var stopPanning = mouseUp;

    var mouseDrags = mouseDown.selectMany(function (md) {
        return mouseMoves.takeUntil(stopPanning);
    });

    return mouseDrags;
}

//Subject that converts input mouse events into Pin gestures
InteractiveDataDisplay.Gestures.createPinSubject = function (vc) {
    var mouseDown = Rx.Observable.fromEvent(vc, "mousedown");

    return mouseDown.select(function (md) {
        return new InteractiveDataDisplay.Gestures.PinGesture("Mouse");
    });
}

//Subject that converts input mouse events into Zoom gestures 
InteractiveDataDisplay.Gestures.createZoomSubject = function (vc) {

    vc.mousewheel(function (objEvent, intDelta) {
        objEvent.preventDefault();
        var event = jQuery.Event("xbrowserwheel");
        event.delta = intDelta;
        event.origin = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(vc, objEvent);
        vc.trigger(event);
    });

    var mouseWheel = Rx.Observable.fromEvent(vc, "xbrowserwheel");

    var mouseWheels = mouseWheel.zip(mouseWheel, function (arg) {
        return new InteractiveDataDisplay.Gestures.ZoomGesture(arg.origin.x, arg.origin.y, arg.delta > 0 ? 1 / InteractiveDataDisplay.Gestures.zoomLevelFactor : 1 * InteractiveDataDisplay.Gestures.zoomLevelFactor, "Mouse");
    });

    var mousedblclick = Rx.Observable.fromEvent(vc, "dblclick");

    var mousedblclicks = mousedblclick.zip(mousedblclick, function (event) {
        var origin = InteractiveDataDisplay.Gestures.getXBrowserMouseOrigin(vc, event);
        return new InteractiveDataDisplay.Gestures.ZoomGesture(origin.x, origin.y, 1.0 / InteractiveDataDisplay.Gestures.zoomLevelFactor, "Mouse");
    });

    //return mouseWheels.Merge(mousedblclicks); //disabling mouse double clicks, as it causes strange behavior in conjection with elliptical zooming on the clicked item.
    return mouseWheels;
}


/*********************************************************
* Gestures for iPad (or any webkit based touch browser)  *
* touchstart, touchmove, touchend, touchcancel           *
* gesturestart, gesturechange, gestureend                *  
**********************************************************/


//Subject that converts input touch events into Pan gestures
InteractiveDataDisplay.Gestures.createTouchPanSubject = function (vc) {
    var _doc = $(document);

    var touchStart = Rx.Observable.fromEvent(vc, "touchstart");
    var touchMove = Rx.Observable.fromEvent(vc, "touchmove");
    var touchEnd = Rx.Observable.fromEvent(_doc, "touchend");
    var touchCancel = Rx.Observable.fromEvent(_doc, "touchcancel");

    var gestures = touchStart.selectMany(function (o) {
        return touchMove.takeUntil(touchEnd.merge(touchCancel)).skip(1).zip(touchMove, function (left, right) {
            return { "left": left.originalEvent, "right": right.originalEvent };
        }).where(function (g) {
            return g.left.scale === g.right.scale;
        }).select(function (g) {
            return new InteractiveDataDisplay.Gestures.PanGesture(g.left.pageX - g.right.pageX, g.left.pageY - g.right.pageY, "Touch");
        });
    });

    return gestures;
}

//Subject that converts input touch events into Pin gestures
InteractiveDataDisplay.Gestures.createTouchPinSubject = function (vc) {
    var touchStart = Rx.Observable.fromEvent(vc, "touchstart");

    return touchStart.select(function (ts) {
        return new InteractiveDataDisplay.Gestures.PinGesture("Touch");
    });
}

//Subject that converts input touch events into Zoom gestures
InteractiveDataDisplay.Gestures.createTouchZoomSubject = function (vc) {
    var _doc = $(document);

    var gestureStart = Rx.Observable.fromEvent(vc, "gesturestart");
    var gestureChange = Rx.Observable.fromEvent(vc, "gesturechange");
    var gestureEnd = Rx.Observable.fromEvent(_doc, "gestureend");
    var touchCancel = Rx.Observable.fromEvent(_doc, "touchcancel");

    var gestures = gestureStart.selectMany(function (o) {
        return gestureChange.takeUntil(gestureEnd.merge(touchCancel)).skip(1).zip(gestureChange, function (left, right) {
            return { "left": left.originalEvent, "right": right.originalEvent };
        }).where(function (g) {
            return g.left.scale !== g.right.scale && g.right.scale !== 0;
        }).select(function (g) {
            var delta = g.left.scale / g.right.scale;
            return new InteractiveDataDisplay.Gestures.ZoomGesture(o.originalEvent.layerX, o.originalEvent.layerY, 1 / delta, "Touch");
        });
    });

    return gestures;
}


/**************************************************************
* Gestures for IE on Win8                                     *
* MSPointerUp, MSPointerDown                                  *
* MSGestureStart, MSGestureChange, MSGestureEnd, MSGestureTap *
***************************************************************/

//Subject that converts input touch events (on win8+) into Pan gestures
InteractiveDataDisplay.Gestures.createTouchPanSubjectWin8 = function (vc) {
    var gestureStart = Rx.Observable.fromEvent(vc, "MSGestureStart");
    var gestureChange = Rx.Observable.fromEvent(vc, "MSGestureChange");
    var gestureEnd = Rx.Observable.fromEvent($(document), "MSGestureEnd");

    var gestures = gestureStart.selectMany(function (o) {
        var changes = gestureChange.startWith({ originalEvent: { offsetX: o.originalEvent.offsetX, offsetY: o.originalEvent.offsetY } });

        return changes.takeUntil(gestureEnd).skip(1).zip(changes, function (left, right) {
            return { "left": left.originalEvent, "right": right.originalEvent };
        }).where(function (g) {
            return g.left.scale === g.right.scale && g.left.detail != g.left.MSGESTURE_FLAG_INERTIA && g.right.detail != g.right.MSGESTURE_FLAG_INERTIA;
        }).select(function (g) {
            return new InteractiveDataDisplay.Gestures.PanGesture(g.left.offsetX - g.right.offsetX, g.left.offsetY - g.right.offsetY, "Touch");
        });
    });

    return gestures;
}

//Subject that converts input touch events (on win8+) into Pin gestures
InteractiveDataDisplay.Gestures.createTouchPinSubjectWin8 = function (vc) {
    var pointerDown = Rx.Observable.fromEvent(vc, "MSPointerDown");

    return pointerDown.select(function (gt) {
        return new InteractiveDataDisplay.Gestures.PinGesture("Touch");
    });
}

//Subject that converts input touch events (on win8+) into Zoom gestures
InteractiveDataDisplay.Gestures.createTouchZoomSubjectWin8 = function (vc) {
    var gestureStart = Rx.Observable.fromEvent(vc, "MSGestureStart");
    var gestureChange = Rx.Observable.fromEvent(vc, "MSGestureChange");
    var gestureEnd = Rx.Observable.fromEvent(vc, "MSGestureEnd");

    var gestures = gestureStart.selectMany(function (o) {

        return gestureChange.takeUntil(gestureEnd).where(function (g) {
            return g.originalEvent.scale !== 1 && g.originalEvent.scale !== 0 && g.originalEvent.detail != g.originalEvent.MSGESTURE_FLAG_INERTIA;
        }).select(function (g) {
            return new InteractiveDataDisplay.Gestures.ZoomGesture(o.originalEvent.offsetX, o.originalEvent.offsetY, 1 / g.originalEvent.scale, "Touch");
        });
    });

    return gestures;
}

InteractiveDataDisplay.Gestures.GesturesPool = function () {
    var gesturesDictionary = [];

    this.addMSGestureSource = function (dom) {
        gesturesDictionary.forEach(function (child) {
            if (child === dom) {
                return;
            }
        });

        gesturesDictionary.push(dom);

        dom.addEventListener("MSPointerDown", function (e) {
            if (dom.gesture === undefined) {
                var newGesture = new MSGesture();
                newGesture.target = dom;
                dom.gesture = newGesture;
            }

            dom.gesture.addPointer(e.pointerId);
        }, false);
    };
};

InteractiveDataDisplay.Gestures.GesturesPool = new InteractiveDataDisplay.Gestures.GesturesPool();

//Creates gestures stream for specified jQuery element source
InteractiveDataDisplay.Gestures.getGesturesStream = function (source) {
    var panController;
    var zoomController;
    var pinController;

    //panController = InteractiveDataDisplay.Gestures.createPanSubject(source);
    //zoomController = InteractiveDataDisplay.Gestures.createZoomSubject(source);
    //pinController = InteractiveDataDisplay.Gestures.createPinSubject(source);
    //return pinController.Merge(panController.Merge(zoomController));

    if (window.navigator.msPointerEnabled && typeof(MSGesture) !== "undefined") {
        var domSource = source[0];
        InteractiveDataDisplay.Gestures.GesturesPool.addMSGestureSource(domSource);

        // win 8
        panController = InteractiveDataDisplay.Gestures.createTouchPanSubjectWin8(source);
        var zoomControllerTouch = InteractiveDataDisplay.Gestures.createTouchZoomSubjectWin8(source);
        var zoomControllerMouse = InteractiveDataDisplay.Gestures.createZoomSubject(source);
        zoomController = zoomControllerTouch.merge(zoomControllerMouse);
        pinController = InteractiveDataDisplay.Gestures.createTouchPinSubjectWin8(source);

    } else {
        // no touch support, only mouse events
        panController = InteractiveDataDisplay.Gestures.createPanSubject(source);
        zoomController = InteractiveDataDisplay.Gestures.createZoomSubject(source);
        pinController = InteractiveDataDisplay.Gestures.createPinSubject(source);
    }

    var seq = pinController.merge(panController.merge(zoomController));
    if ('ontouchstart' in document.documentElement) {
        // webkit browser
        panController = InteractiveDataDisplay.Gestures.createTouchPanSubject(source);
        zoomController = InteractiveDataDisplay.Gestures.createTouchZoomSubject(source);
        pinController = InteractiveDataDisplay.Gestures.createTouchPinSubject(source);

        seq = seq.merge(pinController.merge(panController.merge(zoomController)));
    }
    return seq;
}

//modify the gesture stream to apply the logic of gesture handling by the axis
InteractiveDataDisplay.Gestures.applyHorizontalBehavior = function (gestureSequence) {
    return gestureSequence
    .select(function (el) { //setting any vertical movement to zero 
        if (el.Type == "Pan")
            el.yOffset = 0;
        else if (el.Type == "Zoom")
            el.preventVertical = true;
        return el;
    });
}


InteractiveDataDisplay.Gestures.applyVerticalBehavior = function (gestureSequence) {
    return gestureSequence
    .select(function (el) { //setting any horizontal movement to zero
        if (el.Type == "Pan")
            el.xOffset = 0;
        else if (el.Type == "Zoom")
            el.preventHorizontal = true;
        return el;
    });
}